import { ctx } from "./game.js"
import { cellSize } from "./maze.js"

export const player = {
x:1,
y:1
}

const keys={}

document.addEventListener("keydown",e=>{
keys[e.key]=true
})

document.addEventListener("keyup",e=>{
keys[e.key]=false
})

export function movePlayer(){

if(keys["ArrowUp"]) player.y--
if(keys["ArrowDown"]) player.y++
if(keys["ArrowLeft"]) player.x--
if(keys["ArrowRight"]) player.x++

}

export function drawPlayer(){

ctx.fillStyle="cyan"

ctx.fillRect(
player.x*cellSize,
player.y*cellSize,
cellSize,
cellSize
)

}