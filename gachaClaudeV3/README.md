# 장치 등록 시스템 (Device Registration System)

무인 가챠 자판기 장치들이 중앙 서버에 자동으로 등록될 수 있도록 하는 NestJS 기반 백엔드 시스템입니다.

## 🏗️ 아키텍처

```
src/
├── controller/         # API 라우팅 (Presentation Layer)
├── service/           # 비즈니스 로직 (Business Layer)
├── domain/            # 모델, DTO, 검증 (Domain Layer)
└── interface/         # 외부 시스템 인터페이스 (Infrastructure Layer)
    ├── db/           # DynamoDB 인터페이스
    ├── messaging/    # SQS 메시징
    └── auth/         # JWT 인증
```

## 🚀 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 AWS 자격 증명 및 기타 설정을 입력하세요
```

### 2. AWS 리소스 설정

DynamoDB 테이블 생성:

```bash
# devices 테이블
aws dynamodb create-table \
  --table-name devices \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    IndexName=GSI1,KeySchema=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# device-logs 테이블
aws dynamodb create-table \
  --table-name device-logs \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### 3. 서버 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## 📚 API 문서

서버 실행 후 Swagger 문서를 확인할 수 있습니다:
- http://localhost:3000/api/docs

## 🔌 API 엔드포인트

### 장치 등록 (공개)
```http
POST /api/devices/register
Content-Type: application/json

{
  "hardwareId": "HW001",
  "tenantId": "TENANT001",
  "ipAddress": "192.168.1.100",
  "systemInfo": {
    "os": "linux",
    "arch": "arm64",
    "mac": "xx:xx:xx:xx:xx:xx"
  }
}
```

### 승인 상태 확인 (공개)
```http
GET /api/devices/status/HW001?tenantId=TENANT001
```

### 장치 승인 (관리자 인증 필요)
```http
PUT /api/devices/{deviceId}/approve
Authorization: Bearer {jwt_token}
```

### 장치 거부 (관리자 인증 필요)
```http
PUT /api/devices/{deviceId}/reject
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "reason": "이미 등록된 장치입니다"
}
```

## 🖥️ 클라이언트 사용법

장치 측에서는 `client-example/device-client.js`를 참고하여 구현할 수 있습니다:

```javascript
const DeviceRegistrationClient = require('./client-example/device-client');

const client = new DeviceRegistrationClient(
  'https://your-server.com',
  'HW001', // Hardware ID
  'TENANT001' // Tenant ID
);

client.start();
```

## 🔐 보안 고려사항

1. **JWT 인증**: 관리자 API는 JWT 토큰이 필요합니다
2. **입력 검증**: 모든 입력은 class-validator로 검증됩니다
3. **IP 추적**: 모든 요청의 IP 주소가 로그에 기록됩니다
4. **CORS 설정**: 허용된 도메인만 접근 가능합니다

## 🔄 장치 등록 플로우

1. **장치 부팅**: 네트워크 연결 후 등록 요청 전송
2. **등록 요청**: POST /api/devices/register
3. **상태 폴링**: 5분 간격으로 승인 상태 확인
4. **관리자 승인**: 웹 대시보드에서 승인/거부
5. **큐 발급**: 승인 시 SQS 큐 URL 제공
6. **메시지 수신**: 장치는 큐를 통해 서버 메시지 수신

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# 테스트 커버리지
npm run test:cov

# E2E 테스트
npm run test:e2e
```

## 📈 확장성 고려사항

1. **메시징 추상화**: SQS를 Kafka로 쉽게 교체 가능
2. **데이터베이스 추상화**: DynamoDB를 다른 DB로 교체 가능
3. **계층 분리**: 각 계층이 독립적으로 테스트 가능
4. **의존성 주입**: 모든 의존성이 인터페이스를 통해 주입

## 🚨 에러 처리

- **400**: 잘못된 요청 (입력 검증 실패)
- **401**: 인증 실패
- **404**: 리소스를 찾을 수 없음
- **409**: 중복 등록
- **500**: 내부 서버 오류

## 📊 모니터링

모든 장치 활동은 `device-logs` 테이블에 기록됩니다:
- 등록 요청
- 상태 확인
- 승인/거부 처리

## 🔧 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| PORT | 서버 포트 | 3000 |
| JWT_SECRET | JWT 서명 키 | - |
| AWS_REGION | AWS 리전 | ap-northeast-2 |
| DEVICES_TABLE | 장치 테이블명 | devices |
| LOGS_TABLE | 로그 테이블명 | device-logs |
| ALLOWED_ORIGINS | CORS 허용 도메인 | localhost:3000 |