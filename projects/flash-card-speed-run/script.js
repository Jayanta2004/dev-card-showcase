const cards = [
  { q: "What does HTML stand for?", a: "HyperText Markup Language" },
  { q: "Which HTML tag is used for the largest heading?", a: "<h1>" },
  { q: "CSS property to change text color?", a: "color" },
  { q: "CSS property to create space outside an element?", a: "margin" },
  { q: "CSS property to create space inside an element?", a: "padding" },

  { q: "JavaScript keyword to declare a constant?", a: "const" },
  { q: "Which keyword is used to declare a variable in JavaScript?", a: "let" },
  { q: "What does DOM stand for?", a: "Document Object Model" },
  { q: "Method to parse JSON data?", a: "JSON.parse()" },
  { q: "Method to convert object to JSON string?", a: "JSON.stringify()" },

  { q: "Which operator is used for strict equality in JavaScript?", a: "===" },
  { q: "What is the output type of typeof []?", a: "object" },
  { q: "Which function runs after a set time delay?", a: "setTimeout()" },
  { q: "Which method is used to add an element to the end of an array?", a: "push()" },
  { q: "Which method removes the last element from an array?", a: "pop()" },

  { q: "HTTP status code for 'Not Found'?", a: "404" },
  { q: "Which HTML attribute opens a link in a new tab?", a: "target=\"_blank\"" },
  { q: "Which CSS layout uses rows and columns?", a: "Grid" },
  { q: "Which CSS layout is best for one-dimensional layouts?", a: "Flexbox" },
  { q: "Which JavaScript method selects an element by ID?", a: "document.getElementById()" }
];


let index = 0;
let score = 0;
let timeLeft = 60;
let flipped = false;

const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const cardEl = document.getElementById("card");
const progressEl = document.getElementById("progress");

function loadCard() {
  const card = cards[index];
  questionEl.textContent = card.q;
  answerEl.textContent = card.a;
  cardEl.classList.remove("flipped");
  flipped = false;
  progressEl.textContent = `Card ${index + 1} of ${cards.length}`;
}

function flipCard() {
  cardEl.classList.toggle("flipped");
  flipped = !flipped;
}

function mark(known) {
  if (known && flipped) score += 10;
  index++;

  if (index < cards.length) {
    loadCard();
  } else {
    endGame();
  }

  scoreEl.textContent = score;
}

function startTimer() {
  const timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function endGame() {
  document.querySelector(".app").innerHTML = `
    <h2>🏁 Speed Run Complete</h2>
    <p>You scored <strong>${score}</strong> points</p>
    <button class="flip-btn" onclick="location.reload()">Restart</button>
  `;
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") flipCard();
  if (e.key.toLowerCase() === "k") mark(true);
  if (e.key.toLowerCase() === "s") mark(false);
});

loadCard();
startTimer();
