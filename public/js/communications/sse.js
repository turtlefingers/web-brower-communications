import { addLog } from '../utils.js';

let sseConnection = null;
let isSSEConnected = false;

// SSE 토글
export function toggleSSE() {
    const button = document.getElementById('sseToggle');
    if (!isSSEConnected) {
        sseConnection = new EventSource('/api/sse');
        sseConnection.onmessage = (event) => {
            const data = JSON.parse(event.data);
            addLog('SSE', `받은 데이터: ${JSON.stringify(data)}`);
        };
        button.textContent = 'SSE 연결 종료';
        isSSEConnected = true;
        addLog('SSE', 'SSE 연결이 시작되었습니다.');
    } else {
        sseConnection.close();
        button.textContent = 'SSE 연결 시작';
        isSSEConnected = false;
        addLog('SSE', 'SSE 연결이 종료되었습니다.');
    }
}

// SSE 메시지 전송
export function sendSSEMessage() {
    const message = document.getElementById('sseMessage').value;
    if (!isSSEConnected) {
        addLog('SSE', '먼저 SSE 연결을 시작해주세요.');
        return;
    }
    
    fetch('/api/sse/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
        addLog('SSE', `메시지 전송: ${message}`);
    })
    .catch(error => {
        addLog('SSE', `에러: ${error.message}`);
    });
} 