// Multilingual Context Calibration Engine JavaScript

// Mock data for languages
const languages = [
    { name: 'English', accuracy: 96.5, alignment: 92.1, status: 'calibrated' },
    { name: 'Spanish', accuracy: 94.2, alignment: 89.8, status: 'calibrated' },
    { name: 'French', accuracy: 93.8, alignment: 88.5, status: 'needs-calibration' },
    { name: 'German', accuracy: 95.1, alignment: 91.2, status: 'calibrated' },
    { name: 'Italian', accuracy: 92.7, alignment: 87.3, status: 'needs-calibration' },
    { name: 'Portuguese', accuracy: 94.9, alignment: 90.7, status: 'calibrated' },
    { name: 'Russian', accuracy: 91.3, alignment: 85.9, status: 'critical' },
    { name: 'Japanese', accuracy: 89.8, alignment: 83.4, status: 'critical' },
    { name: 'Chinese', accuracy: 88.5, alignment: 82.1, status: 'critical' },
    { name: 'Arabic', accuracy: 90.2, alignment: 84.7, status: 'needs-calibration' },
    { name: 'Hindi', accuracy: 93.1, alignment: 87.8, status: 'needs-calibration' },
    { name: 'Korean', accuracy: 91.8, alignment: 86.2, status: 'needs-calibration' }
];

// Calibration parameters
let calibrationParams = {
    threshold: 0.7,
    weight: 1.0,
    sensitivity: 2.5,
    updateRate: 3000
};

// Corrections log
let correctionsLog = [
    { timestamp: '2026-02-26 08:45:23', message: 'Calibrated French context threshold', severity: 'info' },
    { timestamp: '2026-02-26 08:42:15', message: 'Detected alignment drift in Russian model', severity: 'warning' },
    { timestamp: '2026-02-26 08:40:08', message: 'Updated Japanese character encoding', severity: 'info' },
    { timestamp: '2026-02-26 08:38:45', message: 'Critical: Chinese context model requires manual review', severity: 'error' },
    { timestamp: '2026-02-26 08:35:12', message: 'Auto-calibrated German language weights', severity: 'info' }
];

// DOM elements
const languageGrid = document.getElementById('language-grid');
const correctionsLogContainer = document.getElementById('corrections-log');
const overallAccuracyEl = document.getElementById('overall-accuracy');
const contextAlignmentEl = document.getElementById('context-alignment');
const languagesCountEl = document.getElementById('languages-count');
const lastCalibrationEl = document.getElementById('last-calibration');

// Canvas for visualization
const canvas = document.getElementById('data-flow-canvas');
const ctx = canvas.getContext('2d');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeControls();
    renderLanguageCards();
    renderCorrectionsLog();
    updateOverallMetrics();
    initializeVisualization();
    startRealTimeUpdates();
});

// Initialize control sliders
function initializeControls() {
    const sliders = [
        { id: 'threshold-slider', valueId: 'threshold-value', param: 'threshold' },
        { id: 'weight-slider', valueId: 'weight-value', param: 'weight' },
        { id: 'sensitivity-slider', valueId: 'sensitivity-value', param: 'sensitivity' },
        { id: 'update-rate-slider', valueId: 'update-rate-value', param: 'updateRate' }
    ];

    sliders.forEach(slider => {
        const sliderEl = document.getElementById(slider.id);
        const valueEl = document.getElementById(slider.valueId);

        sliderEl.value = calibrationParams[slider.param];
        valueEl.textContent = calibrationParams[slider.param];

        sliderEl.addEventListener('input', function() {
            calibrationParams[slider.param] = parseFloat(this.value);
            valueEl.textContent = this.value;
        });
    });

    // Button event listeners
    document.getElementById('apply-calibration').addEventListener('click', applyCalibration);
    document.getElementById('reset-calibration').addEventListener('click', resetCalibration);
    document.getElementById('auto-calibrate').addEventListener('click', autoCalibrate);
}

