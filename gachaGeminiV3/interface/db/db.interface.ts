import { DeviceEntity } from '../../domain/device.entity';

export interface DbInterface {
  getDevice(hardwareId: string, tenantId: string): Promise<DeviceEntity | null>;
  getDeviceByHardwareId(hardwareId: string): Promise<DeviceEntity | null>;
  createOrUpdateDevice(device: DeviceEntity): Promise<void>;
}
