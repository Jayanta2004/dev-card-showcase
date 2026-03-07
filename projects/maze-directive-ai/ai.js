import { ctx } from "./game.js"
import { player } from "./player.js"
import { cellSize } from "./maze.js"
import { findPath, currentPath } from "./pathfinding.js"

export const ai={
x:18,
y:18
}

let timer=0

export function updateAI(){

timer++

if(timer%15===0){

const path=findPath(
{x:ai.x,y:ai.y},
{x:player.x,y:player.y}
)

if(path.length>1){

ai.x=path[1].x
ai.y=path[1].y

}

}

}

export function drawAI(){

ctx.fillStyle="red"

ctx.fillRect(
ai.x*cellSize,
ai.y*cellSize,
cellSize,
cellSize
)

// draw path visualization
ctx.fillStyle="lime"

for(let node of currentPath){

ctx.fillRect(
node.x*cellSize+8,
node.y*cellSize+8,
cellSize-16,
cellSize-16
)

}

}