const cards = [
  { symbol: "🂡", meaning: "Bold Move", mood: "🔥 Brave", points: 15 },
  { symbol: "🂱", meaning: "New Start", mood: "✨ Hopeful", points: 10 },
  { symbol: "🃁", meaning: "Focus Time", mood: "🎯 Sharp", points: 10 },
  { symbol: "🃑", meaning: "Lucky Chance", mood: "🍀 Lucky", points: 20 },
  { symbol: "🂮", meaning: "Slow Down", mood: "🧘 Calm", points: 5 }
];

const cardEl = document.getElementById("card");
const backEl = document.getElementById("cardBack");
const pointsEl = document.getElementById("points");
const moodEl = document.getElementById("mood");

let points = 0;
let drawn = false;

document.getElementById("drawBtn").onclick = () => {
  if (drawn) return;

  const c = cards[Math.floor(Math.random() * cards.length)];

  backEl.innerHTML = `
    <div style="font-size:2rem">${c.symbol}</div>
    <div>${c.meaning}</div>
  `;

  cardEl.classList.add("flip");

  points += c.points;
  pointsEl.textContent = points;
  moodEl.textContent = c.mood;

  drawn = true;
};

document.getElementById("resetBtn").onclick = () => {
  drawn = false;
  cardEl.classList.remove("flip");
  backEl.textContent = "?";
  points = 0;
  pointsEl.textContent = points;
  moodEl.textContent = "🤔 Curious";
};
