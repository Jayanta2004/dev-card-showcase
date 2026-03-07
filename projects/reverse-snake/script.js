const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

const scoreEl = document.getElementById("score")
const pauseBtn = document.getElementById("pause")
const restartBtn = document.getElementById("restart")

const grid = 20
let score = 0
let speed = 200
let paused = false

let food = {x:10,y:10}

let snake = [
{x:5,y:5},
{x:4,y:5},
{x:3,y:5}
]

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

// draw snake
ctx.fillStyle="#2b7cff"

snake.forEach(part=>{
ctx.fillRect(part.x*grid,part.y*grid,grid-2,grid-2)
})

// draw food
ctx.fillStyle="#ff4d4d"
ctx.fillRect(food.x*grid,food.y*grid,grid-2,grid-2)

}

function update(){

if(paused) return

// snake moves toward food
let head = {...snake[0]}

if(head.x < food.x) head.x++
else if(head.x > food.x) head.x--
else if(head.y < food.y) head.y++
else if(head.y > food.y) head.y--

snake.unshift(head)

// eat food
if(head.x === food.x && head.y === food.y){

score++
scoreEl.textContent = score

speed = Math.max(80, speed - 5)

food.x = Math.floor(Math.random()*20)
food.y = Math.floor(Math.random()*20)

}else{

snake.pop()

}

// wall collision
if(head.x<0 || head.y<0 || head.x>=20 || head.y>=20){

alert("Game Over")
restart()

}

}

function gameLoop(){

update()
draw()

setTimeout(gameLoop,speed)

}

document.addEventListener("keydown",e=>{

if(e.key==="ArrowUp") food.y--
if(e.key==="ArrowDown") food.y++
if(e.key==="ArrowLeft") food.x--
if(e.key==="ArrowRight") food.x++

})

pauseBtn.onclick=()=>{
paused=!paused
pauseBtn.textContent = paused ? "Resume":"Pause"
}

restartBtn.onclick=restart

function restart(){

snake=[
{x:5,y:5},
{x:4,y:5},
{x:3,y:5}
]

food={x:10,y:10}

score=0
speed=200
scoreEl.textContent=0

}

gameLoop()