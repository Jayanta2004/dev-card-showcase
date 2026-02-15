// Overstimulation Risk Tracker JavaScript

let exposureSessions = JSON.parse(localStorage.getItem('exposureSessions')) || [];

// Risk levels based on stimulation score (screen + audio hours)
const RISK_LEVELS = [
    {
        level: 'Low Risk',
        range: '0-6 hours',
        min: 0,
        max: 6,
        color: 'risk-low',
        description: 'Healthy stimulation levels. Maintain current habits.',
        downtime: 'Optional short breaks (5-10 min every 2 hours)'
    },
    {
        level: 'Moderate Risk',
        range: '6-12 hours',
        min: 6,
        max: 12,
        color: 'risk-moderate',
        description: 'Elevated stimulation. Consider more breaks.',
        downtime: 'Take 15-20 min breaks every 1-2 hours'
    },
    {
        level: 'High Risk',
        range: '12+ hours',
        min: 12,
        max: 24,
        color: 'risk-high',
        description: 'High stimulation load. Immediate action needed.',
        downtime: 'Take 30+ min breaks every hour, consider digital detox'
    }
];

// Recovery tips
const RECOVERY_TIPS = [
    {
        title: 'Digital Detox Breaks',
        text: 'Step away from screens and audio for at least 20 minutes daily to reset your nervous system.'
    },
    {
        title: 'Nature Exposure',
        text: 'Spend time outdoors without devices to reduce cognitive load and improve mental clarity.'
    },
    {
        title: 'Mindful Activities',
        text: 'Engage in low-stimulation activities like reading physical books, meditation, or light exercise.'
    },
    {
        title: 'Sleep Quality',
        text: 'Avoid screens 1-2 hours before bed to improve sleep quality and cognitive recovery.'
    },
    {
        title: 'Progressive Reduction',
        text: 'Gradually reduce stimulation exposure rather than going cold turkey to avoid withdrawal effects.'
    },
    {
        title: 'Track & Adjust',
        text: 'Monitor your energy levels and mental clarity to find your optimal stimulation threshold.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
    renderLevels();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    // Event listeners
    document.getElementById('exposureForm').addEventListener('submit', logExposure);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
}

function logExposure(e) {
    e.preventDefault();

    const logDate = document.getElementById('logDate').value;
    const screenTime = parseFloat(document.getElementById('screenTime').value);
    const audioTime = parseFloat(document.getElementById('audioTime').value);
    const notes = document.getElementById('notes').value.trim();

    if (!logDate || screenTime === undefined || audioTime === undefined) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date
    const existingIndex = exposureSessions.findIndex(s => s.date === logDate);
    if (existingIndex !== -1) {
        if (!confirm('An entry already exists for this date. Update it?')) {
            return;
        }
        exposureSessions.splice(existingIndex, 1);
    }

    const stimulationScore = screenTime + audioTime;

    const session = {
        id: Date.now(),
        date: logDate,
        screenTime: screenTime,
        audioTime: audioTime,
        stimulationScore: stimulationScore,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    exposureSessions.push(session);
    localStorage.setItem('exposureSessions', JSON.stringify(exposureSessions));

    // Reset form
    document.getElementById('exposureForm').reset();
    document.getElementById('logDate').value = new Date().toISOString().split('T')[0];

    updateDisplay();
    showNotification('Exposure logged successfully!', 'success');
}

function updateDisplay() {
    updateMetrics();
    updateChart();
    updateHistory();
    updateInsights();
}

function updateMetrics() {
    if (exposureSessions.length === 0) {
        document.getElementById('currentScore').textContent = '0';
        document.getElementById('riskLevel').textContent = '--';
        document.getElementById('totalLogs').textContent = '0';
        document.getElementById('avgScore').textContent = '--';
        return;
    }

    // Get today's score if exists
    const today = new Date().toISOString().split('T')[0];
    const todaySession = exposureSessions.find(s => s.date === today);
    const currentScore = todaySession ? todaySession.stimulationScore : 0;

    // Calculate average score
    const scores = exposureSessions.map(s => s.stimulationScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Get risk level for current score
    const riskLevel = getRiskLevel(currentScore);

    document.getElementById('currentScore').textContent = `${currentScore.toFixed(1)}h`;
    document.getElementById('riskLevel').textContent = riskLevel ? riskLevel.level : '--';
    document.getElementById('totalLogs').textContent = exposureSessions.length;
    document.getElementById('avgScore').textContent = `${avgScore.toFixed(1)}h`;
}

function getRiskLevel(score) {
    return RISK_LEVELS.find(level => score >= level.min && score <= level.max);
}

function updateChart() {
    const ctx = document.getElementById('stimulationChart').getContext('2d');

    // Sort sessions by date
    const sortedSessions = [...exposureSessions].sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedSessions.map(s => new Date(s.date).toLocaleDateString());
    const scores = sortedSessions.map(s => s.stimulationScore);

    if (window.stimulationChart) {
        window.stimulationChart.destroy();
    }

    window.stimulationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stimulation Score',
                data: scores,
                borderColor: 'rgba(79, 209, 255, 1)',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Score: ${context.parsed.y}h`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Stimulation Score (hours)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

function updateHistory(filter = 'all') {
    const historyContainer = document.getElementById('exposureHistory');
    let filteredSessions = [...exposureSessions];

    const now = new Date();
    if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = exposureSessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredSessions = exposureSessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // Sort by date descending
    filteredSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyContainer.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No exposure logs found for this period.</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const riskLevel = getRiskLevel(session.stimulationScore);

        historyItem.innerHTML = `
            <div class="history-date">${new Date(session.date).toLocaleDateString()}</div>
            <div class="history-details">
                <div class="history-score ${riskLevel ? riskLevel.color : ''}">${session.stimulationScore}h</div>
                <div class="history-times">Screen: ${session.screenTime}h | Audio: ${session.audioTime}h</div>
                ${session.notes ? `<div class="history-notes">${session.notes}</div>` : ''}
            </div>
        `;

        historyContainer.appendChild(historyItem);
    });
}

function filterHistory(period) {
    // Update active button
    document.querySelectorAll('.history-controls button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view${period.charAt(0).toUpperCase() + period.slice(1)}`).classList.add('active');

    updateHistory(period);
}

function updateInsights() {
    updateRiskAssessment();
    updateDowntimeRecommendation();
    updateTrendAnalysis();
}

function updateRiskAssessment() {
    const assessmentContainer = document.getElementById('riskAssessment');

    if (exposureSessions.length === 0) {
        assessmentContainer.innerHTML = '<p>Log your daily exposure to see your stimulation risk assessment.</p>';
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const todaySession = exposureSessions.find(s => s.date === today);

    if (!todaySession) {
        assessmentContainer.innerHTML = '<p>No data for today. Log your exposure to get an assessment.</p>';
        return;
    }

    const riskLevel = getRiskLevel(todaySession.stimulationScore);
    if (riskLevel) {
        assessmentContainer.innerHTML = `
            <p><strong class="${riskLevel.color}">${riskLevel.level}</strong></p>
            <p>${riskLevel.description}</p>
        `;
    }
}

function updateDowntimeRecommendation() {
    const recommendationContainer = document.getElementById('downtimeRecommendation');

    if (exposureSessions.length === 0) {
        recommendationContainer.innerHTML = '<p>Complete exposure logs to get personalized downtime recommendations.</p>';
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const todaySession = exposureSessions.find(s => s.date === today);

    if (!todaySession) {
        recommendationContainer.innerHTML = '<p>Log today\'s exposure to get downtime recommendations.</p>';
        return;
    }

    const riskLevel = getRiskLevel(todaySession.stimulationScore);
    if (riskLevel) {
        recommendationContainer.innerHTML = `<p>${riskLevel.downtime}</p>`;
    }
}

function updateTrendAnalysis() {
    const trendContainer = document.getElementById('trendAnalysis');

    if (exposureSessions.length < 2) {
        trendContainer.innerHTML = '<p>Log multiple days to see stimulation trend analysis.</p>';
        return;
    }

    const sortedSessions = [...exposureSessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstScore = sortedSessions[0].stimulationScore;
    const lastScore = sortedSessions[sortedSessions.length - 1].stimulationScore;
    const change = lastScore - firstScore;

    if (change > 1) {
        trendContainer.innerHTML = `<p>Stimulation increasing by ${change.toFixed(1)} hours. Consider reducing screen/audio exposure.</p>`;
    } else if (change < -1) {
        trendContainer.innerHTML = `<p>Stimulation decreasing by ${Math.abs(change).toFixed(1)} hours. Good progress on digital wellness!</p>`;
    } else {
        trendContainer.innerHTML = '<p>Stimulation levels are stable. Continue monitoring and adjusting as needed.</p>';
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');

    RECOVERY_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <h4>${tip.title}</h4>
            <p>${tip.text}</p>
        `;
        tipsContainer.appendChild(tipElement);
    });
}

function renderLevels() {
    const levelsContainer = document.getElementById('levels');

    RISK_LEVELS.forEach(level => {
        const levelElement = document.createElement('div');
        levelElement.className = 'level-item';
        levelElement.innerHTML = `
            <h3 class="${level.color}">${level.level}</h3>
            <div class="range">${level.range}</div>
            <p>${level.description}</p>
            <p><strong>Downtime:</strong> ${level.downtime}</p>
        `;
        levelsContainer.appendChild(levelElement);
    });
}

function loadNavbar() {
    fetch('../navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function showNotification(message, type = 'info') {
    // Simple notification - you could enhance this
    alert(message);
}