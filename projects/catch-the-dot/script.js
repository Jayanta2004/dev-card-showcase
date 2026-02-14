const dot = document.getElementById("dot");
const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");

let score = 0;
let timeLeft = 30;
let timer;
let active = false;

function randomPosition() {
  const maxX = gameArea.clientWidth - dot.offsetWidth;
  const maxY = gameArea.clientHeight - dot.offsetHeight;

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
}

dot.addEventListener("click", () => {
  if (!active) return;
  score++;
  scoreEl.textContent = score;
  randomPosition();
});

function startGame() {
  score = 0;
  timeLeft = 30;
  active = true;

  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;

  randomPosition();

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      active = false;
      alert(`Game Over! Your score: ${score}`);
    }
  }, 1000);
}

startBtn.addEventListener("click", startGame);
