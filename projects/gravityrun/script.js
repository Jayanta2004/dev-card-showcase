const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

let player, platforms, keys;

function init(){
player = {
x:100,
y:100,
width:40,
height:40,
vx:0,
vy:0,
speed:4,
jumpForce:-12,
gravity:0.6,
grounded:false
};

platforms = [
{ x:0, y:460, width:900, height:40 },
{ x:200, y:350, width:200, height:20 },
{ x:500, y:300, width:200, height:20 },
{ x:350, y:220, width:150, height:20 }
];

keys = {};
gameLoop();
}

document.addEventListener("keydown", e=>{
keys[e.key]=true;
if(e.code==="Space" && player.grounded){
player.vy = player.jumpForce;
player.grounded = false;
}
});

document.addEventListener("keyup", e=> keys[e.key]=false);
restartBtn.addEventListener("click", init);

function update(){
player.vx = 0;

if(keys["ArrowLeft"]) player.vx = -player.speed;
if(keys["ArrowRight"]) player.vx = player.speed;

player.vy += player.gravity;

player.x += player.vx;
player.y += player.vy;

player.grounded = false;

platforms.forEach(p=>{
if(player.x < p.x + p.width &&
player.x + player.width > p.x &&
player.y + player.height > p.y &&
player.y + player.height < p.y + p.height + player.vy){
player.y = p.y - player.height;
player.vy = 0;
player.grounded = true;
}
});

if(player.x < 0) player.x = 0;
if(player.x + player.width > canvas.width)
player.x = canvas.width - player.width;

if(player.y > canvas.height){
init();
}
}

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#38bdf8";
ctx.fillRect(player.x,player.y,player.width,player.height);

ctx.fillStyle="#22c55e";
platforms.forEach(p=>{
ctx.fillRect(p.x,p.y,p.width,p.height);
});
}

function gameLoop(){
update();
draw();
requestAnimationFrame(gameLoop);
}

init();
