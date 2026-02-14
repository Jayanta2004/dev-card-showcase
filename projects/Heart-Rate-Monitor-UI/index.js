// Constants and Variables
const healthTips = [
    "Regular exercise can help maintain a healthy heart rate.",
    "Stay hydrated to support cardiovascular health.",
    "Get enough sleep - aim for 7-9 hours per night.",
    "Manage stress through meditation or deep breathing.",
    "Eat a balanced diet rich in fruits and vegetables.",
    "Avoid smoking and limit alcohol consumption.",
    "Monitor your heart rate regularly for early detection.",
    "Consult a doctor if you notice persistent irregularities."
];

let heartRateData = JSON.parse(localStorage.getItem('heartRateData')) || [];
let minThreshold = parseInt(localStorage.getItem('minThreshold')) || 60;
let maxThreshold = parseInt(localStorage.getItem('maxThreshold')) || 100;
let currentTheme = localStorage.getItem('theme') || 'light';

// DOM Elements
const bpmInput = document.getElementById('bpm-input');
const activitySelect = document.getElementById('activity-select');
const logBpmBtn = document.getElementById('log-bpm');
const simulateBpmBtn = document.getElementById('simulate-bpm');
const minThresholdInput = document.getElementById('min-threshold');
const maxThresholdInput = document.getElementById('max-threshold');
const updateThresholdsBtn = document.getElementById('update-thresholds');
const currentBpmEl = document.getElementById('current-bpm');
const avgTodayEl = document.getElementById('avg-today');
const heartStatusEl = document.getElementById('heart-status');
const healthTipEl = document.getElementById('health-tip');
const readingsList = document.getElementById('readings-list');
const themeToggle = document.getElementById('theme-toggle');
const notification = document.getElementById('notification');
const alertModal = document.getElementById('alert-modal');
const alertMessage = document.getElementById('alert-message');
const closeModal = document.querySelector('.close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateThresholdInputs();
    updateStats();
    updateReadingsList();
    drawCharts();
    updateHealthTip();
    applyTheme();
    startHeartbeatAnimation();
});

// Event Listeners
logBpmBtn.addEventListener('click', logBpm);
simulateBpmBtn.addEventListener('click', simulateBpm);
updateThresholdsBtn.addEventListener('click', updateThresholds);
themeToggle.addEventListener('click', toggleTheme);
closeModal.addEventListener('click', () => alertModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === alertModal) {
        alertModal.style.display = 'none';
    }
});

// Functions
function logBpm() {
    const bpm = parseInt(bpmInput.value);
    const activity = activitySelect.value;
    
    if (!bpm || bpm < 40 || bpm > 200) {
        showNotification('Please enter a valid BPM between 40 and 200.', 'warning');
        return;
    }
    
    const reading = {
        bpm: bpm,
        activity: activity,
        timestamp: new Date().toISOString()
    };
    
    heartRateData.push(reading);
    localStorage.setItem('heartRateData', JSON.stringify(heartRateData));
    
    checkAlerts(bpm);
    updateStats();
    updateReadingsList();
    drawCharts();
    
    showNotification(`Logged ${bpm} BPM during ${activity} activity.`, 'success');
    bpmInput.value = '';
}

function simulateBpm() {
    const activities = ['resting', 'light', 'moderate', 'intense'];
    const baseRates = { resting: 60, light: 80, moderate: 120, intense: 160 };
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const variation = Math.floor(Math.random() * 20) - 10;
    const bpm = baseRates[activity] + variation;
    
    bpmInput.value = Math.max(40, Math.min(200, bpm));
    activitySelect.value = activity;
    
    showNotification('Simulated reading generated.', 'info');
}

function updateThresholds() {
    const min = parseInt(minThresholdInput.value);
    const max = parseInt(maxThresholdInput.value);
    
    if (min >= max || min < 40 || max > 200) {
        showNotification('Invalid thresholds. Min must be less than max, and both between 40-200.', 'warning');
        return;
    }
    
    minThreshold = min;
    maxThreshold = max;
    
    localStorage.setItem('minThreshold', minThreshold.toString());
    localStorage.setItem('maxThreshold', maxThreshold.toString());
    
    updateStats();
    showNotification('Thresholds updated successfully.', 'success');
}

