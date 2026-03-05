import { ctx } from "../game.js"

// lane positions
export const lanes = [
window.innerWidth/2 - 220,
window.innerWidth/2,
window.innerWidth/2 + 220
]

// player object
export const player = {
lane:1,
x:lanes[1],
y:window.innerHeight - 190,
width:70,
height:120,
nitro:100,
tilt:0
}


// keyboard controls
document.addEventListener("keydown", e => {

if(e.key === "ArrowLeft"){
player.lane = Math.max(0, player.lane - 1)
}

if(e.key === "ArrowRight"){
player.lane = Math.min(2, player.lane + 1)
}

})


// smooth lane switching
export function updatePlayer(){

const targetX = lanes[player.lane]

const diff = targetX - player.x

player.x += diff * 0.18

// tilt effect when switching lanes
player.tilt = diff * 0.002

}


// draw player car
export function drawPlayer(){

ctx.save()

ctx.translate(player.x, player.y)

ctx.rotate(player.tilt)

ctx.shadowBlur = 30
ctx.shadowColor = "#00ffff"


// car body
ctx.fillStyle = "#00ffff"

ctx.beginPath()
ctx.moveTo(-30,0)
ctx.lineTo(30,0)
ctx.lineTo(45,110)
ctx.lineTo(-45,110)
ctx.closePath()

ctx.fill()


// windshield
ctx.fillStyle = "#002f44"
ctx.fillRect(-18,20,36,35)


// headlights
ctx.fillStyle = "#ffff00"

ctx.fillRect(-28,0,10,10)
ctx.fillRect(18,0,10,10)


// engine glow
ctx.shadowBlur = 25
ctx.shadowColor = "#ff00ff"

ctx.fillStyle = "#ff00ff"

ctx.fillRect(-15,110,30,8)


ctx.restore()

}