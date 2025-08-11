import { ApiProperty } from '@nestjs/swagger';
import { IsIP, IsObject, IsString } from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty()
  @IsString()
  hardwareId!: string;

  @ApiProperty()
  @IsString()
  tenantId!: string;

  @ApiProperty()
  @IsString()
  @IsIP(4, { message: 'IPv4 주소여야 합니다' })
  ipAddress!: string;

  @ApiProperty({ example: { os: 'linux', arch: 'arm64', mac: 'aa:bb:cc:dd:ee:ff' } })
  @IsObject()
  systemInfo!: { os: string; arch: string; mac: string };
}