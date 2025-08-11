import { Injectable } from '@nestjs/common';
import { SQSClient, CreateQueueCommand, GetQueueUrlCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessagingService {
  private sqs: SQSClient;
  constructor(private cfg: ConfigService) {
    this.sqs = new SQSClient({ region: cfg.get('aws.region') });
  }

  async ensureQueueForDevice(deviceId: string): Promise<string> {
    const prefix = this.cfg.get<string>('sqs.queuePrefix');
    const name = `${prefix}${deviceId}`;
    if (this.cfg.get<boolean>('sqs.createOnApprove')) {
      const create = await this.sqs.send(new CreateQueueCommand({ QueueName: name }));
      return create.QueueUrl!;
    }
    const res = await this.sqs.send(new GetQueueUrlCommand({ QueueName: name }));
    return res.QueueUrl!;
  }
}