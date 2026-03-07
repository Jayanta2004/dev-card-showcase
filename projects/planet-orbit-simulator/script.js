const canvas = document.getElementById("space")
const ctx = canvas.getContext("2d")

const speedSlider = document.getElementById("speed")
const pauseBtn = document.getElementById("pause")
const restartBtn = document.getElementById("restart")

let running = true

const center = {x:300,y:200}

const planets = [
{radius:60,size:6,angle:0,speed:0.02,color:"blue"},
{radius:100,size:8,angle:0,speed:0.015,color:"green"},
{radius:140,size:10,angle:0,speed:0.01,color:"orange"}
]

function draw(){

ctx.fillStyle="rgba(255,255,255,0.2)"
ctx.fillRect(0,0,600,400)

ctx.fillStyle="gold"
ctx.beginPath()
ctx.arc(center.x,center.y,12,0,Math.PI*2)
ctx.fill()

planets.forEach(p=>{

const speed = p.speed * speedSlider.value

if(running){
p.angle += speed
}

const x = center.x + Math.cos(p.angle)*p.radius
const y = center.y + Math.sin(p.angle)*p.radius

ctx.fillStyle=p.color
ctx.beginPath()
ctx.arc(x,y,p.size,0,Math.PI*2)
ctx.fill()

})

}

function loop(){

draw()
requestAnimationFrame(loop)

}

pauseBtn.onclick=()=>{

running=!running
pauseBtn.textContent = running ? "Pause" : "Resume"

}

restartBtn.onclick=()=>{

planets.forEach(p=>p.angle=0)

}

loop()