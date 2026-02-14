/**
 * Ant-Colony-Sim Engine
 * Simulates emergence using simple agents and pheromone grids.
 */

const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const ANT_COUNT = 200;
const GRID_SCALE = 4; // 1 grid cell = 4x4 pixels
const SENSOR_ANGLE = Math.PI / 4;
const SENSOR_DIST = 10;
const TURN_SPEED = 0.5;
const DECAY_RATE = 0.98;

// --- State ---
let width, height;
let cols, rows;
let ants = [];
let foodScore = 0;
let drawMode = 'wall'; // wall, food, erase
let isMouseDown = false;
let mousePos = { x: 0, y: 0 };

// Grids
// 0: Empty, 1: Wall, 2: Home, 3: Food
let worldGrid = []; 
// Float value: Pheromone intensity
let homePheromones = []; 
let foodPheromones = []; 

// Entities
let nest = { x: 0, y: 0, r: 15 };

// --- Classes ---

class Ant {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = nest.x;
        this.y = nest.y;
        this.angle = Math.random() * Math.PI * 2;
        this.hasFood = false;
    }

    update() {
        // 1. Drop Pheromone
        const c = Math.floor(this.x / GRID_SCALE);
        const r = Math.floor(this.y / GRID_SCALE);
        
        if (c >= 0 && c < cols && r >= 0 && r < rows) {
            if (this.hasFood) {
                // Dropping "Food Trail" (Red) -> Attracts ants looking for food? 
                // No, "Food Trail" means "I found food, follow this back to food"
                // Actually: carrying food -> drop "Food Pheromone" (Red)
                // Looking for food -> drop "Home Pheromone" (Blue)
                foodPheromones[c][r] = Math.min(foodPheromones[c][r] + 50, 255);
                
                // Check if home
                const dist = Math.hypot(this.x - nest.x, this.y - nest.y);
                if (dist < nest.r) {
                    this.hasFood = false;
                    this.angle += Math.PI; // Turn around
                    foodScore++;
                    document.getElementById('food-score').innerText = foodScore;
                }
            } else {
                homePheromones[c][r] = Math.min(homePheromones[c][r] + 50, 255);
                
                // Check if food found
                if (worldGrid[c][r] === 3) { // 3 is food
                    this.hasFood = true;
                    this.angle += Math.PI;
                    // Consume food (optional logic: decrease food source)
                }
            }
        }

        // 2. Sense & Steer
        this.steer();

        // 3. Move
        // Random wiggle
        this.angle += (Math.random() - 0.5) * 0.2;
        
        const nextX = this.x + Math.cos(this.angle);
        const nextY = this.y + Math.sin(this.angle);

        // Wall Collision
        const nextC = Math.floor(nextX / GRID_SCALE);
        const nextR = Math.floor(nextY / GRID_SCALE);

        if (nextC >= 0 && nextC < cols && nextR >= 0 && nextR < rows) {
            if (worldGrid[nextC][nextR] === 1) { // Wall
                this.angle += Math.PI + (Math.random() - 0.5); // Bounce
            } else {
                this.x = nextX;
                this.y = nextY;
            }
        } else {
            // Boundary bounce
            this.angle += Math.PI;
            this.x = Math.max(0, Math.min(width, this.x));
            this.y = Math.max(0, Math.min(height, this.y));
        }
    }

    steer() {
        // If has food, look for Home Pheromones. If no food, look for Food Pheromones.
        const gridToSense = this.hasFood ? homePheromones : foodPheromones;

        const sense = (angleOffset) => {
            const angle = this.angle + angleOffset;
            const sx = this.x + Math.cos(angle) * SENSOR_DIST;
            const sy = this.y + Math.sin(angle) * SENSOR_DIST;
            const c = Math.floor(sx / GRID_SCALE);
            const r = Math.floor(sy / GRID_SCALE);
            
            if (c >= 0 && c < cols && r >= 0 && r < rows) {
                return gridToSense[c][r];
            }
            return 0;
        };

        const left = sense(-SENSOR_ANGLE);
        const center = sense(0);
        const right = sense(SENSOR_ANGLE);

        if (center > left && center > right) {
            // Straight is good
        } else if (center < left && center < right) {
            this.angle += (Math.random() - 0.5) * 2 * TURN_SPEED;
        } else if (left > right) {
            this.angle -= TURN_SPEED;
        } else if (right > left) {
            this.angle += TURN_SPEED;
        }
    }
}

// --- Init & Grid ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupEvents();
    
    // Set Nest Center
    nest.x = width / 2;
    nest.y = height / 2;

    initGrid();
    initAnts();
    
    requestAnimationFrame(loop);
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    cols = Math.ceil(width / GRID_SCALE);
    rows = Math.ceil(height / GRID_SCALE);
}

