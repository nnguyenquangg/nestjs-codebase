import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env.config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { trimDataConfig } from './config/trim-data.config';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe as ValidationCustomPipe } from '@/core/pipes/validation.pipe';
import { MicroserviceOptions } from '@nestjs/microservices';
import {
  microserviceKafkaConfig,
  microserviceGrpcConfig,
} from './config/microservices.config';

async function start(app: NestExpressApplication) {
  app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
  await app.listen(env.PORT);
}

async function setupMicroservices(app: NestExpressApplication) {
  app.connectMicroservice<MicroserviceOptions>(microserviceKafkaConfig);
  app.connectMicroservice<MicroserviceOptions>(microserviceGrpcConfig);
  await app.startAllMicroservices();
}

function buildDocumentation(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('Backend API')
    .setDescription('API documentation for authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

function useStaticAssets(app: NestExpressApplication) {
  app.useStaticAssets(path.join(__dirname, 'statics', 'statics'));
}

function useGlobalPipes(app: NestExpressApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalPipes(new ValidationCustomPipe());
  app.useGlobalPipes(trimDataConfig);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  useGlobalPipes(app);
  useStaticAssets(app);
  buildDocumentation(app);
  await setupMicroservices(app);
  await start(app);
}

bootstrap();
