document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('castle-canvas');
    const ctx = canvas.getContext('2d');
    const ammoEl = document.getElementById('ammo-value');
    const scoreEl = document.getElementById('score-value');

    // Constants
    const GRAVITY = 0.3;
    const BLOCK_SIZE = 20;
    const WALL_WIDTH = 10;
    const WALL_HEIGHT = 15;
    const CATAPULT_X = 100;
    const CATAPULT_Y = canvas.height - 100;
    const MAX_AMMO = 10;

    // Game state
    let wall = [];
    let projectile = null;
    let ammo = MAX_AMMO;
    let score = 0;
    let mouse = { x: 0, y: 0, down: false };
    let power = 0;
    let angle = 0;

    // Initialize wall
    for (let x = 0; x < WALL_WIDTH; x++) {
        wall[x] = [];
        for (let y = 0; y < WALL_HEIGHT; y++) {
            wall[x][y] = { exists: true, weak: Math.random() < 0.2 }; // 20% weak points
        }
    }

    // Controls
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        updateAim();
    });
    canvas.addEventListener('mousedown', () => {
        mouse.down = true;
        if (ammo > 0 && !projectile) {
            launchProjectile();
        }
    });
    canvas.addEventListener('mouseup', () => mouse.down = false);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') reset();
    });

    function updateAim() {
        const dx = mouse.x - CATAPULT_X;
        const dy = mouse.y - CATAPULT_Y;
        angle = Math.atan2(dy, dx);
        power = Math.min(Math.hypot(dx, dy) / 100, 1);
    }

    function launchProjectile() {
        projectile = {
            x: CATAPULT_X,
            y: CATAPULT_Y,
            vx: Math.cos(angle) * power * 15,
            vy: Math.sin(angle) * power * 15
        };
        ammo--;
        ammoEl.textContent = ammo;
    }

    function update() {
        if (projectile) {
            projectile.vy += GRAVITY;
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;

            // Check wall collision
            const bx = Math.floor((projectile.x - (canvas.width - WALL_WIDTH * BLOCK_SIZE)) / BLOCK_SIZE);
            const by = Math.floor((projectile.y - (canvas.height - WALL_HEIGHT * BLOCK_SIZE)) / BLOCK_SIZE);

            if (bx >= 0 && bx < WALL_WIDTH && by >= 0 && by < WALL_HEIGHT && wall[bx][by].exists) {
                destroyBlocks(bx, by);
                projectile = null;
            }

            // Out of bounds
            if (projectile.x < 0 || projectile.x > canvas.width || projectile.y > canvas.height) {
                projectile = null;
            }
        }

        // Calculate score
        let totalBlocks = WALL_WIDTH * WALL_HEIGHT;
        let destroyed = 0;
        wall.forEach(col => col.forEach(block => { if (!block.exists) destroyed++; }));
        score = Math.round((destroyed / totalBlocks) * 100);
        scoreEl.textContent = score;
    }

    function destroyBlocks(cx, cy) {
        for (let x = cx - 1; x <= cx + 1; x++) {
            for (let y = cy - 1; y <= cy + 1; y++) {
                if (x >= 0 && x < WALL_WIDTH && y >= 0 && y < WALL_HEIGHT && wall[x][y].exists) {
                    if (wall[x][y].weak || Math.random() < 0.5) { // Weak points easier to destroy
                        wall[x][y].exists = false;
                    }
                }
            }
        }
    }

    function reset() {
        wall.forEach(col => col.forEach(block => block.exists = true));
        projectile = null;
        ammo = MAX_AMMO;
        ammoEl.textContent = ammo;
        score = 0;
        scoreEl.textContent = score;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

        // Draw catapult
        ctx.fillStyle = '#654321';
        ctx.fillRect(CATAPULT_X - 10, CATAPULT_Y - 20, 20, 40);
        ctx.beginPath();
        ctx.arc(CATAPULT_X, CATAPULT_Y - 20, 15, 0, Math.PI * 2);
        ctx.fill();

        // Draw aim line
        if (!projectile) {
            ctx.strokeStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(CATAPULT_X, CATAPULT_Y);
            ctx.lineTo(CATAPULT_X + Math.cos(angle) * 50, CATAPULT_Y + Math.sin(angle) * 50);
            ctx.stroke();
        }

        // Draw wall
        const wallX = canvas.width - WALL_WIDTH * BLOCK_SIZE;
        const wallY = canvas.height - WALL_HEIGHT * BLOCK_SIZE;
        wall.forEach((col, x) => {
            col.forEach((block, y) => {
                if (block.exists) {
                    ctx.fillStyle = block.weak ? '#D2691E' : '#A0522D';
                    ctx.fillRect(wallX + x * BLOCK_SIZE, wallY + y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = '#000';
                    ctx.strokeRect(wallX + x * BLOCK_SIZE, wallY + y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });

        // Draw projectile
        if (projectile) {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});