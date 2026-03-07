const colors = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];

const wordBox = document.getElementById("wordBox");
const optionsDiv = document.getElementById("colorOptions");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const comboEl = document.getElementById("combo");
const accuracyEl = document.getElementById("accuracy");
const highScoreEl = document.getElementById("highScore");
const startBtn = document.getElementById("startBtn");

let score = 0;
let combo = 0;
let time = 30;
let totalClicks = 0;
let correctClicks = 0;
let currentCorrectColor = "";
let interval;

let highScore = localStorage.getItem("colorMismatchHigh") || 0;
highScoreEl.textContent = highScore;

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateRound() {
  const word = randomColor();
  const textColor = randomColor();
  currentCorrectColor = textColor;

  wordBox.textContent = word;
  wordBox.style.color = textColor;

  optionsDiv.innerHTML = "";
  colors.forEach(color => {
    const btn = document.createElement("button");
    btn.textContent = color;
    btn.className = "option-btn";
    btn.style.background = color.toLowerCase();
    btn.onclick = () => checkAnswer(color);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(selected) {
  totalClicks++;

  if (selected === currentCorrectColor) {
    score += 10 + combo * 2;
    combo++;
    correctClicks++;
  } else {
    combo = 0;
    score -= 5;
  }

  updateStats();
  generateRound();
}

function updateStats() {
  scoreEl.textContent = score;
  comboEl.textContent = combo;
  accuracyEl.textContent =
    totalClicks === 0
      ? "0%"
      : Math.floor((correctClicks / totalClicks) * 100) + "%";
}

function startGame() {
  score = 0;
  combo = 0;
  totalClicks = 0;
  correctClicks = 0;
  time = 30;

  updateStats();
  generateRound();

  interval = setInterval(() => {
    time--;
    timeEl.textContent = time;

    if (time <= 0) {
      clearInterval(interval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  if (score > highScore) {
    localStorage.setItem("colorMismatchHigh", score);
  }

  alert("Game Over! Score: " + score);
}

startBtn.addEventListener("click", startGame);