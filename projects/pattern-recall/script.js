const cells = document.querySelectorAll(".cell");
const startBtn = document.getElementById("startBtn");
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");

let pattern = [];
let userInput = [];
let level = 1;
let score = 0;
let canPlay = false;

cells.forEach(cell => cell.addEventListener("click", handleClick));
startBtn.addEventListener("click", startGame);

function startGame() {
  pattern = [];
  userInput = [];
  level = 1;
  score = 0;
  updateHUD();
  startBtn.disabled = true;
  statusEl.textContent = "Watch the pattern";
  nextRound();
}

function nextRound() {
  canPlay = false;
  userInput = [];
  pattern.push(Math.floor(Math.random() * cells.length));
  playPattern();
}

function playPattern() {
  let i = 0;
  const interval = setInterval(() => {
    flash(cells[pattern[i]]);
    i++;
    if (i >= pattern.length) {
      clearInterval(interval);
      canPlay = true;
      statusEl.textContent = "Your turn";
    }
  }, 650);
}

function flash(cell) {
  cell.classList.add("active");
  setTimeout(() => cell.classList.remove("active"), 350);
}

function handleClick(e) {
  if (!canPlay) return;

  const index = Number(e.target.dataset.id);
  userInput.push(index);
  flash(e.target);

  const current = userInput.length - 1;
  if (userInput[current] !== pattern[current]) {
    gameOver();
    return;
  }

  if (userInput.length === pattern.length) {
    score += level * 10;
    level++;
    updateHUD();
    statusEl.textContent = "Nice! Next round...";
    setTimeout(nextRound, 900);
  }
}

function gameOver() {
  statusEl.textContent = "Game Over ❌ Tap start to retry";
  startBtn.disabled = false;
  canPlay = false;
}

function updateHUD() {
  levelEl.textContent = level;
  scoreEl.textContent = score;
}
