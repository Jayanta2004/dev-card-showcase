const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const livesEl = document.getElementById('lives');
const streakEl = document.getElementById('streak');
const restartBtn = document.getElementById('restart');

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BASKET_WIDTH = 80;
const BASKET_HEIGHT = 20;
const FRUIT_RADIUS = 15;
const BASKET_SPEED = 5;
const BASE_POINTS = 10;
const STREAK_BONUS = 5;

let basket = {
  x: CANVAS_WIDTH / 2 - BASKET_WIDTH / 2,
  y: CANVAS_HEIGHT - BASKET_HEIGHT - 10,
  width: BASKET_WIDTH,
  height: BASKET_HEIGHT
};

let fruits = [];
let score = 0;
let best = localStorage.getItem('fruitCatcherBest') || 0;
let lives = 3;
let streak = 0;
let gameRunning = false;
let lastFruitSpawn = 0;
let fruitSpawnRate = 1000; // ms

// Fruit colors
const fruitColors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#800080'];

bestEl.textContent = best;

// Event listeners
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

restartBtn.addEventListener('click', startGame);

let keys = {};

// Game functions
function startGame() {
  basket.x = CANVAS_WIDTH / 2 - BASKET_WIDTH / 2;
  fruits = [];
  score = 0;
  lives = 3;
  streak = 0;
  gameRunning = true;
  lastFruitSpawn = Date.now();
  updateDisplay();
  gameLoop();
}

function updateDisplay() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  streakEl.textContent = streak;
}

function spawnFruit() {
  const x = Math.random() * (CANVAS_WIDTH - FRUIT_RADIUS * 2) + FRUIT_RADIUS;
  const speed = Math.random() * 3 + 1; // Random speed between 1 and 4
  const color = fruitColors[Math.floor(Math.random() * fruitColors.length)];
  fruits.push({
    x: x,
    y: -FRUIT_RADIUS,
    radius: FRUIT_RADIUS,
    speed: speed,
    color: color
  });
}

function update() {
  // Move basket
  if ((keys['a'] || keys['A'] || keys['ArrowLeft']) && basket.x > 0) {
    basket.x -= BASKET_SPEED;
  }
  if ((keys['d'] || keys['D'] || keys['ArrowRight']) && basket.x < CANVAS_WIDTH - BASKET_WIDTH) {
    basket.x += BASKET_SPEED;
  }

  // Spawn fruits
  const now = Date.now();
  if (now - lastFruitSpawn > fruitSpawnRate) {
    spawnFruit();
    lastFruitSpawn = now;
    // Gradually increase spawn rate
    fruitSpawnRate = Math.max(500, fruitSpawnRate - 10);
  }

  // Move fruits
  fruits.forEach(fruit => {
    fruit.y += fruit.speed;
  });

  // Check catches and misses
  fruits = fruits.filter(fruit => {
    // Check if caught
    if (fruit.y + fruit.radius >= basket.y &&
        fruit.x >= basket.x &&
        fruit.x <= basket.x + basket.width) {
      // Caught
      score += BASE_POINTS + (streak * STREAK_BONUS);
      streak++;
      updateDisplay();
      return false; // Remove fruit
    }
    // Check if missed (hit bottom)
    if (fruit.y - fruit.radius > CANVAS_HEIGHT) {
      lives--;
      streak = 0; // Reset streak on miss
      updateDisplay();
      if (lives <= 0) {
        gameOver();
      }
      return false; // Remove fruit
    }
    return true; // Keep fruit
  });
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#228B22';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw basket
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(basket.x, basket.y, basket.width, basket.height);

  // Draw fruits
  fruits.forEach(fruit => {
    ctx.fillStyle = fruit.color;
    ctx.beginPath();
    ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function gameOver() {
  gameRunning = false;
  if (score > best) {
    best = score;
    localStorage.setItem('fruitCatcherBest', best);
    bestEl.textContent = best;
  }
  alert(`Game Over! Score: ${score}`);
}

function gameLoop() {
  if (gameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

// Start the game initially
startGame();