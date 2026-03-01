const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");

canvas.width = 650;
canvas.height = 300;

const stressSlider = document.getElementById("stressRange");
const stressValue = document.getElementById("stressValue");
const insightBox = document.getElementById("insightBox");
const simulateBtn = document.getElementById("simulateBtn");
const resetBtn = document.getElementById("resetBtn");

let stress = 40;
let simInterval = null;

function performanceCurve(x) {
  const peak = 60;
  return -0.002 * Math.pow(x - peak, 2) + 1;
}

function drawGraph(currentStress) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Zones
  ctx.fillStyle = "rgba(0,150,255,0.15)";
  ctx.fillRect(0, 0, canvas.width * 0.3, canvas.height);

  ctx.fillStyle = "rgba(0,255,100,0.15)";
  ctx.fillRect(canvas.width * 0.3, 0, canvas.width * 0.4, canvas.height);

  ctx.fillStyle = "rgba(255,80,80,0.15)";
  ctx.fillRect(canvas.width * 0.7, 0, canvas.width * 0.3, canvas.height);

  // Curve
  ctx.beginPath();
  ctx.strokeStyle = "#00c6ff";
  ctx.lineWidth = 3;

  for (let x = 0; x <= 100; x++) {
    let perf = performanceCurve(x);
    let canvasX = (x / 100) * canvas.width;
    let canvasY = canvas.height - perf * canvas.height * 0.9;

    if (x === 0) ctx.moveTo(canvasX, canvasY);
    else ctx.lineTo(canvasX, canvasY);
  }
  ctx.stroke();

  // Current stress dot
  let perf = performanceCurve(currentStress);
  let dotX = (currentStress / 100) * canvas.width;
  let dotY = canvas.height - perf * canvas.height * 0.9;

  ctx.beginPath();
  ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  updateInsight(currentStress);
}

function updateInsight(value) {
  if (value < 30) {
    insightBox.textContent = "Low stress: You may feel bored or unmotivated.";
    insightBox.style.background = "rgba(0,150,255,0.3)";
  } else if (value < 70) {
    insightBox.textContent = "Optimal stress: Peak performance zone!";
    insightBox.style.background = "rgba(0,200,100,0.3)";
  } else {
    insightBox.textContent = "High stress: Risk of burnout.";
    insightBox.style.background = "rgba(255,80,80,0.3)";
  }
}

stressSlider.addEventListener("input", () => {
  stress = parseInt(stressSlider.value);
  stressValue.textContent = stress;
  drawGraph(stress);
});

simulateBtn.addEventListener("click", () => {
  if (simInterval) return;

  simInterval = setInterval(() => {
    stress = Math.floor(Math.random() * 100);
    stressSlider.value = stress;
    stressValue.textContent = stress;
    drawGraph(stress);
  }, 800);
});

resetBtn.addEventListener("click", () => {
  clearInterval(simInterval);
  simInterval = null;
  stress = 40;
  stressSlider.value = stress;
  stressValue.textContent = stress;
  drawGraph(stress);
});

drawGraph(stress);
