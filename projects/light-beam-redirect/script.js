const laser = document.getElementById("laser")
const mirrors = document.querySelectorAll(".mirror")
const target = document.getElementById("target")
const movesEl = document.getElementById("moves")
const resetBtn = document.getElementById("reset")

let moves = 0
let laserInterval = null

// Rotate mirrors
mirrors.forEach(mirror => {

mirror.addEventListener("click", () => {

mirror.classList.toggle("rotate")

moves++
movesEl.textContent = moves

shootLaser()

})

})

function shootLaser(){

// stop previous laser
if(laserInterval){
clearInterval(laserInterval)
}

let x = 20
let y = 20

let dir = "right"

laserInterval = setInterval(()=>{

// move laser
if(dir === "right") x += 4
if(dir === "left") x -= 4
if(dir === "down") y += 4
if(dir === "up") y -= 4

laser.style.left = x + "px"
laser.style.top = y + "px"

// mirror collision
mirrors.forEach(mirror => {

let m = mirror.getBoundingClientRect()
let l = laser.getBoundingClientRect()

if(
l.left < m.right &&
l.right > m.left &&
l.top < m.bottom &&
l.bottom > m.top &&
!mirror.dataset.hit
){

mirror.dataset.hit = "true"

if(mirror.classList.contains("rotate")){

// "\" mirror reflection
if(dir === "right") dir = "down"
else if(dir === "down") dir = "right"
else if(dir === "left") dir = "up"
else if(dir === "up") dir = "left"

}else{

// "/" mirror reflection
if(dir === "right") dir = "up"
else if(dir === "up") dir = "right"
else if(dir === "left") dir = "down"
else if(dir === "down") dir = "left"

}

// allow mirror to be hit again later
setTimeout(()=>{
delete mirror.dataset.hit
},100)

}

})

// target collision
let t = target.getBoundingClientRect()
let l = laser.getBoundingClientRect()

if(
l.left < t.right &&
l.right > t.left &&
l.top < t.bottom &&
l.bottom > t.top
){

target.classList.add("target-hit")
clearInterval(laserInterval)

setTimeout(()=>{
alert("🎉 Target Activated!")
},100)

}

// stop if out of bounds
if(x > 380 || y > 380 || x < 0 || y < 0){
clearInterval(laserInterval)
}

},20)

}

// reset game
resetBtn.onclick = () => {

laser.style.left = "20px"
laser.style.top = "20px"

target.classList.remove("target-hit")

moves = 0
movesEl.textContent = 0

if(laserInterval){
clearInterval(laserInterval)
}

}