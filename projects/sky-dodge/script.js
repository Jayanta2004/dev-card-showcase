const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const livesEl = document.getElementById('lives');
const speedEl = document.getElementById('speed');
const restartBtn = document.getElementById('restart');

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 20;
const BLOCK_WIDTH = 40;
const BLOCK_HEIGHT = 20;
const PLAYER_SPEED = 5;
const INITIAL_BLOCK_SPEED = 2;
const SPEED_INCREMENT = 0.1;
const SPEED_INTERVAL = 2000; // ms

let player = {
  x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
  y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
  width: PLAYER_WIDTH,
  height: PLAYER_HEIGHT
};

let blocks = [];
let score = 0;
let best = localStorage.getItem('skyDodgeBest') || 0;
let lives = 3;
let speedMultiplier = 1.0;
let gameRunning = false;
let lastSpeedIncrease = Date.now();
let keys = {};

bestEl.textContent = best;

// Event listeners
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

restartBtn.addEventListener('click', startGame);

// Game functions
function startGame() {
  player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
  blocks = [];
  score = 0;
  lives = 3;
  speedMultiplier = 1.0;
  gameRunning = true;
  lastSpeedIncrease = Date.now();
  updateDisplay();
  gameLoop();
}

function updateDisplay() {
  scoreEl.textContent = Math.floor(score);
  livesEl.textContent = lives;
  speedEl.textContent = speedMultiplier.toFixed(1) + 'x';
}

function spawnBlock() {
  const x = Math.random() * (CANVAS_WIDTH - BLOCK_WIDTH);
  blocks.push({
    x: x,
    y: -BLOCK_HEIGHT,
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT
  });
}

function update() {
  // Move player
  if ((keys['a'] || keys['A'] || keys['ArrowLeft']) && player.x > 0) {
    player.x -= PLAYER_SPEED;
  }
  if ((keys['d'] || keys['D'] || keys['ArrowRight']) && player.x < CANVAS_WIDTH - PLAYER_WIDTH) {
    player.x += PLAYER_SPEED;
  }

  // Increase speed over time
  const now = Date.now();
  if (now - lastSpeedIncrease > SPEED_INTERVAL) {
    speedMultiplier += SPEED_INCREMENT;
    lastSpeedIncrease = now;
  }

  // Move blocks
  const currentSpeed = INITIAL_BLOCK_SPEED * speedMultiplier;
  blocks.forEach(block => {
    block.y += currentSpeed;
  });

  // Remove off-screen blocks
  blocks = blocks.filter(block => block.y < CANVAS_HEIGHT);

  // Spawn new blocks
  if (Math.random() < 0.02 * speedMultiplier) {
    spawnBlock();
  }

  // Check collisions
  blocks.forEach(block => {
    if (player.x < block.x + block.width &&
        player.x + player.width > block.x &&
        player.y < block.y + block.height &&
        player.y + player.height > block.y) {
      lives--;
      updateDisplay();
      if (lives <= 0) {
        gameOver();
      } else {
        // Reset player position
        player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
        // Remove the block that hit
        blocks = blocks.filter(b => b !== block);
      }
    }
  });

  // Update score
  score += 0.1 * speedMultiplier;
  updateDisplay();
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#000033';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw player
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw blocks
  ctx.fillStyle = '#FF0000';
  blocks.forEach(block => {
    ctx.fillRect(block.x, block.y, block.width, block.height);
  });
}

function gameOver() {
  gameRunning = false;
  if (Math.floor(score) > best) {
    best = Math.floor(score);
    localStorage.setItem('skyDodgeBest', best);
    bestEl.textContent = best;
  }
  alert(`Game Over! Score: ${Math.floor(score)}`);
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