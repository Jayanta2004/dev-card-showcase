// app.js - Habit Streak Competition
// LocalStorage keys: habits, streaks, username, group, leaderboard
let habits = JSON.parse(localStorage.getItem('habits') || '[]');
let streaks = JSON.parse(localStorage.getItem('streaks') || '{}');
let username = localStorage.getItem('username') || '';
let group = localStorage.getItem('group') || '';
let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');

const usernameInput = document.getElementById('username');
const setUsernameBtn = document.getElementById('set-username');
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitList = document.getElementById('habit-list');
const groupInput = document.getElementById('group-input');
const joinGroupBtn = document.getElementById('join-group');
const groupInfo = document.getElementById('group-info');
const leaderboardList = document.getElementById('leaderboard');
const progressChart = document.getElementById('progress-chart');
const enableRemindersBtn = document.getElementById('enable-reminders');

function saveState() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('streaks', JSON.stringify(streaks));
    localStorage.setItem('username', username);
    localStorage.setItem('group', group);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function renderHabits() {
    habitList.innerHTML = '';
    habits.forEach(habit => {
        const li = document.createElement('li');
        li.textContent = habit;
        const streakSpan = document.createElement('span');
        streakSpan.className = 'streak';
        streakSpan.textContent = `🔥 ${streaks[habit]?.count || 0}`;
        const doneBtn = document.createElement('button');
        doneBtn.textContent = 'Done Today';
        doneBtn.onclick = () => markHabitDone(habit);
        li.appendChild(streakSpan);
        li.appendChild(doneBtn);
        habitList.appendChild(li);
    });
}

function markHabitDone(habit) {
    const today = new Date().toISOString().slice(0,10);
    if (!streaks[habit]) streaks[habit] = { count: 0, last: '' };
    if (streaks[habit].last !== today) {
        if (streaks[habit].last === getYesterday()) streaks[habit].count++;
        else streaks[habit].count = 1;
        streaks[habit].last = today;
        saveState();
        renderHabits();
        renderChart();
        updateLeaderboard();
    }
}

function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0,10);
}

habitForm.onsubmit = e => {
    e.preventDefault();
    const habit = habitInput.value.trim();
    if (habit && !habits.includes(habit)) {
        habits.push(habit);
        saveState();
        renderHabits();
        renderChart();
    }
    habitInput.value = '';
};

setUsernameBtn.onclick = () => {
    username = usernameInput.value.trim();
    saveState();
    renderGroupInfo();
    updateLeaderboard();
};

joinGroupBtn.onclick = () => {
    group = groupInput.value.trim();
    saveState();
    renderGroupInfo();
    updateLeaderboard();
};

function renderGroupInfo() {
    groupInfo.textContent = group ? `You are in group: ${group}` : '';
}

function updateLeaderboard() {
    if (!username || !group) return;
    const totalStreak = habits.reduce((sum, h) => sum + (streaks[h]?.count || 0), 0);
    let found = false;
    leaderboard = leaderboard.filter(entry => entry.group === group);
    leaderboard.forEach(entry => {
        if (entry.username === username) {
            entry.streak = totalStreak;
            found = true;
        }
    });
    if (!found) leaderboard.push({ username, group, streak: totalStreak });
    leaderboard.sort((a, b) => b.streak - a.streak);
    saveState();
    renderLeaderboard();
}

function renderLeaderboard() {
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        if (entry.group === group) {
            const li = document.createElement('li');
            li.textContent = `${entry.username}: 🔥 ${entry.streak}`;
            leaderboardList.appendChild(li);
        }
    });
}

function renderChart() {
    const labels = habits;
    const data = habits.map(h => streaks[h]?.count || 0);
    if (window.habitChart) window.habitChart.destroy();
    window.habitChart = new Chart(progressChart, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Current Streak',
                data,
                backgroundColor: '#4f8cff',
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

enableRemindersBtn.onclick = () => {
    if (Notification.permission === 'granted') {
        scheduleReminder();
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') scheduleReminder();
        });
    }
};

function scheduleReminder() {
    setInterval(() => {
        new Notification('Habit Reminder', {
            body: 'Don’t forget to mark your habits today!'
        });
    }, 24 * 60 * 60 * 1000); // every 24 hours
    alert('Daily reminders enabled!');
}

// Initial render
usernameInput.value = username;
groupInput.value = group;
renderHabits();
renderGroupInfo();
renderLeaderboard();
renderChart();
