// Interactive Habit Chain Visualizer
// Author: EWOC Contributors
// Description: Visualize streaks and chains for habits, with motivational stats and social sharing

const form = document.getElementById('habitForm');
const confirmation = document.getElementById('confirmation');
const habitsDiv = document.getElementById('habits');

const STORAGE_KEY = 'habitChains';
const DAYS_TO_SHOW = 21;

function getHabits() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveHabits(habits) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function getLastNDates(n) {
    const arr = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
}

function renderHabits() {
    const habits = getHabits();
    if (!habits.length) {
        habitsDiv.innerHTML = '<em>No habits added yet.</em>';
        return;
    }
    habitsDiv.innerHTML = habits.map((h, idx) => renderHabitCard(h, idx)).join('');
}

function renderHabitCard(habit, idx) {
    const dates = getLastNDates(DAYS_TO_SHOW);
    const completions = habit.completions || [];
    // Calculate streaks
    let currentStreak = 0, longestStreak = 0, tempStreak = 0;
    for (let i = 0; i < dates.length; i++) {
        if (completions.includes(dates[i])) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
            tempStreak = 0;
        }
    }
    // Current streak (from today backwards)
    for (let i = dates.length - 1; i >= 0; i--) {
        if (completions.includes(dates[i])) currentStreak++;
        else break;
    }
    const completionsCount = completions.length;
    return `<div class="habit-card">
        <div class="habit-title">${escapeHtml(habit.name)}</div>
        <div class="chain">
            ${dates.map(date =>
                `<div class="chain-day${completions.includes(date) ? ' completed' : ''}" title="${date}" onclick="toggleCompletion(${idx}, '${date}')">${date.slice(-2)}</div>`
            ).join('')}
        </div>
        <div class="stats">
            Current streak: <b>${currentStreak}</b> | Longest streak: <b>${longestStreak}</b> | Total completions: <b>${completionsCount}</b>
        </div>
        <button class="share-btn" onclick="shareStats(${idx})">Share Stats</button>
    </div>`;
}

window.toggleCompletion = function(idx, date) {
    const habits = getHabits();
    const completions = habits[idx].completions || [];
    const i = completions.indexOf(date);
    if (i === -1) completions.push(date);
    else completions.splice(i, 1);
    habits[idx].completions = completions;
    saveHabits(habits);
    renderHabits();
};

window.shareStats = function(idx) {
    const habits = getHabits();
    const habit = habits[idx];
    const dates = getLastNDates(DAYS_TO_SHOW);
    let currentStreak = 0, longestStreak = 0, tempStreak = 0;
    for (let i = 0; i < dates.length; i++) {
        if ((habit.completions || []).includes(dates[i])) {
            tempStreak++;
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
            tempStreak = 0;
        }
    }
    for (let i = dates.length - 1; i >= 0; i--) {
        if ((habit.completions || []).includes(dates[i])) currentStreak++;
        else break;
    }
    const completionsCount = (habit.completions || []).length;
    const text = `Habit: ${habit.name}\nCurrent streak: ${currentStreak}\nLongest streak: ${longestStreak}\nTotal completions: ${completionsCount}`;
    if (navigator.share) {
        navigator.share({ title: 'My Habit Chain', text });
    } else {
        navigator.clipboard.writeText(text);
        alert('Stats copied to clipboard!');
    }
};

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = form.habitName.value.trim();
    if (!name) return;
    const habits = getHabits();
    habits.push({ name, completions: [] });
    saveHabits(habits);
    confirmation.textContent = 'Habit added!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderHabits();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderHabits();
