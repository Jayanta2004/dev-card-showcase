const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const modeSelect = document.getElementById("mode");
const algoSelect = document.getElementById("algorithm");
const speedSlider = document.getElementById("speed");
const sizeSlider = document.getElementById("size");
const generateBtn = document.getElementById("generate");
const startBtn = document.getElementById("start");

let array = [];
let speed = 50;
let running = false;

/* =============================
   Utility
============================= */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* =============================
   Sorting Section
============================= */

function generateArray(size) {
    array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * canvas.height));
    }
    drawArray();
}

function drawArray(highlight = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let barWidth = canvas.width / array.length;

    for (let i = 0; i < array.length; i++) {
        ctx.fillStyle = highlight.includes(i) ? "#ff7b72" : "#58a6ff";
        ctx.fillRect(i * barWidth, canvas.height - array[i], barWidth - 2, array[i]);
    }
}

async function bubbleSort() {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            if (!running) return;

            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
            }

            drawArray([j, j + 1]);
            await sleep(210 - speed);
        }
    }
}

async function quickSort(start = 0, end = array.length - 1) {
    if (start >= end || !running) return;

    let pivotIndex = await partition(start, end);
    await quickSort(start, pivotIndex - 1);
    await quickSort(pivotIndex + 1, end);
}

async function partition(start, end) {
    let pivot = array[end];
    let i = start;

    for (let j = start; j < end; j++) {
        if (!running) return;

        if (array[j] < pivot) {
            [array[i], array[j]] = [array[j], array[i]];
            i++;
        }
        drawArray([j, end]);
        await sleep(210 - speed);
    }

    [array[i], array[end]] = [array[end], array[i]];
    return i;
}

/* =============================
   Pathfinding Section (Dijkstra Grid)
============================= */

let grid = [];
let rows = 20;
let cols = 40;
let cellSize = 20;

function generateGrid() {
    grid = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            row.push({ r, c, visited: false, distance: Infinity });
        }
        grid.push(row);
    }
    drawGrid();
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            ctx.strokeStyle = "#30363d";
            ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
    }
}

async function dijkstra() {
    let start = grid[0][0];
    start.distance = 0;

    let queue = [start];

    while (queue.length && running) {
        queue.sort((a, b) => a.distance - b.distance);
        let current = queue.shift();

        if (current.visited) continue;
        current.visited = true;

        ctx.fillStyle = "#58a6ff";
        ctx.fillRect(current.c * cellSize, current.r * cellSize, cellSize, cellSize);

        await sleep(210 - speed);

        let neighbors = getNeighbors(current);

        for (let neighbor of neighbors) {
            if (!neighbor.visited) {
                neighbor.distance = current.distance + 1;
                queue.push(neighbor);
            }
        }
    }
}

function getNeighbors(node) {
    let dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    let neighbors = [];

    for (let [dr, dc] of dirs) {
        let nr = node.r + dr;
        let nc = node.c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            neighbors.push(grid[nr][nc]);
        }
    }
    return neighbors;
}

/* =============================
   Controls
============================= */

generateBtn.onclick = () => {
    running = false;
    if (modeSelect.value === "sort") {
        generateArray(sizeSlider.value);
    } else {
        generateGrid();
    }
};

startBtn.onclick = async () => {
    running = true;
    speed = speedSlider.value;

    if (modeSelect.value === "sort") {
        if (algoSelect.value === "bubble") {
            await bubbleSort();
        } else {
            await quickSort();
        }
    } else {
        await dijkstra();
    }

    running = false;
};

modeSelect.onchange = () => {
    generateBtn.click();
};

/* Initialize */
generateArray(sizeSlider.value);
