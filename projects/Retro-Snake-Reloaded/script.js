// Retro Snake Reloaded Game Logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game variables
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem('retroSnakeHighScore')) || 0;
let gameRunning = true;
let gameLoopId;
let speed = 200; // milliseconds

// Initialize game
function initGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    speed = 200;
    gameRunning = true;
    generateFood();
    updateScoreDisplay();
    startGameLoop();
}

// Generate random food position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Draw game elements
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#00ff41';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    // Draw snake head with different color
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
    
    // Draw food
    ctx.fillStyle = '#ff0041';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    
    // Draw grid lines for retro effect
    ctx.strokeStyle = '#001a00';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// Move snake
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Add new head
    snake.unshift(head);
    
    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        generateFood();
        
        // Increase speed
        speed = Math.max(50, speed - 5);
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('retroSnakeHighScore', highScore);
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Check collisions
function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    clearTimeout(gameLoopId);
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff0041';
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('PRESS SPACE TO RESTART', canvas.width / 2, canvas.height / 2 + 20);
}

// Update score display
function updateScoreDisplay() {
    currentScoreEl.textContent = `SCORE: ${score.toString().padStart(5, '0')}`;
    highScoreEl.textContent = `HIGH SCORE: ${highScore.toString().padStart(5, '0')}`;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    moveSnake();
    checkCollision();
    drawGame();
    updateScoreDisplay();
    
    gameLoopId = setTimeout(gameLoop, speed);
}

// Start game loop
function startGameLoop() {
    gameLoopId = setTimeout(gameLoop, speed);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.code === 'Space') {
        initGame();
        return;
    }
    
    if (!gameRunning) return;
    
    const key = e.key;
    
    // Prevent reverse direction
    if (key === 'ArrowUp' && dy === 0) {
        dx = 0;
        dy = -1;
    } else if (key === 'ArrowDown' && dy === 0) {
        dx = 0;
        dy = 1;
    } else if (key === 'ArrowLeft' && dx === 0) {
        dx = -1;
        dy = 0;
    } else if (key === 'ArrowRight' && dx === 0) {
        dx = 1;
        dy = 0;
    }
});

// Prevent arrow keys from scrolling the page
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.key)) {
        e.preventDefault();
    }
});

// Initialize the game
initGame();