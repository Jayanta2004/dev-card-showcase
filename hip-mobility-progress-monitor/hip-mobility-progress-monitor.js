// hip-mobility-progress-monitor.js

let measurements = JSON.parse(localStorage.getItem('hipMobilityMeasurements')) || [];
let chart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('measurementDate').valueAsDate = new Date();

    // Load and display data
    updateDisplay();
    renderChart();
});

function logMeasurement() {
    const angle = parseFloat(document.getElementById('hipAngle').value);
    const date = document.getElementById('measurementDate').value;
    const notes = document.getElementById('notes').value.trim();

    if (!angle || angle < 0 || angle > 180) {
        alert('Please enter a valid hip angle between 0 and 180 degrees.');
        return;
    }

    if (!date) {
        alert('Please select a date for the measurement.');
        return;
    }

    const measurement = {
        id: Date.now(),
        angle: angle,
        date: date,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    measurements.push(measurement);
    measurements.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Save to localStorage
    localStorage.setItem('hipMobilityMeasurements', JSON.stringify(measurements));

    // Clear form
    document.getElementById('hipAngle').value = '';
    document.getElementById('notes').value = '';

    // Update display
    updateDisplay();
    renderChart();

    // Show success message
    alert('Measurement logged successfully!');
}

function updateDisplay() {
    // Update stats
    if (measurements.length > 0) {
        const latest = measurements[measurements.length - 1];
        document.getElementById('currentAngle').textContent = `${latest.angle}°`;

        const average = measurements.reduce((sum, m) => sum + m.angle, 0) / measurements.length;
        document.getElementById('averageAngle').textContent = `${average.toFixed(1)}°`;

        const first = measurements[0];
        const improvement = latest.angle - first.angle;
        document.getElementById('improvement').textContent = `${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}°`;

        document.getElementById('measurements').textContent = measurements.length;
    } else {
        document.getElementById('currentAngle').textContent = '0°';
        document.getElementById('averageAngle').textContent = '0°';
        document.getElementById('improvement').textContent = '0°';
        document.getElementById('measurements').textContent = '0';
    }

    // Update history
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (measurements.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No measurements logged yet. Start tracking your hip mobility!</p>';
        return;
    }

    measurements.slice().reverse().forEach(measurement => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const date = new Date(measurement.date).toLocaleDateString();
        const time = new Date(measurement.timestamp).toLocaleTimeString();

        item.innerHTML = `
            <div>
                <div class="history-date">${date} ${time}</div>
                <div class="history-angle">${measurement.angle}°</div>
                ${measurement.notes ? `<div class="history-notes">${measurement.notes}</div>` : ''}
            </div>
            <button class="delete-btn" onclick="deleteMeasurement(${measurement.id})">Delete</button>
        `;

        historyList.appendChild(item);
    });
}

function deleteMeasurement(id) {
    if (confirm('Are you sure you want to delete this measurement?')) {
        measurements = measurements.filter(m => m.id !== id);
        localStorage.setItem('hipMobilityMeasurements', JSON.stringify(measurements));
        updateDisplay();
        renderChart();
    }
}

function renderChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    if (measurements.length === 0) {
        return;
    }

    // Group by month for monthly comparison
    const monthlyData = {};
    measurements.forEach(m => {
        const date = new Date(m.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { angles: [], dates: [] };
        }
        monthlyData[monthKey].angles.push(m.angle);
        monthlyData[monthKey].dates.push(date);
    });

    // Calculate monthly averages
    const labels = [];
    const data = [];

    Object.keys(monthlyData).sort().forEach(month => {
        const monthData = monthlyData[month];
        const avgAngle = monthData.angles.reduce((sum, a) => sum + a, 0) / monthData.angles.length;
        const monthName = new Date(monthData.dates[0]).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        labels.push(monthName);
        data.push(avgAngle.toFixed(1));
    });

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Hip Mobility (degrees)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4fd1ff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#fff'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Average: ${context.parsed.y}°`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: Math.max(0, Math.min(...data) - 10),
                    max: Math.max(...data) + 10,
                    ticks: {
                        color: '#fff',
                        callback: function(value) {
                            return value + '°';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Export data functionality (optional)
function exportData() {
    const dataStr = JSON.stringify(measurements, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'hip-mobility-data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Make export function available globally if needed
window.exportData = exportData;