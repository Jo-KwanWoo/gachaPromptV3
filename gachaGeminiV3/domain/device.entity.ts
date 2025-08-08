import { DeviceStatus } from './device-status.enum';

export interface SystemInfo {
  os: string;
  arch: string;
  mac: string;
}

export interface DeviceEntity {
  PK: string;
  SK: string;
  hardwareId: string;
  tenantId: string;
  ipAddress: string;
  systemInfo: SystemInfo;
  status: DeviceStatus;
  sqsQueueUrl?: string;
  createdAt: string;
  updatedAt: string;
  ttl?: number;
}
