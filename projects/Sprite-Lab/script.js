/**
 * Sprite-Lab Logic
 * Handles image loading, spritesheet slicing, and the animation loop.
 */

// --- DOM Elements ---
const canvas = document.getElementById('sprite-canvas');
const ctx = canvas.getContext('2d');
const refImage = document.getElementById('ref-image');
const bgContainer = document.getElementById('canvas-bg');

// Inputs
const uploadInput = document.getElementById('upload-input');
const inpFrameW = document.getElementById('frame-width');
const inpFrameH = document.getElementById('frame-height');
const inpFps = document.getElementById('inp-fps');
const inpZoom = document.getElementById('inp-zoom');

// Displays
const displayFps = document.getElementById('val-fps');
const displayZoom = document.getElementById('val-zoom');
const displayCurr = document.getElementById('curr-frame');
const displayTotal = document.getElementById('total-frames');
const fileName = document.getElementById('file-name');

// Buttons
const btnPlay = document.getElementById('btn-play');
const btnStep = document.getElementById('btn-step');
const btnReset = document.getElementById('btn-reset');

// --- State ---
let spriteSheet = new Image();
let isPlaying = true;
let currentFrame = 0;
let totalFrames = 0;
let cols = 0;
let rows = 0;

let settings = {
    frameW: 32,
    frameH: 32,
    fps: 12,
    zoom: 4
};

// Animation Loop Variables
let lastTime = 0;
let timer = 0;

// --- Initialization ---
function init() {
    // Event Listeners
    uploadInput.addEventListener('change', handleUpload);
    
    inpFrameW.addEventListener('input', updateDimensions);
    inpFrameH.addEventListener('input', updateDimensions);
    
    inpFps.addEventListener('input', (e) => {
        settings.fps = parseInt(e.target.value);
        displayFps.innerText = settings.fps;
    });
    
    inpZoom.addEventListener('input', (e) => {
        settings.zoom = parseInt(e.target.value);
        displayZoom.innerText = settings.zoom + 'x';
        resizeCanvas();
    });

    btnPlay.addEventListener('click', togglePlay);
    
    btnStep.addEventListener('click', () => {
        isPlaying = false;
        updatePlayIcon();
        stepFrame();
        draw();
    });
    
    btnReset.addEventListener('click', () => {
        currentFrame = 0;
        draw();
    });

    // Background Toggles
    document.getElementById('bg-checker').addEventListener('click', () => setBg('checkerboard'));
    document.getElementById('bg-dark').addEventListener('click', () => setBg('bg-dark'));
    document.getElementById('bg-light').addEventListener('click', () => setBg('bg-light'));

    // Load Default Sprite (Placeholder)
    // Using a base64 tiny ghost sprite for immediate demo
    spriteSheet.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAgCAYAAADD7/WLEAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACYSURBVGhD7ZoxDgAhCAP5/0/n4mBjs20s9BaO4hIEWzKzFRE5+j1c9wL1wH0+7gXqgfs8uBf46wE+Jz1w/3+4F6gH7vNxL1AP3OfBvUA9cJ+Pe4F64D4f9wL1wH0+7gXqgft83AvUA/f5uBeoB+7zcS9QD9zn416gHrjPx71APXCfj3uBeuA+H/cC9cB9Pu4F6oH7fNwL1AP3+XQ+b90D5/wA7d0AAAAASUVORK5CYII='; 
    spriteSheet.onload = () => {
        fileName.innerText = "Demo_Ghost.png";
        refImage.src = spriteSheet.src;
        updateDimensions();
        requestAnimationFrame(animate);
    };
}

// --- Logic ---

function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    fileName.innerText = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
        spriteSheet.src = event.target.result;
        refImage.src = event.target.result;
        // Reset frame
        currentFrame = 0;
    };
    reader.readAsDataURL(file);
}

function updateDimensions() {
    settings.frameW = parseInt(inpFrameW.value) || 1;
    settings.frameH = parseInt(inpFrameH.value) || 1;

    // Calculate Grid
    cols = Math.floor(spriteSheet.width / settings.frameW);
    rows = Math.floor(spriteSheet.height / settings.frameH);
    totalFrames = cols * rows;

    displayTotal.innerText = totalFrames;
    resizeCanvas();
}

function resizeCanvas() {
    canvas.width = settings.frameW * settings.zoom;
    canvas.height = settings.frameH * settings.zoom;
    
    // Disable smoothing for pixel art look
    ctx.imageSmoothingEnabled = false;
    
    draw();
}

function togglePlay() {
    isPlaying = !isPlaying;
    updatePlayIcon();
}

function updatePlayIcon() {
    const icon = btnPlay.querySelector('i');
    if (isPlaying) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

function setBg(cls) {
    bgContainer.className = `canvas-wrapper ${cls}`;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    // Map button ID to class for active state
    if(cls === 'checkerboard') document.getElementById('bg-checker').classList.add('active');
    if(cls === 'bg-dark') document.getElementById('bg-dark').classList.add('active');
    if(cls === 'bg-light') document.getElementById('bg-light').classList.add('active');
}

function stepFrame() {
    currentFrame++;
    if (currentFrame >= totalFrames) currentFrame = 0;
}

// --- Animation Loop ---

function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (isPlaying) {
        timer += deltaTime;
        // FPS throttle
        const interval = 1000 / settings.fps;
        
        if (timer > interval) {
            stepFrame();
            timer = 0; // Reset timer
            draw();
        }
    }

    requestAnimationFrame(animate);
}

function draw() {
    if (!spriteSheet.width) return;

    // Calculate source position (Column, Row)
    const col = currentFrame % cols;
    const row = Math.floor(currentFrame / cols);

    const sx = col * settings.frameW;
    const sy = row * settings.frameH;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Image (Source -> Destination)
    ctx.drawImage(
        spriteSheet, 
        sx, sy, settings.frameW, settings.frameH, // Source
        0, 0, canvas.width, canvas.height       // Destination (Stretched by Zoom)
    );

    // Update UI Stats
    displayCurr.innerText = currentFrame + 1;
}

// Start
init();