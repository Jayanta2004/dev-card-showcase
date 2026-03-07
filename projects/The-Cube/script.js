let cube = document.getElementById("cube")

let xRotation = -30
let yRotation = 30
let zRotation = 0

function updateCube(){

cube.style.transform =
`rotateX(${xRotation}deg)
 rotateY(${yRotation}deg)
 rotateZ(${zRotation}deg)`

}

/* ROTATIONS */

function rotateX(){

xRotation += 90
updateCube()

}

function rotateY(){

yRotation += 90
updateCube()

}

function rotateZ(){

zRotation += 90
updateCube()

}

/* RESET */

function resetCube(){

xRotation = -30
yRotation = 30
zRotation = 0

updateCube()

}

/* SHUFFLE */

function shuffleCube(){

let moves = 10

for(let i=0;i<moves;i++){

let random = Math.floor(Math.random()*3)

if(random === 0){

xRotation += 90

}

else if(random === 1){

yRotation += 90

}

else{

zRotation += 90

}

}

updateCube()

}

/* KEYBOARD CONTROLS */

document.addEventListener("keydown",function(e){

if(e.key === "ArrowUp"){

xRotation -= 15

}

if(e.key === "ArrowDown"){

xRotation += 15

}

if(e.key === "ArrowLeft"){

yRotation -= 15

}

if(e.key === "ArrowRight"){

yRotation += 15

}

updateCube()

})

/* AUTO SPIN MODE */

let autoSpin = false
let spinInterval

function toggleSpin(){

if(!autoSpin){

spinInterval = setInterval(()=>{

yRotation += 2
updateCube()

},30)

autoSpin = true

}else{

clearInterval(spinInterval)
autoSpin = false

}

}

/* MOUSE DRAG */

let isDragging = false
let lastX
let lastY

document.addEventListener("mousedown",e=>{

isDragging = true
lastX = e.clientX
lastY = e.clientY

})

document.addEventListener("mouseup",()=>{

isDragging = false

})

document.addEventListener("mousemove",e=>{

if(!isDragging) return

let dx = e.clientX - lastX
let dy = e.clientY - lastY

yRotation += dx * 0.5
xRotation -= dy * 0.5

updateCube()

lastX = e.clientX
lastY = e.clientY

})

/* INIT */

updateCube()