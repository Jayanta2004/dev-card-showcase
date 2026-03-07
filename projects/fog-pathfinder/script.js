const game = document.getElementById("game")
const movesEl = document.getElementById("moves")
const resetBtn = document.getElementById("reset")

const size = 8
let moves = 0

let player = {x:0,y:0}
let goal = {x:7,y:7}

let grid = []

function createGrid(){

game.innerHTML=""
grid=[]

for(let y=0;y<size;y++){

let row=[]

for(let x=0;x<size;x++){

let cell=document.createElement("div")
cell.classList.add("cell","fog")

game.appendChild(cell)

row.push(cell)

}

grid.push(row)

}

update()
}

function update(){

grid.forEach(row=>row.forEach(cell=>{
cell.classList.remove("player","goal")
}))

grid[player.y][player.x].classList.add("player")
grid[goal.y][goal.x].classList.add("goal")

revealFog()

}

function revealFog(){

for(let y=-1;y<=1;y++){
for(let x=-1;x<=1;x++){

let nx=player.x+x
let ny=player.y+y

if(nx>=0 && ny>=0 && nx<size && ny<size){
grid[ny][nx].classList.remove("fog")
}

}
}

}

function move(dx,dy){

let nx=player.x+dx
let ny=player.y+dy

if(nx<0||ny<0||nx>=size||ny>=size) return

player.x=nx
player.y=ny

moves++
movesEl.textContent=moves

update()

if(player.x===goal.x && player.y===goal.y){
setTimeout(()=>{
alert("🏆 Treasure Found!")
},100)
}

}

document.addEventListener("keydown",e=>{

if(e.key==="ArrowUp") move(0,-1)
if(e.key==="ArrowDown") move(0,1)
if(e.key==="ArrowLeft") move(-1,0)
if(e.key==="ArrowRight") move(1,0)

})

resetBtn.onclick=()=>{

player={x:0,y:0}
moves=0
movesEl.textContent=0

createGrid()

}

createGrid()