import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RegisterDeviceDto } from '../domain/dto/register-device.dto';
import { DeviceRepository } from '../interface/db/device.repository';
import { DeviceItem, DeviceStatus } from '../domain/device.entity';
import { newId } from '../common/ulid';
import { MessagingService } from '../interface/messaging/messaging.service';

@Injectable()
export class DeviceService {
  constructor(private repo: DeviceRepository, private msg: MessagingService) {}

  async register(dto: RegisterDeviceDto): Promise<{ status: 'pending' }> {
    const exists = await this.repo.getByTenantAndHardware(dto.tenantId, dto.hardwareId);
    if (exists) {
      if (exists.status === DeviceStatus.REJECTED) {
        throw new ConflictException('이미 등록된 hardwareId 입니다');
      }
      throw new ConflictException('이미 등록 요청이 존재합니다');
    }

    const now = new Date().toISOString();
    const deviceId = newId();
    const item: DeviceItem = {
      pk: `TENANT#${dto.tenantId}`,
      sk: `DEVICE#${dto.hardwareId}`,
      deviceId,
      tenantId: dto.tenantId,
      hardwareId: dto.hardwareId,
      ipAddress: dto.ipAddress,
      systemInfo: dto.systemInfo,
      status: DeviceStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      gsi1pk: `STATUS#${DeviceStatus.PENDING}`,
      gsi1sk: `CREATED#${now}`,
      gsi2pk: `HARDWARE#${dto.hardwareId}`,
      gsi2sk: `TENANT#${dto.tenantId}`,
    };

    await this.repo.create(item);
    return { status: 'pending' };
  }

  async getStatusByHardwareId(hardwareId: string) {
    const item = await this.repo.getByHardwareId(hardwareId);
    if (!item) {
      throw new NotFoundException('장치를 찾을 수 없습니다');
    }
    if (item.status === DeviceStatus.APPROVED && item.sqsQueueUrl) {
      return { deviceId: item.deviceId, sqsQueueUrl: item.sqsQueueUrl };
    }
    return { status: 'pending' };
  }

  async approve(deviceId: string, providedUrl?: string) {
    // NOTE: 실제 운영에서는 deviceId로 바로 가져올 수 있도록 GSI3 구성 필요.
    // 여기서는 샘플이므로 강제 예외로 인덱스 필요성을 알립니다.
    throw new BadRequestException('deviceId 조회 인덱스가 필요합니다 (GSI3: DEVICE#<deviceId>)');
  }

  async reject(_deviceId: string, _reason: string) {
    throw new BadRequestException('deviceId 조회 인덱스가 필요합니다 (GSI3: DEVICE#<deviceId>)');
  }
}