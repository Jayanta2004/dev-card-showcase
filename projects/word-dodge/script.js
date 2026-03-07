const game = document.getElementById("game")
const typing = document.getElementById("typing")
const scoreEl = document.getElementById("score")
const restartBtn = document.getElementById("restart")

let words = ["code","game","html","css","script","debug","logic","pixel"]

let score = 0
let speed = 2

const player = document.createElement("div")
player.id="player"
game.appendChild(player)

let playerX = 180

function movePlayer(e){

if(e.key==="a" || e.key==="ArrowLeft"){
playerX -= 20
}

if(e.key==="d" || e.key==="ArrowRight"){
playerX += 20
}

playerX = Math.max(0,Math.min(360,playerX))
player.style.left = playerX+"px"

}

document.addEventListener("keydown",movePlayer)

function spawnWord(){

let word = document.createElement("div")
word.className="word"

word.textContent = words[Math.floor(Math.random()*words.length)]

word.style.left = Math.random()*340+"px"
word.style.top = "0px"

game.appendChild(word)

}

function updateWords(){

let falling = document.querySelectorAll(".word")

falling.forEach(w=>{

let y = parseInt(w.style.top)

y += speed

w.style.top = y+"px"

let px = playerX
let wx = parseInt(w.style.left)

if(y > 420 && wx < px+40 && wx+40 > px){

alert("Game Over")
restart()

}

})

}

function checkTyping(){

let value = typing.value.trim()

let falling = document.querySelectorAll(".word")

falling.forEach(w=>{

if(w.textContent === value){

w.remove()

score++
scoreEl.textContent = score

typing.value=""

speed += 0.1

}

})

}

typing.addEventListener("input",checkTyping)

function gameLoop(){

updateWords()

requestAnimationFrame(gameLoop)

}

setInterval(spawnWord,1500)

gameLoop()

restartBtn.onclick = restart

function restart(){

document.querySelectorAll(".word").forEach(w=>w.remove())

score = 0
speed = 2
scoreEl.textContent = 0
playerX = 180

}