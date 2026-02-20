let workTime = 25 * 60;
let breakTime = 5 * 60;
let timeLeft = workTime;
let timer;
let isRunning = false;
let isWork = true;
let session = 1;

const timeDisplay = document.getElementById("time");
const modeDisplay = document.getElementById("mode");
const sessionDisplay = document.getElementById("session");
const alarm = document.getElementById("alarm");

document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", pauseTimer);
document.getElementById("reset").addEventListener("click", resetTimer);

function updateDisplay() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  timeDisplay.textContent =
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      alarm.play();
      clearInterval(timer);
      isRunning = false;

      if (isWork) {
        modeDisplay.textContent = "Break Time ☕";
        timeLeft = breakTime;
        isWork = false;
      } else {
        modeDisplay.textContent = "Focus Time 📚";
        timeLeft = workTime;
        isWork = true;
        session++;
        sessionDisplay.textContent = `Session: ${session}`;
      }

      updateDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isWork = true;
  timeLeft = workTime;
  session = 1;
  modeDisplay.textContent = "Focus Time";
  sessionDisplay.textContent = "Session: 1";
  updateDisplay();
}

updateDisplay();
