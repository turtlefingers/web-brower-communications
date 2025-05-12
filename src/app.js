const express = require('express');
const http = require('http');
const path = require('path');
const setupSocketIO = require('./communications/socketio');
const setupMQTT = require('./communications/mqtt');
const setupSSE = require('./communications/sse');
const setupLongPolling = require('./communications/longpolling');
const setupWebSocket = require('./communications/websocket');

const app = express();
const server = http.createServer(app);

// WebSocket 서버 설정
setupWebSocket(server);

// Socket.IO 설정
setupSocketIO(server);

// MQTT 설정
setupMQTT();

// SSE 설정
setupSSE(app);

// Long Polling 설정
setupLongPolling(app);

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../public')));

// JSON 파싱 미들웨어
app.use(express.json());

// HTTP 메시지 전송 엔드포인트
app.post('/api/message', (req, res) => {
    const message = req.body.message;
    console.log('HTTP 메시지 수신:', message);
    res.json({ status: 'success', message: `서버가 메시지를 받았습니다: ${message}` });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 