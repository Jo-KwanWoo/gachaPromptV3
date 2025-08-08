import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DeviceRegistrationDto } from '../domain/device-registration.dto';
import { DynamoDbService } from '../interface/db/dynamodb.service';
import { DeviceEntity } from '../domain/device.entity';
import { DeviceStatus } from '../domain/device-status.enum';
import { SqsService } from '../interface/messaging/sqs.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeviceService {
  constructor(
    private readonly dynamoDbService: DynamoDbService,
    private readonly sqsService: SqsService,
  ) {}

  async registerDevice(dto: DeviceRegistrationDto): Promise<{ status: DeviceStatus }> {
    const { hardwareId, tenantId, ipAddress, systemInfo } = dto;
    const existingDevice = await this.dynamoDbService.getDevice(hardwareId, tenantId);
    if (existingDevice) {
      throw new ConflictException('이미 등록된 장치입니다');
    }
    const device: DeviceEntity = {
      PK: TENANT#,
      SK: DEVICE#,
      hardwareId,
      tenantId,
      ipAddress,
      systemInfo,
      status: DeviceStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    };
    await this.dynamoDbService.createOrUpdateDevice(device);
    return { status: DeviceStatus.PENDING };
  }

  async getDeviceStatus(hardwareId: string): Promise<DeviceEntity> {
    const device = await this.dynamoDbService.getDeviceByHardwareId(hardwareId);
    if (!device) {
      throw new NotFoundException('등록 요청을 찾을 수 없습니다.');
    }
    return device;
  }

  async approveDevice(hardwareId: string): Promise<{ sqsQueueUrl: string }> {
    const device = await this.dynamoDbService.getDeviceByHardwareId(hardwareId);
    if (!device) {
      throw new NotFoundException('승인할 장치 요청을 찾을 수 없습니다.');
    }
    const queueName = device-queue--;
    const sqsQueueUrl = await this.sqsService.createQueue(queueName);
    device.status = DeviceStatus.APPROVED;
    device.sqsQueueUrl = sqsQueueUrl;
    device.updatedAt = new Date().toISOString();
    await this.dynamoDbService.createOrUpdateDevice(device);
    return { sqsQueueUrl };
  }

  async rejectDevice(hardwareId: string, reason: string): Promise<void> {
    const device = await this.dynamoDbService.getDeviceByHardwareId(hardwareId);
    if (!device) {
      throw new NotFoundException('거부할 장치 요청을 찾을 수 없습니다.');
    }
    device.status = DeviceStatus.REJECTED;
    device.updatedAt = new Date().toISOString();
    await this.dynamoDbService.createOrUpdateDevice(device);
  }
}
