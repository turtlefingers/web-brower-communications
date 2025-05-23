// 부저 제어 예제
const int buzzerPin = 0;  // 부저가 연결된 핀 번호
int delayTime = 1000;   // 기본 딜레이 시간 (1초)

void setup() {
  pinMode(buzzerPin, OUTPUT);  // 부저 핀을 출력으로 설정
  Serial.begin(115200);     // 시리얼 통신 시작 (115200 baud rate)
  Serial.println("Arduino 부저 제어 시작!");
}

void loop() {
  // 시리얼 데이터가 있으면 읽기
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    int newDelay = input.toInt();
    if (newDelay > 0) {
      delayTime = newDelay;
      Serial.print("딜레이 시간이 ");
      Serial.print(delayTime);
      Serial.println("ms로 변경되었습니다.");
    }
  }

  digitalWrite(buzzerPin, HIGH);  // 부저 켜기
  Serial.println("부저 ON :" + String(delayTime));
  delay(delayTime);            // 설정된 시간만큼 대기
  
  digitalWrite(buzzerPin, LOW);   // 부저 끄기
  Serial.println("부저 OFF :" + String(delayTime));
  delay(delayTime);            // 설정된 시간만큼 대기
} 