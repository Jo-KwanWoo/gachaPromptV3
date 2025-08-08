import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AdminRejectDto {
  @ApiProperty({ example: '�̹� ��ϵ� ��ġ�Դϴ�' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
