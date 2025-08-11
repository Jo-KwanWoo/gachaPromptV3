import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeviceService } from '../service/device.service';
import { RegisterDeviceDto } from '../domain/dto/register-device.dto';
import { ok } from '../common/http-response';
import { JwtAuthGuard } from '../interface/auth/jwt.guard';
import { ApproveDeviceDto } from '../domain/dto/approve-device.dto';
import { RejectDeviceDto } from '../domain/dto/reject-device.dto';

@ApiTags('devices')
@Controller('devices')
export class DeviceController {
  constructor(private service: DeviceService) {}

  @ApiOperation({ summary: '장치 등록 요청' })
  @Post('register')
  async register(@Body() dto: RegisterDeviceDto) {
    const res = await this.service.register(dto);
    return ok('등록 요청이 저장되었습니다', res);
  }

  @ApiOperation({ summary: 'hardwareId로 승인 상태 조회' })
  @Get('status/:hardwareId')
  async status(@Param('hardwareId') hardwareId: string) {
    const data = await this.service.getStatusByHardwareId(hardwareId);
    if ('sqsQueueUrl' in data) return ok('승인 완료', data);
    return ok('승인 대기 중', data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '장치 승인' })
  @Put(':deviceId/approve')
  async approve(@Param('deviceId') deviceId: string, @Body() body: ApproveDeviceDto) {
    const data = await this.service.approve(deviceId, body.sqsQueueUrl);
    return ok('장치가 승인되었습니다', data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '장치 거부' })
  @Put(':deviceId/reject')
  async reject(@Param('deviceId') deviceId: string, @Body() body: RejectDeviceDto) {
    await this.service.reject(deviceId, body.reason);
    return ok('장치가 거부되었습니다');
  }
}