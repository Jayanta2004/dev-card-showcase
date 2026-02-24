// body-temperature-variability-chart.js

let temperatureReadings = JSON.parse(localStorage.getItem('bodyTemperatureData')) || [];
let temperatureChart = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
    setDefaultDateTime();
});

function initializeChart() {
    displayTemperatureReadings();
    updateStats();
    createChart();
}

function setDefaultDateTime() {
    const now = new Date();
    document.getElementById('measurementDate').value = now.toISOString().split('T')[0];
    document.getElementById('measurementTime').value = now.toTimeString().slice(0, 5);
}

function logTemperature() {
    const temperature = parseFloat(document.getElementById('temperature').value);
    const time = document.getElementById('measurementTime').value;
    const date = document.getElementById('measurementDate').value;
    const method = document.getElementById('measurementMethod').value;
    const notes = document.getElementById('notes').value.trim();

    if (!temperature || !time || !date) {
        alert('Please enter temperature, time, and date.');
        return;
    }

    if (temperature < 95 || temperature > 105) {
        alert('Please enter a realistic temperature between 95°F and 105°F.');
        return;
    }

    const reading = {
        id: Date.now(),
        temperature: temperature,
        time: time,
        date: date,
        method: method,
        notes: notes,
        timestamp: new Date(`${date}T${time}`).getTime()
    };

    temperatureReadings.unshift(reading); // Add to beginning
    saveTemperatureReadings();
    displayTemperatureReadings();
    updateStats();
    updateChart();

    // Clear form
    document.getElementById('temperature').value = '';
    document.getElementById('notes').value = '';
    setDefaultDateTime();

    showNotification('Temperature reading logged successfully!', 'success');
}

function saveTemperatureReadings() {
    localStorage.setItem('bodyTemperatureData', JSON.stringify(temperatureReadings));
}

function displayTemperatureReadings() {
    const historyDiv = document.getElementById('temperatureHistory');
    historyDiv.innerHTML = '';

    if (temperatureReadings.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No temperature readings logged yet. Start by logging your first reading above!</p>';
        return;
    }

    temperatureReadings.slice(0, 20).forEach(reading => { // Show last 20 readings
        const readingDiv = document.createElement('div');
        readingDiv.className = 'temp-item';

        const dateTime = new Date(reading.timestamp);
        const timeString = dateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        const dateString = dateTime.toLocaleDateString();

        readingDiv.innerHTML = `
            <h4>${dateString} at ${timeString}</h4>
            <div class="temp-reading">
                <span class="temp-value">${reading.temperature}°F</span>
                <span class="temp-method">${reading.method}</span>
            </div>
            ${reading.notes ? `<div class="temp-notes">"${reading.notes}"</div>` : ''}
        `;

        historyDiv.appendChild(readingDiv);
    });
}

function updateStats() {
    if (temperatureReadings.length === 0) {
        document.getElementById('currentTemp').textContent = '--';
        document.getElementById('dailyAvg').textContent = '--';
        document.getElementById('tempRange').textContent = '--';
        document.getElementById('readingsToday').textContent = '0';
        return;
    }

    // Current temperature (most recent)
    const currentTemp = temperatureReadings[0].temperature.toFixed(1);
    document.getElementById('currentTemp').textContent = `${currentTemp}°F`;

    // Today's readings
    const today = new Date().toDateString();
    const todaysReadings = temperatureReadings.filter(r =>
        new Date(r.timestamp).toDateString() === today
    );

    document.getElementById('readingsToday').textContent = todaysReadings.length;

    if (todaysReadings.length > 0) {
        // Daily average
        const sum = todaysReadings.reduce((acc, r) => acc + r.temperature, 0);
        const avg = (sum / todaysReadings.length).toFixed(1);
        document.getElementById('dailyAvg').textContent = `${avg}°F`;

        // Temperature range
        const temps = todaysReadings.map(r => r.temperature);
        const min = Math.min(...temps).toFixed(1);
        const max = Math.max(...temps).toFixed(1);
        document.getElementById('tempRange').textContent = `${min}°-${max}°F`;
    } else {
        document.getElementById('dailyAvg').textContent = '--';
        document.getElementById('tempRange').textContent = '--';
    }
}

function createChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');

    updateChartData();
}

function updateChart() {
    if (!temperatureChart) {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Body Temperature (°F)',
                    data: [],
                    borderColor: '#4fd1ff',
                    backgroundColor: 'rgba(79, 209, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 96,
                        suggestedMax: 100,
                        ticks: {
                            stepSize: 0.5,
                            callback: function(value) {
                                return value + '°F';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '°F';
                            }
                        }
                    }
                }
            }
        });
    }

    updateChartData();
}

function updateChartData() {
    if (!temperatureChart) return;

    const view = document.getElementById('chartView').value;
    let filteredReadings = [];
    let labels = [];

    const now = new Date();

    if (view === 'daily') {
        // Today's readings
        const today = now.toDateString();
        filteredReadings = temperatureReadings.filter(r =>
            new Date(r.timestamp).toDateString() === today
        ).reverse(); // Reverse to show chronological order
        labels = filteredReadings.map(r => r.time);
    } else if (view === 'weekly') {
        // Last 7 days
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredReadings = temperatureReadings.filter(r =>
            new Date(r.timestamp) >= sevenDaysAgo
        ).reverse();
        labels = filteredReadings.map(r => {
            const date = new Date(r.timestamp);
            return date.toLocaleDateString([], {month: 'short', day: 'numeric'}) + ' ' + r.time;
        });
    } else if (view === 'monthly') {
        // Last 30 days
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredReadings = temperatureReadings.filter(r =>
            new Date(r.timestamp) >= thirtyDaysAgo
        ).reverse();
        labels = filteredReadings.map(r => {
            const date = new Date(r.timestamp);
            return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
        });
    }

    const data = filteredReadings.map(r => r.temperature);

    temperatureChart.data.labels = labels;
    temperatureChart.data.datasets[0].data = data;
    temperatureChart.update();
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);