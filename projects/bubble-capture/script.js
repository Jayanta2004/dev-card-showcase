const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");

let bubbles = [];
let score = 0;
let timeLeft = 30;
let gameRunning = false;

class Bubble {
  constructor() {
    this.radius = Math.random() * 15 + 15;
    this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
    this.y = canvas.height + this.radius;
    this.speed = Math.random() * 1.2 + 0.8;
    this.color = randomColor();
  }

  move() {
    this.y -= this.speed;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

function randomColor() {
  const colors = ["#5eead4", "#67e8f9", "#a7f3d0", "#99f6e4", "#c7d2fe"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach(bubble => {
    bubble.move();
    bubble.draw();
  });

  bubbles = bubbles.filter(b => b.y + b.radius > 0);

  if (gameRunning) {
    requestAnimationFrame(update);
  }
}

canvas.addEventListener("click", e => {
  if (!gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  bubbles.forEach((bubble, index) => {
    const dx = mouseX - bubble.x;
    const dy = mouseY - bubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < bubble.radius) {
      bubbles.splice(index, 1);
      score++;
      scoreEl.textContent = `Score: ${score}`;
    }
  });
});

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  bubbles = [];

  scoreEl.textContent = "Score: 0";
  timeEl.textContent = "Time: 30";

  update();

  const bubbleSpawner = setInterval(() => {
    if (!gameRunning) {
      clearInterval(bubbleSpawner);
      return;
    }
    bubbles.push(new Bubble());
  }, 700);

  const timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = `Time: ${timeLeft}`;

    if (timeLeft <= 0) {
      gameRunning = false;
      clearInterval(timer);
      alert(`Game Over! 🫧 Your Score: ${score}`);
    }
  }, 1000);
}

startBtn.addEventListener("click", startGame);
