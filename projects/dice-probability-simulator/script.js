const simulateBtn = document.getElementById("simulateBtn");
const resultsDiv = document.getElementById("results");
const diceDisplay = document.getElementById("diceDisplay");

simulateBtn.addEventListener("click", () => {
  const rolls = parseInt(document.getElementById("rolls").value, 10);
  if (rolls < 1) return;

  const counts = Array(6).fill(0);

  for (let i = 0; i < rolls; i++) {
    const roll = Math.floor(Math.random() * 6);
    counts[roll]++;
  }

  renderResults(counts, rolls);
  animateDice();
});

function renderResults(counts, total) {
  resultsDiv.innerHTML = "";

  counts.forEach((count, index) => {
    const probability = ((count / total) * 100).toFixed(2);

    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <h3>${index + 1}</h3>
      <span>${probability}%</span>
    `;
    resultsDiv.appendChild(card);
  });
}

function animateDice() {
  const faces = ["⚀","⚁","⚂","⚃","⚄","⚅"];
  let i = 0;

  const interval = setInterval(() => {
    diceDisplay.textContent = faces[Math.floor(Math.random() * 6)];
    i++;
    if (i > 10) clearInterval(interval);
  }, 80);
}
