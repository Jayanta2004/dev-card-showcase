// Habit Streak Calendar App
// Author: Ayaanshaikh12243
// Description: Mark daily habits and visualize streaks on a calendar

// --- State Management ---
const state = {
    habits: [], // {id, name, color}
    records: {}, // {YYYY-MM-DD: {habitId: true}}
    view: 'calendar',
    selectedHabit: null,
    settings: {
        weekStart: 'Sunday',
        theme: 'default',
    },
};

// --- Utility Functions ---
function saveState() {
    localStorage.setItem('habitState', JSON.stringify(state));
}
function loadState() {
    const saved = localStorage.getItem('habitState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.habits = parsed.habits || [];
        state.records = parsed.records || {};
        state.view = parsed.view || 'calendar';
        state.selectedHabit = parsed.selectedHabit || null;
        state.settings = parsed.settings || { weekStart: 'Sunday', theme: 'default' };
    }
}
function getToday() {
    return new Date().toISOString().slice(0, 10);
}
function getMonthDays(year, month) {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}
function getWeekdayNames() {
    return state.settings.weekStart === 'Monday'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}
function getHabitColor(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    return habit ? habit.color : '#6a82fb';
}
function uuid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// --- Navigation ---
function setView(view) {
    state.view = view;
    saveState();
    render();
}
document.getElementById('calendarBtn').onclick = () => setView('calendar');
document.getElementById('habitsBtn').onclick = () => setView('habits');
document.getElementById('statsBtn').onclick = () => setView('stats');
document.getElementById('settingsBtn').onclick = () => setView('settings');

// --- Render Functions ---
function render() {
    const main = document.getElementById('mainContent');
    switch (state.view) {
        case 'calendar':
            main.innerHTML = renderCalendar();
            break;
        case 'habits':
            main.innerHTML = renderHabits();
            break;
        case 'stats':
            main.innerHTML = renderStats();
            break;
        case 'settings':
            main.innerHTML = renderSettings();
            break;
    }
    attachEventListeners();
}

// --- Calendar View ---
function renderCalendar() {
    const today = getToday();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = getMonthDays(year, month);
    const weekDays = getWeekdayNames();
    let html = `<h2>Calendar</h2>`;
    if (state.habits.length === 0) {
        html += `<p>No habits yet. Add a habit to get started!</p>`;
        return html;
    }
    html += `<div class="calendar">
        ${weekDays.map(d => `<div class="calendar-day" style="font-weight:bold;">${d}</div>`).join('')}
        ${days.map(day => {
            const dateStr = day.toISOString().slice(0, 10);
            let cell = '';
            state.habits.forEach(habit => {
                const done = state.records[dateStr] && state.records[dateStr][habit.id];
                cell += `<div class="habit-dot" data-date="${dateStr}" data-habit="${habit.id}" style="background:${done ? getHabitColor(habit.id) : '#e3edff'}" title="${habit.name}"></div>`;
            });
            return `<div class="calendar-day${dateStr === today ? ' today' : ''}">
                <div class="date-label">${day.getDate()}</div>
                <div class="habit-dots">${cell}</div>
            </div>`;
        }).join('')}
    </div>`;
    return html;
}

