// Goal Setting & Productivity Dashboard
let goals = JSON.parse(localStorage.getItem('goals') || '[]');
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
let badges = [];

function renderGoals() {
    const goalsDiv = document.getElementById('goals');
    goalsDiv.innerHTML = '';
    goals.forEach(g => {
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.innerHTML = `<b>${g.title}</b><br><p>${g.desc}</p>`;
        goalsDiv.appendChild(card);
    });
    renderGoalSelect();
}

document.getElementById('add-goal-btn').onclick = function() {
    const title = document.getElementById('goal-title').value.trim();
    const desc = document.getElementById('goal-desc').value.trim();
    if (!title || !desc) {
        alert('Please fill all required fields.');
        return;
    }
    goals.push({ title, desc });
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
};

function renderGoalSelect() {
    const select = document.getElementById('goal-select');
    select.innerHTML = '';
    goals.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.title;
        opt.textContent = g.title;
        select.appendChild(opt);
    });
}

function renderTasks() {
    const tasksDiv = document.getElementById('tasks');
    tasksDiv.innerHTML = '';
    tasks.forEach(t => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `<b>${t.title}</b><br><small>Goal: ${t.goal}</small><br><small>Status: ${t.status}</small>`;
        card.innerHTML += `<button onclick="toggleTaskStatus('${t.title}')">Toggle Status</button>`;
        tasksDiv.appendChild(card);
    });
    renderProgressTracking();
    renderPlanner();
    renderBadges();
}

document.getElementById('add-task-btn').onclick = function() {
    const title = document.getElementById('task-title').value.trim();
    const goal = document.getElementById('goal-select').value;
    if (!title || !goal) {
        alert('Please fill all required fields.');
        return;
    }
    tasks.push({ title, goal, status: 'pending' });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
};

function toggleTaskStatus(title) {
    tasks = tasks.map(t => t.title === title ? { ...t, status: t.status === 'pending' ? 'done' : 'pending' } : t);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderProgressTracking() {
    const progressDiv = document.getElementById('progress-tracking');
    progressDiv.innerHTML = '';
    goals.forEach(g => {
        const total = tasks.filter(t => t.goal === g.title).length;
        const done = tasks.filter(t => t.goal === g.title && t.status === 'done').length;
        const percent = total ? Math.round(100*done/total) : 0;
        progressDiv.innerHTML += `<div><b>${g.title}</b><div class="progress-bar"><div class="progress" style="width:${percent}%"></div></div><small>${done}/${total} tasks done</small></div>`;
    });
}

function renderProductivityChart() {
    const canvas = document.getElementById('productivity-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,600,300);
    let daily = {};
    tasks.forEach(t => {
        const d = new Date();
        const day = d.toISOString().split('T')[0];
        daily[day] = (daily[day] || 0) + (t.status === 'done' ? 1 : 0);
    });
    const days = Object.keys(daily);
    ctx.fillStyle = '#43c6ac';
    days.forEach((day, idx) => {
        ctx.fillRect(idx*60+40, 300-daily[day]*40, 40, daily[day]*40);
        ctx.font = 'bold 14px Segoe UI';
        ctx.fillStyle = '#333';
        ctx.fillText(day, idx*60+40, 290);
    });
}

function renderBadges() {
    const badgesDiv = document.getElementById('badges');
    badgesDiv.innerHTML = '';
    const totalDone = tasks.filter(t => t.status === 'done').length;
    if (totalDone >= 10) badgesDiv.innerHTML += '<div class="badge-card">🏅 10 Tasks Done</div>';
    if (totalDone >= 50) badgesDiv.innerHTML += '<div class="badge-card">🥈 50 Tasks Done</div>';
    if (totalDone >= 100) badgesDiv.innerHTML += '<div class="badge-card">🏆 100 Tasks Done</div>';
}

function renderPlanner() {
    const plannerDiv = document.getElementById('planner');
    plannerDiv.innerHTML = '';
    tasks.forEach(t => {
        plannerDiv.innerHTML += `<div class="planner-card"><b>${t.title}</b><br><small>${t.goal}</small><br><small>Status: ${t.status}</small></div>`;
    });
}

document.getElementById('add-reminder-btn').onclick = function() {
    const task = document.getElementById('reminder-task').value.trim();
    const date = document.getElementById('reminder-date').value;
    if (!task || !date) {
        alert('Please fill all required fields.');
        return;
    }
    reminders.push({ task, date });
    localStorage.setItem('reminders', JSON.stringify(reminders));
    renderReminders();
};

function renderReminders() {
    const remindersDiv = document.getElementById('reminders-list');
    remindersDiv.innerHTML = '';
    reminders.forEach(r => {
        remindersDiv.innerHTML += `<div class="reminder-card"><b>${r.task}</b><br><small>${r.date}</small></div>`;
    });
}

document.getElementById('export-csv-btn').onclick = function() {
    let csv = 'Goal,Task,Status\n';
    tasks.forEach(t => {
        csv += `${t.goal},${t.title},${t.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'productivity-dashboard.csv';
    link.click();
};

document.getElementById('export-json-btn').onclick = function() {
    const json = JSON.stringify({ goals, tasks, reminders }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'productivity-dashboard.json';
    link.click();
};

renderGoals();
renderTasks();
renderProductivityChart();
renderReminders();