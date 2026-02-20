const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');

const gridSize = 32;
const pixelSize = canvas.width / gridSize;

let isDrawing = false;

// Draw grid
function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * pixelSize, 0);
        ctx.lineTo(i * pixelSize, canvas.height);
        ctx.stroke();
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * pixelSize);
        ctx.lineTo(canvas.width, i * pixelSize);
        ctx.stroke();
    }
}

// Paint pixel
function paintPixel(x, y) {
    const pixelX = Math.floor(x / pixelSize);
    const pixelY = Math.floor(y / pixelSize);
    ctx.fillStyle = colorPicker.value;
    ctx.fillRect(pixelX * pixelSize, pixelY * pixelSize, pixelSize, pixelSize);
}

// Get mouse position relative to canvas
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = getMousePos(e);
    paintPixel(pos.x, pos.y);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const pos = getMousePos(e);
        paintPixel(pos.x, pos.y);
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

// Clear canvas
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
});

// Export PNG
exportBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Get touch position relative to canvas
function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

// Touch event listeners
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const pos = getTouchPos(e);
    paintPixel(pos.x, pos.y);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing) {
        const pos = getTouchPos(e);
        paintPixel(pos.x, pos.y);
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDrawing = false;
});