// Render language cards
function renderLanguageCards() {
    languageGrid.innerHTML = '';

    languages.forEach(lang => {
        const card = document.createElement('div');
        card.className = 'language-card';

        card.innerHTML = `
            <div class="language-header">
                <div class="language-name">${lang.name}</div>
                <div class="status-badge ${lang.status}">${lang.status.replace('-', ' ')}</div>
            </div>
            <div class="language-metrics">
                <div class="metric-item">
                    <div class="value">${lang.accuracy}%</div>
                    <div class="label">Accuracy</div>
                </div>
                <div class="metric-item">
                    <div class="value">${lang.alignment}%</div>
                    <div class="label">Alignment</div>
                </div>
            </div>
        `;

        languageGrid.appendChild(card);
    });
}

// Render corrections log
function renderCorrectionsLog() {
    correctionsLogContainer.innerHTML = '';

    correctionsLog.forEach(entry => {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';

        logEntry.innerHTML = `
            <div class="timestamp">${entry.timestamp}</div>
            <div class="message">${entry.message}</div>
            <div class="severity ${entry.severity}">${entry.severity}</div>
        `;

        correctionsLogContainer.appendChild(logEntry);
    });
}

// Update overall metrics
function updateOverallMetrics() {
    const avgAccuracy = languages.reduce((sum, lang) => sum + lang.accuracy, 0) / languages.length;
    const avgAlignment = languages.reduce((sum, lang) => sum + lang.alignment, 0) / languages.length;

    overallAccuracyEl.textContent = `${avgAccuracy.toFixed(1)}%`;
    contextAlignmentEl.textContent = `${avgAlignment.toFixed(1)}%`;
    languagesCountEl.textContent = languages.length;
    lastCalibrationEl.textContent = 'Just now';
}

// Initialize data flow visualization
function initializeVisualization() {
    drawDataFlow();
}

// Draw data flow visualization
function drawDataFlow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;

    // Draw central hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#4CAF50';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Context', centerX, centerY - 5);
    ctx.fillText('Engine', centerX, centerY + 10);

    // Draw language nodes
    languages.forEach((lang, index) => {
        const angle = (index / languages.length) * 2 * Math.PI;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Determine color based on status
        let color;
        switch (lang.status) {
            case 'calibrated':
                color = '#4CAF50';
                break;
            case 'needs-calibration':
                color = '#FF9800';
                break;
            case 'critical':
                color = '#F44336';
                break;
            default:
                color = '#2196F3';
        }

        // Draw connection line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw language node
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw language label
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(lang.name.substring(0, 3), x, y + 3);
    });

    // Draw data flow particles (animated)
    drawDataParticles();
}

// Draw animated data particles
function drawDataParticles() {
    const particles = [];
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            targetIndex: Math.floor(Math.random() * languages.length),
            progress: Math.random(),
            speed: 0.02 + Math.random() * 0.02
        });
    }

    particles.forEach(particle => {
        const angle = (particle.targetIndex / languages.length) * 2 * Math.PI;
        const radius = 120;
        const targetX = canvas.width / 2 + Math.cos(angle) * radius;
        const targetY = canvas.height / 2 + Math.sin(angle) * radius;

        const currentX = canvas.width / 2 + (targetX - canvas.width / 2) * particle.progress;
        const currentY = canvas.height / 2 + (targetY - canvas.height / 2) * particle.progress;

        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFF';
        ctx.fill();

        particle.progress += particle.speed;
        if (particle.progress > 1) {
            particle.progress = 0;
            particle.targetIndex = Math.floor(Math.random() * languages.length);
        }
    });
}

// Start real-time updates
function startRealTimeUpdates() {
    setInterval(() => {
        // Simulate real-time data updates
        updateLanguageData();
        updateOverallMetrics();
        drawDataFlow();

        // Occasionally add new log entries
        if (Math.random() < 0.3) {
            addRandomLogEntry();
            renderCorrectionsLog();
        }
    }, calibrationParams.updateRate);
}

