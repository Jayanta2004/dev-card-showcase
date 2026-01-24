// Canvas setup
const canvas = document.getElementById('viewport');
const ctx = canvas.getContext('2d');

const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas.getContext('2d');

// Set canvas sizes
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
minimapCanvas.width = 250;
minimapCanvas.height = 250;

// Game constants
const MAP_SIZE = 20;
const TILE_SIZE = 64;
const FOV = Math.PI / 3;
const MAX_DEPTH = 800;
const MOVE_SPEED = 3;
const ROT_SPEED = 0.002;

// Game map (1 = wall, 0 = empty)
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Player state
const player = {
    x: 150,
    y: 150,
    angle: 0,
    health: 100
};

// Input state
const keys = {};
let mouseX = 0;

// Enemies array
const enemies = [];

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 3;
        this.speed = 1.5;
        this.shootCooldown = 0;
        this.shootInterval = 120;
        this.attackRange = 300;
        this.stopDistance = 200;
    }

    update() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.stopDistance) {
            const angle = Math.atan2(dy, dx);
            const newX = this.x + Math.cos(angle) * this.speed;
            const newY = this.y + Math.sin(angle) * this.speed;

            if (!this.checkCollision(newX, newY)) {
                this.x = newX;
                this.y = newY;
            }
        }

        if (dist < this.attackRange) {
            this.shootCooldown--;
            if (this.shootCooldown <= 0) {
                this.shoot();
                this.shootCooldown = this.shootInterval;
            }
        }
    }

    checkCollision(x, y) {
        const mapX = Math.floor(x / TILE_SIZE);
        const mapY = Math.floor(y / TILE_SIZE);
        return map[mapY] && map[mapY][mapX] === 1;
    }

    shoot() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.attackRange && Math.random() < 0.3) {
            damagePlayer(10);
        }
    }

    takeDamage() {
        this.health--;
        return this.health <= 0;
    }
}

// Spawn initial enemies
function spawnEnemies() {
    enemies.push(new Enemy(800, 800));
    enemies.push(new Enemy(400, 1000));
    enemies.push(new Enemy(1000, 400));
    updateEnemyCount();
}

function updateEnemyCount() {
    document.getElementById('enemyCount').textContent = enemies.length;

    // Check win condition
    if (enemies.length === 0) {
        document.getElementById('objective').innerHTML = '✅ MISSION COMPLETE!';
        document.getElementById('objective').style.borderColor = '#0f0';
        document.getElementById('objective').style.color = '#0f0';
    }
}

// Input handling
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
document.addEventListener('mousemove', e => {
    mouseX = e.movementX;
});
document.addEventListener('click', shoot);

// Request pointer lock
canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

function shoot() {
    if (player.health <= 0) return;

    // Muzzle flash
    const flash = document.getElementById('muzzleFlash');
    flash.style.opacity = '1';
    setTimeout(() => flash.style.opacity = '0', 50);

    // Check for enemy hits
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        let angleDiff = angle - player.angle;

        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        if (Math.abs(angleDiff) < 0.1 && dist < 500) {
            if (enemy.takeDamage()) {
                enemies.splice(i, 1);
                updateEnemyCount();
            }
        }
    }
}

function damagePlayer(amount) {
    player.health = Math.max(0, player.health - amount);
    document.getElementById('health').textContent = player.health;

    const indicator = document.getElementById('damageIndicator');
    indicator.classList.add('hit');
    setTimeout(() => indicator.classList.remove('hit'), 200);

    if (player.health <= 0) {
        gameOver();
    }
}

function gameOver() {
    document.getElementById('gameOver').style.display = 'block';
}

function updatePlayer() {
    if (player.health <= 0) return;

    player.angle += mouseX * ROT_SPEED;
    mouseX = 0;

    let moveX = 0;
    let moveY = 0;

    if (keys['w']) {
        moveX += Math.cos(player.angle) * MOVE_SPEED;
        moveY += Math.sin(player.angle) * MOVE_SPEED;
    }
    if (keys['s']) {
        moveX -= Math.cos(player.angle) * MOVE_SPEED;
        moveY -= Math.sin(player.angle) * MOVE_SPEED;
    }
    if (keys['a']) {
        moveX += Math.cos(player.angle - Math.PI / 2) * MOVE_SPEED;
        moveY += Math.sin(player.angle - Math.PI / 2) * MOVE_SPEED;
    }
    if (keys['d']) {
        moveX += Math.cos(player.angle + Math.PI / 2) * MOVE_SPEED;
        moveY += Math.sin(player.angle + Math.PI / 2) * MOVE_SPEED;
    }

    const newX = player.x + moveX;
    const newY = player.y + moveY;

    if (!checkCollision(newX, player.y)) player.x = newX;
    if (!checkCollision(player.x, newY)) player.y = newY;
}

function checkCollision(x, y) {
    const mapX = Math.floor(x / TILE_SIZE);
    const mapY = Math.floor(y / TILE_SIZE);
    return map[mapY] && map[mapY][mapX] === 1;
}

function castRay(angle) {
    let x = player.x;
    let y = player.y;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    for (let i = 0; i < MAX_DEPTH; i++) {
        x += dx;
        y += dy;

        const mapX = Math.floor(x / TILE_SIZE);
        const mapY = Math.floor(y / TILE_SIZE);

        if (map[mapY] && map[mapY][mapX] === 1) {
            const dist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
            return { hit: true, distance: dist, mapX, mapY };
        }
    }

    return { hit: false, distance: MAX_DEPTH };
}

