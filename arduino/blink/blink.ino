// LED 깜빡임 예제
const int ledPin = 13;  // LED가 연결된 핀 번호
int delayTime = 1000;   // 기본 딜레이 시간 (1초)

void setup() {
  pinMode(ledPin, OUTPUT);  // LED 핀을 출력으로 설정
  Serial.begin(115200);     // 시리얼 통신 시작 (115200 baud rate)
  Serial.println("Arduino LED 깜빡임 시작!");
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

  digitalWrite(ledPin, HIGH);  // LED 켜기
  Serial.println("LED ON :"+String(delayTime));
  delay(delayTime);            // 설정된 시간만큼 대기
  
  digitalWrite(ledPin, LOW);   // LED 끄기
  Serial.println("LED OFF :"+String(delayTime));
  delay(delayTime);            // 설정된 시간만큼 대기
} 