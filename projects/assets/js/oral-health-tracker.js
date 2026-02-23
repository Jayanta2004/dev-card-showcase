let careSessions = JSON.parse(localStorage.getItem('oralHealthData')) || [];
let checkupDate = localStorage.getItem('dentalCheckupDate');

const tips = [
    "Brush your teeth twice a day for at least two minutes each time.",
    "Use fluoride toothpaste to strengthen tooth enamel.",
    "Floss daily to remove plaque between teeth.",
    "Replace your toothbrush every 3-4 months or when bristles are frayed.",
    "Visit your dentist every 6 months for checkups and cleanings.",
    "Limit sugary foods and drinks that can cause cavities.",
    "Drink plenty of water to help wash away food particles.",
    "Use mouthwash to reduce plaque and prevent gum disease.",
    "Clean your tongue to remove bacteria and freshen breath.",
    "Eat a balanced diet rich in calcium and vitamin D for strong teeth."
];

function logCare() {
    const activity = document.getElementById('activity').value;
    const timeOfDay = document.getElementById('timeOfDay').value;
    const duration = parseInt(document.getElementById('duration').value);
    const date = document.getElementById('careDate').value;

    if (!duration || !date) {
        alert('Please fill in all fields');
        return;
    }

    const session = { activity, timeOfDay, duration, date, timestamp: new Date().getTime() };

    careSessions.push(session);
    localStorage.setItem('oralHealthData', JSON.stringify(careSessions));

    updateStats();
    updateHistory();
    drawChart();

    // Clear inputs
    document.getElementById('duration').value = '';
    document.getElementById('careDate').value = '';
}

function updateStats() {
    const totalSessions = careSessions.length;

    // Calculate streaks
    const streaks = calculateStreaks();
    const currentStreak = streaks.current;
    const bestStreak = streaks.best;

    // Calculate consistency (percentage of days with care in last 30 days)
    const consistency = calculateConsistency();

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('currentStreak').textContent = currentStreak;
    document.getElementById('bestStreak').textContent = bestStreak;
    document.getElementById('consistency').textContent = consistency;

    updateReminders();
}

function calculateStreaks() {
    if (careSessions.length === 0) return { current: 0, best: 0 };

    // Sort sessions by date
    const sortedSessions = careSessions.sort((a, b) => new Date(a.date) - new Date(b.date));

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    for (const session of sortedSessions) {
        const sessionDate = new Date(session.date);
        if (lastDate) {
            const diffTime = sessionDate - lastDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                tempStreak++;
            } else if (diffDays > 1) {
                tempStreak = 1;
            }
        } else {
            tempStreak = 1;
        }

        bestStreak = Math.max(bestStreak, tempStreak);
        lastDate = sessionDate;
    }

    // Check if current streak is still active (last session within last 2 days)
    const lastSessionDate = new Date(sortedSessions[sortedSessions.length - 1].date);
    const today = new Date();
    const daysSinceLast = (today - lastSessionDate) / (1000 * 60 * 60 * 24);

    currentStreak = daysSinceLast <= 2 ? tempStreak : 0;

    return { current: currentStreak, best: bestStreak };
}

function calculateConsistency() {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentSessions = careSessions.filter(session =>
        new Date(session.date) >= last30Days
    );

    const uniqueDays = new Set(recentSessions.map(session => session.date)).size;
    return Math.round((uniqueDays / 30) * 100);
}

function drawChart() {
    const ctx = document.getElementById('consistencyChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (careSessions.length === 0) return;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }

    const sessionsPerDay = last7Days.map(date => {
        return careSessions.filter(session => session.date === date).length;
    });

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / 7;

    ctx.strokeStyle = '#e17055';
    ctx.lineWidth = 2;

    sessionsPerDay.forEach((count, index) => {
        const x = 25 + index * barWidth;
        const height = (count / 4) * chartHeight; // Max 4 sessions per day
        const y = ctx.canvas.height - height - 30;

        ctx.fillStyle = count > 0 ? '#fd79a8' : '#ddd';
        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(count.toString(), x + 10, y - 5);
        ctx.fillText(last7Days[index].slice(-2), x + 10, ctx.canvas.height - 10);
    });
}

function updateHistory() {
    const historyEl = document.getElementById('careHistory');
    historyEl.innerHTML = '';

    careSessions.slice(-5).reverse().forEach(session => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${session.date} ${session.timeOfDay}: ${session.activity} (${session.duration}min)</span>
            <span>${new Date(session.timestamp).toLocaleTimeString()}</span>
        `;
        historyEl.appendChild(li);
    });
}

function setCheckupReminder() {
    const checkupDateInput = prompt('Enter your next dental checkup date (YYYY-MM-DD):');
    if (checkupDateInput) {
        checkupDate = checkupDateInput;
        localStorage.setItem('dentalCheckupDate', checkupDate);
        updateReminders();
    }
}

function updateReminders() {
    const reminderEl = document.getElementById('nextCheckup');
    if (checkupDate) {
        const checkup = new Date(checkupDate);
        const today = new Date();
        const daysUntil = Math.ceil((checkup - today) / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
            reminderEl.textContent = `${checkupDate} (Overdue!)`;
            reminderEl.style.color = '#e17055';
        } else if (daysUntil === 0) {
            reminderEl.textContent = 'Today!';
            reminderEl.style.color = '#e17055';
        } else {
            reminderEl.textContent = `${checkupDate} (${daysUntil} days)`;
            reminderEl.style.color = '#2d3436';
        }
    } else {
        reminderEl.textContent = 'Not set';
    }

    // Add reminder items
    const reminderListEl = document.getElementById('reminderList');
    reminderListEl.innerHTML = '';

    const reminders = [
        { text: 'Brush teeth in the morning', checked: hasBrushedToday('morning') },
        { text: 'Brush teeth in the evening', checked: hasBrushedToday('evening') },
        { text: 'Floss daily', checked: hasFlossedToday() },
        { text: 'Use mouthwash', checked: hasUsedMouthwashToday() }
    ];

    reminders.forEach(reminder => {
        const div = document.createElement('div');
        div.className = `reminder-item ${reminder.checked ? '' : 'overdue'}`;
        div.innerHTML = `
            <span>${reminder.text}</span>
            <span>${reminder.checked ? '✓' : '✗'}</span>
        `;
        reminderListEl.appendChild(div);
    });
}

function hasBrushedToday(timeOfDay) {
    const today = new Date().toISOString().split('T')[0];
    return careSessions.some(session =>
        session.date === today &&
        session.activity === 'brushing' &&
        session.timeOfDay === timeOfDay
    );
}

function hasFlossedToday() {
    const today = new Date().toISOString().split('T')[0];
    return careSessions.some(session =>
        session.date === today &&
        session.activity === 'flossing'
    );
}

function hasUsedMouthwashToday() {
    const today = new Date().toISOString().split('T')[0];
    return careSessions.some(session =>
        session.date === today &&
        session.activity === 'mouthwash'
    );
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
document.getElementById('careDate').valueAsDate = new Date();
updateStats();
updateHistory();
drawChart();
getNewTip();