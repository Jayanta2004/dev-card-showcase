const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let emojis = ["😊","😡","😢","😎"];
let currentEmoji = null;
let yPos = 0;
let speed = 2;

let score = 0;
let lives = 3;
let running = false;

function randomEmoji(){
  return emojis[Math.floor(Math.random()*emojis.length)];
}

function drawEmoji(){
  ctx.font = "50px serif";
  ctx.fillText(currentEmoji, canvas.width/2 - 20, yPos);
}

function drawBackground(){
  ctx.fillStyle="rgba(255,247,237,0.6)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function spawnEmoji(){
  currentEmoji = randomEmoji();
  yPos = -20;
}

function updateEmoji(){
  yPos += speed;

  if(yPos > canvas.height - 30){
    lives--;
    updateHUD();
    spawnEmoji();

    if(lives<=0){
      endGame();
    }
  }
}

function checkMatch(key){
  if(!running) return;

  let correct = false;

  if(key==="a" && currentEmoji==="😊") correct=true;
  if(key==="s" && currentEmoji==="😡") correct=true;
  if(key==="d" && currentEmoji==="😢") correct=true;
  if(key==="f" && currentEmoji==="😎") correct=true;

  if(correct){
    score++;
    speed += 0.2;
    spawnEmoji();
  }else{
    lives--;
  }

  updateHUD();

  if(lives<=0){
    endGame();
  }
}

function updateHUD(){
  document.getElementById("score").innerText = score;
  document.getElementById("lives").innerText = lives;
}

function gameLoop(){
  if(!running) return;

  drawBackground();
  drawEmoji();
  updateEmoji();

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown",e=>{
  checkMatch(e.key.toLowerCase());
});

function startGame(){
  score = 0;
  lives = 3;
  speed = 2;
  running = true;
  document.getElementById("msg").innerText="Match emoji with correct key!";
  updateHUD();
  spawnEmoji();
  gameLoop();
}

function endGame(){
  running = false;
  document.getElementById("msg").innerText="💀 Game Over! Final Score: "+score;
}