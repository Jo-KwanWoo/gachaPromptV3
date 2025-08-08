import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  Param, 
  Req, 
  HttpCode, 
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DeviceService } from '../service/device.service';
import { Public } from '../interface/auth/public.decorator';
import { 
  DeviceRegistrationDto, 
  DeviceRejectionDto 
} from '../domain/dto/device-registration.dto';
import { 
  ApiResponseDto, 
  DeviceStatusResponseDto, 
  DeviceRegistrationResponseDto 
} from '../domain/dto/api-response.dto';

@ApiTags('devices')
@Controller('api/devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '장치 등록 요청' })
  @ApiResponse({ 
    status: 200, 
    description: '등록 요청 성공',
    type: ApiResponseDto<DeviceRegistrationResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '중복 등록' })
  async registerDevice(
    @Body() registrationDto: DeviceRegistrationDto,
    @Req() req: Request,
  ): Promise<ApiResponseDto<DeviceRegistrationResponseDto>> {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    return this.deviceService.registerDevice(registrationDto, ipAddress);
  }

  @Public()
  @Get('status/:hardwareId')
  @ApiOperation({ summary: '장치 승인 상태 확인' })
  @ApiParam({ name: 'hardwareId', description: '하드웨어 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '상태 확인 성공',
    type: ApiResponseDto<DeviceStatusResponseDto>,
  })
  @ApiResponse({ status: 404, description: '장치를 찾을 수 없음' })
  async getDeviceStatus(
    @Param('hardwareId') hardwareId: string,
    @Req() req: Request,
  ): Promise<ApiResponseDto<DeviceStatusResponseDto>> {
    // tenantId should be passed as query parameter or header in real implementation
    const tenantId = req.query.tenantId as string || req.headers['x-tenant-id'] as string;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.deviceService.getDeviceStatus(hardwareId, tenantId, ipAddress);
  }

  @Put(':deviceId/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: '장치 승인' })
  @ApiParam({ name: 'deviceId', description: '장치 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '승인 성공',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: '장치를 찾을 수 없음' })
  @ApiResponse({ status: 400, description: '승인할 수 없는 상태' })
  async approveDevice(
    @Param('deviceId') deviceId: string,
  ): Promise<ApiResponseDto<{ sqsQueueUrl: string }>> {
    return this.deviceService.approveDevice(deviceId);
  }

  @Put(':deviceId/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: '장치 거부' })
  @ApiParam({ name: 'deviceId', description: '장치 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '거부 성공',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: '장치를 찾을 수 없음' })
  @ApiResponse({ status: 400, description: '거부할 수 없는 상태' })
  async rejectDevice(
    @Param('deviceId') deviceId: string,
    @Body() rejectionDto: DeviceRejectionDto,
  ): Promise<ApiResponseDto> {
    return this.deviceService.rejectDevice(deviceId, rejectionDto);
  }

  @Get('pending')
  @ApiBearerAuth()
  @ApiOperation({ summary: '승인 대기 중인 장치 목록 조회' })
  @ApiResponse({ 
    status: 200, 
    description: '조회 성공',
  })
  async getPendingDevices() {
    return this.deviceService.getPendingDevices();
  }

  @Get(':hardwareId/logs')
  @ApiBearerAuth()
  @ApiOperation({ summary: '장치 등록 로그 조회' })
  @ApiParam({ name: 'hardwareId', description: '하드웨어 ID' })
  @ApiResponse({ 
    status: 200, 
    description: '로그 조회 성공',
  })
  async getDeviceRegistrationLogs(
    @Param('hardwareId') hardwareId: string,
    @Req() req: Request,
  ) {
    const tenantId = req.query.tenantId as string || req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return this.deviceService.getDeviceRegistrationLogs(hardwareId, tenantId);
  }
}