import { addLog } from '../utils.js';

const socket = io();

// Socket.IO 이벤트 리스너
socket.on('connect', () => {
    addLog('Socket.IO', 'Connected to server');
});

socket.on('log', (log) => {
    addLog(log.type, log.message);
});

socket.on('response', (data) => {
    addLog('Socket.IO', `Received: ${data}`);
});

// Socket.IO 메시지 전송
export function sendSocketMessage() {
    const message = document.getElementById('socketMessage').value;
    socket.emit('message', message);
    addLog('Socket.IO', `Sent: ${message}`);
}