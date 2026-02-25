// Mindfulness Meditation Timer
// Timer, guided sessions, progress tracking, reminders

const timerDisplay = document.getElementById('timer-display');
const sessionLengthEl = document.getElementById('session-length');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

let timer = null;
let timeLeft = 0;
let running = false;
let progressLog = [];

function updateTimerDisplay() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerDisplay.textContent = `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

startBtn.onclick = () => {
    if (!running) {
        timeLeft = parseInt(sessionLengthEl.value) * 60;
        running = true;
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timer);
                running = false;
                logProgress();
            }
        }, 1000);
    }
};

pauseBtn.onclick = () => {
    if (running) {
        clearInterval(timer);
        running = false;
    }
};

resetBtn.onclick = () => {
    clearInterval(timer);
    running = false;
    timeLeft = 0;
    updateTimerDisplay();
};

function logProgress() {
    const date = new Date().toLocaleString();
    progressLog.unshift(`Session completed: ${sessionLengthEl.value} min at ${date}`);
    renderProgress();
}

function renderProgress() {
    const logEl = document.getElementById('progress-log');
    logEl.innerHTML = progressLog.slice(0,10).map(l => `<div>${l}</div>`).join('');
}

// Guided Meditation
const guidedSelect = document.getElementById('guided-select');
const playGuidedBtn = document.getElementById('play-guided-btn');
const guidedText = document.getElementById('guided-text');

const guidedSessions = {
    'body-scan': 'Begin by focusing on your breath. Slowly scan your body from head to toe, noticing sensations without judgment.',
    'breathing': 'Sit comfortably. Focus on your breath, feeling each inhale and exhale. If your mind wanders, gently return to your breath.',
    'loving-kindness': 'Bring to mind someone you care about. Silently repeat: "May you be happy. May you be healthy. May you be safe." Extend these wishes to yourself and others.'
};

playGuidedBtn.onclick = () => {
    const session = guidedSelect.value;
    guidedText.textContent = guidedSessions[session];
};

// Reminders
const reminderTimeEl = document.getElementById('reminder-time');
const setReminderBtn = document.getElementById('set-reminder-btn');
const reminderListEl = document.getElementById('reminder-list');
let reminders = [];

setReminderBtn.onclick = () => {
    const time = reminderTimeEl.value;
    if (time) {
        reminders.push(time);
        renderReminders();
    }
};

function renderReminders() {
    reminderListEl.innerHTML = reminders.map(t => `<div>Reminder set for ${t}</div>`).join('');
}

updateTimerDisplay();
renderProgress();
renderReminders();
