const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const gravity = 0.6;
const jumpStrength = -10;
const speed = 4;

// Player
const player = {
  x: 50,
  y: 140,
  width: 16,
  height: 16,
  velocityY: 0,
  grounded: true
};

// Obstacles
let obstacles = [];
let frame = 0;
let score = 0;
let gameOver = false;

// Input
function jump() {
  if (player.grounded && !gameOver) {
    player.velocityY = jumpStrength;
    player.grounded = false;
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

canvas.addEventListener("click", jump);

// Game loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    frame++;
    score++;
  }

  // Player physics
  player.velocityY += gravity;
  player.y += player.velocityY;

  if (player.y >= 140) {
    player.y = 140;
    player.velocityY = 0;
    player.grounded = true;
  }

  // Spawn obstacles
  if (frame % 90 === 0 && !gameOver) {
    obstacles.push({
      x: canvas.width,
      y: 150,
      width: 12,
      height: 12
    });
  }

  // Move obstacles
  obstacles.forEach(obs => obs.x -= speed);

  // Collision detection
  obstacles.forEach(obs => {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      gameOver = true;
    }
  });

  obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

  draw();
  requestAnimationFrame(update);
}

// Draw everything
function draw() {
  // Ground
  ctx.fillStyle = "#ffc8dd";
  ctx.fillRect(0, 156, canvas.width, 4);

  // Player (cute blob)
  ctx.fillStyle = "#ff6f91";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Eyes (kawaii vibes)
  ctx.fillStyle = "#000";
  ctx.fillRect(player.x + 4, player.y + 6, 2, 2);
  ctx.fillRect(player.x + 10, player.y + 6, 2, 2);

  // Obstacles
  ctx.fillStyle = "#845ec2";
  obstacles.forEach(obs => {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });

  // Score
  ctx.fillStyle = "#000";
  ctx.font = "10px monospace";
  ctx.fillText(`Score: ${score}`, 10, 15);

  if (gameOver) {
    ctx.fillText("Game Over 💔", 250, 100);
    ctx.fillText("Refresh to retry", 235, 115);
  }
}

update();
