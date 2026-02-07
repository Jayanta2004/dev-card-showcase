let interval;
let debt = 20;
let speedData = [];
let bugData = [];

const debtSlider = document.getElementById("debtSlider");
const refactorSlider = document.getElementById("refactorSlider");
const debtValue = document.getElementById("debtValue");
const refactorValue = document.getElementById("refactorValue");

const speedEl = document.getElementById("speed");
const bugsEl = document.getElementById("bugs");
const complexityEl = document.getElementById("complexity");
const debtDisplay = document.getElementById("debtDisplay");
const debtBar = document.getElementById("debtBar");

const ctx = document.getElementById("trendChart").getContext("2d");

debtSlider.oninput = () => {
  debtValue.textContent = debtSlider.value + "%";
};

refactorSlider.oninput = () => {
  refactorValue.textContent = refactorSlider.value + "%";
};

function startSimulation() {
  clearInterval(interval);

  debt = parseInt(debtSlider.value);
  let refactor = parseInt(refactorSlider.value);

  interval = setInterval(() => {

    // Increase debt if no refactor
    debt += (100 - refactor) * 0.02;
    debt -= refactor * 0.05;

    if (debt < 0) debt = 0;
    if (debt > 100) debt = 100;

    let speed = 100 - debt;
    let bugs = debt * 0.8;
    let complexity = debt * 1.2;

    speedEl.textContent = speed.toFixed(0);
    bugsEl.textContent = bugs.toFixed(0);
    complexityEl.textContent = complexity.toFixed(0);

    debtDisplay.textContent = debt.toFixed(0) + "%";
    debtBar.style.width = debt + "%";

    pushData(speedData, speed);
    pushData(bugData, bugs);

    drawChart();

  }, 1000);
}

function pushData(arr, val) {
  if (arr.length > 50) arr.shift();
  arr.push(val);
}

function drawChart() {
  ctx.clearRect(0, 0, 800, 250);

  drawLine(speedData, "#22c55e");
  drawLine(bugData, "#ef4444");
}

function drawLine(data, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  data.forEach((val, i) => {
    let x = (800 / 50) * i;
    let y = 250 - (val / 120) * 250;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function reset() {
  clearInterval(interval);
  speedData = [];
  bugData = [];
  ctx.clearRect(0, 0, 800, 250);
}
