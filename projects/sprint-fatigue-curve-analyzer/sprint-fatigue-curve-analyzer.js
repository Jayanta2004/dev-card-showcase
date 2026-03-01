// Sprint Fatigue Curve Analyzer JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeSprintInputs();
    loadData();
    initializeCharts();
    updateDisplay();

    const form = document.getElementById('sprintForm');
    form.addEventListener('submit', handleFormSubmit);

    document.getElementById('sprintCount').addEventListener('change', updateSprintInputs);
    document.getElementById('viewTime').addEventListener('click', () => switchChartView('time'));
    document.getElementById('viewCumulative').addEventListener('click', () => switchChartView('cumulative'));
});

let fatigueChart = null;
let currentChartView = 'time';

function initializeSprintInputs() {
    const sprintCount = parseInt(document.getElementById('sprintCount').value);
    updateSprintInputsDisplay(sprintCount);
}

function updateSprintInputs() {
    const sprintCount = parseInt(this.value);
    updateSprintInputsDisplay(sprintCount);
}

function updateSprintInputsDisplay(count) {
    const container = document.getElementById('sprintInputs');
    container.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        inputGroup.innerHTML = `
            <label for="sprint${i}">Sprint ${i} Time (seconds):</label>
            <input type="number" id="sprint${i}" min="1" max="300" step="0.1" placeholder="e.g., 12.5" required>
        `;
        container.appendChild(inputGroup);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    const sessionName = document.getElementById('sessionName').value.trim();
    const sprintCount = parseInt(document.getElementById('sprintCount').value);
    const restTime = parseInt(document.getElementById('restTime').value);
    const notes = document.getElementById('notes').value.trim();

    // Collect sprint times
    const sprintTimes = [];
    for (let i = 1; i <= sprintCount; i++) {
        const time = parseFloat(document.getElementById(`sprint${i}`).value);
        if (isNaN(time) || time <= 0) {
            showNotification(`Please enter a valid time for Sprint ${i}.`, 'error');
            return;
        }
        sprintTimes.push(time);
    }

    // Calculate fatigue metrics
    const fatigueMetrics = calculateFatigueMetrics(sprintTimes);

    const sessionData = {
        date: new Date().toISOString(),
        sessionName: sessionName,
        sprintCount: sprintCount,
        sprintTimes: sprintTimes,
        restTime: restTime,
        notes: notes,
        fatigueRate: fatigueMetrics.fatigueRate,
        performanceDrop: fatigueMetrics.performanceDrop,
        recoveryQuality: fatigueMetrics.recoveryQuality,
        consistency: fatigueMetrics.consistency,
        bestTime: Math.min(...sprintTimes),
        averageTime: sprintTimes.reduce((a, b) => a + b, 0) / sprintTimes.length
    };

    saveSession(sessionData);
    displayAnalysisResult(sessionData);
    updateChart(sessionData.sprintTimes);
    updateDisplay();

    form.reset();
    initializeSprintInputs();
    showNotification('Sprint session analyzed successfully!', 'success');
}

function calculateFatigueMetrics(sprintTimes) {
    const firstSprint = sprintTimes[0];
    const lastSprint = sprintTimes[sprintTimes.length - 1];

    // Fatigue rate: percentage increase from first to last sprint
    const fatigueRate = ((lastSprint - firstSprint) / firstSprint) * 100;

    // Performance drop: total time increase
    const performanceDrop = ((lastSprint - firstSprint) / firstSprint) * 100;

    // Recovery quality based on fatigue rate
    let recoveryQuality;
    if (Math.abs(fatigueRate) < 5) recoveryQuality = 'Excellent';
    else if (Math.abs(fatigueRate) < 10) recoveryQuality = 'Good';
    else if (Math.abs(fatigueRate) < 20) recoveryQuality = 'Fair';
    else recoveryQuality = 'Poor';

    // Consistency: coefficient of variation
    const mean = sprintTimes.reduce((a, b) => a + b, 0) / sprintTimes.length;
    const variance = sprintTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sprintTimes.length;
    const stdDev = Math.sqrt(variance);
    const consistency = ((stdDev / mean) * 100);

    return {
        fatigueRate: fatigueRate.toFixed(1),
        performanceDrop: performanceDrop.toFixed(1),
        recoveryQuality: recoveryQuality,
        consistency: (100 - consistency).toFixed(1) // Convert to consistency score
    };
}

function displayAnalysisResult(data) {
    document.getElementById('analysisDisplay').style.display = 'none';
    document.getElementById('analysisResult').style.display = 'block';

    // Update metrics
    document.getElementById('fatigueRate').textContent = data.fatigueRate + '%';
    document.getElementById('performanceDrop').textContent = data.performanceDrop + '%';
    document.getElementById('recoveryQuality').textContent = data.recoveryQuality;
    document.getElementById('consistency').textContent = data.consistency + '%';

    // Update insights
    const insight = getFatigueInsight(data);
    document.getElementById('fatigueInsight').textContent = insight;
}

