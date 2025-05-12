import { addLog } from '../utils.js';

let ws;

// WebSocket 초기화
export function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8080`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        addLog('WebSocket', '서버에 연결되었습니다.');
    };
    
    ws.onmessage = (event) => {
        addLog('WebSocket', `받은 메시지: ${event.data}`);
    };
    
    ws.onclose = () => {
        addLog('WebSocket', '연결이 종료되었습니다.');
        // 연결이 끊어지면 3초 후 재연결 시도
        setTimeout(initWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
        addLog('WebSocket', `에러: ${error.message}`);
    };
}

// WebSocket 메시지 전송
export function sendWsMessage() {
    const message = document.getElementById('wsMessage').value;
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        addLog('WebSocket', `Sent: ${message}`);
    } else {
        addLog('WebSocket', 'Connection not available');
    }
} 