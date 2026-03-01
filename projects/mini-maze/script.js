const mazeContainer = document.getElementById("mazeContainer");
const timerEl = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");

const rows = 10;
const cols = 10;

let maze = [];
let playerPos = { x: 0, y: 0 };
let finishPos = { x: 9, y: 9 };
let timer = 0;
let timerInterval;

function generateMaze() {
  maze = Array(rows).fill().map(() => Array(cols).fill(0));

  for (let i = 0; i < 30; i++) {
    let rx = Math.floor(Math.random() * rows);
    let ry = Math.floor(Math.random() * cols);
    if ((rx === 0 && ry === 0) || (rx === finishPos.x && ry === finishPos.y)) continue;
    maze[rx][ry] = 1;
  }

  renderMaze();
}

function renderMaze() {
  mazeContainer.innerHTML = "";
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (maze[i][j] === 1) cell.classList.add("wall");
      if (i === playerPos.x && j === playerPos.y) cell.classList.add("player");
      if (i === finishPos.x && j === finishPos.y) cell.classList.add("finish");
      mazeContainer.appendChild(cell);
    }
  }
}

function movePlayer(dx, dy) {
  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;

  if (newX < 0 || newX >= rows || newY < 0 || newY >= cols) return;
  if (maze[newX][newY] === 1) return;

  playerPos = { x: newX, y: newY };
  renderMaze();
  checkFinish();
}

function checkFinish() {
  if (playerPos.x === finishPos.x && playerPos.y === finishPos.y) {
    clearInterval(timerInterval);
    alert(`🎉 You completed the maze in ${timer} seconds!`);
  }
}

// Arrow keys
document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowUp": movePlayer(-1, 0); break;
    case "ArrowDown": movePlayer(1, 0); break;
    case "ArrowLeft": movePlayer(0, -1); break;
    case "ArrowRight": movePlayer(0, 1); break;
  }
});

// On-screen arrow buttons
const arrowButtons = document.querySelectorAll(".arrow");
arrowButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const dir = btn.getAttribute("data-dir");
    switch (dir) {
      case "up": movePlayer(-1, 0); break;
      case "down": movePlayer(1, 0); break;
      case "left": movePlayer(0, -1); break;
      case "right": movePlayer(0, 1); break;
    }
  });
});

// Timer
function startTimer() {
  timer = 0;
  timerEl.textContent = timer;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    timerEl.textContent = timer;
  }, 1000);
}

// Restart
restartBtn.addEventListener("click", () => {
  playerPos = { x: 0, y: 0 };
  generateMaze();
  startTimer();
});

// Initial load
generateMaze();
startTimer();