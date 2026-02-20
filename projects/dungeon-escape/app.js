// Game constants
const GRID_SIZE = 15;
const CELL_SIZE = 40;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

// Game symbols
const SYMBOLS = {
    EMPTY: ' ',
    WALL: '#',
    PLAYER: '@',
    KEY: 'K',
    DOOR: 'D',
    TRAP: 'T',
    ENEMY: 'E',
    EXIT: 'X'
};

// Game state
let gameState = {
    grid: [],
    player: { x: 1, y: 1 },
    keys: 0,
    moves: 0,
    level: 1,
    gameRunning: true
};

// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const keysElement = document.getElementById('keys');
const movesElement = document.getElementById('moves');
const levelElement = document.getElementById('level');
const gameOverScreen = document.getElementById('gameOver');
const levelCompleteScreen = document.getElementById('levelComplete');
const gameOverMessage = document.getElementById('gameOverMessage');
const levelCompleteMessage = document.getElementById('levelCompleteMessage');

// Button event listeners
document.getElementById('restartBtn').addEventListener('click', restartLevel);
document.getElementById('newGameBtn').addEventListener('click', newGame);
document.getElementById('playAgainBtn').addEventListener('click', restartLevel);
document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);

// Keyboard input
document.addEventListener('keydown', handleKeyPress);

// Initialize game
function init() {
    generateLevel();
    updateUI();
    draw();
}

// Generate level based on current level
function generateLevel() {
    // Create empty grid
    gameState.grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(SYMBOLS.EMPTY));

    // Add walls around the border
    for (let i = 0; i < GRID_SIZE; i++) {
        gameState.grid[0][i] = SYMBOLS.WALL;
        gameState.grid[GRID_SIZE - 1][i] = SYMBOLS.WALL;
        gameState.grid[i][0] = SYMBOLS.WALL;
        gameState.grid[i][GRID_SIZE - 1] = SYMBOLS.WALL;
    }

    // Add some internal walls
    const wallCount = Math.min(20 + gameState.level * 5, 80);
    for (let i = 0; i < wallCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        } while (gameState.grid[y][x] !== SYMBOLS.EMPTY);
        gameState.grid[y][x] = SYMBOLS.WALL;
    }

    // Place player
    gameState.player = { x: 1, y: 1 };
    gameState.grid[1][1] = SYMBOLS.PLAYER;

    // Place keys
    const keyCount = Math.min(2 + Math.floor(gameState.level / 2), 5);
    for (let i = 0; i < keyCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        } while (gameState.grid[y][x] !== SYMBOLS.EMPTY);
        gameState.grid[y][x] = SYMBOLS.KEY;
    }

    // Place doors
    const doorCount = Math.min(1 + Math.floor(gameState.level / 3), 3);
    for (let i = 0; i < doorCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        } while (gameState.grid[y][x] !== SYMBOLS.EMPTY);
        gameState.grid[y][x] = SYMBOLS.DOOR;
    }

    // Place traps
    const trapCount = Math.min(3 + gameState.level, 10);
    for (let i = 0; i < trapCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        } while (gameState.grid[y][x] !== SYMBOLS.EMPTY);
        gameState.grid[y][x] = SYMBOLS.TRAP;
    }

    // Place enemies
    const enemyCount = Math.min(1 + Math.floor(gameState.level / 2), 4);
    for (let i = 0; i < enemyCount; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
            y = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        } while (gameState.grid[y][x] !== SYMBOLS.EMPTY);
        gameState.grid[y][x] = SYMBOLS.ENEMY;
    }

    // Place exit
    let exitX, exitY;
    do {
        exitX = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        exitY = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
    } while (gameState.grid[exitY][exitX] !== SYMBOLS.EMPTY);
    gameState.grid[exitY][exitX] = SYMBOLS.EXIT;

    // Reset game state
    gameState.keys = 0;
    gameState.moves = 0;
    gameState.gameRunning = true;
}

