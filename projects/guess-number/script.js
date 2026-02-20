let secretNumber;
let attempts;

const MIN = 1;
const MAX = 100;
const MAX_ATTEMPTS = 10;

// ELEMENTS
const startBtn = document.getElementById("startBtn");
const guessBtn = document.getElementById("guessBtn");
const restartBtn = document.getElementById("restartBtn");
const quitBtn = document.getElementById("quitBtn");
const themeToggle = document.getElementById("themeToggle");

const guessInput = document.getElementById("guessInput");
const message = document.getElementById("message");
const attemptsText = document.getElementById("attempts");
const feedbackText = document.getElementById("feedback");

const setupSection = document.querySelector(".setup");
const gameSection = document.querySelector(".game");

// 🌙 THEME LOAD
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "🌞";
}

// 🌗 THEME TOGGLE
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "🌞" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// START GAME
startBtn.addEventListener("click", () => {
  secretNumber = Math.floor(Math.random() * MAX) + MIN;
  attempts = 0;

  setupSection.classList.add("hidden");
  gameSection.classList.remove("hidden");

  message.textContent = "Game started! Make your guess.";
  message.className = "message warning";

  updateStats();
  guessBtn.disabled = false;
  guessInput.disabled = false;
  restartBtn.classList.add("hidden");

  guessInput.value = "";
  guessInput.focus();
});

// GUESS
guessBtn.addEventListener("click", handleGuess);
guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleGuess();
});

function handleGuess() {
  const guess = Number(guessInput.value);

  if (!guess || guess < MIN || guess > MAX) {
    showMessage(`Enter a number between ${MIN} and ${MAX}`, "warning");
    return;
  }

  attempts++;

  if (guess === secretNumber) {
    endGame(`🎉 Correct! The number was ${secretNumber}`, "success");
    return;
  }

  if (attempts >= MAX_ATTEMPTS) {
    endGame(`❌ Game Over! The number was ${secretNumber}`, "error");
    return;
  }

  showMessage(guess > secretNumber ? "Too high ⬆️" : "Too low ⬇️", "warning");
  updateStats();

  guessInput.value = "";
  guessInput.focus();
}

// HELPERS
function updateStats() {
  attemptsText.textContent = `Attempts: ${attempts}/${MAX_ATTEMPTS}`;
  feedbackText.textContent = `Remaining: ${MAX_ATTEMPTS - attempts}`;
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function endGame(text, type) {
  showMessage(text, type);
  guessBtn.disabled = true;
  guessInput.disabled = true;
  restartBtn.classList.remove("hidden");
}

// RESTART & QUIT
restartBtn.addEventListener("click", () => {
  setupSection.classList.remove("hidden");
  gameSection.classList.add("hidden");
});

quitBtn.addEventListener("click", () => {
  setupSection.classList.remove("hidden");
  gameSection.classList.add("hidden");
});
