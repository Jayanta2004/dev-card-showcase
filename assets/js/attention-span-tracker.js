let focusSessions = JSON.parse(localStorage.getItem('focusSessions')) || [];

// Current environment data
let currentEnvironment = {
    timeOfDay: '',
    dayOfWeek: '',
    focusScore: 0,
    currentStreak: 0
};

const focusTips = [
    "Use the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break.",
    "Create a dedicated workspace free from distractions and visual clutter.",
    "Stay hydrated and maintain proper nutrition to support brain function.",
    "Practice mindfulness meditation for 10 minutes daily to improve concentration.",
    "Break complex tasks into smaller, manageable chunks to maintain focus.",
    "Limit multitasking and focus on one task at a time for better results.",
    "Get adequate sleep (7-9 hours) as sleep deprivation severely impacts focus.",
    "Exercise regularly to improve blood flow to the brain and cognitive function.",
    "Use background noise or white noise to mask distracting sounds if needed.",
    "Set specific goals for each work session and reward yourself upon completion."
];

function updateRatingValue() {
    document.getElementById('ratingValue').textContent = document.getElementById('focusRating').value;
}

function updateEnvironment() {
    const now = new Date();
    const hours = now.getHours();

    // Determine time of day
    if (hours >= 5 && hours < 12) {
        currentEnvironment.timeOfDay = 'Morning';
    } else if (hours >= 12 && hours < 17) {
        currentEnvironment.timeOfDay = 'Afternoon';
    } else if (hours >= 17 && hours < 21) {
        currentEnvironment.timeOfDay = 'Evening';
    } else {
        currentEnvironment.timeOfDay = 'Night';
    }

    // Day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    currentEnvironment.dayOfWeek = days[now.getDay()];

    // Calculate focus score (based on recent sessions)
    calculateFocusScore();

    // Calculate current streak
    calculateStreak();

    updateEnvironmentDisplay();
    updateAlerts();
}

function calculateFocusScore() {
    if (focusSessions.length === 0) {
        currentEnvironment.focusScore = 50; // Default neutral score
        return;
    }

    // Calculate average focus from last 7 sessions
    const recentSessions = focusSessions.slice(-7);
    const avgFocus = recentSessions.reduce((sum, session) => sum + session.focusRating, 0) / recentSessions.length;

    // Factor in consistency (lower variance = higher score)
    const variance = recentSessions.reduce((sum, session) => {
        return sum + Math.pow(session.focusRating - avgFocus, 2);
    }, 0) / recentSessions.length;

    const consistencyBonus = Math.max(0, 10 - Math.sqrt(variance));

    currentEnvironment.focusScore = Math.round(Math.min(100, (avgFocus * 10) + consistencyBonus));
}

function calculateStreak() {
    if (focusSessions.length === 0) {
        currentEnvironment.currentStreak = 0;
        return;
    }

    let streak = 0;
    const today = new Date().toDateString();

    // Check if there's a session today
    const todaySessions = focusSessions.filter(session =>
        new Date(session.dateTime).toDateString() === today
    );

    if (todaySessions.length === 0) {
        currentEnvironment.currentStreak = 0;
        return;
    }

    // Count consecutive days with sessions
    const sortedSessions = [...focusSessions].sort((a, b) =>
        new Date(b.dateTime) - new Date(a.dateTime)
    );

    let currentDate = new Date(today);
    for (let i = 0; i < sortedSessions.length; i++) {
        const sessionDate = new Date(sortedSessions[i].dateTime).toDateString();
        const expectedDate = currentDate.toDateString();

        if (sessionDate === expectedDate) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    currentEnvironment.currentStreak = streak;
}

function updateEnvironmentDisplay() {
    document.getElementById('currentTime').textContent = currentEnvironment.timeOfDay;
    document.getElementById('currentDay').textContent = currentEnvironment.dayOfWeek;
    document.getElementById('focusScore').textContent = `${currentEnvironment.focusScore}/100`;
    document.getElementById('currentStreak').textContent = `${currentEnvironment.currentStreak} days`;
}

function logSession() {
    const focusRating = parseInt(document.getElementById('focusRating').value);
    const sessionType = document.getElementById('sessionType').value;
    const duration = parseInt(document.getElementById('sessionDuration').value);
    const dateTime = document.getElementById('sessionDateTime').value;
    const productivityLevel = document.getElementById('productivityLevel').value;
    const notes = document.getElementById('sessionNotes').value;

    // Get selected distractions
    const distractionCheckboxes = document.querySelectorAll('.distraction-checkboxes input:checked');
    const distractions = Array.from(distractionCheckboxes).map(cb => cb.value);

    if (!dateTime || !sessionType) {
        alert('Please select session type and date/time');
        return;
    }

    const session = {
        focusRating,
        sessionType,
        duration,
        dateTime,
        productivityLevel,
        distractions,
        notes,
        environmentData: { ...currentEnvironment },
        timestamp: new Date().getTime()
    };

    focusSessions.push(session);
    localStorage.setItem('focusSessions', JSON.stringify(focusSessions));

    updateStats();
    updateAnalysis();
    updateHistory();
    drawChart();
    updateEnvironment();

    // Clear form
    document.getElementById('focusRating').value = 7;
    document.getElementById('ratingValue').textContent = '7';
    document.getElementById('sessionType').selectedIndex = 0;
    document.getElementById('sessionDuration').value = '';
    document.getElementById('sessionDateTime').value = '';
    document.getElementById('productivityLevel').selectedIndex = 2; // Moderate
    document.querySelectorAll('.distraction-checkboxes input').forEach(cb => cb.checked = false);
    document.getElementById('sessionNotes').value = '';
}

function updateStats() {
    const totalSessions = focusSessions.length;
    const avgFocus = focusSessions.length ?
        (focusSessions.reduce((sum, session) => sum + session.focusRating, 0) / focusSessions.length).toFixed(1) : 0;

    // Sessions this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklySessions = focusSessions.filter(session => new Date(session.dateTime) > oneWeekAgo).length;

    // Best performing session type
    const typePerformance = {};
    focusSessions.forEach(session => {
        if (!typePerformance[session.sessionType]) {
            typePerformance[session.sessionType] = { total: 0, count: 0 };
        }
        typePerformance[session.sessionType].total += session.focusRating;
        typePerformance[session.sessionType].count++;
    });

    let bestType = 'None';
    let bestAvg = 0;
    Object.entries(typePerformance).forEach(([type, data]) => {
        const avg = data.total / data.count;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestType = type.replace('-', ' ');
        }
    });

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('avgFocus').textContent = avgFocus;
    document.getElementById('weeklySessions').textContent = weeklySessions;
    document.getElementById('bestSession').textContent = bestType;
}

