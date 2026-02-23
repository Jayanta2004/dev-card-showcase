// micro-movement-frequency-tracker.js

let trackingResults = JSON.parse(localStorage.getItem('microMovementResults')) || [];
let currentSession = null;
let trackingInterval = null;
let movementCount = 0;
let lastPosition = null;
let startTime = null;
let trackingDuration = 0;

function startTracking() {
    trackingDuration = parseInt(document.getElementById('trackingDuration').value) * 60 * 1000; // Convert to milliseconds
    startTime = Date.now();
    movementCount = 0;
    lastPosition = null;

    currentSession = {
        id: Date.now(),
        startTime: new Date().toISOString(),
        duration: trackingDuration / 1000 / 60, // minutes
        movements: 0,
        frequency: 0,
        endTime: null
    };

    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('trackingSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';

    document.getElementById('movementCount').textContent = '0';
    document.getElementById('movementFrequency').textContent = '0';

    const trackingArea = document.getElementById('trackingArea');
    trackingArea.addEventListener('mousemove', trackMovement);

    trackingInterval = setInterval(updateProgress, 1000);
    setTimeout(stopTracking, trackingDuration);
}

function trackMovement(event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const cursorTracker = document.getElementById('cursorTracker');
    cursorTracker.style.left = `${x - 5}px`;
    cursorTracker.style.top = `${y - 5}px`;

    if (lastPosition) {
        const distance = Math.sqrt(Math.pow(x - lastPosition.x, 2) + Math.pow(y - lastPosition.y, 2));
        if (distance > 10) { // Threshold for micro-movement
            movementCount++;
            document.getElementById('movementCount').textContent = movementCount;
            updateFrequency();
        }
    }

    lastPosition = { x, y };
}

function updateFrequency() {
    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const frequency = movementCount / elapsedMinutes;
    document.getElementById('movementFrequency').textContent = frequency.toFixed(1);
}

function updateProgress() {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed / trackingDuration) * 100;
    document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
}

function stopTracking() {
    clearInterval(trackingInterval);

    const trackingArea = document.getElementById('trackingArea');
    trackingArea.removeEventListener('mousemove', trackMovement);

    const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
    const frequency = movementCount / elapsedMinutes;

    currentSession.movements = movementCount;
    currentSession.frequency = frequency;
    currentSession.endTime = new Date().toISOString();

    document.getElementById('trackingSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';

    document.getElementById('totalMovements').textContent = movementCount;
    document.getElementById('avgFrequency').textContent = frequency.toFixed(1) + '/min';
    document.getElementById('sessionDuration').textContent = elapsedMinutes.toFixed(1) + ' min';
}

function saveResult() {
    if (currentSession) {
        trackingResults.push(currentSession);
        localStorage.setItem('microMovementResults', JSON.stringify(trackingResults));
        currentSession = null;
        updateHistory();
        updateChart();
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('setupSection').style.display = 'block';
    }
}

function updateHistory() {
    const historyDiv = document.getElementById('sessionHistory');
    historyDiv.innerHTML = '';

    trackingResults.slice(-5).reverse().forEach(result => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <strong>${new Date(result.startTime).toLocaleDateString()}</strong><br>
            Duration: ${result.duration} min<br>
            Movements: ${result.movements}<br>
            Frequency: ${result.frequency.toFixed(1)}/min
        `;
        historyDiv.appendChild(item);
    });
}

function updateChart() {
    const ctx = document.getElementById('frequencyChart').getContext('2d');

    const data = trackingResults.map(result => ({
        x: new Date(result.startTime),
        y: result.frequency
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Movement Frequency (per minute)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHistory();
    updateChart();
});