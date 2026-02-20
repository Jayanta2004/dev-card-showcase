// static-posture-duration-alert.js

let currentSession = null;
let sessionTimer = null;
let alertTimer = null;
let reminderTimer = null;
let sessionLogs = JSON.parse(localStorage.getItem('postureSessions')) || [];
let reminders = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();

    // Event listeners
    document.getElementById('startSession').addEventListener('click', startSession);
    document.getElementById('pauseSession').addEventListener('click', pauseSession);
    document.getElementById('endSession').addEventListener('click', endSession);

    document.getElementById('postureType').addEventListener('change', updateCurrentPosture);
    document.getElementById('alertThreshold').addEventListener('change', saveSettings);
    document.getElementById('reminderInterval').addEventListener('change', saveSettings);
    document.getElementById('breakDuration').addEventListener('change', saveSettings);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterHistory(this.dataset.filter);
        });
    });
});

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('postureSettings')) || {};
    document.getElementById('postureType').value = settings.postureType || 'sitting';
    document.getElementById('alertThreshold').value = settings.alertThreshold || 30;
    document.getElementById('reminderInterval').value = settings.reminderInterval || 5;
    document.getElementById('breakDuration').value = settings.breakDuration || 2;
}

function saveSettings() {
    const settings = {
        postureType: document.getElementById('postureType').value,
        alertThreshold: parseInt(document.getElementById('alertThreshold').value),
        reminderInterval: parseInt(document.getElementById('reminderInterval').value),
        breakDuration: parseInt(document.getElementById('breakDuration').value)
    };
    localStorage.setItem('postureSettings', JSON.stringify(settings));
}

function updateCurrentPosture() {
    const postureType = document.getElementById('postureType').value;
    document.getElementById('currentPosture').textContent = postureType.charAt(0).toUpperCase() + postureType.slice(1);
    saveSettings();
}

function startSession() {
    if (currentSession && !currentSession.paused) return;

    const postureType = document.getElementById('postureType').value;
    const alertThreshold = parseInt(document.getElementById('alertThreshold').value);
    const reminderInterval = parseInt(document.getElementById('reminderInterval').value);

    if (currentSession && currentSession.paused) {
        // Resume session
        currentSession.paused = false;
        currentSession.resumeTime = Date.now();
        document.getElementById('startSession').innerHTML = '<i class="fas fa-play"></i> Resume Tracking';
        document.getElementById('pauseSession').disabled = false;
    } else {
        // Start new session
        currentSession = {
            id: Date.now(),
            startTime: Date.now(),
            postureType: postureType,
            duration: 0,
            alerts: 0,
            reminders: 0,
            breaks: 0,
            paused: false,
            pausedDuration: 0
        };
        document.getElementById('startSession').innerHTML = '<i class="fas fa-play"></i> Start Tracking';
        document.getElementById('pauseSession').disabled = false;
    }

    document.getElementById('endSession').disabled = false;
    document.getElementById('startSession').disabled = true;

    // Start timers
    startSessionTimer();
    startAlertTimer();
    startReminderTimer();

    updateAlertStatus();
    addReminder('Session started. Timer is running.', 'info');
}

function pauseSession() {
    if (!currentSession || currentSession.paused) return;

    currentSession.paused = true;
    currentSession.pausedTime = Date.now();
    document.getElementById('startSession').disabled = false;
    document.getElementById('startSession').innerHTML = '<i class="fas fa-play"></i> Resume Tracking';
    document.getElementById('pauseSession').disabled = true;

    // Stop timers
    clearInterval(sessionTimer);
    clearTimeout(alertTimer);
    clearInterval(reminderTimer);

    addReminder('Session paused. Take a break!', 'reminder');
}

