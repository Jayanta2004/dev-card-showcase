import { bubbleSort } from "./algorithms/bubble.js";
import { mergeSort } from "./algorithms/merge.js";
import { quickSort } from "./algorithms/quick.js";

import { bfsPath } from "./algorithms/bfs.js";
import { dfsPath } from "./algorithms/dfs.js";
import { dijkstraPath } from "./algorithms/dijkstra.js";



/* DOM Elements */
const sortContainer = document.getElementById("sortContainer");
const gridContainer = document.getElementById("gridContainer");
const randomizeBtn = document.getElementById("randomize");
const startSortBtn = document.getElementById("startSort");
const startPathBtn = document.getElementById("startPath");
const speedSlider = document.getElementById("speedSlider");
const sizeSlider = document.getElementById("sizeSlider");

let array = [];
let speed = 50;
let arraySize = 50;
let grid = [];
let rows = 20;
let cols = 20;

/* ---------- Utilities ---------- */
function sleep(ms){ return new Promise(resolve=>setTimeout(resolve, ms)); }
function getSpeed(){ return 101 - speedSlider.value; }

/* ---------- Sorting Visualizer ---------- */
function generateArray(){
arraySize = sizeSlider.value;
array = Array.from({length:arraySize}, ()=>Math.floor(Math.random()*400)+10);
renderArray();
}

function renderArray(){
sortContainer.innerHTML="";
array.forEach(value=>{
const bar = document.createElement("div");
bar.className="bar";
bar.style.height = `${value}px`;
bar.style.width = `${Math.floor(800/array.length)}px`;
sortContainer.appendChild(bar);
});
}

async function startSort(){
const algorithm = bubbleSort; // can allow selection later
await algorithm(array, sortContainer, getSpeed());
}

/* ---------- Pathfinding Visualizer ---------- */
function generateGrid(){
gridContainer.innerHTML="";
grid = [];
for(let r=0;r<rows;r++){
let row=[];
for(let c=0;c<cols;c++){
const cell = document.createElement("div");
cell.className="grid-cell";
gridContainer.appendChild(cell);
row.push({cell, r, c, wall:false});
}
grid.push(row);
}
// Set start & end
grid[0][0].cell.classList.add("grid-start");
grid[rows-1][cols-1].cell.classList.add("grid-end");
}

async function startPath(){
await bfsPath(grid, getSpeed()); // can allow selection later
}

/* ---------- Event Listeners ---------- */
randomizeBtn.onclick=generateArray;
startSortBtn.onclick=startSort;
startPathBtn.onclick=startPath;
speedSlider.oninput=()=>{ speed = speedSlider.value; }
sizeSlider.oninput=generateArray;

/* ---------- Init ---------- */
generateArray();
generateGrid();
