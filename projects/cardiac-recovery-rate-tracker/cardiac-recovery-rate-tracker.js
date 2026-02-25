// Cardiac Recovery Rate Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();
    updateDisplay();

    const form = document.getElementById('recoveryForm');
    form.addEventListener('submit', handleFormSubmit);

    document.getElementById('viewWeek').addEventListener('click', () => switchChartView('week'));
    document.getElementById('viewMonth').addEventListener('click', () => switchChartView('month'));
});

function handleFormSubmit(e) {
    e.preventDefault();

    const peakHR = parseInt(document.getElementById('peakHR').value);
    const recoveryHR = parseInt(document.getElementById('recoveryHR').value);
    const exerciseType = document.getElementById('exerciseType').value;
    const notes = document.getElementById('notes').value.trim();

    if (peakHR <= recoveryHR) {
        showNotification('Recovery heart rate should be lower than peak heart rate.', 'error');
        return;
    }

    const hrDrop = peakHR - recoveryHR;
    const recoveryPercentage = Math.round((hrDrop / peakHR) * 100);

    const sessionData = {
        date: new Date().toISOString(),
        peakHR: peakHR,
        recoveryHR: recoveryHR,
        hrDrop: hrDrop,
        recoveryPercentage: recoveryPercentage,
        exerciseType: exerciseType,
        notes: notes,
        rating: getRecoveryRating(recoveryPercentage),
        fitnessLevel: getFitnessLevel(recoveryPercentage)
    };

    saveSession(sessionData);
    displayRecoveryResult(sessionData);
    updateDisplay();

    form.reset();
    showNotification('Recovery session saved successfully!', 'success');
}

function getRecoveryRating(percentage) {
    if (percentage >= 30) return 'Excellent';
    if (percentage >= 20) return 'Good';
    if (percentage >= 15) return 'Fair';
    return 'Poor';
}

function getFitnessLevel(percentage) {
    if (percentage >= 30) return 'Elite';
    if (percentage >= 20) return 'Good';
    if (percentage >= 15) return 'Average';
    return 'Needs Improvement';
}

function displayRecoveryResult(data) {
    document.getElementById('recoveryDisplay').style.display = 'none';
    document.getElementById('recoveryResult').style.display = 'block';

    // Update percentage and color
    document.getElementById('recoveryPercentage').textContent = data.recoveryPercentage + '%';
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.className = 'score-circle rating-' + data.rating.toLowerCase();

    // Update background gradient
    const color = getRatingColor(data.rating);
    scoreCircle.style.background = `conic-gradient(${color} 0% ${data.recoveryPercentage}%, #e2e8f0 ${data.recoveryPercentage}% 100%)`;

    // Update details
    document.getElementById('hrDrop').textContent = data.hrDrop + ' bpm';
    document.getElementById('fitnessLevel').textContent = data.fitnessLevel;
    document.getElementById('recoveryRating').textContent = data.rating;

    // Update insights
    const insight = getRecoveryInsight(data);
    document.getElementById('recoveryInsight').textContent = insight;
}

function getRatingColor(rating) {
    switch (rating.toLowerCase()) {
        case 'excellent': return '#48bb78';
        case 'good': return '#4299e1';
        case 'fair': return '#ed8936';
        case 'poor': return '#e53e3e';
        default: return '#a0aec0';
    }
}

function getRecoveryInsight(data) {
    const percentage = data.recoveryPercentage;

    if (percentage >= 30) {
        return "Excellent recovery! Your cardiovascular fitness is outstanding. This level of recovery is typical of well-trained athletes.";
    } else if (percentage >= 20) {
        return "Good recovery rate. Your heart is responding well to exercise. Continue with your current training regimen.";
    } else if (percentage >= 15) {
        return "Fair recovery. There's room for improvement. Consider incorporating more cardiovascular training or recovery activities.";
    } else {
        return "Recovery needs improvement. Focus on building cardiovascular endurance through regular aerobic exercise and proper recovery practices.";
    }
}

function saveSession(session) {
    const data = getData();
    data.sessions.push(session);
    localStorage.setItem('cardiacRecoveryData', JSON.stringify(data));
}

function getData() {
    const data = localStorage.getItem('cardiacRecoveryData');
    return data ? JSON.parse(data) : { sessions: [] };
}

function updateDisplay() {
    updateStats();
    updateCharts();
    updateHistoryTable();
}

