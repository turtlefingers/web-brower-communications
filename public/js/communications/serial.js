import { addLog } from '../utils.js';

let port = null;
let reader = null;
let writer = null;
let readableStreamClosed;
let writableStreamClosed;

// 사용 가능한 시리얼 포트 목록 가져오기
export async function getSerialPorts() {
    try {
        const ports = await navigator.serial.getPorts();
        return ports;
    } catch (error) {
        addLog('Serial', `포트 목록 가져오기 실패: ${error.message}`);
        return [];
    }
}

// 시리얼 포트 선택 및 연결
export async function connectSerialPort() {
    try {
        // 사용자가 포트를 선택하도록 함
        port = await navigator.serial.requestPort();
        
        // 포트 설정 (115200 baud rate)
        await port.open({ baudRate: 115200 });
        
        // 읽기 스트림 설정
        const textDecoder = new TextDecoderStream();
        readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const readableStreamDefaultReader = textDecoder.readable.getReader();
        
        // 쓰기 스트림 설정
        const textEncoder = new TextEncoderStream();
        writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
        writer = textEncoder.writable.getWriter();
        
        // 데이터 읽기 시작
        readSerialData(readableStreamDefaultReader);
        
        addLog('Serial', '시리얼 포트에 연결되었습니다.');
        return true;
    } catch (error) {
        addLog('Serial', `연결 실패: ${error.message}`);
        return false;
    }
}

// 시리얼 포트 연결 해제
export async function disconnectSerialPort() {
    try {
        if (reader) {
            await reader.cancel();
            reader = null;
        }
        if (writer) {
            await writer.close();
            writer = null;
        }
        await readableStreamClosed;
        await writableStreamClosed;
        await port.close();
        port = null;
        addLog('Serial', '시리얼 포트 연결이 해제되었습니다.');
    } catch (error) {
        addLog('Serial', `연결 해제 실패: ${error.message}`);
    }
}

// 시리얼 데이터 읽기
async function readSerialData(reader) {
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                reader.releaseLock();
                break;
            }
            addLog('Serial', `받은 데이터: ${value}`);
        }
    } catch (error) {
        addLog('Serial', `데이터 읽기 실패: ${error.message}`);
    }
}

// 시리얼 데이터 전송
export async function sendSerialMessage(message) {
    if (!writer) {
        addLog('Serial', '시리얼 포트가 연결되어 있지 않습니다.');
        return;
    }
    
    try {
        await writer.write(message + '\n');
        addLog('Serial', `전송: ${message}`);
    } catch (error) {
        addLog('Serial', `전송 실패: ${error.message}`);
    }
}

// 시리얼 포트 상태 확인
export function isSerialConnected() {
    return port !== null;
} 