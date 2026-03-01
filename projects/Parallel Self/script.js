const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerFill = document.getElementById('timerFill');
const statusText = document.getElementById('statusText');

// Game Constants
const LOOP_DURATION = 10000; // 10 seconds
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const SPEED = 5;
const TILE_SIZE = 40;

// Game State
let startTime = Date.now();
let loopCount = 1;
let frames = 0;
let isGameOver = false;

// Inputs
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyR: false
};

// Player Class
class Player {
    constructor(x, y, isClone = false, recording = []) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.vx = 0;
        this.vy = 0;
        this.isClone = isClone;
        this.recording = recording; // Array of {x, y, isInteracting}
        this.frameIndex = 0;
        this.grounded = false;
        this.color = isClone ? 'rgba(100, 200, 255, 0.6)' : '#ff2e63';
        this.history = []; // For recording current loop
    }

    update() {
        if (this.isClone) {
            // Replay recording
            if (this.frameIndex < this.recording.length) {
                const state = this.recording[this.frameIndex];
                this.x = state.x;
                this.y = state.y;
                this.frameIndex++;
            }
        } else {
            // Check manual reset
            if (keys.KeyR) {
                resetLoop();
                return;
            }

            // Movement
            if (keys.ArrowLeft) this.vx = -SPEED;
            else if (keys.ArrowRight) this.vx = SPEED;
            else this.vx = 0;

            if (keys.ArrowUp && this.grounded) {
                this.vy = JUMP_FORCE;
                this.grounded = false;
            }

            // Physics
            this.vy += GRAVITY;
            this.x += this.vx;
            this.y += this.vy;

            // Collision with boundaries
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
            
            // Wall Collisions
            this.checkCollisions();

            // Record State
            this.history.push({
                x: this.x,
                y: this.y
            });
        }
    }

    checkCollisions() {
        this.grounded = false;
        
        // Simple floor collision
        /* if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.vy = 0;
            this.grounded = true;
        } */

        // Tilemap collision
        for (let r = 0; r < map.length; r++) {
            for (let c = 0; c < map[0].length; c++) {
                let tile = map[r][c];
                let tx = c * TILE_SIZE;
                let ty = r * TILE_SIZE;

                if (tile === 1 || (tile === 3 && !levelState.doorOpen)) { // Wall or Closed Door
                    if (
                        this.x < tx + TILE_SIZE &&
                        this.x + this.width > tx &&
                        this.y < ty + TILE_SIZE &&
                        this.y + this.height > ty
                    ) {
                        // Collision detected, resolve it
                        let dx = (this.x + this.width / 2) - (tx + TILE_SIZE / 2);
                        let dy = (this.y + this.height / 2) - (ty + TILE_SIZE / 2);
                        let width = (this.width + TILE_SIZE) / 2;
                        let height = (this.height + TILE_SIZE) / 2;
                        let crossWidth = width * dy;
                        let crossHeight = height * dx;

                        if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
                            if (crossWidth > crossHeight) {
                                if (crossWidth > -crossHeight) {
                                    // Bottom collision
                                    this.y = ty + TILE_SIZE;
                                    this.vy = 0;
                                } else {
                                    // Left collision
                                    this.x = tx - this.width;
                                    this.vx = 0;
                                }
                            } else {
                                if (crossWidth > -crossHeight) {
                                    // Right collision
                                    this.x = tx + TILE_SIZE;
                                    this.vx = 0;
                                } else {
                                    // Top collision
                                    this.y = ty - this.height;
                                    this.vy = 0;
                                    this.grounded = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eyes to show direction
        ctx.fillStyle = 'white';
        let eyeOffset = this.vx >= 0 ? 5 : -5; // Look direction
        if (this.isClone) eyeOffset = 0; // Clones just stare
        
        ctx.fillRect(this.x + 5 + eyeOffset, this.y + 5, 8, 8);
        ctx.fillRect(this.x + 17 + eyeOffset, this.y + 5, 8, 8);
    }
}

// Level Design (1 = Wall, 0 = Air, 2 = Button, 3 = Door, 4 = Exit, 9 = Spawn)
// Simple level: Button on left opens Door on right to reach Exit.
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,9,0,0,0,0,0,1,0,0,0,0,0,1,1,1,3,1,4,1],
    [1,1,1,1,1,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Extra floor
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const levelState = {
    doorOpen: false,
    buttonPressed: false
};

// Global Variables
let player;
let clones = [];
let spawnPoint = {x: 50, y: 50};

// Find Spawn
for(let r=0; r<map.length; r++){
    for(let c=0; c<map[0].length; c++){
        if(map[r][c] === 9) {
            spawnPoint = {x: c*TILE_SIZE, y: r*TILE_SIZE};
        }
    }
}

function init() {
    player = new Player(spawnPoint.x, spawnPoint.y);
    clones = [];
    loopCount = 1;
    startTime = Date.now();
    isGameOver = false;
    requestAnimationFrame(gameLoop);
}

function resetLoop() {
    // Save current player's history as a new clone
    if (player.history.length > 0) {
        clones.push(new Player(spawnPoint.x, spawnPoint.y, true, [...player.history]));
    }
    
    // Reset player
    player = new Player(spawnPoint.x, spawnPoint.y);
    startTime = Date.now();
    loopCount++;
    statusText.textContent = `Loop ${loopCount}`;
}

function update() {
    // Timer
    let elapsed = Date.now() - startTime;
    let progress = Math.min((elapsed / LOOP_DURATION) * 100, 100);
    timerFill.style.width = `${progress}%`;
    
    if (elapsed >= LOOP_DURATION) {
        resetLoop();
        return;
    }

    // Logic
    levelState.buttonPressed = false; // Reset status, check frame by frame

    // Update Clones
    clones.forEach(clone => clone.update());
    
    // Update Player
    player.update();

    // Check Button Logic (Player or Clones can press it)
    const entities = [player, ...clones];
    for (let entity of entities) {
        // Tile based check for button
        let c = Math.floor((entity.x + entity.width/2) / TILE_SIZE);
        let r = Math.floor((entity.y + entity.height/2) / TILE_SIZE);
        if (map[r][c] === 2) {
            levelState.buttonPressed = true;
        }
    }

    levelState.doorOpen = levelState.buttonPressed;

    // Check Win
    let pc = Math.floor((player.x + player.width/2) / TILE_SIZE);
    let pr = Math.floor((player.y + player.height/2) / TILE_SIZE);
    if (map[pr][pc] === 4) {
        alert("You Solved the Puzzle!");
        init(); // Hard reset
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Map
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[0].length; c++) {
            let tile = map[r][c];
            let x = c * TILE_SIZE;
            let y = r * TILE_SIZE;
            
            if (tile === 1) {
                ctx.fillStyle = '#0f3460';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#16213e';
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (tile === 2) {
                ctx.fillStyle = levelState.buttonPressed ? '#00b894' : '#d63031';
                ctx.fillRect(x + 5, y + 30, TILE_SIZE - 10, 10); // Button plate
            } else if (tile === 3) {
                if (!levelState.doorOpen) {
                    ctx.fillStyle = '#e94560';
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.fillRect(x+5, y+5, TILE_SIZE-10, TILE_SIZE-10);
                } else {
                    ctx.strokeStyle = '#e94560';
                    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE); // Door frame outline
                }
            } else if (tile === 4) {
                ctx.fillStyle = '#f1c40f'; // Exit
                ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.2;
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.globalAlpha = 1.0;
            }
        }
    }

    // Draw Entities
    clones.forEach(clone => clone.draw());
    player.draw();
}

function gameLoop() {
    update();
    draw();
    if (!isGameOver) requestAnimationFrame(gameLoop);
}

// Event Listeners
window.addEventListener('keydown', e => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
});

window.addEventListener('keyup', e => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// Start
init();
