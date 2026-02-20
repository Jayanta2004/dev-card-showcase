const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const size = 10;
let snake = [22, 21];
let direction = 1;
let food = 0;
let score = 0;
let interval;

const cells = [];

function createBoard() {
  board.innerHTML = "";
  cells.length = 0;

  for (let i = 0; i < size * size; i++) {
    const div = document.createElement("div");
    div.classList.add("cell");
    board.appendChild(div);
    cells.push(div);
  }
}

function draw() {
  cells.forEach(cell => cell.className = "cell");
  snake.forEach(i => cells[i].classList.add("snake"));
  cells[food].classList.add("food");
}

function placeFood() {
  do {
    food = Math.floor(Math.random() * cells.length);
  } while (snake.includes(food));
}

function move() {
  const head = snake[0];
  let newHead = head + direction;

  // wall collision
  if (
    (direction === 1 && head % size === size - 1) ||
    (direction === -1 && head % size === 0) ||
    (direction === size && head >= size * (size - 1)) ||
    (direction === -size && head < size) ||
    snake.includes(newHead)
  ) {
    clearInterval(interval);
    alert("💀 Game Over! Score: " + score);
    return;
  }

  snake.unshift(newHead);

  if (newHead === food) {
    score++;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function startGame() {
  clearInterval(interval);
  snake = [22, 21];
  direction = 1;
  score = 0;
  scoreEl.textContent = score;
  placeFood();
  draw();
  interval = setInterval(move, 250);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight" && direction !== -1) direction = 1;
  if (e.key === "ArrowLeft" && direction !== 1) direction = -1;
  if (e.key === "ArrowDown" && direction !== -size) direction = size;
  if (e.key === "ArrowUp" && direction !== size) direction = -size;
});

restartBtn.addEventListener("click", startGame);

// Init
createBoard();
startGame();
