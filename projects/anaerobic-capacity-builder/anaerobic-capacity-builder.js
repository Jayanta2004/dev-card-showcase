// anaerobic-capacity-builder.js

let sessionEntries = JSON.parse(localStorage.getItem('anaerobicCapacityEntries')) || [];

function logSession() {
    const date = document.getElementById('sessionDate').value;
    const distance = parseFloat(document.getElementById('sprintDistance').value);
    const sprintTime = parseFloat(document.getElementById('sprintTime').value);
    const restTime = parseFloat(document.getElementById('restTime').value);
    const reps = parseInt(document.getElementById('reps').value);
    const notes = document.getElementById('sessionNotes').value.trim();

    if (!date || isNaN(distance) || isNaN(sprintTime) || isNaN(restTime) || isNaN(reps) ||
        distance <= 0 || sprintTime <= 0 || restTime < 0 || reps <= 0) {
        alert('Please fill in all fields with valid values.');
        return;
    }

    // Check if entry already exists for this date
    const existingEntry = sessionEntries.find(entry => entry.date === date);
    if (existingEntry) {
        if (!confirm('An entry already exists for this date. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        sessionEntries = sessionEntries.filter(entry => entry.date !== date);
    }

    // Calculate capacity score
    // Score = (average speed) * (total work factor)
    // Average speed = total distance / total sprint time
    // Work factor = reps / (reps + rest penalty)
    // Rest penalty = (rest time / sprint time) * 0.5 (to moderate the impact)
    const totalSprintTime = sprintTime * reps;
    const totalRestTime = restTime * (reps - 1);
    const totalTime = totalSprintTime + totalRestTime;
    const totalDistance = distance * reps;

    const averageSpeed = totalDistance / totalSprintTime; // meters per second
    const restPenalty = (totalRestTime / totalSprintTime) * 0.3; // moderate penalty
    const workFactor = reps / (reps + restPenalty);

    const capacityScore = (averageSpeed * workFactor).toFixed(2);

    const entry = {
        id: Date.now(),
        date,
        distance,
        sprintTime,
        restTime,
        reps,
        capacityScore: parseFloat(capacityScore),
        notes
    };

    sessionEntries.push(entry);

    // Sort by date
    sessionEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (sessionEntries.length > 50) {
        sessionEntries = sessionEntries.slice(-50);
    }

    localStorage.setItem('anaerobicCapacityEntries', JSON.stringify(sessionEntries));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('sprintDistance').value = '';
    document.getElementById('sprintTime').value = '';
    document.getElementById('restTime').value = '';
    document.getElementById('reps').value = 8;
    document.getElementById('sessionNotes').value = '';

    updateStats();
    updateChart();
    updateSessionList();
}

function updateStats() {
    const totalSessions = sessionEntries.length;

    if (totalSessions === 0) {
        document.getElementById('currentScore').textContent = '0.00';
        document.getElementById('bestTime').textContent = '0.0s';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    // Current capacity score (average of last 3 sessions)
    const recentSessions = sessionEntries.slice(-3);
    const currentScore = (recentSessions.reduce((sum, entry) => sum + entry.capacityScore, 0) / recentSessions.length).toFixed(2);

    // Best sprint time
    const bestTime = Math.min(...sessionEntries.map(entry => entry.sprintTime)).toFixed(1);

    document.getElementById('currentScore').textContent = currentScore;
    document.getElementById('bestTime').textContent = `${bestTime}s`;
    document.getElementById('totalSessions').textContent = totalSessions;
}

function updateChart() {
    const ctx = document.getElementById('capacityChart').getContext('2d');

    // Prepare data for last 20 sessions
    const chartEntries = sessionEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });
    const scores = chartEntries.map(entry => entry.capacityScore);
    const speeds = chartEntries.map(entry => (entry.distance * entry.reps) / (entry.sprintTime * entry.reps)); // average speed

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Capacity Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Average Speed (m/s)',
                data: speeds,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Capacity Score'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Speed (m/s)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

function updateSessionList() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = sessionEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'session-entry';

        const speed = ((entry.distance * entry.reps) / (entry.sprintTime * entry.reps)).toFixed(2);

        entryDiv.innerHTML = `
            <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
            <div class="metrics">
                <div class="metric">
                    <div class="label">Distance</div>
                    <div class="value">${entry.distance}m × ${entry.reps}</div>
                </div>
                <div class="metric">
                    <div class="label">Sprint Time</div>
                    <div class="value">${entry.sprintTime}s</div>
                </div>
                <div class="metric">
                    <div class="label">Rest</div>
                    <div class="value">${entry.restTime}s</div>
                </div>
                <div class="metric">
                    <div class="label">Avg Speed</div>
                    <div class="value">${speed} m/s</div>
                </div>
            </div>
            <div class="score">Score: ${entry.capacityScore}</div>
            ${entry.notes ? `<div class="notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        sessionList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        sessionEntries = sessionEntries.filter(entry => entry.id !== id);
        localStorage.setItem('anaerobicCapacityEntries', JSON.stringify(sessionEntries));
        updateStats();
        updateChart();
        updateSessionList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    updateStats();
    updateChart();
    updateSessionList();
});