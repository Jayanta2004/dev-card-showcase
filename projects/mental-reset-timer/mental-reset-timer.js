// mental-reset-timer.js

let mentalEntries = JSON.parse(localStorage.getItem('mentalResetEntries')) || [];

// Timer variables
let timerInterval = null;
let startTime = null;
let pausedTime = 0;
let isRunning = false;
let isPaused = false;
let currentActivity = '';

function startTimer() {
    if (isRunning && !isPaused) return;

    const activity = document.getElementById('resetActivity').value;
    if (!activity) {
        alert('Please select a reset activity first.');
        return;
    }

    currentActivity = activity;

    if (!isRunning) {
        startTime = Date.now() - pausedTime;
        document.getElementById('sessionStartTime').textContent = new Date().toLocaleTimeString();
    } else {
        startTime = Date.now() - pausedTime;
    }

    isRunning = true;
    isPaused = false;

    document.getElementById('currentActivity').textContent = activity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function pauseTimer() {
    if (!isRunning || isPaused) return;

    clearInterval(timerInterval);
    pausedTime = Date.now() - startTime;
    isPaused = true;

    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    startTime = null;
    pausedTime = 0;
    isRunning = false;
    isPaused = false;
    currentActivity = '';

    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('currentActivity').textContent = 'No activity selected';
    document.getElementById('sessionStartTime').textContent = '-';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

function updateTimerDisplay() {
    if (!isRunning || isPaused) return;

    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    document.getElementById('timerDisplay').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function logSession() {
    const date = document.getElementById('sessionDate').value;
    const resetActivity = document.getElementById('resetActivity').value;
    const sessionDuration = parseInt(document.getElementById('sessionDuration').value);
    const preFatigueLevel = parseInt(document.getElementById('preFatigueLevel').value);
    const postFatigueLevel = parseInt(document.getElementById('postFatigueLevel').value);
    const mentalClarity = parseInt(document.getElementById('mentalClarity').value);
    const stressReduction = parseInt(document.getElementById('stressReduction').value);
    const resetEffectiveness = parseInt(document.getElementById('resetEffectiveness').value);
    const notes = document.getElementById('mentalNotes').value.trim();

    if (!date || !resetActivity || !sessionDuration || !preFatigueLevel || !postFatigueLevel || !mentalClarity || !stressReduction) {
        alert('Please fill in all required fields.');
        return;
    }

    // Check if entry already exists for this date and activity
    const existingEntry = mentalEntries.find(entry =>
        entry.date === date && entry.resetActivity === resetActivity
    );
    if (existingEntry) {
        if (!confirm('An entry already exists for this date and activity. Do you want to update it?')) {
            return;
        }
        // Remove existing entry
        mentalEntries = mentalEntries.filter(entry =>
            !(entry.date === date && entry.resetActivity === resetActivity)
        );
    }

    // Calculate recovery rate (percentage improvement in fatigue)
    const recoveryRate = preFatigueLevel > 0 ? ((preFatigueLevel - postFatigueLevel) / preFatigueLevel) * 100 : 0;

    // Calculate overall effectiveness score (weighted average)
    const effectivenessScore = (recoveryRate * 0.4 + mentalClarity * 10 * 0.3 + stressReduction * 10 * 0.3) / 10;

    const entry = {
        id: Date.now(),
        date,
        resetActivity,
        sessionDuration,
        preFatigueLevel,
        postFatigueLevel,
        recoveryRate: parseFloat(recoveryRate.toFixed(1)),
        mentalClarity,
        stressReduction,
        resetEffectiveness,
        effectivenessScore: parseFloat(effectivenessScore.toFixed(1)),
        notes
    };

    mentalEntries.push(entry);

    // Sort by date
    mentalEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Keep only last 50 entries
    if (mentalEntries.length > 50) {
        mentalEntries = mentalEntries.slice(-50);
    }

    localStorage.setItem('mentalResetEntries', JSON.stringify(mentalEntries));

    // Clear form
    document.getElementById('sessionDate').value = '';
    document.getElementById('resetActivity').value = '';
    document.getElementById('sessionDuration').value = '';
    document.getElementById('preFatigueLevel').value = '';
    document.getElementById('postFatigueLevel').value = '';
    document.getElementById('mentalClarity').value = '';
    document.getElementById('stressReduction').value = '';
    document.getElementById('resetEffectiveness').value = 7;
    document.getElementById('effectivenessValue').textContent = '7';
    document.getElementById('mentalNotes').value = '';

    updateStats();
    updateChart();
    updateInsights();
    updateSessionList();
}

function getRecoveryStatus(recoveryRate) {
    if (recoveryRate >= 70) return { status: 'Excellent', class: 'recovery-excellent' };
    if (recoveryRate >= 50) return { status: 'Good', class: 'recovery-good' };
    if (recoveryRate >= 30) return { status: 'Fair', class: 'recovery-fair' };
    return { status: 'Poor', class: 'recovery-poor' };
}

function updateStats() {
    const totalSessions = mentalEntries.length;

    if (totalSessions === 0) {
        document.getElementById('avgRecoveryRate').textContent = '0%';
        document.getElementById('topActivity').textContent = 'None';
        document.getElementById('totalResetTime').textContent = '0 min';
        document.getElementById('totalSessions').textContent = '0';
        return;
    }

    // Average recovery rate
    const avgRecoveryRate = mentalEntries.reduce((sum, entry) => sum + entry.recoveryRate, 0) / totalSessions;

    // Find most effective activity
    const activityStats = {};
    mentalEntries.forEach(entry => {
        if (!activityStats[entry.resetActivity]) {
            activityStats[entry.resetActivity] = { total: 0, count: 0 };
        }
        activityStats[entry.resetActivity].total += entry.effectivenessScore;
        activityStats[entry.resetActivity].count++;
    });

    let topActivity = 'None';
    let maxAvgEffectiveness = 0;
    Object.keys(activityStats).forEach(activity => {
        const avgEffectiveness = activityStats[activity].total / activityStats[activity].count;
        if (avgEffectiveness > maxAvgEffectiveness) {
            maxAvgEffectiveness = avgEffectiveness;
            topActivity = activity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    });

    // Total reset time
    const totalResetTime = mentalEntries.reduce((sum, entry) => sum + entry.sessionDuration, 0);

    document.getElementById('avgRecoveryRate').textContent = `${avgRecoveryRate.toFixed(1)}%`;
    document.getElementById('topActivity').textContent = topActivity;
    document.getElementById('totalResetTime').textContent = `${totalResetTime} min`;
    document.getElementById('totalSessions').textContent = totalSessions;
}

function updateChart() {
    const ctx = document.getElementById('mentalChart').getContext('2d');

    // Prepare data for last 20 entries
    const chartEntries = mentalEntries.slice(-20);

    const labels = chartEntries.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString();
    });

    const recoveryRates = chartEntries.map(entry => entry.recoveryRate);
    const effectivenessScores = chartEntries.map(entry => entry.effectivenessScore);
    const preFatigue = chartEntries.map(entry => entry.preFatigueLevel);
    const postFatigue = chartEntries.map(entry => entry.postFatigueLevel);
    const sessionDurations = chartEntries.map(entry => entry.sessionDuration);

    // Reference lines
    const goodRecovery = new Array(recoveryRates.length).fill(50);
    const excellentRecovery = new Array(recoveryRates.length).fill(70);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Recovery Rate (%)',
                data: recoveryRates,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y',
                tension: 0.4
            }, {
                label: 'Effectiveness Score',
                data: effectivenessScores,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Pre-Reset Fatigue',
                data: preFatigue,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Post-Reset Fatigue',
                data: postFatigue,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                yAxisID: 'y2',
                tension: 0.4,
                hidden: true
            }, {
                label: 'Good Recovery (50%+)',
                data: goodRecovery,
                borderColor: '#17a2b8',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
            }, {
                label: 'Excellent Recovery (70%+)',
                data: excellentRecovery,
                borderColor: '#28a745',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                yAxisID: 'y'
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
                        text: 'Recovery Rate (%)'
                    },
                    min: 0,
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Effectiveness Score (1-10)'
                    },
                    min: 1,
                    max: 10,
                    grid: {
                        drawOnChartArea: false,
                    }
                },
                y2: {
                    type: 'linear',
                    display: false, // Hidden by default
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Fatigue Level (1-10)'
                    },
                    min: 1,
                    max: 10,
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