// Handle keyboard input
function handleKeyPress(event) {
    if (!gameState.gameRunning) return;

    let dx = 0, dy = 0;

    switch (event.key.toLowerCase()) {
        case 'w':
            dy = -1;
            break;
        case 's':
            dy = 1;
            break;
        case 'a':
            dx = -1;
            break;
        case 'd':
            dx = 1;
            break;
        default:
            return;
    }

    event.preventDefault();
    movePlayer(dx, dy);
}

// Move player
function movePlayer(dx, dy) {
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;

    // Check bounds
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        return;
    }

    const targetCell = gameState.grid[newY][newX];

    // Check if movement is blocked
    if (targetCell === SYMBOLS.WALL) {
        return;
    }

    if (targetCell === SYMBOLS.DOOR && gameState.keys === 0) {
        return;
    }

    // Clear current player position
    gameState.grid[gameState.player.y][gameState.player.x] = SYMBOLS.EMPTY;

    // Handle special cells
    if (targetCell === SYMBOLS.KEY) {
        gameState.keys++;
    } else if (targetCell === SYMBOLS.DOOR) {
        // Door is unlocked
    } else if (targetCell === SYMBOLS.TRAP) {
        gameOver('You stepped on a trap!');
        return;
    } else if (targetCell === SYMBOLS.ENEMY) {
        gameOver('You were caught by an enemy!');
        return;
    } else if (targetCell === SYMBOLS.EXIT) {
        levelComplete();
        return;
    }

    // Move player
    gameState.player.x = newX;
    gameState.player.y = newY;
    gameState.grid[newY][newX] = SYMBOLS.PLAYER;
    gameState.moves++;

    updateUI();
    draw();
}

// Game over
function gameOver(message) {
    gameState.gameRunning = false;
    gameOverMessage.textContent = message;
    gameOverScreen.classList.remove('hidden');
}

// Level complete
function levelComplete() {
    gameState.gameRunning = false;
    levelCompleteMessage.textContent = `You completed level ${gameState.level} in ${gameState.moves} moves!`;
    levelCompleteScreen.classList.remove('hidden');
}

// Restart level
function restartLevel() {
    gameOverScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');
    generateLevel();
    updateUI();
    draw();
}

// New game
function newGame() {
    gameState.level = 1;
    restartLevel();
}

// Next level
function nextLevel() {
    gameState.level++;
    levelCompleteScreen.classList.add('hidden');
    generateLevel();
    updateUI();
    draw();
}

// Update UI
function updateUI() {
    keysElement.textContent = `Keys: ${gameState.keys}`;
    movesElement.textContent = `Moves: ${gameState.moves}`;
    levelElement.textContent = `Level: ${gameState.level}`;
}

// Draw game
function draw() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = gameState.grid[y][x];
            const cellX = x * CELL_SIZE;
            const cellY = y * CELL_SIZE;

            // Draw cell background
            ctx.fillStyle = '#000';
            ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);

            // Draw cell border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE);

            // Draw cell content
            ctx.font = '24px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let color = '#fff';
            let symbol = '';

            switch (cell) {
                case SYMBOLS.WALL:
                    ctx.fillStyle = '#666';
                    ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                    break;
                case SYMBOLS.PLAYER:
                    symbol = '🧙';
                    break;
                case SYMBOLS.KEY:
                    symbol = '🗝️';
                    break;
                case SYMBOLS.DOOR:
                    symbol = '🚪';
                    break;
                case SYMBOLS.TRAP:
                    symbol = '💀';
                    break;
                case SYMBOLS.ENEMY:
                    symbol = '👹';
                    break;
                case SYMBOLS.EXIT:
                    symbol = '🚪';
                    color = '#0f0';
                    break;
            }

            if (symbol) {
                ctx.fillStyle = color;
                ctx.fillText(symbol, cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2);
            }
        }
    }
}

// Start the game
init();