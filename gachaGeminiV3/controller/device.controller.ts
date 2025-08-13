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
  @ApiOperation({ summary: '��ġ ��� ��û', description: '���� ���ǱⰡ �߾� ������ ����� ��û�մϴ�.' })
  @ApiResponse({ status: 201, description: '����', type: CustomApiResponse })
  @ApiResponse({ status: 400, description: '��ȿ�� �˻� ����', type: CustomApiResponse })
  @ApiResponse({ status: 409, description: '�ߺ� ���', type: CustomApiResponse })
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
  @ApiOperation({ summary: '��ġ ���� ��ȸ', description: '��ġ�� ���� ���¸� Ȯ���մϴ�. 5�� �������� �����մϴ�.' })
  @ApiResponse({ status: 200, description: '����', type: CustomApiResponse })
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
  @ApiOperation({ summary: '������ ��ġ ����', description: '�����ڰ� ��ġ ��� ��û�� �����մϴ�.' })
  @ApiResponse({ status: 200, description: '����', type: CustomApiResponse })
  async approveDevice(@Param('hardwareId') hardwareId: string): Promise<ApiResponseData> {
    const data = await this.deviceService.approveDevice(hardwareId);
    return {
      status: 'success',
      message: '��ġ�� ���εǾ����ϴ�',
      data,
    };
  }

  @Put(':hardwareId/reject')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('admin-auth')
  @ApiOperation({ summary: '������ ��ġ �ź�', description: '�����ڰ� ��ġ ��� ��û�� �ź��մϴ�.' })
  @ApiBody({ type: AdminRejectDto })
  @ApiResponse({ status: 200, description: '����', type: CustomApiResponse })
  async rejectDevice(@Param('hardwareId') hardwareId: string, @Body() body: AdminRejectDto): Promise<ApiResponseData> {
    await this.deviceService.rejectDevice(hardwareId, body.reason);
    return {
      status: 'success',
      message: '��ġ�� �źεǾ����ϴ�',
      data: { status: DeviceStatus.REJECTED, reason: body.reason },
    };
  }
}