function updateInsights() {
    const insightsDiv = document.getElementById('insights');

    if (mentalEntries.length < 5) {
        insightsDiv.innerHTML = '<p>Log at least 5 mental reset sessions to receive personalized insights about your cognitive recovery patterns and optimal reset strategies.</p>';
        return;
    }

    // Analyze patterns
    const recentEntries = mentalEntries.slice(-10);
    const avgRecoveryRate = recentEntries.reduce((sum, entry) => sum + entry.recoveryRate, 0) / recentEntries.length;
    const avgSessionDuration = recentEntries.reduce((sum, entry) => sum + entry.sessionDuration, 0) / recentEntries.length;
    const avgPreFatigue = recentEntries.reduce((sum, entry) => sum + entry.preFatigueLevel, 0) / recentEntries.length;

    // Analyze activity effectiveness
    const activityEffectiveness = {};
    mentalEntries.forEach(entry => {
        if (!activityEffectiveness[entry.resetActivity]) {
            activityEffectiveness[entry.resetActivity] = { total: 0, count: 0 };
        }
        activityEffectiveness[entry.resetActivity].total += entry.effectivenessScore;
        activityEffectiveness[entry.resetActivity].count++;
    });

    let bestActivity = '';
    let bestAvgEffectiveness = 0;
    Object.keys(activityEffectiveness).forEach(activity => {
        const avgEffectiveness = activityEffectiveness[activity].total / activityEffectiveness[activity].count;
        if (avgEffectiveness > bestAvgEffectiveness) {
            bestAvgEffectiveness = avgEffectiveness;
            bestActivity = activity;
        }
    });

    // Analyze duration effectiveness
    const durationGroups = {};
    mentalEntries.forEach(entry => {
        const durationRange = Math.floor(entry.sessionDuration / 10) * 10;
        if (!durationGroups[durationRange]) {
            durationGroups[durationRange] = { total: 0, count: 0 };
        }
        durationGroups[durationRange].total += entry.effectivenessScore;
        durationGroups[durationRange].count++;
    });

    let optimalDuration = 0;
    let maxAvgEffectiveness = 0;
    Object.keys(durationGroups).forEach(duration => {
        const avgEffectiveness = durationGroups[duration].total / durationGroups[duration].count;
        if (avgEffectiveness > maxAvgEffectiveness) {
            maxAvgEffectiveness = avgEffectiveness;
            optimalDuration = parseInt(duration);
        }
    });

    let insights = '<p>Based on your mental reset patterns:</p><ul>';

    if (avgRecoveryRate >= 60) {
        insights += '<li><strong>Strong recovery ability!</strong> Your mental reset strategies are highly effective. Continue with your current approach.</li>';
    } else if (avgRecoveryRate >= 40) {
        insights += '<li><strong>Moderate recovery effectiveness.</strong> Your reset activities are helping, but there may be room for optimization in duration or activity selection.</li>';
    } else {
        insights += '<li><strong>Recovery optimization needed.</strong> Consider experimenting with different activities or longer sessions to improve mental restoration.</li>';
    }

    if (bestActivity) {
        const activityName = bestActivity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        insights += `<li><strong>Most effective activity:</strong> ${activityName} shows the highest overall effectiveness (${bestAvgEffectiveness.toFixed(1)}/10 average).</li>`;
    }

    if (optimalDuration > 0) {
        insights += `<li><strong>Optimal session duration:</strong> ${optimalDuration}-${optimalDuration + 9} minute sessions show the best recovery results.</li>`;
    }

    if (avgPreFatigue >= 7) {
        insights += '<li><strong>High baseline fatigue detected.</strong> Consider incorporating more frequent, shorter reset sessions throughout your day to prevent mental fatigue accumulation.</li>';
    }

    if (avgSessionDuration < 15) {
        insights += '<li><strong>Session duration consideration.</strong> Your average sessions are quite short. Longer sessions (15-30 minutes) may provide more substantial mental recovery benefits.</li>';
    }

    insights += '<li><strong>Mental reset recommendations:</strong> Schedule regular breaks before fatigue reaches high levels, combine activities (e.g., walking + deep breathing), and track which times of day work best for your mental recovery.</li>';
    insights += '</ul>';

    insightsDiv.innerHTML = insights;
}

