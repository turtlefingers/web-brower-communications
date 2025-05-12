// Socket.IO 연결
const socket = io();
let ws;

// WebRTC 관련 변수
let peer = null;
let peerConnection = null;
let myPeerId = null;

// SSE 관련 변수
let sseConnection = null;
let isSSEConnected = false;

// Long Polling 관련 변수
let isLongPollingActive = false;
let longPollingTimeout = null;

// WebSocket 초기화
function initWebSocket() {
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

// 로그 표시 함수
function addLog(type, message) {
    const logContainer = document.getElementById('logContainer');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${type}: ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // 하이라이트 효과 추가
    logEntry.classList.add('highlight');
    setTimeout(() => {
        logEntry.classList.remove('highlight');
    }, 1000);
}

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

// WebSocket 메시지 전송
function sendWsMessage() {
    const message = document.getElementById('wsMessage').value;
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        addLog('WebSocket', `Sent: ${message}`);
    } else {
        addLog('WebSocket', 'Connection not available');
    }
}

// Socket.IO 메시지 전송
function sendSocketMessage() {
    const message = document.getElementById('socketMessage').value;
    socket.emit('message', message);
    addLog('Socket.IO', `Sent: ${message}`);
}

// MQTT 메시지 전송
function sendMqttMessage() {
    const message = document.getElementById('mqttMessage').value;
    socket.emit('mqtt-publish', {
        topic: 'test/topic',
        message: message
    });
    addLog('MQTT', `Sent: ${message}`);
}

// WebRTC 초기화
function initPeer() {
    peer = new Peer(null, {
        host: window.location.hostname,
        port: 9000,
        path: '/peerjs',
        debug: 3,
        config: {
            'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }
    });

    peer.on('open', (id) => {
        myPeerId = id;
        updatePeerIdDisplay();
        addLog('WebRTC', `내 ID: ${id}`);
    });

    peer.on('connection', (conn) => {
        peerConnection = conn;
        setupPeerConnection(conn);
        addLog('WebRTC', '새로운 피어가 연결되었습니다.');
    });

    peer.on('error', (err) => {
        addLog('WebRTC', `에러: ${err}`);
    });

    peer.on('disconnected', () => {
        addLog('WebRTC', '서버와의 연결이 끊어졌습니다.');
    });

    peer.on('close', () => {
        addLog('WebRTC', '연결이 종료되었습니다.');
    });
}

// 피어 연결 설정
function setupPeerConnection(conn) {
    conn.on('data', (data) => {
        addLog('WebRTC', `받은 메시지: ${data}`);
    });

    conn.on('close', () => {
        addLog('WebRTC', '피어 연결이 종료되었습니다.');
        peerConnection = null;
    });
}

// 피어 연결
function connectPeer() {
    const peerId = document.getElementById('peerId').value;
    if (!peerId) {
        addLog('WebRTC', '피어 ID를 입력해주세요.');
        return;
    }

    const conn = peer.connect(peerId);
    peerConnection = conn;
    setupPeerConnection(conn);
    addLog('WebRTC', `피어 ${peerId}에 연결 시도 중...`);
}

// 피어 메시지 전송
function sendPeerMessage() {
    const message = document.getElementById('webrtcMessage').value;
    if (peerConnection) {
        peerConnection.send(message);
        addLog('WebRTC', `전송: ${message}`);
    } else {
        addLog('WebRTC', '연결된 피어가 없습니다.');
    }
}

// SSE 토글
function toggleSSE() {
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

// Long Polling 토글
function toggleLongPolling() {
    const button = document.getElementById('longPollingToggle');
    if (!isLongPollingActive) {
        startLongPolling();
        button.textContent = 'Long Polling 종료';
        isLongPollingActive = true;
    } else {
        if (longPollingTimeout) {
            clearTimeout(longPollingTimeout);
        }
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

// SSE 메시지 전송
function sendSSEMessage() {
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

// Long Polling 메시지 전송
function sendLongPollingMessage() {
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

// ID 표시 업데이트 함수
function updatePeerIdDisplay() {
    const peerIdElement = document.getElementById('myPeerId');
    if (peerIdElement) {
        console.log(myPeerId);
        peerIdElement.textContent = myPeerId ? `내 ID: ${myPeerId}` : '내 ID: 연결 중...';
        console.log("peerIdElement.textContent",peerIdElement.textContent);
    }
}

// 로그 컨테이너 높이 조절 기능
function initLogContainerResize() {
    const logContainer = document.querySelector('.log-container');
    const header = logContainer.querySelector('h2');
    let startY;
    let startHeight;

    header.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        startHeight = parseInt(document.defaultView.getComputedStyle(logContainer).height, 10);
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        
        e.preventDefault();
    });

    function resize(e) {
        const newHeight = startHeight - (e.clientY - startY);
        if (newHeight >= 100 && newHeight <= window.innerHeight * 0.8) {
            requestAnimationFrame(() => {
                logContainer.style.height = `${newHeight}px`;
                document.body.style.paddingBottom = `${newHeight + 50}px`;
            });
        }
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
}

// 초기화
initPeer();
initWebSocket();
initLogContainerResize(); 