import { ctx, gameSpeed } from "../game.js"
import { lanes } from "./player.js"

export const coins = []

let timer = 0


export function spawnCoin(){

timer++

if(timer > 110){

const lane = Math.floor(Math.random()*3)

coins.push({
x: lanes[lane],
y: -120,
size:22,
rotation:0
})

timer = 0

}

}



export function updateCoins(){

for(let c of coins){

c.y += gameSpeed

c.rotation += 0.08

}


// remove coins off screen
for(let i = coins.length - 1; i >= 0; i--){

if(coins[i].y > window.innerHeight + 100){
coins.splice(i,1)
}

}

}



export function drawCoins(){

for(let c of coins){

ctx.save()

ctx.translate(c.x,c.y)

ctx.rotate(c.rotation)


// glow
ctx.shadowBlur = 15
ctx.shadowColor = "#ffd700"


// gold gradient
const gradient = ctx.createRadialGradient(
0,0,5,
0,0,c.size
)

gradient.addColorStop(0,"#fff4a3")
gradient.addColorStop(1,"#ffb700")

ctx.fillStyle = gradient


// coin
ctx.beginPath()

ctx.arc(0,0,c.size,0,Math.PI*2)

ctx.fill()


// center mark
ctx.fillStyle="#ffaa00"

ctx.beginPath()

ctx.arc(0,0,c.size/2,0,Math.PI*2)

ctx.fill()

ctx.restore()

}

ctx.shadowBlur = 0

}