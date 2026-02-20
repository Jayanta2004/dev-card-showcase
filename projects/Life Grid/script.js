/**
 * Life-Grid: Conway's Game of Life Implementation
 * * Technical Implementation Details:
 * - Uses a 1D array to represent the 2D grid for memory efficiency.
 * - Implements 'Double Buffering' logic (currentGrid vs nextGrid).
 * - Canvas optimized rendering (only redraws changing states in optimized mode, 
 * but full redraw used here for simplicity and grid line support).
 */

// --- Constants & Config ---
const CONFIG = {
    cellSize: 15,    // Size of each cell in pixels
    gridColor: '#21262d',
    aliveColor: '#3fb950',
    deadColor: '#0d1117',
    fps: 60
};

// --- DOM Elements ---
const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Optimization
const btnStart = document.getElementById('btn-start');
const btnStep = document.getElementById('btn-step');
const btnClear = document.getElementById('btn-clear');
const btnRandom = document.getElementById('btn-random');
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
const presetSelect = document.getElementById('preset-select');
const genDisplay = document.getElementById('gen-count');
const popDisplay = document.getElementById('pop-count');

// --- State Variables ---
let cols, rows;
let grid = [];
let nextGrid = []; // Buffer
let isRunning = false;
let generation = 0;
let animationId = null;
let lastFrameTime = 0;
let simulationInterval = 100; // ms between generations

// --- Preset Patterns Library ---
// Patterns are defined as [x, y] offsets from a center point
const PATTERNS = {
    block: [[0,0], [1,0], [0,1], [1,1]],
    beehive: [[1,0], [2,0], [0,1], [3,1], [1,2], [2,2]],
    blinker: [[0,-1], [0,0], [0,1]],
    toad: [[1,0], [2,0], [3,0], [0,1], [1,1], [2,1]],
    beacon: [[0,0], [1,0], [0,1], [3,3], [2,3], [3,2]],
    pulsar: [ 
        // Top
        [-2,-6],[-3,-6],[-4,-6], [2,-6],[3,-6],[4,-6],
        [-1,-4],[-1,-3],[-1,-2], [1,-4],[1,-3],[1,-2], [-6,-4],[-6,-3],[-6,-2], [6,-4],[6,-3],[6,-2],
        [-2,-1],[-3,-1],[-4,-1], [2,-1],[3,-1],[4,-1],
        // Bottom Mirror
        [-2,6],[-3,6],[-4,6], [2,6],[3,6],[4,6],
        [-1,4],[-1,3],[-1,2], [1,4],[1,3],[1,2], [-6,4],[-6,3],[-6,2], [6,4],[6,3],[6,2],
        [-2,1],[-3,1],[-4,1], [2,1],[3,1],[4,1]
    ],
    penta: [[0,-4],[0,-3],[0,-1],[0,0],[0,1],[0,3],[0,4],[0,5], [0,-5],[0,-4],[0,-3],[0,-1],[0,0],[0,1],[0,3],[0,4],[0,5]], // Needs slight adjustment usually
    glider: [[0,-1], [1,0], [-1,1], [0,1], [1,1]],
    lwss: [[1,-1], [2,-1], [3,-1], [4,-1], [0,0], [4,0], [4,1], [0,2], [3,2]],
    diehard: [[-3,0], [-2,0], [-2,1], [2,1], [3,1], [4,1], [3,-1]],
    acorn: [[-3,1], [-2,1], [-2,-1], [0,0], [1,1], [2,1], [3,1]],
    gosper: [
        [-17,-4],[-16,-4],[-17,-3],[-16,-3],
        [-7,-4],[-7,-3],[-7,-2],
        [-6,-5],[-6,-1],
        [-5,-6],[-5,0],
        [-4,-6],[-4,0],
        [-3,-5],[-3,-1],
        [-2,-4],[-2,-3],[-2,-2],
        [-1,-3],
        [3,-6],[3,-5],[3,-4],
        [4,-6],[4,-5],[4,-4],
        [5,-7],[5,-3],
        [7,-8],[7,-7],[7,-3],[7,-2],
        [17,-6],[18,-6],[17,-5],[18,-5]
    ]
};

// --- Initialization ---

function init() {
    setupCanvas();
    resetGrid();
    setupEventListeners();
    draw();
}

function setupCanvas() {
    // Calculate fit for container
    const wrapper = document.querySelector('.canvas-wrapper');
    const width = wrapper.clientWidth || 800;
    const height = wrapper.clientHeight || 600;

    // Snap to grid size
    cols = Math.floor(width / CONFIG.cellSize);
    rows = Math.floor(height / CONFIG.cellSize);

    canvas.width = cols * CONFIG.cellSize;
    canvas.height = rows * CONFIG.cellSize;
}

function resetGrid() {
    // Initialize empty grid (0 = dead, 1 = alive)
    grid = new Array(cols * rows).fill(0);
    nextGrid = new Array(cols * rows).fill(0);
    generation = 0;
    updateStats();
}

