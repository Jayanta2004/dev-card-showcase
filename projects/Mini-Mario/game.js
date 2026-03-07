const world = document.getElementById("world");
const mario = document.getElementById("mario");
const hud = document.getElementById("hud");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

let cameraX = 0;
let score = 0;
let gameRunning = false;

function startGame(){
  x = 100;
  y = 80;
  velocityY = 0;
  gravity = 0.7;
  jumping = false;
  score = 0;
  speed = 5;
  spawnX = 800;
  cameraX = 0;

  obstacles.forEach(o=>o.remove());
  coins.forEach(c=>c.remove());
  obstacles = [];
  coins = [];

  gameOverScreen.style.display = "none";
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function gameLoop(){
  if(!gameRunning) return;

  updatePlayer();

  if(x > spawnX - 600) spawnObstacle();

  speed += 0.0005;

  checkCollision();

  cameraX = x - window.innerWidth/3;
  if(cameraX < 0) cameraX = 0;

  world.style.left = -cameraX + "px";

  requestAnimationFrame(gameLoop);
}

function endGame(){
  gameRunning = false;
  finalScore.innerText = "GAME OVER\nScore: " + score;
  gameOverScreen.style.display = "flex";
}

startGame();