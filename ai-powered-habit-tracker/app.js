// Habit Tracker Logic
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitList = document.getElementById('habit-list');
const streaksDiv = document.getElementById('streaks');
const completionRateDiv = document.getElementById('completion-rate');
const trendsDiv = document.getElementById('trends');
const suggestionList = document.getElementById('suggestion-list');
const motivationText = document.getElementById('motivation-text');

let habits = JSON.parse(localStorage.getItem('habits')) || [];

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function renderHabits() {
    habitList.innerHTML = '';
    habits.forEach((habit, idx) => {
        const item = document.createElement('div');
        item.className = 'habit-item';
        item.innerHTML = `
            <span class="habit-name">${habit.name}</span>
            <button class="complete-btn${habit.completedToday ? ' completed' : ''}" onclick="completeHabit(${idx})">
                ${habit.completedToday ? 'Completed' : 'Mark Complete'}
            </button>
        `;
        habitList.appendChild(item);
    });
}

window.completeHabit = function(idx) {
    habits[idx].completedToday = true;
    habits[idx].history.push(new Date().toISOString());
    saveHabits();
    renderHabits();
    renderAnalytics();
    renderMotivation();
    renderAISuggestions();
}

habitForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = habitInput.value.trim();
    if (name) {
        habits.push({ name, completedToday: false, history: [] });
        saveHabits();
        habitInput.value = '';
        renderHabits();
        renderAnalytics();
        renderAISuggestions();
        renderMotivation();
    }
});

function renderAnalytics() {
    // Streaks
    streaksDiv.innerHTML = '<strong>Streaks:</strong><br>' + habits.map(habit => {
        const streak = calculateStreak(habit.history);
        return `${habit.name}: ${streak} days`;
    }).join('<br>');

    // Completion Rate
    completionRateDiv.innerHTML = '<strong>Completion Rate:</strong><br>' + habits.map(habit => {
        const rate = calculateCompletionRate(habit.history);
        return `${habit.name}: ${rate}%`;
    }).join('<br>');

    // Trends (simple placeholder)
    trendsDiv.innerHTML = '<strong>Trends:</strong><br>' + habits.map(habit => {
        return `${habit.name}: ${habit.history.length} completions`;
    }).join('<br>');
}

function calculateStreak(history) {
    if (!history.length) return 0;
    let streak = 0;
    let today = new Date();
    for (let i = history.length - 1; i >= 0; i--) {
        let date = new Date(history[i]);
        if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        ) {
            streak++;
            today.setDate(today.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

function calculateCompletionRate(history) {
    if (!history.length) return 0;
    let days = new Set(history.map(d => (new Date(d)).toDateString()));
    let totalDays = Math.ceil((new Date() - new Date(history[0])) / (1000 * 60 * 60 * 24)) + 1;
    return Math.round((days.size / totalDays) * 100);
}

function renderAISuggestions() {
    // Simple AI logic placeholder
    suggestionList.innerHTML = '';
    if (habits.length === 0) {
        suggestionList.innerHTML = '<li>Add a habit to get suggestions!</li>';
        return;
    }
    // Example suggestions
    let suggestions = [];
    habits.forEach(habit => {
        if (calculateStreak(habit.history) < 3) {
            suggestions.push(`Try to build a streak for "${habit.name}" by completing it daily!`);
        }
        if (calculateCompletionRate(habit.history) < 50) {
            suggestions.push(`Consider setting reminders for "${habit.name}" to improve your completion rate.`);
        }
    });
    if (suggestions.length === 0) {
        suggestions.push('Great job! Keep up your habits or add new ones for more challenges.');
    }
    suggestions.forEach(s => {
        let li = document.createElement('li');
        li.textContent = s;
        suggestionList.appendChild(li);
    });
}

function renderMotivation() {
    // Simple motivational reminder
    const messages = [
        'Consistency is key! Keep going.',
        'Small steps every day lead to big results.',
        'You are building a better you!',
        'Stay positive and persistent.',
        'Celebrate your progress!'
    ];
    motivationText.textContent = messages[Math.floor(Math.random() * messages.length)];
}

// Initial render
renderHabits();
renderAnalytics();
renderAISuggestions();
renderMotivation();
