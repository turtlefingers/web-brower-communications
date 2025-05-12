const mqtt = require('mqtt');

function setupMQTTClient(addLog) {
    let mqttClient;
    let mqttRetryCount = 0;
    let mqttInitialized = false;

    function initializeMQTT() {
        try {
            mqttClient = mqtt.connect('mqtt://localhost:1883', {
                connectTimeout: 5000,
                reconnectPeriod: 1000
            });

            mqttClient.on('connect', () => {
                if (!mqttInitialized) {
                    addLog('MQTT', 'MQTT 브로커에 연결되었습니다');
                    mqttInitialized = true;
                }
                mqttClient.subscribe('test/topic');
                mqttRetryCount = 0;
            });

            mqttClient.on('message', (topic, message) => {
                addLog('MQTT', `Received on ${topic}: ${message.toString()}`);
            });

            mqttClient.on('error', (error) => {
                if (mqttRetryCount === 0) {
                    addLog('MQTT', 'MQTT 브로커 연결 시도 중...');
                }
                mqttRetryCount++;
            });

            mqttClient.on('close', () => {
                if (mqttInitialized) {
                    addLog('MQTT', 'MQTT 브로커 연결이 끊어졌습니다. 재연결을 시도합니다...');
                    mqttInitialized = false;
                }
            });

            global.mqttClient = mqttClient;
        } catch (error) {
            if (!mqttInitialized) {
                addLog('MQTT', `MQTT 클라이언트 초기화 실패: ${error.message}`);
            }
        }
    }

    initializeMQTT();
    return mqttClient;
}

module.exports = setupMQTTClient; 