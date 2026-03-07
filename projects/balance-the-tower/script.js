const dropLine = document.getElementById("dropLine")
const tower = document.getElementById("tower")
const scoreEl = document.getElementById("score")
const restartBtn = document.getElementById("restart")

let score = 0
let blocks = []

function dropBlock(){

const lineX = dropLine.getBoundingClientRect().left
const gameX = document.getElementById("gameArea").getBoundingClientRect().left

let x = lineX - gameX

let block = document.createElement("div")
block.classList.add("block")

tower.appendChild(block)

blocks.push(x)

checkBalance()

score++
scoreEl.textContent = score

}

function checkBalance(){

if(blocks.length < 2) return

let last = blocks[blocks.length-1]
let prev = blocks[blocks.length-2]

let diff = Math.abs(last - prev)

if(diff > 60){
alert("💥 Tower collapsed!")
restartGame()
}

}

function restartGame(){

tower.innerHTML = ""
blocks = []
score = 0
scoreEl.textContent = 0

}

document.addEventListener("keydown", e => {

if(e.code === "Space"){
dropBlock()
}

})

restartBtn.onclick = restartGame