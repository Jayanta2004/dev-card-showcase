let totalSeconds = 0;
let timerInterval = null;
let paused = false;
let gradientIndex = 1;

const timer = document.getElementById("timer");
const alarm = document.getElementById("alarm");

document.getElementById("startBtn").onclick = startTimer;
document.getElementById("pauseBtn").onclick = pauseTimer;
document.getElementById("resumeBtn").onclick = resumeTimer;
document.getElementById("stopBtn").onclick = stopTimer;
document.getElementById("darkModeBtn").onclick = toggleDark;
document.getElementById("gradientBtn").onclick = changeGradient;

function startTimer() {
  const h = +hours.value || 0;
  const m = +minutes.value || 0;
  const s = +seconds.value || 0;

  totalSeconds = h * 3600 + m * 60 + s;
  if (totalSeconds <= 0) return;

  timer.style.display = "block";
  document.getElementById("inputBox").style.display = "none";

  clearInterval(timerInterval);
  updateTimer();

  timerInterval = setInterval(runTimer, 1000);
}

function runTimer() {
  if (!paused) {
    totalSeconds--;
    updateTimer();

    if (totalSeconds < 0) {
      clearInterval(timerInterval);
      timer.textContent = "TIME'S UP!";
      alarm.play();
    }
  }
}

function pauseTimer() {
  paused = true;
}

function resumeTimer() {
  paused = false;
}

function stopTimer() {
  clearInterval(timerInterval);
  paused = false;
  timer.style.display = "none";
  document.getElementById("inputBox").style.display = "block";
}

function updateTimer() {
  let h = Math.floor(totalSeconds / 3600);
  let m = Math.floor((totalSeconds % 3600) / 60);
  let s = totalSeconds % 60;

  timer.textContent =
    `${String(h).padStart(2,'0')} : ${String(m).padStart(2,'0')} : ${String(s).padStart(2,'0')}`;
}

function toggleDark() {
  document.body.classList.toggle("dark");
}

function changeGradient() {
  document.body.classList.remove(`gradient-${gradientIndex}`);
  gradientIndex = gradientIndex % 3 + 1;
  document.body.classList.add(`gradient-${gradientIndex}`);
}
