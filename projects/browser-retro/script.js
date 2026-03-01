// ======= ENGINE SETUP =======
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameInterval, score = 0;
let keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// ======= GAME OBJECTS =======
class Sprite {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    move() {
        this.x += this.vx;
        this.y += this.vy;
    }
    collides(other) {
        return !(
            this.x + this.w < other.x ||
            this.x > other.x + other.w ||
            this.y + this.h < other.y ||
            this.y > other.y + other.h
        );
    }
}

// ======= SPACE SHOOTER GAME =======
let player, bullets = [], enemies = [], enemySpawn = 0;
function initSpaceShooter() {
    player = new Sprite(canvas.width/2 - 15, canvas.height - 30, 30, 30, '#0ff');
    bullets = [];
    enemies = [];
    enemySpawn = 0;
    score = 0;
}

// ======= DODGE GAME =======
let dodgePlayer, obstacles = [], obstacleSpawn = 0;
function initDodgeGame() {
    dodgePlayer = new Sprite(canvas.width/2 - 15, canvas.height - 40, 30, 30, '#ff0');
    obstacles = [];
    obstacleSpawn = 0;
    score = 0;
}

// ======= GAME LOOP =======
let currentGame = null;
function startGame(gameName) {
    clearInterval(gameInterval);
    if(gameName === 'space') { initSpaceShooter(); currentGame = 'space'; }
    if(gameName === 'dodge') { initDodgeGame(); currentGame = 'dodge'; }
    gameInterval = setInterval(gameLoop, 1000/60);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(currentGame === 'space') spaceShooterLoop();
    if(currentGame === 'dodge') dodgeLoop();
    document.getElementById('score').innerText = "Score: " + score;
}

// ======= SPACE SHOOTER LOGIC =======
function spaceShooterLoop() {
    // Player movement
    player.vx = 0;
    player.vy = 0;
    if(keys['ArrowLeft']) player.vx = -5;
    if(keys['ArrowRight']) player.vx = 5;
    if(keys['ArrowUp']) player.vy = -5;
    if(keys['ArrowDown']) player.vy = 5;
    player.move();
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
    player.draw();

    // Shooting
    if(keys['Space'] && bullets.length < 10) bullets.push(new Sprite(player.x + player.w/2 - 2, player.y - 10, 4, 10, '#f00'));

    // Update bullets
    bullets.forEach((b, i) => {
        b.vy = -8; b.move(); b.draw();
        if(b.y < 0) bullets.splice(i,1);
    });

    // Spawn enemies
    enemySpawn++;
    if(enemySpawn > 60) {
        enemies.push(new Sprite(Math.random()*(canvas.width-30), -30, 30, 30, '#f0f'));
        enemySpawn = 0;
    }

    // Update enemies
    enemies.forEach((e, i) => {
        e.vy = 2 + score/50;
        e.move(); e.draw();
        if(e.y > canvas.height) { enemies.splice(i,1); score -= 5; }
        bullets.forEach((b,j) => {
            if(b.collides(e)) { bullets.splice(j,1); enemies.splice(i,1); score += 10; }
        });
        if(e.collides(player)) { gameOver(); }
    });
}

// ======= DODGE GAME LOGIC =======
function dodgeLoop() {
    // Player movement
    dodgePlayer.vx = 0;
    if(keys['ArrowLeft']) dodgePlayer.vx = -6;
    if(keys['ArrowRight']) dodgePlayer.vx = 6;
    dodgePlayer.move();
    dodgePlayer.x = Math.max(0, Math.min(canvas.width - dodgePlayer.w, dodgePlayer.x));
    dodgePlayer.draw();

    // Spawn obstacles
    obstacleSpawn++;
    if(obstacleSpawn > 50) {
        obstacles.push(new Sprite(Math.random()*(canvas.width-20), -20, 20, 20, '#f00'));
        obstacleSpawn = 0;
    }

    // Update obstacles
    obstacles.forEach((o,i) => {
        o.vy = 3 + score/100; o.move(); o.draw();
        if(o.y > canvas.height) { obstacles.splice(i,1); score += 1; }
        if(o.collides(dodgePlayer)) gameOver();
    });
}

// ======= GAME OVER =======
function gameOver() {
    clearInterval(gameInterval);
    alert("Game Over! Final Score: " + score);
}

// Optional: Start a game by default
// startGame('space');
