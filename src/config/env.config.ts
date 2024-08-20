import * as dotenv from 'dotenv';
dotenv.config();
const isTest = process.env.NODE_ENV === 'test';

export const env = {
  APP_NAME: process.env.APP_NAME || 'bamboo-kids-user-api',
  BACKEND_URL: process.env.BACKEND_URL || 'localhost:2008',
  PORT: process.env.APP_PORT || 3000,
  DATABASE: {
    CONNECT: process.env.DATABASE_CONNECT as any,
    HOST: process.env.DATABASE_HOST,
    PORT: Number(process.env.DATABASE_PORT),
    USER: process.env.DATABASE_USER,
    PASSWORD: process.env.DATABASE_PASSWORD,
    NAME: process.env.DATABASE_NAME,
    SSL: process.env.DATABASE_SSL === 'true',
  },
  ROOT_PATH: process.cwd() + (isTest ? '/src' : ''),
  AUTH: {
    EXPIRES_IN: '4s',
    SECRET_KEY: 'Secret@123',
  },
  KAFKA: {
    TOPIC_PREFIX: process.env.KAFKA_PREFIX,
    CLIENT_ID: process.env.KAFKA_CLIENT_ID,
    URL: process.env.KAFKA_URL,
    URLS: process.env.KAFKA_URLS?.split(',') || [],
    PORT: process.env.KAFKA_PORT || 9092,
  },
  GRPC: {
    PORT: process.env.GRPC_PORT || '50051',
  },
};
