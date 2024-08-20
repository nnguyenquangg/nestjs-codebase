import { Transport } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { GrpcOptions } from '@nestjs/microservices/interfaces/microservice-configuration.interface';
import { camelCase } from 'lodash';
import { MicroserviceHandlingFilter } from '@/core/filters/microservice-handling.filter';
import { env } from './env.config';

export const microserviceKafkaConfig = {
  strategy: new MicroserviceHandlingFilter({
    client: {
      clientId: 'bamboo-kids-user-api' + randomUUID(),
      brokers: env.KAFKA.URLS.length ? env.KAFKA.URLS : [env.KAFKA.URL],
    },
    consumer: {
      groupId: `bamboo-kids-user-api${env.KAFKA.TOPIC_PREFIX}`,
      maxWaitTimeInMs: 1000,
    },
  }),
  transport: Transport.KAFKA,
};

export const microserviceGrpcConfig: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    url: `0.0.0.0:${env.GRPC.PORT}`,
    package: camelCase(env.APP_NAME),
    protoPath: path.join(
      __dirname,
      '../microservices/proto/microservice.proto',
    ),
  },
};
