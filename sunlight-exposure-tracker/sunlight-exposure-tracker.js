// Sunlight Exposure Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeCharts();
    updateDisplay();

    // Event listeners
    document.getElementById('sunlightForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('updateGoalBtn').addEventListener('click', updateDailyGoal);
    document.getElementById('viewWeek').addEventListener('click', () => switchChartView('week'));
    document.getElementById('viewMonth').addEventListener('click', () => switchChartView('month'));
});

function handleFormSubmit(e) {
    e.preventDefault();

    const session = {
        duration: parseInt(document.getElementById('duration').value),
        activity: document.getElementById('activity').value,
        timeOfDay: document.getElementById('timeOfDay').value,
        uvIndex: document.getElementById('uvIndex').value ? parseFloat(document.getElementById('uvIndex').value) : null,
        notes: document.getElementById('notes').value.trim(),
        timestamp: new Date().toISOString(),
        date: new Date().toDateString()
    };

    addSession(session);
    updateDisplay();
    document.getElementById('sunlightForm').reset();

    showNotification('Sunlight session logged successfully!', 'success');
}

function addSession(session) {
    const data = getData();
    if (!data.sessions) data.sessions = [];
    data.sessions.push(session);
    saveData(data);
}

function updateDailyGoal() {
    const goal = parseInt(document.getElementById('dailyGoal').value);
    if (goal < 10 || goal > 240) {
        showNotification('Please enter a goal between 10 and 240 minutes.', 'error');
        return;
    }

    const data = getData();
    data.dailyGoal = goal;
    saveData(data);
    updateDisplay();

    showNotification('Daily goal updated!', 'success');
}

function getData() {
    const data = localStorage.getItem('sunlightExposureData');
    return data ? JSON.parse(data) : { sessions: [], dailyGoal: 30 };
}

function saveData(data) {
    localStorage.setItem('sunlightExposureData', JSON.stringify(data));
}

function updateDisplay() {
    updateProgress();
    updateSessionsList();
    updateWeeklyOverview();
    updateInsights();
    updateCharts();
    updateHistoryTable();
}

function updateProgress() {
    const data = getData();
    const today = new Date().toDateString();
    const todaysSessions = data.sessions.filter(s => s.date === today);
    const todayMinutes = todaysSessions.reduce((sum, s) => sum + s.duration, 0);
    const goal = data.dailyGoal || 30;
    const percentage = Math.min((todayMinutes / goal) * 100, 100);

    document.getElementById('todayMinutes').textContent = todayMinutes;
    document.getElementById('progressPercent').textContent = Math.round(percentage) + '%';

    // Update progress circle
    const progressFill = document.getElementById('progressFill');
    progressFill.style.background = `conic-gradient(#4299e1 ${percentage * 3.6}deg, #e2e8f0 0deg)`;
}

function updateSessionsList() {
    const data = getData();
    const today = new Date().toDateString();
    const todaysSessions = data.sessions.filter(s => s.date === today);
    const list = document.getElementById('todaySessions');

    if (todaysSessions.length === 0) {
        list.innerHTML = '<p class="empty-state">No sunlight sessions logged today.</p>';
        return;
    }

    list.innerHTML = '';
    todaysSessions.forEach((session, index) => {
        const item = document.createElement('div');
        item.className = 'session-item';

        const timeOfDay = session.timeOfDay ? session.timeOfDay.charAt(0).toUpperCase() + session.timeOfDay.slice(1) : 'Unknown';
        const activity = session.activity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

        item.innerHTML = `
            <div class="session-details">
                <div class="session-duration">${session.duration} minutes</div>
                <div class="session-meta">${activity} • ${timeOfDay}${session.uvIndex ? ` • UV ${session.uvIndex}` : ''}</div>
            </div>
            <button class="btn-remove" onclick="removeSession(${data.sessions.indexOf(session)})">×</button>
        `;

        list.appendChild(item);
    });
}

function removeSession(index) {
    const data = getData();
    data.sessions.splice(index, 1);
    saveData(data);
    updateDisplay();
}

function updateWeeklyOverview() {
    const data = getData();
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekSessions = data.sessions.filter(s => new Date(s.date) >= weekAgo);
    const weekTotal = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    const weekAverage = Math.round(weekTotal / 7);

    // Count goal met days
    const goalMetDays = new Set();
    weekSessions.forEach(session => {
        const daySessions = data.sessions.filter(s => s.date === session.date);
        const dayTotal = daySessions.reduce((sum, s) => sum + s.duration, 0);
        if (dayTotal >= (data.dailyGoal || 30)) {
            goalMetDays.add(session.date);
        }
    });

    // Find best day
    const dayTotals = {};
    weekSessions.forEach(session => {
        dayTotals[session.date] = (dayTotals[session.date] || 0) + session.duration;
    });
    const bestDay = Math.max(...Object.values(dayTotals), 0);

    document.getElementById('weekTotal').textContent = weekTotal + ' min';
    document.getElementById('weekAverage').textContent = weekAverage + ' min';
    document.getElementById('goalMetDays').textContent = goalMetDays.size + '/7 days';
    document.getElementById('bestDay').textContent = bestDay + ' min';
}

