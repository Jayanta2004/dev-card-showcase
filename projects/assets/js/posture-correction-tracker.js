let postureChecks = JSON.parse(localStorage.getItem('postureChecks')) || [];
let reminderInterval = localStorage.getItem('postureReminderInterval') || null;
let nextReminderTime = localStorage.getItem('nextReminderTime') || null;

const postureTips = [
    "Sit with your back straight and shoulders relaxed.",
    "Keep your feet flat on the floor and knees at a 90-degree angle.",
    "Position your screen at eye level to avoid straining your neck.",
    "Take breaks every 30 minutes to stand and stretch.",
    "Use a lumbar support cushion for lower back support.",
    "Keep your elbows at a 90-degree angle when typing.",
    "Avoid crossing your legs while sitting.",
    "Adjust your chair height so your arms are parallel to the desk.",
    "Practice the 'wall angel' exercise: stand against a wall with arms at 90 degrees.",
    "Set up your workspace ergonomically before starting work."
];

function logPostureCheck() {
    const rating = parseInt(document.getElementById('postureRating').value);
    const duration = parseInt(document.getElementById('checkDuration').value);
    const timeOfDay = document.getElementById('timeOfDay').value;
    const date = document.getElementById('checkDate').value;
    const notes = document.getElementById('notes').value;

    if (!rating || !duration || !date) {
        alert('Please fill in rating, duration, and date');
        return;
    }

    const check = {
        rating,
        duration,
        timeOfDay,
        date,
        notes,
        timestamp: new Date().getTime()
    };

    postureChecks.push(check);
    localStorage.setItem('postureChecks', JSON.stringify(postureChecks));

    updateStats();
    updateHistory();
    drawChart();

    // Clear inputs
    document.getElementById('postureRating').value = '';
    document.getElementById('checkDuration').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('checkDate').value = '';
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayChecks = postureChecks.filter(check => check.date === today);
    const todayScore = todayChecks.length ?
        Math.round(todayChecks.reduce((sum, check) => sum + check.rating, 0) / todayChecks.length) : 0;

    // Weekly average
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekChecks = postureChecks.filter(check => new Date(check.date) >= oneWeekAgo);
    const weeklyAverage = weekChecks.length ?
        (weekChecks.reduce((sum, check) => sum + check.rating, 0) / weekChecks.length).toFixed(1) : 0;

    // Best score
    const bestScore = postureChecks.length ? Math.max(...postureChecks.map(check => check.rating)) : 0;

    // Improvement calculation (compare first week to last week)
    const improvement = calculateImprovement();

    document.getElementById('todayScore').textContent = todayScore;
    document.getElementById('weeklyAverage').textContent = weeklyAverage;
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('improvement').textContent = improvement;

    updateReminders();
}

function calculateImprovement() {
    if (postureChecks.length < 7) return 0;

    const sortedChecks = postureChecks.sort((a, b) => new Date(a.date) - new Date(b.date));

    // First week
    const firstWeek = sortedChecks.slice(0, 7);
    const firstWeekAvg = firstWeek.reduce((sum, check) => sum + check.rating, 0) / firstWeek.length;

    // Last week
    const lastWeek = sortedChecks.slice(-7);
    const lastWeekAvg = lastWeek.reduce((sum, check) => sum + check.rating, 0) / lastWeek.length;

    const improvement = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
    return improvement.toFixed(1);
}

function drawChart() {
    const ctx = document.getElementById('postureChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (postureChecks.length === 0) return;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }

    const dailyAvgRating = last7Days.map(date => {
        const dayChecks = postureChecks.filter(check => check.date === date);
        return dayChecks.length ? dayChecks.reduce((sum, check) => sum + check.rating, 0) / dayChecks.length : 0;
    });

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / 7;

    ctx.strokeStyle = '#00b894';
    ctx.lineWidth = 2;

    dailyAvgRating.forEach((avg, index) => {
        const x = 25 + index * barWidth;
        const height = (avg / 10) * chartHeight; // Max rating 10
        const y = ctx.canvas.height - height - 30;

        const color = avg >= 8 ? '#00b894' : avg >= 6 ? '#fdcb6e' : '#e17055';
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(avg.toFixed(1), x + 5, y - 5);
        ctx.fillText(last7Days[index].slice(-2), x + 5, ctx.canvas.height - 10);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('postureHistory');
    historyEl.innerHTML = '';

    postureChecks.slice(-5).reverse().forEach(check => {
        const li = document.createElement('li');
        const ratingClass = check.rating >= 8 ? 'good' : check.rating >= 6 ? 'average' : 'poor';

        li.innerHTML = `
            <span>${check.date} ${check.timeOfDay}: ${check.duration}min session</span>
            <span class="rating-badge rating-${ratingClass}">Rating: ${check.rating}/10</span>
        `;
        if (check.notes) {
            li.innerHTML += `<br><small>${check.notes}</small>`;
        }
        historyEl.appendChild(li);
    });
}

function setReminderInterval() {
    const interval = prompt('Set reminder interval in minutes (e.g., 30 for every 30 minutes):');
    if (interval && !isNaN(interval)) {
        reminderInterval = parseInt(interval) * 60 * 1000; // Convert to milliseconds
        localStorage.setItem('postureReminderInterval', reminderInterval);
        scheduleNextReminder();
        updateReminders();
    }
}

function scheduleNextReminder() {
    if (reminderInterval) {
        nextReminderTime = Date.now() + reminderInterval;
        localStorage.setItem('nextReminderTime', nextReminderTime);
    }
}

function updateReminders() {
    const reminderEl = document.getElementById('nextReminder');

    if (nextReminderTime) {
        const timeUntil = nextReminderTime - Date.now();
        if (timeUntil <= 0) {
            reminderEl.textContent = 'Time for a posture check!';
            reminderEl.style.color = '#e17055';
            // Auto-schedule next reminder
            scheduleNextReminder();
        } else {
            const minutes = Math.ceil(timeUntil / (60 * 1000));
            reminderEl.textContent = `${minutes} minutes`;
            reminderEl.style.color = '#2d3436';
        }
    } else {
        reminderEl.textContent = 'Not set';
    }

    // Check for completed reminders (this is a simple implementation)
    const activeRemindersEl = document.getElementById('activeReminders');
    activeRemindersEl.innerHTML = '';

    if (reminderInterval) {
        const reminders = [
            { text: 'Next posture check reminder', completed: false }
        ];

        reminders.forEach(reminder => {
            const div = document.createElement('div');
            div.className = `reminder-item ${reminder.completed ? 'completed' : ''}`;
            div.innerHTML = `
                <span>${reminder.text}</span>
                <span>${reminder.completed ? '✓' : '⏰'}</span>
            `;
            activeRemindersEl.appendChild(div);
        });
    }
}

function getNewTip() {
    const randomTip = postureTips[Math.floor(Math.random() * postureTips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Check for reminders every minute
setInterval(updateReminders, 60000);

// Initialize
document.getElementById('checkDate').valueAsDate = new Date();
updateStats();
updateHistory();
drawChart();
getNewTip();
updateReminders();