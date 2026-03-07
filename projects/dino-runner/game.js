const canvas=document.getElementById("gameCanvas")
const ctx=canvas.getContext("2d")

canvas.width=800
canvas.height=300

const scoreDisplay=document.getElementById("score")

let score=0
let gameSpeed=5

const dino={
x:80,
y:220,
width:40,
height:40,
vy:0,
jumping:false
}

const obstacles=[]
const powerUps=[]

function spawnObstacle(){

if(Math.random()<0.02){

obstacles.push({
x:canvas.width,
y:220,
width:20,
height:40
})

}

}

function spawnPowerUp(){

if(Math.random()<0.005){

powerUps.push({
x:canvas.width,
y:200,
size:20,
type:"shield"
})

}

}

document.addEventListener("keydown",e=>{

if(e.code==="Space" && !dino.jumping){

dino.vy=-10
dino.jumping=true

}

})

function updateDino(){

dino.vy+=0.5
dino.y+=dino.vy

if(dino.y>=220){

dino.y=220
dino.vy=0
dino.jumping=false

}

}

function updateObstacles(){

for(let o of obstacles){

o.x-=gameSpeed

}

}

function updatePowerUps(){

for(let p of powerUps){

p.x-=gameSpeed

}

}

function detectCollision(){

for(let o of obstacles){

if(
dino.x < o.x + o.width &&
dino.x + dino.width > o.x &&
dino.y < o.y + o.height &&
dino.y + dino.height > o.y
){

alert("Game Over")
location.reload()

}

}

}

function drawDino(){

ctx.fillStyle="black"

ctx.fillRect(
dino.x,
dino.y,
dino.width,
dino.height
)

}

function drawObstacles(){

ctx.fillStyle="green"

for(let o of obstacles){

ctx.fillRect(
o.x,
o.y,
o.width,
o.height
)

}

}

function drawPowerUps(){

ctx.fillStyle="blue"

for(let p of powerUps){

ctx.fillRect(
p.x,
p.y,
p.size,
p.size
)

}

}

function gameLoop(){

ctx.clearRect(0,0,canvas.width,canvas.height)

spawnObstacle()
spawnPowerUp()

updateDino()
updateObstacles()
updatePowerUps()

detectCollision()

drawDino()
drawObstacles()
drawPowerUps()

score++
scoreDisplay.textContent=score

if(score%500===0){

gameSpeed+=1

}

requestAnimationFrame(gameLoop)

}

gameLoop()