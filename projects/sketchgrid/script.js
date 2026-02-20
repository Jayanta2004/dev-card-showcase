const GRID_SIZE = 5;
let currentMode = 'predict';
let selectedDigit = 0;
let isDrawing = false;
let trainingData = {};

const gridCanvas = document.getElementById('gridCanvas');
const drawCanvas = document.getElementById('drawCanvas');
const exampleCanvas = document.getElementById('exampleCanvas');
const gridCtx = gridCanvas.getContext('2d');
const drawCtx = drawCanvas.getContext('2d');
const exampleCtx = exampleCanvas.getContext('2d');

// Initialize training data
function initTrainingData() {
    for (let i = 0; i <= 9; i++) {
        trainingData[i] = [];
    }
}

// Initialize
function init() {
    initTrainingData();
    drawGrid();
    createDigitSelector();
    setupDrawing();
}

// Draw grid overlay
function drawGrid() {
    gridCtx.strokeStyle = '#ddd';
    gridCtx.lineWidth = 1;

    const cellSize = gridCanvas.width / GRID_SIZE;

    for (let i = 0; i <= GRID_SIZE; i++) {
        gridCtx.beginPath();
        gridCtx.moveTo(i * cellSize, 0);
        gridCtx.lineTo(i * cellSize, gridCanvas.height);
        gridCtx.stroke();

        gridCtx.beginPath();
        gridCtx.moveTo(0, i * cellSize);
        gridCtx.lineTo(gridCanvas.width, i * cellSize);
        gridCtx.stroke();
    }
}

// Create digit selector buttons
function createDigitSelector() {
    const selector = document.getElementById('digitSelector');
    for (let i = 0; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'digit-btn' + (i === 0 ? ' selected' : '');
        btn.innerHTML = `${i}<span class="sample-count" id="count-${i}">${trainingData[i].length}</span>`;
        btn.onclick = () => selectDigit(i);
        selector.appendChild(btn);
    }
}

// Select digit for training
function selectDigit(digit) {
    selectedDigit = digit;
    document.querySelectorAll('.digit-btn').forEach((btn, idx) => {
        btn.classList.toggle('selected', idx === digit);
    });
}

// Setup drawing functionality
function setupDrawing() {
    drawCtx.strokeStyle = '#333';
    drawCtx.lineWidth = 12;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';

    let lastX = 0;
    let lastY = 0;

    function startDrawing(e) {
        isDrawing = true;
        const rect = drawCanvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;
        lastX = x;
        lastY = y;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();

        const rect = drawCanvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        drawCtx.beginPath();
        drawCtx.moveTo(lastX, lastY);
        drawCtx.lineTo(x, y);
        drawCtx.stroke();

        lastX = x;
        lastY = y;
    }

    function stopDrawing() {
        if (isDrawing && currentMode === 'predict') {
            predictDigit();
        }
        isDrawing = false;
    }

    drawCanvas.addEventListener('mousedown', startDrawing);
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', stopDrawing);
    drawCanvas.addEventListener('mouseout', stopDrawing);

    drawCanvas.addEventListener('touchstart', startDrawing);
    drawCanvas.addEventListener('touchmove', draw);
    drawCanvas.addEventListener('touchend', stopDrawing);
}

// Extract active grid cells from drawing
function getActiveGridCells() {
    const imageData = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    const cellSize = drawCanvas.width / GRID_SIZE;
    const activeCells = [];

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            let hasInk = false;

            for (let y = Math.floor(row * cellSize); y < Math.floor((row + 1) * cellSize); y++) {
                for (let x = Math.floor(col * cellSize); x < Math.floor((col + 1) * cellSize); x++) {
                    const idx = (y * drawCanvas.width + x) * 4;
                    if (imageData.data[idx + 3] > 128) {
                        hasInk = true;
                        break;
                    }
                }
                if (hasInk) break;
            }

            if (hasInk) {
                activeCells.push([row, col]);
            }
        }
    }

    return activeCells;
}

// Save training sample
function saveTrainingSample() {
    const activeCells = getActiveGridCells();
    
    if (activeCells.length === 0) {
        alert('Please draw something first!');
        return;
    }

    trainingData[selectedDigit].push(activeCells);
    
    document.getElementById(`count-${selectedDigit}`).textContent = trainingData[selectedDigit].length;
    
    clearCanvas();
    document.getElementById('infoText').textContent = `Saved pattern for digit ${selectedDigit}! Draw another or switch digits.`;
}

// Calculate similarity between two cell patterns
function calculateSimilarity(cells1, cells2) {
    const set1 = new Set(cells1.map(c => `${c[0]},${c[1]}`));
    const set2 = new Set(cells2.map(c => `${c[0]},${c[1]}`));
    
    let matches = 0;
    set1.forEach(cell => {
        if (set2.has(cell)) matches++;
    });

    const union = new Set([...set1, ...set2]).size;
    return union > 0 ? matches / union : 0;
}

