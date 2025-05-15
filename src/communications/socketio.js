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

    });

    return io;
}

module.exports = setupSocketIOServer; 