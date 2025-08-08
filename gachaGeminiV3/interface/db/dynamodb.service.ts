import { Injectable } from '@nestjs/common';
import {
  DynamoDBClient,
  QueryCommand,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { DeviceEntity } from '../../domain/device.entity';
import { DbInterface } from './db.interface';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

@Injectable()
export class DynamoDbService implements DbInterface {
  private readonly client: DynamoDBClient;
  private readonly tableName: string;

  constructor() {
    this.tableName = 'DeviceRegistration';
    this.client = new DynamoDBClient({ region: 'ap-northeast-2' });
  }

  async getDevice(hardwareId: string, tenantId: string): Promise<DeviceEntity | null> {
    const PK = TENANT#;
    const SK = DEVICE#;
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({ PK, SK }),
    });

    try {
      const { Item } = await this.client.send(command);
      return Item ? (unmarshall(Item) as DeviceEntity) : null;
    } catch (error) {
      console.error('DynamoDB getDevice error:', error);
      return null;
    }
  }

  async getDeviceByHardwareId(hardwareId: string): Promise<DeviceEntity | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'hardwareId-index',
      KeyConditionExpression: 'hardwareId = :hId',
      ExpressionAttributeValues: marshall({ ':hId': hardwareId }),
      Limit: 1,
    });

    try {
      const { Items } = await this.client.send(command);
      return Items && Items.length > 0 ? (unmarshall(Items[0]) as DeviceEntity) : null;
    } catch (error) {
      console.error('DynamoDB getDeviceByHardwareId error:', error);
      return null;
    }
  }

  async createOrUpdateDevice(device: DeviceEntity): Promise<void> {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(device),
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('DynamoDB createOrUpdateDevice error:', error);
      throw error;
    }
  }
}
