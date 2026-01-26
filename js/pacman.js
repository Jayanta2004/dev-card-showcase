document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pacman-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    const gameOverEl = document.getElementById('game-over');
    const winEl = document.getElementById('win');

    const BLOCK_SIZE = 30;
    const ROWS = 20;
    const COLS = 20;

    let maze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,1],
        [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
        [1,1,1,1,2,1,1,1,0,1,1,0,1,1,1,2,1,1,1,1],
        [0,0,0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
        [1,1,1,1,2,1,0,1,1,0,0,1,1,0,1,2,1,1,1,1],
        [0,0,0,0,2,0,0,1,0,0,0,0,1,0,0,2,0,0,0,0],
        [1,1,1,1,2,1,0,1,1,1,1,1,1,0,1,2,1,1,1,1],
        [0,0,0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
        [1,1,1,1,2,1,0,1,1,0,0,1,1,0,1,2,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
        [1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1],
        [1,1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,1,1],
        [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    let player = { x: 9, y: 15 };
    let ghosts = [
        { x: 9, y: 9, dx: 0, dy: -1, color: '#ff0000' },
        { x: 10, y: 9, dx: 0, dy: 1, color: '#00ffff' },
        { x: 9, y: 10, dx: -1, dy: 0, color: '#ffb8ff' },
        { x: 10, y: 10, dx: 1, dy: 0, color: '#ffb852' }
    ];
    let score = 0;
    let lives = 3;
    let gameOver = false;
    let win = false;

    // Audio
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(frequency, duration) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (maze[y][x] === 1) {
                    ctx.fillStyle = '#0000ff';
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                } else if (maze[y][x] === 2) {
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(x * BLOCK_SIZE + BLOCK_SIZE / 2, y * BLOCK_SIZE + BLOCK_SIZE / 2, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        // Draw player
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(player.x * BLOCK_SIZE + BLOCK_SIZE / 2, player.y * BLOCK_SIZE + BLOCK_SIZE / 2, BLOCK_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        // Draw ghosts
        ghosts.forEach(ghost => {
            ctx.fillStyle = ghost.color;
            ctx.beginPath();
            ctx.arc(ghost.x * BLOCK_SIZE + BLOCK_SIZE / 2, ghost.y * BLOCK_SIZE + BLOCK_SIZE / 2, BLOCK_SIZE / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function movePlayer(dx, dy) {
        const newX = player.x + dx;
        const newY = player.y + dy;
        if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS && maze[newY][newX] !== 1) {
            player.x = newX;
            player.y = newY;
            if (maze[newY][newX] === 2) {
                maze[newY][newX] = 0;
                score += 10;
                scoreEl.textContent = score;
                playSound(800, 0.1);
                // Check win
                if (!maze.flat().includes(2)) {
                    win = true;
                    winEl.classList.remove('hidden');
                }
            }
        }
    }

    function moveGhosts() {
        ghosts.forEach(ghost => {
            let directions = [
                { dx: 0, dy: -1 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 },
                { dx: 1, dy: 0 }
            ];
            // Simple AI: prefer current direction, else random
            let possible = directions.filter(dir => {
                const newX = ghost.x + dir.dx;
                const newY = ghost.y + dir.dy;
                return newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS && maze[newY][newX] !== 1;
            });
            if (possible.length > 0) {
                // Prefer current direction
                let preferred = possible.find(dir => dir.dx === ghost.dx && dir.dy === ghost.dy);
                if (!preferred) preferred = possible[Math.floor(Math.random() * possible.length)];
                ghost.x += preferred.dx;
                ghost.y += preferred.dy;
                ghost.dx = preferred.dx;
                ghost.dy = preferred.dy;
            }
        });
    }

    function checkCollisions() {
        ghosts.forEach(ghost => {
            if (ghost.x === player.x && ghost.y === player.y) {
                lives--;
                livesEl.textContent = lives;
                if (lives === 0) {
                    gameOver = true;
                    gameOverEl.classList.remove('hidden');
                } else {
                    // Reset positions
                    player.x = 9;
                    player.y = 15;
                    ghosts.forEach(g => {
                        g.x = 9 + Math.floor(Math.random() * 2);
                        g.y = 9 + Math.floor(Math.random() * 2);
                    });
                }
                playSound(200, 0.5);
            }
        });
    }

    function reset() {
        maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,1],
            [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
            [1,1,1,1,2,1,1,1,0,1,1,0,1,1,1,2,1,1,1,1],
            [0,0,0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
            [1,1,1,1,2,1,0,1,1,0,0,1,1,0,1,2,1,1,1,1],
            [0,0,0,0,2,0,0,1,0,0,0,0,1,0,0,2,0,0,0,0],
            [1,1,1,1,2,1,0,1,1,1,1,1,1,0,1,2,1,1,1,1],
            [0,0,0,1,2,1,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
            [1,1,1,1,2,1,0,1,1,0,0,1,1,0,1,2,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
            [1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1],
            [1,1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,1,1],
            [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        player = { x: 9, y: 15 };
        ghosts = [
            { x: 9, y: 9, dx: 0, dy: -1, color: '#ff0000' },
            { x: 10, y: 9, dx: 0, dy: 1, color: '#00ffff' },
            { x: 9, y: 10, dx: -1, dy: 0, color: '#ffb8ff' },
            { x: 10, y: 10, dx: 1, dy: 0, color: '#ffb852' }
        ];
        score = 0;
        lives = 3;
        gameOver = false;
        win = false;
        scoreEl.textContent = score;
        livesEl.textContent = lives;
        gameOverEl.classList.add('hidden');
        winEl.classList.add('hidden');
    }

    // Controls
    document.addEventListener('keydown', (e) => {
        if (gameOver || win) {
            if (e.key === 'r') reset();
            return;
        }
        switch (e.key) {
            case 'ArrowUp':
                movePlayer(0, -1);
                break;
            case 'ArrowDown':
                movePlayer(0, 1);
                break;
            case 'ArrowLeft':
                movePlayer(-1, 0);
                break;
            case 'ArrowRight':
                movePlayer(1, 0);
                break;
        }
    });

    // Game loop
    function gameLoop() {
        if (!gameOver && !win) {
            moveGhosts();
            checkCollisions();
        }
        draw();
        setTimeout(gameLoop, 200);
    }

    reset();
    gameLoop();
});