document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('brick-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score-value');
    const livesEl = document.getElementById('lives-value');
    const levelEl = document.getElementById('level-value');
    const gameOverEl = document.getElementById('game-over');
    const levelCompleteEl = document.getElementById('level-complete');

    // Game constants
    const paddleWidth = 100;
    const paddleHeight = 10;
    const ballSize = 10;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    const brickRows = 5;
    const brickCols = 10;

    // Game variables
    let paddle = { x: canvas.width / 2 - paddleWidth / 2, y: canvas.height - 30 };
    let ball = { x: canvas.width / 2, y: canvas.height - 40, dx: 4, dy: -4 };
    let bricks = [];
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = false;
    let gameOver = false;
    let levelComplete = false;
    let powerUps = [];

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

    function initBricks() {
        bricks = [];
        for (let c = 0; c < brickCols; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRows; r++) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                let status = 1;
                // Different patterns for levels
                if (level === 2 && (r + c) % 2 === 0) status = 0;
                if (level === 3 && r < 2) status = 0;
                bricks[c][r] = { x: brickX, y: brickY, status: status };
            }
        }
    }

    function drawPaddle() {
        ctx.fillStyle = '#fff';
        ctx.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (let c = 0; c < brickCols; c++) {
            for (let r = 0; r < brickRows; r++) {
                if (bricks[c][r].status === 1) {
                    ctx.fillStyle = '#f00';
                    ctx.fillRect(bricks[c][r].x, bricks[c][r].y, brickWidth, brickHeight);
                }
            }
        }
    }

    function drawPowerUps() {
        powerUps.forEach(powerUp => {
            ctx.fillStyle = '#0f0';
            ctx.fillRect(powerUp.x, powerUp.y, 20, 20);
        });
    }

    function collisionDetection() {
        for (let c = 0; c < brickCols; c++) {
            for (let r = 0; r < brickRows; r++) {
                let b = bricks[c][r];
                if (b.status === 1) {
                    if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score += 10;
                        scoreEl.textContent = score;
                        playSound(800, 0.1);
                        // Chance for power-up
                        if (Math.random() < 0.2) {
                            powerUps.push({ x: b.x + brickWidth / 2 - 10, y: b.y, type: Math.random() < 0.5 ? 'life' : 'wide' });
                        }
                        // Check level complete
                        if (bricks.flat().every(brick => brick.status === 0)) {
                            levelComplete = true;
                            levelCompleteEl.classList.remove('hidden');
                        }
                    }
                }
            }
        }
    }

    function updatePowerUps() {
        powerUps.forEach((powerUp, index) => {
            powerUp.y += 2;
            if (powerUp.y > canvas.height) {
                powerUps.splice(index, 1);
            } else if (powerUp.y + 20 >= paddle.y && powerUp.x >= paddle.x && powerUp.x <= paddle.x + paddleWidth) {
                // Caught power-up
                if (powerUp.type === 'life') {
                    lives++;
                    livesEl.textContent = lives;
                } else if (powerUp.type === 'wide') {
                    paddle.width = paddleWidth * 1.5;
                    setTimeout(() => paddle.width = paddleWidth, 10000);
                }
                powerUps.splice(index, 1);
                playSound(1000, 0.2);
            }
        });
    }

    function update() {
        if (!gameRunning || gameOver || levelComplete) return;

        // Paddle movement
        if (keys['ArrowLeft'] || keys['a']) paddle.x = Math.max(0, paddle.x - 7);
        if (keys['ArrowRight'] || keys['d']) paddle.x = Math.min(canvas.width - paddleWidth, paddle.x + 7);

        // Ball movement
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision
        if (ball.x <= 0 || ball.x >= canvas.width) ball.dx = -ball.dx;
        if (ball.y <= 0) ball.dy = -ball.dy;

        // Paddle collision
        if (ball.y + ballSize / 2 >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddleWidth) {
            ball.dy = -Math.abs(ball.dy);
            playSound(600, 0.1);
        }

        // Ball falls
        if (ball.y > canvas.height) {
            lives--;
            livesEl.textContent = lives;
            if (lives === 0) {
                gameOver = true;
                gameOverEl.classList.remove('hidden');
            } else {
                resetBall();
            }
        }

        collisionDetection();
        updatePowerUps();
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 40;
        ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -4;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawPaddle();
        drawBall();
        drawPowerUps();
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Controls
    const keys = {};
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ') {
            if (!gameRunning && !gameOver && !levelComplete) {
                gameRunning = true;
            } else if (levelComplete) {
                level++;
                levelEl.textContent = level;
                initBricks();
                resetBall();
                levelComplete = false;
                levelCompleteEl.classList.add('hidden');
                if (level > 3) {
                    gameOver = true;
                    gameOverEl.textContent = 'All Levels Complete!';
                    gameOverEl.classList.remove('hidden');
                }
            }
        }
        if (e.key === 'r' && gameOver) {
            // Restart
            score = 0;
            lives = 3;
            level = 1;
            scoreEl.textContent = score;
            livesEl.textContent = lives;
            levelEl.textContent = level;
            initBricks();
            resetBall();
            gameOver = false;
            levelComplete = false;
            gameOverEl.classList.add('hidden');
            levelCompleteEl.classList.add('hidden');
        }
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Initialize
    initBricks();
    gameLoop();
});