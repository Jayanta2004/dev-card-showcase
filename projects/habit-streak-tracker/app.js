// Habit Streak Tracker Logic
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitsList = document.getElementById('habits-list');

let habits = JSON.parse(localStorage.getItem('habits')) || [];

function renderHabits() {
    habitsList.innerHTML = '';
    habits.forEach((habit, idx) => {
        const habitDiv = document.createElement('div');
        habitDiv.className = 'habit';
        habitDiv.innerHTML = `
            <span>${habit.name}</span>
            <span class="streak">Streak: ${habit.streak} days</span>
            <button class="mark-done" onclick="markDone(${idx})">Mark Done</button>
        `;
        habitsList.appendChild(habitDiv);
    });
}

window.markDone = function(idx) {
    const today = new Date().toISOString().split('T')[0];
    if (habits[idx].lastDone === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (habits[idx].lastDone === yesterday) {
        habits[idx].streak += 1;
    } else {
        habits[idx].streak = 1;
    }
    habits[idx].lastDone = today;
    localStorage.setItem('habits', JSON.stringify(habits));
    renderHabits();
}

habitForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = habitInput.value.trim();
    if (!name) return;
    habits.push({ name, streak: 0, lastDone: '' });
    localStorage.setItem('habits', JSON.stringify(habits));
    habitInput.value = '';
    renderHabits();
});

renderHabits();
