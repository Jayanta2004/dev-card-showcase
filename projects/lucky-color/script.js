const colors = [
  { name: "Red ❤️", meaning: "Energy & Confidence", hex: "#ef4444" },
  { name: "Blue 💙", meaning: "Calm & Focus", hex: "#3b82f6" },
  { name: "Green 💚", meaning: "Growth & Balance", hex: "#22c55e" },
  { name: "Yellow 💛", meaning: "Joy & Creativity", hex: "#facc15" },
  { name: "Purple 💜", meaning: "Wisdom & Magic", hex: "#a855f7" },
  { name: "Orange 🧡", meaning: "Motivation & Fun", hex: "#fb923c" }
];

const card = document.getElementById("colorCard");
const pointsEl = document.getElementById("points");
const levelEl = document.getElementById("level");

let points = 0;

function dailyColor() {
  const day = new Date().getDate();
  return colors[day % colors.length];
}

document.getElementById("revealBtn").onclick = () => {
  const c = dailyColor();

  card.classList.remove("reveal");
  void card.offsetWidth;

  card.style.background = c.hex;
  card.textContent = `${c.name}\n✨ ${c.meaning}`;
  card.classList.add("reveal");

  points += 10;
  updateLevel();
};

function updateLevel() {
  pointsEl.textContent = points;

  if (points >= 50) levelEl.textContent = "🍀 SUPER LUCKY";
  else if (points >= 20) levelEl.textContent = "✨ LUCKY";
  else levelEl.textContent = "😐 Neutral";
}

document.getElementById("resetBtn").onclick = () => {
  points = 0;
  card.style.background = "#f8fafc";
  card.textContent = "🎁 Your lucky color is hiding...";
  updateLevel();
};
