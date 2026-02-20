// Shape Shooter Game

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.length();
        return len > 0 ? new Vector2(this.x / len, this.y / len) : new Vector2();
    }

    distance(v) {
        return this.subtract(v).length();
    }
}

class Player {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2();
        this.radius = 15;
        this.speed = 200;
        this.health = 100;
        this.maxHealth = 100;
        this.shootCooldown = 0;
        this.shootRate = 0.15; // seconds between shots
    }

    update(deltaTime) {
        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));

        // Keep player in bounds
        this.position.x = Math.max(this.radius, Math.min(800 - this.radius, this.position.x));
        this.position.y = Math.max(this.radius, Math.min(600 - this.radius, this.position.y));

        // Update shoot cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Draw player as a triangle pointing toward mouse
        ctx.fillStyle = '#6366f1';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(-this.radius * 0.7, this.radius * 0.7);
        ctx.lineTo(this.radius * 0.7, this.radius * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    canShoot() {
        return this.shootCooldown <= 0;
    }

    shoot(target) {
        if (!this.canShoot()) return null;

        const direction = target.subtract(this.position).normalize();
        const bullet = new Bullet(
            this.position.x,
            this.position.y,
            direction.x * 400,
            direction.y * 400
        );

        this.shootCooldown = this.shootRate;
        return bullet;
    }

    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
}

class Enemy {
    constructor(x, y, type = 'circle') {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2();
        this.radius = 12;
        this.speed = 50;
        this.health = 1;
        this.type = type;
        this.color = this.getColorForType(type);
    }

    getColorForType(type) {
        const colors = {
            circle: '#ef4444',
            square: '#f59e0b',
            triangle: '#10b981',
            pentagon: '#8b5cf6'
        };
        return colors[type] || colors.circle;
    }

    update(deltaTime, playerPos) {
        // Move toward player
        const direction = playerPos.subtract(this.position).normalize();
        this.velocity = direction.multiply(this.speed);
        this.position = this.position.add(this.velocity.multiply(deltaTime));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;

        if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'square') {
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else if (this.type === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(-this.radius, this.radius);
            ctx.lineTo(this.radius, this.radius);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'pentagon') {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * this.radius;
                const y = Math.sin(angle) * this.radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    takeDamage() {
        this.health--;
        return this.health <= 0;
    }
}

class Bullet {
    constructor(x, y, vx, vy) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(vx, vy);
        this.radius = 3;
        this.lifetime = 3; // seconds
        this.damage = 1;
    }

    update(deltaTime) {
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        this.lifetime -= deltaTime;
        return this.lifetime > 0;
    }

    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.position = new Vector2(x, y);
        this.radius = 8;
        this.type = type;
        this.color = this.getColorForType(type);
        this.lifetime = 10; // seconds
    }

    getColorForType(type) {
        const colors = {
            health: '#10b981',
            speed: '#3b82f6',
            damage: '#ef4444',
            rapidFire: '#f59e0b'
        };
        return colors[type] || colors.health;
    }

    update(deltaTime) {
        this.lifetime -= deltaTime;
        return this.lifetime > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Pulsing effect
        const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
        ctx.scale(pulse, pulse);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw type indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type[0].toUpperCase(), 0, 3);

        ctx.restore();
    }
}

class ShapeShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.player = new Player(400, 300);
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.particles = [];

        this.score = 0;
        this.wave = 1;
        this.enemiesToSpawn = 0;
        this.enemiesSpawned = 0;
        this.waveDelay = 0;

        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.lastTime = 0;

        this.keys = {};
        this.mouse = { x: 400, y: 300, pressed: false };

        this.initializeElements();
        this.bindEvents();
        this.gameLoop = this.gameLoop.bind(this);
    }

    initializeElements() {
        this.scoreDisplay = document.getElementById('score');
        this.healthFill = document.getElementById('healthFill');
        this.healthText = document.getElementById('healthText');
        this.waveDisplay = document.getElementById('wave');
        this.enemyCountDisplay = document.getElementById('enemyCount');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalScore = document.getElementById('finalScore');
        this.finalWave = document.getElementById('finalWave');
        this.playAgainBtn = document.getElementById('playAgainBtn');
    }

    bindEvents() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.pressed = true;
        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.mouse.pressed = false;
        });

        // Buttons
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
    }

    startGame() {
        this.gameState = 'playing';
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.gameLoop(0);
    }

    pauseGame() {
        this.gameState = 'paused';
        this.pauseBtn.textContent = 'Resume';
    }

    resumeGame() {
        this.gameState = 'playing';
        this.pauseBtn.textContent = 'Pause';
        this.lastTime = performance.now();
    }

    resetGame() {
        this.player = new Player(400, 300);
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.particles = [];

        this.score = 0;
        this.wave = 1;
        this.enemiesToSpawn = 0;
        this.enemiesSpawned = 0;
        this.waveDelay = 0;

        this.gameState = 'menu';
        this.gameOverModal.classList.remove('show');

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';

        this.updateUI();
    }

    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // Update player movement
        this.player.velocity.x = 0;
        this.player.velocity.y = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) this.player.velocity.y = -this.player.speed;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) this.player.velocity.y = this.player.speed;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.player.velocity.x = -this.player.speed;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) this.player.velocity.x = this.player.speed;

        this.player.update(deltaTime);

        // Shooting
        if (this.mouse.pressed) {
            const bullet = this.player.shoot(new Vector2(this.mouse.x, this.mouse.y));
            if (bullet) {
                this.bullets.push(bullet);
            }
        }

        // Update bullets
        this.bullets = this.bullets.filter(bullet => bullet.update(deltaTime));

        // Wave management
        if (this.waveDelay > 0) {
            this.waveDelay -= deltaTime;
        } else if (this.enemiesSpawned < this.enemiesToSpawn) {
            this.spawnEnemy();
            this.enemiesSpawned++;
            this.waveDelay = 0.5; // Delay between spawns
        } else if (this.enemies.length === 0 && this.enemiesSpawned >= this.enemiesToSpawn) {
            this.nextWave();
        }

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player.position);
        });

        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => powerUp.update(deltaTime));

        // Collision detection
        this.checkCollisions();

        this.updateUI();
    }

    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: // Top
                x = Math.random() * this.canvas.width;
                y = -20;
                break;
            case 1: // Right
                x = this.canvas.width + 20;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 20;
                break;
            case 3: // Left
                x = -20;
                y = Math.random() * this.canvas.height;
                break;
        }

        const types = ['circle', 'square', 'triangle'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.enemies.push(new Enemy(x, y, type));
    }

    nextWave() {
        this.wave++;
        this.enemiesToSpawn = Math.floor(5 + this.wave * 2);
        this.enemiesSpawned = 0;
        this.waveDelay = 2; // Delay before next wave

        // Spawn power-up occasionally
        if (Math.random() < 0.3) {
            const types = ['health', 'speed', 'damage', 'rapidFire'];
            const type = types[Math.floor(Math.random() * types.length)];
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            this.powerUps.push(new PowerUp(x, y, type));
        }
    }

    checkCollisions() {
        // Bullets vs Enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (bullet.position.distance(enemy.position) < bullet.radius + enemy.radius) {
                    if (enemy.takeDamage()) {
                        this.enemies.splice(j, 1);
                        this.score += 10 * this.wave;
                    }
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }

        // Enemies vs Player
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.position.distance(this.player.position) < enemy.radius + this.player.radius) {
                this.enemies.splice(i, 1);
                if (this.player.takeDamage(20)) {
                    this.gameOver();
                    return;
                }
            }
        }

        // Player vs Power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (powerUp.position.distance(this.player.position) < powerUp.radius + this.player.radius) {
                this.applyPowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
                this.score += 50;
            }
        }
    }

    applyPowerUp(type) {
        switch (type) {
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 30);
                break;
            case 'speed':
                this.player.speed *= 1.2;
                setTimeout(() => this.player.speed /= 1.2, 5000);
                break;
            case 'damage':
                // Could implement damage boost
                break;
            case 'rapidFire':
                this.player.shootRate *= 0.7;
                setTimeout(() => this.player.shootRate /= 0.7, 5000);
                break;
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.finalScore.textContent = this.score;
        this.finalWave.textContent = this.wave;
        this.gameOverModal.classList.add('show');
    }

    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.healthText.textContent = this.player.health;
        this.healthFill.style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        this.waveDisplay.textContent = this.wave;
        this.enemyCountDisplay.textContent = this.enemies.length;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player
        this.player.draw(this.ctx);

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));

        // Draw power-ups
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));

        // Draw mouse aim line (optional)
        if (this.gameState === 'playing') {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.position.x, this.player.position.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            this.ctx.stroke();
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ShapeShooter();
});