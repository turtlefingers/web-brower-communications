import { addLog } from '../utils.js';

let ws;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// WebSocket 초기화
export function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // 서버의 WebSocket 경로(/ws)를 포함한 URL 생성
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        addLog('WebSocket', '서버에 연결되었습니다.');
        reconnectAttempts = 0; // 연결 성공시 재시도 카운트 초기화
    };
    
    ws.onmessage = (event) => {
        addLog('WebSocket', `받은 메시지: ${event.data}`);
    };
    
    ws.onclose = () => {
        addLog('WebSocket', '연결이 종료되었습니다.');
        // 최대 재시도 횟수 체크
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            addLog('WebSocket', `${timeout/1000}초 후 재연결 시도 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(initWebSocket, timeout);
        } else {
            addLog('WebSocket', '최대 재연결 시도 횟수를 초과했습니다.');
        }
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
        addLog('WebSocket', `전송: ${message}`);
    } else {
        addLog('WebSocket', '연결이 불가능합니다. 잠시 후 다시 시도해주세요.');
    }
} 