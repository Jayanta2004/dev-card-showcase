// heat-recovery-speed-monitor.js

let currentSession = null;
let temperatureReadings = [];
let sessions = JSON.parse(localStorage.getItem('heatRecoverySessions')) || [];
let timerInterval = null;
let startTime = null;

function startMonitoring() {
    const duration = parseInt(document.getElementById('exposureDuration').value);
    const intensity = document.getElementById('exposureIntensity').value;

    if (!duration || duration < 1) {
        alert('Please enter a valid exposure duration.');
        return;
    }

    startTime = new Date();
    currentSession = {
        id: Date.now(),
        exposureDuration: duration,
        intensity: intensity,
        startTime: startTime.toISOString(),
        readings: [],
        endTime: null
    };

    temperatureReadings = [];

    document.getElementById('startBtn').disabled = true;
    document.getElementById('logBtn').disabled = false;

    timerInterval = setInterval(updateTimer, 1000);

    // Initialize chart
    initChart();
}

function updateTimer() {
    if (!startTime) return;

    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    document.getElementById('elapsedTime').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function logTemperature() {
    const temp = parseFloat(document.getElementById('currentTemp').value);

    if (isNaN(temp) || temp < 30 || temp > 45) {
        alert('Please enter a valid temperature between 30°C and 45°C.');
        return;
    }

    const now = new Date();
    const elapsed = (now - startTime) / 1000 / 60; // minutes

    const reading = {
        time: elapsed,
        temperature: temp,
        timestamp: now.toISOString()
    };

    temperatureReadings.push(reading);
    currentSession.readings.push(reading);

    updateChart();
    calculateRecoveryRate();

    // Clear input
    document.getElementById('currentTemp').value = '';
}

function calculateRecoveryRate() {
    if (temperatureReadings.length < 2) {
        document.getElementById('recoveryRate').textContent = '-- °C/min';
        document.getElementById('recoveryStatus').textContent = 'Log more temperature readings to calculate recovery rate.';
        return;
    }

    // Simple linear regression for cooling rate
    const n = temperatureReadings.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    temperatureReadings.forEach(reading => {
        sumX += reading.time;
        sumY += reading.temperature;
        sumXY += reading.time * reading.temperature;
        sumXX += reading.time * reading.time;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const rate = Math.abs(slope); // cooling rate is positive

    document.getElementById('recoveryRate').textContent = `${rate.toFixed(3)} °C/min`;

    let status = '';
    if (rate > 0.1) {
        status = 'Fast recovery: Good cooling rate.';
    } else if (rate > 0.05) {
        status = 'Moderate recovery: Monitor closely.';
    } else {
        status = 'Slow recovery: Consider cooling measures.';
    }

    document.getElementById('recoveryStatus').textContent = status;
}

function initChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    window.temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Body Temperature (°C)',
                data: [],
                borderColor: '#ff5722',
                backgroundColor: 'rgba(255, 87, 34, 0.1)',
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Time (minutes)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    },
                    min: 30,
                    max: 45
                }
            }
        }
    });
}

function updateChart() {
    if (!window.temperatureChart) return;

    window.temperatureChart.data.datasets[0].data = temperatureReadings.map(r => ({ x: r.time, y: r.temperature }));
    window.temperatureChart.update();
}

function endSession() {
    if (!currentSession) return;

    currentSession.endTime = new Date().toISOString();
    sessions.unshift(currentSession);
    if (sessions.length > 10) sessions = sessions.slice(0, 10);

    localStorage.setItem('heatRecoverySessions', JSON.stringify(sessions));

    displayHistory();

    // Reset
    currentSession = null;
    temperatureReadings = [];
    clearInterval(timerInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('logBtn').disabled = true;
    document.getElementById('elapsedTime').textContent = '00:00:00';
    document.getElementById('recoveryRate').textContent = '-- °C/min';
    document.getElementById('recoveryStatus').textContent = 'Session ended. Start a new session to monitor recovery.';
}

function displayHistory() {
    const historyDiv = document.getElementById('sessionsHistory');
    if (sessions.length === 0) {
        historyDiv.innerHTML = '<p>No sessions yet.</p>';
        return;
    }

    let historyHTML = '';
    sessions.forEach(session => {
        const date = new Date(session.startTime).toLocaleDateString();
        const avgRate = session.readings.length >= 2 ? calculateSessionRate(session.readings) : 'N/A';
        historyHTML += `
            <div class="session-item">
                <h4>${date} - ${session.intensity} intensity</h4>
                <p><strong>Exposure:</strong> ${session.exposureDuration} min</p>
                <p><strong>Readings:</strong> ${session.readings.length}</p>
                <p><strong>Avg Recovery Rate:</strong> ${avgRate}</p>
            </div>
        `;
    });

    historyDiv.innerHTML = historyHTML;
}

function calculateSessionRate(readings) {
    if (readings.length < 2) return 'N/A';

    const n = readings.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    readings.forEach(r => {
        sumX += r.time;
        sumY += r.temperature;
        sumXY += r.time * r.temperature;
        sumXX += r.time * r.time;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return Math.abs(slope).toFixed(3) + ' °C/min';
}

// Load history on page load
document.addEventListener('DOMContentLoaded', function() {
    displayHistory();
    initChart();
});

// Add end session button or auto-end after some time? For now, manual end.
document.addEventListener('DOMContentLoaded', function() {
    const monitoringSection = document.querySelector('.monitoring-section');
    const endBtn = document.createElement('button');
    endBtn.textContent = 'End Session';
    endBtn.className = 'log-btn';
    endBtn.onclick = endSession;
    endBtn.style.background = '#f44336';
    endBtn.style.marginTop = '10px';
    monitoringSection.appendChild(endBtn);
});