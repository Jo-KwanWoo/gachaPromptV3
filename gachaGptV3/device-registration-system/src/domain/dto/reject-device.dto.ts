import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RejectDeviceDto {
  @ApiProperty()
  @IsString()
  reason!: string;
}