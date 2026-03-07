const arena = document.getElementById("arena");
const player = document.getElementById("player");
const safeZone = document.getElementById("safeZone");
const orb = document.getElementById("orb");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const healthEl = document.getElementById("health");
const zoneSizeEl = document.getElementById("zoneSize");
const highScoreEl = document.getElementById("highScore");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let health = 100;
let time = 0;
let zonePercent = 100;
let speed = 2;
let gameInterval;
let shrinkInterval;

let playerPos = { x: 240, y: 240 };

let highScore = localStorage.getItem("zoneHighScore") || 0;
highScoreEl.textContent = highScore;

player.style.left = playerPos.x + "px";
player.style.top = playerPos.y + "px";

function spawnOrb() {
  const x = Math.random() * 480;
  const y = Math.random() * 480;
  orb.style.left = x + "px";
  orb.style.top = y + "px";
}

spawnOrb();

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" || e.key === "w") playerPos.y -= speed;
  if (e.key === "ArrowDown" || e.key === "s") playerPos.y += speed;
  if (e.key === "ArrowLeft" || e.key === "a") playerPos.x -= speed;
  if (e.key === "ArrowRight" || e.key === "d") playerPos.x += speed;

  player.style.left = playerPos.x + "px";
  player.style.top = playerPos.y + "px";
});

function checkCollision() {
  const orbRect = orb.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();

  if (
    playerRect.left < orbRect.right &&
    playerRect.right > orbRect.left &&
    playerRect.top < orbRect.bottom &&
    playerRect.bottom > orbRect.top
  ) {
    score += 10;
    scoreEl.textContent = score;
    spawnOrb();
  }
}

function checkZone() {
  const margin = (100 - zonePercent) * 2.5;
  const min = margin;
  const max = 500 - margin - 20;

  if (
    playerPos.x < min ||
    playerPos.x > max ||
    playerPos.y < min ||
    playerPos.y > max
  ) {
    health -= 1;
    healthEl.textContent = health;
    if (health <= 0) endGame();
  }
}

function shrinkZone() {
  zonePercent -= 0.2;
  if (zonePercent < 30) zonePercent = 30;

  const size = zonePercent + "%";
  safeZone.style.width = size;
  safeZone.style.height = size;
  safeZone.style.top = (100 - zonePercent) / 2 + "%";
  safeZone.style.left = (100 - zonePercent) / 2 + "%";

  zoneSizeEl.textContent = Math.floor(zonePercent) + "%";
}

function startGame() {
  gameInterval = setInterval(() => {
    time++;
    timeEl.textContent = time;
    checkCollision();
    checkZone();
  }, 1000);

  shrinkInterval = setInterval(shrinkZone, 200);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(shrinkInterval);

  if (score > highScore) {
    localStorage.setItem("zoneHighScore", score);
  }

  alert("Game Over! Final Score: " + score);
}

restartBtn.addEventListener("click", () => {
  location.reload();
});

startGame();