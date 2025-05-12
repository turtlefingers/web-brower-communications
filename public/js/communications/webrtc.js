import { addLog } from '../utils.js';

let peer = null;
let peerConnection = null;
let myPeerId = null;

// WebRTC 초기화
export function initPeer() {
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
export function connectPeer() {
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
export function sendPeerMessage() {
    const message = document.getElementById('webrtcMessage').value;
    if (peerConnection) {
        peerConnection.send(message);
        addLog('WebRTC', `전송: ${message}`);
    } else {
        addLog('WebRTC', '연결된 피어가 없습니다.');
    }
}

// ID 표시 업데이트 함수
function updatePeerIdDisplay() {
    const peerIdElement = document.getElementById('myPeerId');
    if (peerIdElement) {
        peerIdElement.textContent = myPeerId ? `내 ID: ${myPeerId}` : '내 ID: 연결 중...';
    }
} 