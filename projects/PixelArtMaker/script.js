const grid = document.getElementById("grid");
const gridSizeSelect = document.getElementById("gridSize");
const colorPicker = document.getElementById("colorPicker");

let drawMode = true;
let mouseDown = false;

// ---------- CREATE GRID ----------
function createGrid(size) {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  for (let i = 0; i < size * size; i++) {
    const pixel = document.createElement("div");
    pixel.className = "pixel";

    pixel.addEventListener("mousedown", () => paint(pixel));
    pixel.addEventListener("mouseover", () => {
      if (mouseDown) paint(pixel);
    });

    grid.appendChild(pixel);
  }
}

// ---------- PAINT ----------
function paint(pixel) {
  if (drawMode) {
    pixel.style.background = colorPicker.value;
  } else {
    pixel.style.background = "white";
  }
}

// ---------- GLOBAL MOUSE ----------
document.body.addEventListener("mousedown", () => mouseDown = true);
document.body.addEventListener("mouseup", () => mouseDown = false);

// ---------- CONTROLS ----------
document.getElementById("drawBtn").onclick = () => {
  drawMode = true;
};

document.getElementById("eraseBtn").onclick = () => {
  drawMode = false;
};

document.getElementById("clearBtn").onclick = () => {
  document.querySelectorAll(".pixel").forEach(p => {
    p.style.background = "white";
  });
};

gridSizeSelect.onchange = () => {
  createGrid(Number(gridSizeSelect.value));
};

// ---------- INIT ----------
createGrid(Number(gridSizeSelect.value));