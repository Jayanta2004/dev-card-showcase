const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const gridSize = 40;
const cols = canvas.width / gridSize;
const rows = canvas.height / gridSize;

// Game state
let money = 100;
let lives = 10;
let score = 0;
let wave = 1;
let gameRunning = false;

// Path: array of [x, y] grid positions
const path = [
  [0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7],
  [10, 7], [11, 7], [12, 7], [13, 7], [14, 7], [15, 7], [16, 7], [17, 7], [18, 7], [19, 7]
];

// Turrets
let turrets = [];
let selectedTurretType = 'basic';

// Creeps
let creeps = [];
let bullets = [];

// Turret costs
const turretCosts = {
  basic: 50,
  advanced: 100
};

// Turret stats
const turretStats = {
  basic: { range: 100, damage: 20, fireRate: 30, color: '#3498db' },
  advanced: { range: 150, damage: 40, fireRate: 20, color: '#e74c3c' }
};

// Creep stats
const creepStats = {
  health: 50,
  speed: 1,
  reward: 10,
  color: '#f39c12'
};

class Creep {
  constructor() {
    this.pathIndex = 0;
    this.x = path[0][0] * gridSize + gridSize / 2;
    this.y = path[0][1] * gridSize + gridSize / 2;
    this.health = creepStats.health;
    this.maxHealth = creepStats.health;
    this.speed = creepStats.speed;
  }

  update() {
    if (this.pathIndex < path.length - 1) {
      const targetX = path[this.pathIndex + 1][0] * gridSize + gridSize / 2;
      const targetY = path[this.pathIndex + 1][1] * gridSize + gridSize / 2;
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.speed) {
        this.pathIndex++;
        this.x = targetX;
        this.y = targetY;
      } else {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      }
    } else {
      // Reached end
      lives--;
      updateUI();
      return true; // Remove creep
    }
    return false;
  }

  draw() {
    ctx.fillStyle = creepStats.color;
    ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
    // Health bar
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(this.x - 10, this.y - 15, 20, 3);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(this.x - 10, this.y - 15, (this.health / this.maxHealth) * 20, 3);
  }
}

class Turret {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.level = 1;
    this.lastFired = 0;
    this.stats = { ...turretStats[type] };
  }

  update() {
    this.lastFired++;
    if (this.lastFired >= this.stats.fireRate) {
      const target = this.findTarget();
      if (target) {
        bullets.push(new Bullet(this.x, this.y, target, this.stats.damage));
        this.lastFired = 0;
      }
    }
  }

  findTarget() {
    for (let creep of creeps) {
      const dx = creep.x - this.x;
      const dy = creep.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= this.stats.range) {
        return creep;
      }
    }
    return null;
  }

  draw() {
    ctx.fillStyle = this.stats.color;
    ctx.fillRect(this.x - 15, this.y - 15, 30, 30);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.level, this.x, this.y + 4);
  }

  upgrade() {
    if (money >= 75) {
      money -= 75;
      this.level++;
      this.stats.damage *= 1.5;
      this.stats.range *= 1.1;
      updateUI();
    }
  }
}

class Bullet {
  constructor(x, y, target, damage) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = 5;
  }

  update() {
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < this.speed) {
      this.target.health -= this.damage;
      if (this.target.health <= 0) {
        score += creepStats.reward;
        money += creepStats.reward;
        updateUI();
      }
      return true; // Hit, remove bullet
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
    return false;
  }

  draw() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
  }
}

function drawGrid() {
  ctx.strokeStyle = '#7f8c8d';
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function drawPath() {
  ctx.strokeStyle = '#f39c12';
  ctx.lineWidth = 20;
  ctx.beginPath();
  for (let i = 0; i < path.length; i++) {
    const x = path[i][0] * gridSize + gridSize / 2;
    const y = path[i][1] * gridSize + gridSize / 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  ctx.lineWidth = 1;
}

function updateUI() {
  document.getElementById('wave').textContent = wave;
  document.getElementById('score').textContent = score;
  document.getElementById('money').textContent = money;
  document.getElementById('lives').textContent = lives;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawPath();

  // Update and draw turrets
  turrets.forEach(turret => {
    turret.update();
    turret.draw();
  });

  // Update and draw creeps
  creeps = creeps.filter(creep => !creep.update());
  creeps.forEach(creep => creep.draw());

  // Update and draw bullets
  bullets = bullets.filter(bullet => !bullet.update());
  bullets.forEach(bullet => bullet.draw());

  if (lives <= 0) {
    alert('Game Over!');
    resetGame();
  }

  requestAnimationFrame(gameLoop);
}

function resetGame() {
  money = 100;
  lives = 10;
  score = 0;
  wave = 1;
  turrets = [];
  creeps = [];
  bullets = [];
  gameRunning = false;
  updateUI();
}

function startWave() {
  if (!gameRunning) {
    gameRunning = true;
    for (let i = 0; i < wave * 5; i++) {
      setTimeout(() => creeps.push(new Creep()), i * 500);
    }
    wave++;
    updateUI();
  }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const gridX = Math.floor(x / gridSize) * gridSize + gridSize / 2;
  const gridY = Math.floor(y / gridSize) * gridSize + gridSize / 2;

  // Check if on path
  const onPath = path.some(p => p[0] * gridSize + gridSize / 2 === gridX && p[1] * gridSize + gridSize / 2 === gridY);
  if (onPath) return;

  // Check if turret already there
  const existingTurret = turrets.find(t => t.x === gridX && t.y === gridY);
  if (existingTurret) {
    // Upgrade
    existingTurret.upgrade();
  } else {
    // Place new turret
    if (money >= turretCosts[selectedTurretType]) {
      money -= turretCosts[selectedTurretType];
      turrets.push(new Turret(gridX, gridY, selectedTurretType));
      updateUI();
    }
  }
});

document.getElementById('start-wave').addEventListener('click', startWave);

document.getElementById('turret-basic').addEventListener('click', () => {
  selectedTurretType = 'basic';
  document.querySelectorAll('.turret-btn').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('turret-basic').classList.add('selected');
});

document.getElementById('turret-advanced').addEventListener('click', () => {
  selectedTurretType = 'advanced';
  document.querySelectorAll('.turret-btn').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('turret-advanced').classList.add('selected');
});

updateUI();
gameLoop();