function updateAnalysis() {
    updateTopDistractions();
    updateBestTimes();
    updateSessionPerformance();
}

function updateTopDistractions() {
    const distractionCounts = {};
    focusSessions.forEach(session => {
        session.distractions.forEach(distraction => {
            distractionCounts[distraction] = (distractionCounts[distraction] || 0) + 1;
        });
    });

    const topDistractionsEl = document.getElementById('topDistractions');
    topDistractionsEl.innerHTML = '';

    // Sort by frequency
    const sortedDistractions = Object.entries(distractionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    sortedDistractions.forEach(([distraction, count]) => {
        const div = document.createElement('div');
        div.className = 'distraction-frequency';
        div.innerHTML = `
            <span>${distraction.replace('-', ' ')}</span>
            <span>${count} sessions</span>
        `;
        topDistractionsEl.appendChild(div);
    });
}

function updateBestTimes() {
    const timePerformance = {};
    focusSessions.forEach(session => {
        const hour = new Date(session.dateTime).getHours();
        const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 21 ? 'Evening' : 'Night';

        if (!timePerformance[timeSlot]) {
            timePerformance[timeSlot] = { total: 0, count: 0 };
        }
        timePerformance[timeSlot].total += session.focusRating;
        timePerformance[timeSlot].count++;
    });

    const bestTimesEl = document.getElementById('bestTimes');
    bestTimesEl.innerHTML = '';

    // Sort by average focus rating
    const sortedTimes = Object.entries(timePerformance)
        .map(([time, data]) => ({ time, avg: data.total / data.count, count: data.count }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3);

    sortedTimes.forEach(({ time, avg, count }) => {
        const div = document.createElement('div');
        div.className = 'time-frequency';
        div.innerHTML = `
            <span>${time}</span>
            <span>${avg.toFixed(1)}/10 (${count})</span>
        `;
        bestTimesEl.appendChild(div);
    });
}

function updateSessionPerformance() {
    const typePerformance = {};
    focusSessions.forEach(session => {
        if (!typePerformance[session.sessionType]) {
            typePerformance[session.sessionType] = { total: 0, count: 0 };
        }
        typePerformance[session.sessionType].total += session.focusRating;
        typePerformance[session.sessionType].count++;
    });

    const performanceEl = document.getElementById('sessionPerformance');
    performanceEl.innerHTML = '';

    // Sort by average performance
    const sortedTypes = Object.entries(typePerformance)
        .map(([type, data]) => ({ type, avg: data.total / data.count, count: data.count }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5);

    sortedTypes.forEach(({ type, avg, count }) => {
        const div = document.createElement('div');
        div.className = 'performance-item';
        div.innerHTML = `
            <span>${type.replace('-', ' ')}</span>
            <span>${avg.toFixed(1)}/10 (${count})</span>
        `;
        performanceEl.appendChild(div);
    });
}

function updateAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    const alerts = [];

    // Low focus score alert
    if (currentEnvironment.focusScore < 40) {
        alerts.push({
            type: 'high',
            icon: '🧠',
            message: 'Your focus score is low. Consider taking a break or trying focus improvement techniques.'
        });
    }

    // Broken streak alert
    if (currentEnvironment.currentStreak === 0 && focusSessions.length > 0) {
        const lastSession = new Date(focusSessions[focusSessions.length - 1].dateTime);
        const daysSince = Math.floor((new Date() - lastSession) / (1000 * 60 * 60 * 24));
        if (daysSince > 1) {
            alerts.push({
                type: 'moderate',
                icon: '📅',
                message: `It's been ${daysSince} days since your last focus session. Try to maintain consistency!`
            });
        }
    }

    // High distraction alert
    const recentSessions = focusSessions.slice(-5);
    if (recentSessions.length >= 3) {
        const avgDistractions = recentSessions.reduce((sum, session) => sum + session.distractions.length, 0) / recentSessions.length;
        if (avgDistractions >= 3) {
            alerts.push({
                type: 'moderate',
                icon: '🚫',
                message: 'High distraction levels detected. Consider creating a more focused environment.'
            });
        }
    }

    // Peak performance time suggestion
    const currentHour = new Date().getHours();
    const currentTimeSlot = currentHour < 12 ? 'Morning' : currentHour < 17 ? 'Afternoon' : currentHour < 21 ? 'Evening' : 'Night';

    if (focusSessions.length >= 5) {
        const bestTime = getBestFocusTime();
        if (bestTime && bestTime !== currentTimeSlot) {
            alerts.push({
                type: 'info',
                icon: '⏰',
                message: `Your best focus time is ${bestTime.toLowerCase()}. Consider scheduling important tasks then.`
            });
        }
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'info',
            icon: '✅',
            message: 'Focus levels look good! Keep up the great work.'
        });
    }

    alerts.forEach(alert => {
        const div = document.createElement('div');
        div.className = `alert-item alert-${alert.type}`;
        div.innerHTML = `
            <span class="icon">${alert.icon}</span>
            <span>${alert.message}</span>
        `;
        alertsContainer.appendChild(div);
    });
}

