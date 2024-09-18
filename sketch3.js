let data;
let months;

let minusOneRadius = 100; // -1도 반경
let zeroRadius = minusOneRadius * 2; // 0도 반경
let oneRadius = minusOneRadius * 3; // 1도 반경
let onePointFiveRadius = oneRadius + minusOneRadius * 0.5; // 1.5도 반경

let currentRow = 0; // Row는 0에서 시작
let currentMonth = 0; // Month도 0에서 시작 ("Jan"부터 시작)
let previousAnomaly = 0;

const lastYear = 2024; // 마지막 연도 (2024)
const lastMonth = 8; // 마지막 달 (Sep의 인덱스는 8)
const weird_v = 1.5;

let logData = []; // 로그 데이터를 저장할 배열

function preload() {
  // 데이터를 로드하는 부분
  data = loadTable("glb_temp.csv", "csv", "header");
}

function setup() {
  createCanvas(900, 900);

  // 월 배열 정의
  months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  console.log("Rows in data:", data.getRowCount());
  loop(); // draw() 함수가 계속 호출되도록 설정
}

function draw() {
  background(0); // 검정 배경
  translate(width / 2, height / 2);

  // 원 그리기
  stroke(255);
  strokeWeight(2);
  noFill();
  circle(0, 0, minusOneRadius * 2); // -1도 원
  circle(0, 0, zeroRadius * 2); // 0도 원
  circle(0, 0, oneRadius * 2); // 1도 원
  circle(0, 0, onePointFiveRadius * 2); // 1.5도 원

  // 월 이름을 원 주변에 배치
  for (let i = 0; i < months.length; i++) {
    let angle = map(i, 0, months.length, 0, TWO_PI) - PI / 3;
    let x = 390 * cos(angle);
    let y = 390 * sin(angle);
    push();
    translate(x, y);
    rotate(angle + HALF_PI);
    fill(255);
    textAlign(CENTER, CENTER);
    text(months[i], 0, 0);
    pop();
  }

  // 가운데 연도 표시
  let year = data.getRow(currentRow).get("Year");
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(35);
  text(year, 0, 0);

  noFill();
  stroke(255);
  let firstValue = true;

  // anomaly 데이터 그리기
  for (let j = 0; j < currentRow; j++) {
    let row = data.getRow(j);
    let totalMonths = months.length;

    if (j == currentRow - 1) {
      totalMonths = currentMonth;
    }

    for (let i = 0; i < totalMonths; i++) {
      let anomaly = row.getString(months[i]);

      // 로그 데이터 추가
      logData.push(
        `Year: ${row.get("Year")}, Month: ${months[i]}, Anomaly: ${anomaly}`
      );

      // anomaly가 ***일 경우 시각화를 멈춤
      if (anomaly === "***") {
        console.log("Encountered '***', stopping the visualization.");
        noLoop();
        saveStrings(logData, "visualization_log.txt"); // 로그 파일 저장
        return;
      }

      anomaly = parseFloat(anomaly);
      if (isNaN(anomaly)) {
        logData.push(
          `Anomaly is not a number for ${row.get("Year")} ${months[i]}`
        );
        continue;
      }

      // 그 외 anomaly 값에 따른 시각화 처리 추가 가능
    }
  }

  // 다음 달로 이동
  currentMonth = currentMonth + 1;

  // 마지막 연도와 마지막 달에 도달했을 경우 시각화를 멈춤
  if (year == lastYear && currentMonth == lastMonth + 1) {
    noLoop();
    saveStrings(logData, "visualization_log.txt"); // 로그 파일 저장
    return;
  }

  // 연도 넘어가는 처리
  if (currentMonth == months.length) {
    currentRow = currentRow + 1;
    currentMonth = 0;
    if (currentRow == data.getRowCount()) {
      noLoop();
      saveStrings(logData, "visualization_log.txt"); // 로그 파일 저장
    }
  }

  frameRate(60);
}
