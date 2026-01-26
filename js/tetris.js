document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-canvas');
    const nextCtx = nextCanvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const linesEl = document.getElementById('lines');
    const levelEl = document.getElementById('level');
    const gameOverEl = document.getElementById('game-over');

    const ROWS = 20;
    const COLS = 10;
    const BLOCK_SIZE = 30;
    const colors = ['#000', '#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff', '#fff'];

    let grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    let currentPiece = null;
    let nextPiece = null;
    let score = 0;
    let lines = 0;
    let level = 1;
    let dropTime = 1000;
    let lastTime = 0;
    let gameOver = false;

    // Tetrominoes
    const pieces = [
        { // I
            shape: [
                [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
                [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
                [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0],
                [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0]
            ],
            color: 1
        },
        { // O
            shape: [
                [0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0],
                [0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0],
                [0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0],
                [0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0]
            ],
            color: 2
        },
        { // T
            shape: [
                [0,0,0,0,0,1,0,0,0,1,1,1,0,0,0,0],
                [0,0,0,0,0,1,0,0,0,0,1,1,0,0,1,0],
                [0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,0],
                [0,0,0,0,0,1,0,0,1,1,0,0,0,1,0,0]
            ],
            color: 3
        },
        { // S
            shape: [
                [0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0],
                [0,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0],
                [0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0],
                [0,0,0,0,0,1,0,0,1,1,0,0,0,1,0,0]
            ],
            color: 4
        },
        { // Z
            shape: [
                [0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0],
                [0,0,0,0,0,0,1,0,0,1,1,0,0,1,0,0],
                [0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0],
                [0,0,0,0,0,1,0,0,1,1,0,0,0,0,1,0]
            ],
            color: 5
        },
        { // J
            shape: [
                [0,0,0,0,0,1,0,0,0,1,0,0,0,1,1,1],
                [0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,0],
                [0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1],
                [0,0,0,0,0,1,0,0,0,1,0,0,1,1,0,0]
            ],
            color: 6
        },
        { // L
            shape: [
                [0,0,0,0,0,0,0,1,0,1,0,0,0,1,1,1],
                [0,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,1,1,1,0,1,0,0],
                [0,0,0,0,0,1,0,0,0,1,0,0,0,1,1,0]
            ],
            color: 7
        }
    ];

    function createPiece(type) {
        return {
            type: type,
            rotation: 0,
            x: Math.floor(COLS / 2) - 2,
            y: 0,
            shape: pieces[type].shape[0],
            color: pieces[type].color
        };
    }

    function getShape(piece) {
        return pieces[piece.type].shape[piece.rotation];
    }

    function drawBlock(x, y, color) {
        ctx.fillStyle = colors[color];
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw grid
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (grid[y][x]) {
                    drawBlock(x, y, grid[y][x]);
                }
            }
        }
        // Draw current piece
        if (currentPiece) {
            const shape = getShape(currentPiece);
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (shape[y * 4 + x]) {
                        drawBlock(currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                    }
                }
            }
        }
        // Draw next piece
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (nextPiece) {
            const shape = getShape(nextPiece);
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (shape[y * 4 + x]) {
                        nextCtx.fillStyle = colors[nextPiece.color];
                        nextCtx.fillRect(x * 20 + 20, y * 20 + 20, 20, 20);
                        nextCtx.strokeStyle = '#fff';
                        nextCtx.strokeRect(x * 20 + 20, y * 20 + 20, 20, 20);
                    }
                }
            }
        }
    }

    function collision(piece, dx = 0, dy = 0, rotation = piece.rotation) {
        const shape = pieces[piece.type].shape[rotation];
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y * 4 + x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && grid[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function merge() {
        const shape = getShape(currentPiece);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (shape[y * 4 + x]) {
                    grid[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
                }
            }
        }
    }

    function clearLines() {
        let linesCleared = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (grid[y].every(cell => cell !== 0)) {
                grid.splice(y, 1);
                grid.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++; // Check same line again
            }
        }
        if (linesCleared > 0) {
            lines += linesCleared;
            score += linesCleared * 100 * level;
            linesEl.textContent = lines;
            scoreEl.textContent = score;
            level = Math.floor(lines / 10) + 1;
            levelEl.textContent = level;
            dropTime = Math.max(100, 1000 - (level - 1) * 100);
        }
    }

    function drop() {
        if (!collision(currentPiece, 0, 1)) {
            currentPiece.y++;
        } else {
            merge();
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createPiece(Math.floor(Math.random() * pieces.length));
            if (collision(currentPiece)) {
                gameOver = true;
                gameOverEl.classList.remove('hidden');
            }
        }
    }

    function move(dx) {
        if (!collision(currentPiece, dx, 0)) {
            currentPiece.x += dx;
        }
    }

    function rotate() {
        const newRotation = (currentPiece.rotation + 1) % 4;
        if (!collision(currentPiece, 0, 0, newRotation)) {
            currentPiece.rotation = newRotation;
            currentPiece.shape = pieces[currentPiece.type].shape[newRotation];
        }
    }

    function hardDrop() {
        while (!collision(currentPiece, 0, 1)) {
            currentPiece.y++;
        }
        drop();
    }

    function reset() {
        grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
        currentPiece = createPiece(Math.floor(Math.random() * pieces.length));
        nextPiece = createPiece(Math.floor(Math.random() * pieces.length));
        score = 0;
        lines = 0;
        level = 1;
        dropTime = 1000;
        gameOver = false;
        gameOverEl.classList.add('hidden');
        scoreEl.textContent = score;
        linesEl.textContent = lines;
        levelEl.textContent = level;
    }

    // Controls
    document.addEventListener('keydown', (e) => {
        if (gameOver) {
            if (e.key === 'r') reset();
            return;
        }
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
                move(-1);
                break;
            case 'ArrowRight':
            case 'd':
                move(1);
                break;
            case 'ArrowDown':
            case 's':
                drop();
                break;
            case 'ArrowUp':
            case 'w':
                rotate();
                break;
            case ' ':
                e.preventDefault();
                hardDrop();
                break;
            case 'r':
                reset();
                break;
        }
    });

    // Game loop
    function gameLoop(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        if (deltaTime > dropTime && !gameOver) {
            drop();
        }
        draw();
        requestAnimationFrame(gameLoop);
    }

    reset();
    gameLoop();
});