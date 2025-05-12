const express = require('express');
const router = express.Router();
const logger = require('./logger');

function setupHttpServer(app, addLog) {
    // HTTP 엔드포인트
    app.get('/api/logs', (req, res) => {
        res.json(logger.getLogs());
    });

    app.post('/api/message', (req, res) => {
        const message = req.body.message;
        addLog('HTTP', `Received message: ${message}`);
        res.json({ status: 'success', message });
    });

    // WebRTC 화상회의 방 관리
    const roomPeers = {};
    app.post('/api/room/:roomId/peers', (req, res) => {
        const { roomId } = req.params;
        const { peerId } = req.body;
        if (!roomPeers[roomId]) roomPeers[roomId] = [];
        if (!roomPeers[roomId].includes(peerId)) {
            roomPeers[roomId].push(peerId);
        }
        // 본인 제외한 기존 peerId 목록 반환
        const otherPeers = roomPeers[roomId].filter(id => id !== peerId);
        res.json(otherPeers);
    });

    // 방에서 peerId 제거
    app.delete('/api/room/:roomId/peers', (req, res) => {
        const { roomId } = req.params;
        const { peerId } = req.body;
        if (roomPeers[roomId]) {
            roomPeers[roomId] = roomPeers[roomId].filter(id => id !== peerId);
            // 방이 비면 삭제
            if (roomPeers[roomId].length === 0) delete roomPeers[roomId];
        }
        res.json({ success: true });
    });

    return router;
}

module.exports = setupHttpServer; 