// --- Habits View ---
function renderHabits() {
    let html = `<h2>Habits</h2>
        <form id="habitForm">
            <input type="text" id="habitName" placeholder="Habit Name" required />
            <input type="color" id="habitColor" value="#6a82fb" />
            <button type="submit">Add Habit</button>
        </form>
        <div class="habit-list">
            ${state.habits.map(habit => `
                <div class="habit-item" data-id="${habit.id}">
                    <span style="color:${habit.color};font-weight:bold;">${habit.name}</span>
                    <div class="actions">
                        <button class="edit-habit">Edit</button>
                        <button class="delete-habit">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>`;
    return html;
}

// --- Stats View ---
function renderStats() {
    // Calculate stats for each habit
    let html = `<h2>Stats</h2><div class="stats">`;
    state.habits.forEach(habit => {
        const streaks = getStreaks(habit.id);
        html += `<div class="stat">
            <div style="color:${habit.color};font-weight:bold;">${habit.name}</div>
            <div>Current Streak: <strong>${streaks.current}</strong></div>
            <div>Longest Streak: <strong>${streaks.longest}</strong></div>
            <div>Completion Rate: <strong>${streaks.rate}%</strong></div>
        </div>`;
    });
    html += `</div>`;
    return html;
}

// --- Settings View ---
function renderSettings() {
    return `<h2>Settings</h2>
        <div class="settings">
            <label>Week Start:
                <select id="weekStart">
                    <option value="Sunday"${state.settings.weekStart==='Sunday'?' selected':''}>Sunday</option>
                    <option value="Monday"${state.settings.weekStart==='Monday'?' selected':''}>Monday</option>
                </select>
            </label>
            <br><br>
            <label>Theme:
                <select id="theme">
                    <option value="default"${state.settings.theme==='default'?' selected':''}>Default</option>
                    <option value="dark"${state.settings.theme==='dark'?' selected':''}>Dark</option>
                </select>
            </label>
        </div>`;
}

// --- Streak Calculation ---
function getStreaks(habitId) {
    const days = Object.keys(state.records).sort();
    let current = 0, longest = 0, temp = 0, lastDate = null, completed = 0;
    days.forEach(date => {
        if (state.records[date][habitId]) {
            completed++;
            if (lastDate && (new Date(date) - new Date(lastDate) === 86400000)) {
                temp++;
            } else {
                temp = 1;
            }
            if (temp > longest) longest = temp;
            lastDate = date;
        } else {
            temp = 0;
        }
    });
    // Current streak
    const today = getToday();
    if (state.records[today] && state.records[today][habitId]) {
        current = 1;
        let prev = new Date(today);
        while (true) {
            prev.setDate(prev.getDate() - 1);
            const prevStr = prev.toISOString().slice(0, 10);
            if (state.records[prevStr] && state.records[prevStr][habitId]) {
                current++;
            } else {
                break;
            }
        }
    }
    // Completion rate
    const totalDays = days.length;
    const rate = totalDays ? Math.round((completed / totalDays) * 100) : 0;
    return { current, longest, rate };
}

// --- Event Listeners ---
function attachEventListeners() {
    // Habit Form
    const habitForm = document.getElementById('habitForm');
    if (habitForm) {
        habitForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('habitName').value.trim();
            const color = document.getElementById('habitColor').value;
            if (name) {
                state.habits.push({ id: uuid(), name, color });
                saveState();
                render();
            }
        };
        document.querySelectorAll('.edit-habit').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.habit-item').getAttribute('data-id');
                editHabit(id);
            };
        });
        document.querySelectorAll('.delete-habit').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.habit-item').getAttribute('data-id');
                state.habits = state.habits.filter(h => h.id !== id);
                // Remove records for this habit
                Object.keys(state.records).forEach(date => {
                    if (state.records[date][id]) delete state.records[date][id];
                });
                saveState();
                render();
            };
        });
    }
    // Calendar Habit Dots
    document.querySelectorAll('.habit-dot').forEach(dot => {
        dot.onclick = function() {
            const date = this.getAttribute('data-date');
            const habitId = this.getAttribute('data-habit');
            if (!state.records[date]) state.records[date] = {};
            state.records[date][habitId] = !state.records[date][habitId];
            saveState();
            render();
        };
    });
    // Settings
    const weekStart = document.getElementById('weekStart');
    if (weekStart) {
        weekStart.onchange = function() {
            state.settings.weekStart = this.value;
            saveState();
            render();
        };
    }
    const theme = document.getElementById('theme');
    if (theme) {
        theme.onchange = function() {
            state.settings.theme = this.value;
            document.body.className = this.value;
            saveState();
        };
    }
}

// --- Edit Habit Modal (Simple Prompt) ---
function editHabit(id) {
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;
    const name = prompt('Edit habit name:', habit.name);
    if (name !== null && name.trim() !== '') {
        habit.name = name.trim();
        saveState();
        render();
    }
}

// --- Initialization ---
loadState();
render();