function endSession() {
    if (!currentSession) return;

    // Calculate final duration
    const endTime = Date.now();
    const totalDuration = Math.floor((endTime - currentSession.startTime - currentSession.pausedDuration) / 1000 / 60);

    currentSession.endTime = endTime;
    currentSession.duration = totalDuration;

    // Save session
    sessionLogs.push(currentSession);
    saveSessions();

    // Reset UI
    currentSession = null;
    document.getElementById('currentTimer').textContent = '00:00:00';
    document.getElementById('startSession').disabled = false;
    document.getElementById('startSession').innerHTML = '<i class="fas fa-play"></i> Start Tracking';
    document.getElementById('pauseSession').disabled = true;
    document.getElementById('endSession').disabled = true;

    // Stop timers
    clearInterval(sessionTimer);
    clearTimeout(alertTimer);
    clearInterval(reminderTimer);

    // Update UI
    updateStats();
    updateCharts();
    updateInsights();
    displayHistory();

    addReminder('Session ended. Great job staying mindful of your posture!', 'info');
    updateAlertStatus();
}

function startSessionTimer() {
    sessionTimer = setInterval(() => {
        if (!currentSession || currentSession.paused) return;

        const elapsed = Math.floor((Date.now() - currentSession.startTime - currentSession.pausedDuration) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;

        document.getElementById('currentTimer').textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update timer circle progress
        updateTimerProgress(elapsed);
    }, 1000);
}

function startAlertTimer() {
    const alertThreshold = parseInt(document.getElementById('alertThreshold').value) * 60 * 1000; // Convert to milliseconds

    alertTimer = setTimeout(() => {
        if (!currentSession || currentSession.paused) return;

        currentSession.alerts++;
        addReminder(`⚠️ ALERT: You've been ${currentSession.postureType} for ${document.getElementById('alertThreshold').value} minutes! Take a break to prevent strain.`, 'alert');
        updateAlertStatus();

        // Continue with reminders
        startReminderTimer();
    }, alertThreshold);
}

function startReminderTimer() {
    const reminderInterval = parseInt(document.getElementById('reminderInterval').value) * 60 * 1000; // Convert to milliseconds

    reminderTimer = setInterval(() => {
        if (!currentSession || currentSession.paused) return;

        currentSession.reminders++;
        const breakDuration = document.getElementById('breakDuration').value;
        addReminder(`💡 Reminder: Consider taking a ${breakDuration}-minute break. Stretch, walk around, or change positions.`, 'reminder');
    }, reminderInterval);
}

function updateTimerProgress(elapsed) {
    const alertThreshold = parseInt(document.getElementById('alertThreshold').value) * 60;
    const progress = Math.min((elapsed / alertThreshold) * 360, 360);

    const timerCircle = document.querySelector('.timer-circle');
    if (progress >= 270) {
        timerCircle.className = 'timer-circle alert';
    } else if (progress >= 180) {
        timerCircle.className = 'timer-circle warning';
    } else {
        timerCircle.className = 'timer-circle';
    }

    timerCircle.style.background = `conic-gradient(var(--primary-color, #4CAF50) ${progress}deg, #f0f0f0 ${progress}deg)`;
}

function updateAlertStatus() {
    const alertIndicator = document.getElementById('alertIndicator');
    const icon = alertIndicator.querySelector('i');
    const text = alertIndicator.querySelector('span');

    if (!currentSession) {
        alertIndicator.className = 'alert-indicator safe';
        icon.className = 'fas fa-check-circle';
        text.textContent = 'No active session';
        return;
    }

    const elapsed = Math.floor((Date.now() - currentSession.startTime - currentSession.pausedDuration) / 1000 / 60);
    const alertThreshold = parseInt(document.getElementById('alertThreshold').value);

    if (elapsed >= alertThreshold) {
        alertIndicator.className = 'alert-indicator alert';
        icon.className = 'fas fa-exclamation-triangle';
        text.textContent = 'Alert threshold exceeded!';
    } else if (elapsed >= alertThreshold * 0.8) {
        alertIndicator.className = 'alert-indicator warning';
        icon.className = 'fas fa-exclamation-circle';
        text.textContent = 'Approaching alert threshold';
    } else {
        alertIndicator.className = 'alert-indicator safe';
        icon.className = 'fas fa-check-circle';
        text.textContent = 'Within safe limits';
    }
}

function addReminder(message, type = 'info') {
    const reminder = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message: message,
        type: type
    };

    reminders.unshift(reminder);

    // Keep only last 10 reminders
    if (reminders.length > 10) {
        reminders = reminders.slice(0, 10);
    }

    displayReminders();
}

