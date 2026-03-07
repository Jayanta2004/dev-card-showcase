import { ctx, gameSpeed } from "../game.js"
import { lanes } from "./player.js"

export const obstacles = []

let spawnTimer = 0


export function spawnObstacle(){

spawnTimer++

if(spawnTimer > 70){

const lane = Math.floor(Math.random()*3)

obstacles.push({

x: lanes[lane],
y: -220,

width: 70,
height: 120

})

spawnTimer = 0

}

}



export function updateObstacles(){

for(let o of obstacles){

o.y += gameSpeed

}

// remove cars that go off screen
for(let i = obstacles.length - 1; i >= 0; i--){

if(obstacles[i].y > window.innerHeight + 200){
obstacles.splice(i,1)
}

}

}



export function drawObstacles(){

for(let o of obstacles){

ctx.save()

ctx.translate(o.x, o.y)


// car body
ctx.fillStyle = "#ff0033"

ctx.shadowBlur = 20
ctx.shadowColor = "#ff0033"

ctx.beginPath()

ctx.moveTo(-30,0)
ctx.lineTo(30,0)
ctx.lineTo(40,110)
ctx.lineTo(-40,110)

ctx.closePath()

ctx.fill()


// windshield
ctx.fillStyle = "#330000"

ctx.fillRect(-18,20,36,35)


// tail lights
ctx.fillStyle = "#ff6600"

ctx.fillRect(-28,100,12,8)
ctx.fillRect(16,100,12,8)


ctx.restore()

}

ctx.shadowBlur = 0

}