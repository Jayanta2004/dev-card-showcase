// DOM Elements
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const canvasOverlay = document.getElementById('canvasOverlay');
const clearBtn = document.getElementById('clearBtn');
const checkBtn = document.getElementById('checkBtn');
const strokeSlider = document.getElementById('strokeSlider');
const strokeValue = document.getElementById('strokeValue');
const feedbackText = document.getElementById('feedbackText');
const feedbackHint = document.getElementById('feedbackHint');
const feedbackIcon = document.querySelector('.feedback-icon i');
const colorOptions = document.querySelectorAll('.color-option');
const optionBtns = document.querySelectorAll('.option-btn');

// Canvas Setup
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    redrawCanvas();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Drawing Variables
let drawing = false;
let currentColor = '#6a11cb';
let lineWidth = 5;
let lastX = 0;
let lastY = 0;
let drawnPaths = [];
let currentPath = [];
let selectedType = 'circle';

// Drawing Functions
function startDrawing(e) {
    drawing = true;
    [lastX, lastY] = getMousePos(e);
    currentPath = [{x: lastX, y: lastY, color: currentColor, width: lineWidth}];
    canvasOverlay.classList.add('hidden');
}

function draw(e) {
    if (!drawing) return;
    
    e.preventDefault();
    const [x, y] = getMousePos(e);
    
    // Draw on canvas
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Store point in current path
    currentPath.push({x, y, color: currentColor, width: lineWidth});
    
    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    if (!drawing) return;
    drawing = false;
    if (currentPath.length > 0) {
        drawnPaths.push([...currentPath]);
    }
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.type.includes('touch')) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return [
        (clientX - rect.left) * scaleX,
        (clientY - rect.top) * scaleY
    ];
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all stored paths
    drawnPaths.forEach(path => {
        if (path.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        
        ctx.strokeStyle = path[0].color;
        ctx.lineWidth = path[0].width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    });
}

function clearCanvas() {
    drawnPaths = [];
    redrawCanvas();
    canvasOverlay.classList.remove('hidden');
    
    // Reset feedback
    feedbackText.textContent = "Canvas cleared! Select a shape or number to draw";
    feedbackHint.textContent = "Hint: Try to make your drawing clear and recognizable";
    feedbackIcon.className = "fas fa-lightbulb";
    feedbackIcon.parentElement.classList.remove("celebrate-animation", "pulse-animation");
    feedbackIcon.style.color = "#6a11cb";
    feedbackText.style.color = "#000";
}

// Validation Functions (basic heuristics)
function checkDrawing() {
    if (drawnPaths.length === 0) {
        showFeedback("Please draw something first!", "Try drawing a " + selectedType, "fa-exclamation-triangle", false);
        return;
    }
    
    // Combine all paths into a single set of points
    const allPoints = [];
    drawnPaths.forEach(path => {
        allPoints.push(...path);
    });
    
    // Get drawing bounds
    const bounds = getDrawingBounds(allPoints);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    
    // Different validation for shapes vs numbers
    if (['circle', 'triangle', 'square'].includes(selectedType)) {
        validateShape(bounds, width, height, allPoints);
    } else {
        validateNumber(bounds, width, height, allPoints);
    }
}

function getDrawingBounds(points) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    points.forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    });
    
    return { minX, maxX, minY, maxY };
}

function validateShape(bounds, width, height, points) {
    const centerX = bounds.minX + width / 2;
    const centerY = bounds.minY + height / 2;
    
    // Calculate circularity (for circle validation)
    const distances = points.map(p => {
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        return Math.sqrt(dx * dx + dy * dy);
    });
    
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((a, b) => a + Math.pow(b - avgDistance, 2), 0) / distances.length;
    const circularity = variance / avgDistance;
    
    // Check aspect ratio for square vs rectangle
    const aspectRatio = width / height;
    
    let isCorrect = false;
    let feedbackMessage = "";
    
    switch(selectedType) {
        case 'circle':
            // Check for circularity and aspect ratio
            isCorrect = circularity < 0.3 && aspectRatio > 0.7 && aspectRatio < 1.3;
            feedbackMessage = isCorrect ? 
                "Excellent! That's a great circle!" : 
                "Not quite a circle. Try to make it rounder!";
            break;
            
        case 'triangle':
            // Triangles are harder to validate, we'll check for 3 distinct "corners"
            // Simplified check: look for sharp direction changes
            const directionChanges = countDirectionChanges(points);
            isCorrect = directionChanges >= 3;
            feedbackMessage = isCorrect ? 
                "Great triangle! You've got three angles!" : 
                "Try to make three distinct corners for a triangle";
            break;
            
        case 'square':
            // Check for aspect ratio close to 1 and some straight lines
            isCorrect = aspectRatio > 0.8 && aspectRatio < 1.2;
            feedbackMessage = isCorrect ? 
                "Perfect square! All sides look equal!" : 
                "Try to make all four sides equal length for a square";
            break;
    }
    
    showFeedback(
        feedbackMessage,
        isCorrect ? "Well done!" : `Try again for a better ${selectedType}`,
        isCorrect ? "fa-check-circle" : "fa-redo",
        isCorrect
    );
}