function getFatigueInsight(data) {
    const fatigueRate = parseFloat(data.fatigueRate);
    const consistency = parseFloat(data.consistency);

    if (fatigueRate < 5 && consistency > 90) {
        return "Excellent recovery and consistency! Your sprint performance is very stable with minimal fatigue accumulation.";
    } else if (fatigueRate < 10 && consistency > 80) {
        return "Good fatigue management. Consider adjusting rest periods or intensity to optimize performance.";
    } else if (fatigueRate < 20) {
        return "Moderate fatigue accumulation detected. This is normal for HIIT training, but monitor for overtraining.";
    } else {
        return "High fatigue rate observed. Consider increasing rest time between sprints or reducing workout intensity.";
    }
}

function initializeCharts() {
    const ctx = document.getElementById('fatigueChart').getContext('2d');
    fatigueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Sprint Time (seconds)',
                data: [],
                borderColor: '#e53e3e',
                backgroundColor: 'rgba(229, 62, 62, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#e53e3e',
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
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Sprint ${context.dataIndex + 1}: ${context.parsed.y}s`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: currentChartView === 'time' ? 'Sprint Number' : 'Cumulative Time (seconds)'
                    }
                }
            }
        }
    });
}

function updateChart(sprintTimes) {
    if (!fatigueChart) return;

    const labels = sprintTimes.map((_, index) => {
        if (currentChartView === 'time') {
            return `Sprint ${index + 1}`;
        } else {
            // Cumulative time view
            const restTime = parseInt(document.getElementById('restTime').value) || 60;
            let cumulative = 0;
            for (let i = 0; i <= index; i++) {
                cumulative += sprintTimes[i];
                if (i < index) cumulative += restTime;
            }
            return `${cumulative}s`;
        }
    });

    fatigueChart.data.labels = labels;
    fatigueChart.data.datasets[0].data = sprintTimes;
    fatigueChart.options.scales.x.title.text = currentChartView === 'time' ? 'Sprint Number' : 'Cumulative Time (seconds)';
    fatigueChart.update();
}

function switchChartView(view) {
    currentChartView = view;

    // Update button states
    document.getElementById('viewTime').classList.toggle('active', view === 'time');
    document.getElementById('viewCumulative').classList.toggle('active', view === 'cumulative');

    // Reload current session data if available
    const sessions = getStoredSessions();
    if (sessions.length > 0) {
        const latestSession = sessions[sessions.length - 1];
        updateChart(latestSession.sprintTimes);
    }
}

function saveSession(sessionData) {
    const sessions = getStoredSessions();
    sessions.push(sessionData);
    localStorage.setItem('sprintFatigueSessions', JSON.stringify(sessions));
}

function getStoredSessions() {
    const stored = localStorage.getItem('sprintFatigueSessions');
    return stored ? JSON.parse(stored) : [];
}

function loadData() {
    const sessions = getStoredSessions();
    if (sessions.length > 0) {
        const latestSession = sessions[sessions.length - 1];
        displayAnalysisResult(latestSession);
        updateChart(latestSession.sprintTimes);
    }
}

function updateDisplay() {
    const sessions = getStoredSessions();

    // Update total sessions
    document.getElementById('totalSessions').textContent = sessions.length;

    if (sessions.length === 0) return;

    // Calculate statistics
    const fatigueRates = sessions.map(s => parseFloat(s.fatigueRate));
    const avgFatigueRate = fatigueRates.reduce((a, b) => a + b, 0) / fatigueRates.length;

    const bestTimes = sessions.map(s => s.bestTime);
    const bestPerformance = Math.min(...bestTimes);

    // Update stats
    document.getElementById('avgFatigueRate').textContent = avgFatigueRate.toFixed(1) + '%';
    document.getElementById('bestPerformance').textContent = bestPerformance.toFixed(1) + 's';

    // Calculate improvement trend (comparing first 3 vs last 3 sessions)
    let improvementTrend = '--';
    if (sessions.length >= 6) {
        const firstThree = sessions.slice(0, 3).map(s => parseFloat(s.fatigueRate));
        const lastThree = sessions.slice(-3).map(s => parseFloat(s.fatigueRate));

        const firstAvg = firstThree.reduce((a, b) => a + b, 0) / firstThree.length;
        const lastAvg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;

        if (lastAvg < firstAvg) {
            improvementTrend = 'Improving';
        } else if (lastAvg > firstAvg) {
            improvementTrend = 'Declining';
        } else {
            improvementTrend = 'Stable';
        }
    }
    document.getElementById('improvementTrend').textContent = improvementTrend;

    // Update history table
    updateHistoryTable(sessions);
}

function updateHistoryTable(sessions) {
    const tbody = document.getElementById('historyBody');

    if (sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No sprint sessions logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = sessions.slice(-10).reverse().map(session => {
        const date = new Date(session.date).toLocaleDateString();
        return `
            <tr>
                <td>${date}</td>
                <td>${session.sessionName}</td>
                <td>${session.sprintCount}</td>
                <td>${session.bestTime.toFixed(1)}s</td>
                <td>${session.fatigueRate}%</td>
                <td>${session.recoveryQuality}</td>
                <td>${session.notes || '-'}</td>
            </tr>
        `;
    }).join('');
}

function showNotification(message, type = 'info') {
    // Simple notification - you could enhance this with a proper notification system
    alert(message);
}