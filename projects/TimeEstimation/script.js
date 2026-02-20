let startTime;
let timerInterval;

const display = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const result = document.getElementById("result");

startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", stopGame);
resetBtn.addEventListener("click", resetGame);

function startGame() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 10);

  startBtn.disabled = true;
  stopBtn.disabled = false;
  result.textContent = "";
}

function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  display.textContent = elapsed.toFixed(2);
}

function stopGame() {
  clearInterval(timerInterval);
  const finalTime = parseFloat(display.textContent);
  const diff = Math.abs(10 - finalTime).toFixed(2);

  let message = "";

  if (diff < 0.2) {
    message = "🎯 Perfect! Amazing sense of time!";
  } else if (diff < 0.5) {
    message = "👏 Very close!";
  } else if (diff < 1) {
    message = "🙂 Not bad!";
  } else {
    message = "😅 Way off! Try again!";
  }

  result.innerHTML = `
    ⏱ Your Time: <b>${finalTime}s</b><br>
    📏 Difference: <b>${diff}s</b><br>
    ${message}
  `;

  stopBtn.disabled = true;
}

function resetGame() {
  clearInterval(timerInterval);
  display.textContent = "0.00";
  result.textContent = "";
  startBtn.disabled = false;
  stopBtn.disabled = true;
}
