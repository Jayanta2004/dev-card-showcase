/**
 * Monster Hunter - Mini Mario Game
 * A platformer game with monster hunting elements
 */

class MonsterHunter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;

        // Game objects
        this.player = null;
        this.platforms = [];
        this.monsters = [];
        this.coins = [];
        this.spikes = [];
        this.projectiles = [];

        // Physics
        this.gravity = 0.5;
        this.friction = 0.8;

        // Controls
        this.keys = {};

        // Game state
        this.gameOver = false;
        this.levelComplete = false;

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.createPlayer();
        this.createLevel();
        this.updateUI();
    }

    createPlayer() {
        this.player = {
            x: 100,
            y: 200,
            width: 32,
            height: 32,
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            facing: 'right',
            attacking: false,
            attackCooldown: 0,
            color: '#FF6B6B'
        };
    }

    createLevel() {
        // Clear existing objects
        this.platforms = [];
        this.monsters = [];
        this.coins = [];
        this.spikes = [];

        // Create ground platform
        this.platforms.push({
            x: 0,
            y: this.canvas.height - 50,
            width: this.canvas.width,
            height: 50,
            color: '#8B4513'
        });

        // Create floating platforms based on level
        const platformCount = 3 + this.level;
        for (let i = 0; i < platformCount; i++) {
            this.platforms.push({
                x: 150 + i * 200,
                y: 250 - i * 40,
                width: 100,
                height: 20,
                color: '#228B22'
            });
        }

        // Create monsters
        const monsterCount = 2 + this.level;
        for (let i = 0; i < monsterCount; i++) {
            this.monsters.push({
                x: 300 + i * 150,
                y: this.canvas.height - 100,
                width: 30,
                height: 30,
                velocityX: (Math.random() - 0.5) * 2,
                velocityY: 0,
                onGround: false,
                color: '#8B0000',
                type: 'walker',
                health: 1
            });
        }

        // Create coins
        const coinCount = 5 + this.level;
        for (let i = 0; i < coinCount; i++) {
            this.coins.push({
                x: 200 + i * 120,
                y: 150 + Math.random() * 150,
                width: 20,
                height: 20,
                collected: false,
                color: '#FFD700'
            });
        }

        // Create spikes (hazards)
        const spikeCount = Math.min(this.level, 3);
        for (let i = 0; i < spikeCount; i++) {
            this.spikes.push({
                x: 400 + i * 200,
                y: this.canvas.height - 70,
                width: 30,
                height: 30,
                color: '#696969'
            });
        }
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Prevent default for game keys
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameOver = false;
            this.levelComplete = false;
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            this.gameLoop();
        }
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Resume' : 'Pause';
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.gameOver = false;
        this.levelComplete = false;
        this.init();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Pause';
    }

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;

        this.update();
        this.render();

        if (!this.gameOver && !this.levelComplete) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    update() {
        this.updatePlayer();
        this.updateMonsters();
        this.updateProjectiles();
        this.checkCollisions();
        this.checkLevelComplete();
        this.updateUI();
    }

    updatePlayer() {
        const player = this.player;

        // Horizontal movement
        if (this.keys['ArrowLeft']) {
            player.velocityX = -5;
            player.facing = 'left';
        } else if (this.keys['ArrowRight']) {
            player.velocityX = 5;
            player.facing = 'right';
        } else {
            player.velocityX *= this.friction;
        }

        // Jumping
        if (this.keys['ArrowUp'] && player.onGround) {
            player.velocityY = -12;
            player.onGround = false;
        }

        // Attacking
        if (this.keys['Space'] && player.attackCooldown <= 0) {
            this.attack();
            player.attackCooldown = 20; // Cooldown frames
        }

        // Apply gravity
        player.velocityY += this.gravity;

        // Update position
        player.x += player.velocityX;
        player.y += player.velocityY;

        // Boundary checks
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > this.canvas.width) player.x = this.canvas.width - player.width;

        // Platform collision
        player.onGround = false;
        for (const platform of this.platforms) {
            if (this.checkCollision(player, platform)) {
                if (player.velocityY > 0) {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                } else if (player.velocityY < 0) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                }
            }
        }

        // Ground collision
        if (player.y + player.height > this.canvas.height) {
            player.y = this.canvas.height - player.height;
            player.velocityY = 0;
            player.onGround = true;
        }

        // Attack cooldown
        if (player.attackCooldown > 0) {
            player.attackCooldown--;
        }
    }

    updateMonsters() {
        for (const monster of this.monsters) {
            // Simple AI: move back and forth
            monster.velocityY += this.gravity;
            monster.x += monster.velocityX;

            // Change direction at platform edges or walls
            if (monster.x <= 0 || monster.x + monster.width >= this.canvas.width) {
                monster.velocityX *= -1;
            }

            // Platform collision
            monster.onGround = false;
            for (const platform of this.platforms) {
                if (this.checkCollision(monster, platform)) {
                    if (monster.velocityY > 0) {
                        monster.y = platform.y - monster.height;
                        monster.velocityY = 0;
                        monster.onGround = true;
                    }
                }
            }

            // Ground collision
            if (monster.y + monster.height > this.canvas.height) {
                monster.y = this.canvas.height - monster.height;
                monster.velocityY = 0;
                monster.onGround = true;
            }
        }
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.x += projectile.velocityX;
            projectile.y += projectile.velocityY;

            // Remove if off screen
            if (projectile.x < 0 || projectile.x > this.canvas.width ||
                projectile.y < 0 || projectile.y > this.canvas.height) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    attack() {
        const direction = this.player.facing === 'right' ? 1 : -1;
        this.projectiles.push({
            x: this.player.x + (direction > 0 ? this.player.width : 0),
            y: this.player.y + this.player.height / 2,
            width: 10,
            height: 5,
            velocityX: direction * 8,
            velocityY: 0,
            color: '#FFD700'
        });
    }

    checkCollisions() {
        // Player vs Monsters
        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            if (this.checkCollision(this.player, monster)) {
                this.lives--;
                this.player.x = 100; // Reset position
                this.player.y = 200;
                this.player.velocityX = 0;
                this.player.velocityY = 0;

                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.showGameOver();
                }
                break;
            }
        }

        // Player vs Spikes
        for (const spike of this.spikes) {
            if (this.checkCollision(this.player, spike)) {
                this.lives--;
                this.player.x = 100;
                this.player.y = 200;
                this.player.velocityX = 0;
                this.player.velocityY = 0;

                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.showGameOver();
                }
                break;
            }
        }

        // Player vs Coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (!coin.collected && this.checkCollision(this.player, coin)) {
                coin.collected = true;
                this.score += 100;
                this.coins.splice(i, 1);
            }
        }

        // Projectiles vs Monsters
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            for (let j = this.monsters.length - 1; j >= 0; j--) {
                const monster = this.monsters[j];
                if (this.checkCollision(projectile, monster)) {
                    this.projectiles.splice(i, 1);
                    monster.health--;
                    if (monster.health <= 0) {
                        this.monsters.splice(j, 1);
                        this.score += 200;
                    }
                    break;
                }
            }
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    checkLevelComplete() {
        if (this.monsters.length === 0 && this.coins.length === 0) {
            this.levelComplete = true;
            this.showLevelComplete();
        }
    }

    showGameOver() {
        this.gameRunning = false;
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <h2>💀 Game Over!</h2>
                <p>You ran out of lives!</p>
                <div class="final-score">Final Score: ${this.score}</div>
                <button onclick="location.reload()" class="btn">Play Again</button>
            </div>
        `;
        document.querySelector('.game-area').appendChild(overlay);
    }

    showLevelComplete() {
        this.gameRunning = false;
        setTimeout(() => {
            this.level++;
            this.lives = Math.min(this.lives + 1, 5); // Bonus life
            this.gameRunning = false;
            this.levelComplete = false;
            this.createLevel();
            this.player.x = 100;
            this.player.y = 200;
            this.player.velocityX = 0;
            this.player.velocityY = 0;

            const overlay = document.createElement('div');
            overlay.className = 'game-overlay';
            overlay.innerHTML = `
                <div class="overlay-content">
                    <h2>🎉 Level ${this.level - 1} Complete!</h2>
                    <p>Great job, hunter!</p>
                    <div class="final-score">Score: ${this.score}</div>
                    <button onclick="this.parentElement.parentElement.remove(); game.startGame()" class="btn">Next Level</button>
                </div>
            `;
            document.querySelector('.game-area').appendChild(overlay);
        }, 1000);
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#98FB98');
        gradient.addColorStop(1, '#228B22');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw clouds
        this.drawClouds();

        // Draw platforms
        for (const platform of this.platforms) {
            this.ctx.fillStyle = platform.color;
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }

        // Draw spikes
        for (const spike of this.spikes) {
            this.ctx.fillStyle = spike.color;
            this.ctx.beginPath();
            this.ctx.moveTo(spike.x, spike.y + spike.height);
            this.ctx.lineTo(spike.x + spike.width / 2, spike.y);
            this.ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Draw coins
        for (const coin of this.coins) {
            this.ctx.fillStyle = coin.color;
            this.ctx.beginPath();
            this.ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw monsters
        for (const monster of this.monsters) {
            this.ctx.fillStyle = monster.color;
            this.ctx.fillRect(monster.x, monster.y, monster.width, monster.height);

            // Simple eyes
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(monster.x + 5, monster.y + 5, 4, 4);
            this.ctx.fillRect(monster.x + 21, monster.y + 5, 4, 4);
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(monster.x + 6, monster.y + 6, 2, 2);
            this.ctx.fillRect(monster.x + 22, monster.y + 6, 2, 2);
        }

        // Draw projectiles
        for (const projectile of this.projectiles) {
            this.ctx.fillStyle = projectile.color;
            this.ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        }

        // Draw player
        this.drawPlayer();
    }

    drawPlayer() {
        const player = this.player;
        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(player.x, player.y, player.width, player.height);

        // Simple face
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(player.x + 8, player.y + 8, 4, 4);
        this.ctx.fillRect(player.x + 20, player.y + 8, 4, 4);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(player.x + 9, player.y + 9, 2, 2);
        this.ctx.fillRect(player.x + 21, player.y + 9, 2, 2);

        // Attack effect
        if (player.attacking) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
        }
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        // Simple cloud shapes
        this.ctx.beginPath();
        this.ctx.arc(100, 50, 20, 0, Math.PI * 2);
        this.ctx.arc(120, 50, 25, 0, Math.PI * 2);
        this.ctx.arc(140, 50, 20, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(400, 70, 15, 0, Math.PI * 2);
        this.ctx.arc(415, 70, 20, 0, Math.PI * 2);
        this.ctx.arc(435, 70, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new MonsterHunter();
});

// Make game globally accessible for overlay buttons
window.game = game;