const grid=document.getElementById("grid")
const scoreDisplay=document.getElementById("score")

let board=[
[0,0,0,0],
[0,0,0,0],
[0,0,0,0],
[0,0,0,0]
]

let score=0

function drawBoard(){

grid.innerHTML=""

for(let y=0;y<4;y++){

for(let x=0;x<4;x++){

const tile=document.createElement("div")
tile.className="tile"

if(board[y][x]!==0){
tile.textContent=board[y][x]
}

grid.appendChild(tile)

}

}

scoreDisplay.textContent=score

}

function randomTile(){

let empty=[]

for(let y=0;y<4;y++){
for(let x=0;x<4;x++){

if(board[y][x]===0){

empty.push({x,y})

}

}
}

if(empty.length===0)return

let r=empty[Math.floor(Math.random()*empty.length)]

board[r.y][r.x]=Math.random()<0.9?2:4

}

function slide(row){

row=row.filter(v=>v)

for(let i=0;i<row.length-1;i++){

if(row[i]===row[i+1]){

row[i]*=2
score+=row[i]

row[i+1]=0

}

}

row=row.filter(v=>v)

while(row.length<4)row.push(0)

return row

}

function moveLeft(){

for(let y=0;y<4;y++){

board[y]=slide(board[y])

}

}

function moveRight(){

for(let y=0;y<4;y++){

board[y]=slide(board[y].reverse()).reverse()

}

}

function rotate(){

let newBoard=[[],[],[],[]]

for(let y=0;y<4;y++){
for(let x=0;x<4;x++){

newBoard[x][y]=board[y][x]

}
}

board=newBoard

}

function moveUp(){

rotate()
moveLeft()
rotate()
rotate()
rotate()

}

function moveDown(){

rotate()
moveRight()
rotate()
rotate()
rotate()

}

document.addEventListener("keydown",e=>{

if(e.key==="ArrowLeft") moveLeft()

if(e.key==="ArrowRight") moveRight()

if(e.key==="ArrowUp") moveUp()

if(e.key==="ArrowDown") moveDown()

randomTile()
drawBoard()

})

function aiHint(){

let empty=0

for(let row of board){

for(let v of row){

if(v===0) empty++

}

}

if(empty>6) alert("Hint: Spread tiles evenly")

else alert("Hint: Focus merging on one side")

}

document.getElementById("hintBtn").onclick=aiHint

randomTile()
randomTile()

drawBoard()