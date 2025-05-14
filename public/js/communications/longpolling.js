import { addLog } from '../utils.js';

let isLongPollingActive = false;
let longPollingTimeout = null;

// Long Polling 토글
export function toggleLongPolling() {
    const button = document.getElementById('longPollingToggle');
    if (!isLongPollingActive) {
        startLongPolling();
        startAutoUpdate();
        button.textContent = 'Long Polling 종료';
        isLongPollingActive = true;
    } else {
        if (longPollingTimeout) {
            clearTimeout(longPollingTimeout);
        }
        stopAutoUpdate();
        button.textContent = 'Long Polling 시작';
        isLongPollingActive = false;
        addLog('Long Polling', 'Long Polling이 종료되었습니다.');
    }
}

// Long Polling 시작
function startLongPolling() {
    fetch('/api/longpoll')
        .then(response => response.json())
        .then(data => {
            addLog('Long Polling', `받은 데이터: ${JSON.stringify(data)}`);
            if (isLongPollingActive) {
                longPollingTimeout = setTimeout(startLongPolling, 0);
            }
        })
        .catch(error => {
            addLog('Long Polling', `에러: ${error.message}`);
            if (isLongPollingActive) {
                longPollingTimeout = setTimeout(startLongPolling, 1000);
            }
        });
}

// 자동 업데이트 시작
function startAutoUpdate() {
    fetch('/api/longpoll/auto-update/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interval: 5000 }) // 5초마다 업데이트
    })
    .then(response => response.json())
    .then(data => {
        addLog('Long Polling', '자동 업데이트가 시작되었습니다.');
    })
    .catch(error => {
        addLog('Long Polling', `자동 업데이트 시작 실패: ${error.message}`);
    });
}

// 자동 업데이트 중지
function stopAutoUpdate() {
    fetch('/api/longpoll/auto-update/stop', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        addLog('Long Polling', '자동 업데이트가 중지되었습니다.');
    })
    .catch(error => {
        addLog('Long Polling', `자동 업데이트 중지 실패: ${error.message}`);
    });
}

// Long Polling 메시지 전송
export function sendLongPollingMessage() {
    const message = document.getElementById('longPollingMessage').value;
    if (!isLongPollingActive) {
        addLog('Long Polling', '먼저 Long Polling을 시작해주세요.');
        return;
    }

    fetch('/api/longpoll/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
        addLog('Long Polling', `메시지 전송: ${message}`);
    })
    .catch(error => {
        addLog('Long Polling', `에러: ${error.message}`);
    });
} 