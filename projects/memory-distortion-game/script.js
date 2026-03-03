const grid = document.getElementById("grid");
const levelEl = document.getElementById("level");
const scoreEl = document.getElementById("score");
const focusEl = document.getElementById("focus");
const messageEl = document.getElementById("message");

let level = 1;
let score = 0;
let focus = 3;
let pattern = [];
let distortedPattern = [];
let selected = [];

const symbols = ["▲", "■", "●", "★", "✖", "◆"];

function generatePattern() {
  pattern = [];
  for (let i = 0; i < 16; i++) {
    pattern.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }
}

function distortPattern() {
  distortedPattern = [...pattern];
  let changes = level;
  for (let i = 0; i < changes; i++) {
    let index = Math.floor(Math.random() * distortedPattern.length);
    distortedPattern[index] =
      symbols[Math.floor(Math.random() * symbols.length)];
  }
}

function renderGrid(showOriginal = false) {
  grid.innerHTML = "";
  let display = showOriginal ? pattern : distortedPattern;

  display.forEach((sym, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = sym;

    cell.onclick = () => {
      cell.classList.toggle("selected");
      selected.push(index);
    };

    grid.appendChild(cell);
  });
}

function startGame() {
  generatePattern();
  distortPattern();
  renderGrid(true);

  setTimeout(() => {
    renderGrid(false);
  }, 4000);
}

function submitAnswer() {
  let correctChanges = 0;

  selected.forEach(index => {
    if (pattern[index] !== distortedPattern[index]) {
      correctChanges++;
    }
  });

  if (correctChanges >= level) {
    score += 10 * level;
    level++;
    messageEl.textContent = "Correct! Reality stabilized.";
  } else {
    focus--;
    messageEl.textContent = "Distortion missed!";
  }

  updateUI();
  selected = [];
}

function replayPattern() {
  if (focus > 0) {
    focus--;
    renderGrid(true);
    setTimeout(() => renderGrid(false), 3000);
    updateUI();
  }
}

function updateUI() {
  levelEl.textContent = level;
  scoreEl.textContent = score;
  focusEl.textContent = focus;

  if (focus <= 0) {
    alert("Reality Collapsed!");
    location.reload();
  }
}

document.getElementById("startBtn").onclick = startGame;
document.getElementById("submitBtn").onclick = submitAnswer;
document.getElementById("replayBtn").onclick = replayPattern;