function getBestFocusTime() {
    const timePerformance = {};
    focusSessions.forEach(session => {
        const hour = new Date(session.dateTime).getHours();
        const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 21 ? 'Evening' : 'Night';

        if (!timePerformance[timeSlot]) {
            timePerformance[timeSlot] = { total: 0, count: 0 };
        }
        timePerformance[timeSlot].total += session.focusRating;
        timePerformance[timeSlot].count++;
    });

    let bestTime = null;
    let bestAvg = 0;

    Object.entries(timePerformance).forEach(([time, data]) => {
        const avg = data.total / data.count;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestTime = time;
        }
    });

    return bestTime;
}

function drawChart() {
    const ctx = document.getElementById('focusChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (focusSessions.length === 0) return;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }

    const dailyFocus = last7Days.map(date => {
        const daySessions = focusSessions.filter(session => session.dateTime.startsWith(date));
        return daySessions.length ? daySessions.reduce((sum, session) => sum + session.focusRating, 0) / daySessions.length : 0;
    });

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / 7;

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;

    dailyFocus.forEach((focus, index) => {
        const x = 25 + index * barWidth;
        const height = (focus / 10) * chartHeight;
        const y = ctx.canvas.height - height - 30;

        const color = focus <= 3 ? '#dc3545' : focus <= 7 ? '#ffc107' : '#28a745';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(focus.toFixed(1), x + 5, y - 5);
        ctx.fillText(last7Days[index].slice(-2), x + 5, ctx.canvas.height - 10);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('sessionHistory');
    historyEl.innerHTML = '';

    focusSessions.slice(-5).reverse().forEach(session => {
        const li = document.createElement('li');
        const severityClass = session.focusRating <= 3 ? 'low' : session.focusRating <= 7 ? 'moderate' : 'high';

        li.innerHTML = `
            <div class="session-header">
                <span>${new Date(session.dateTime).toLocaleString()}</span>
                <span class="severity-badge severity-${severityClass}">Focus: ${session.focusRating}/10</span>
            </div>
            <div class="session-details">
                <strong>${session.sessionType.replace('-', ' ')}</strong> (${session.duration}min)
                <br>Productivity: ${session.productivityLevel.replace('-', ' ')}
                ${session.distractions.length > 0 ? '<br><div class="trigger-tags">Distractions: ' +
                    session.distractions.map(d => `<span class="trigger-tag">${d.replace('-', ' ')}</span>`).join('') +
                    '</div>' : ''}
                ${session.notes ? `<br>Notes: ${session.notes}` : ''}
            </div>
        `;
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = focusTips[Math.floor(Math.random() * focusTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
document.getElementById('sessionDateTime').value = new Date().toISOString().slice(0, 16);
updateEnvironment();
updateStats();
updateAnalysis();
updateHistory();
drawChart();
getNewTip();