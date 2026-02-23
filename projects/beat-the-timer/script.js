// ================= GAME STATE =================
const TOTAL_ROUNDS = 5;

let state = {
  running: false,
  round: 1,
  score: 0,
  target: 0,
  startTime: 0,
  rafId: null
};

// ================= DOM =================
const timerEl = document.getElementById("timer");
const targetEl = document.getElementById("targetTime");
const roundEl = document.getElementById("round");
const scoreEl = document.getElementById("score");
const resultEl = document.getElementById("result");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const difficultySelect = document.getElementById("difficulty");
const highScoreEl = document.getElementById("highScore");

// ================= STORAGE =================
let highScore = Number(localStorage.getItem("beatTimerHighScore")) || 0;
highScoreEl.textContent = highScore;

// ================= UTIL =================
function getTargetTime(difficulty) {
  if (difficulty === "easy") return Math.random() * 2 + 2;
  if (difficulty === "medium") return Math.random() * 1.5 + 3;
  return Math.random() * 1 + 4;
}

// ================= TIMER =================
function updateTimer() {
  const elapsed = (performance.now() - state.startTime) / 1000;
  timerEl.textContent = elapsed.toFixed(2);
  state.rafId = requestAnimationFrame(updateTimer);
}

// ================= GAME LOGIC =================
function startRound() {
  if (state.running) return;

  state.running = true;
  state.target = getTargetTime(difficultySelect.value);
  targetEl.textContent = state.target.toFixed(2);
  resultEl.textContent = "";

  state.startTime = performance.now();
  timerEl.textContent = "0.00";

  startBtn.disabled = true;
  stopBtn.disabled = false;

  updateTimer();
}

function stopRound() {
  if (!state.running) return;

  cancelAnimationFrame(state.rafId);
  state.running = false;

  const elapsed = Number(timerEl.textContent);
  const diff = Math.abs(elapsed - state.target);

  let roundScore = Math.max(0, Math.round(100 - diff * 200));
  state.score += roundScore;

  let feedback =
    diff <= 0.05 ? "🎯 PERFECT!" :
    diff <= 0.15 ? "🔥 GREAT!" :
    "❌ MISS!";

  resultEl.textContent =
    `${feedback} Off by ${diff.toFixed(2)}s (+${roundScore})`;

  scoreEl.textContent = state.score;

  if (state.score > highScore) {
    highScore = state.score;
    localStorage.setItem("beatTimerHighScore", highScore);
    highScoreEl.textContent = highScore;
  }

  state.round++;
  roundEl.textContent = Math.min(state.round, TOTAL_ROUNDS);

  startBtn.disabled = state.round > TOTAL_ROUNDS;
  stopBtn.disabled = true;

  if (state.round > TOTAL_ROUNDS) {
    resultEl.textContent += " 🏁 Game Over!";
  }
}

function resetGame() {
  cancelAnimationFrame(state.rafId);
  state = { running: false, round: 1, score: 0 };
  timerEl.textContent = "0.00";
  targetEl.textContent = "0.00";
  scoreEl.textContent = "0";
  roundEl.textContent = "1";
  resultEl.textContent = "";
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

// ================= EVENTS =================
startBtn.addEventListener("click", startRound);
stopBtn.addEventListener("click", stopRound);
resetBtn.addEventListener("click", resetGame);

// Keyboard support
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !startBtn.disabled) startRound();
  if (e.code === "Enter" && !stopBtn.disabled) stopRound();
});
