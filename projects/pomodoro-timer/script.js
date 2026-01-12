const timerDisplay = document.getElementById("timer");
const modeDisplay = document.getElementById("mode");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

let timeLeft = WORK_TIME;
let isRunning = false;
let isWorkSession = true;
let interval = null;

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = 
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  interval = setInterval(() => {
    timeLeft--;

    if (timeLeft <= 0) {
      switchSession();
    }

    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(interval);
}

function resetTimer() {
  pauseTimer();
  isWorkSession = true;
  timeLeft = WORK_TIME;
  modeDisplay.textContent = "Work Session";
  updateDisplay();
}

function switchSession() {
  pauseTimer();
  isWorkSession = !isWorkSession;
  timeLeft = isWorkSession ? WORK_TIME : BREAK_TIME;
  modeDisplay.textContent = isWorkSession ? "Work Session" : "Break Time";
  startTimer();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
