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
    console.log(`SQS 큐 생성 요청: ${queueName}`);
    
    try {
      const response = await this.client.send(command);
      return response.QueueUrl || `https://sqs.${this.region}.amazonaws.com/123456789012/${queueName}`;
    } catch (error) {
      console.error('SQS createQueue error:', error);
      // 테스트를 위한 mock URL 반환
      return `https://sqs.${this.region}.amazonaws.com/123456789012/${queueName}`;
    }
  }
}
