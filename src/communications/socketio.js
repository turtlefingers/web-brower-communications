const socketIo = require('socket.io');
const logger = require('./logger');

function setupSocketIOServer(server) {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        logger.addLog('Socket.IO', 'New client connected');
        
        socket.on('message', (data) => {
            logger.addLog('Socket.IO', `Received: ${data}`);
            socket.emit('response', `Server received: ${data}`);
        });

        // MQTT 메시지 발행을 위한 이벤트 핸들러
        socket.on('mqtt-publish', (data) => {
            if (global.mqttClient && global.mqttClient.connected) {
                global.mqttClient.publish(data.topic, data.message);
                logger.addLog('MQTT', `Published to ${data.topic}: ${data.message}`);
            } else {
                logger.addLog('MQTT', 'MQTT 브로커가 연결되어 있지 않습니다');
            }
        });
    });

    return io;
}

module.exports = setupSocketIOServer; 