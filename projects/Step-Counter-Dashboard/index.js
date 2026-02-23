// Constants and Variables
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const motivationQuotes = [
    "Every step counts towards a healthier you!",
    "Walking is the best medicine!",
    "Keep moving, keep improving!",
    "One step at a time, you're doing great!",
    "Your body will thank you for every step!",
    "Consistency is key – keep stepping!",
    "Turn your steps into success!",
    "Walk your way to wellness!",
    "Every journey begins with a single step!",
    "Stay active, stay happy!"
];

const achievements = [
    { id: 'first-steps', name: 'First Steps', desc: 'Log your first 1000 steps', icon: 'fas fa-baby', threshold: 1000 },
    { id: 'daily-goal', name: 'Goal Crusher', desc: 'Reach your daily goal', icon: 'fas fa-trophy', threshold: 'goal' },
    { id: 'week-warrior', name: 'Week Warrior', desc: 'Walk 50,000 steps in a week', icon: 'fas fa-calendar-week', threshold: 50000 },
    { id: 'marathon-man', name: 'Marathon Walker', desc: 'Walk 26,000 steps in a day', icon: 'fas fa-running', threshold: 26000 },
    { id: 'consistency-king', name: 'Consistency King', desc: 'Reach goal for 7 days straight', icon: 'fas fa-crown', threshold: 'streak' }
];

let currentGoal = parseInt(localStorage.getItem('goal')) || 10000;
let stepData = JSON.parse(localStorage.getItem('stepData')) || {};
let unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';

// DOM Elements
const dateInput = document.getElementById('date-input');
const stepsInput = document.getElementById('daily-steps');
const addStepsBtn = document.getElementById('add-steps');
const quickAdd1000Btn = document.getElementById('quick-add-1000');
const quickAdd2000Btn = document.getElementById('quick-add-2000');
const goalInput = document.getElementById('goal-input');
const updateGoalBtn = document.getElementById('update-goal');
const progressBar = document.getElementById('progress');
const goalStatus = document.getElementById('goal-status');
const todayStepsEl = document.getElementById('today-steps');
const weeklyTotalEl = document.getElementById('weekly-total');
const goalProgressEl = document.getElementById('goal-progress');
const motivationQuoteEl = document.getElementById('motivation-quote');
const activityList = document.getElementById('activity-list');
const achievementsEl = document.getElementById('achievements');
const exportBtn = document.getElementById('export-data');
const themeToggle = document.getElementById('theme-toggle');
const notification = document.getElementById('notification');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
    updateGoalDisplay();
    updateStats();
    updateProgress();
    drawChart();
    updateMotivationQuote();
    updateActivityHistory();
    updateAchievements();
    applyTheme();
});

// Event Listeners
addStepsBtn.addEventListener('click', () => addSteps(parseInt(stepsInput.value)));
quickAdd1000Btn.addEventListener('click', () => addSteps(1000));
quickAdd2000Btn.addEventListener('click', () => addSteps(2000));
updateGoalBtn.addEventListener('click', updateGoal);
themeToggle.addEventListener('click', toggleTheme);
exportBtn.addEventListener('click', exportData);

// Functions
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

function addSteps(steps) {
    if (!steps || steps <= 0) {
        showNotification('Please enter a valid number of steps.', 'error');
        return;
    }

    const date = dateInput.value;
    if (!date) {
        showNotification('Please select a date.', 'error');
        return;
    }

    if (!stepData[date]) {
        stepData[date] = 0;
    }
    stepData[date] += steps;

    localStorage.setItem('stepData', JSON.stringify(stepData));
    
    updateStats();
    updateProgress();
    drawChart();
    updateActivityHistory();
    checkAchievements();
    
    showNotification(`Added ${steps} steps for ${formatDate(date)}!`, 'success');
    stepsInput.value = '';
}

function updateGoal() {
    const newGoal = parseInt(goalInput.value);
    if (newGoal < 1000) {
        showNotification('Goal must be at least 1000 steps.', 'error');
        return;
    }
    currentGoal = newGoal;
    localStorage.setItem('goal', currentGoal.toString());
    updateGoalDisplay();
    updateProgress();
    showNotification('Goal updated successfully!', 'success');
}