function updateThresholdInputs() {
    minThresholdInput.value = minThreshold;
    maxThresholdInput.value = maxThreshold;
}

function checkAlerts(bpm) {
    if (bpm < minThreshold) {
        showAlert(`Low heart rate detected: ${bpm} BPM. This is below your minimum threshold of ${minThreshold}.`, 'warning');
    } else if (bpm > maxThreshold) {
        showAlert(`High heart rate detected: ${bpm} BPM. This exceeds your maximum threshold of ${maxThreshold}.`, 'danger');
    }
}

function showAlert(message, type) {
    alertMessage.textContent = message;
    alertModal.style.display = 'block';
    
    // Also show notification
    showNotification('Heart rate alert triggered!', type);
}

function updateStats() {
    if (heartRateData.length === 0) {
        currentBpmEl.textContent = '--';
        avgTodayEl.textContent = '--';
        heartStatusEl.textContent = 'No data';
        heartStatusEl.className = '';
        return;
    }
    
    // Current BPM (latest reading)
    const latestReading = heartRateData[heartRateData.length - 1];
    currentBpmEl.textContent = latestReading.bpm;
    
    // Average today
    const today = new Date().toDateString();
    const todayReadings = heartRateData.filter(reading => 
        new Date(reading.timestamp).toDateString() === today
    );
    const avgToday = todayReadings.length > 0 
        ? Math.round(todayReadings.reduce((sum, r) => sum + r.bpm, 0) / todayReadings.length)
        : '--';
    avgTodayEl.textContent = avgToday;
    
    // Status
    const status = getHeartRateStatus(latestReading.bpm);
    heartStatusEl.textContent = status.text;
    heartStatusEl.className = `status-${status.level}`;
}

function getHeartRateStatus(bpm) {
    if (bpm < minThreshold) {
        return { text: 'Low', level: 'warning' };
    } else if (bpm > maxThreshold) {
        return { text: 'High', level: 'danger' };
    } else {
        return { text: 'Normal', level: 'normal' };
    }
}

function updateReadingsList() {
    readingsList.innerHTML = '';
    
    // Show last 20 readings
    const recentReadings = heartRateData.slice(-20).reverse();
    
    recentReadings.forEach(reading => {
        const div = document.createElement('div');
        div.className = 'reading-item';
        
        const time = new Date(reading.timestamp).toLocaleString();
        const status = getHeartRateStatus(reading.bpm);
        
        div.innerHTML = `
            <div>
                <span class="reading-bpm status-${status.level}">${reading.bpm} BPM</span>
                <span class="reading-activity">${reading.activity}</span>
            </div>
            <span class="reading-time">${time}</span>
        `;
        
        readingsList.appendChild(div);
    });
}

function drawCharts() {
    drawTrendChart();
    drawActivityChart();
}

function drawTrendChart() {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    
    // Get last 24 hours of data
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentData = heartRateData.filter(reading => 
        new Date(reading.timestamp) > last24Hours
    );
    
    const labels = recentData.map(reading => 
        new Date(reading.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    );
    const data = recentData.map(reading => reading.bpm);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Heart Rate (BPM)',
                data: data,
                borderColor: 'rgba(233, 30, 99, 1)',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 40,
                    max: 200
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function drawActivityChart() {
    const ctx = document.getElementById('activity-chart').getContext('2d');
    
    const activityCounts = {
        resting: 0,
        light: 0,
        moderate: 0,
        intense: 0
    };
    
    heartRateData.forEach(reading => {
        activityCounts[reading.activity]++;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Resting', 'Light Activity', 'Moderate Exercise', 'Intense Exercise'],
            datasets: [{
                data: Object.values(activityCounts),
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(255, 87, 34, 0.8)',
                    'rgba(244, 67, 54, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateHealthTip() {
    const randomIndex = Math.floor(Math.random() * healthTips.length);
    healthTipEl.textContent = healthTips[randomIndex];
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function startHeartbeatAnimation() {
    setInterval(() => {
        currentBpmEl.classList.add('heartbeat');
        setTimeout(() => {
            currentBpmEl.classList.remove('heartbeat');
        }, 1000);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        logBpm();
    }
});

// Periodic updates
setInterval(() => {
    updateHealthTip();
}, 60000); // Change tip every minute

// Initial setup
updateHealthTip();