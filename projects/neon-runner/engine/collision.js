import { player } from "../entities/player.js"
import { obstacles } from "../entities/obstacle.js"
import { coins } from "../entities/coin.js"

let gameOver = false

export function detectCollision(){

if(gameOver) return

for(let o of obstacles){

const playerLeft = player.x - player.width/2
const playerRight = player.x + player.width/2
const playerTop = player.y
const playerBottom = player.y + player.height

const obstacleLeft = o.x - o.width/2
const obstacleRight = o.x + o.width/2
const obstacleTop = o.y
const obstacleBottom = o.y + o.height

if(
playerRight > obstacleLeft &&
playerLeft < obstacleRight &&
playerBottom > obstacleTop &&
playerTop < obstacleBottom
){

gameOver = true

document.getElementById("gameOver").style.display = "block"

return

}

}

}


export function detectCoinPickup(){

for(let i = coins.length-1; i>=0; i--){

const c = coins[i]

if(
Math.abs(player.x - c.x) < 40 &&
Math.abs(player.y - c.y) < 60
){

coins.splice(i,1)

// refill nitro
player.nitro = Math.min(100, player.nitro + 10)

}

}

}