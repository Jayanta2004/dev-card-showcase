const cpuValue = document.getElementById("cpuValue");
const memoryValue = document.getElementById("memoryValue");
const networkValue = document.getElementById("networkValue");

const cpuBar = document.getElementById("cpuBar");
const memoryBar = document.getElementById("memoryBar");
const networkBar = document.getElementById("networkBar");

const alertsDiv = document.getElementById("alerts");

const cpuCtx = document.getElementById("cpuChart").getContext("2d");
const memoryCtx = document.getElementById("memoryChart").getContext("2d");

let cpuData = [];
let memoryData = [];

function randomValue() {
  return Math.floor(Math.random() * 100);
}

function updateSystem() {
  const cpu = randomValue();
  const memory = randomValue();
  const network = randomValue();

  updateMetric(cpuValue, cpuBar, cpu);
  updateMetric(memoryValue, memoryBar, memory);
  updateMetric(networkValue, networkBar, network);

  pushData(cpuData, cpu);
  pushData(memoryData, memory);

  drawLine(cpuCtx, cpuData);
  drawLine(memoryCtx, memoryData);

  if (cpu > 85) addAlert("High CPU usage detected");
  if (memory > 85) addAlert("High Memory usage detected");
}

function updateMetric(valueEl, barEl, val) {
  valueEl.textContent = val + "%";
  barEl.style.width = val + "%";
}

function pushData(arr, val) {
  if (arr.length > 25) arr.shift();
  arr.push(val);
}

function drawLine(ctx, data) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;

  data.forEach((val, i) => {
    const x = (canvas.width / 25) * i;
    const y = canvas.height - (val / 100) * canvas.height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function addAlert(message) {
  const div = document.createElement("div");
  div.className = "alert";
  div.textContent = message;
  alertsDiv.prepend(div);

  setTimeout(() => div.remove(), 4000);
}

setInterval(updateSystem, 2000);
