const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const timeEl = document.getElementById('time');
const accuracyEl = document.getElementById('accuracy');
const startBtn = document.getElementById('start');

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BUBBLE_COUNT = 10;
const BUBBLE_RADIUS = 20;
const GAME_TIME = 30; // seconds
const CHAIN_TIME = 500; // ms for chain bonus
const CHAIN_BONUS = 5;

let bubbles = [];
let score = 0;
let best = localStorage.getItem('bubblePopBlitzBest') || 0;
let timeLeft = GAME_TIME;
let gameRunning = false;
let lastPopTime = 0;
let totalClicks = 0;
let successfulPops = 0;
let timerInterval;

bestEl.textContent = best;

// Bubble class
class Bubble {
  constructor() {
    this.x = Math.random() * (CANVAS_WIDTH - BUBBLE_RADIUS * 2) + BUBBLE_RADIUS;
    this.y = Math.random() * (CANVAS_HEIGHT - BUBBLE_RADIUS * 2) + BUBBLE_RADIUS;
    this.radius = BUBBLE_RADIUS;
    this.vx = (Math.random() - 0.5) * 2; // Random velocity
    this.vy = (Math.random() - 0.5) * 2;
    this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x - this.radius < 0 || this.x + this.radius > CANVAS_WIDTH) {
      this.vx *= -1;
    }
    if (this.y - this.radius < 0 || this.y + this.radius > CANVAS_HEIGHT) {
      this.vy *= -1;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  isClicked(mouseX, mouseY) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }
}

// Event listeners
canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;

  totalClicks++;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (let i = bubbles.length - 1; i >= 0; i--) {
    if (bubbles[i].isClicked(mouseX, mouseY)) {
      // Pop the bubble
      bubbles.splice(i, 1);
      successfulPops++;

      // Chain bonus
      const now = Date.now();
      if (now - lastPopTime < CHAIN_TIME) {
        score += CHAIN_BONUS;
      }
      score++;
      lastPopTime = now;

      // Spawn new bubble
      bubbles.push(new Bubble());

      updateDisplay();
      break; // Only pop one bubble per click
    }
  }
});

startBtn.addEventListener('click', startGame);

// Game functions
function startGame() {
  bubbles = [];
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    bubbles.push(new Bubble());
  }
  score = 0;
  timeLeft = GAME_TIME;
  gameRunning = true;
  totalClicks = 0;
  successfulPops = 0;
  lastPopTime = 0;
  updateDisplay();
  startBtn.disabled = true;

  timerInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  gameLoop();
}

function endGame() {
  gameRunning = false;
  clearInterval(timerInterval);
  startBtn.disabled = false;

  if (score > best) {
    best = score;
    localStorage.setItem('bubblePopBlitzBest', best);
    bestEl.textContent = best;
  }

  const accuracy = totalClicks > 0 ? Math.round((successfulPops / totalClicks) * 100) : 100;
  alert(`Time's up! Score: ${score}\nAccuracy: ${accuracy}%`);
}

function updateDisplay() {
  scoreEl.textContent = score;
  const accuracy = totalClicks > 0 ? Math.round((successfulPops / totalClicks) * 100) : 100;
  accuracyEl.textContent = accuracy + '%';
}

function update() {
  bubbles.forEach(bubble => bubble.update());
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#000033';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw bubbles
  bubbles.forEach(bubble => bubble.draw());
}

function gameLoop() {
  if (gameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}