// Simulate data updates
function updateLanguageData() {
    languages.forEach(lang => {
        // Small random fluctuations
        lang.accuracy += (Math.random() - 0.5) * 0.5;
        lang.alignment += (Math.random() - 0.5) * 0.5;

        // Keep within bounds
        lang.accuracy = Math.max(85, Math.min(100, lang.accuracy));
        lang.alignment = Math.max(80, Math.min(95, lang.alignment));

        // Update status based on accuracy
        if (lang.accuracy > 94) {
            lang.status = 'calibrated';
        } else if (lang.accuracy > 90) {
            lang.status = 'needs-calibration';
        } else {
            lang.status = 'critical';
        }
    });

    renderLanguageCards();
}

// Add random log entry
function addRandomLogEntry() {
    const messages = [
        'Context calibration applied to Spanish model',
        'Detected minor drift in French alignment',
        'Auto-adjusted German language weights',
        'Updated Italian context threshold',
        'Calibration completed for Portuguese',
        'Warning: Russian model needs attention',
        'Japanese encoding optimized',
        'Chinese context model updated',
        'Arabic text processing improved',
        'Hindi language patterns calibrated'
    ];

    const severities = ['info', 'warning', 'error'];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    correctionsLog.unshift({
        timestamp: timestamp,
        message: messages[Math.floor(Math.random() * messages.length)],
        severity: severity
    });

    // Keep only last 10 entries
    if (correctionsLog.length > 10) {
        correctionsLog.pop();
    }
}

// Apply calibration
function applyCalibration() {
    // Simulate calibration application
    languages.forEach(lang => {
        if (lang.status !== 'calibrated') {
            lang.accuracy += Math.random() * 2;
            lang.alignment += Math.random() * 1.5;
        }
    });

    addLogEntry('Manual calibration applied to all languages', 'info');
    updateOverallMetrics();
    renderLanguageCards();
}

// Reset calibration
function resetCalibration() {
    calibrationParams = {
        threshold: 0.7,
        weight: 1.0,
        sensitivity: 2.5,
        updateRate: 3000
    };

    // Reset slider values
    document.getElementById('threshold-slider').value = calibrationParams.threshold;
    document.getElementById('threshold-value').textContent = calibrationParams.threshold;
    document.getElementById('weight-slider').value = calibrationParams.weight;
    document.getElementById('weight-value').textContent = calibrationParams.weight;
    document.getElementById('sensitivity-slider').value = calibrationParams.sensitivity;
    document.getElementById('sensitivity-value').textContent = calibrationParams.sensitivity;
    document.getElementById('update-rate-slider').value = calibrationParams.updateRate;
    document.getElementById('update-rate-value').textContent = calibrationParams.updateRate;

    addLogEntry('Calibration parameters reset to default', 'info');
}

// Auto-calibrate
function autoCalibrate() {
    // Simulate auto-calibration
    languages.forEach(lang => {
        lang.accuracy = Math.min(100, lang.accuracy + Math.random() * 3);
        lang.alignment = Math.min(95, lang.alignment + Math.random() * 2);
    });

    addLogEntry('Auto-calibration completed for all languages', 'info');
    updateOverallMetrics();
    renderLanguageCards();
}

// Add log entry
function addLogEntry(message, severity) {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    correctionsLog.unshift({
        timestamp: timestamp,
        message: message,
        severity: severity
    });

    if (correctionsLog.length > 10) {
        correctionsLog.pop();
    }

    renderCorrectionsLog();
}

// Handle window resize for canvas
window.addEventListener('resize', function() {
    // Adjust canvas size if needed
    const container = canvas.parentElement;
    const maxWidth = Math.min(container.offsetWidth - 40, 800);
    canvas.width = maxWidth;
    canvas.height = 400;
    drawDataFlow();
});