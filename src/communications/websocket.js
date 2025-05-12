const WebSocket = require('ws');

function setupWebSocketServer(addLog) {
    const wss = new WebSocket.Server({ port: 8080 });
    
    wss.on('connection', (ws) => {
        addLog('WebSocket', 'New client connected');
        
        ws.on('message', (message) => {
            addLog('WebSocket', `Received: ${message}`);
            ws.send(`Server received: ${message}`);
        });
    });

    return wss;
}

module.exports = setupWebSocketServer; 