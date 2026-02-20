// Habit Tracker Forest - Virtual Habit Trees
const canvas = document.getElementById('forest-canvas');
const ctx = canvas.getContext('2d');
let habits = JSON.parse(localStorage.getItem('habits') || '[]');
let today = new Date().toLocaleDateString();

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function drawForest() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    habits.forEach((habit, i) => {
        const x = 100 + (i % 7) * 100;
        const y = 320;
        // Trunk
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 40 - habit.growth * 18);
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#8d6e63';
        ctx.stroke();
        // Leaves (growth)
        ctx.beginPath();
        ctx.arc(x, y - 50 - habit.growth * 18, 32 + habit.growth * 6, 0, Math.PI * 2);
        ctx.fillStyle = habit.wilted ? '#bdbdbd' : '#66bb6a';
        ctx.globalAlpha = habit.wilted ? 0.6 : 1;
        ctx.fill();
        ctx.globalAlpha = 1;
        // Habit name
        ctx.font = 'bold 15px Segoe UI';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText(habit.name, x, y + 30);
    });
}

function renderHabitList() {
    const list = document.getElementById('habit-list');
    list.innerHTML = '';
    habits.forEach((habit, i) => {
        const li = document.createElement('li');
        li.textContent = habit.name;
        const btn = document.createElement('button');
        btn.textContent = habit.lastCheckin === today ? 'Done' : 'Mark Done';
        btn.disabled = habit.lastCheckin === today;
        btn.onclick = () => {
            if (habit.lastCheckin !== today) {
                habit.growth = Math.min(habit.growth + 1, 5);
                habit.lastCheckin = today;
                habit.wilted = false;
                saveHabits();
                drawForest();
                renderHabitList();
            }
        };
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function updateWilting() {
    habits.forEach(habit => {
        if (habit.lastCheckin !== today) {
            if (!habit.wilted) {
                habit.growth = Math.max(habit.growth - 1, 1);
                habit.wilted = true;
            }
        }
    });
    saveHabits();
}

document.getElementById('add-habit-btn').onclick = function() {
    const name = document.getElementById('habit-name').value.trim();
    if (!name) return;
    habits.push({ name, growth: 1, lastCheckin: '', wilted: false });
    saveHabits();
    drawForest();
    renderHabitList();
    document.getElementById('habit-name').value = '';
};

// On page load, update wilting if a new day
updateWilting();
drawForest();
renderHabitList();
