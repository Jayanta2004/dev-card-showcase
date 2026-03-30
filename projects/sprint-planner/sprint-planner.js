// sprint-planner.js
// Main JS for Personal Learning Sprint Planner

// State
let goal = null;
let milestones = [];
let sessions = [];
let streak = 0;
let analytics = {};
let catchup = [];

// Utility: Format date
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}

// Set goal
function setGoal(title, duration) {
    goal = { title, duration, start: new Date(), end: new Date() };
    goal.end.setDate(goal.start.getDate() + duration * 7);
    milestones = [];
    for (let w = 1; w <= duration; w++) {
        milestones.push({ week: w, title: `Milestone for Week ${w}`, completed: false });
    }
    sessions = [];
    streak = 0;
    analytics = {};
    catchup = [];
    renderGoalSummary();
    renderMilestones();
    renderSessions();
    renderStreak();
    renderAnalytics();
    renderCatchup();
}

// Render goal summary
function renderGoalSummary() {
    const summary = document.getElementById('goal-summary');
    if (!goal) {
        summary.innerHTML = '';
        return;
    }
    summary.innerHTML = `Goal: <strong>${goal.title}</strong> | Duration: <strong>${goal.duration} weeks</strong> | Start: ${formatDate(goal.start)} | End: ${formatDate(goal.end)}`;
}

// Render milestones
function renderMilestones() {
    const list = document.getElementById('milestone-list');
    list.innerHTML = '';
    milestones.forEach(m => {
        const div = document.createElement('div');
        div.className = 'milestone';
        div.innerHTML = `Week ${m.week}: ${m.title} <span>${m.completed ? '✅' : '❌'}</span>`;
        list.appendChild(div);
    });
}

// Render sessions
function renderSessions() {
    const list = document.getElementById('session-list');
    list.innerHTML = '';
    sessions.forEach(s => {
        const div = document.createElement('div');
        div.className = 'session';
        div.innerHTML = `${formatDate(s.date)}: ${s.title} <span>${s.completed ? '✅' : '❌'}</span>`;
        list.appendChild(div);
    });
}

// Render streak
function renderStreak() {
    const view = document.getElementById('streak-view');
    view.innerHTML = `Current Streak: <span class="streak">${streak} days</span>`;
}

// Render analytics
function renderAnalytics() {
    const view = document.getElementById('analytics-view');
    view.innerHTML = `Sessions: ${sessions.length} | Completed: ${sessions.filter(s => s.completed).length} | Completion Rate: ${sessions.length ? Math.round(100 * sessions.filter(s => s.completed).length / sessions.length) : 0}%`;
    // Add export/import buttons
    if (!document.getElementById('export-btn')) {
        const exportBtn = document.createElement('button');
        exportBtn.id = 'export-btn';
        exportBtn.textContent = 'Export Data';
        exportBtn.onclick = exportPlannerData;
        view.appendChild(exportBtn);
    }
    if (!document.getElementById('import-btn')) {
        const importBtn = document.createElement('button');
        importBtn.id = 'import-btn';
        importBtn.textContent = 'Import Data';
        importBtn.onclick = () => {
            const json = prompt('Paste planner JSON:');
            if (json) importPlannerData(json);
        };
        view.appendChild(importBtn);
    }
}

function addSession(title, date) {
    sessions.push({ title, date, completed: false });
    renderSessions();
    renderAnalytics();
}

function completeSession(index) {
    if (sessions[index]) {
        sessions[index].completed = true;
        streak++;
        renderSessions();
        renderStreak();
        renderAnalytics();
    }
}

function missSession(index) {
    if (sessions[index]) {
        sessions[index].completed = false;
        streak = 0;
        // Schedule catch-up
        const missed = sessions[index];
        const rescheduleDate = new Date(missed.date);
        rescheduleDate.setDate(rescheduleDate.getDate() + 1);
        catchup.push({ date: missed.date, reschedule: rescheduleDate });
        renderCatchup();
        renderStreak();
    }
}

// Editing sessions
function editSession(index, newTitle, newDate) {
    if (sessions[index]) {
        sessions[index].title = newTitle;
        sessions[index].date = newDate;
        renderSessions();
        renderAnalytics();
    }
}

// Export data
function exportPlannerData() {
    const data = {
        goal,
        milestones,
        sessions,
        streak,
        analytics,
        catchup
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sprint-planner-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Import data
function importPlannerData(json) {
    try {
        const data = JSON.parse(json);
        goal = data.goal;
        milestones = data.milestones;
        sessions = data.sessions;
        streak = data.streak;
        analytics = data.analytics;
        catchup = data.catchup;
        renderGoalSummary();
        renderMilestones();
        renderSessions();
        renderStreak();
        renderAnalytics();
        renderCatchup();
    } catch (e) {
        alert('Invalid data format');
    }
}

// Utility: Sort sessions by date
function sortSessions() {
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    renderSessions();
}

// Utility: Filter sessions by completion
function filterSessions(completed) {
    return sessions.filter(s => s.completed === completed);
}
// Render catchup
function renderCatchup() {
    const view = document.getElementById('catchup-view');
    if (catchup.length === 0) {
        view.innerHTML = 'No catch-up needed.';
        return;
    }
    view.innerHTML = catchup.map(c => `Missed: ${formatDate(c.date)} - Rescheduled to: ${formatDate(c.reschedule)}`).join('<br>');
}

// Handle goal form
const goalForm = document.getElementById('goal-form');
goalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('goal-title').value;
    const duration = parseInt(document.getElementById('goal-duration').value);
    setGoal(title, duration);
});

// ...more code will be added for session tracking, streaks, analytics, catch-up, editing, exporting, etc...
