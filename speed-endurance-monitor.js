// speed-endurance-monitor.js

let currentIntervals = [];
let sessionHistory = JSON.parse(localStorage.getItem('speedEnduranceHistory')) || [];

function addInterval() {
    const time = parseFloat(document.getElementById('intervalTime').value);
    const speed = parseFloat(document.getElementById('intervalSpeed').value);

    if (isNaN(time) || isNaN(speed) || time <= 0 || speed <= 0) {
        alert('Please enter valid positive numbers for time and speed.');
        return;
    }

    currentIntervals.push({ time, speed });
    updateIntervalsList();

    // Clear inputs
    document.getElementById('intervalTime').value = '';
    document.getElementById('intervalSpeed').value = '';
}

function updateIntervalsList() {
    const list = document.getElementById('intervalsList');
    list.innerHTML = '';

    currentIntervals.forEach((interval, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            Interval ${index + 1}: ${interval.time}s at ${interval.speed} km/h
            <button class="delete-btn" onclick="deleteInterval(${index})">Delete</button>
        `;
        list.appendChild(li);
    });
}

function deleteInterval(index) {
    currentIntervals.splice(index, 1);
    updateIntervalsList();
}

function calculateEndurance() {
    if (currentIntervals.length < 2) {
        alert('Please add at least 2 intervals to calculate endurance.');
        return;
    }

    // Sort intervals by time (cumulative)
    let cumulativeTime = 0;
    const chartData = currentIntervals.map(interval => {
        cumulativeTime += interval.time;
        return { time: cumulativeTime, speed: interval.speed };
    });

    // Calculate metrics
    const totalTime = cumulativeTime / 3600; // hours
    const totalDistance = currentIntervals.reduce((sum, interval) => sum + (interval.speed * interval.time / 3600), 0);
    const averageSpeed = totalDistance / totalTime;

    // Calculate decline rate (linear regression slope)
    const n = chartData.length;
    const sumX = chartData.reduce((sum, point, i) => sum + i, 0);
    const sumY = chartData.reduce((sum, point) => sum + point.speed, 0);
    const sumXY = chartData.reduce((sum, point, i) => sum + i * point.speed, 0);
    const sumXX = chartData.reduce((sum, point, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const declineRate = slope < 0 ? Math.abs(slope) / chartData[0].speed * 100 : 0;

    // Display results
    document.getElementById('totalDistance').textContent = totalDistance.toFixed(2) + ' km';
    document.getElementById('averageSpeed').textContent = averageSpeed.toFixed(2) + ' km/h';
    document.getElementById('declineRate').textContent = declineRate.toFixed(2) + '%';

    document.getElementById('results').style.display = 'block';

    // Create chart
    const ctx = document.getElementById('enduranceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(point => point.time + 's'),
            datasets: [{
                label: 'Speed (km/h)',
                data: chartData.map(point => point.speed),
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Speed Endurance Curve'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Speed (km/h)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Cumulative Time (seconds)'
                    }
                }
            }
        }
    });

    // Save session
    const session = {
        date: new Date().toISOString(),
        intervals: currentIntervals,
        totalDistance,
        averageSpeed,
        declineRate
    };
    sessionHistory.push(session);
    localStorage.setItem('speedEnduranceHistory', JSON.stringify(sessionHistory));

    updateHistoryList();

    // Reset current intervals
    currentIntervals = [];
    updateIntervalsList();
}

function updateHistoryList() {
    const historyDiv = document.getElementById('historyList');
    historyDiv.innerHTML = '';

    sessionHistory.slice(-5).reverse().forEach((session, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            ${new Date(session.date).toLocaleDateString()}<br>
            ${session.intervals.length} intervals<br>
            Avg: ${session.averageSpeed.toFixed(1)} km/h
        `;
        item.onclick = () => loadSession(session);
        historyDiv.appendChild(item);
    });
}

function loadSession(session) {
    currentIntervals = session.intervals;
    updateIntervalsList();
    calculateEndurance();
}

// Load history on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHistoryList();
});