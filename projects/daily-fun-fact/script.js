const facts = {
  easy: [
    { text: "Bananas are berries.", answer: true },
    { text: "The sky is green.", answer: false }
  ],
  medium: [
    { text: "Octopuses have three hearts.", answer: true },
    { text: "Humans can breathe underwater unaided.", answer: false }
  ],
  hard: [
    { text: "Venus rotates clockwise.", answer: true },
    { text: "Gold is magnetic.", answer: false }
  ]
};

const points = { easy: 5, medium: 10, hard: 20 };

let currentFact = null;
let currentLevel = null;
let score = 0;

const factEl = document.getElementById("fact");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");

document.querySelectorAll(".difficulty button").forEach(btn => {
  btn.onclick = () => {
    currentLevel = btn.dataset.level;
    currentFact =
      facts[currentLevel][Math.floor(Math.random() * facts[currentLevel].length)];
    showFact(currentFact.text);
  };
});

function showFact(text) {
  factEl.textContent = text;
  factEl.classList.remove("animate");
  void factEl.offsetWidth;
  factEl.classList.add("animate");
}

function checkAnswer(ans) {
  if (!currentFact) return;
  if (ans === currentFact.answer) {
    score += points[currentLevel];
  }
  updateStatus();
}

function updateStatus() {
  scoreEl.textContent = score;
  if (score >= 50) statusEl.textContent = "🏆 Winner";
  else if (score >= 25) statusEl.textContent = "Pro";
  else statusEl.textContent = "Beginner";
}

document.getElementById("trueBtn").onclick = () => checkAnswer(true);
document.getElementById("falseBtn").onclick = () => checkAnswer(false);

document.getElementById("reset").onclick = () => {
  score = 0;
  currentFact = null;
  factEl.textContent = "Select a difficulty to get today’s fun fact";
  updateStatus();
};
