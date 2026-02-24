// mental-recovery-interval-planner.js

let workInterval = 25; // minutes
let breakInterval = 5; // minutes
let currentSession = null;
let timerInterval = null;
let startTime = null;
let isWorkSession = false;
let isBreakSession = false;
let totalWorkTime = 0;
let totalBreakTime = 0;
let workSessions = 0;
let breakSessions = 0;
let recoveryLog = JSON.parse(localStorage.getItem('mentalRecoveryLog')) || [];

document.addEventListener('DOMContentLoaded', function() {
    loadLog();
    updateStats();
    updateFatigueDisplay();
    updateNextBreak();

    document.getElementById('fatigueSlider').addEventListener('input', updateFatigueDisplay);
    document.getElementById('startWorkBtn').addEventListener('click', startWorkSession);
    document.getElementById('takeBreakBtn').addEventListener('click', takeBreak);
    document.getElementById('endDayBtn').addEventListener('click', endDay);
    document.getElementById('setCustomBtn').addEventListener('click', setCustomInterval);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            workInterval = parseInt(this.dataset.work);
            breakInterval = parseInt(this.dataset.break);
            updateNextBreak();
            alert(`Interval set to ${workInterval}/${breakInterval} minutes`);
        });
    });
});

function updateFatigueDisplay() {
    const value = document.getElementById('fatigueSlider').value;
    const labels = ['Very Low', 'Low', 'Moderate', 'Somewhat High', 'High', 'Very High', 'Extreme', 'Critical', 'Danger', 'Emergency'];
    document.getElementById('fatigueValue').textContent = `${labels[value - 1]} (${value}/10)`;
    updateNextBreak();
}

function updateNextBreak() {
    const fatigue = parseInt(document.getElementById('fatigueSlider').value);
    let recommendedBreak = breakInterval;

    if (fatigue >= 8) recommendedBreak = Math.max(breakInterval * 2, 20);
    else if (fatigue >= 6) recommendedBreak = Math.max(breakInterval * 1.5, 10);
    else if (fatigue <= 3) recommendedBreak = Math.min(breakInterval * 0.5, 2);

    document.getElementById('nextBreakTime').textContent = isWorkSession ? `${workInterval} min work remaining` : 'Ready for work';
    document.getElementById('breakDuration').textContent = `Duration: ${recommendedBreak} minutes`;
}

function startWorkSession() {
    if (isWorkSession) return;

    endCurrentSession();
    isWorkSession = true;
    isBreakSession = false;
    startTime = new Date();
    currentSession = 'work';

    document.getElementById('startWorkBtn').disabled = true;
    document.getElementById('takeBreakBtn').disabled = false;
    document.getElementById('currentSession').textContent = 'Work Session';

    timerInterval = setInterval(updateTimer, 1000);
    addLogEntry('work', 'Work session started');
}

function takeBreak() {
    if (isBreakSession) return;

    endCurrentSession();
    isBreakSession = true;
    isWorkSession = false;
    startTime = new Date();
    currentSession = 'break';

    const fatigue = parseInt(document.getElementById('fatigueSlider').value);
    let breakDuration = breakInterval;
    if (fatigue >= 8) breakDuration = Math.max(breakInterval * 2, 20);
    else if (fatigue >= 6) breakDuration = Math.max(breakInterval * 1.5, 10);

    document.getElementById('startWorkBtn').disabled = false;
    document.getElementById('takeBreakBtn').disabled = true;
    document.getElementById('currentSession').textContent = `Break (${breakDuration} min)`;

    timerInterval = setInterval(updateTimer, 1000);
    addLogEntry('break', `Break started (${breakDuration} min)`);
}

function endCurrentSession() {
    if (!currentSession) return;

    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000 / 60); // minutes

    if (currentSession === 'work') {
        totalWorkTime += duration;
        workSessions++;
    } else if (currentSession === 'break') {
        totalBreakTime += duration;
        breakSessions++;
    }

    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;
    currentSession = null;
    isWorkSession = false;
    isBreakSession = false;

    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('startWorkBtn').disabled = false;
    document.getElementById('takeBreakBtn').disabled = true;
    document.getElementById('currentSession').textContent = 'Not started';

    updateStats();
    updateNextBreak();
}

function endDay() {
    endCurrentSession();
    addLogEntry('end', 'Day ended');
    // Reset daily stats
    totalWorkTime = 0;
    totalBreakTime = 0;
    workSessions = 0;
    breakSessions = 0;
    updateStats();
    alert('Day ended. Daily statistics reset.');
}

function updateTimer() {
    if (!startTime) return;

    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    document.getElementById('timerDisplay').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Auto-end session based on interval
    const targetMinutes = currentSession === 'work' ? workInterval : breakInterval;
    if (elapsed >= targetMinutes * 60) {
        if (currentSession === 'work') {
            takeBreak();
        } else {
            startWorkSession();
        }
    }
}

function setCustomInterval() {
    const work = parseInt(document.getElementById('workMinutes').value);
    const break_ = parseInt(document.getElementById('breakMinutes').value);

    if (work > 0 && break_ > 0) {
        workInterval = work;
        breakInterval = break_;
        updateNextBreak();
        alert(`Custom interval set to ${work}/${break_} minutes`);
    } else {
        alert('Please enter valid minutes for both work and break intervals.');
    }
}

function addLogEntry(type, message) {
    const entry = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: type,
        message: message
    };

    recoveryLog.unshift(entry);
    if (recoveryLog.length > 50) recoveryLog = recoveryLog.slice(0, 50); // Keep only last 50 entries

    saveLog();
    loadLog();
}

function loadLog() {
    const logContainer = document.getElementById('recoveryLog');
    logContainer.innerHTML = '';

    if (recoveryLog.length === 0) {
        logContainer.innerHTML = '<p>No recovery log entries yet.</p>';
        return;
    }

    recoveryLog.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'log-entry';
        entryDiv.innerHTML = `
            <div>
                <span class="log-time">${entry.time}</span>
                <span class="log-type ${entry.type}">${entry.type.toUpperCase()}</span>
                <span>${entry.message}</span>
            </div>
        `;
        logContainer.appendChild(entryDiv);
    });
}

function updateStats() {
    document.getElementById('workSessions').textContent = workSessions;
    document.getElementById('breakSessions').textContent = breakSessions;
    document.getElementById('totalWorkTime').textContent = formatTime(totalWorkTime);
    document.getElementById('totalBreakTime').textContent = formatTime(totalBreakTime);

    const avgSession = workSessions > 0 ? Math.round(totalWorkTime / workSessions) : 0;
    document.getElementById('avgSessionLength').textContent = `${avgSession} min`;

    const efficiency = totalWorkTime > 0 ? Math.round((totalWorkTime / (totalWorkTime + totalBreakTime)) * 100) : 0;
    document.getElementById('recoveryEfficiency').textContent = `${efficiency}%`;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
}

function saveLog() {
    localStorage.setItem('mentalRecoveryLog', JSON.stringify(recoveryLog));
}