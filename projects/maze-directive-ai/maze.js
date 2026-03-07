import { ctx } from "./game.js"

export const cellSize = 30
export const rows = 20
export const cols = 20

export const maze = []

for(let y=0;y<rows;y++){

maze[y] = []

for(let x=0;x<cols;x++){

maze[y][x] = Math.random() < 0.2 ? 1 : 0

}

}

export function drawMaze(){

for(let y=0;y<rows;y++){
for(let x=0;x<cols;x++){

if(maze[y][x] === 1){

ctx.fillStyle="#444"
ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize)

}

}

}

}