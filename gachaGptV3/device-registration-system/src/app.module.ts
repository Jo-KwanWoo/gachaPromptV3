import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DeviceModule } from './controller/device.module';
import { JwtAuthModule } from './interface/auth/jwt.module';
import { DynamoModule } from './interface/db/dynamo.module';
import { MessagingModule } from './interface/messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    JwtAuthModule,
    DynamoModule,
    MessagingModule,
    DeviceModule,
  ],
})
export class AppModule {}