const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');

const GRID_SIZE = 8;
const TILE_SIZE = canvas.width / GRID_SIZE;
const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

let grid = [];
let score = 0;
let timeLeft = 60;
let gameRunning = false;
let timerInterval;
let selectedTile = null;
let dragging = false;

function initGrid() {
    grid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            grid[i][j] = Math.floor(Math.random() * COLORS.length);
        }
    }
    // Ensure no initial matches
    while (checkMatches().length > 0) {
        removeMatches();
        dropTiles();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const x = i * TILE_SIZE;
            const y = j * TILE_SIZE;
            ctx.fillStyle = COLORS[grid[i][j]];
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
    }
}

function checkMatches() {
    const matches = [];
    // Horizontal
    for (let j = 0; j < GRID_SIZE; j++) {
        let count = 1;
        for (let i = 1; i < GRID_SIZE; i++) {
            if (grid[i][j] === grid[i-1][j]) {
                count++;
            } else {
                if (count >= 3) {
                    for (let k = i - count; k < i; k++) {
                        matches.push([k, j]);
                    }
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let k = GRID_SIZE - count; k < GRID_SIZE; k++) {
                matches.push([k, j]);
            }
        }
    }
    // Vertical
    for (let i = 0; i < GRID_SIZE; i++) {
        let count = 1;
        for (let j = 1; j < GRID_SIZE; j++) {
            if (grid[i][j] === grid[i][j-1]) {
                count++;
            } else {
                if (count >= 3) {
                    for (let k = j - count; k < j; k++) {
                        matches.push([i, k]);
                    }
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let k = GRID_SIZE - count; k < GRID_SIZE; k++) {
                matches.push([i, k]);
            }
        }
    }
    return matches;
}

function removeMatches() {
    const matches = checkMatches();
    matches.forEach(([i, j]) => {
        grid[i][j] = -1; // Mark for removal
        score += 10;
    });
    updateUI();
    return matches.length > 0;
}

function dropTiles() {
    for (let i = 0; i < GRID_SIZE; i++) {
        let writeIndex = GRID_SIZE - 1;
        for (let j = GRID_SIZE - 1; j >= 0; j--) {
            if (grid[i][j] !== -1) {
                grid[i][writeIndex] = grid[i][j];
                if (writeIndex !== j) {
                    grid[i][j] = -1;
                }
                writeIndex--;
            }
        }
        // Fill top with new tiles
        for (let j = 0; j <= writeIndex; j++) {
            grid[i][j] = Math.floor(Math.random() * COLORS.length);
        }
    }
}

function swapTiles(x1, y1, x2, y2) {
    const temp = grid[x1][y1];
    grid[x1][y1] = grid[x2][y2];
    grid[x2][y2] = temp;
}

function isAdjacent(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;
}

function updateUI() {
    scoreEl.textContent = `Score: ${score}`;
    timerEl.textContent = `Time: ${timeLeft}`;
}

function gameLoop() {
    if (!gameRunning) return;

    draw();

    if (removeMatches()) {
        dropTiles();
        // Continue checking for cascades
        setTimeout(gameLoop, 500); // Delay for animation
    } else {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    score = 0;
    timeLeft = 60;
    gameRunning = true;
    initGrid();
    updateUI();
    gameLoop();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateUI();
        if (timeLeft <= 0) {
            gameRunning = false;
            clearInterval(timerInterval);
            alert(`Game Over! Final Score: ${score}`);
        }
    }, 1000);
}

startBtn.addEventListener('click', () => {
    if (!gameRunning) {
        startGame();
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    selectedTile = {x, y};
    dragging = true;
});

canvas.addEventListener('mouseup', (e) => {
    if (!dragging || !gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    if (selectedTile && isAdjacent(selectedTile.x, selectedTile.y, x, y)) {
        swapTiles(selectedTile.x, selectedTile.y, x, y);
        if (!removeMatches()) {
            // Invalid move, swap back
            swapTiles(selectedTile.x, selectedTile.y, x, y);
        } else {
            dropTiles();
        }
    }
    selectedTile = null;
    dragging = false;
});