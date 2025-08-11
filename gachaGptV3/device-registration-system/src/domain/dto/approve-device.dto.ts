import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveDeviceDto {
  @ApiProperty({ required: false, description: '사전 생성된 SQS 큐 URL (옵션)' })
  @IsOptional()
  @IsString()
  sqsQueueUrl?: string;
}