// Hill Performance Analyzer JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();
    updateMetrics();

    const form = document.getElementById('hillSessionForm');
    form.addEventListener('submit', handleFormSubmit);

    // Update effort display
    const effortInput = document.getElementById('effort');
    const effortValue = document.getElementById('effortValue');
    effortInput.addEventListener('input', function() {
        effortValue.textContent = this.value;
    });
});

function handleFormSubmit(e) {
    e.preventDefault();

    const session = {
        date: new Date().toISOString(),
        distance: parseFloat(document.getElementById('distance').value),
        duration: parseFloat(document.getElementById('duration').value),
        incline: parseFloat(document.getElementById('incline').value),
        heartRate: document.getElementById('heartRate').value ? parseInt(document.getElementById('heartRate').value) : null,
        effort: parseInt(document.getElementById('effort').value),
        terrain: document.getElementById('terrain').value,
        notes: document.getElementById('notes').value.trim(),
        pace: parseFloat(document.getElementById('duration').value) / parseFloat(document.getElementById('distance').value) // min/km
    };

    saveSession(session);
    updateDisplay();
    form.reset();
    document.getElementById('effortValue').textContent = '5';

    showNotification('Hill session logged successfully!', 'success');
}

function saveSession(session) {
    const sessions = getSessions();
    sessions.push(session);
    localStorage.setItem('hillPerformanceSessions', JSON.stringify(sessions));
}

function getSessions() {
    const data = localStorage.getItem('hillPerformanceSessions');
    return data ? JSON.parse(data) : [];
}

function updateDisplay() {
    updateMetrics();
    updateInsights();
    updateCharts();
    updateHistoryTable();
}

function updateMetrics() {
    const sessions = getSessions();
    if (sessions.length === 0) return;

    const totalSessions = sessions.length;
    const totalDistance = sessions.reduce((sum, s) => sum + s.distance, 0);
    const avgPace = sessions.reduce((sum, s) => sum + s.pace, 0) / sessions.length;
    const bestPace = Math.min(...sessions.map(s => s.pace));
    const maxIncline = Math.max(...sessions.map(s => s.incline));
    const avgHeartRate = sessions.filter(s => s.heartRate).reduce((sum, s) => sum + s.heartRate, 0) / sessions.filter(s => s.heartRate).length;

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalDistance').textContent = totalDistance.toFixed(1) + ' km';
    document.getElementById('avgPace').textContent = formatPace(avgPace);
    document.getElementById('bestPace').textContent = formatPace(bestPace);
    document.getElementById('maxIncline').textContent = maxIncline + '%';
    document.getElementById('avgHeartRate').textContent = avgHeartRate ? Math.round(avgHeartRate) + ' bpm' : '--';
}

function formatPace(pace) {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
}

function updateInsights() {
    const sessions = getSessions();
    if (sessions.length === 0) return;

    const insights = [];

    // Pace improvement
    if (sessions.length >= 3) {
        const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
        const recent = sortedSessions.slice(-3);
        const avgRecentPace = recent.reduce((sum, s) => sum + s.pace, 0) / 3;
        const earlier = sortedSessions.slice(0, -3);
        if (earlier.length > 0) {
            const avgEarlierPace = earlier.reduce((sum, s) => sum + s.pace, 0) / earlier.length;
            if (avgRecentPace < avgEarlierPace * 0.95) {
                insights.push({
                    title: 'Hill Pace Improving!',
                    text: 'Your average hill pace has improved significantly. Your hill training is paying off!'
                });
            }
        }
    }

    // Incline adaptation
    const inclineGroups = {};
    sessions.forEach(s => {
        const range = Math.floor(s.incline / 5) * 5;
        inclineGroups[range] = inclineGroups[range] || [];
        inclineGroups[range].push(s);
    });

    const mostCommonIncline = Object.keys(inclineGroups).reduce((a, b) =>
        inclineGroups[a].length > inclineGroups[b].length ? a : b
    );

    if (mostCommonIncline && inclineGroups[mostCommonIncline].length >= 3) {
        insights.push({
            title: 'Incline Specialist',
            text: `You're frequently training on ${mostCommonIncline}-${parseInt(mostCommonIncline) + 5}% inclines. Consider varying your hill grades for well-rounded development.`
        });
    }

    // Heart rate analysis
    const hrSessions = sessions.filter(s => s.heartRate);
    if (hrSessions.length >= 3) {
        const avgHR = hrSessions.reduce((sum, s) => sum + s.heartRate, 0) / hrSessions.length;
        if (avgHR > 160) {
            insights.push({
                title: 'High Heart Rate Training',
                text: 'Your average heart rate during hill sessions is quite high. Focus on building aerobic base to improve efficiency.'
            });
        } else if (avgHR < 140) {
            insights.push({
                title: 'Room for Intensity',
                text: 'Your hill sessions are at moderate intensity. Consider increasing effort on steeper hills for better adaptation.'
            });
        }
    }

    // Terrain variety
    const terrainCount = {};
    sessions.forEach(s => {
        terrainCount[s.terrain] = (terrainCount[s.terrain] || 0) + 1;
    });

    if (Object.keys(terrainCount).length === 1) {
        insights.push({
            title: 'Terrain Variety',
            text: 'You\'re training on the same terrain type. Try different surfaces (trail, road, stairs) to build comprehensive hill strength.'
        });
    }

    // General tips
    insights.push({
        title: 'Hill Training Tips',
        text: 'Focus on shorter, faster strides uphill and longer strides downhill. Maintain good posture and use your arms for power.'
    });

    if (insights.length === 0) {
        insights.push({
            title: 'Keep Climbing!',
            text: 'Continue logging your hill sessions to track progress and get more personalized training insights.'
        });
    }

    displayInsights(insights);
}

