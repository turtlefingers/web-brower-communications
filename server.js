const express = require('express');
const http = require('http');
const cors = require('cors');

// 통신 모듈 임포트
const setupHttpServer = require('./src/communications/http');
const setupWebSocketServer = require('./src/communications/websocket');
const setupSocketIOServer = require('./src/communications/socketio');
const setupMQTTClient = require('./src/communications/mqtt');
const setupSerialPort = require('./src/communications/serial');
const setupSSEServer = require('./src/communications/sse');
const setupLongPolling = require('./src/communications/longpolling');
const setupWebRTC = require('./src/communications/webrtc');
const logger = require('./src/communications/logger');

logger.addLog('', '\n=== 서버 초기화 시작 ===\n');

// Express 앱 설정
const app = express();
const server = http.createServer(app);

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Socket.IO 서버 설정
logger.addLog('', '1. Socket.IO 서버 설정 중...');
const io = setupSocketIOServer(server);
logger.setIO(io);
logger.addLog('', '   ✓ Socket.IO 서버 설정 완료\n');

// HTTP 서버 설정
logger.addLog('', '2. HTTP 서버 설정 중...');
setupHttpServer(app, logger.addLog);
logger.addLog('', '   ✓ HTTP 서버 설정 완료\n');

// WebSocket 서버 설정
logger.addLog('', '3. WebSocket 서버 설정 중...');
setupWebSocketServer(logger.addLog);
logger.addLog('', '   ✓ WebSocket 서버 설정 완료\n');

// MQTT 클라이언트 설정
logger.addLog('', '4. MQTT 클라이언트 설정 중...');
setupMQTTClient(logger.addLog);
logger.addLog('', '   ✓ MQTT 클라이언트 설정 완료\n');

// 시리얼 포트 설정
logger.addLog('', '5. 시리얼 포트 설정 중...');
setupSerialPort(logger.addLog);
logger.addLog('', '   ✓ 시리얼 포트 설정 완료\n');

// SSE 서버 설정
logger.addLog('', '6. SSE 서버 설정 중...');
setupSSEServer(app);
logger.addLog('', '   ✓ SSE 서버 설정 완료\n');

// Long Polling 설정
logger.addLog('', '7. Long Polling 설정 중...');
setupLongPolling(app);
logger.addLog('', '   ✓ Long Polling 설정 완료\n');

// WebRTC 설정
logger.addLog('', '8. WebRTC 설정 중...');
setupWebRTC(app, server);
logger.addLog('', '   ✓ WebRTC 설정 완료\n');

// 서버 시작
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.addLog('', '\n=== 서버 실행 정보 ===\n');
    
    const addresses = [
        `http://localhost:${PORT}`,
        `http://127.0.0.1:${PORT}`
    ];
    
    // 로컬 IP 주소 가져오기
    const networkInterfaces = require('os').networkInterfaces();
    Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((interface) => {
            if (interface.family === 'IPv4' && !interface.internal) {
                addresses.push(`http://${interface.address}:${PORT}`);
            }
        });
    });

    logger.addLog('', '서버가 다음 주소에서 실행 중입니다:');
    addresses.forEach((address) => {
        logger.addLog('', `- ${address}`);
    });
    
    logger.addLog('', '\n=== 엔드포인트 정보 ===\n');
    logger.addLog('', `WebSocket 서버: ws://localhost:4000`);
    logger.addLog('', `SSE 엔드포인트: http://localhost:${PORT}/api/sse`);
    logger.addLog('', `Long Polling 엔드포인트: http://localhost:${PORT}/api/longpoll`);
    logger.addLog('', `WebRTC 시그널링 서버: http://localhost:${PORT}/peerjs`);
    
    logger.addLog('', '\n=== 서버 초기화 완료 ===\n');
}); 