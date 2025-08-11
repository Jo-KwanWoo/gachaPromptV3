import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from '../service/device.service';
import { DynamoModule } from '../interface/db/dynamo.module';
import { MessagingModule } from '../interface/messaging/messaging.module';

@Module({
  imports: [DynamoModule, MessagingModule],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}