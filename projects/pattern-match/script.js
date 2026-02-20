const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const levelText = document.getElementById("level");

const TOTAL_COLORS = 30;
let colors = [];
let sequence = [];
let userSequence = [];
let level = 0;
let acceptingInput = false;

/* 🎨 Generate 30 HSL colors */
function generateColors() {
  colors = [];
  for (let i = 0; i < TOTAL_COLORS; i++) {
    const hue = Math.floor((360 / TOTAL_COLORS) * i);
    colors.push(`hsl(${hue}, 80%, 55%)`);
  }
}

/* 🔲 Create buttons dynamically */
function createGrid() {
  grid.innerHTML = "";
  colors.forEach((color, index) => {
    const btn = document.createElement("div");
    btn.classList.add("color-btn");
    btn.style.backgroundColor = color;
    btn.dataset.index = index;

    btn.addEventListener("click", () => handleUserInput(index));
    grid.appendChild(btn);
  });
}

/* ▶️ Start / Restart Game */
function startGame() {
  sequence = [];
  level = 0;
  levelText.textContent = level;
  statusText.textContent = "Watch the pattern...";
  nextRound();
}

/* ➕ Next Level */
function nextRound() {
  userSequence = [];
  acceptingInput = false;
  level++;
  levelText.textContent = level;

  const randomIndex = Math.floor(Math.random() * TOTAL_COLORS);
  sequence.push(randomIndex);

  playSequence();
}

/* 💡 Flash sequence */
function playSequence() {
  let delay = 0;
  statusText.textContent = "Watch carefully 👀";

  sequence.forEach((index, i) => {
    setTimeout(() => {
      flashButton(index);
    }, delay);
    delay += 600;
  });

  setTimeout(() => {
    acceptingInput = true;
    statusText.textContent = "Your turn ✨";
  }, delay);
}

/* ✨ Flash effect */
function flashButton(index) {
  const btn = grid.children[index];
  btn.classList.add("flash");

  setTimeout(() => {
    btn.classList.remove("flash");
  }, 300);
}

/* 🧩 Handle clicks */
function handleUserInput(index) {
  if (!acceptingInput) return;

  userSequence.push(index);
  flashButton(index);

  const currentStep = userSequence.length - 1;

  if (userSequence[currentStep] !== sequence[currentStep]) {
    gameOver();
    return;
  }

  if (userSequence.length === sequence.length) {
    statusText.textContent = "Correct! 🎉";
    setTimeout(nextRound, 800);
  }
}

/* ❌ Game Over */
function gameOver() {
  statusText.textContent = "Game Over ❌ Press Start to try again";
  acceptingInput = false;
}

/* 🔧 Init */
generateColors();
createGrid();
startBtn.addEventListener("click", startGame);
