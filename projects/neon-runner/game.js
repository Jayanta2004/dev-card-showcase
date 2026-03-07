import { drawRoad, updateRoad } from "./effects/neonRoad.js"
import { drawCity } from "./effects/cityBackground.js"
import { drawParticles, updateParticles } from "./effects/particles.js"

import { player, drawPlayer, updatePlayer } from "./entities/player.js"
import { spawnObstacle, drawObstacles, updateObstacles } from "./entities/obstacle.js"
import { spawnCoin, drawCoins, updateCoins } from "./entities/coin.js"

import { detectCollision, detectCoinPickup } from "./engine/collision.js"

const canvas = document.getElementById("gameCanvas")
export const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// HUD
const scoreDisplay = document.getElementById("score")
const speedDisplay = document.getElementById("speed")
const nitroDisplay = document.getElementById("nitro")

const gameOverUI = document.getElementById("gameOver")

export let gameSpeed = 6

let score = 0
let running = true

// Resize support
window.addEventListener("resize", () => {

canvas.width = window.innerWidth
canvas.height = window.innerHeight

})

function update(){

updateRoad()

updatePlayer()

spawnObstacle()
updateObstacles()

spawnCoin()
updateCoins()

updateParticles()

detectCollision()
detectCoinPickup()

score += 0.1

}

function render(){

ctx.clearRect(0,0,canvas.width,canvas.height)

drawCity()

drawRoad()

drawCoins()

drawObstacles()

drawPlayer()

drawParticles()

}

function updateHUD(){

scoreDisplay.innerText = Math.floor(score)

speedDisplay.innerText = gameSpeed

nitroDisplay.innerText = player.nitro

}

function gameLoop(){

if(!running) return

update()

render()

updateHUD()

requestAnimationFrame(gameLoop)

}

gameLoop()