// Cold Exposure Adaptation Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();
    updateProgress();

    const form = document.getElementById('coldExposureForm');
    form.addEventListener('submit', handleFormSubmit);

    // Update rating display
    const ratingInput = document.getElementById('comfortRating');
    const ratingValue = document.getElementById('ratingValue');
    ratingInput.addEventListener('input', function() {
        ratingValue.textContent = this.value;
    });
});

function handleFormSubmit(e) {
    e.preventDefault();

    const session = {
        date: new Date().toISOString(),
        type: document.getElementById('exposureType').value,
        duration: parseFloat(document.getElementById('duration').value),
        temperature: document.getElementById('temperature').value ? parseFloat(document.getElementById('temperature').value) : null,
        comfortRating: parseInt(document.getElementById('comfortRating').value),
        notes: document.getElementById('notes').value.trim()
    };

    saveSession(session);
    updateDisplay();
    form.reset();
    document.getElementById('ratingValue').textContent = '5';

    showNotification('Session logged successfully!', 'success');
}

function saveSession(session) {
    const sessions = getSessions();
    sessions.push(session);
    localStorage.setItem('coldExposureSessions', JSON.stringify(sessions));
}

function getSessions() {
    const data = localStorage.getItem('coldExposureSessions');
    return data ? JSON.parse(data) : [];
}

function updateDisplay() {
    updateProgress();
    updateInsights();
    updateCharts();
    updateHistoryTable();
}

function updateProgress() {
    const sessions = getSessions();
    if (sessions.length === 0) return;

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgComfort = sessions.reduce((sum, s) => sum + s.comfortRating, 0) / sessions.length;
    const longestSession = Math.max(...sessions.map(s => s.duration));

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('totalDuration').textContent = totalDuration.toFixed(1) + ' min';
    document.getElementById('avgComfort').textContent = avgComfort.toFixed(1) + '/10';
    document.getElementById('longestSession').textContent = longestSession.toFixed(1) + ' min';
}

function updateInsights() {
    const sessions = getSessions();
    if (sessions.length === 0) return;

    const insights = [];

    // Duration progression
    if (sessions.length >= 3) {
        const recent = sessions.slice(-3);
        const avgRecent = recent.reduce((sum, s) => sum + s.duration, 0) / 3;
        const earlier = sessions.slice(0, -3);
        if (earlier.length > 0) {
            const avgEarlier = earlier.reduce((sum, s) => sum + s.duration, 0) / earlier.length;
            if (avgRecent > avgEarlier * 1.2) {
                insights.push({
                    title: 'Great Progress!',
                    text: 'Your average session duration has increased significantly. You\'re adapting well to cold exposure!'
                });
            }
        }
    }

    // Comfort improvement
    const sortedByDate = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortedByDate.length >= 5) {
        const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
        const secondHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));
        const avgFirst = firstHalf.reduce((sum, s) => sum + s.comfortRating, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((sum, s) => sum + s.comfortRating, 0) / secondHalf.length;

        if (avgSecond > avgFirst + 1) {
            insights.push({
                title: 'Comfort Level Improving',
                text: 'Your comfort ratings have improved over time. You\'re becoming more adapted to cold exposure.'
            });
        }
    }

    // Type-specific insights
    const typeCount = {};
    sessions.forEach(s => {
        typeCount[s.type] = (typeCount[s.type] || 0) + 1;
    });

    const mostCommonType = Object.keys(typeCount).reduce((a, b) => typeCount[a] > typeCount[b] ? a : b);
    if (typeCount[mostCommonType] >= 3) {
        const typeName = mostCommonType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        insights.push({
            title: 'Consistent Practice',
            text: `${typeName} is your most practiced method. Consistency is key to adaptation!`
        });
    }

    // General tips
    insights.push({
        title: 'Adaptation Tips',
        text: 'Gradually increase exposure time by 30-60 seconds per session. Focus on controlled breathing and relaxation techniques during exposure.'
    });

    if (insights.length === 0) {
        insights.push({
            title: 'Keep Going!',
            text: 'Continue logging your sessions to track your adaptation progress and get more personalized insights.'
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
    const durationCtx = document.getElementById('durationChart').getContext('2d');
    const comfortCtx = document.getElementById('comfortChart').getContext('2d');

    window.durationChart = new Chart(durationCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Session Duration (minutes)',
                data: [],
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Duration (minutes)'
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

    window.comfortChart = new Chart(comfortCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Comfort Rating',
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
                    min: 1,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Comfort Rating (1-10)'
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
    const labels = sortedSessions.map((_, i) => `Session ${i + 1}`);
    const durations = sortedSessions.map(s => s.duration);
    const comforts = sortedSessions.map(s => s.comfortRating);

    window.durationChart.data.labels = labels;
    window.durationChart.data.datasets[0].data = durations;
    window.durationChart.update();

    window.comfortChart.data.labels = labels;
    window.comfortChart.data.datasets[0].data = comforts;
    window.comfortChart.update();
}

function updateHistoryTable() {
    const sessions = getSessions();
    const tbody = document.getElementById('historyBody');

    if (sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No sessions logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    sessions.slice().reverse().forEach((session, index) => {
        const row = document.createElement('tr');
        const date = new Date(session.date).toLocaleDateString();
        const type = session.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const temp = session.temperature ? `${session.temperature}°C` : '-';

        row.innerHTML = `
            <td>${date}</td>
            <td>${type}</td>
            <td>${session.duration} min</td>
            <td>${temp}</td>
            <td>${session.comfortRating}/10</td>
            <td>${session.notes || '-'}</td>
            <td><button class="btn-delete" onclick="deleteSession(${sessions.length - 1 - index})">Delete</button></td>
        `;

        tbody.appendChild(row);
    });
}

function deleteSession(index) {
    const sessions = getSessions();
    sessions.splice(index, 1);
    localStorage.setItem('coldExposureSessions', JSON.stringify(sessions));
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