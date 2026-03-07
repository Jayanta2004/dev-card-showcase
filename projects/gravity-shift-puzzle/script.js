const player = document.getElementById("player")
const goal = document.querySelector(".goal")
const movesEl = document.getElementById("moves")
const resetBtn = document.getElementById("reset")

let moves = 0

function setGravity(dir){

moves++
movesEl.textContent = moves

let interval = setInterval(() => {

let rect = player.getBoundingClientRect()
let gameRect = document.getElementById("game").getBoundingClientRect()

let step = 5

if(dir === "down") player.style.top = player.offsetTop + step + "px"
if(dir === "up") player.style.top = player.offsetTop - step + "px"
if(dir === "left") player.style.left = player.offsetLeft - step + "px"
if(dir === "right") player.style.left = player.offsetLeft + step + "px"

checkCollision()

if(checkGoal()){
clearInterval(interval)
alert("🎉 Level Complete!")
}

if(
player.offsetTop < 0 ||
player.offsetLeft < 0 ||
player.offsetTop > 360 ||
player.offsetLeft > 360
){
clearInterval(interval)
}

},20)

}

function checkCollision(){

let blocks = document.querySelectorAll(".block")

blocks.forEach(block => {

let p = player.getBoundingClientRect()
let b = block.getBoundingClientRect()

if(
p.left < b.right &&
p.right > b.left &&
p.top < b.bottom &&
p.bottom > b.top
){
}
})
}

function checkGoal(){

let p = player.getBoundingClientRect()
let g = goal.getBoundingClientRect()

return(
p.left < g.right &&
p.right > g.left &&
p.top < g.bottom &&
p.bottom > g.top
)

}

resetBtn.onclick = () => {

player.style.top = "20px"
player.style.left = "20px"

moves = 0
movesEl.textContent = 0

}