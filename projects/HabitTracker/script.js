// Gamified Habit Tracker - script.js
// Core: habit CRUD, streaks, rewards, progress chart, share

const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitsList = document.getElementById('habits-list');
const rewardsDiv = document.getElementById('rewards');
const shareBtn = document.getElementById('share-btn');
let habits = JSON.parse(localStorage.getItem('habits') || '[]');

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function renderHabits() {
    habitsList.innerHTML = '';
    habits.forEach((habit, idx) => {
        const li = document.createElement('li');
        li.setAttribute('tabindex', '0');
        li.setAttribute('role', 'listitem');
        li.innerHTML = `
            <span>${habit.name}</span>
            <span>Streak: ${habit.streak} 🔥</span>
            <button aria-label="Mark as done" tabindex="0">Done</button>
            <button aria-label="Delete habit" tabindex="0">Delete</button>
        `;
        // Done button
        li.children[2].onclick = () => {
            const today = new Date().toDateString();
            if (habit.lastDone !== today) {
                habit.streak = (habit.lastDone && (new Date(habit.lastDone).getTime() === new Date(Date.now() - 86400000).setHours(0,0,0,0))) ? habit.streak + 1 : 1;
                habit.lastDone = today;
                habit.history.push(today);
                saveHabits();
                renderHabits();
                renderRewards();
                renderChart();
            }
        };
        // Delete button
        li.children[3].onclick = () => {
            habits.splice(idx, 1);
            saveHabits();
            renderHabits();
            renderRewards();
            renderChart();
        };
        habitsList.appendChild(li);
    });
}

habitForm.onsubmit = e => {
    e.preventDefault();
    const name = habitInput.value.trim();
    if (name && !habits.some(h => h.name.toLowerCase() === name.toLowerCase())) {
        habits.push({ name, streak: 0, lastDone: '', history: [] });
        saveHabits();
        habitInput.value = '';
        renderHabits();
        renderRewards();
        renderChart();
    }
};

function renderRewards() {
    const maxStreak = Math.max(0, ...habits.map(h => h.streak));
    let reward = '';
    if (maxStreak >= 30) reward = '🏆 Habit Master! 30+ day streak!';
    else if (maxStreak >= 7) reward = '🎉 1 Week Streak!';
    else if (maxStreak >= 3) reward = '🔥 Keep it up!';
    else reward = 'Start building your streak!';
    rewardsDiv.textContent = reward;
}

// Progress Chart
let chart;
function renderChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    const labels = habits.map(h => h.name);
    const data = habits.map(h => h.streak);
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Current Streak',
                data,
                backgroundColor: '#1976d2',
                borderColor: '#0d47a1',
                borderWidth: 2
            }]
        },
        options: {
            responsive: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, stepSize: 1 } }
        }
    });
}

// Share Achievements
shareBtn.onclick = () => {
    const maxStreak = Math.max(0, ...habits.map(h => h.streak));
    const msg = `My best habit streak is ${maxStreak}! Can you beat me? #HabitTracker`;
    if (navigator.share) {
        navigator.share({ title: 'Habit Tracker', text: msg });
    } else {
        alert('Share: ' + msg);
    }
};

// Initial render
renderHabits();
renderRewards();
renderChart();
