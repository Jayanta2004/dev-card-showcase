// thermoregulation-stability-monitor.js

let temperatureReadings = JSON.parse(localStorage.getItem('thermoregulationReadings')) || [];

function logTemperature() {
    const measurementTime = document.getElementById('measurementTime').value;
    const temperature = parseFloat(document.getElementById('temperature').value);
    const measurementMethod = document.getElementById('measurementMethod').value;
    const activityLevel = document.getElementById('activityLevel').value;
    const environmentalTemp = parseFloat(document.getElementById('environmentalTemp').value);
    const symptoms = document.getElementById('symptoms').value.trim();

    if (!temperature || temperature < 95 || temperature > 105) {
        alert('Please enter a valid temperature between 95°F and 105°F');
        return;
    }

    const reading = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        measurementTime: measurementTime,
        temperature: temperature,
        measurementMethod: measurementMethod,
        activityLevel: activityLevel,
        environmentalTemp: environmentalTemp || null,
        symptoms: symptoms
    };

    temperatureReadings.push(reading);
    saveReadings();

    // Clear form
    document.getElementById('temperature').value = '';
    document.getElementById('environmentalTemp').value = '';
    document.getElementById('symptoms').value = '';

    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
}

function saveReadings() {
    localStorage.setItem('thermoregulationReadings', JSON.stringify(temperatureReadings));
}

function updateStats() {
    if (temperatureReadings.length === 0) {
        document.getElementById('stabilityIndex').textContent = '0';
        document.getElementById('avgTemperature').textContent = '0°F';
        document.getElementById('tempRange').textContent = '0°F';
        document.getElementById('todayReadings').textContent = '0';
        return;
    }

    // Calculate stability index (lower variation = higher stability)
    const temps = temperatureReadings.map(r => r.temperature);
    const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
    const variance = temps.reduce((sum, temp) => sum + Math.pow(temp - mean, 2), 0) / temps.length;
    const stdDev = Math.sqrt(variance);
    const stabilityIndex = Math.max(0, Math.min(100, 100 - (stdDev * 10))); // Convert to 0-100 scale

    document.getElementById('stabilityIndex').textContent = Math.round(stabilityIndex);

    // Average temperature
    document.getElementById('avgTemperature').textContent = `${mean.toFixed(1)}°F`;

    // Temperature range
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    document.getElementById('tempRange').textContent = `${(maxTemp - minTemp).toFixed(1)}°F`;

    // Today's readings
    const today = new Date().toDateString();
    const todayReadings = temperatureReadings.filter(reading =>
        new Date(reading.timestamp).toDateString() === today
    ).length;
    document.getElementById('todayReadings').textContent = todayReadings;
}

function updateCharts() {
    updateTemperatureChart();
    updateRangeChart();
}

function updateTemperatureChart() {
    const sortedReadings = temperatureReadings.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedReadings.map(reading => new Date(reading.timestamp));
    const temperatures = sortedReadings.map(reading => reading.temperature);

    const ctx = document.getElementById('temperatureChart').getContext('2d');
    if (window.temperatureChart) {
        window.temperatureChart.destroy();
    }

    window.temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Body Temperature (°F)',
                data: temperatures,
                borderColor: '#FF5722',
                backgroundColor: 'rgba(255, 87, 34, 0.1)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd'
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    suggestedMin: 96,
                    suggestedMax: 102
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(1)}°F`
                    }
                }
            }
        }
    });
}

function updateRangeChart() {
    // Group readings by day and calculate daily ranges
    const dailyRanges = {};
    temperatureReadings.forEach(reading => {
        const date = new Date(reading.timestamp).toDateString();
        if (!dailyRanges[date]) {
            dailyRanges[date] = [];
        }
        dailyRanges[date].push(reading.temperature);
    });

    const dates = Object.keys(dailyRanges).sort();
    const ranges = dates.map(date => {
        const temps = dailyRanges[date];
        return Math.max(...temps) - Math.min(...temps);
    });

    const ctx = document.getElementById('rangeChart').getContext('2d');
    if (window.rangeChart) {
        window.rangeChart.destroy();
    }

    window.rangeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates.map(d => new Date(d).toLocaleDateString()),
            datasets: [{
                label: 'Daily Temperature Range (°F)',
                data: ranges,
                backgroundColor: 'rgba(255, 87, 34, 0.6)',
                borderColor: '#FF5722',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(1)}°F range`
                    }
                }
            }
        }
    });
}

