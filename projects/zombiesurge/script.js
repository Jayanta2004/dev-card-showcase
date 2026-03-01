const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const healthFill = document.getElementById("healthFill");
const waveText = document.getElementById("waveText");
const scoreText = document.getElementById("scoreText");
const restartBtn = document.getElementById("restartBtn");

let player, zombies, health, wave, score, gameOver;

function init(){
player = { x:400, y:250, radius:20, speed:4 };
zombies = [];
health = 100;
wave = 1;
score = 0;
gameOver = false;
spawnWave();
updateUI();
gameLoop();
}

document.addEventListener("keydown", movePlayer);
restartBtn.addEventListener("click", init);

function movePlayer(e){
if(gameOver) return;
if(e.key==="ArrowUp") player.y -= player.speed;
if(e.key==="ArrowDown") player.y += player.speed;
if(e.key==="ArrowLeft") player.x -= player.speed;
if(e.key==="ArrowRight") player.x += player.speed;
}

function spawnWave(){
for(let i=0;i<wave*3;i++){
zombies.push({
x: Math.random()*800,
y: Math.random()*500,
radius: 18,
speed: 1 + wave*0.2
});
}
}

function update(){
if(gameOver) return;

zombies.forEach(z=>{
const dx = player.x - z.x;
const dy = player.y - z.y;
const dist = Math.sqrt(dx*dx + dy*dy);

z.x += (dx/dist) * z.speed;
z.y += (dy/dist) * z.speed;

if(dist < player.radius + z.radius){
health -= 0.2;
}
});

if(health<=0){
gameOver=true;
restartBtn.style.display="block";
}

if(zombies.length===0){
wave++;
spawnWave();
}

updateUI();
}

function updateUI(){
healthFill.style.width = health+"%";
waveText.textContent = "Wave: "+wave;
scoreText.textContent = "Score: "+score;
}

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#22c55e";
ctx.beginPath();
ctx.arc(player.x,player.y,player.radius,0,Math.PI*2);
ctx.fill();

ctx.fillStyle="#ef4444";
zombies.forEach(z=>{
ctx.beginPath();
ctx.arc(z.x,z.y,z.radius,0,Math.PI*2);
ctx.fill();
});
}

function gameLoop(){
update();
draw();
if(!gameOver) requestAnimationFrame(gameLoop);
}

init();
