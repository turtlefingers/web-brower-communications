#include <ArduinoBLE.h>

// LED 핀 설정
const int ledPin = LED_BUILTIN;
int delayTime = 1000;   // 기본 딜레이 시간 (1초)

// BLE 서비스 및 특성 UUID
BLEService ledService("0000ffe0-0000-1000-8000-00805f9b34fb");
BLEByteCharacteristic ledCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb", BLEWrite | BLENotify);

// 문자열 버퍼
String inputBuffer = "";

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);

  // BLE 초기화
  if (!BLE.begin()) {
    Serial.println("BLE 초기화 실패!");
    while (1);
  }

  // BLE 설정
  BLE.setLocalName("Arduino Nano 33 BLE");
  BLE.setAdvertisedService(ledService);
  ledService.addCharacteristic(ledCharacteristic);
  BLE.addService(ledService);
  ledCharacteristic.writeValue(0);

  // BLE 광고 시작
  BLE.advertise();
  Serial.println("BLE 광고 시작");
}

void loop() {
  BLE.poll();

  // BLE 연결 대기
  BLEDevice central = BLE.central();
  if (central) {
    Serial.print("연결됨: ");
    Serial.println(central.address());

    // 연결이 유지되는 동안
    while (central.connected()) {
      // 특성 값이 변경되었는지 확인
      if (ledCharacteristic.written()) {
        char receivedChar = (char)ledCharacteristic.value();
        
        // 0-9 사이의 문자를 받으면 0-900ms로 매핑
        if (receivedChar >= '0' && receivedChar <= '9') {
          int digit = receivedChar - '0';  // ASCII 값을 실제 숫자로 변환
          delayTime = digit * 100;  // 0-9를 0-900ms로 매핑
          Serial.print("딜레이 시간이 ");
          Serial.print(delayTime);
          Serial.println("ms로 변경되었습니다.");
        }
      }

      // LED 깜빡임
      digitalWrite(ledPin, HIGH);
      delay(delayTime);
      digitalWrite(ledPin, LOW);
      delay(delayTime);
    }

    Serial.print("연결 해제됨: ");
    Serial.println(central.address());
  }
} 