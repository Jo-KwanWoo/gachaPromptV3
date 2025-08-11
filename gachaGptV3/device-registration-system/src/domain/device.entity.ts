export enum DeviceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface SystemInfo {
  os: string;
  arch: string;
  mac: string;
}

export interface DeviceItem {
  pk: string; // TENANT#<tenantId>
  sk: string; // DEVICE#<hardwareId>
  deviceId: string; // ULID
  tenantId: string;
  hardwareId: string;
  ipAddress: string;
  systemInfo: SystemInfo;
  status: DeviceStatus;
  sqsQueueUrl?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  gsi1pk: string; // STATUS#<status>
  gsi1sk: string; // CREATED#<timestamp>
  gsi2pk: string; // HARDWARE#<hardwareId>
  gsi2sk: string; // TENANT#<tenantId>
}