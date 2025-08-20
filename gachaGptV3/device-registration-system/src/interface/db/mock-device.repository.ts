import { Injectable } from '@nestjs/common';
import { DeviceItem, DeviceStatus } from '../../domain/device.entity';

@Injectable()
export class MockDeviceRepository {
  private devices: Map<string, DeviceItem> = new Map();

  async getByTenantAndHardware(tenantId: string, hardwareId: string): Promise<DeviceItem | undefined> {
    const key = `${tenantId}#${hardwareId}`;
    return this.devices.get(key);
  }

  async getByHardwareId(hardwareId: string): Promise<DeviceItem | undefined> {
    for (const device of this.devices.values()) {
      if (device.hardwareId === hardwareId) {
        return device;
      }
    }
    return undefined;
  }

  async create(item: DeviceItem): Promise<void> {
    const key = `${item.tenantId}#${item.hardwareId}`;
    
    // 중복 체크
    if (this.devices.has(key)) {
      throw new Error('ConditionalCheckFailedException');
    }
    
    this.devices.set(key, item);
    console.log(`✅ Mock DB: 장치 등록됨 - ${item.hardwareId} (${item.tenantId})`);
  }

  async updateApproval(device: DeviceItem, status: DeviceStatus, sqsQueueUrl?: string): Promise<DeviceItem> {
    const key = `${device.tenantId}#${device.hardwareId}`;
    const existing = this.devices.get(key);
    
    if (!existing) {
      throw new Error('Device not found');
    }

    const updated = {
      ...existing,
      status,
      sqsQueueUrl,
      updatedAt: new Date().toISOString()
    };

    this.devices.set(key, updated);
    console.log(`✅ Mock DB: 장치 상태 업데이트됨 - ${device.hardwareId} → ${status}`);
    
    return updated;
  }

  // 디버깅용: 저장된 모든 장치 출력
  getAllDevices(): DeviceItem[] {
    return Array.from(this.devices.values());
  }
}