function updateSessionList() {
    const sessionList = document.getElementById('sessionList');
    sessionList.innerHTML = '';

    // Show last 10 entries
    const recentEntries = mentalEntries.slice(-10).reverse();

    recentEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'session-entry';

        const recoveryStatus = getRecoveryStatus(entry.recoveryRate);

        entryDiv.innerHTML = `
            <div class="session-header">
                <div class="session-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="recovery-rate ${recoveryStatus.class}">${recoveryStatus.status} (${entry.recoveryRate}%)</div>
            </div>
            <div class="session-details">
                <div class="detail-item">
                    <div class="detail-label">Activity</div>
                    <div class="detail-value">${entry.resetActivity.replace('-', ' ')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Duration</div>
                    <div class="detail-value">${entry.sessionDuration} min</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Pre-Fatigue</div>
                    <div class="detail-value">${entry.preFatigueLevel}/10</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Post-Fatigue</div>
                    <div class="detail-value">${entry.postFatigueLevel}/10</div>
                </div>
            </div>
            <div class="session-metrics">
                <div class="metric-item">
                    <div class="metric-label">Mental Clarity</div>
                    <div class="metric-value">${entry.mentalClarity}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Stress Reduction</div>
                    <div class="metric-value">${entry.stressReduction}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Effectiveness</div>
                    <div class="metric-value">${entry.resetEffectiveness}/10</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Score</div>
                    <div class="metric-value">${entry.effectivenessScore}/10</div>
                </div>
            </div>
            ${entry.notes ? `<div class="session-notes">${entry.notes}</div>` : ''}
            <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        `;

        sessionList.appendChild(entryDiv);
    });
}

function deleteEntry(id) {
    if (confirm('Are you sure you want to delete this mental reset session?')) {
        mentalEntries = mentalEntries.filter(entry => entry.id !== id);
        localStorage.setItem('mentalResetEntries', JSON.stringify(mentalEntries));
        updateStats();
        updateChart();
        updateInsights();
        updateSessionList();
    }
}

// Update effectiveness value display
document.getElementById('resetEffectiveness').addEventListener('input', function() {
    document.getElementById('effectivenessValue').textContent = this.value;
});

// Timer event listeners
document.getElementById('startBtn').addEventListener('click', startTimer);
document.getElementById('pauseBtn').addEventListener('click', pauseTimer);
document.getElementById('resetBtn').addEventListener('click', resetTimer);

// Form submission
document.getElementById('mentalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    logSession();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;

    updateStats();
    updateChart();
    updateInsights();
    updateSessionList();
});