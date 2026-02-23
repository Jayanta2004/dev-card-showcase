const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("scoreBoard");
const restartBtn = document.getElementById("restartBtn");

let player, bullets, enemies, keys, score, gameOver;

function init(){
player = { x: 400, y: 450, width: 40, height: 40, speed: 6 };
bullets = [];
enemies = [];
keys = {};
score = 0;
gameOver = false;
scoreBoard.textContent = "Score: 0";
restartBtn.style.display = "none";
spawnEnemies();
gameLoop();
}

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

document.addEventListener("keypress", e=>{
if(e.code==="Space"){
bullets.push({
x: player.x + player.width/2 - 5,
y: player.y,
width: 10,
height: 20,
speed: 8
});
}
});

restartBtn.addEventListener("click", init);

function spawnEnemies(){
setInterval(()=>{
if(!gameOver){
enemies.push({
x: Math.random()*760,
y: -40,
width: 40,
height: 40,
speed: 2 + Math.random()*2
});
}
},1000);
}

function update(){
if(gameOver) return;

if(keys["ArrowLeft"] && player.x>0) player.x -= player.speed;
if(keys["ArrowRight"] && player.x<canvas.width-player.width) player.x += player.speed;

bullets.forEach(b=> b.y -= b.speed);
enemies.forEach(e=> e.y += e.speed);

checkCollisions();

bullets = bullets.filter(b=> b.y>0);
enemies = enemies.filter(e=> e.y<canvas.height);
}

function checkCollisions(){
enemies.forEach((enemy,eIndex)=>{
if(enemy.y + enemy.height >= player.y &&
enemy.x < player.x + player.width &&
enemy.x + enemy.width > player.x){
gameOver = true;
restartBtn.style.display = "block";
}

bullets.forEach((bullet,bIndex)=>{
if(bullet.x < enemy.x + enemy.width &&
bullet.x + bullet.width > enemy.x &&
bullet.y < enemy.y + enemy.height &&
bullet.y + bullet.height > enemy.y){
enemies.splice(eIndex,1);
bullets.splice(bIndex,1);
score++;
scoreBoard.textContent = "Score: " + score;
}
});
});
}

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#38bdf8";
ctx.fillRect(player.x,player.y,player.width,player.height);

ctx.fillStyle="#f87171";
enemies.forEach(e=> ctx.fillRect(e.x,e.y,e.width,e.height));

ctx.fillStyle="#facc15";
bullets.forEach(b=> ctx.fillRect(b.x,b.y,b.width,b.height));
}

function gameLoop(){
update();
draw();
if(!gameOver) requestAnimationFrame(gameLoop);
}

init();
