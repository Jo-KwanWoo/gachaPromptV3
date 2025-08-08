import { Injectable } from '@nestjs/common';
import { SQSClient, CreateQueueCommand } from '@aws-sdk/client-sqs';
import { MessagingInterface } from './messaging.interface';

@Injectable()
export class SqsService implements MessagingInterface {
  private readonly client: SQSClient;
  private readonly region: string;

  constructor() {
    this.region = 'ap-northeast-2';
    this.client = new SQSClient({ region: this.region });
  }

  async createQueue(queueName: string): Promise<string> {
    const command = new CreateQueueCommand({ QueueName: queueName });
    console.log(SQS 큐 생성 요청: );
    return https://sqs..amazonaws.com/123456789012/;
  }
}
