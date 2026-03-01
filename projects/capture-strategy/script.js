const gridSize = 6;
let grid = [];
let playerScore = 0;
let aiScore = 0;
let playerTurn = true;

const gridEl = document.getElementById("grid");
const playerScoreEl = document.getElementById("playerScore");
const aiScoreEl = document.getElementById("aiScore");
const statusEl = document.getElementById("status");

document.getElementById("restartBtn").onclick = initGame;

function initGame() {
  grid = [];
  gridEl.innerHTML = "";
  playerScore = 0;
  aiScore = 0;
  playerTurn = true;
  updateScores();

  for (let i = 0; i < gridSize * gridSize; i++) {
    let type = "normal";
    let value = Math.floor(Math.random() * 5) + 1;

    if (Math.random() < 0.1) type = "multiplier";
    if (Math.random() < 0.08) type = "trap";

    grid.push({ value, type, owner: null });

    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.innerText = value;
    tile.dataset.index = i;
    tile.onclick = () => playerMove(i);
    gridEl.appendChild(tile);
  }

  statusEl.innerText = "Your turn";
}

function updateScores() {
  playerScoreEl.innerText = playerScore;
  aiScoreEl.innerText = aiScore;
}

function getComboBonus(index) {
  const neighbors = [
    index - 1,
    index + 1,
    index - gridSize,
    index + gridSize
  ];

  let bonus = 0;
  neighbors.forEach(n => {
    if (grid[n] && grid[n].owner === "player") bonus++;
  });

  return bonus;
}

function applyTileEffect(tile, owner) {
  let score = tile.value;

  if (tile.type === "multiplier") {
    score *= 2;
  }

  if (tile.type === "trap") {
    score = -score;
  }

  return score;
}

function playerMove(index) {
  if (!playerTurn) return;
  const tile = grid[index];
  if (tile.owner) return;

  const el = gridEl.children[index];
  tile.owner = "player";
  el.classList.add("player");

  let gained = applyTileEffect(tile, "player");
  gained += getComboBonus(index);

  playerScore += gained;
  updateScores();

  playerTurn = false;
  statusEl.innerText = "AI thinking...";
  setTimeout(aiMove, 600);
}

function aiMove() {
  const difficulty = document.getElementById("difficulty").value;

  let bestIndex = -1;
  let bestScore = -Infinity;

  grid.forEach((tile, i) => {
    if (tile.owner) return;

    let score = applyTileEffect(tile, "ai");

    if (difficulty === "hard") {
      const neighbors = [
        i - 1,
        i + 1,
        i - gridSize,
        i + gridSize
      ];

      neighbors.forEach(n => {
        if (grid[n] && grid[n].owner === "ai") score += 1;
      });
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });

  if (bestIndex === -1) return;

  const tile = grid[bestIndex];
  const el = gridEl.children[bestIndex];
  tile.owner = "ai";
  el.classList.add("ai");

  let gained = applyTileEffect(tile, "ai");
  aiScore += gained;

  updateScores();
  playerTurn = true;
  statusEl.innerText = "Your turn";

  checkGameEnd();
}

function checkGameEnd() {
  const remaining = grid.some(tile => !tile.owner);
  if (!remaining) {
    if (playerScore > aiScore) {
      statusEl.innerText = "You win!";
    } else if (aiScore > playerScore) {
      statusEl.innerText = "AI wins!";
    } else {
      statusEl.innerText = "Draw!";
    }
  }
}

initGame();
