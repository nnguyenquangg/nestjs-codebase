import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { databaseConfig } from './config/database.config';
import { translationConfig } from './config/transalation.config';

@Module({
  imports: [databaseConfig, translationConfig, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
