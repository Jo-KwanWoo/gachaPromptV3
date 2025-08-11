import { Injectable, ConflictException } from '@nestjs/common';
import { DynamoService } from './dynamo.service';
import { ConfigService } from '@nestjs/config';
import { DeviceItem, DeviceStatus } from '../../domain/device.entity';
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DeviceRepository {
  private table: string;
  constructor(private ddb: DynamoService, cfg: ConfigService) {
    this.table = cfg.get<string>('dynamo.table');
  }

  async getByTenantAndHardware(tenantId: string, hardwareId: string): Promise<DeviceItem | undefined> {
    const pk = `TENANT#${tenantId}`;
    const sk = `DEVICE#${hardwareId}`;
    const res = await this.ddb.doc.send(new GetCommand({ TableName: this.table, Key: { pk, sk } }));
    return res.Item as DeviceItem | undefined;
  }

  async getByHardwareId(hardwareId: string): Promise<DeviceItem | undefined> {
    const res = await this.ddb.doc.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: 'GSI2',
        KeyConditionExpression: 'gsi2pk = :pk',
        ExpressionAttributeValues: { ':pk': `HARDWARE#${hardwareId}` },
        Limit: 1,
      }),
    );
    return res.Items?.[0] as DeviceItem | undefined;
  }

  async create(item: DeviceItem): Promise<void> {
    await this.ddb.doc
      .send(
        new PutCommand({
          TableName: this.table,
          Item: item,
          ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        }),
      )
      .catch((e) => {
        if (e.name === 'ConditionalCheckFailedException') {
          throw new ConflictException('이미 등록 요청이 존재합니다');
        }
        throw e;
      });
  }

  async updateApproval(device: DeviceItem, status: DeviceStatus, sqsQueueUrl?: string): Promise<DeviceItem> {
    const now = new Date().toISOString();
    const res = await this.ddb.doc.send(
      new UpdateCommand({
        TableName: this.table,
        Key: { pk: device.pk, sk: device.sk },
        UpdateExpression: 'SET #s = :s, sqsQueueUrl = :q, updatedAt = :u, gsi1pk = :g1',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':s': status,
          ':q': sqsQueueUrl,
          ':u': now,
          ':g1': `STATUS#${status}`,
        },
        ReturnValues: 'ALL_NEW',
      }),
    );
    return res.Attributes as DeviceItem;
  }
}