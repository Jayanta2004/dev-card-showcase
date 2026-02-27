// Water Intake Reminder & Tracker
const goalForm = document.getElementById('goal-form');
const logForm = document.getElementById('log-form');
const goalInput = document.getElementById('goal');
const amountInput = document.getElementById('amount');
const progressBar = document.getElementById('progress-bar');
const currentIntakeSpan = document.getElementById('current-intake');
const goalAmountSpan = document.getElementById('goal-amount');
const reminderDiv = document.getElementById('reminder');
const logListDiv = document.getElementById('log-list');

let goal = parseInt(localStorage.getItem('waterGoal') || '2000');
let logs = JSON.parse(localStorage.getItem('waterLogs') || '[]');
let today = new Date().toISOString().slice(0, 10);

function saveData() {
    localStorage.setItem('waterGoal', goal.toString());
    localStorage.setItem('waterLogs', JSON.stringify(logs));
}

function getTodayLogs() {
    return logs.filter(l => l.date === today);
}

function getTodayIntake() {
    return getTodayLogs().reduce((sum, l) => sum + l.amount, 0);
}

function renderProgress() {
    const intake = getTodayIntake();
    currentIntakeSpan.textContent = intake;
    goalAmountSpan.textContent = goal;
    let percent = Math.min(100, (intake / goal) * 100);
    progressBar.style.width = percent + '%';
    if (intake < goal) {
        reminderDiv.textContent = 'Don\'t forget to drink water!';
    } else {
        reminderDiv.textContent = 'Goal reached! Great job!';
    }
}

function renderLogs() {
    logListDiv.innerHTML = '';
    getTodayLogs().slice().reverse().forEach(l => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.textContent = `+${l.amount} ml at ${l.time}`;
        logListDiv.appendChild(div);
    });
}

goalForm.addEventListener('submit', e => {
    e.preventDefault();
    goal = parseInt(goalInput.value);
    saveData();
    renderProgress();
});

logForm.addEventListener('submit', e => {
    e.preventDefault();
    const amount = parseInt(amountInput.value);
    const now = new Date();
    logs.push({
        date: today,
        amount,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    saveData();
    renderProgress();
    renderLogs();
    logForm.reset();
});

// Initial render
renderProgress();
renderLogs();
