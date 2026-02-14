const truths = [
  "What is your biggest fear?",
  "Who was your first crush?",
  "What habit do you want to change?",
  "What makes you instantly happy?"
];

const dares = [
  "Do 10 jumping jacks",
  "Sing one line of a song",
  "Act like a robot for 10 seconds",
  "Send a funny emoji to someone"
];

let turns = 0;
let score = 0;

const card = document.getElementById("card");
const turnsEl = document.getElementById("turns");
const scoreEl = document.getElementById("score");

function show(text) {
  card.textContent = text;
  card.classList.remove("animate");
  void card.offsetWidth;
  card.classList.add("animate");
  turnsEl.textContent = ++turns;
  scoreEl.textContent = score;
}

document.getElementById("truthBtn").onclick = () => {
  score += 5;
  show("🟦 TRUTH: " + truths[Math.floor(Math.random() * truths.length)]);
};

document.getElementById("dareBtn").onclick = () => {
  score += 10;
  show("🟩 DARE: " + dares[Math.floor(Math.random() * dares.length)]);
};

document.getElementById("resetBtn").onclick = () => {
  turns = 0;
  score = 0;
  card.textContent = "Tap Truth or Dare to begin";
  turnsEl.textContent = 0;
  scoreEl.textContent = 0;
};