function validateNumber(bounds, width, height, points) {
    // Simple validation based on drawing complexity and size
    // In a real app, this would use ML or more complex algorithms
    let isCorrect = false;
    let feedbackMessage = "";
    
    // Simulate different validation for different numbers
    const lineCount = drawnPaths.length;
    const pointCount = points.length;
    
    switch(selectedType) {
        case '1':
            isCorrect = pointCount > 20 && (height > width * 1.5);
            feedbackMessage = isCorrect ? 
                "That's a clear number 1!" : 
                "Number 1 should be a straight vertical line";
            break;
            
        case '2':
            isCorrect = pointCount > 40 && lineCount >= 2;
            feedbackMessage = isCorrect ? 
                "Great number 2 with a curve at the bottom!" : 
                "Number 2 should have a curve at the bottom";
            break;
            
        case '3':
            isCorrect = pointCount > 50 && lineCount >= 2;
            feedbackMessage = isCorrect ? 
                "Nice number 3 with two curves!" : 
                "Number 3 should have two curves";
            break;
            
        case '4':
            isCorrect = pointCount > 30 && lineCount >= 3;
            feedbackMessage = isCorrect ? 
                "Perfect number 4 with three straight lines!" : 
                "Number 4 usually has three straight lines";
            break;
            
        case '5':
            isCorrect = pointCount > 60 && lineCount >= 3;
            feedbackMessage = isCorrect ? 
                "Excellent number 5 with a straight line and curve!" : 
                "Number 5 has a straight line and a curve";
            break;
    }
    
    showFeedback(
        feedbackMessage,
        isCorrect ? "You're getting good at this!" : `Try again for a better ${selectedType}`,
        isCorrect ? "fa-check-circle" : "fa-redo",
        isCorrect
    );
}

function countDirectionChanges(points) {
    if (points.length < 10) return 0;
    
    let changes = 0;
    const angleThreshold = Math.PI / 3; // 60 degrees
    
    for (let i = 2; i < points.length - 2; i++) {
        const dx1 = points[i].x - points[i-2].x;
        const dy1 = points[i].y - points[i-2].y;
        const dx2 = points[i+2].x - points[i].x;
        const dy2 = points[i+2].y - points[i].y;
        
        const angle1 = Math.atan2(dy1, dx1);
        const angle2 = Math.atan2(dy2, dx2);
        const angleDiff = Math.abs(angle1 - angle2);
        
        if (angleDiff > angleThreshold) {
            changes++;
        }
    }
    
    return changes;
}

function showFeedback(message, hint, icon, isSuccess) {
    feedbackText.textContent = message;
    feedbackHint.textContent = hint;
    feedbackIcon.className = "fas " + icon;
    
    // Apply animations
    const iconContainer = feedbackIcon.parentElement;
    iconContainer.classList.remove("celebrate-animation", "pulse-animation", "bounce-animation");
    
    void iconContainer.offsetWidth; // Trigger reflow
    
    if (isSuccess) {
        iconContainer.classList.add("celebrate-animation");
        feedbackText.classList.add("pulse-animation");
    } else {
        iconContainer.classList.add("bounce-animation");
    }
    
    // Change color based on success
    if (isSuccess) {
        feedbackIcon.style.color = "#11998e";
        feedbackText.style.color = "#11998e";
    } else {
        feedbackIcon.style.color = "#ff416c";
        feedbackText.style.color = "#ff416c";
    }
}

// Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing();
});

clearBtn.addEventListener('click', clearCanvas);

checkBtn.addEventListener('click', checkDrawing);

strokeSlider.addEventListener('input', function() {
    lineWidth = this.value;
    strokeValue.textContent = lineWidth;
});

colorOptions.forEach(option => {
    option.addEventListener('click', function() {
        colorOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        currentColor = this.getAttribute('data-color');
    });
});

optionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        optionBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedType = this.getAttribute('data-type');
        
        // Update feedback hint based on selection
        if (['circle', 'triangle', 'square'].includes(selectedType)) {
            feedbackHint.textContent = `Hint: Try to draw a clear ${selectedType}`;
        } else {
            feedbackHint.textContent = `Hint: Draw the number ${selectedType}`;
        }
        
        canvasOverlay.classList.add('hidden');
    });
});

// Initialize with some instructions
setTimeout(() => {
    canvasOverlay.classList.add('hidden');
}, 3000);
