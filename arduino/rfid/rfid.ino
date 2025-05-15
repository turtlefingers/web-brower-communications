/*
 * RFID-RC522 for Arduino Nano 33 BLE
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

#define SS_PIN D10
#define RST_PIN D9
 
MFRC522 rfid(SS_PIN, RST_PIN); // MFRC522 인스턴스 생성

// 새로운 NUID를 저장할 배열
byte nuidPICC[4];

// 부저 빈도
const int ledPin = 0;  // 부저가 연결된 핀 번호
int delayTime = 1000;   // 기본 딜레이 시간 (1초)
const int BEEP_DURATION = 2000;  // 전체 부저음 지속 시간 (2초)

// 저장된 카드 ID
const String CARD_ID_1 = "839D01BE";  // 첫 번째 카드
const String CARD_ID_2 = "A072CB53";  // 두 번째 카드

void setup() { 
  Serial.begin(9600);
  while (!Serial);  // 시리얼 포트가 준비될 때까지 대기 (Nano 33 BLE 필수)
  
  SPI.begin(); // SPI 버스 초기화
  rfid.PCD_Init(); // MFRC522 초기화

  // 부저 핀 설정 및 초기화
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);  // 부저 초기 상태를 끔으로 설정

  Serial.println(F("MIFARE Classic NUID 스캔을 시작합니다."));
  Serial.print(F("카드 리더 펌웨어 버전: 0x"));
  Serial.println(rfid.PCD_ReadRegister(rfid.VersionReg), HEX);
}

void playBuzzer(int frequency) {
  unsigned long startTime = millis();
  while (millis() - startTime < BEEP_DURATION) {
    digitalWrite(ledPin, HIGH);
    delay(frequency);
    digitalWrite(ledPin, LOW);
    delay(frequency);
  }
}

void loop() {
  // 새로운 카드가 없으면 루프 재시작
  if (!rfid.PICC_IsNewCardPresent())
    return;

  // NUID를 읽지 못했다면 루프 재시작
  if (!rfid.PICC_ReadCardSerial())
    return;

  Serial.print(F("PICC 타입: "));
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  Serial.println(rfid.PICC_GetTypeName(piccType));

  // MIFARE Classic 타입 체크
  if (piccType != MFRC522::PICC_TYPE_MIFARE_MINI &&  
    piccType != MFRC522::PICC_TYPE_MIFARE_1K &&
    piccType != MFRC522::PICC_TYPE_MIFARE_4K) {
    Serial.println(F("이 태그는 MIFARE Classic 타입이 아닙니다."));
    return;
  }

  // 전체 UID를 하나의 문자열로 출력
  Serial.print(F("카드 ID: "));
  String cardID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      cardID += "0";
    }
    cardID += String(rfid.uid.uidByte[i], HEX);
  }
  cardID.toUpperCase();
  Serial.println(cardID);

  // 카드 ID에 따라 다른 부저 소리 출력
  if (cardID == CARD_ID_1) {
    delayTime = 100;  // 첫 번째 카드: 100ms (빠른 비프음)
    Serial.println("카드 1 감지 - 빠른 비프음");
  } else if (cardID == CARD_ID_2) {
    delayTime = 500;  // 두 번째 카드: 500ms (느린 비프음)
    Serial.println("카드 2 감지 - 느린 비프음");
  } else {
    delayTime = 1000; // 기타 카드: 1초 (매우 느린 비프음)
    Serial.println("미등록 카드 감지 - 기본 비프음");
  }
  playBuzzer(delayTime);

  // NUID를 nuidPICC 배열에 저장
  for (byte i = 0; i < 4; i++) {
    nuidPICC[i] = rfid.uid.uidByte[i];
  }

  // 카드 메모리 용량 출력
  String cardSize = "";
  if (piccType == MFRC522::PICC_TYPE_MIFARE_MINI) {
    cardSize = "MIFARE Mini (320 bytes)";
  } else if (piccType == MFRC522::PICC_TYPE_MIFARE_1K) {
    cardSize = "MIFARE 1K (1024 bytes)";
  } else if (piccType == MFRC522::PICC_TYPE_MIFARE_4K) {
    cardSize = "MIFARE 4K (4096 bytes)";
  }
  Serial.println("카드 타입: " + cardSize);
  Serial.println("------------------------");

  // PICC 정지
  rfid.PICC_HaltA();

  // 암호화 정지
  rfid.PCD_StopCrypto1();
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
