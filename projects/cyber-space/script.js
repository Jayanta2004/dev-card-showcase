const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const healthEl = document.getElementById("health");
const gameOverScreen = document.getElementById("gameOver");

let playerX = 275;
let bullets = [];
let enemies = [];
let score = 0;
let health = 100;
let gameRunning = true;

/* PLAYER CONTROL */
document.addEventListener("keydown", movePlayer);
document.addEventListener("keydown", shootBullet);

function movePlayer(e){
  if(!gameRunning) return;

  if(e.key === "ArrowLeft"){
    playerX -= 20;
  }
  if(e.key === "ArrowRight"){
    playerX += 20;
  }

  if(playerX < 0) playerX = 0;
  if(playerX > 550) playerX = 550;

  player.style.left = playerX + "px";
}

/* SHOOT */
function shootBullet(e){
  if(e.code === "Space" && gameRunning){
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");

    bullet.style.left = playerX + 22 + "px";
    bullet.style.top = "620px";

    game.appendChild(bullet);

    bullets.push({
      element: bullet,
      y: 620
    });
  }
}

/* CREATE ENEMY */
function createEnemy(){
  if(!gameRunning) return;

  const enemy = document.createElement("div");
  enemy.classList.add("enemy");

  let x = Math.random() * 560;
  enemy.style.left = x + "px";
  enemy.style.top = "-40px";

  game.appendChild(enemy);

  enemies.push({
    element: enemy,
    x: x,
    y: -40
  });
}

/* UPDATE BULLETS */
function updateBullets(){
  bullets.forEach((b,index)=>{
    b.y -= 8;
    b.element.style.top = b.y + "px";

    if(b.y < 0){
      game.removeChild(b.element);
      bullets.splice(index,1);
    }
  });
}

/* UPDATE ENEMIES */
function updateEnemies(){
  enemies.forEach((e,index)=>{
    e.y += 3;
    e.element.style.top = e.y + "px";

    // Collision with player
    let pRect = player.getBoundingClientRect();
    let eRect = e.element.getBoundingClientRect();

    if(
      pRect.left < eRect.right &&
      pRect.right > eRect.left &&
      pRect.top < eRect.bottom &&
      pRect.bottom > eRect.top
    ){
      health -= 20;
      healthEl.innerText = health;
      game.removeChild(e.element);
      enemies.splice(index,1);

      if(health <= 0){
        endGame();
      }
    }

    // Enemy goes out
    if(e.y > 700){
      game.removeChild(e.element);
      enemies.splice(index,1);
    }
  });
}

/* COLLISION BULLET & ENEMY */
function checkCollisions(){
  bullets.forEach((b,bIndex)=>{
    enemies.forEach((e,eIndex)=>{
      let bRect = b.element.getBoundingClientRect();
      let eRect = e.element.getBoundingClientRect();

      if(
        bRect.left < eRect.right &&
        bRect.right > eRect.left &&
        bRect.top < eRect.bottom &&
        bRect.bottom > eRect.top
      ){
        score += 10;
        scoreEl.innerText = score;

        game.removeChild(b.element);
        game.removeChild(e.element);

        bullets.splice(bIndex,1);
        enemies.splice(eIndex,1);
      }
    });
  });
}

/* GAME LOOP */
function gameLoop(){
  if(!gameRunning) return;

  updateBullets();
  updateEnemies();
  checkCollisions();

  requestAnimationFrame(gameLoop);
}

/* END GAME */
function endGame(){
  gameRunning = false;
  gameOverScreen.style.display = "flex";
  document.getElementById("overText").innerText =
    "💀 Game Over\nScore: " + score;
}

/* RESTART */
function restartGame(){
  bullets.forEach(b=>game.removeChild(b.element));
  enemies.forEach(e=>game.removeChild(e.element));
  bullets = [];
  enemies = [];
  score = 0;
  health = 100;
  playerX = 275;

  scoreEl.innerText = score;
  healthEl.innerText = health;
  player.style.left = playerX + "px";

  gameOverScreen.style.display = "none";
  gameRunning = true;
  gameLoop();
}

/* START GAME */
setInterval(createEnemy,1000);
gameLoop();