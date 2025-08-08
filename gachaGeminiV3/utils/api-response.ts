import { ApiProperty } from '@nestjs/swagger';

export interface ApiResponseData {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export class CustomApiResponse {
  @ApiProperty({ example: 'success' })
  status: 'success' | 'error';
  @ApiProperty({ example: '요청이 성공적으로 처리되었습니다' })
  message: string;
  @ApiProperty({ example: { status: 'pending' } })
  data: any;
}