function updateInsights() {
    // Stability trend
    if (temperatureReadings.length < 7) {
        document.getElementById('stabilityTrend').textContent = 'Need at least 7 readings for trend analysis';
    } else {
        const recent = temperatureReadings.slice(-7);
        const earlier = temperatureReadings.slice(-14, -7);

        if (earlier.length > 0) {
            const recentAvg = recent.reduce((sum, r) => sum + r.temperature, 0) / recent.length;
            const earlierAvg = earlier.reduce((sum, r) => sum + r.temperature, 0) / earlier.length;
            const change = recentAvg - earlierAvg;

            if (Math.abs(change) < 0.2) {
                document.getElementById('stabilityTrend').textContent = 'Temperature stable (±0.2°F from previous week)';
            } else if (change > 0) {
                document.getElementById('stabilityTrend').textContent = `Temperature trending up (+${change.toFixed(1)}°F from previous week)`;
            } else {
                document.getElementById('stabilityTrend').textContent = `Temperature trending down (${change.toFixed(1)}°F from previous week)`;
            }
        } else {
            document.getElementById('stabilityTrend').textContent = 'Recent readings show consistent patterns';
        }
    }

    // Temperature patterns
    const timePatterns = {};
    temperatureReadings.forEach(reading => {
        if (!timePatterns[reading.measurementTime]) {
            timePatterns[reading.measurementTime] = [];
        }
        timePatterns[reading.measurementTime].push(reading.temperature);
    });

    let patternsText = '';
    Object.keys(timePatterns).forEach(time => {
        const temps = timePatterns[time];
        const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
        patternsText += `${formatTime(time)}: ${avg.toFixed(1)}°F avg (${temps.length} readings)<br>`;
    });

    document.getElementById('tempPatterns').innerHTML = patternsText || 'No pattern data available';

    // Health alerts
    let alerts = [];
    const latestReading = temperatureReadings[temperatureReadings.length - 1];

    if (latestReading) {
        if (latestReading.temperature >= 100.4) {
            alerts.push('⚠️ Fever detected (>100.4°F)');
        } else if (latestReading.temperature <= 96.8) {
            alerts.push('⚠️ Low temperature detected (<96.8°F)');
        }

        // Check for sudden changes
        if (temperatureReadings.length >= 2) {
            const prevReading = temperatureReadings[temperatureReadings.length - 2];
            const change = Math.abs(latestReading.temperature - prevReading.temperature);
            if (change >= 2) {
                alerts.push(`⚠️ Sudden temperature change (${change.toFixed(1)}°F)`);
            }
        }

        // Check for environmental factors
        if (latestReading.environmentalTemp) {
            const tempDiff = Math.abs(latestReading.temperature - 98.6);
            const envDiff = Math.abs(latestReading.environmentalTemp - 72);
            if (tempDiff > 1 && envDiff > 10) {
                alerts.push('ℹ️ Consider environmental temperature effects');
            }
        }
    }

    document.getElementById('healthAlerts').innerHTML = alerts.length > 0 ? alerts.join('<br>') : 'No health alerts';
}

function formatTime(time) {
    const formats = {
        'morning': 'Morning',
        'afternoon': 'Afternoon',
        'evening': 'Evening',
        'night': 'Night'
    };
    return formats[time] || time;
}

function displayHistory(filter = 'all') {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    let filteredReadings = temperatureReadings;

    if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredReadings = temperatureReadings.filter(reading => new Date(reading.timestamp) >= oneWeekAgo);
    } else if (filter === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredReadings = temperatureReadings.filter(reading => new Date(reading.timestamp) >= oneMonthAgo);
    }

    // Sort by most recent first
    filteredReadings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historyDiv = document.getElementById('temperatureHistory');
    historyDiv.innerHTML = '';

    if (filteredReadings.length === 0) {
        historyDiv.innerHTML = '<p style="text-align: center; color: #666;">No readings found</p>';
        return;
    }

    filteredReadings.forEach(reading => {
        const entry = document.createElement('div');
        entry.className = 'temperature-entry';

        const date = new Date(reading.timestamp).toLocaleDateString();
        const time = new Date(reading.timestamp).toLocaleTimeString();
        const tempClass = reading.temperature >= 100.4 ? 'fever' :
                         reading.temperature >= 99.5 ? 'elevated' :
                         reading.temperature <= 96.8 ? 'low' : 'normal';

        entry.innerHTML = `
            <h4>
                ${date} ${time} - ${formatTime(reading.measurementTime)}
                <span class="temp-badge ${tempClass}">${reading.temperature.toFixed(1)}°F</span>
                <button class="delete-btn" onclick="deleteReading(${reading.id})">×</button>
            </h4>
            <div class="temp-details">
                <div class="detail-item">Method: ${reading.measurementMethod}</div>
                <div class="detail-item">Activity: ${reading.activityLevel.replace('-', ' ')}</div>
                ${reading.environmentalTemp ? `<div class="detail-item">Environment: ${reading.environmentalTemp}°F</div>` : ''}
            </div>
            ${reading.symptoms ? `<p><strong>Symptoms/Notes:</strong> ${reading.symptoms}</p>` : ''}
        `;

        historyDiv.appendChild(entry);
    });
}

function filterHistory(filter) {
    displayHistory(filter);
}

function deleteReading(id) {
    if (confirm('Are you sure you want to delete this temperature reading?')) {
        temperatureReadings = temperatureReadings.filter(reading => reading.id !== id);
        saveReadings();
        updateStats();
        updateCharts();
        updateInsights();
        displayHistory();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();
});