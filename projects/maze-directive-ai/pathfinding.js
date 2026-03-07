import { maze, rows, cols } from "./maze.js"

export let currentPath = []

function heuristic(a,b){
return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)
}

export function findPath(start,end){

const open=[]
const closed=[]

open.push({
x:start.x,
y:start.y,
g:0,
h:heuristic(start,end),
parent:null
})

while(open.length>0){

open.sort((a,b)=>(a.g+a.h)-(b.g+b.h))

const current=open.shift()

if(current.x===end.x && current.y===end.y){

const path=[]
let temp=current

while(temp){
path.push({x:temp.x,y:temp.y})
temp=temp.parent
}

currentPath = path.reverse()

return currentPath
}

closed.push(current)

const neighbors=[
{x:current.x+1,y:current.y},
{x:current.x-1,y:current.y},
{x:current.x,y:current.y+1},
{x:current.x,y:current.y-1}
]

for(let n of neighbors){

if(n.x<0 || n.y<0 || n.x>=cols || n.y>=rows) continue
if(maze[n.y][n.x]===1) continue
if(closed.find(c=>c.x===n.x && c.y===n.y)) continue

const g=current.g+1
const h=heuristic(n,end)

let existing=open.find(o=>o.x===n.x && o.y===n.y)

if(!existing){

open.push({
x:n.x,
y:n.y,
g,
h,
parent:current
})

}

}

}

currentPath = []
return []
}