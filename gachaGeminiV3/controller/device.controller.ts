import { Body, Controller, Get, Param, Post, Put, UseGuards, HttpStatus } from '@nestjs/common';
import { DeviceService } from '../service/device.service';
import { DeviceRegistrationDto } from '../domain/device-registration.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomApiResponse, ApiResponseData } from '../utils/api-response';
import { AdminRejectDto } from '../domain/admin-approve.dto';
import { DeviceStatus } from '../domain/device-status.enum';

@ApiTags('Devices')
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('register')
  @ApiOperation({ summary: '장치 등록 요청', description: '무인 자판기가 중앙 서버에 등록을 요청합니다.' })
  @ApiResponse({ status: 201, description: '성공', type: CustomApiResponse })
  @ApiResponse({ status: 400, description: '유효성 검사 실패', type: CustomApiResponse })
  @ApiResponse({ status: 409, description: '중복 등록', type: CustomApiResponse })
  @ApiBody({ type: DeviceRegistrationDto })
  async registerDevice(@Body() deviceRegistrationDto: DeviceRegistrationDto): Promise<ApiResponseData> {
    const data = await this.deviceService.registerDevice(deviceRegistrationDto);
    return {
      status: 'success',
      message: '등록 요청이 저장되었습니다',
      data,
    };
  }

  @Get('status/:hardwareId')
  @ApiOperation({ summary: '장치 상태 조회', description: '장치가 승인 상태를 확인합니다. 5분 간격으로 폴링합니다.' })
  @ApiResponse({ status: 200, description: '성공', type: CustomApiResponse })
  async getDeviceStatus(@Param('hardwareId') hardwareId: string): Promise<ApiResponseData> {
    const device = await this.deviceService.getDeviceStatus(hardwareId);
    if (device.status === DeviceStatus.APPROVED) {
      return {
        status: 'success',
        message: '승인 완료',
        data: {
          deviceId: device.SK.split('#')[1],
          sqsQueueUrl: device.sqsQueueUrl,
        },
      };
    } else {
      return {
        status: 'success',
        message: '승인 대기 중',
        data: { status: device.status },
      };
    }
  }

  @Put(':hardwareId/approve')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('admin-auth')
  @ApiOperation({ summary: '관리자 장치 승인', description: '관리자가 장치 등록 요청을 승인합니다.' })
  @ApiResponse({ status: 200, description: '성공', type: CustomApiResponse })
  async approveDevice(@Param('hardwareId') hardwareId: string): Promise<ApiResponseData> {
    const data = await this.deviceService.approveDevice(hardwareId);
    return {
      status: 'success',
      message: '장치가 승인되었습니다',
      data,
    };
  }

  @Put(':hardwareId/reject')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('admin-auth')
  @ApiOperation({ summary: '관리자 장치 거부', description: '관리자가 장치 등록 요청을 거부합니다.' })
  @ApiBody({ type: AdminRejectDto })
  @ApiResponse({ status: 200, description: '성공', type: CustomApiResponse })
  async rejectDevice(@Param('hardwareId') hardwareId: string, @Body() body: AdminRejectDto): Promise<ApiResponseData> {
    await this.deviceService.rejectDevice(hardwareId, body.reason);
    return {
      status: 'success',
      message: '장치가 거부되었습니다',
      data: { status: DeviceStatus.REJECTED, reason: body.reason },
    };
  }
}
