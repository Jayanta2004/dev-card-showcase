const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const restartBtn = document.getElementById('restart');

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 600;
const BLOCK_HEIGHT = 30;
const INITIAL_BLOCK_WIDTH = 100;
const BLOCK_SPEED = 2;
const BLOCK_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

let stack = [];
let currentBlock = null;
let score = 0;
let best = localStorage.getItem('stackBuilderBest') || 0;
let gameRunning = false;
let direction = 1; // 1 right, -1 left

bestEl.textContent = best;

// Event listeners
canvas.addEventListener('click', dropBlock);
restartBtn.addEventListener('click', startGame);

// Game functions
function startGame() {
  stack = [{
    x: (CANVAS_WIDTH - INITIAL_BLOCK_WIDTH) / 2,
    y: CANVAS_HEIGHT - BLOCK_HEIGHT,
    width: INITIAL_BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    color: BLOCK_COLORS[0]
  }];
  currentBlock = {
    x: (CANVAS_WIDTH - INITIAL_BLOCK_WIDTH) / 2,
    y: CANVAS_HEIGHT - BLOCK_HEIGHT * 2,
    width: INITIAL_BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    color: BLOCK_COLORS[1]
  };
  score = 1;
  gameRunning = true;
  direction = 1;
  updateDisplay();
  gameLoop();
}

function dropBlock() {
  if (!gameRunning) return;

  const topBlock = stack[stack.length - 1];
  const overlap = calculateOverlap(currentBlock, topBlock);

  if (overlap <= 0) {
    gameOver();
    return;
  }

  // Place the block
  const newX = Math.max(currentBlock.x, topBlock.x);
  const newWidth = overlap;
  const newY = topBlock.y - BLOCK_HEIGHT;

  stack.push({
    x: newX,
    y: newY,
    width: newWidth,
    height: BLOCK_HEIGHT,
    color: BLOCK_COLORS[stack.length % BLOCK_COLORS.length]
  });

  score++;
  updateDisplay();

  // Create next block
  currentBlock = {
    x: newX + (newWidth - newWidth) / 2, // Center on the new block
    y: newY - BLOCK_HEIGHT,
    width: newWidth,
    height: BLOCK_HEIGHT,
    color: BLOCK_COLORS[(stack.length + 1) % BLOCK_COLORS.length]
  };

  // Reset direction
  direction = 1;
}

function calculateOverlap(block1, block2) {
  const left = Math.max(block1.x, block2.x);
  const right = Math.min(block1.x + block1.width, block2.x + block2.width);
  return Math.max(0, right - left);
}

function gameOver() {
  gameRunning = false;
  if (score > best) {
    best = score;
    localStorage.setItem('stackBuilderBest', best);
    bestEl.textContent = best;
  }
  alert(`Tower collapsed! Score: ${score}`);
}

function updateDisplay() {
  scoreEl.textContent = score;
}

function update() {
  if (!currentBlock) return;

  currentBlock.x += direction * BLOCK_SPEED;

  // Change direction at edges
  if (currentBlock.x <= 0 || currentBlock.x + currentBlock.width >= CANVAS_WIDTH) {
    direction *= -1;
  }
}

function draw() {
  // Clear canvas
  ctx.fillStyle = '#2F4F4F';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw stack
  stack.forEach(block => {
    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, block.y, block.width, block.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(block.x, block.y, block.width, block.height);
  });

  // Draw current block
  if (currentBlock) {
    ctx.fillStyle = currentBlock.color;
    ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
  }
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