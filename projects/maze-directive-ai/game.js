import { drawMaze, maze } from "./maze.js"
import { player, movePlayer, drawPlayer } from "./player.js"
import { ai, updateAI, drawAI } from "./ai.js"

const canvas = document.getElementById("gameCanvas")
export const ctx = canvas.getContext("2d")

canvas.width = 600
canvas.height = 600

function gameLoop(){

ctx.clearRect(0,0,canvas.width,canvas.height)

drawMaze()

movePlayer()
drawPlayer()

updateAI()
drawAI()

requestAnimationFrame(gameLoop)

}

gameLoop()