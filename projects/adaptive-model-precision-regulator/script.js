// Adaptive Model Precision Regulator JavaScript

// Global variables
let currentPrecision = 85;
let taskCriticality = 5;
let resourceAvailability = 7;
let adjustmentSensitivity = 1.0;
let adjustmentHistory = [];

// DOM elements
const currentPrecisionEl = document.getElementById('current-precision');
const taskCriticalityEl = document.getElementById('task-criticality');
const resourceUsageEl = document.getElementById('resource-usage');
const lastAdjustmentEl = document.getElementById('last-adjustment');
const criticalitySlider = document.getElementById('criticality-slider');
const resourceSlider = document.getElementById('resource-slider');
const sensitivitySlider = document.getElementById('sensitivity-slider');
const criticalityValue = document.getElementById('criticality-value');
const resourceValue = document.getElementById('resource-value');
const sensitivityValue = document.getElementById('sensitivity-value');
const canvas = document.getElementById('precision-canvas');
const ctx = canvas.getContext('2d');
const adjustmentLog = document.getElementById('adjustment-log');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeControls();
    initializeCanvas();
    updateDisplay();
    startSimulation();
});

// Initialize control sliders
function initializeControls() {
    criticalitySlider.addEventListener('input', function() {
        taskCriticality = parseInt(this.value);
        criticalityValue.textContent = taskCriticality;
        adjustPrecision();
    });

    resourceSlider.addEventListener('input', function() {
        resourceAvailability = parseInt(this.value);
        resourceValue.textContent = resourceAvailability;
        adjustPrecision();
    });

    sensitivitySlider.addEventListener('input', function() {
        adjustmentSensitivity = parseFloat(this.value);
        sensitivityValue.textContent = adjustmentSensitivity.toFixed(1);
        adjustPrecision();
    });
}

// Initialize canvas for visualization
function initializeCanvas() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    drawVisualization();
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = 400;
}

// Calculate precision based on criticality and resources
function calculatePrecision(criticality, resources) {
    // Base precision calculation
    let precision = 50;

    // Higher criticality increases precision
    precision += criticality * 5;

    // Higher resource availability allows higher precision
    precision += resources * 2;

    // Apply sensitivity factor
    precision *= adjustmentSensitivity;

    // Clamp between 10% and 100%
    return Math.max(10, Math.min(100, Math.round(precision)));
}

// Adjust precision based on current parameters
function adjustPrecision() {
    const newPrecision = calculatePrecision(taskCriticality, resourceAvailability);
    const oldPrecision = currentPrecision;

    if (newPrecision !== oldPrecision) {
        currentPrecision = newPrecision;
        logAdjustment(oldPrecision, newPrecision);
        updateDisplay();
        drawVisualization();
    }
}

// Log precision adjustments
function logAdjustment(oldPrecision, newPrecision) {
    const timestamp = new Date().toLocaleTimeString();
    const change = newPrecision - oldPrecision;
    const direction = change > 0 ? 'increased' : 'decreased';
    const severity = Math.abs(change) > 20 ? 'warning' : 'info';

    const logEntry = {
        timestamp: timestamp,
        message: `Precision ${direction} from ${oldPrecision}% to ${newPrecision}% (${change > 0 ? '+' : ''}${change}%)`,
        severity: severity
    };

    adjustmentHistory.unshift(logEntry);
    if (adjustmentHistory.length > 10) {
        adjustmentHistory.pop();
    }

    updateLogDisplay();
}

// Update display elements
function updateDisplay() {
    currentPrecisionEl.textContent = currentPrecision + '%';

    // Update criticality display
    const criticalityLabels = ['Very Low', 'Low', 'Low-Medium', 'Medium', 'Medium-High', 'High', 'High-Very', 'Very High', 'Critical', 'Maximum'];
    taskCriticalityEl.textContent = criticalityLabels[taskCriticality - 1] || 'Unknown';

    // Update resource usage (inverse of availability)
    const resourceUsage = Math.max(0, 100 - (resourceAvailability * 10));
    resourceUsageEl.textContent = resourceUsage + '%';

    // Update last adjustment time
    lastAdjustmentEl.textContent = 'Just now';
}