function updateStats() {
    const data = getData();
    const sessions = data.sessions;

    if (sessions.length === 0) return;

    // Average recovery
    const avgRecovery = sessions.reduce((sum, s) => sum + s.recoveryPercentage, 0) / sessions.length;
    document.getElementById('avgRecovery').textContent = avgRecovery.toFixed(1) + '%';

    // Best recovery
    const bestRecovery = Math.max(...sessions.map(s => s.recoveryPercentage));
    document.getElementById('bestRecovery').textContent = bestRecovery + '%';

    // Total sessions
    document.getElementById('totalSessions').textContent = sessions.length;

    // Improvement (compare first 3 with last 3)
    if (sessions.length >= 6) {
        const first3 = sessions.slice(0, 3);
        const last3 = sessions.slice(-3);
        const firstAvg = first3.reduce((sum, s) => sum + s.recoveryPercentage, 0) / 3;
        const lastAvg = last3.reduce((sum, s) => sum + s.recoveryPercentage, 0) / 3;
        const improvement = ((lastAvg - firstAvg) / firstAvg) * 100;
        document.getElementById('improvement').textContent = (improvement > 0 ? '+' : '') + improvement.toFixed(1) + '%';
    }

    // Weekly average
    const last7Days = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
    });

    if (last7Days.length > 0) {
        const weeklyAvg = last7Days.reduce((sum, s) => sum + s.recoveryPercentage, 0) / last7Days.length;
        document.getElementById('weeklyAvg').textContent = weeklyAvg.toFixed(1) + '%';
    }

    // Fitness trend
    if (sessions.length >= 2) {
        const recent = sessions.slice(-5);
        const trend = recent.length >= 2 ?
            (recent[recent.length - 1].recoveryPercentage - recent[0].recoveryPercentage) /
            recent.length : 0;

        if (trend > 1) {
            document.getElementById('fitnessTrend').textContent = 'Improving ↑';
            document.getElementById('fitnessTrend').style.color = '#48bb78';
        } else if (trend < -1) {
            document.getElementById('fitnessTrend').textContent = 'Declining ↓';
            document.getElementById('fitnessTrend').style.color = '#e53e3e';
        } else {
            document.getElementById('fitnessTrend').textContent = 'Stable →';
            document.getElementById('fitnessTrend').style.color = '#a0aec0';
        }
    }
}

function initializeCharts() {
    const recoveryCtx = document.getElementById('recoveryChart').getContext('2d');
    const exerciseCtx = document.getElementById('exerciseChart').getContext('2d');

    window.recoveryChart = new Chart(recoveryCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Recovery Rate (%)',
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
                    min: 0,
                    max: 50,
                    title: {
                        display: true,
                        text: 'Recovery Rate (%)'
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
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Average Recovery by Exercise',
                data: [],
                backgroundColor: [
                    '#4299e1',
                    '#48bb78',
                    '#ed8936',
                    '#e53e3e',
                    '#805ad5',
                    '#38b2ac'
                ]
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
                        text: 'Average Recovery Rate (%)'
                    }
                }
            }
        }
    });
}

function switchChartView(view) {
    document.getElementById('viewWeek').classList.toggle('active', view === 'week');
    document.getElementById('viewMonth').classList.toggle('active', view === 'month');
    updateCharts(view);
}

function updateCharts(view = 'week') {
    const data = getData();
    const sessions = data.sessions;
    const days = view === 'week' ? 7 : 30;

    const recent = sessions.slice(-days);
    const labels = recent.map((_, i) => `Session ${sessions.length - days + i + 1}`);
    const recoveries = recent.map(s => s.recoveryPercentage);

    window.recoveryChart.data.labels = labels;
    window.recoveryChart.data.datasets[0].data = recoveries;
    window.recoveryChart.update();

    // Update exercise chart
    const exerciseStats = {};
    sessions.forEach(session => {
        if (!exerciseStats[session.exerciseType]) {
            exerciseStats[session.exerciseType] = [];
        }
        exerciseStats[session.exerciseType].push(session.recoveryPercentage);
    });

    const exerciseLabels = Object.keys(exerciseStats);
    const exerciseData = exerciseLabels.map(type => {
        const recoveries = exerciseStats[type];
        return recoveries.reduce((sum, r) => sum + r, 0) / recoveries.length;
    });

    window.exerciseChart.data.labels = exerciseLabels.map(label =>
        label.charAt(0).toUpperCase() + label.slice(1).replace('-', ' ')
    );
    window.exerciseChart.data.datasets[0].data = exerciseData;
    window.exerciseChart.update();
}

function updateHistoryTable() {
    const data = getData();
    const sessions = data.sessions;
    const tbody = document.getElementById('historyBody');

    if (sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No recovery sessions logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    sessions.slice().reverse().forEach(session => {
        const row = document.createElement('tr');
        const date = new Date(session.date).toLocaleDateString();
        const exercise = session.exerciseType.charAt(0).toUpperCase() + session.exerciseType.slice(1).replace('-', ' ');

        row.innerHTML = `
            <td>${date}</td>
            <td>${exercise}</td>
            <td>${session.peakHR}</td>
            <td>${session.recoveryHR}</td>
            <td>${session.hrDrop}</td>
            <td>${session.recoveryPercentage}%</td>
            <td>${session.rating}</td>
            <td>${session.notes || '-'}</td>
        `;

        tbody.appendChild(row);
    });
}

function loadData() {
    // Initialize display
    document.getElementById('recoveryResult').style.display = 'none';
    document.getElementById('recoveryDisplay').style.display = 'block';
}

function showNotification(message, type) {
    alert(message);
}