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
      throw new ConflictException('�̹� ��ϵ� ��ġ�Դϴ�');
    }
    const device: DeviceEntity = {
      PK: `TENANT#${tenantId}`,
      SK: `DEVICE#${hardwareId}`,
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
      throw new NotFoundException('��� ��û�� ã�� �� �����ϴ�.');
    }
    return device;
  }

  async approveDevice(hardwareId: string): Promise<{ sqsQueueUrl: string }> {
    const device = await this.dynamoDbService.getDeviceByHardwareId(hardwareId);
    if (!device) {
      throw new NotFoundException('������ ��ġ ��û�� ã�� �� �����ϴ�.');
    }
    const queueName = `device-queue-${uuidv4()}`;
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
      throw new NotFoundException('�ź��� ��ġ ��û�� ã�� �� �����ϴ�.');
    }
    device.status = DeviceStatus.REJECTED;
    device.updatedAt = new Date().toISOString();
    await this.dynamoDbService.createOrUpdateDevice(device);
  }
}
