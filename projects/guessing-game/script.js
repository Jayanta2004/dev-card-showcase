let randomNumber = generateNumber();
let attempts = 0;
let streak = 0;
let hintUsed = false;

const guessInput = document.getElementById("guessInput");
const message = document.getElementById("message");
const attemptsText = document.getElementById("attempts");
const streakText = document.getElementById("streak");
const confettiBox = document.getElementById("confetti");

document.getElementById("checkBtn").addEventListener("click", checkGuess);
document.getElementById("resetBtn").addEventListener("click", resetGame);
document.getElementById("hintBtn").addEventListener("click", showHint);

function generateNumber() {
  return Math.floor(Math.random() * 10) + 1;
}

function checkGuess() {
  const guess = Number(guessInput.value);

  if (!guess || guess < 1 || guess > 10) {
    setMessage("❌ Enter valid number (1–10)", "red");
    return;
  }

  attempts++;
  attemptsText.textContent = `Attempts: ${attempts}`;

  if (guess === randomNumber) {
    setMessage("🎉 Perfect! You nailed it!", "green");
    streak++;
    streakText.textContent = `🔥 Win Streak: ${streak}`;
    launchConfetti();
    randomNumber = generateNumber();
    attempts = 0;
    hintUsed = false;
    attemptsText.textContent = "Attempts: 0";
  } else {
    setMessage(guess > randomNumber ? "📉 Too High" : "📈 Too Low", "orange");
    streak = 0;
    streakText.textContent = `🔥 Win Streak: 0`;
  }

  guessInput.value = "";
}

function showHint() {
  if (hintUsed) {
    setMessage("⚠️ Hint already used!", "gray");
    return;
  }

  const hint = randomNumber % 2 === 0 ? "Even" : "Odd";
  setMessage(`🧠 Hint: Number is ${hint}`, "#f39c12");
  hintUsed = true;
}

function resetGame() {
  randomNumber = generateNumber();
  attempts = 0;
  streak = 0;
  hintUsed = false;
  attemptsText.textContent = "Attempts: 0";
  streakText.textContent = "🔥 Win Streak: 0";
  message.textContent = "";
  guessInput.value = "";
}

function setMessage(text, color) {
  message.textContent = text;
  message.style.color = color;
}

function launchConfetti() {
  for (let i = 0; i < 20; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = `hsl(${Math.random() * 360},100%,50%)`;
    confettiBox.appendChild(piece);

    setTimeout(() => piece.remove(), 1000);
  }
}
