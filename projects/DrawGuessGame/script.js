const words = [
  "astronaut", "elephant", "castle", "robot", "pizza", "butterfly",
  "airplane", "tree", "car", "guitar", "house", "dragon",
  "mountain", "cat", "phone", "flower", "rocket", "fish",
  "bicycle", "umbrella", "camera", "lion", "bridge", "ship"
];

const board = document.getElementById("board");
const ctx = board.getContext("2d");
const wordDisplay = document.getElementById("wordDisplay");
const submitBtn = document.getElementById("submitBtn");
const resultBox = document.getElementById("result");

let drawing = false;
let currentWord = "";

function resizeCanvas() {
  const rect = board.getBoundingClientRect();
  board.width = rect.width;
  board.height = rect.height;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function startGame() {
  currentWord = words[Math.floor(Math.random() * words.length)];
  wordDisplay.textContent = `Draw: ${currentWord}`;
  ctx.clearRect(0, 0, board.width, board.height);
  resultBox.classList.add("hidden");
}

board.addEventListener("pointerdown", (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

board.addEventListener("pointermove", (e) => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();
});

board.addEventListener("pointerup", () => {
  drawing = false;
});

submitBtn.addEventListener("click", () => {
  const img = ctx.getImageData(0, 0, board.width, board.height);
  let filled = 0;

  for (let i = 0; i < img.data.length; i += 4) {
    if (img.data[i + 3] > 0) filled++;
  }

  const density = filled / (board.width * board.height);
  let score = Math.floor(40 + density * 60 + Math.random() * 10);
  if (score > 100) score = 100;

  resultBox.innerHTML = `
    <h2>AI Match Score</h2>
    <p><strong>${score}%</strong> match for "<em>${currentWord}</em>"</p>
    <button onclick="startGame()">Play Again</button>
  `;
  resultBox.classList.remove("hidden");
});

startGame();
