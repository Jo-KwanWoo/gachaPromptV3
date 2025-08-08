import { DeviceEntity } from '../../domain/device.entity';

export interface MessagingInterface {
  createQueue(queueName: string): Promise<string>;
}
