document.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("progressRing");
const ctx = canvas.getContext("2d");

const timeDisplay = document.getElementById("timeDisplay");
const modeDisplay = document.getElementById("modeDisplay");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const sessionCountEl = document.getElementById("sessionCount");
const totalFocusEl = document.getElementById("totalFocus");
const streakEl = document.getElementById("streak");

let focusDuration = 25 * 60;
let breakDuration = 5 * 60;
let currentTime = focusDuration;
let isRunning = false;
let isFocus = true;
let interval = null;

let sessions = parseInt(localStorage.getItem("sessions")) || 0;
let totalFocus = parseInt(localStorage.getItem("totalFocus")) || 0;
let streak = parseInt(localStorage.getItem("streak")) || 0;

function updateAnalytics() {
  sessionCountEl.textContent = sessions;
  totalFocusEl.textContent = totalFocus + " min";
  streakEl.textContent = streak;
}

function saveAnalytics() {
  localStorage.setItem("sessions", sessions);
  localStorage.setItem("totalFocus", totalFocus);
  localStorage.setItem("streak", streak);
}

function drawProgress() {
  ctx.clearRect(0,0,300,300);

  ctx.lineWidth = 12;
  ctx.strokeStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(150,150,120,0,Math.PI*2);
  ctx.stroke();

  let progress = currentTime / (isFocus ? focusDuration : breakDuration);
  let endAngle = -Math.PI/2 + (1-progress)*Math.PI*2;

  ctx.strokeStyle = isFocus ? "#3b82f6" : "#22c55e";
  ctx.beginPath();
  ctx.arc(150,150,120,-Math.PI/2,endAngle);
  ctx.stroke();
}

function updateDisplay() {
  let minutes = Math.floor(currentTime / 60);
  let seconds = currentTime % 60;
  timeDisplay.textContent =
    String(minutes).padStart(2,"0") + ":" +
    String(seconds).padStart(2,"0");

  modeDisplay.textContent = isFocus ? "Focus" : "Break";
}

function tick() {
  if (currentTime > 0) {
    currentTime--;
  } else {
    if (isFocus) {
      sessions++;
      totalFocus += 25;
      streak++;
      saveAnalytics();
    }

    isFocus = !isFocus;
    currentTime = isFocus ? focusDuration : breakDuration;
  }

  updateDisplay();
  drawProgress();
}

startBtn.addEventListener("click", () => {
  if (!isRunning) {
    interval = setInterval(tick,1000);
    isRunning = true;
  }
});

pauseBtn.addEventListener("click", () => {
  clearInterval(interval);
  isRunning = false;
});

resetBtn.addEventListener("click", () => {
  clearInterval(interval);
  isRunning = false;
  currentTime = focusDuration;
  isFocus = true;
  updateDisplay();
  drawProgress();
});

updateAnalytics();
updateDisplay();
drawProgress();

});