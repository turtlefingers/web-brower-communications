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

    return router;
}

module.exports = setupHttpServer; 