function initGrid() {
    worldGrid = [];
    homePheromones = [];
    foodPheromones = [];
    
    for (let c = 0; c < cols; c++) {
        worldGrid[c] = new Uint8Array(rows).fill(0);
        homePheromones[c] = new Float32Array(rows).fill(0);
        foodPheromones[c] = new Float32Array(rows).fill(0);
    }
}

function initAnts() {
    ants = [];
    for (let i = 0; i < ANT_COUNT; i++) {
        ants.push(new Ant());
    }
    document.getElementById('ant-count').innerText = ANT_COUNT;
}

// --- Interaction ---

function setupEvents() {
    canvas.addEventListener('mousedown', e => { isMouseDown = true; updateMouse(e); });
    canvas.addEventListener('mousemove', e => { updateMouse(e); if(isMouseDown) applyBrush(); });
    window.addEventListener('mouseup', () => isMouseDown = false);
    
    document.getElementById('btn-reset').addEventListener('click', () => {
        initGrid();
        initAnts();
        foodScore = 0;
        document.getElementById('food-score').innerText = 0;
    });
}

function updateMouse(e) {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
}

function applyBrush() {
    const c = Math.floor(mousePos.x / GRID_SCALE);
    const r = Math.floor(mousePos.y / GRID_SCALE);
    const brushSize = 3;

    for (let i = -brushSize; i <= brushSize; i++) {
        for (let j = -brushSize; j <= brushSize; j++) {
            const nc = c + i;
            const nr = r + j;
            if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
                if (drawMode === 'wall') worldGrid[nc][nr] = 1;
                else if (drawMode === 'food') worldGrid[nc][nr] = 3;
                else if (drawMode === 'erase') worldGrid[nc][nr] = 0;
            }
        }
    }
}

// Global scope setter for UI
window.setMode = (mode) => {
    drawMode = mode;
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    // Simple logic to highlight clicked, relying on event bubbling usually, 
    // but explicit class check in React/modern JS. Here just trusting user click.
    event.currentTarget.classList.add('active');
};

// --- Loop ---

function loop() {
    const speed = parseInt(document.getElementById('speed-slider').value);
    const decayRaw = parseInt(document.getElementById('decay-slider').value);
    const decayFactor = 1 - (decayRaw / 100); // Slider 5 -> 0.95

    for (let s = 0; s < speed; s++) {
        // Update Ants
        for (let ant of ants) ant.update();

        // Process Grid (Decay) 
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                homePheromones[c][r] *= decayFactor;
                foodPheromones[c][r] *= decayFactor;
                
                // Threshold cleanup
                if (homePheromones[c][r] < 0.1) homePheromones[c][r] = 0;
                if (foodPheromones[c][r] < 0.1) foodPheromones[c][r] = 0;
            }
        }
    }

    draw();
    requestAnimationFrame(loop);
}

function draw() {
    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw Pheromones (Pixel Manipulation for speed)
    // Actually, Canvas ImageData is faster for 50k pixels than fillRect
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // We only iterate grid and draw pixels scaled up? 
    // Or just draw raw rectangles for simplicity (Level 3 optimization usually uses ImageData)
    // Let's use simple rects for clarity of code, performance is okay for modern browser at this grid size
    
    // Optimization: Only draw cells with value > 1
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const x = c * GRID_SCALE;
            const y = r * GRID_SCALE;
            
            // Wall
            if (worldGrid[c][r] === 1) {
                ctx.fillStyle = '#64748b';
                ctx.fillRect(x, y, GRID_SCALE, GRID_SCALE);
                continue;
            }
            // Food
            if (worldGrid[c][r] === 3) {
                ctx.fillStyle = '#4ade80';
                ctx.fillRect(x, y, GRID_SCALE, GRID_SCALE);
                continue;
            }

            // Pheromones
            const homeVal = homePheromones[c][r];
            const foodVal = foodPheromones[c][r];

            if (homeVal > 1 || foodVal > 1) {
                // Mix colors: Home=Blue, Food=Red
                const alpha = Math.min((homeVal + foodVal) / 255, 1);
                // Simple tint: mostly red if food, mostly blue if home
                let red = foodVal > homeVal ? 255 : 0;
                let blue = homeVal > foodVal ? 255 : 0;
                
                ctx.fillStyle = `rgba(${red}, 50, ${blue}, ${alpha})`;
                ctx.fillRect(x, y, GRID_SCALE, GRID_SCALE);
            }
        }
    }

    // Draw Nest
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.beginPath();
    ctx.arc(nest.x, nest.y, nest.r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.stroke();

    // Draw Ants
    ctx.fillStyle = '#fff';
    for (let ant of ants) {
        ctx.fillStyle = ant.hasFood ? '#ef4444' : '#fff';
        ctx.fillRect(ant.x - 1, ant.y - 1, 2, 2);
    }
}

// Start
init();