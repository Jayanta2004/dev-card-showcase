const grid = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const focusEl = document.getElementById("focus");
const ruleDisplay = document.getElementById("ruleDisplay");
const ruleHistoryEl = document.getElementById("ruleHistory");
const highScoreEl = document.getElementById("highScore");
const startBtn = document.getElementById("startBtn");

let score = 0;
let focus = 100;
let time = 60;
let currentRule = null;
let ruleInterval;
let timerInterval;
let highScore = localStorage.getItem("ruleSwitcherHigh") || 0;

highScoreEl.textContent = highScore;

const rules = [
  {
    name: "EVEN numbers",
    check: (n) => n % 2 === 0
  },
  {
    name: "ODD numbers",
    check: (n) => n % 2 !== 0
  },
  {
    name: "PRIME numbers",
    check: (n) => {
      if (n < 2) return false;
      for (let i = 2; i < n; i++) {
        if (n % i === 0) return false;
      }
      return true;
    }
  },
  {
    name: "MULTIPLES of 3",
    check: (n) => n % 3 === 0
  },
  {
    name: "GREATER than 50",
    check: (n) => n > 50
  }
];

function randomRule() {
  const rule = rules[Math.floor(Math.random() * rules.length)];
  currentRule = rule;
  ruleDisplay.textContent = "Rule: " + rule.name;

  const li = document.createElement("li");
  li.textContent = rule.name;
  ruleHistoryEl.prepend(li);
}

function generateGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < 24; i++) {
    const num = Math.floor(Math.random() * 100) + 1;
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = num;

    card.onclick = () => handleClick(num);

    grid.appendChild(card);
  }
}

function handleClick(num) {
  if (currentRule.check(num)) {
    score += 10;
  } else {
    score -= 5;
    focus -= 5;
  }

  updateStats();
  generateGrid();
}

function updateStats() {
  scoreEl.textContent = score;
  focusEl.textContent = focus;
}

function startGame() {
  score = 0;
  focus = 100;
  time = 60;
  ruleHistoryEl.innerHTML = "";

  generateGrid();
  randomRule();

  ruleInterval = setInterval(() => {
    randomRule();
  }, 10000);

  timerInterval = setInterval(() => {
    time--;
    timeEl.textContent = time;

    if (time <= 0 || focus <= 0) {
      clearInterval(ruleInterval);
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  if (score > highScore) {
    localStorage.setItem("ruleSwitcherHigh", score);
  }
  alert("Game Over! Score: " + score);
}

startBtn.addEventListener("click", startGame);