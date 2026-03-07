const game = document.getElementById("game")
const typing = document.getElementById("typing")
const scoreEl = document.getElementById("score")
const comboEl = document.getElementById("combo")
const restartBtn = document.getElementById("restart")

const words = ["code","debug","logic","array","pixel","script","stack","loop"]

let score = 0
let combo = 1
let speed = 2

const player = document.createElement("div")
player.id="player"
game.appendChild(player)

let playerX = 190

document.addEventListener("keydown",e=>{

if(e.key==="a"||e.key==="ArrowLeft") playerX-=20
if(e.key==="d"||e.key==="ArrowRight") playerX+=20

playerX=Math.max(0,Math.min(380,playerX))
player.style.left=playerX+"px"

})

function spawnWord(){

const w=document.createElement("div")
w.className="word"
w.textContent=words[Math.floor(Math.random()*words.length)]

w.style.left=Math.random()*360+"px"
w.style.top="0px"

game.appendChild(w)

}

function updateWords(){

const falling=document.querySelectorAll(".word")

falling.forEach(word=>{

let y=parseInt(word.style.top)
y+=speed

word.style.top=y+"px"

const wx=parseInt(word.style.left)

if(y>430 && wx<playerX+40 && wx+40>playerX){

alert("Game Over")
restart()

}

})

}

function checkTyping(){

const val=typing.value.trim()

const falling=document.querySelectorAll(".word")

falling.forEach(word=>{

if(word.textContent===val){

word.remove()

score+=combo
scoreEl.textContent=score

combo++
comboEl.textContent=combo+"x"

typing.value=""

speed+=0.1

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

restartBtn.onclick=restart

function restart(){

document.querySelectorAll(".word").forEach(w=>w.remove())

score=0
combo=1
speed=2

scoreEl.textContent=0
comboEl.textContent="1x"

playerX=190

}