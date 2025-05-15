/*
 * RFID-RC522 with BLE for Arduino Nano 33 BLE
 * Pin layout:
 * -----------------------------------------------------------------------------------------
 *             MFRC522      Arduino Nano 33 BLE
 * Signal      Pin          Pin
 * -----------------------------------------------------------------------------------------
 * RST/Reset   RST          D9
 * SPI SS      SDA(SS)      D10
 * SPI MOSI    MOSI         D11 / COPI
 * SPI MISO    MISO         D12 / CIPO
 * SPI SCK     SCK          D13 / SCK
 */

#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoBLE.h>

#define SS_PIN D10
#define RST_PIN D9
 
MFRC522 rfid(SS_PIN, RST_PIN); // MFRC522 인스턴스 생성

// BLE 서비스 및 특성 UUID
BLEService rfidService("0000ffe0-0000-1000-8000-00805f9b34fb");
BLEStringCharacteristic rfidCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb", BLERead | BLENotify, 50);

// 새로운 NUID를 저장할 배열
byte nuidPICC[4];

// 부저 설정
const int ledPin = 0;  // 부저가 연결된 핀 번호
const int BEEP_DURATION = 100;  // 부저음 지속 시간 (100ms)

// 저장된 카드 ID
const String CARD_ID_1 = "839D01BE";  // 첫 번째 카드
const String CARD_ID_2 = "A072CB53";  // 두 번째 카드

void setup() { 
  Serial.begin(9600);
  while (!Serial);  // 시리얼 포트가 준비될 때까지 대기 (Nano 33 BLE 필수)
  
  // BLE 초기화
  if (!BLE.begin()) {
    Serial.println("BLE 초기화 실패!");
    while (1);
  }

  // BLE 설정
  BLE.setLocalName("RFID Reader");
  BLE.setAdvertisedService(rfidService);
  rfidService.addCharacteristic(rfidCharacteristic);
  BLE.addService(rfidService);

  // BLE 광고 시작
  BLE.advertise();
  Serial.println("BLE 광고 시작 - RFID Reader");
  
  // SPI 및 RFID 초기화
  SPI.begin(); // SPI 버스 초기화
  rfid.PCD_Init(); // MFRC522 초기화

  // 부저 핀 설정 및 초기화
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);  // 부저 초기 상태를 끔으로 설정

  Serial.println(F("MIFARE Classic NUID 스캔을 시작합니다."));
  Serial.print(F("카드 리더 펌웨어 버전: 0x"));
  Serial.println(rfid.PCD_ReadRegister(rfid.VersionReg), HEX);
}

void playBuzzer() {
  digitalWrite(ledPin, HIGH);
  delay(BEEP_DURATION);
  digitalWrite(ledPin, LOW);
}

void loop() {
  // BLE 연결 관리
  BLEDevice central = BLE.central();
  
  if (central) {
    Serial.print("연결됨: ");
    Serial.println(central.address());
    
    while (central.connected()) {
      // 새로운 카드가 없으면 계속 검사
      if (!rfid.PICC_IsNewCardPresent())
        continue;

      // NUID를 읽지 못했다면 계속 검사
      if (!rfid.PICC_ReadCardSerial())
        continue;

      // MIFARE Classic 타입 체크
      MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
      if (piccType != MFRC522::PICC_TYPE_MIFARE_MINI &&  
        piccType != MFRC522::PICC_TYPE_MIFARE_1K &&
        piccType != MFRC522::PICC_TYPE_MIFARE_4K) {
        continue;
      }

      // 카드 ID 생성
      String cardID = "";
      for (byte i = 0; i < rfid.uid.size; i++) {
        if (rfid.uid.uidByte[i] < 0x10) {
          cardID += "0";
        }
        cardID += String(rfid.uid.uidByte[i], HEX);
      }
      cardID.toUpperCase();
      
      // JSON 형식으로 변환 (문자열 길이 확인)
      String jsonData = "{\"cardId\":\"" + cardID + "\"}";
      Serial.print("JSON 길이: ");
      Serial.println(jsonData.length());
      Serial.print("JSON 데이터: ");
      Serial.println(jsonData);
      
      // BLE를 통해 전송
      bool success = rfidCharacteristic.writeValue(jsonData);
      
      // 전송 결과 확인
      if (success) {
        Serial.println("BLE 전송 성공");
      } else {
        Serial.println("BLE 전송 실패");
      }

      // 부저 재생
      playBuzzer();

      // PICC 정지
      rfid.PICC_HaltA();

      // 암호화 정지
      rfid.PCD_StopCrypto1();
    }
    
    Serial.print("연결 해제됨: ");
    Serial.println(central.address());
  }
  
  // BLE 이벤트 처리
  BLE.poll();
}

// 바이트 배열을 16진수로 출력하는 헬퍼 함수
void printHex(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(buffer[i] < 0x10 ? " 0" : " ");
    Serial.print(buffer[i], HEX);
  }
}

// 바이트 배열을 10진수로 출력하는 헬퍼 함수
void printDec(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(' ');
    Serial.print(buffer[i], DEC);
  }
}
