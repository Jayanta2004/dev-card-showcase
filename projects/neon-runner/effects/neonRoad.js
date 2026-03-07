import { ctx } from "../game.js"

let roadScroll = 0

export function updateRoad(){
roadScroll += 10
}

export function drawRoad(){

const center = window.innerWidth / 2

const roadTopWidth = 180
const roadBottomWidth = 750
const horizon = 130

// SKY GRADIENT
const sky = ctx.createLinearGradient(0,0,0,window.innerHeight)
sky.addColorStop(0,"#020024")
sky.addColorStop(0.4,"#000010")
sky.addColorStop(1,"#000000")

ctx.fillStyle = sky
ctx.fillRect(0,0,window.innerWidth,window.innerHeight)


// ROAD SHAPE (Perspective)

ctx.beginPath()

ctx.moveTo(center-roadTopWidth/2,horizon)

ctx.lineTo(center+roadTopWidth/2,horizon)

ctx.lineTo(center+roadBottomWidth/2,window.innerHeight)

ctx.lineTo(center-roadBottomWidth/2,window.innerHeight)

ctx.closePath()

ctx.fillStyle="#111"
ctx.fill()


// NEON ROAD BORDERS

ctx.strokeStyle="#00ffff"
ctx.lineWidth=6

ctx.shadowBlur=25
ctx.shadowColor="#00ffff"

ctx.beginPath()
ctx.moveTo(center-roadTopWidth/2,horizon)
ctx.lineTo(center-roadBottomWidth/2,window.innerHeight)
ctx.stroke()

ctx.beginPath()
ctx.moveTo(center+roadTopWidth/2,horizon)
ctx.lineTo(center+roadBottomWidth/2,window.innerHeight)
ctx.stroke()

ctx.shadowBlur=0



// LANE DASHES WITH PERSPECTIVE

for(let i=0;i<35;i++){

const y = ((i*80)+roadScroll) % window.innerHeight

const scale = y / window.innerHeight

const width = 6 + scale * 10
const height = 20 + scale * 30

ctx.fillStyle="#ff00ff"

ctx.shadowBlur=10
ctx.shadowColor="#ff00ff"

ctx.fillRect(
center - width/2,
y,
width,
height
)

}

ctx.shadowBlur = 0

}