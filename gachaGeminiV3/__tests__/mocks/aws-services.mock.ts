// AWS 서비스 모킹
export const mockDynamoDbService = {
  getDevice: jest.fn(),
  getDeviceByHardwareId: jest.fn(),
  createOrUpdateDevice: jest.fn(),
};

export const mockSqsService = {
  createQueue: jest.fn(),
};

// 모킹 설정 함수들
export const setupMockDynamoDb = () => {
  // 기본적으로 장치가 존재하지 않는다고 가정
  mockDynamoDbService.getDevice.mockResolvedValue(null);
  mockDynamoDbService.getDeviceByHardwareId.mockResolvedValue(null);
  mockDynamoDbService.createOrUpdateDevice.mockResolvedValue(undefined);
};

export const setupMockSqs = () => {
  mockSqsService.createQueue.mockResolvedValue('https://sqs.ap-northeast-2.amazonaws.com/123456789012/test-queue');
};

export const resetMocks = () => {
  jest.clearAllMocks();
  setupMockDynamoDb();
  setupMockSqs();
};