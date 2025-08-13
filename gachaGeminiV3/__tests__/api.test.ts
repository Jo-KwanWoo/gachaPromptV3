import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { DynamoDbService } from '../interface/db/dynamodb.service';
import { SqsService } from '../interface/messaging/sqs.service';

// 테스트 데이터 파일을 가져옵니다.
import * as testData from './test-data.json';

// 모킹 설정
import { mockDynamoDbService, mockSqsService, resetMocks } from './mocks/aws-services.mock';

// NestJS 애플리케이션 인스턴스를 저장할 변수
let app: INestApplication;

// 테스트 시작 전 NestJS 애플리케이션을 초기화합니다.
beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(DynamoDbService)
        .useValue(mockDynamoDbService)
        .overrideProvider(SqsService)
        .useValue(mockSqsService)
        .compile();

    app = moduleFixture.createNestApplication();
    
    // Validation pipe 추가
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    
    await app.init();
});

// 각 테스트 전에 모킹을 리셋합니다.
beforeEach(() => {
    resetMocks();
});

// 모든 테스트가 끝난 후 애플리케이션을 종료합니다.
afterAll(async () => {
    await app.close();
});

// 모든 테스트 케이스를 순회하며 실행합니다.
describe('API Test Suite', () => {
    for (const testCase of testData.testCases) {
        // 각각의 테스트 케이스에 대한 테스트를 정의합니다.
        test(`${testCase.id}: ${testCase.name}`, async () => {

            
            // 특별한 테스트 케이스에 대한 모킹 설정
            if (testCase.id === 'TC004') {
                // 중복 등록 테스트: 이미 장치가 존재한다고 설정
                mockDynamoDbService.getDevice.mockResolvedValueOnce({
                    PK: 'TENANT#TENANT001',
                    SK: 'DEVICE#HW001',
                    hardwareId: 'HW001',
                    tenantId: 'TENANT001',
                    status: 'PENDING'
                });
            }

            if (testCase.id === 'TC005') {
                // 장치 상태 조회 성공 케이스: 장치가 존재한다고 설정
                mockDynamoDbService.getDeviceByHardwareId.mockResolvedValueOnce({
                    PK: 'TENANT#TENANT001',
                    SK: 'DEVICE#HW001',
                    hardwareId: 'HW001',
                    tenantId: 'TENANT001',
                    status: 'PENDING'
                });
            }
            // 요청 객체 생성
            let req = request(app.getHttpServer())
            [testCase.method.toLowerCase()](testCase.endpoint);

            // 헤더 추가
            for (const key in testCase.headers) {
                req = req.set(key, testCase.headers[key]);
            }

            // 바디가 존재하면 추가
            if (testCase.body) {
                req = req.send(testCase.body);
            }

            // 요청 실행 및 응답 검증
            const response = await req;



            // 예상 상태 코드 검증
            expect(testCase.expectedStatus).toContain(response.status);

            // 예상 응답 본문 검증 (부분 일치 검사)
            expect(response.body).toMatchObject(testCase.expectedResponse);
        });
    }
});