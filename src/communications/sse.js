const logger = require('./logger');

function setupSSEServer(app) {
    let clients = [];

    app.get('/api/sse', (req, res) => {
        // SSE 헤더 설정
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // 클라이언트 연결 로그
        logger.addLog('SSE', 'New client connected');
        clients.push(res);

        // 주기적으로 데이터 전송 (예: 5초마다)
        const intervalId = setInterval(() => {
            const data = {
                timestamp: new Date().toISOString(),
                message: 'Server update'
            };
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }, 5000);

        // 클라이언트 연결 종료 시 정리
        req.on('close', () => {
            clearInterval(intervalId);
            clients = clients.filter(client => client !== res);
            logger.addLog('SSE', 'Client disconnected');
        });
    });

    // SSE 메시지 전송 엔드포인트
    app.post('/api/sse/message', (req, res) => {
        const { message } = req.body;
        const data = {
            timestamp: new Date().toISOString(),
            message: message
        };

        // 모든 연결된 클라이언트에게 메시지 전송
        clients.forEach(client => {
            client.write(`data: ${JSON.stringify(data)}\n\n`);
        });

        logger.addLog('SSE', `Broadcast message: ${message}`);
        res.json({ success: true, message: 'Message sent to all clients' });
    });
}

module.exports = setupSSEServer; 