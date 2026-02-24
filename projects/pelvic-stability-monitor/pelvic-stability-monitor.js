// Pelvic Stability Monitor JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();
    updateDisplay();

    const form = document.getElementById('exerciseForm');
    form.addEventListener('submit', handleFormSubmit);

    // Update rating display
    const ratingInput = document.getElementById('stabilityRating');
    const ratingValue = document.getElementById('ratingValue');
    ratingInput.addEventListener('input', function() {
        ratingValue.textContent = this.value;
    });
});

function handleFormSubmit(e) {
    e.preventDefault();

    const session = {
        date: new Date().toISOString(),
        exerciseType: document.getElementById('exerciseType').value,
        duration: parseInt(document.getElementById('duration').value),
        repetitions: document.getElementById('repetitions').value.trim(),
        stabilityRating: parseInt(document.getElementById('stabilityRating').value),
        notes: document.getElementById('notes').value.trim()
    };

    saveSession(session);
    updateDisplay();
    form.reset();
    document.getElementById('ratingValue').textContent = '5';

    showNotification('Exercise session logged successfully!', 'success');
}

function saveSession(session) {
    const sessions = getSessions();
    sessions.push(session);
    localStorage.setItem('pelvicStabilitySessions', JSON.stringify(sessions));
}

function getSessions() {
    const data = localStorage.getItem('pelvicStabilitySessions');
    return data ? JSON.parse(data) : [];
}

function updateDisplay() {
    updateProgress();
    updateInsights();
    updateCharts();
    updateRecentSessions();
    updateHistoryTable();
}

function updateProgress() {
    const sessions = getSessions();
    if (sessions.length === 0) return;

    const totalSessions = sessions.length;

    // Weekly sessions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklySessions = sessions.filter(s => new Date(s.date) >= oneWeekAgo).length;

    // Average stability
    const avgStability = sessions.reduce((sum, s) => sum + s.stabilityRating, 0) / sessions.length;

    // Best score
    const bestScore = Math.max(...sessions.map(s => s.stabilityRating));

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('weeklySessions').textContent = weeklySessions;
    document.getElementById('avgStability').textContent = avgStability.toFixed(1) + '/10';
    document.getElementById('bestScore').textContent = bestScore + '/10';
}