function displayInsights(insights) {
    const container = document.getElementById('insights');
    container.innerHTML = '';

    insights.forEach(insight => {
        const div = document.createElement('div');
        div.className = 'insight-item';
        div.innerHTML = `
            <h4>${insight.title}</h4>
            <p>${insight.text}</p>
        `;
        container.appendChild(div);
    });
}

function initializeCharts() {
    const paceInclineCtx = document.getElementById('paceInclineChart').getContext('2d');
    const heartRateCtx = document.getElementById('heartRateChart').getContext('2d');

    window.paceInclineChart = new Chart(paceInclineCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Pace vs Incline',
                data: [],
                backgroundColor: '#4299e1',
                borderColor: '#4299e1',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Incline (%)'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'Pace (min/km)'
                    },
                    reverse: true
                }
            }
        }
    });

    window.heartRateChart = new Chart(heartRateCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Heart Rate (bpm)',
                data: [],
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Heart Rate (bpm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Session'
                    }
                }
            }
        }
    });
}

function updateCharts() {
    const sessions = getSessions();
    if (sessions.length === 0) return;

    const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Pace vs Incline scatter plot
    const scatterData = sortedSessions.map(s => ({
        x: s.incline,
        y: s.pace
    }));

    window.paceInclineChart.data.datasets[0].data = scatterData;
    window.paceInclineChart.update();

    // Heart rate trend
    const hrSessions = sortedSessions.filter(s => s.heartRate);
    if (hrSessions.length > 0) {
        const labels = hrSessions.map((_, i) => `Session ${i + 1}`);
        const hrData = hrSessions.map(s => s.heartRate);

        window.heartRateChart.data.labels = labels;
        window.heartRateChart.data.datasets[0].data = hrData;
        window.heartRateChart.update();
    }
}

function updateHistoryTable() {
    const sessions = getSessions();
    const tbody = document.getElementById('historyBody');

    if (sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10">No hill sessions logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    sessions.slice().reverse().forEach((session, index) => {
        const row = document.createElement('tr');
        const date = new Date(session.date).toLocaleDateString();
        const terrain = session.terrain.charAt(0).toUpperCase() + session.terrain.slice(1);
        const hr = session.heartRate ? session.heartRate + ' bpm' : '-';

        row.innerHTML = `
            <td>${date}</td>
            <td>${session.distance} km</td>
            <td>${session.duration} min</td>
            <td>${formatPace(session.pace)}</td>
            <td>${session.incline}%</td>
            <td>${hr}</td>
            <td>${terrain}</td>
            <td>${session.effort}/10</td>
            <td>${session.notes || '-'}</td>
            <td><button class="btn-delete" onclick="deleteSession(${sessions.length - 1 - index})">Delete</button></td>
        `;

        tbody.appendChild(row);
    });
}

function deleteSession(index) {
    const sessions = getSessions();
    sessions.splice(index, 1);
    localStorage.setItem('hillPerformanceSessions', JSON.stringify(sessions));
    updateDisplay();
    showNotification('Session deleted.', 'info');
}

function loadData() {
    updateDisplay();
}

function showNotification(message, type) {
    // Simple notification
    alert(message);
}