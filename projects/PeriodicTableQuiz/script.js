const elements = [
  { name: "Hydrogen", symbol: "H" },
  { name: "Helium", symbol: "He" },
  { name: "Lithium", symbol: "Li" },
  { name: "Carbon", symbol: "C" },
  { name: "Nitrogen", symbol: "N" },
  { name: "Oxygen", symbol: "O" },
  { name: "Sodium", symbol: "Na" },
  { name: "Magnesium", symbol: "Mg" },
  { name: "Aluminium", symbol: "Al" },
  { name: "Iron", symbol: "Fe" }
];

const table = document.getElementById("table");
const questionEl = document.getElementById("question");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");

let score = 0;
let timeLeft = 60;
let currentElement;

function createTable() {
  table.innerHTML = "";
  elements.forEach(el => {
    const div = document.createElement("div");
    div.classList.add("element");
    div.innerHTML = `
      <div class="symbol">${el.symbol}</div>
      <div class="name">${el.name}</div>
    `;
    div.onclick = () => checkAnswer(el, div);
    table.appendChild(div);
  });
}

function newQuestion() {
  currentElement = elements[Math.floor(Math.random() * elements.length)];
  questionEl.textContent = "Click the element: " + currentElement.name;
}

function checkAnswer(selected, div) {
  if (selected.name === currentElement.name) {
    div.classList.add("correct");
    score++;
    scoreEl.textContent = score;
    newQuestion();
  } else {
    div.classList.add("wrong");
    setTimeout(() => div.classList.remove("wrong"), 500);
  }
}

let timer = setInterval(() => {
  timeLeft--;
  timeEl.textContent = timeLeft;

  if (timeLeft === 0) {
    clearInterval(timer);
    alert("Game Over! Your score: " + score);
  }
}, 1000);

function restartGame() {
  location.reload();
}

createTable();
newQuestion();
