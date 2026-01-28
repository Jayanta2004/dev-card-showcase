document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('factory-canvas');
    const ctx = canvas.getContext('2d');
    const timeEl = document.getElementById('time-value');
    const scoreEl = document.getElementById('score-value');
    const gameOverEl = document.getElementById('game-over');
    const resultEl = document.getElementById('result');
    const restartBtn = document.getElementById('restart');

    // Constants
    const GRAVITY = 0.5;
    const JUMP_FORCE = -12;
    const PLAYER_SPEED = 5;
    const CONVEYOR_HEIGHT = 20;
    const PLAYER_SIZE = 20;
    const GOAL_X = canvas.width - 50;
    const TIME_LIMIT = 60;

    // Game state
    let player = { x: 50, y: canvas.height - 100, vx: 0, vy: 0, onGround: false };
    let conveyors = [
        { x: 0, y: canvas.height - 50, width: 200, speed: 2 },
        { x: 250, y: canvas.height - 50, width: 200, speed: -1 },
        { x: 500, y: canvas.height - 50, width: 300, speed: 3 }
    ];
    let obstacles = [
        { x: 150, y: canvas.height - 70, width: 20, height: 20, type: 'crusher', active: true },
        { x: 350, y: canvas.height - 70, width: 20, height: 20, type: 'crusher', active: true },
        { x: 600, y: canvas.height - 70, width: 20, height: 20, type: 'crusher', active: true }
    ];
    let machines = [
        { x: 180, y: canvas.height - 80, disabled: false },
        { x: 380, y: canvas.height - 80, disabled: false },
        { x: 630, y: canvas.height - 80, disabled: false }
    ];
    let timeLeft = TIME_LIMIT;
    let score = 0;
    let gameRunning = true;
    let lastTime = 0;

    // Controls
    const keys = {};
    document.addEventListener('keydown', (e) => keys[e.key] = true);
    document.addEventListener('keyup', (e) => keys[e.key] = false);

    restartBtn.addEventListener('click', reset);

    function reset() {
        player = { x: 50, y: canvas.height - 100, vx: 0, vy: 0, onGround: false };
        obstacles.forEach(obs => obs.active = true);
        machines.forEach(mac => mac.disabled = false);
        timeLeft = TIME_LIMIT;
        score = 0;
        gameRunning = true;
        gameOverEl.style.display = 'none';
        lastTime = performance.now();
    }

    function update(deltaTime) {
        if (!gameRunning) return;

        // Time
        timeLeft -= deltaTime / 1000;
        if (timeLeft <= 0) {
            gameOver('Time\'s up! Assembly complete.');
            return;
        }
        timeEl.textContent = Math.ceil(timeLeft);

        // Player input
        player.vx = 0;
        if (keys['ArrowLeft']) player.vx = -PLAYER_SPEED;
        if (keys['ArrowRight']) player.vx = PLAYER_SPEED;
        if (keys[' '] && player.onGround) {
            player.vy = JUMP_FORCE;
            player.onGround = false;
        }

        // Check machine disable
        if (keys['e'] || keys['E']) {
            machines.forEach((mac, i) => {
                if (!mac.disabled && Math.abs(player.x - mac.x) < 30 && Math.abs(player.y - mac.y) < 30) {
                    mac.disabled = true;
                    obstacles[i].active = false;
                    score += 100;
                }
            });
        }

        // Physics
        player.vy += GRAVITY;
        player.x += player.vx;
        player.y += player.vy;

        // Conveyor effects
        player.onGround = false;
        conveyors.forEach(conv => {
            if (player.x > conv.x && player.x < conv.x + conv.width &&
                player.y + PLAYER_SIZE >= conv.y && player.y + PLAYER_SIZE <= conv.y + CONVEYOR_HEIGHT) {
                player.x += conv.speed;
                player.onGround = true;
                player.vy = 0;
                player.y = conv.y - PLAYER_SIZE;
            }
        });

        // Ground collision
        if (player.y + PLAYER_SIZE >= canvas.height) {
            player.y = canvas.height - PLAYER_SIZE;
            player.onGround = true;
            player.vy = 0;
        }

        // Obstacle collision
        obstacles.forEach(obs => {
            if (obs.active && player.x < obs.x + obs.width && player.x + PLAYER_SIZE > obs.x &&
                player.y < obs.y + obs.height && player.y + PLAYER_SIZE > obs.y) {
                gameOver('Hit by obstacle!');
            }
        });

        // Goal
        if (player.x >= GOAL_X) {
            score += Math.floor(timeLeft * 10);
            gameOver(`Escaped! Score: ${score}`);
        }

        // Keep player in bounds
        player.x = Math.max(0, Math.min(canvas.width - PLAYER_SIZE, player.x));

        scoreEl.textContent = score;
    }

    function gameOver(message) {
        gameRunning = false;
        resultEl.textContent = message;
        gameOverEl.style.display = 'block';
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw conveyors
        ctx.fillStyle = '#888';
        conveyors.forEach(conv => {
            ctx.fillRect(conv.x, conv.y, conv.width, CONVEYOR_HEIGHT);
            // Arrows
            ctx.fillStyle = '#000';
            for (let i = 0; i < conv.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(conv.x + i + 10, conv.y + 5);
                ctx.lineTo(conv.x + i + 30, conv.y + 10);
                ctx.lineTo(conv.x + i + 10, conv.y + 15);
                ctx.closePath();
                ctx.fill();
            }
            ctx.fillStyle = '#888';
        });

        // Draw obstacles
        obstacles.forEach(obs => {
            if (obs.active) {
                ctx.fillStyle = '#f00';
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            }
        });

        // Draw machines
        machines.forEach(mac => {
            ctx.fillStyle = mac.disabled ? '#0f0' : '#ff0';
            ctx.fillRect(mac.x, mac.y, 10, 10);
        });

        // Draw goal
        ctx.fillStyle = '#0f0';
        ctx.fillRect(GOAL_X, canvas.height - 100, 20, 100);

        // Draw player
        ctx.fillStyle = '#00f';
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    }

    function gameLoop(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        update(deltaTime);
        draw();

        requestAnimationFrame(gameLoop);
    }

    reset();
    requestAnimationFrame(gameLoop);
});