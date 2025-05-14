const WebSocket = require('ws');

function setupWebSocketServer(server, addLog) {
    const wss = new WebSocket.Server({ 
        server,  // HTTP 서버 인스턴스 사용
        path: '/ws'  // WebSocket 전용 경로 지정
    });
    
    wss.on('connection', (ws) => {
        addLog('WebSocket', 'New client connected');
        
        ws.on('message', (message) => {
            addLog('WebSocket', `Received: ${message}`);
            ws.send(`Server received: ${message}`);
        });

        // 연결 상태 확인을 위한 ping/pong
        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });
    });

    // 연결 상태 주기적 확인
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    return wss;
}

module.exports = setupWebSocketServer; 