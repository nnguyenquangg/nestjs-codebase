import {
  CustomTransportStrategy,
  KafkaContext,
  KafkaHeaders,
  KafkaRetriableException,
  ServerKafka,
} from '@nestjs/microservices';
import {
  EachMessagePayload,
  KafkaMessage,
} from '@nestjs/microservices/external/kafka.interface';
import { Observable, ReplaySubject } from 'rxjs';

export class MicroserviceHandlingFilter
  extends ServerKafka
  implements CustomTransportStrategy
{
  public async handleMessage(payload: EachMessagePayload): Promise<any> {
    const channel = payload.topic;
    const rawMessage = this.parser.parse<KafkaMessage>(
      Object.assign(payload.message, {
        topic: payload.topic,
        partition: payload.partition,
      }),
    );
    const headers = rawMessage.headers as unknown as Record<string, any>;
    const correlationId = headers[KafkaHeaders.CORRELATION_ID];
    const replyTopic = headers[KafkaHeaders.REPLY_TOPIC];
    const replyPartition = headers[KafkaHeaders.REPLY_PARTITION];

    const packet = await this.deserializer.deserialize(rawMessage, { channel });
    const kafkaContext = new KafkaContext([
      rawMessage,
      payload.partition,
      payload.topic,
      this.consumer,
      payload.heartbeat,
      this.producer,
    ]);
    const handler = this.getHandlerByPattern(packet.pattern);
    // if the correlation id or reply topic is not set
    // then this is an event (events could still have correlation id)
    if (handler?.isEventHandler || !correlationId || !replyTopic) {
      return this.handleEvent(packet.pattern, packet, kafkaContext);
    }

    const publish = this.getPublisher(
      replyTopic,
      replyPartition,
      correlationId,
    );

    if (!handler) {
      return publish({
        id: correlationId,
        err: 'NO_MESSAGE_HANDLER',
      });
    }

    const response$ = this.transformToObservable(
      await handler(packet.data, kafkaContext),
    );

    const replayStream$ = new ReplaySubject();
    await this.customCombineStreamsAndThrowIfRetriable(
      response$,
      replayStream$,
    );

    this.send(replayStream$, publish);
  }

  public customCombineStreamsAndThrowIfRetriable(
    response$: Observable<any>,
    replayStream$: ReplaySubject<unknown>,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      response$.subscribe({
        next: (val) => {
          replayStream$.next(val);
          resolve();
        },
        error: (err) => {
          if (err instanceof KafkaRetriableException) {
            reject(err);
          }
          replayStream$.error(err);
          resolve();
        },
        complete: () => replayStream$.complete(),
      });
    });
  }
}
