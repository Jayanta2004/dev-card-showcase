const checklistItems = [
    'brush-teeth', 'shower', 'wash-hands', 'deodorant',
    'hair-care', 'skin-care', 'oral-care', 'nail-care'
];

let todayScore = 0;
let weekScores = [0, 0, 0, 0, 0, 0, 0]; // Last 7 days
let streak = 0;

const todayScoreEl = document.getElementById('todayScore');
const weekAvgEl = document.getElementById('weekAvg');
const streakEl = document.getElementById('streak');
const messageEl = document.getElementById('message');
const reminderEl = document.getElementById('reminder');
const reminderStatusEl = document.getElementById('reminder-status');
const chartCanvas = document.getElementById('chart');

function loadData() {
    const data = JSON.parse(localStorage.getItem('hygieneTracker') || '{}');
    const today = new Date().toDateString();

    if (data.lastDate === today) {
        todayScore = data.todayScore || 0;
        checklistItems.forEach(item => {
            const checkbox = document.getElementById(item);
            if (checkbox) checkbox.checked = data.checklist?.[item] || false;
        });
    } else {
        // New day, reset checklist
        todayScore = 0;
        checklistItems.forEach(item => {
            const checkbox = document.getElementById(item);
            if (checkbox) checkbox.checked = false;
        });
    }

    weekScores = data.weekScores || [0, 0, 0, 0, 0, 0, 0];
    streak = data.streak || 0;

    updateStats();
    drawChart();
}

function saveRoutine() {
    const checklist = {};
    checklistItems.forEach(item => {
        const checkbox = document.getElementById(item);
        checklist[item] = checkbox.checked;
    });

    todayScore = Object.values(checklist).filter(Boolean).length;

    const data = {
        checklist,
        todayScore,
        weekScores,
        streak,
        lastDate: new Date().toDateString()
    };

    localStorage.setItem('hygieneTracker', JSON.stringify(data));

    // Update weekly data
    weekScores.shift();
    weekScores.push(todayScore);
    data.weekScores = weekScores;

    // Update streak
    if (todayScore === 8) {
        streak++;
    } else {
        streak = 0;
    }
    data.streak = streak;

    localStorage.setItem('hygieneTracker', JSON.stringify(data));

    updateStats();
    drawChart();

    messageEl.textContent = `Saved! You completed ${todayScore}/8 tasks today.`;
    setTimeout(() => messageEl.textContent = '', 3000);
}

function updateStats() {
    todayScoreEl.textContent = todayScore;
    const avg = weekScores.reduce((a, b) => a + b, 0) / 7;
    weekAvgEl.textContent = Math.round((avg / 8) * 100);
    streakEl.textContent = streak;
}

function drawChart() {
    const ctx = chartCanvas.getContext('2d');
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxScore = 8;

    ctx.fillStyle = '#48bb78';
    weekScores.forEach((score, index) => {
        const height = (score / maxScore) * 150;
        const x = 50 + index * 50;
        const y = chartCanvas.height - height - 20;
        ctx.fillRect(x, y, 30, height);
        ctx.fillStyle = '#000';
        ctx.fillText(days[index], x + 5, chartCanvas.height - 5);
        ctx.fillText(score, x + 10, y - 5);
        ctx.fillStyle = '#48bb78';
    });
}

function setReminder() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                reminderStatusEl.textContent = 'Daily reminder set! You will be notified at 8 AM.';
                // In a real app, you'd schedule this properly
                setTimeout(() => {
                    new Notification('Hygiene Reminder', {
                        body: 'Time for your daily hygiene routine!',
                        icon: '🧼'
                    });
                }, 5000); // Demo: notify after 5 seconds
            } else {
                reminderStatusEl.textContent = 'Notifications not allowed.';
            }
        });
    } else {
        reminderStatusEl.textContent = 'Notifications not supported in this browser.';
    }
}

// Initialize
loadData();

// Update checklist score in real-time
checklistItems.forEach(item => {
    document.getElementById(item).addEventListener('change', () => {
        const checkedCount = checklistItems.filter(id => document.getElementById(id).checked).length;
        todayScoreEl.textContent = checkedCount;
    });
});</content>
<parameter name="filePath">C:\Users\Gupta\Downloads\dev-card-showcase\projects\Hygiene-Routine-Tracker\script.js