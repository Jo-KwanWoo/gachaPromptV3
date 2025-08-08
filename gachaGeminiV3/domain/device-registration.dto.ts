import { IsNotEmpty, IsObject, IsString, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SystemInfoDto {
  @ApiProperty({ example: 'linux' })
  @IsString()
  @IsNotEmpty()
  os: string;
  @ApiProperty({ example: 'arm64' })
  @IsString()
  @IsNotEmpty()
  arch: string;
  @ApiProperty({ example: 'xx:xx:xx:xx:xx' })
  @IsString()
  @IsNotEmpty()
  mac: string;
}

export class DeviceRegistrationDto {
  @ApiProperty({ example: 'device-001' })
  @IsString()
  @IsNotEmpty()
  hardwareId: string;
  @ApiProperty({ example: 'tenant-abc' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
  @ApiProperty({ example: '192.168.0.1' })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;
  @ApiProperty({
    type: SystemInfoDto,
    example: { os: 'linux', arch: 'arm64', mac: 'xx:xx:xx:xx:xx' },
  })
  @IsObject()
  @IsDefined()
  @ValidateNested()
  @Type(() => SystemInfoDto)
  systemInfo: SystemInfoDto;
}
