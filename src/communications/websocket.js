const WebSocket = require('ws');

function setupWebSocketServer(addLog) {
    const PORT = process.env.PORT || 4000;
    const wss = new WebSocket.Server({ 
        port: PORT,
        perMessageDeflate: false // Railway 환경에서의 안정성을 위해 압축 비활성화
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