function updateGoalDisplay() {
    goalInput.value = currentGoal;
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todaySteps = stepData[today] || 0;
    const weekStart = getWeekStart(today);
    const weeklyTotal = getWeeklyTotal(weekStart);
    const progressPercent = Math.min((todaySteps / currentGoal) * 100, 100);

    todayStepsEl.textContent = todaySteps.toLocaleString();
    weeklyTotalEl.textContent = weeklyTotal.toLocaleString();
    goalProgressEl.textContent = Math.round(progressPercent) + '%';
}

function updateProgress() {
    const today = new Date().toISOString().split('T')[0];
    const todaySteps = stepData[today] || 0;
    const progressPercent = Math.min((todaySteps / currentGoal) * 100, 100);
    
    progressBar.style.width = progressPercent + '%';
    
    if (todaySteps >= currentGoal) {
        goalStatus.innerHTML = 'Goal achieved! 🎉 <i class="fas fa-check-circle"></i>';
        goalStatus.style.color = 'var(--primary-color)';
    } else {
        const remaining = currentGoal - todaySteps;
        goalStatus.innerHTML = `Keep going! ${remaining.toLocaleString()} steps left. <i class="fas fa-walking"></i>`;
        goalStatus.style.color = 'var(--text-secondary)';
    }
}

function drawChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    const weekData = getWeekData();
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Steps',
                data: weekData,
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function getWeekData() {
    const today = new Date();
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        weekData.push(stepData[dateStr] || 0);
    }
    return weekData;
}

function getWeekStart(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
}

function getWeeklyTotal(weekStart) {
    let total = 0;
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        total += stepData[dateStr] || 0;
    }
    return total;
}

function updateMotivationQuote() {
    const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
    motivationQuoteEl.textContent = motivationQuotes[randomIndex];
}

function updateActivityHistory() {
    activityList.innerHTML = '';
    const sortedDates = Object.keys(stepData).sort((a, b) => new Date(b) - new Date(a));
    sortedDates.slice(0, 10).forEach(date => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${formatDate(date)}: ${stepData[date].toLocaleString()} steps</span>
            <button class="delete-btn" data-date="${date}"><i class="fas fa-trash"></i></button>
        `;
        activityList.appendChild(li);
    });

    // Add delete functionality
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const date = e.currentTarget.dataset.date;
            delete stepData[date];
            localStorage.setItem('stepData', JSON.stringify(stepData));
            updateActivityHistory();
            updateStats();
            updateProgress();
            drawChart();
            showNotification('Entry deleted.', 'info');
        });
    });
}

function updateAchievements() {
    achievementsEl.innerHTML = '';
    achievements.forEach(achievement => {
        const div = document.createElement('div');
        div.className = 'achievement';
        
        let isUnlocked = unlockedAchievements.includes(achievement.id);
        
        if (!isUnlocked) {
            if (achievement.threshold === 'goal') {
                const today = new Date().toISOString().split('T')[0];
                isUnlocked = (stepData[today] || 0) >= currentGoal;
            } else if (achievement.threshold === 'streak') {
                isUnlocked = checkStreak();
            } else {
                isUnlocked = getTotalSteps() >= achievement.threshold;
            }
            
            if (isUnlocked) {
                unlockedAchievements.push(achievement.id);
                localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
                showNotification(`Achievement unlocked: ${achievement.name}!`, 'success');
            }
        }
        
        if (isUnlocked) {
            div.classList.add('unlocked');
        }
        
        div.innerHTML = `
            <i class="${achievement.icon}"></i>
            <h4>${achievement.name}</h4>
            <p>${achievement.desc}</p>
        `;
        achievementsEl.appendChild(div);
    });
}

function checkAchievements() {
    updateAchievements();
}

function checkStreak() {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        if ((stepData[dateStr] || 0) >= currentGoal) {
            streak++;
        } else {
            break;
        }
    }
    return streak >= 7;
}

function getTotalSteps() {
    return Object.values(stepData).reduce((sum, steps) => sum + steps, 0);
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

function exportData() {
    const data = {
        goal: currentGoal,
        stepData: stepData,
        unlockedAchievements: unlockedAchievements,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'step-counter-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        addSteps(parseInt(stepsInput.value));
    }
});

// Auto-save goal
goalInput.addEventListener('input', () => {
    const value = parseInt(goalInput.value);
    if (value >= 1000) {
        currentGoal = value;
        localStorage.setItem('goal', currentGoal.toString());
        updateProgress();
    }
});

// Periodic updates
setInterval(() => {
    updateMotivationQuote();
}, 30000); // Change quote every 30 seconds

// Initial setup
updateMotivationQuote();