// Update log display
function updateLogDisplay() {
    adjustmentLog.innerHTML = '';

    adjustmentHistory.forEach(entry => {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';

        logEntry.innerHTML = `
            <span class="log-timestamp">${entry.timestamp}</span>
            <span class="log-message">${entry.message}</span>
            <span class="log-severity ${entry.severity}">${entry.severity}</span>
        `;

        adjustmentLog.appendChild(logEntry);
    });
}

// Draw precision visualization
function drawVisualization() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw precision zones
    drawPrecisionZone(centerX, centerY, radius * 0.3, '#f87171', 'Low Precision');
    drawPrecisionZone(centerX, centerY, radius * 0.6, '#fbbf24', 'Medium Precision');
    drawPrecisionZone(centerX, centerY, radius, '#4ade80', 'High Precision');

    // Draw precision indicator
    const angle = (currentPrecision / 100) * Math.PI * 2 - Math.PI / 2;
    const indicatorRadius = (currentPrecision / 100) * radius;
    const indicatorX = centerX + Math.cos(angle) * indicatorRadius;
    const indicatorY = centerY + Math.sin(angle) * indicatorRadius;

    // Draw indicator line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(indicatorX, indicatorY);
    ctx.stroke();

    // Draw indicator dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw center point
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw precision value at center
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(currentPrecision + '%', centerX, centerY + 5);

    // Draw labels
    drawZoneLabel(centerX, centerY - radius * 0.15, 'High Precision');
    drawZoneLabel(centerX, centerY - radius * 0.45, 'Medium Precision');
    drawZoneLabel(centerX, centerY - radius * 0.75, 'Low Precision');
}

function drawPrecisionZone(centerX, centerY, radius, color, label) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Fill with low opacity
    ctx.fillStyle = color + '20';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawZoneLabel(x, y, text) {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

// Simulate dynamic adjustments
function startSimulation() {
    setInterval(() => {
        // Simulate slight variations in resource availability
        const variation = (Math.random() - 0.5) * 2;
        const newResourceValue = Math.max(1, Math.min(10, resourceAvailability + variation));

        if (newResourceValue !== resourceAvailability) {
            resourceAvailability = Math.round(newResourceValue);
            resourceSlider.value = resourceAvailability;
            resourceValue.textContent = resourceAvailability;
            adjustPrecision();
        }
    }, 5000); // Adjust every 5 seconds

    // Simulate occasional criticality changes
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every 10 seconds
            const variation = Math.floor((Math.random() - 0.5) * 4);
            const newCriticalityValue = Math.max(1, Math.min(10, taskCriticality + variation));

            if (newCriticalityValue !== taskCriticality) {
                taskCriticality = newCriticalityValue;
                criticalitySlider.value = taskCriticality;
                criticalityValue.textContent = taskCriticality;
                adjustPrecision();
            }
        }
    }, 10000); // Check every 10 seconds
}

// Initial log entries
adjustmentHistory = [
    { timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), message: 'System initialized with default precision settings', severity: 'info' },
    { timestamp: new Date(Date.now() - 240000).toLocaleTimeString(), message: 'Precision adjusted for medium criticality task', severity: 'info' },
    { timestamp: new Date(Date.now() - 180000).toLocaleTimeString(), message: 'Resource availability optimization applied', severity: 'info' },
    { timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), message: 'Sensitivity calibration completed', severity: 'info' },
    { timestamp: new Date(Date.now() - 60000).toLocaleTimeString(), message: 'Automatic precision adjustment triggered', severity: 'warning' }
];

updateLogDisplay();</content>
<parameter name="filePath">c:\Users\Gupta\Downloads\dev-card-showcase\projects\adaptive-model-precision-regulator\script.js