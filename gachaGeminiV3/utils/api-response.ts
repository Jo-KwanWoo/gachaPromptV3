import { ApiProperty } from '@nestjs/swagger';

export interface ApiResponseData {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export class CustomApiResponse {
  @ApiProperty({ example: 'success' })
  status: 'success' | 'error';
  @ApiProperty({ example: '��û�� ���������� ó���Ǿ����ϴ�' })
  message: string;
  @ApiProperty({ example: { status: 'pending' } })
  data: any;
}
