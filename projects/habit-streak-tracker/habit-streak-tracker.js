// habit-streak-tracker.js
// Digital Habit Streak Tracker - full functionality

// --- Data Models ---
let habits = [
    { id: 1, title: "Drink Water", color: "#0078d7", streak: 3, history: [1,1,1,0,0,0,0] },
    { id: 2, title: "Read Book", color: "#34a853", streak: 1, history: [0,0,0,0,0,1,0] }
];
let reminders = [
    { id: 1, habitId: 1, time: "09:00" },
    { id: 2, habitId: 2, time: "21:00" }
];
let nextHabitId = 3, nextReminderId = 3;

// --- Utility Functions ---
function getTodayIndex() {
    // 0 = 6 days ago, 6 = today
    return 6;
}
function updateStreak(habit) {
    let streak = 0;
    for (let i = 6; i >= 0; i--) {
        if (habit.history[i]) streak++;
        else break;
    }
    habit.streak = streak;
}

// --- Habit Rendering ---
function renderHabits() {
    const list = document.getElementById('habit-list');
    list.innerHTML = '';
    habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        card.style.borderLeftColor = habit.color;
        card.innerHTML = `
            <div class="habit-title">${habit.title}</div>
            <div>Current Streak: <strong>${habit.streak}</strong> days</div>
            <div class="habit-actions">
                <button onclick="markHabit(${habit.id})">Mark Today</button>
                <button onclick="editHabit(${habit.id})">Edit</button>
                <button onclick="deleteHabit(${habit.id})">Delete</button>
            </div>
        `;
        list.appendChild(card);
    });
}

window.markHabit = function(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    habit.history[getTodayIndex()] = 1;
    updateStreak(habit);
    renderHabits();
    renderStreaks();
};
window.editHabit = function(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    document.getElementById('habit-title').value = habit.title;
    document.getElementById('habit-color').value = habit.color;
    document.getElementById('habit-form').style.display = 'flex';
    document.getElementById('habit-form').onsubmit = function(e) {
        e.preventDefault();
        habit.title = document.getElementById('habit-title').value;
        habit.color = document.getElementById('habit-color').value;
        renderHabits();
        renderStreaks();
        this.reset();
        this.style.display = 'none';
        this.onsubmit = null;
        document.getElementById('habit-form').onsubmit = defaultHabitSubmit;
    };
};
window.deleteHabit = function(id) {
    habits = habits.filter(h => h.id !== id);
    renderHabits();
    renderStreaks();
    renderReminders();
};

// --- Add Habit Logic ---
document.getElementById('add-habit-btn').onclick = () => {
    document.getElementById('habit-form').style.display = 'flex';
};
document.getElementById('cancel-habit').onclick = () => {
    document.getElementById('habit-form').reset();
    document.getElementById('habit-form').style.display = 'none';
};
document.getElementById('habit-form').onsubmit = function(e) {
    e.preventDefault();
    const title = document.getElementById('habit-title').value;
    const color = document.getElementById('habit-color').value;
    const newHabit = { id: nextHabitId++, title, color, streak: 0, history: [0,0,0,0,0,0,0] };
    habits.push(newHabit);
    renderHabits();
    renderStreaks();
    this.reset();
    this.style.display = 'none';
};
const defaultHabitSubmit = document.getElementById('habit-form').onsubmit;

// --- Streak Visualization ---
function renderStreaks() {
    const vis = document.getElementById('streak-visualization');
    vis.innerHTML = '';
    habits.forEach(habit => {
        const bar = document.createElement('div');
        bar.className = 'streak-bar';
        bar.innerHTML = `
            <span class="streak-label" style="color:${habit.color}">${habit.title}</span>
            <span class="streak-days">${habit.history.map((v,i) => `<span class="streak-dot${v ? ' active' : ''}"></span>`).join('')}</span>
            <span>Streak: <strong>${habit.streak}</strong></span>
        `;
        vis.appendChild(bar);
    });
}

// --- Reminder Rendering ---
function renderReminders() {
    const list = document.getElementById('reminder-list');
    list.innerHTML = '';
    reminders.forEach(reminder => {
        const habit = habits.find(h => h.id === reminder.habitId);
        if (!habit) return;
        const card = document.createElement('div');
        card.className = 'reminder-card';
        card.innerHTML = `
            <strong>${habit.title}</strong> at ${reminder.time}
            <button onclick="deleteReminder(${reminder.id})">Delete</button>
        `;
        list.appendChild(card);
    });
}
window.deleteReminder = function(id) {
    reminders = reminders.filter(r => r.id !== id);
    renderReminders();
};

// --- Add Reminder Logic ---
document.getElementById('add-reminder-btn').onclick = () => {
    const select = document.getElementById('reminder-habit');
    select.innerHTML = habits.map(h => `<option value="${h.id}">${h.title}</option>`).join('');
    document.getElementById('reminder-form').style.display = 'flex';
};
document.getElementById('cancel-reminder').onclick = () => {
    document.getElementById('reminder-form').reset();
    document.getElementById('reminder-form').style.display = 'none';
};
document.getElementById('reminder-form').onsubmit = function(e) {
    e.preventDefault();
    const habitId = parseInt(document.getElementById('reminder-habit').value);
    const time = document.getElementById('reminder-time').value;
    reminders.push({ id: nextReminderId++, habitId, time });
    renderReminders();
    this.reset();
    this.style.display = 'none';
};

// --- Initial Render ---
document.addEventListener('DOMContentLoaded', () => {
    habits.forEach(updateStreak);
    renderHabits();
    renderStreaks();
    renderReminders();
});
// --- End of habit-streak-tracker.js ---
