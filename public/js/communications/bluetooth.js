import { addLog } from '../utils.js';

let bluetoothDevice = null;
let bluetoothCharacteristic = null;

// 블루투스 API 지원 여부 확인
function checkBluetoothSupport() {
    if (!navigator.bluetooth) {
        addLog('Bluetooth', '이 브라우저는 Web Bluetooth API를 지원하지 않습니다. Chrome, Edge, Opera 브라우저를 사용해주세요.');
        return false;
    }
    return true;
}

// 블루투스 장치 연결
export async function connectBluetooth() {
    if (!checkBluetoothSupport()) {
        return;
    }

    try {
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [
                { namePrefix: 'Arduino' }
            ],
            optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
        });

        addLog('Bluetooth', `장치 연결됨: ${bluetoothDevice.name}`);

        const server = await bluetoothDevice.gatt.connect();
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        bluetoothCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

        // 데이터 수신 리스너 설정
        bluetoothCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        await bluetoothCharacteristic.startNotifications();

        addLog('Bluetooth', '서비스 및 특성 연결 완료');
    } catch (error) {
        addLog('Bluetooth', `연결 오류: ${error.message}`);
    }
}

// 블루투스 연결 해제
export async function disconnectBluetooth() {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
        try {
            await bluetoothDevice.gatt.disconnect();
            bluetoothDevice = null;
            bluetoothCharacteristic = null;
            addLog('Bluetooth', '연결 해제됨');
        } catch (error) {
            addLog('Bluetooth', `연결 해제 오류: ${error.message}`);
        }
    }
}

// 숫자값 전송
export async function sendBluetoothNumber() {
    const number = parseInt(document.getElementById('bluetoothNumber').value);

    if (!bluetoothCharacteristic) {
        addLog('Bluetooth', '장치가 연결되어 있지 않습니다.');
        return;
    }

    try {
        // 숫자를 문자열로 변환 후 바이트 배열로 변환
        const data = new TextEncoder().encode(number.toString());
        await bluetoothCharacteristic.writeValue(data);
        addLog('Bluetooth', `전송: ${number}`);
    } catch (error) {
        addLog('Bluetooth', `전송 오류: ${error.message}`);
    }
}

// 메시지 전송
export async function sendBluetoothMessage() {
    if (!bluetoothCharacteristic) {
        addLog('Bluetooth', '장치가 연결되어 있지 않습니다.');
        return;
    }

    const message = document.getElementById('bluetoothMessage').value;
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message + '\n');
        await bluetoothCharacteristic.writeValue(data);
        addLog('Bluetooth', `전송: ${message}`);
    } catch (error) {
        addLog('Bluetooth', `전송 오류: ${error.message}`);
    }
}

// 데이터 수신 처리
function handleCharacteristicValueChanged(event) {
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const message = decoder.decode(value);
    addLog('Bluetooth', `수신: ${message}`);
} 