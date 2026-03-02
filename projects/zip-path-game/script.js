const grid = document.getElementById("grid");
const size = 5;

let isDrawing = false;
let currentTarget = 1;
let path = [];

// Number positions
const numbers = {
  1: 20,
  2: 0,
  3: 4,
  4: 24
};

// Create grid
for (let i = 0; i < size * size; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;

  for (let num in numbers) {
    if (numbers[num] == i) {
      cell.textContent = num;
      cell.classList.add("number");
      cell.dataset.number = num;
    }
  }

  grid.appendChild(cell);
}

const cells = document.querySelectorAll(".cell");

// Mouse events
grid.addEventListener("mousedown", e => {
  if (e.target.classList.contains("cell")) {
    startDraw(e.target);
  }
});

grid.addEventListener("mouseover", e => {
  if (isDrawing && e.target.classList.contains("cell")) {
    draw(e.target);
  }
});

document.addEventListener("mouseup", () => {
  isDrawing = false;
});

// Touch events
grid.addEventListener("touchstart", e => {
  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (el && el.classList.contains("cell")) {
    startDraw(el);
  }
});

grid.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (isDrawing && el && el.classList.contains("cell")) {
    draw(el);
  }
});

document.addEventListener("touchend", () => {
  isDrawing = false;
});

function startDraw(cell) {
  if (parseInt(cell.dataset.number) === 1) {
    resetGame();
    isDrawing = true;
    addPath(cell);
  }
}

function draw(cell) {
  if (!path.includes(cell)) {
    addPath(cell);
  }
}

function addPath(cell) {
  cell.classList.add("path");
  path.push(cell);

  if (parseInt(cell.dataset.number) === currentTarget) {
    currentTarget++;
    if (currentTarget > Object.keys(numbers).length) {
      setTimeout(() => alert("🎉 Completed!"), 200);
    }
  }
}

function resetGame() {
  path.forEach(c => c.classList.remove("path"));
  path = [];
  currentTarget = 1;
}