function displayReminders() {
    const remindersList = document.getElementById('remindersList');
    remindersList.innerHTML = '';

    if (reminders.length === 0) {
        remindersList.innerHTML = '<div class="reminder-item"><i class="fas fa-info-circle"></i><span>Configure your posture settings above and start tracking to receive movement reminders.</span></div>';
        return;
    }

    reminders.forEach(reminder => {
        const reminderItem = document.createElement('div');
        reminderItem.className = `reminder-item ${reminder.type}`;

        const time = new Date(reminder.timestamp).toLocaleTimeString();
        reminderItem.innerHTML = `
            <i class="fas fa-${reminder.type === 'alert' ? 'exclamation-triangle' : reminder.type === 'reminder' ? 'bell' : 'info-circle'}"></i>
            <div>
                <span>${reminder.message}</span>
                <small style="display: block; margin-top: 0.25rem; opacity: 0.7;">${time}</small>
            </div>
        `;

        remindersList.appendChild(reminderItem);
    });
}

function saveSessions() {
    localStorage.setItem('postureSessions', JSON.stringify(sessionLogs));
}

function updateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = sessionLogs.filter(session => {
        const sessionDate = new Date(session.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
    });

    let totalSitting = 0;
    let totalStanding = 0;
    let totalAlerts = 0;
    let totalBreaks = 0;

    todaySessions.forEach(session => {
        if (session.postureType === 'sitting') {
            totalSitting += session.duration;
        } else {
            totalStanding += session.duration;
        }
        totalAlerts += session.alerts || 0;
        totalBreaks += session.breaks || 0;
    });

    document.getElementById('totalSittingTime').textContent = `${totalSitting} min`;
    document.getElementById('totalStandingTime').textContent = `${totalStanding} min`;
    document.getElementById('alertsTriggered').textContent = totalAlerts;
    document.getElementById('breaksTaken').textContent = totalBreaks;
}

function updateCharts() {
    updateDailyPostureChart();
    updateSessionTrendsChart();
}

function updateDailyPostureChart() {
    const today = new Date();
    const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return date;
    }).reverse();

    const dailyData = last7Days.map(date => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const daySessions = sessionLogs.filter(session =>
            session.startTime >= dayStart.getTime() && session.startTime <= dayEnd.getTime()
        );

        const sitting = daySessions
            .filter(s => s.postureType === 'sitting')
            .reduce((sum, s) => sum + s.duration, 0);

        const standing = daySessions
            .filter(s => s.postureType === 'standing')
            .reduce((sum, s) => sum + s.duration, 0);

        return { sitting, standing };
    });

    const ctx = document.getElementById('dailyPostureChart').getContext('2d');
    if (window.dailyPostureChart) {
        window.dailyPostureChart.destroy();
    }

    window.dailyPostureChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last7Days.map(date => date.toLocaleDateString('en-US', { weekday: 'short' })),
            datasets: [{
                label: 'Sitting (min)',
                data: dailyData.map(d => d.sitting),
                backgroundColor: '#4CAF50',
                borderRadius: 4
            }, {
                label: 'Standing (min)',
                data: dailyData.map(d => d.standing),
                backgroundColor: '#2196F3',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y} min`
                    }
                }
            }
        }
    });
}

function updateSessionTrendsChart() {
    const sortedSessions = sessionLogs
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(-20); // Last 20 sessions

    const labels = sortedSessions.map(session => new Date(session.startTime));
    const durations = sortedSessions.map(session => session.duration);

    const ctx = document.getElementById('sessionTrendsChart').getContext('2d');
    if (window.sessionTrendsChart) {
        window.sessionTrendsChart.destroy();
    }

    window.sessionTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Session Duration (min)',
                data: durations,
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM dd'
                        }
                    }
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y} minutes`
                    }
                }
            }
        }
    });
}

