import { Module } from '@nestjs/common';
import { DynamoService } from './dynamo.service';
import { ConfigService } from '@nestjs/config';
import { DeviceRepository } from './device.repository';

@Module({
  providers: [DynamoService, ConfigService, DeviceRepository],
  exports: [DynamoService, DeviceRepository],
})
export class DynamoModule {}