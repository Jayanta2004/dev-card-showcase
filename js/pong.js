document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    const player1ScoreEl = document.getElementById('player1-score');
    const player2ScoreEl = document.getElementById('player2-score');

    // Game objects
    const paddleWidth = 10;
    const paddleHeight = 80;
    const ballSize = 10;

    let paddle1 = { x: 10, y: canvas.height / 2 - paddleHeight / 2, dy: 0 };
    let paddle2 = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2, dy: 0 };
    let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 5, dy: 5 };

    let player1Score = 0;
    let player2Score = 0;
    let gameRunning = false;

    // Audio context for sound effects
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

    // Controls
    const keys = {};
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ') {
            if (!gameRunning) {
                gameRunning = true;
                gameLoop();
            }
        }
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    function update() {
        // Paddle movement
        if (keys['w'] && paddle1.y > 0) paddle1.y -= 5;
        if (keys['s'] && paddle1.y < canvas.height - paddleHeight) paddle1.y += 5;
        if (keys['ArrowUp'] && paddle2.y > 0) paddle2.y -= 5;
        if (keys['ArrowDown'] && paddle2.y < canvas.height - paddleHeight) paddle2.y += 5;

        // Ball movement
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Ball collision with top/bottom
        if (ball.y <= 0 || ball.y >= canvas.height - ballSize) {
            ball.dy = -ball.dy;
            playSound(800, 0.1);
        }

        // Ball collision with paddles
        if (ball.x <= paddle1.x + paddleWidth && ball.y >= paddle1.y && ball.y <= paddle1.y + paddleHeight) {
            ball.dx = -ball.dx;
            playSound(600, 0.1);
        }
        if (ball.x >= paddle2.x - ballSize && ball.y >= paddle2.y && ball.y <= paddle2.y + paddleHeight) {
            ball.dx = -ball.dx;
            playSound(600, 0.1);
        }

        // Scoring
        if (ball.x < 0) {
            player2Score++;
            player2ScoreEl.textContent = player2Score;
            resetBall();
            playSound(200, 0.5);
        }
        if (ball.x > canvas.width) {
            player1Score++;
            player1ScoreEl.textContent = player1Score;
            resetBall();
            playSound(200, 0.5);
        }
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = Math.random() > 0.5 ? 5 : -5;
        ball.dy = Math.random() > 0.5 ? 5 : -5;
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw paddles
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fillRect(paddle1.x, paddle1.y, paddleWidth, paddleHeight);
        ctx.fillRect(paddle2.x, paddle2.y, paddleWidth, paddleHeight);

        // Draw ball
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(ball.x, ball.y, ballSize, ballSize);

        // Reset shadow
        ctx.shadowBlur = 0;
    }

    function gameLoop() {
        update();
        draw();
        if (gameRunning) {
            requestAnimationFrame(gameLoop);
        }
    }

    // Initial draw
    draw();
});