function updateInsights() {
    const data = getData();
    const insights = [];

    if (data.sessions.length === 0) return;

    // Check if meeting daily goal
    const today = new Date().toDateString();
    const todaysSessions = data.sessions.filter(s => s.date === today);
    const todayTotal = todaysSessions.reduce((sum, s) => sum + s.duration, 0);
    const goal = data.dailyGoal || 30;

    if (todayTotal === 0) {
        insights.push({
            title: 'Get Some Sun!',
            text: 'You haven\'t logged any sunlight exposure today. Try to spend at least 15-30 minutes outdoors to maintain healthy vitamin D levels.'
        });
    } else if (todayTotal < goal * 0.5) {
        insights.push({
            title: 'More Sunlight Needed',
            text: `You've only logged ${todayTotal} minutes today. Aim for at least ${goal} minutes of sunlight exposure for optimal health benefits.`
        });
    } else if (todayTotal >= goal) {
        insights.push({
            title: 'Goal Achieved!',
            text: 'Great job meeting your daily sunlight goal! Consistent sunlight exposure supports vitamin D production and circadian rhythm.'
        });
    }

    // Check for patterns
    const recentSessions = data.sessions.slice(-10);
    if (recentSessions.length >= 5) {
        const morningSessions = recentSessions.filter(s => s.timeOfDay === 'morning').length;
        const afternoonSessions = recentSessions.filter(s => s.timeOfDay === 'afternoon').length;

        if (morningSessions > afternoonSessions * 2) {
            insights.push({
                title: 'Morning Sun Preference',
                text: 'You tend to get most of your sunlight in the morning. This is great for setting your circadian rhythm!'
            });
        }
    }

    // UV awareness
    const sessionsWithUV = data.sessions.filter(s => s.uvIndex !== null);
    if (sessionsWithUV.length > 0) {
        const avgUV = sessionsWithUV.reduce((sum, s) => sum + s.uvIndex, 0) / sessionsWithUV.length;
        if (avgUV > 7) {
            insights.push({
                title: 'High UV Exposure',
                text: 'Your recent sessions have high UV index readings. Remember to protect your skin and eyes during peak sun hours.'
            });
        }
    }

    // Activity variety
    const activities = [...new Set(data.sessions.map(s => s.activity))];
    if (activities.length >= 3) {
        insights.push({
            title: 'Active Lifestyle',
            text: 'You\'re getting sunlight through various activities. This variety helps maintain both physical and mental health!'
        });
    }

    if (insights.length === 0) {
        insights.push({
            title: 'Keep Tracking!',
            text: 'Continue logging your sunlight exposure to discover patterns and optimize your outdoor time for better health.'
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
    const exposureCtx = document.getElementById('exposureChart').getContext('2d');
    const activityCtx = document.getElementById('activityChart').getContext('2d');

    window.exposureChart = new Chart(exposureCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Sunlight Exposure (minutes)',
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
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Minutes'
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

    window.activityChart = new Chart(activityCtx, {
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
                    '#d69e2e'
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

function switchChartView(view) {
    document.getElementById('viewWeek').classList.toggle('active', view === 'week');
    document.getElementById('viewMonth').classList.toggle('active', view === 'month');
    updateCharts(view);
}

function updateCharts(view = 'week') {
    const data = getData();
    const days = view === 'week' ? 7 : 30;
    const recent = data.sessions.slice(-days * 5); // Approximate sessions

    // Group by date
    const dateTotals = {};
    recent.forEach(session => {
        dateTotals[session.date] = (dateTotals[session.date] || 0) + session.duration;
    });

    // Create labels for last N days
    const labels = [];
    const values = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        labels.push(date.toLocaleDateString());
        values.push(dateTotals[dateStr] || 0);
    }

    window.exposureChart.data.labels = labels;
    window.exposureChart.data.datasets[0].data = values;
    window.exposureChart.update();

    // Activity breakdown
    const activityCounts = {};
    data.sessions.forEach(session => {
        activityCounts[session.activity] = (activityCounts[session.activity] || 0) + session.duration;
    });

    const activityLabels = Object.keys(activityCounts).map(activity =>
        activity.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    const activityData = Object.values(activityCounts);

    window.activityChart.data.labels = activityLabels;
    window.activityChart.data.datasets[0].data = activityData;
    window.activityChart.update();
}

function updateHistoryTable() {
    const data = getData();
    const history = {};

    // Group sessions by date
    data.sessions.forEach(session => {
        if (!history[session.date]) {
            history[session.date] = [];
        }
        history[session.date].push(session);
    });

    const tbody = document.getElementById('historyBody');
    const dates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));

    if (dates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No data logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    dates.forEach(date => {
        const sessions = history[date];
        const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        const goal = data.dailyGoal || 30;
        const goalMet = totalMinutes >= goal;
        const topActivity = getTopActivity(sessions);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(date).toLocaleDateString()}</td>
            <td>${totalMinutes}</td>
            <td>${sessions.length}</td>
            <td class="${goalMet ? 'goal-met' : 'goal-not-met'}">${goalMet ? 'Yes' : 'No'}</td>
            <td>${topActivity}</td>
        `;

        tbody.appendChild(row);
    });
}

function getTopActivity(sessions) {
    if (sessions.length === 0) return '-';

    const activityTotals = {};
    sessions.forEach(session => {
        activityTotals[session.activity] = (activityTotals[session.activity] || 0) + session.duration;
    });

    const top = Object.keys(activityTotals).reduce((a, b) =>
        activityTotals[a] > activityTotals[b] ? a : b
    );

    return top.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function loadData() {
    const data = getData();
    document.getElementById('dailyGoal').value = data.dailyGoal || 30;
}

function showNotification(message, type) {
    alert(message);
}