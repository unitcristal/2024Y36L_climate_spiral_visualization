let data;
let months;

let baseRadius = 100; // 기준 반경
let maxRadius = 400; // 최대 반경

let currentRow = 0; // 데이터의 현재 행
let currentMonth = 0; // 현재 월 인덱스

let previousAnomaly = 0;

const lastYear = 2024; // 마지막 연도
const lastMonth = 8; // 마지막 월 (0부터 시작)

// 중요 참고 anomaly 값들
const referenceAnomalies = [-1, 0, 1, 1.5, 2];

function preload() {
  // 데이터 로드
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

  // 애니메이션 루프 시작
  loop();
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  // 참고 원과 라벨 그리기
  drawReferenceCircles();

  // 월 이름 그리기
  drawMonthLabels();

  // 현재 연도 표시
  let year = data.getRow(currentRow).get("Year");
  textSize(35);
  textAlign(CENTER, CENTER);
  fill(255);
  text(year, 0, 0);

  noFill();
  stroke(255);
  let firstValue = true;

  // anomaly 데이터 그리기
  for (let j = 0; j <= currentRow; j++) {
    let row = data.getRow(j);
    let totalMonths = months.length;
    if (j == currentRow) {
      totalMonths = currentMonth;
    }

    for (let i = 0; i < totalMonths; i++) {
      let anomalyStr = row.getString(months[i]);

      // 유효성 검사
      if (anomalyStr === "***") {
        noLoop();
        return;
      }

      let anomaly = parseFloat(anomalyStr);
      if (isNaN(anomaly)) {
        console.log(
          `Anomaly is not a number for ${row.get("Year")} ${months[i]}`
        );
        continue;
      }

      // anomaly를 반경으로 매핑
      let angle = map(i, 0, months.length, 0, TWO_PI) - PI / 2;
      let prevRadius = mapAnomalyToRadius(previousAnomaly);
      let radius = mapAnomalyToRadius(anomaly);

      let x1 = radius * cos(angle);
      let y1 = radius * sin(angle);
      let x2 = prevRadius * cos(angle - TWO_PI / 12);
      let y2 = prevRadius * sin(angle - TWO_PI / 12);

      // 색상 설정
      let c;
      if (anomaly < 0) {
        c = lerpColor(color(0, 0, 255), color(255), map(anomaly, -1, 0, 0, 1));
      } else {
        c = lerpColor(color(255), color(255, 0, 0), map(anomaly, 0, 2, 0, 1));
      }
      stroke(c);

      if (!firstValue) {
        line(x2, y2, x1, y1);
      }
      firstValue = false;
      previousAnomaly = anomaly;
    }
  }

  // 다음 달로 이동
  currentMonth++;

  // 애니메이션 종료 조건
  if (year == lastYear && currentMonth == lastMonth + 1) {
    noLoop();
    return;
  }

  if (currentMonth == months.length) {
    currentRow++;
    currentMonth = 0;
    if (currentRow == data.getRowCount()) {
      noLoop();
    }
  }

  frameRate(60);
}

function mapAnomalyToRadius(anomaly) {
  // anomaly 값을 반경으로 매핑
  // 참고 anomaly의 최소값과 최대값을 사용
  let minAnomaly = referenceAnomalies[0];
  let maxAnomaly = referenceAnomalies[referenceAnomalies.length - 1];
  return map(anomaly, minAnomaly, maxAnomaly, baseRadius, maxRadius);
}

function drawReferenceCircles() {
  for (let i = 0; i < referenceAnomalies.length; i++) {
    let anomaly = referenceAnomalies[i];
    let radius = mapAnomalyToRadius(anomaly);

    stroke(255);
    strokeWeight(1);
    noFill();
    circle(0, 0, radius * 2);

    fill(255);
    noStroke();
    textSize(15);
    textAlign(LEFT, CENTER);
    text(`${anomaly}°C`, radius + 10, 0);
  }
}

function drawMonthLabels() {
  for (let i = 0; i < months.length; i++) {
    let angle = map(i, 0, months.length, 0, TWO_PI) - PI / 2;
    let x = (maxRadius + 50) * cos(angle);
    let y = (maxRadius + 50) * sin(angle);

    push();
    translate(x, y);
    rotate(angle + HALF_PI);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(22);
    text(months[i], 0, 0);
    pop();
  }
}
