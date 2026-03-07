const belt = document.getElementById("belt")
const scoreEl = document.getElementById("score")
const livesEl = document.getElementById("lives")

const shapes = ["⚪","⬜","🔺","⭐"]
const types = ["circle","square","triangle","star"]

let currentShape=null
let currentType=null
let pos=0
let score=0
let lives=3
let speed=2
let interval

function spawnShape(){

belt.innerHTML=""

pos=0

let index=Math.floor(Math.random()*shapes.length)

currentShape=shapes[index]
currentType=types[index]

let shape=document.createElement("div")

shape.className="shape"
shape.innerText=currentShape

belt.appendChild(shape)

interval=setInterval(moveShape,20)
}

function moveShape(){

let shape=document.querySelector(".shape")

pos+=speed

shape.style.left=pos+"px"

if(pos>460){

clearInterval(interval)

lives--

livesEl.innerText=lives

if(lives<=0){

alert("Factory Shutdown! Score: "+score)

resetGame()

}else{

spawnShape()
}

}
}

document.querySelectorAll(".machines button").forEach(btn=>{

btn.onclick=()=>{

if(btn.dataset.shape===currentType){

score+=10
scoreEl.innerText=score

speed+=0.3

clearInterval(interval)

spawnShape()

}else{

lives--

livesEl.innerText=lives
}
}
})

function resetGame(){

score=0
lives=3
speed=2

scoreEl.innerText=0
livesEl.innerText=3
}

document.getElementById("start").onclick=spawnShape