// Predict digit based on active cells
function predictDigit() {
    const activeCells = getActiveGridCells();
    
    if (activeCells.length === 0) {
        document.getElementById('predictedDigit').textContent = '?';
        document.getElementById('confidenceText').textContent = 'Canvas is empty';
        return;
    }

    let bestMatch = -1;
    let bestScore = 0;
    let secondBestScore = 0;

    for (let digit = 0; digit <= 9; digit++) {
        if (trainingData[digit].length === 0) continue;

        let maxScore = 0;
        trainingData[digit].forEach(sample => {
            const score = calculateSimilarity(activeCells, sample);
            maxScore = Math.max(maxScore, score);
        });

        if (maxScore > bestScore) {
            secondBestScore = bestScore;
            bestScore = maxScore;
            bestMatch = digit;
        } else if (maxScore > secondBestScore) {
            secondBestScore = maxScore;
        }
    }

    const confidence = bestScore - secondBestScore;

    if (bestMatch === -1) {
        document.getElementById('predictedDigit').textContent = '?';
        document.getElementById('confidenceText').textContent = 'No training data yet — switch to Training Mode';
    } else if (bestScore < 0.3) {
        document.getElementById('predictedDigit').textContent = '?';
        document.getElementById('confidenceText').textContent = 'Not confident — train me more or try again';
    } else {
        document.getElementById('predictedDigit').textContent = bestMatch;
        const confidenceLevel = confidence > 0.2 ? 'High confidence' : confidence > 0.1 ? 'Medium confidence' : 'Low confidence';
        document.getElementById('confidenceText').textContent = `Looks like a ${bestMatch} • ${confidenceLevel} (${Math.round(bestScore * 100)}% match)`;
    }
}

// Clear canvas
function clearCanvas() {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    exampleCtx.clearRect(0, 0, exampleCanvas.width, exampleCanvas.height);
    
    if (currentMode === 'predict') {
        document.getElementById('predictedDigit').textContent = '?';
        document.getElementById('confidenceText').textContent = 'Draw a digit to predict';
    }
}

// Set mode
function setMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    if (mode === 'train') {
        document.getElementById('trainingPanel').classList.remove('hidden');
        document.getElementById('predictionResult').classList.add('hidden');
        document.getElementById('infoText').textContent = 'Select a digit, draw it, then save the pattern. Multiple samples improve accuracy!';
    } else {
        document.getElementById('trainingPanel').classList.add('hidden');
        document.getElementById('predictionResult').classList.remove('hidden');
        document.getElementById('infoText').textContent = 'Draw naturally on the canvas. The grid captures your digit\'s structure.';
    }

    clearCanvas();
}

// Show example digit
function showExample() {
    const digit = currentMode === 'train' ? selectedDigit : parseInt(document.getElementById('predictedDigit').textContent) || 0;
    
    exampleCtx.clearRect(0, 0, exampleCanvas.width, exampleCanvas.height);
    exampleCtx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    exampleCtx.lineWidth = 16;
    exampleCtx.lineCap = 'round';
    exampleCtx.lineJoin = 'round';

    const examples = {
        0: [[150,100], [200,80], [250,100], [280,150], [280,250], [250,300], [200,320], [150,300], [120,250], [120,150], [150,100]],
        1: [[200,80], [200,320]],
        2: [[140,120], [180,80], [240,80], [280,120], [280,160], [140,320], [280,320]],
        3: [[140,100], [240,80], [280,120], [240,160], [200,180], [240,200], [280,240], [240,300], [140,280]],
        4: [[240,80], [120,200], [280,200], [240,80], [240,320]],
        5: [[260,80], [140,80], [140,180], [240,160], [280,200], [280,260], [240,300], [140,280]],
        6: [[240,80], [160,100], [120,160], [120,260], [160,310], [240,310], [280,260], [280,200], [240,160], [160,180]],
        7: [[120,80], [280,80], [200,320]],
        8: [[200,80], [160,100], [160,140], [200,160], [240,140], [240,100], [200,80], [160,220], [160,280], [200,320], [240,280], [240,220], [200,200]],
        9: [[240,320], [200,300], [160,260], [120,200], [120,140], [160,90], [240,90], [280,140], [280,240], [240,300]]
    };

    const points = examples[digit] || examples[0];
    
    exampleCtx.beginPath();
    exampleCtx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        exampleCtx.lineTo(points[i][0], points[i][1]);
    }
    exampleCtx.stroke();
}

// Hide example
function hideExample() {
    exampleCtx.clearRect(0, 0, exampleCanvas.width, exampleCanvas.height);
}

// Reset training data
function resetTraining() {
    if (confirm('This will delete all training data. Are you sure?')) {
        for (let i = 0; i <= 9; i++) {
            trainingData[i] = [];
            document.getElementById(`count-${i}`).textContent = '0';
        }
        document.getElementById('infoText').textContent = 'All training data reset. Start training fresh!';
    }
}

init();