import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamoService {
  public readonly doc: DynamoDBDocumentClient;
  constructor(cfg: ConfigService) {
    const region = cfg.get('aws.region') || 'ap-northeast-2';
    const endpoint = cfg.get('DYNAMODB_ENDPOINT');
    
    console.log(`🔧 DynamoDB 설정: ${endpoint ? '로컬' : 'AWS'} (${endpoint || 'AWS 기본'})`);
    
    const client = new DynamoDBClient({ 
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId: cfg.get('AWS_ACCESS_KEY_ID') || 'dummy',
        secretAccessKey: cfg.get('AWS_SECRET_ACCESS_KEY') || 'dummy'
      }
    });
    
    this.doc = DynamoDBDocumentClient.from(client, { 
      marshallOptions: { removeUndefinedValues: true } 
    });
  }
}