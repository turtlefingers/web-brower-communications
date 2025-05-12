// 로그 표시 함수
export function addLog(type, message) {
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

// 로그 컨테이너 높이 조절 기능
export function initLogContainerResize() {
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