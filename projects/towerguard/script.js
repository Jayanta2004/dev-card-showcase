const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const waveText = document.getElementById("waveText");
const moneyText = document.getElementById("moneyText");
const startWaveBtn = document.getElementById("startWaveBtn");

let enemies = [];
let towers = [];
let bullets = [];

let money = 100;
let wave = 1;
let spawning = false;

const path = [
{ x:0, y:250 },
{ x:300, y:250 },
{ x:300, y:100 },
{ x:600, y:100 },
{ x:600, y:400 },
{ x:900, y:400 }
];

canvas.addEventListener("click", e=>{
if(money >= 50){
const rect = canvas.getBoundingClientRect();
towers.push({
x: e.clientX - rect.left,
y: e.clientY - rect.top,
range:120,
cooldown:0
});
money -= 50;
updateUI();
}
});

startWaveBtn.addEventListener("click", ()=>{
if(!spawning){
spawnWave();
}
});

function spawnWave(){
spawning = true;
let count = 0;

const interval = setInterval(()=>{
enemies.push({
x:path[0].x,
y:path[0].y,
hp: 3 + wave,
speed: 1 + wave*0.2,
pathIndex:0
});
count++;

if(count >= 5 + wave){
clearInterval(interval);
spawning = false;
}
},800);
}

function update(){
moveEnemies();
handleTowers();
moveBullets();
checkCollisions();
updateUI();
}

function moveEnemies(){
enemies.forEach(enemy=>{
const target = path[enemy.pathIndex + 1];
if(!target) return;

const dx = target.x - enemy.x;
const dy = target.y - enemy.y;
const dist = Math.sqrt(dx*dx + dy*dy);

enemy.x += (dx/dist) * enemy.speed;
enemy.y += (dy/dist) * enemy.speed;

if(dist < 5){
enemy.pathIndex++;
}
});
}

function handleTowers(){
towers.forEach(tower=>{
tower.cooldown--;

const target = enemies.find(enemy=>{
const dx = enemy.x - tower.x;
const dy = enemy.y - tower.y;
return Math.sqrt(dx*dx + dy*dy) < tower.range;
});

if(target && tower.cooldown <= 0){
bullets.push({
x: tower.x,
y: tower.y,
target: target,
speed:5
});
tower.cooldown = 60;
}
});
}

function moveBullets(){
bullets.forEach(bullet=>{
const dx = bullet.target.x - bullet.x;
const dy = bullet.target.y - bullet.y;
const dist = Math.sqrt(dx*dx + dy*dy);

bullet.x += (dx/dist) * bullet.speed;
bullet.y += (dy/dist) * bullet.speed;
});
}

function checkCollisions(){
bullets.forEach((bullet,bIndex)=>{
if(!bullet.target) return;

const dx = bullet.target.x - bullet.x;
const dy = bullet.target.y - bullet.y;
const dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 10){
bullet.target.hp--;
bullets.splice(bIndex,1);

if(bullet.target.hp <= 0){
money += 20;
enemies = enemies.filter(e=> e !== bullet.target);
}
}
});
}

function drawPath(){
ctx.strokeStyle="#a855f7";
ctx.lineWidth=5;
ctx.beginPath();
ctx.moveTo(path[0].x,path[0].y);
path.forEach(p=> ctx.lineTo(p.x,p.y));
ctx.stroke();
}

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);

drawPath();

ctx.fillStyle="#22c55e";
towers.forEach(t=>{
ctx.beginPath();
ctx.arc(t.x,t.y,15,0,Math.PI*2);
ctx.fill();
});

ctx.fillStyle="#ef4444";
enemies.forEach(e=>{
ctx.beginPath();
ctx.arc(e.x,e.y,12,0,Math.PI*2);
ctx.fill();
});

ctx.fillStyle="#facc15";
bullets.forEach(b=>{
ctx.beginPath();
ctx.arc(b.x,b.y,5,0,Math.PI*2);
ctx.fill();
});
}

function updateUI(){
waveText.textContent = "Wave: " + wave;
moneyText.textContent = "Money: " + money;
}

function gameLoop(){
update();
draw();
requestAnimationFrame(gameLoop);
}

gameLoop();
