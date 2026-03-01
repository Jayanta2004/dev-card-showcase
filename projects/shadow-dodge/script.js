/* ================= VARIABLES ================= */
const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOver");

let playerX = 230;
let score = 0;
let shadows = [];
let speed = 3;
let gameRunning = true;

/* ================= KEYBOARD CONTROL ================= */
document.addEventListener("keydown", movePlayer);

function movePlayer(e){
  if(!gameRunning) return;

  if(e.key === "ArrowLeft"){
    playerX -= 20;
  }
  if(e.key === "ArrowRight"){
    playerX += 20;
  }

  if(playerX < 0) playerX = 0;
  if(playerX > 460) playerX = 460;

  player.style.left = playerX + "px";
}

/* ================= CREATE SHADOW ================= */
function createShadow(){
  if(!gameRunning) return;

  const shadow = document.createElement("div");
  shadow.classList.add("shadow");

  let x = Math.random() * 460;
  shadow.style.left = x + "px";

  game.appendChild(shadow);

  shadows.push({
    element: shadow,
    x: x,
    y: -40
  });
}

/* ================= UPDATE SHADOWS ================= */
function updateShadows(){
  if(!gameRunning) return;

  shadows.forEach((s,index)=>{
    s.y += speed;
    s.element.style.top = s.y + "px";

    let playerRect = player.getBoundingClientRect();
    let shadowRect = s.element.getBoundingClientRect();

    // Collision
    if(
      playerRect.left < shadowRect.right &&
      playerRect.right > shadowRect.left &&
      playerRect.top < shadowRect.bottom &&
      playerRect.bottom > shadowRect.top
    ){
      endGame();
    }

    // Remove shadow if out
    if(s.y > 600){
      game.removeChild(s.element);
      shadows.splice(index,1);
    }
  });
}

/* ================= GAME LOOP ================= */
function gameLoop(){
  if(!gameRunning) return;

  updateShadows();
  score++;
  scoreEl.innerText = score;

  // Increase difficulty
  if(score % 200 === 0){
    speed += 1;
  }

  requestAnimationFrame(gameLoop);
}

/* ================= END GAME ================= */
function endGame(){
  gameRunning = false;
  gameOverScreen.style.display = "flex";
  document.getElementById("overText").innerText =
    "💀 Game Over\nScore: " + score;
}

/* ================= RESTART ================= */
function restartGame(){
  score = 0;
  speed = 3;
  playerX = 230;
  player.style.left = playerX + "px";

  shadows.forEach(s => game.removeChild(s.element));
  shadows = [];

  scoreEl.innerText = score;
  gameOverScreen.style.display = "none";
  gameRunning = true;

  gameLoop();
}

/* ================= START GAME ================= */
setInterval(createShadow,800);
gameLoop();