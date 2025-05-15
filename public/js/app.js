// 모듈 import
import { addLog, initLogContainerResize } from './utils.js';
import { initWebSocket, sendWsMessage } from './communications/websocket.js';
import { sendSocketMessage } from './communications/socketio.js';
import { initPeer, connectPeer, sendPeerMessage } from './communications/webrtc.js';
import { toggleSSE, sendSSEMessage } from './communications/sse.js';
import { toggleLongPolling, sendLongPollingMessage } from './communications/longpolling.js';
import { connectSerialPort, disconnectSerialPort, sendSerialMessage } from './communications/serial.js';
import { connectBluetooth, disconnectBluetooth, sendBluetoothMessage } from './communications/bluetooth.js';

// HTTP 메시지 전송
async function sendHttpMessage() {
    const message = document.getElementById('httpMessage').value;
    try {
        const response = await fetch('/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        addLog('HTTP', `Response: ${JSON.stringify(data)}`);
    } catch (error) {
        addLog('HTTP', `Error: ${error.message}`);
    }
}

// 전역 스코프에 함수 노출
window.sendHttpMessage = sendHttpMessage;
window.sendWsMessage = sendWsMessage;
window.sendSocketMessage = sendSocketMessage;
window.connectPeer = connectPeer;
window.sendPeerMessage = sendPeerMessage;
window.toggleSSE = toggleSSE;
window.sendSSEMessage = sendSSEMessage;
window.toggleLongPolling = toggleLongPolling;
window.sendLongPollingMessage = sendLongPollingMessage;
window.connectSerialPort = connectSerialPort;
window.disconnectSerialPort = disconnectSerialPort;
window.sendSerialMessage = sendSerialMessage;
window.connectBluetooth = connectBluetooth;
window.disconnectBluetooth = disconnectBluetooth;
window.sendBluetoothMessage = sendBluetoothMessage;

// 초기화
initPeer();
initWebSocket();
initLogContainerResize(); 