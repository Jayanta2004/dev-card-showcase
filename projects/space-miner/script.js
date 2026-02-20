const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game state
let score = 0;
let fuel = 100;
let crystals = 0;
let gameOver = false;

// Ship
let ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  angle: 0,
  thrust: 0.1,
  rotation: 0.1,
  size: 10
};

// Crystals
let crystalsList = [];

// Asteroids
let asteroids = [];

// Keys
let keys = {};

function init() {
  // Create crystals
  for (let i = 0; i < 10; i++) {
    crystalsList.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 8
    });
  }

  // Create asteroids
  for (let i = 0; i < 5; i++) {
    asteroids.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 15
    });
  }
}

function update() {
  if (gameOver) return;

  // Ship controls
  if (keys.ArrowUp) {
    ship.vx += Math.cos(ship.angle) * ship.thrust;
    ship.vy += Math.sin(ship.angle) * ship.thrust;
    fuel -= 0.1;
  }
  if (keys.ArrowLeft) {
    ship.angle -= ship.rotation;
  }
  if (keys.ArrowRight) {
    ship.angle += ship.rotation;
  }
  if (keys[' ']) {
    ship.vx *= 0.95;
    ship.vy *= 0.95;
  }

  // Update ship position
  ship.x += ship.vx;
  ship.y += ship.vy;

  // Wrap around screen
  if (ship.x < 0) ship.x = canvas.width;
  if (ship.x > canvas.width) ship.x = 0;
  if (ship.y < 0) ship.y = canvas.height;
  if (ship.y > canvas.height) ship.y = 0;

  // Update asteroids
  asteroids.forEach(asteroid => {
    asteroid.x += asteroid.vx;
    asteroid.y += asteroid.vy;
    // Wrap
    if (asteroid.x < 0) asteroid.x = canvas.width;
    if (asteroid.x > canvas.width) asteroid.x = 0;
    if (asteroid.y < 0) asteroid.y = canvas.height;
    if (asteroid.y > canvas.height) asteroid.y = 0;
  });

  // Check crystal collection
  crystalsList = crystalsList.filter(crystal => {
    const dx = crystal.x - ship.x;
    const dy = crystal.y - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < ship.size + crystal.size) {
      crystals++;
      score += 10;
      return false;
    }
    return true;
  });

  // Check asteroid collision
  asteroids.forEach(asteroid => {
    const dx = asteroid.x - ship.x;
    const dy = asteroid.y - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < ship.size + asteroid.size) {
      gameOver = true;
    }
  });

  // Fuel depletion
  fuel -= 0.01;
  if (fuel <= 0) {
    gameOver = true;
  }

  updateUI();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ship
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(ship.size, 0);
  ctx.lineTo(-ship.size / 2, -ship.size / 2);
  ctx.lineTo(-ship.size / 2, ship.size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Draw crystals
  ctx.fillStyle = 'blue';
  crystalsList.forEach(crystal => {
    ctx.fillRect(crystal.x - crystal.size / 2, crystal.y - crystal.size / 2, crystal.size, crystal.size);
  });

  // Draw asteroids
  ctx.fillStyle = 'red';
  asteroids.forEach(asteroid => {
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
    ctx.fill();
  });

  if (gameOver) {
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
  }
}

function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('fuel').textContent = Math.max(0, Math.floor(fuel));
  document.getElementById('crystals').textContent = crystals;
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') e.preventDefault();
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

document.getElementById('restart').addEventListener('click', () => {
  ship.x = canvas.width / 2;
  ship.y = canvas.height / 2;
  ship.vx = 0;
  ship.vy = 0;
  ship.angle = 0;
  score = 0;
  fuel = 100;
  crystals = 0;
  gameOver = false;
  init();
  updateUI();
});

init();
gameLoop();