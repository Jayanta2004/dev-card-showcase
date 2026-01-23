const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('start-btn');

const MAZE_SIZE = 20;
const CELL_SIZE = canvas.width / MAZE_SIZE;
const WALL = 1;
const PATH = 0;

let maze = [];
let player = { x: 1, y: 1 };
let exit = { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 };
let startTime;
let gameRunning = false;
let highScore = localStorage.getItem('ratEscapeHighScore') || Infinity;

function generateMaze() {
    // Initialize maze with walls
    maze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(WALL));

    // Recursive backtracking
    function carve(x, y) {
        maze[y][x] = PATH;
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        directions.sort(() => Math.random() - 0.5);

        for (const [dx, dy] of directions) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;
            if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && maze[ny][nx] === WALL) {
                maze[y + dy][x + dx] = PATH;
                carve(nx, ny);
            }
        }
    }

    carve(1, 1);
    // Ensure start and exit are paths
    maze[1][1] = PATH;
    maze[MAZE_SIZE - 2][MAZE_SIZE - 2] = PATH;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
            if (maze[y][x] === WALL) {
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                // Add border
                ctx.strokeStyle = '#34495e';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else {
                // Path with subtle pattern
                ctx.fillStyle = '#ecf0f1';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    // Draw player (rat)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(player.x * CELL_SIZE + CELL_SIZE / 2, player.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x * CELL_SIZE + CELL_SIZE / 2 - 3, player.y * CELL_SIZE + CELL_SIZE / 2 - 3, 2, 0, Math.PI * 2);
    ctx.arc(player.x * CELL_SIZE + CELL_SIZE / 2 + 3, player.y * CELL_SIZE + CELL_SIZE / 2 - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw exit (cheese)
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(exit.x * CELL_SIZE + 5, exit.y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
    // Cheese holes
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(exit.x * CELL_SIZE + CELL_SIZE / 2 - 5, exit.y * CELL_SIZE + CELL_SIZE / 2 - 5, 2, 0, Math.PI * 2);
    ctx.arc(exit.x * CELL_SIZE + CELL_SIZE / 2 + 5, exit.y * CELL_SIZE + CELL_SIZE / 2 + 5, 2, 0, Math.PI * 2);
    ctx.fill();
}

function movePlayer(dx, dy) {
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && maze[ny][nx] === PATH) {
        player.x = nx;
        player.y = ny;
        if (!startTime) {
            startTime = Date.now();
            statusEl.textContent = 'Playing...';
        }
        if (player.x === exit.x && player.y === exit.y) {
            const time = Math.floor((Date.now() - startTime) / 1000);
            scoreEl.textContent = `Time: ${time}s`;
            gameRunning = false;
            statusEl.textContent = `Escaped in ${time}s!`;
            if (time < highScore) {
                highScore = time;
                localStorage.setItem('ratEscapeHighScore', highScore);
                statusEl.textContent += ` New High Score!`;
            }
            playSound();
        }
        draw();
    }
}

function playSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
}

function startGame() {
    generateMaze();
    player = { x: 1, y: 1 };
    startTime = null;
    gameRunning = true;
    scoreEl.textContent = `Time: 0s (Best: ${highScore === Infinity ? 'N/A' : highScore + 's'})`;
    statusEl.textContent = 'Ready to play!';
    draw();
}

startBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            e.preventDefault();
            movePlayer(0, -1);
            break;
        case 's':
        case 'ArrowDown':
            e.preventDefault();
            movePlayer(0, 1);
            break;
        case 'a':
        case 'ArrowLeft':
            e.preventDefault();
            movePlayer(-1, 0);
            break;
        case 'd':
        case 'ArrowRight':
            e.preventDefault();
            movePlayer(1, 0);
            break;
    }
});

// Initial draw
generateMaze();
draw();