function render() {
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);

    // Ceiling
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h / 2);

    // Floor
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, h / 2, w, h / 2);

    const numRays = w;
    const rayAngleStep = FOV / numRays;

    // Render walls
    for (let i = 0; i < numRays; i++) {
        const rayAngle = player.angle - FOV / 2 + i * rayAngleStep;
        const ray = castRay(rayAngle);

        if (ray.hit) {
            const correctedDist = ray.distance * Math.cos(rayAngle - player.angle);
            const wallHeight = (TILE_SIZE * h) / correctedDist;
            const brightness = Math.max(50, 255 - (correctedDist / MAX_DEPTH) * 200);

            ctx.fillStyle = `rgb(${brightness * 0.4}, ${brightness * 0.4}, ${brightness})`;
            ctx.fillRect(i, (h - wallHeight) / 2, 1, wallHeight);
        }
    }

    // Render enemies
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        let angleDiff = angle - player.angle;

        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        if (Math.abs(angleDiff) < FOV / 2 && dist < MAX_DEPTH) {
            const size = (TILE_SIZE * h) / dist;
            const screenX = w / 2 + (angleDiff / FOV) * w;
            const screenY = h / 2;

            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(screenX - size / 6, screenY - size / 6, size / 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(screenX + size / 6, screenY - size / 6, size / 10, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Render minimap
    renderMinimap();
}

function renderMinimap() {
    const scale = 12;
    const mmW = minimapCanvas.width;
    const mmH = minimapCanvas.height;

    // Clear minimap
    minimapCtx.fillStyle = 'rgba(0, 20, 0, 0.9)';
    minimapCtx.fillRect(0, 0, mmW, mmH);

    // Draw map
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            if (map[y][x] === 1) {
                minimapCtx.fillStyle = '#444';
                minimapCtx.fillRect(x * scale, y * scale, scale, scale);
                minimapCtx.strokeStyle = '#222';
                minimapCtx.strokeRect(x * scale, y * scale, scale, scale);
            }
        }
    }

    // Draw grid
    minimapCtx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
    minimapCtx.lineWidth = 0.5;
    for (let i = 0; i <= MAP_SIZE; i++) {
        minimapCtx.beginPath();
        minimapCtx.moveTo(i * scale, 0);
        minimapCtx.lineTo(i * scale, mmH);
        minimapCtx.stroke();
        minimapCtx.beginPath();
        minimapCtx.moveTo(0, i * scale);
        minimapCtx.lineTo(mmW, i * scale);
        minimapCtx.stroke();
    }

    // Draw enemies
    enemies.forEach(enemy => {
        const ex = (enemy.x / TILE_SIZE) * scale;
        const ey = (enemy.y / TILE_SIZE) * scale;

        // Pulsing effect
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        minimapCtx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
        minimapCtx.beginPath();
        minimapCtx.arc(ex, ey, 4, 0, Math.PI * 2);
        minimapCtx.fill();

        // Enemy border
        minimapCtx.strokeStyle = '#ff0000';
        minimapCtx.lineWidth = 1.5;
        minimapCtx.stroke();

        // Draw line to player
        const px = (player.x / TILE_SIZE) * scale;
        const py = (player.y / TILE_SIZE) * scale;
        minimapCtx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        minimapCtx.lineWidth = 1;
        minimapCtx.beginPath();
        minimapCtx.moveTo(ex, ey);
        minimapCtx.lineTo(px, py);
        minimapCtx.stroke();
    });

    // Draw player
    const px = (player.x / TILE_SIZE) * scale;
    const py = (player.y / TILE_SIZE) * scale;

    // Player direction indicator
    const dirLen = 15;
    const dirX = px + Math.cos(player.angle) * dirLen;
    const dirY = py + Math.sin(player.angle) * dirLen;

    minimapCtx.strokeStyle = '#0f0';
    minimapCtx.lineWidth = 2;
    minimapCtx.beginPath();
    minimapCtx.moveTo(px, py);
    minimapCtx.lineTo(dirX, dirY);
    minimapCtx.stroke();

    // Player FOV cone
    minimapCtx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    minimapCtx.beginPath();
    minimapCtx.moveTo(px, py);
    minimapCtx.arc(px, py, 30, player.angle - FOV / 2, player.angle + FOV / 2);
    minimapCtx.closePath();
    minimapCtx.fill();

    // Player dot
    minimapCtx.fillStyle = '#0f0';
    minimapCtx.beginPath();
    minimapCtx.arc(px, py, 5, 0, Math.PI * 2);
    minimapCtx.fill();

    minimapCtx.strokeStyle = '#000';
    minimapCtx.lineWidth = 1;
    minimapCtx.stroke();

    // Minimap border glow
    minimapCtx.strokeStyle = '#0f0';
    minimapCtx.lineWidth = 2;
    minimapCtx.strokeRect(1, 1, mmW - 2, mmH - 2);
}

function gameLoop() {
    updatePlayer();
    enemies.forEach(e => e.update());
    render();
    requestAnimationFrame(gameLoop);
}

// Resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start game
spawnEnemies();
gameLoop();