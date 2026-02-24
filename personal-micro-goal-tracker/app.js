// Personal Micro-Goal Tracker
const form = document.getElementById('goal-form');
const goalInput = document.getElementById('goal-input');
const goalList = document.getElementById('goal-list');
const celebrate = document.getElementById('celebrate');

let goals = JSON.parse(localStorage.getItem('microGoals') || '[]');

function renderGoals() {
    goalList.innerHTML = '';
    goals.forEach((goal, idx) => {
        const li = document.createElement('li');
        li.textContent = goal.text;
        if (goal.completed) li.classList.add('completed');
        const btn = document.createElement('button');
        btn.textContent = goal.completed ? 'Undo' : 'Complete';
        btn.style.marginLeft = '12px';
        btn.addEventListener('click', () => {
            goal.completed = !goal.completed;
            localStorage.setItem('microGoals', JSON.stringify(goals));
            renderGoals();
            if (goal.completed) {
                celebrate.style.display = 'block';
                setTimeout(() => celebrate.style.display = 'none', 2000);
            }
        });
        li.appendChild(btn);
        goalList.appendChild(li);
    });
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const text = goalInput.value.trim();
    if (text) {
        goals.push({ text, completed: false });
        localStorage.setItem('microGoals', JSON.stringify(goals));
        goalInput.value = '';
        renderGoals();
    }
});

renderGoals();

// --- Habit Builder App ---
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitReminder = document.getElementById('habit-reminder');
const habitList = document.getElementById('habit-list');
const habitStreaks = document.getElementById('habit-streaks');
const habitQuote = document.getElementById('habit-quote');

let habits = JSON.parse(localStorage.getItem('habits') || '[]');
let streaks = JSON.parse(localStorage.getItem('habitStreaks') || '{}');
const quotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "Don’t watch the clock; do what it does. Keep going.",
    "It’s not what we do once in a while that shapes our lives. It’s what we do consistently.",
    "Small habits make a big difference."
];

function renderHabits() {
    habitList.innerHTML = '';
    habits.forEach((habit, idx) => {
        const li = document.createElement('li');
        li.textContent = `${habit.text} (⏰ ${habit.reminder})`;
        const doneBtn = document.createElement('button');
        doneBtn.textContent = 'Done Today';
        doneBtn.addEventListener('click', () => {
            const today = new Date().toLocaleDateString();
            if (!streaks[habit.text]) streaks[habit.text] = { count: 0, last: null };
            if (streaks[habit.text].last !== today) {
                streaks[habit.text].count++;
                streaks[habit.text].last = today;
                localStorage.setItem('habitStreaks', JSON.stringify(streaks));
                renderStreaks();
            }
        });
        li.appendChild(doneBtn);
        habitList.appendChild(li);
    });
}

function renderStreaks() {
    habitStreaks.innerHTML = '<h3>Streaks</h3>';
    Object.keys(streaks).forEach(habit => {
        const div = document.createElement('div');
        div.textContent = `${habit}: 🔥 ${streaks[habit].count} days`;
        habitStreaks.appendChild(div);
    });
}

function showRandomQuote() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    habitQuote.textContent = `💡 ${q}`;
}

habitForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = habitInput.value.trim();
    const reminder = habitReminder.value;
    if (text && reminder) {
        habits.push({ text, reminder });
        localStorage.setItem('habits', JSON.stringify(habits));
        habitInput.value = '';
        habitReminder.value = '';
        renderHabits();
        showRandomQuote();
    }
});

// Show reminders if time matches
setInterval(() => {
    const now = new Date();
    const current = now.toTimeString().slice(0,5);
    habits.forEach(habit => {
        if (habit.reminder === current) {
            alert(`Reminder: Time for your habit - ${habit.text}`);
        }
    });
}, 60000);

renderHabits();
renderStreaks();
showRandomQuote();