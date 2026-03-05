import { ctx } from "../game.js"

let buildings = []

const buildingCount = 30
const spacing = 160

// create buildings
for(let i=0;i<buildingCount;i++){

buildings.push({
x:i * spacing,
width:80 + Math.random()*60,
height:150 + Math.random()*250
})

}

let cityScroll = 0

export function drawCity(){

const canvasWidth = window.innerWidth
const canvasHeight = window.innerHeight

// background sky
const sky = ctx.createLinearGradient(0,0,0,canvasHeight)

sky.addColorStop(0,"#020024")
sky.addColorStop(1,"#000000")

ctx.fillStyle = sky
ctx.fillRect(0,0,canvasWidth,canvasHeight)


// move city slowly for parallax
cityScroll += 0.4


for(let b of buildings){

let x = b.x - cityScroll

// reset building when off screen
if(x < -200){
b.x += buildingCount * spacing
x = b.x - cityScroll
}


// building body
ctx.fillStyle = "#0a0a0a"

ctx.fillRect(
x,
canvasHeight - b.height,
b.width,
b.height
)


// windows
for(let y=0; y<b.height; y+=30){

if(Math.random() > 0.5){

ctx.fillStyle = "#00ffff"

ctx.shadowBlur = 10
ctx.shadowColor = "#00ffff"

ctx.fillRect(
x + 15,
canvasHeight - b.height + y,
8,
12
)

}

}

ctx.shadowBlur = 0

}

}