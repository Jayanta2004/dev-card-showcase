// Balance Stability Score JavaScript

let balanceSessions = JSON.parse(localStorage.getItem('balanceSessions')) || [];

// Performance standards based on single-leg stand time (seconds)
const PERFORMANCE_STANDARDS = [
    {
        level: 'Poor Balance',
        range: '0-10 sec',
        min: 0,
        max: 10,
        description: 'High fall risk, focus on basic balance exercises'
    },
    {
        level: 'Below Average',
        range: '11-20 sec',
        min: 11,
        max: 20,
        description: 'Moderate fall risk, continue balance training'
    },
    {
        level: 'Average',
        range: '21-30 sec',
        min: 21,
        max: 30,
        description: 'Normal balance for most adults'
    },
    {
        level: 'Good',
        range: '31-40 sec',
        min: 31,
        max: 40,
        description: 'Above average stability'
    },
    {
        level: 'Excellent',
        range: '41-50 sec',
        min: 41,
        max: 50,
        description: 'Very good balance control'
    },
    {
        level: 'Superior',
        range: '51+ sec',
        min: 51,
        max: 300,
        description: 'Exceptional balance, low fall risk'
    }
];

// Training tips
const TRAINING_TIPS = [
    {
        title: 'Warm Up Properly',
        text: 'Always perform light cardio and ankle rotations before balance testing to prevent injury.'
    },
    {
        title: 'Practice Regularly',
        text: 'Balance improves with consistent practice. Aim for daily short sessions rather than occasional long ones.'
    },
    {
        title: 'Progress Gradually',
        text: 'Start with eyes open, then progress to eyes closed. Add small challenges like standing on a pillow.'
    },
    {
        title: 'Core Strength Matters',
        text: 'Strong core muscles provide better balance. Include planks and stability exercises in your routine.'
    },
    {
        title: 'Test Both Legs',
        text: 'Balance can differ between legs. Test both regularly to identify and correct imbalances.'
    },
    {
        title: 'Recovery & Rest',
        text: 'Allow adequate rest between intense balance sessions. Good sleep and nutrition support balance improvement.'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNavbar();
    updateDisplay();
    renderTips();
    renderStandards();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('testDate').value = today;

    // Event listeners
    document.getElementById('balanceForm').addEventListener('submit', logBalance);

    // History controls
    document.getElementById('viewWeek').addEventListener('click', () => filterHistory('week'));
    document.getElementById('viewMonth').addEventListener('click', () => filterHistory('month'));
    document.getElementById('viewAll').addEventListener('click', () => filterHistory('all'));
}

function logBalance(e) {
    e.preventDefault();

    const testDate = document.getElementById('testDate').value;
    const standTime = parseFloat(document.getElementById('standTime').value);
    const leg = document.getElementById('leg').value;
    const notes = document.getElementById('notes').value.trim();

    if (!testDate || !standTime || !leg) {
        alert('Please fill in all required fields.');
        return;
    }

    const session = {
        id: Date.now(),
        date: testDate,
        time: standTime,
        leg: leg,
        notes: notes,
        timestamp: new Date().toISOString()
    };

    balanceSessions.push(session);
    localStorage.setItem('balanceSessions', JSON.stringify(balanceSessions));

    // Reset form
    document.getElementById('balanceForm').reset();
    document.getElementById('testDate').value = new Date().toISOString().split('T')[0];

    updateDisplay();
    showNotification('Balance test logged successfully!', 'success');
}

function updateDisplay() {
    updateMetrics();
    updateChart();
    updateHistory();
    updateInsights();
}

function updateMetrics() {
    if (balanceSessions.length === 0) {
        document.getElementById('bestTime').textContent = '0s';
        document.getElementById('avgTime').textContent = '--s';
        document.getElementById('totalTests').textContent = '0';
        document.getElementById('improvement').textContent = '--s';
        return;
    }

    const times = balanceSessions.map(s => s.time);
    const bestTime = Math.max(...times);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

    document.getElementById('bestTime').textContent = `${bestTime.toFixed(1)}s`;
    document.getElementById('avgTime').textContent = `${avgTime.toFixed(1)}s`;
    document.getElementById('totalTests').textContent = balanceSessions.length;

    // Calculate improvement (best - first)
    const sortedSessions = [...balanceSessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstTime = sortedSessions[0].time;
    const improvement = bestTime - firstTime;
    document.getElementById('improvement').textContent = improvement >= 0 ? `+${improvement.toFixed(1)}s` : `${improvement.toFixed(1)}s`;
}

function updateChart() {
    const ctx = document.getElementById('progressionChart').getContext('2d');

    // Sort sessions by date
    const sortedSessions = [...balanceSessions].sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedSessions.map(s => new Date(s.date).toLocaleDateString());
    const leftData = sortedSessions.filter(s => s.leg === 'left').map(s => s.time);
    const rightData = sortedSessions.filter(s => s.leg === 'right').map(s => s.time);

    // Create datasets for left and right leg
    const datasets = [];

    if (leftData.length > 0) {
        datasets.push({
            label: 'Left Leg',
            data: sortedSessions.map(s => s.leg === 'left' ? s.time : null),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.4,
            fill: false
        });
    }

    if (rightData.length > 0) {
        datasets.push({
            label: 'Right Leg',
            data: sortedSessions.map(s => s.leg === 'right' ? s.time : null),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.4,
            fill: false
        });
    }

    if (window.balanceChart) {
        window.balanceChart.destroy();
    }

    window.balanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
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
                            return `${context.dataset.label}: ${context.parsed.y}s`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Stand Time (seconds)'
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
    const historyContainer = document.getElementById('balanceHistory');
    let filteredSessions = [...balanceSessions];

    const now = new Date();
    if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredSessions = balanceSessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredSessions = balanceSessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // Sort by date descending
    filteredSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyContainer.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No balance tests found for this period.</p>';
        return;
    }

    filteredSessions.forEach(session => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        historyItem.innerHTML = `
            <div class="history-date">${new Date(session.date).toLocaleDateString()}</div>
            <div class="history-details">
                <div class="history-time">${session.time}s</div>
                <div class="history-leg">${session.leg} leg</div>
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
    updateStabilityLevel();
    updateProgressTrend();
    updateLegBalance();
}

function updateStabilityLevel() {
    const levelContainer = document.getElementById('stabilityLevel');

    if (balanceSessions.length === 0) {
        levelContainer.innerHTML = '<p>Complete your first balance test to see your stability level.</p>';
        return;
    }

    const bestTime = Math.max(...balanceSessions.map(s => s.time));
    const standard = PERFORMANCE_STANDARDS.find(s => bestTime >= s.min && bestTime <= s.max);

    if (standard) {
        levelContainer.innerHTML = `
            <p><strong>${standard.level}</strong> (${standard.range})</p>
            <p>${standard.description}</p>
        `;
    }
}

function updateProgressTrend() {
    const trendContainer = document.getElementById('progressTrend');

    if (balanceSessions.length < 2) {
        trendContainer.innerHTML = '<p>Complete more tests to see your progress trend.</p>';
        return;
    }

    const sortedSessions = [...balanceSessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstTime = sortedSessions[0].time;
    const lastTime = sortedSessions[sortedSessions.length - 1].time;
    const improvement = lastTime - firstTime;

    if (improvement > 0) {
        trendContainer.innerHTML = `<p>Improving! You've gained ${improvement.toFixed(1)} seconds since your first test.</p>`;
    } else if (improvement < 0) {
        trendContainer.innerHTML = `<p>Declining. You've lost ${Math.abs(improvement).toFixed(1)} seconds since your first test.</p>`;
    } else {
        trendContainer.innerHTML = '<p>Stable performance. Keep practicing to see improvement.</p>';
    }
}

function updateLegBalance() {
    const balanceContainer = document.getElementById('legBalance');

    const leftSessions = balanceSessions.filter(s => s.leg === 'left');
    const rightSessions = balanceSessions.filter(s => s.leg === 'right');

    if (leftSessions.length === 0 || rightSessions.length === 0) {
        balanceContainer.innerHTML = '<p>Test both legs to compare balance performance.</p>';
        return;
    }

    const leftAvg = leftSessions.reduce((sum, s) => sum + s.time, 0) / leftSessions.length;
    const rightAvg = rightSessions.reduce((sum, s) => sum + s.time, 0) / rightSessions.length;
    const difference = Math.abs(leftAvg - rightAvg);

    if (difference < 2) {
        balanceContainer.innerHTML = '<p>Good balance between legs. Keep up the training!</p>';
    } else {
        const stronger = leftAvg > rightAvg ? 'left' : 'right';
        const weaker = leftAvg > rightAvg ? 'right' : 'left';
        balanceContainer.innerHTML = `<p>${difference.toFixed(1)}s difference. Your ${stronger} leg is stronger than your ${weaker} leg.</p>`;
    }
}

function renderTips() {
    const tipsContainer = document.getElementById('tips');

    TRAINING_TIPS.forEach(tip => {
        const tipElement = document.createElement('div');
        tipElement.className = 'tip-item';
        tipElement.innerHTML = `
            <h4>${tip.title}</h4>
            <p>${tip.text}</p>
        `;
        tipsContainer.appendChild(tipElement);
    });
}

function renderStandards() {
    const standardsContainer = document.getElementById('standards');

    PERFORMANCE_STANDARDS.forEach(standard => {
        const standardElement = document.createElement('div');
        standardElement.className = 'standard-item';
        standardElement.innerHTML = `
            <h3>${standard.level}</h3>
            <div class="range">${standard.range}</div>
            <p>${standard.description}</p>
        `;
        standardsContainer.appendChild(standardElement);
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