function setupEventListeners() {
    // Canvas Interaction (Draw)
    let isDrawing = false;
    let drawMode = 1; // 1 for adding, 0 for removing

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        document.getElementById('overlay-msg').classList.add('hidden');
        
        const {x, y} = getGridCoords(e);
        const idx = getIndex(x, y);
        drawMode = grid[idx] ? 0 : 1; // Toggle based on first click
        grid[idx] = drawMode;
        draw();
        updateStats();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const {x, y} = getGridCoords(e);
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            grid[getIndex(x, y)] = drawMode;
            draw();
        }
    });

    window.addEventListener('mouseup', () => isDrawing = false);

    // Controls
    btnStart.addEventListener('click', toggleSimulation);
    btnStep.addEventListener('click', () => {
        if (isRunning) toggleSimulation();
        computeNextGen();
        draw();
    });
    
    btnClear.addEventListener('click', () => {
        if (isRunning) toggleSimulation();
        resetGrid();
        draw();
    });

    btnRandom.addEventListener('click', () => {
        grid = grid.map(() => Math.random() > 0.85 ? 1 : 0);
        generation = 0;
        draw();
        updateStats();
    });

    // Speed Slider
    speedSlider.addEventListener('input', (e) => {
        // Invert value: Slider high = Interval low (Faster)
        const val = parseInt(e.target.value);
        simulationInterval = 1010 - val; // Map 10-1000 to 1000-10ms
        
        let label = "Normal";
        if (simulationInterval < 100) label = "Ultra";
        else if (simulationInterval < 300) label = "Fast";
        else if (simulationInterval > 800) label = "Slow";
        speedVal.innerText = label;
    });

    // Preset Loader
    presetSelect.addEventListener('change', (e) => {
        loadPreset(e.target.value);
        e.target.value = ""; // Reset select
    });
}

// --- Core Logic ---

function toggleSimulation() {
    isRunning = !isRunning;
    
    const icon = btnStart.querySelector('i');
    const text = btnStart.lastChild;
    
    if (isRunning) {
        icon.className = 'fas fa-pause';
        text.textContent = ' Pause';
        btnStart.classList.replace('primary', 'warning');
        runLoop();
    } else {
        icon.className = 'fas fa-play';
        text.textContent = ' Start';
        btnStart.classList.replace('warning', 'primary');
        cancelAnimationFrame(animationId);
    }
}

function runLoop(timestamp) {
    if (!isRunning) return;

    if (timestamp - lastFrameTime > simulationInterval) {
        computeNextGen();
        draw();
        lastFrameTime = timestamp;
    }

    animationId = requestAnimationFrame(runLoop);
}

function computeNextGen() {
    for (let i = 0; i < grid.length; i++) {
        const x = i % cols;
        const y = Math.floor(i / cols);
        
        const neighbors = countNeighbors(x, y);
        const state = grid[i];

        // Rules of Life
        if (state === 1 && (neighbors < 2 || neighbors > 3)) {
            nextGrid[i] = 0; // Die (Under/Over population)
        } else if (state === 0 && neighbors === 3) {
            nextGrid[i] = 1; // Reproduce
        } else {
            nextGrid[i] = state; // Stasis
        }
    }

    // Swap Grids
    let temp = grid;
    grid = nextGrid;
    nextGrid = temp; // Reuse array to avoid GC

    generation++;
    updateStats();
}

function countNeighbors(x, y) {
    let sum = 0;
    // Check 8 neighbors
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i === 0 && j === 0) continue; // Self
            
            // Wrapping logic (Toroidal grid)
            const col = (x + i + cols) % cols;
            const row = (y + j + rows) % rows;
            
            sum += grid[row * cols + col];
        }
    }
    return sum;
}

// --- Rendering ---

function draw() {
    // Clear background
    ctx.fillStyle = CONFIG.deadColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Live Cells
    ctx.fillStyle = CONFIG.aliveColor;
    ctx.beginPath();
    
    for (let i = 0; i < grid.length; i++) {
        if (grid[i] === 1) {
            const x = (i % cols) * CONFIG.cellSize;
            const y = Math.floor(i / cols) * CONFIG.cellSize;
            // Draw slightly smaller than cell size for grid effect
            ctx.rect(x + 1, y + 1, CONFIG.cellSize - 2, CONFIG.cellSize - 2);
        }
    }
    ctx.fill();

    // Optional: Draw Grid Lines (Disabled for performance at high scale, but enabled via spacing above)
}

function loadPreset(key) {
    if (!isRunning) resetGrid(); // Keep generation count if already running? Usually better to reset
    
    const pattern = PATTERNS[key];
    if (!pattern) return;

    const centerX = Math.floor(cols / 2);
    const centerY = Math.floor(rows / 2);

    pattern.forEach(([dx, dy]) => {
        const idx = getIndex(centerX + dx, centerY + dy);
        if (idx >= 0 && idx < grid.length) {
            grid[idx] = 1;
        }
    });

    draw();
    updateStats();
}

// --- Helpers ---

function getIndex(x, y) {
    return y * cols + x;
}

function getGridCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CONFIG.cellSize);
    const y = Math.floor((e.clientY - rect.top) / CONFIG.cellSize);
    return {x, y};
}

function updateStats() {
    genDisplay.innerText = generation;
    // Count population (reduce is slightly slower but clean)
    let pop = 0;
    for(let i=0; i<grid.length; i++) if(grid[i]) pop++;
    popDisplay.innerText = pop;
}

// Start
init();