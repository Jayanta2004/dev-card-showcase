const gridSize = 10
const game = document.getElementById("game")
const timerEl = document.getElementById("timer")
const levelEl = document.getElementById("level")
const restartBtn = document.getElementById("restart")

let player = {x:0,y:0}
let exit = {x:9,y:9}
let lasers = []
let level = 1
let timer = 0
let cells = []

function createGrid(){
game.innerHTML=""
cells=[]

for(let i=0;i<gridSize*gridSize;i++){
let cell=document.createElement("div")
cell.classList.add("cell")
game.appendChild(cell)
cells.push(cell)
}
}

function index(x,y){
return y*gridSize+x
}

function placeLasers(){
lasers=[]
let count=5+level

for(let i=0;i<count;i++){
let x=Math.floor(Math.random()*gridSize)
let y=Math.floor(Math.random()*gridSize)

if((x===0 && y===0) || (x===exit.x && y===exit.y)) continue
lasers.push({x,y})
}
}

function draw(){
cells.forEach(c=>c.className="cell")

cells[index(player.x,player.y)].classList.add("player")
cells[index(exit.x,exit.y)].classList.add("exit")

lasers.forEach(l=>{
cells[index(l.x,l.y)].classList.add("laser")
})
}

function move(dx,dy){
let nx=player.x+dx
let ny=player.y+dy

if(nx<0||ny<0||nx>=gridSize||ny>=gridSize) return

player.x=nx
player.y=ny

check()
draw()
}

function check(){

for(let l of lasers){
if(l.x===player.x && l.y===player.y){
alert("💥 Laser hit! Restarting level.")
resetLevel()
return
}
}

if(player.x===exit.x && player.y===exit.y){
level++
alert("🚀 Level cleared!")
startGame()
}
}

function resetLevel(){
player={x:0,y:0}
placeLasers()
draw()
}

function startGame(){
player={x:0,y:0}
exit={x:9,y:9}
levelEl.textContent=level
createGrid()
placeLasers()
draw()
}

document.addEventListener("keydown",e=>{
if(e.key==="ArrowUp") move(0,-1)
if(e.key==="ArrowDown") move(0,1)
if(e.key==="ArrowLeft") move(-1,0)
if(e.key==="ArrowRight") move(1,0)
})

restartBtn.onclick=()=>{
level=1
timer=0
startGame()
}

setInterval(()=>{
timer++
timerEl.textContent=timer
},1000)

startGame()