import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AdminRejectDto {
  @ApiProperty({ example: '이미 등록된 장치입니다' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
