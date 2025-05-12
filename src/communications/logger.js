let logs = [];
let io = null;

function createLogger() {
    function setIO(socketIO) {
        io = socketIO;
    }

    function addLog(type, message) {
        const log = {
            timestamp: new Date().toISOString(),
            type,
            message
        };
        logs.push(log);
        console.log(`[${log.timestamp}]${type!==''?` ${type} :`:''} ${message}`);
        if (io) {
            io.emit('log', log);
        }
    }

    function getLogs() {
        return logs;
    }

    return {
        addLog,
        getLogs,
        setIO
    };
}

// 싱글톤 인스턴스 생성
const logger = createLogger();
module.exports = logger; 