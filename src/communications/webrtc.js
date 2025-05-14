const { PeerServer } = require('peer');
const logger = require('./logger');

function setupWebRTC(app, server) {
    // Railway 환경에서는 PEER_PORT 환경변수 사용, 없으면 9000
    const PEER_PORT = process.env.PEER_PORT || 9000;

    const peerServer = PeerServer({
        port: PEER_PORT,
        path: '/peerjs',
        proxied: true,
        ssl: process.env.NODE_ENV === 'production',  // Railway에서는 SSL 필요
        allow_discovery: true,
        debug: process.env.NODE_ENV !== 'production'
    });

    // 연결 이벤트 처리
    peerServer.on('connection', (client) => {
        logger.addLog('WebRTC', `새로운 클라이언트 연결: ${client.id}`);
    });

    // 연결 해제 이벤트 처리
    peerServer.on('disconnect', (client) => {
        logger.addLog('WebRTC', `클라이언트 연결 해제: ${client.id}`);
    });

    // 에러 이벤트 처리
    peerServer.on('error', (error) => {
        logger.addLog('WebRTC', `서버 에러: ${error.message}`);
    });

    logger.addLog('WebRTC', `PeerJS 서버가 포트 ${PEER_PORT}에서 실행 중입니다.`);
}

module.exports = setupWebRTC; 