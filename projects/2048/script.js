const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("bestScore");
const restartBtn = document.getElementById("restart");

let grid = [];
let score = 0;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;
bestEl.textContent = bestScore;

function init() {
  grid = Array(16).fill(0);
  score = 0;
  scoreEl.textContent = score;
  bestEl.textContent = bestScore;
  addTile();
  addTile();
  draw();
}

function draw() {
  board.innerHTML = "";
  grid.forEach(value => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    if (value) {
      tile.textContent = value;
      tile.classList.add(`tile-${value}`);
    } else {
      tile.classList.add("tile-empty");
    }
    board.appendChild(tile);
  });
}

function addTile() {
  const empty = grid
    .map((v, i) => v === 0 ? i : null)
    .filter(v => v !== null);

  if (!empty.length) return;

  const index = empty[Math.floor(Math.random() * empty.length)];
  grid[index] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row) {
  row = row.filter(v => v);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
    }
  }
  row = row.filter(v => v);
  while (row.length < 4) row.push(0);
  return row;
}

function moveLeft() {
  let moved = false;
  for (let r = 0; r < 4; r++) {
    const row = grid.slice(r * 4, r * 4 + 4);
    const newRow = slide(row);
    if (row.toString() !== newRow.toString()) moved = true;
    grid.splice(r * 4, 4, ...newRow);
  }
  return moved;
}

function rotate() {
  const newGrid = [];
  for (let c = 0; c < 4; c++)
    for (let r = 3; r >= 0; r--)
      newGrid.push(grid[r * 4 + c]);
  grid = newGrid;
}

function move(dir) {
  let moved = false;

  if (dir === "left") moved = moveLeft();
  if (dir === "right") { rotate(); rotate(); moved = moveLeft(); rotate(); rotate(); }
  if (dir === "up") { rotate(); rotate(); rotate(); moved = moveLeft(); rotate(); }
  if (dir === "down") { rotate(); moved = moveLeft(); rotate(); rotate(); rotate(); }

  if (moved) {
    addTile();
    scoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestEl.textContent = bestScore;
      localStorage.setItem("bestScore", String(bestScore));
    }
    draw();
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
});

restartBtn.addEventListener("click", init);

init();
