const game = document.querySelector(".game");
const cloud = document.querySelector(".cloud");
const scoreEl = document.getElementById("score");

const overlay = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");

let gameStarted = false;
let gameOver = false;
let score = 0;

/* Game size */
let gameHeight = window.innerHeight;
let gameWidth = window.innerWidth;

/* Cloud physics */
let cloudTop = gameHeight / 2 - 20; // CENTER CLOUD
let gravity = 2;
let jumpUp = -30;
let jumpDown = 20;

/* Apply initial position */
cloud.style.top = cloudTop + "px";

/* ---------------- START GAME ---------------- */
startBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  gameStarted = true;
});

/* ---------------- CONTROLS ---------------- */
document.addEventListener("keydown", (e) => {
  if (!gameStarted || gameOver) return;

  if (e.code === "ArrowUp") cloudTop += jumpUp;
  if (e.code === "ArrowDown") cloudTop += jumpDown;

  cloud.style.top = cloudTop + "px";
});

game.addEventListener("click", () => {
  if (!gameStarted || gameOver) return;
  cloudTop += jumpUp;
  cloud.style.top = cloudTop + "px";
});

/* ---------------- GRAVITY ---------------- */
setInterval(() => {
  if (!gameStarted || gameOver) return;

  cloudTop += gravity;
  cloud.style.top = cloudTop + "px";

  if (cloudTop <= 0 || cloudTop >= gameHeight - 50) {
    endGame();
  }
}, 20);

/* ---------------- CREATE PIPES ---------------- */
function createPipe() {
  if (!gameStarted || gameOver) return;

  const gap = 260; // bigger gap = better UX
  const minHeight = 120;
  const pipeTopHeight =
    Math.floor(Math.random() * (gameHeight - gap - 300)) + minHeight;

  const topPipe = document.createElement("div");
  const bottomPipe = document.createElement("div");

  topPipe.className = "pipe top";
  bottomPipe.className = "pipe bottom";

  topPipe.style.height = pipeTopHeight + "px";
  bottomPipe.style.height =
    gameHeight - pipeTopHeight - gap + "px";

  topPipe.style.left = gameWidth + "px";
  bottomPipe.style.left = gameWidth + "px";

  game.appendChild(topPipe);
  game.appendChild(bottomPipe);

  let pipeX = gameWidth;
  let scored = false;

  const movePipe = setInterval(() => {
    if (gameOver) {
      clearInterval(movePipe);
      return;
    }

    pipeX -= 3;
    topPipe.style.left = pipeX + "px";
    bottomPipe.style.left = pipeX + "px";

    /* SCORE (only once per pipe) */
    if (!scored && pipeX + 70 < 70) {
      score++;
      scoreEl.textContent = score;
      scored = true;
    }

    /* COLLISION */
    if (
      pipeX < 140 &&
      pipeX > 30 &&
      (cloudTop < pipeTopHeight ||
        cloudTop > pipeTopHeight + gap)
    ) {
      endGame();
    }

    /* REMOVE */
    if (pipeX < -100) {
      topPipe.remove();
      bottomPipe.remove();
      clearInterval(movePipe);
    }
  }, 20);
}

/* ---------------- PIPE TIMER ---------------- */
setInterval(createPipe, 3000);

/* ---------------- GAME OVER ---------------- */
function endGame() {
  if (gameOver) return;

  gameOver = true;

  title.textContent = "☁️ Game Over";
  subtitle.textContent = `Score: ${score}`;

  startBtn.style.display = "none";
  restartBtn.style.display = "block";
  overlay.style.display = "flex";
}

/* ---------------- RESTART ---------------- */
restartBtn.addEventListener("click", () => {
  location.reload();
});