function updateInsights() {
    // Posture balance
    const totalSessions = sessionLogs.length;
    if (totalSessions === 0) {
        document.getElementById('postureBalance').textContent = 'No data available yet. Start tracking to see your posture balance insights.';
        document.getElementById('riskAssessment').textContent = 'Track your sessions to receive personalized risk assessments.';
        document.getElementById('improvementTips').textContent = 'Movement reminders will help you maintain better posture habits.';
        return;
    }

    const sittingSessions = sessionLogs.filter(s => s.postureType === 'sitting').length;
    const standingSessions = sessionLogs.filter(s => s.postureType === 'standing').length;
    const sittingPercentage = Math.round((sittingSessions / totalSessions) * 100);
    const standingPercentage = Math.round((standingSessions / totalSessions) * 100);

    document.getElementById('postureBalance').textContent =
        `You spend ${sittingPercentage}% of your sessions sitting and ${standingPercentage}% standing. ` +
        `Aim for a more balanced distribution to reduce strain on any single posture.`;

    // Risk assessment
    const avgDuration = sessionLogs.reduce((sum, s) => sum + s.duration, 0) / totalSessions;
    const totalAlerts = sessionLogs.reduce((sum, s) => sum + (s.alerts || 0), 0);
    const alertRate = totalAlerts / totalSessions;

    let riskLevel = 'Low';
    let riskText = 'Your posture habits appear healthy with good awareness of position changes.';

    if (avgDuration > 45 || alertRate > 0.5) {
        riskLevel = 'High';
        riskText = 'Consider reducing session lengths and taking more frequent breaks to prevent musculoskeletal strain.';
    } else if (avgDuration > 30 || alertRate > 0.2) {
        riskLevel = 'Medium';
        riskText = 'Your sessions are moderately long. Consider shorter sessions or more frequent position changes.';
    }

    document.getElementById('riskAssessment').textContent = `Risk Level: ${riskLevel}. ${riskText}`;

    // Improvement tips
    const tips = [];
    if (avgDuration > 30) {
        tips.push('Try setting shorter alert thresholds to encourage more frequent breaks.');
    }
    if (alertRate > 0.3) {
        tips.push('Consider standing up and stretching every 20-30 minutes.');
    }
    if (sittingPercentage > 80) {
        tips.push('Try incorporating more standing time into your routine.');
    }
    if (tips.length === 0) {
        tips.push('Great job! Your posture habits are well-balanced. Keep up the good work.');
    }

    document.getElementById('improvementTips').textContent = tips.join(' ');
}

function displayHistory(filter = 'all') {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    let filteredSessions = sessionLogs;

    if (filter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredSessions = sessionLogs.filter(session => {
            const sessionDate = new Date(session.startTime);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
        });
    } else if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredSessions = sessionLogs.filter(session =>
            new Date(session.startTime) >= oneWeekAgo
        );
    }

    // Sort by most recent first
    filteredSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    const historyDiv = document.getElementById('sessionHistory');
    historyDiv.innerHTML = '';

    if (filteredSessions.length === 0) {
        historyDiv.innerHTML = '<div class="history-placeholder"><i class="fas fa-inbox"></i><p>No sessions found for the selected period.</p></div>';
        return;
    }

    filteredSessions.forEach(session => {
        const entry = document.createElement('div');
        entry.className = 'session-entry';

        const startTime = new Date(session.startTime).toLocaleString();
        const duration = session.duration || Math.floor((session.endTime - session.startTime) / 1000 / 60);

        entry.innerHTML = `
            <h4>
                ${session.postureType.charAt(0).toUpperCase() + session.postureType.slice(1)} Session
                <button class="delete-btn" onclick="deleteSession(${session.id})">×</button>
            </h4>
            <div class="session-details">
                <div class="detail-item">
                    <span class="detail-label">Start Time</span>
                    <span class="detail-value">${startTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Duration</span>
                    <span class="detail-value">${duration} min</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Alerts</span>
                    <span class="detail-value">${session.alerts || 0}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Reminders</span>
                    <span class="detail-value">${session.reminders || 0}</span>
                </div>
            </div>
        `;

        historyDiv.appendChild(entry);
    });
}

function filterHistory(filter) {
    displayHistory(filter);
}

function deleteSession(id) {
    if (confirm('Are you sure you want to delete this session?')) {
        sessionLogs = sessionLogs.filter(session => session.id !== id);
        saveSessions();
        updateStats();
        updateCharts();
        updateInsights();
        displayHistory();
    }
}

// Update alert status periodically
setInterval(updateAlertStatus, 30000); // Every 30 seconds