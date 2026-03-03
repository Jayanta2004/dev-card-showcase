let score = 0;
let combo = 0;
let timeLeft = 100;
let timerInterval;
let currentRule;
let notMode = false;

const rules = [
  {
    text: "Select EVEN numbers",
    check: (val) => parseInt(val) % 2 === 0
  },
  {
    text: "Select numbers > 10",
    check: (val) => parseInt(val) > 10
  },
  {
    text: "Select multiples of 3",
    check: (val) => parseInt(val) % 3 === 0
  }
];

function startGame() {
  score = 0;
  combo = 0;
  timeLeft = 100;
  updateStats();
  nextRound();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("timerBar").style.width = timeLeft + "%";

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Game Over! Score: " + score);
    }
  }, 100);
}

function nextRound() {
  currentRule = rules[Math.floor(Math.random() * rules.length)];
  notMode = Math.random() < 0.3;

  let ruleText = currentRule.text;
  if (notMode) ruleText = "NOT: " + ruleText;

  document.getElementById("ruleText").textContent = ruleText;

  generateOptions();
}

function generateOptions() {
  const container = document.getElementById("options");
  container.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    let num = Math.floor(Math.random() * 20) + 1;

    const div = document.createElement("div");
    div.className = "option";
    div.textContent = num;
    div.onclick = () => checkAnswer(num);

    container.appendChild(div);
  }
}

function checkAnswer(val) {
  let correct = currentRule.check(val);
  if (notMode) correct = !correct;

  if (correct) {
    combo++;
    score += 10 * combo;
    timeLeft += 5;
  } else {
    combo = 0;
    timeLeft -= 10;
  }

  if (Math.random() < 0.2) {
    timeLeft -= 5;
    document.body.style.filter = "invert(1)";
    setTimeout(() => document.body.style.filter = "none", 200);
  }

  updateStats();
  nextRound();
}

function updateStats() {
  document.getElementById("score").textContent = score;
  document.getElementById("combo").textContent = combo;
}