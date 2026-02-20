// One-Line Art Challenge Game Logic

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const replayBtn = document.getElementById('replay-btn');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');

let drawing = false;
let path = [];
let startTime;
let timerInterval;
let currentScore = 0;

// Canvas setup
ctx.lineWidth = 3;
ctx.lineCap = 'round';
ctx.strokeStyle = '#000000';

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mouseout', endDrawing); // End if mouse leaves canvas

startBtn.addEventListener('click', resetGame);
replayBtn.addEventListener('click', replayDrawing);

function startDrawing(e) {
    if (!drawing) {
        drawing = true;
        path = [];
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 100);
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        path.push({x, y, time: 0});
        
        canvas.style.cursor = 'crosshair';
    }
}

function draw(e) {
    if (drawing) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineTo(x, y);
        ctx.stroke();
        
        const time = Date.now() - startTime;
        path.push({x, y, time});
    }
}

function endDrawing() {
    if (drawing) {
        drawing = false;
        clearInterval(timerInterval);
        calculateScore();
        replayBtn.style.display = 'inline-block';
        canvas.style.cursor = 'default';
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Time: ${elapsed}s`;
}

function calculateScore() {
    const time = (Date.now() - startTime) / 1000; // in seconds
    const length = path.length;
    
    // Score based on line length divided by time (higher is better)
    // Bonus for longer drawings and faster completion
    currentScore = Math.floor((length / time) * 10);
    
    scoreDisplay.textContent = `Score: ${currentScore}`;
}

function resetGame() {
    drawing = false;
    path = [];
    clearInterval(timerInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    timerDisplay.textContent = 'Time: 0s';
    scoreDisplay.textContent = 'Score: 0';
    replayBtn.style.display = 'none';
    canvas.style.cursor = 'crosshair';
}

function replayDrawing() {
    if (path.length === 0) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    
    let i = 1;
    const replaySpeed = 5; // milliseconds per point
    
    const replayInterval = setInterval(() => {
        if (i < path.length) {
            ctx.lineTo(path[i].x, path[i].y);
            ctx.stroke();
            i++;
        } else {
            clearInterval(replayInterval);
        }
    }, replaySpeed);
}

// Prevent context menu on right click
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Initialize
resetGame();