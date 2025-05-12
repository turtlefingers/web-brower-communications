// 로그 표시 함수
function addLog(type, message) {
    const logContainer = document.getElementById('logContainer');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${type}: ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// 뷰 전환 함수
function switchView(view) {
    const container = document.getElementById('mainContainer');
    const tabHeader = container.querySelector('.tab-header');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const tabViewBtn = document.getElementById('tabViewBtn');

    if (view === 'grid') {
        container.classList.remove('tab-view');
        container.classList.add('grid-view');
        tabHeader.style.display = 'none';
        gridViewBtn.classList.add('active');
        tabViewBtn.classList.remove('active');
        
        // 모든 패널 표시
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });
    } else {
        container.classList.remove('grid-view');
        container.classList.add('tab-view');
        tabHeader.style.display = 'flex';
        gridViewBtn.classList.remove('active');
        tabViewBtn.classList.add('active');
        
        // 현재 활성화된 탭의 패널만 표시
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            switchTab(activeTab.dataset.tab);
        } else {
            switchTab('http');
        }
    }
}

// 탭 전환 함수
function switchTab(tabId) {
    // 모든 탭 버튼과 패널에서 active 클래스 제거
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // 선택된 탭과 패널 활성화
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.querySelector(`[data-module="${tabId}"]`).classList.add('active');

    // WebRTC 탭으로 전환 시 ID 표시 업데이트
    if (tabId === 'webrtc') {
        updatePeerIdDisplay();
    }
}

// ID 표시 업데이트 함수
function updatePeerIdDisplay() {
    const peerIdElement = document.getElementById('myPeerId');
    if (peerIdElement) {
        peerIdElement.textContent = myPeerId ? `내 ID: ${myPeerId}` : '내 ID: 연결 중...';
    }
}

// 로그 컨테이너 토글 함수
function toggleLogContainer() {
    const logContainer = document.querySelector('.log-container');
    const logContent = document.getElementById('logContainer');
    const toggleBtn = document.querySelector('.toggle-btn');
    const isVisible = logContent.style.display !== 'none';
    
    if (isVisible) {
        logContent.style.display = 'none';
        document.body.style.paddingBottom = '50px';
        logContainer.style.height = '40px';
        toggleBtn.classList.add('collapsed');
    } else {
        logContent.style.display = 'block';
        document.body.style.paddingBottom = '250px';
        logContainer.style.height = '200px';
        toggleBtn.classList.remove('collapsed');
    }
}

// DOM이 로드된 후 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    // 초기 그리드 뷰 설정
    const container = document.getElementById('mainContainer');
    container.classList.add('grid-view');

    // 탭 버튼 이벤트 리스너
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // 로그 컨테이너 토글 버튼 이벤트 리스너
    document.querySelector('.log-container .toggle-btn').addEventListener('click', function() {
        toggleLogContainer();
    });
}); 