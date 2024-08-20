import { env } from './env.config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

const isTest = process.env.NODE_ENV === 'test';
const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: env.DATABASE.HOST,
  port: env.DATABASE.PORT,
  username: env.DATABASE.USER,
  password: env.DATABASE.PASSWORD,
  database: env.DATABASE.NAME + (isTest ? '_unit_test' : ''),
  entities: [`${env.ROOT_PATH}/**/*.entity.${isTest ? 'ts' : 'js'}`],
  factories: [
    `${env.ROOT_PATH}/**/databases/factories/*.factory.${isTest ? 'ts' : 'js'}`,
  ],
  synchronize: false,
  migrations: [
    `${env.ROOT_PATH}/dist/migrations/*.js`,
    `${env.ROOT_PATH}/**/databases/migrations/*.${isTest ? 'ts' : 'js'}`,
  ],
  migrationsRun: true,
  keepConnectionAlive: true,
  autoLoadEntities: true,
  dropSchema: isTest, // WARNING: must be careful at this option
  cli: {
    migrationsDir: [
      `${env.ROOT_PATH}/**/databases/migrations/*.${isTest ? 'ts' : 'js'}`,
    ],
  },
  logging: true,
} as any;

export const databaseConfig = TypeOrmModule.forRoot(config);
