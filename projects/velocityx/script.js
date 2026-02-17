const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const lapText = document.getElementById("lapText");
const timerText = document.getElementById("timerText");
const restartBtn = document.getElementById("restartBtn");

let car, keys, lap, startTime, gameRunning;

function init(){
car = {
x: 200,
y: 250,
width: 40,
height: 20,
angle: 0,
speed: 0,
maxSpeed: 5,
acceleration: 0.2,
friction: 0.05,
turnSpeed: 0.05
};

keys = {};
lap = 0;
startTime = Date.now();
gameRunning = true;
updateUI();
gameLoop();
}

document.addEventListener("keydown", e=> keys[e.key]=true);
document.addEventListener("keyup", e=> keys[e.key]=false);
restartBtn.addEventListener("click", init);

function update(){
if(!gameRunning) return;

if(keys["ArrowUp"]) car.speed += car.acceleration;
if(keys["ArrowDown"]) car.speed -= car.acceleration;

car.speed *= (1 - car.friction);
car.speed = Math.max(-car.maxSpeed, Math.min(car.speed, car.maxSpeed));

if(keys["ArrowLeft"]) car.angle -= car.turnSpeed;
if(keys["ArrowRight"]) car.angle += car.turnSpeed;

car.x += Math.cos(car.angle) * car.speed;
car.y += Math.sin(car.angle) * car.speed;

checkBoundaries();
checkLap();
updateUI();
}

function checkBoundaries(){
if(car.x<0 || car.x>canvas.width || car.y<0 || car.y>canvas.height){
car.speed *= -0.5;
}
}

function checkLap(){
if(car.x > 850 && car.y > 200 && car.y < 300){
lap++;
}
}

function updateUI(){
lapText.textContent = "Lap: " + lap;
let time = ((Date.now() - startTime)/1000).toFixed(2);
timerText.textContent = "Time: " + time + "s";
}

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.save();
ctx.translate(car.x,car.y);
ctx.rotate(car.angle);
ctx.fillStyle="#facc15";
ctx.fillRect(-car.width/2,-car.height/2,car.width,car.height);
ctx.restore();
}

function gameLoop(){
update();
draw();
if(gameRunning) requestAnimationFrame(gameLoop);
}

init();
