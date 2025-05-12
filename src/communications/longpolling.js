const logger = require('./logger');

function setupLongPolling(app) {
    let pendingRequests = [];
    let lastUpdate = Date.now();

    // 클라이언트가 업데이트를 요청
    app.get('/api/longpoll', (req, res) => {
        logger.addLog('LongPolling', 'New client waiting for updates');
        pendingRequests.push(res);

        // 30초 후 자동 응답 (타임아웃)
        const timeout = setTimeout(() => {
            const index = pendingRequests.indexOf(res);
            if (index > -1) {
                pendingRequests.splice(index, 1);
                res.json({ status: 'timeout', message: 'No updates available' });
                logger.addLog('LongPolling', 'Client request timed out');
            }
        }, 30000);

        // 클라이언트 연결 종료 시 정리
        req.on('close', () => {
            clearTimeout(timeout);
            const index = pendingRequests.indexOf(res);
            if (index > -1) {
                pendingRequests.splice(index, 1);
            }
        });
    });

    // 서버에서 업데이트 푸시
    app.post('/api/longpoll/update', (req, res) => {
        const message = req.body.message;
        lastUpdate = Date.now();
        
        // 모든 대기 중인 클라이언트에게 응답
        pendingRequests.forEach(clientRes => {
            clientRes.json({
                status: 'success',
                message: message,
                timestamp: lastUpdate
            });
        });
        
        pendingRequests = [];
        logger.addLog('LongPolling', `Broadcasted update: ${message}`);
        res.json({ status: 'success', clientsNotified: pendingRequests.length });
    });

    return {
        getLastUpdate: () => lastUpdate
    };
}

module.exports = setupLongPolling; 