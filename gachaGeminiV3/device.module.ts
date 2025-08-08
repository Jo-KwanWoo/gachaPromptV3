import { Module } from '@nestjs/common';
import { DeviceController } from './controller/device.controller';
import { DeviceService } from './service/device.service';
import { DynamoDbService } from './interface/db/dynamodb.service';
import { SqsService } from './interface/messaging/sqs.service';
import { AuthModule } from './interface/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DeviceController],
  providers: [
    DeviceService,
    DynamoDbService,
    SqsService,
  ],
})
export class DeviceModule {}
