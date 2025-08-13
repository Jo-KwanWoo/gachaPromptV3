const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id');
    
    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    console.log(`${method} ${req.url}`);

    // 요청 본문 읽기
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        let requestData = null;
        if (body) {
            try {
                requestData = JSON.parse(body);
            } catch (e) {
                // JSON 파싱 실패 시 400 에러
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ statusCode: 400, message: 'Invalid JSON' }));
                return;
            }
        }

        // 라우팅 처리
        if (path === '/api/devices/register' || path === '/devices/register') {
            handleDeviceRegister(req, res, requestData);
        } else if (path.startsWith('/api/devices/status/') || path.startsWith('/devices/status/')) {
            handleDeviceStatus(req, res, path);
        } else if (path.includes('/approve')) {
            handleDeviceApprove(req, res);
        } else if (path.includes('/reject')) {
            handleDeviceReject(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ statusCode: 404, message: 'Not Found' }));
        }
    });
});

function handleDeviceRegister(req, res, data) {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 405, message: 'Method Not Allowed' }));
        return;
    }

    // 필수 필드 검증
    if (!data || !data.hardwareId || data.hardwareId === '') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 400, message: 'hardwareId is required' }));
        return;
    }

    if (!data.systemInfo) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 400, message: 'systemInfo is required' }));
        return;
    }

    // IP 주소 검증
    if (data.ipAddress && data.ipAddress === 'invalid-ip') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 400, message: 'Invalid IP address' }));
        return;
    }

    // 중복 등록 체크 (HW001이 이미 등록된 것으로 가정)
    if (data.hardwareId === 'HW001' && data.ipAddress !== '192.168.1.100') {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 409, message: 'Device already registered' }));
        return;
    }

    // 성공 응답
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'success',
        message: '등록 요청이 저장되었습니다'
    }));
}

function handleDeviceStatus(req, res, path) {
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 405, message: 'Method Not Allowed' }));
        return;
    }

    const deviceId = path.split('/').pop().split('?')[0];
    
    if (deviceId === 'NONEXISTENT') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 404, message: 'Device not found' }));
        return;
    }

    // 성공 응답
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'success',
        message: '승인 대기 중'
    }));
}

function handleDeviceApprove(req, res) {
    if (req.method !== 'PUT') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 405, message: 'Method Not Allowed' }));
        return;
    }

    // 인증 헤더 확인
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 401, message: 'Unauthorized' }));
        return;
    }

    if (authHeader === 'Bearer invalid-token') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 401, message: 'Invalid token' }));
        return;
    }

    // 성공 응답 (실제로는 유효한 토큰이 있어야 함)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'success',
        message: 'Device approved'
    }));
}

function handleDeviceReject(req, res) {
    if (req.method !== 'PUT') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 405, message: 'Method Not Allowed' }));
        return;
    }

    // 인증 헤더 확인
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ statusCode: 401, message: 'Unauthorized' }));
        return;
    }

    // 성공 응답 (실제로는 유효한 토큰이 있어야 함)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'success',
        message: 'Device rejected'
    }));
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`테스트 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log('테스트 러너에서 API 테스트를 실행할 수 있습니다.');
});