function updateInsights() {
    const sessions = getSessions();
    if (sessions.length < 3) return;

    const insights = [];

    // Progress over time
    const sortedSessions = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    const recent = sortedSessions.slice(-5);
    const avgRecent = recent.reduce((sum, s) => sum + s.stabilityRating, 0) / 5;
    const earlier = sortedSessions.slice(-10, -5);
    if (earlier.length > 0) {
        const avgEarlier = earlier.reduce((sum, s) => sum + s.stabilityRating, 0) / earlier.length;
        if (avgRecent > avgEarlier + 1) {
            insights.push({
                title: 'Great Progress!',
                text: 'Your pelvic stability has improved significantly. Keep up the consistent practice!'
            });
        }
    }

    // Consistency check
    const last7Days = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
    });

    if (last7Days.length < 3) {
        insights.push({
            title: 'Increase Frequency',
            text: 'For optimal results, aim for 3-5 pelvic stability sessions per week. Consistency is key for building core strength.'
        });
    }

    // Exercise variety
    const exerciseTypes = [...new Set(sessions.map(s => s.exerciseType))];
    if (exerciseTypes.length < 3) {
        insights.push({
            title: 'Try New Exercises',
            text: 'Incorporating different exercises targets various muscle groups. Consider adding bridge pose or bird-dog to your routine.'
        });
    }

    // Duration analysis
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    if (avgDuration < 10) {
        insights.push({
            title: 'Build Endurance',
            text: 'Your average session duration is under 10 minutes. Gradually increase time as you build strength.'
        });
    }

    // High stability days
    const highStabilitySessions = sessions.filter(s => s.stabilityRating >= 8);
    if (highStabilitySessions.length > 0) {
        insights.push({
            title: 'Strong Performance',
            text: `You've achieved high stability ratings in ${highStabilitySessions.length} sessions. Focus on maintaining this level.`
        });
    }

    // Recovery reminder
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);
    if (todaySessions.length >= 2) {
        insights.push({
            title: 'Rest Day Recommended',
            text: 'You\'ve done multiple sessions today. Consider taking a rest day tomorrow to allow muscles to recover.'
        });
    }

    if (insights.length === 0) {
        insights.push({
            title: 'Keep Going!',
            text: 'Continue tracking your pelvic stability exercises to see progress and get more personalized insights.'
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
    const stabilityCtx = document.getElementById('stabilityChart').getContext('2d');
    const exerciseCtx = document.getElementById('exerciseChart').getContext('2d');

    window.stabilityChart = new Chart(stabilityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Stability Rating',
                data: [],
                borderColor: '#4299e1',
                backgroundColor: 'rgba(66, 153, 225, 0.1)',
                tension: 0.4,
                fill: true
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
                        text: 'Stability Rating (1-10)'
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

    window.exerciseChart = new Chart(exerciseCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4299e1',
                    '#48bb78',
                    '#ed8936',
                    '#e53e3e',
                    '#805ad5',
                    '#38b2ac',
                    '#d69e2e',
                    '#e53e3e'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
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
    const ratings = sortedSessions.map(s => s.stabilityRating);

    window.stabilityChart.data.labels = labels;
    window.stabilityChart.data.datasets[0].data = ratings;
    window.stabilityChart.update();

    // Update exercise distribution
    const exerciseCounts = {};
    sessions.forEach(session => {
        const type = session.exerciseType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        exerciseCounts[type] = (exerciseCounts[type] || 0) + 1;
    });

    const exerciseLabels = Object.keys(exerciseCounts);
    const exerciseData = Object.values(exerciseCounts);

    window.exerciseChart.data.labels = exerciseLabels;
    window.exerciseChart.data.datasets[0].data = exerciseData;
    window.exerciseChart.update();
}

function updateRecentSessions() {
    const sessions = getSessions();
    const recentContainer = document.getElementById('recentSessions');

    if (sessions.length === 0) {
        recentContainer.innerHTML = '<p class="empty-state">No sessions logged yet.</p>';
        return;
    }

    const recent = sessions.slice(-5).reverse();
    recentContainer.innerHTML = '';

    recent.forEach(session => {
        const item = document.createElement('div');
        item.className = 'session-item';

        const exerciseName = session.exerciseType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const date = new Date(session.date).toLocaleDateString();

        item.innerHTML = `
            <div class="session-header">
                <span class="exercise-name">${exerciseName}</span>
                <span class="session-date">${date}</span>
            </div>
            <div class="session-details">
                <span>${session.duration} min</span>
                <span>${session.repetitions}</span>
                <span class="stability-score">${session.stabilityRating}/10</span>
            </div>
        `;

        recentContainer.appendChild(item);
    });
}

function updateHistoryTable() {
    const sessions = getSessions();
    const tbody = document.getElementById('historyBody');

    if (sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No exercises logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    sessions.slice().reverse().forEach((session, index) => {
        const row = document.createElement('tr');
        const date = new Date(session.date).toLocaleDateString();
        const exerciseName = session.exerciseType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

        row.innerHTML = `
            <td>${date}</td>
            <td>${exerciseName}</td>
            <td>${session.duration} min</td>
            <td>${session.repetitions}</td>
            <td>${session.stabilityRating}/10</td>
            <td>${session.notes || '-'}</td>
            <td><button class="btn-delete" onclick="deleteSession(${sessions.length - 1 - index})">Delete</button></td>
        `;

        tbody.appendChild(row);
    });
}

function deleteSession(index) {
    const sessions = getSessions();
    sessions.splice(index, 1);
    localStorage.setItem('pelvicStabilitySessions', JSON.stringify(sessions));
    updateDisplay();
    showNotification('Session deleted.', 'info');
}

function loadData() {
    // Initialize rating display
    document.getElementById('ratingValue').textContent = document.getElementById('stabilityRating').value;
}

function showNotification(message, type) {
    alert(message);
}