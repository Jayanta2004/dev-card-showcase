const wordsBox = document.getElementById("words");
const timerEl = document.getElementById("timer");
const input = document.getElementById("input");
const btn = document.getElementById("actionBtn");
const result = document.getElementById("result");
const levelSelect = document.getElementById("level");
const streakEl = document.getElementById("streak");
const highScoreEl = document.getElementById("highScore");

const wordBank = [
  "focus","logic","future","speed","memory","skill",
  "energy","brain","code","power","smart","learn"
];

const levels = {
  easy: { time: 10, count: 4 },
  medium: { time: 8, count: 6 },
  hard: { time: 6, count: 8 }
};

let words = [];
let remaining = [];
let timer;
let interval;
let correct = 0;
let streak = 0;
let highScore = localStorage.getItem("memoryHigh") || 0;

highScoreEl.textContent = `🏆 High Score: ${highScore}`;

btn.addEventListener("click", startGame);

function startGame() {
  result.textContent = "";
  input.value = "";
  input.disabled = true;
  correct = 0;

  const level = levels[levelSelect.value];
  timer = level.time;

  words = [...wordBank].sort(() => 0.5 - Math.random()).slice(0, level.count);
  remaining = [...words];

  wordsBox.textContent = words.join(" • ");
  timerEl.textContent = `⏱️ ${timer}s`;

  btn.disabled = true;

  interval = setInterval(() => {
    timer--;
    timerEl.textContent = `⏱️ ${timer}s`;

    if (timer === 0) {
      clearInterval(interval);
      recallPhase();
    }
  }, 1000);
}

function recallPhase() {
  wordsBox.textContent = "❓ ❓ ❓";
  input.disabled = false;
  input.focus();
  btn.style.display = "none";

  input.addEventListener("keydown", handleTyping);
}

function handleTyping(e) {
  if (e.key === " ") {
    e.preventDefault();

    const typedWords = input.value.trim().toLowerCase().split(/\s+/);
    const lastWord = typedWords[typedWords.length - 1];

    if (remaining.includes(lastWord)) {
      correct++;
      remaining = remaining.filter(w => w !== lastWord);
    }

    input.value = typedWords.join(" ") + " ";
  }
}

function endGame() {
  input.removeEventListener("keydown", handleTyping);
  input.disabled = true;
  btn.style.display = "block";
  btn.textContent = "Play Again";
  btn.onclick = startGame;

  const accuracy = Math.round((correct / words.length) * 100);

  if (accuracy >= 60) streak++;
  else streak = 0;

  highScore = Math.max(highScore, streak);
  localStorage.setItem("memoryHigh", highScore);

  streakEl.textContent = `🔥 Streak: ${streak}`;
  highScoreEl.textContent = `🏆 High Score: ${highScore}`;

  result.innerHTML = `
    ✅ ${correct}/${words.length} correct<br>
    🎯 Accuracy: ${accuracy}%
  `;
}

// ⏱️ End game when user stops typing for 2s
let typingTimeout;
input?.addEventListener("input", () => {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(endGame, 2000);
});
