// =========================================
// Pomodoro Timer with Task Management
// =========================================

// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const sessionType = document.getElementById('session-type');
const sessionCount = document.getElementById('session-count');
const totalSessions = document.getElementById('total-sessions');
const progressRing = document.getElementById('progress-ring');
const strengthBar = document.getElementById('strength-bar');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');
const longBreakInput = document.getElementById('long-break');
const sessionsUntilLongInput = document.getElementById('sessions-until-long');
const notificationsEnabled = document.getElementById('notifications-enabled');

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksList = document.getElementById('tasks-list');
const taskCount = document.getElementById('task-count');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');
const progressPercent = document.getElementById('progress-percent');
const clearCompletedBtn = document.getElementById('clear-completed');

const completedSessions = document.getElementById('completed-sessions');
const totalFocusTime = document.getElementById('total-focus-time');
const totalBreakTime = document.getElementById('total-break-time');
const streakCount = document.getElementById('streak-count');

// =========================================
// Timer State
// =========================================

let state = {
    isRunning: false,
    isWorkSession: true,
    timeLeft: 25 * 60,
    currentSession: 1,
    totalSessionsPlanned: 1,
    interval: null,
    
    // Settings
    workDuration: 25,
    breakDuration: 5,
    longBreak: 15,
    sessionsUntilLong: 4,
    
    // Statistics
    completedSessionsCount: 0,
    totalFocusTimeSeconds: 0,
    totalBreakTimeSeconds: 0,
    currentStreak: 0,
    
    // Tasks
    tasks: []
};

// =========================================
// Timer Functions
// =========================================

/**
 * Format seconds into MM:SS display
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0')
    };
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const time = formatTime(state.timeLeft);
    minutesDisplay.textContent = time.minutes;
    secondsDisplay.textContent = time.seconds;
    updateProgressRing();
}

/**
 * Update circular progress ring
 */
function updateProgressRing() {
    const totalTime = state.isWorkSession 
        ? state.workDuration * 60 
        : (state.currentSession % state.sessionsUntilLong === 0 
            ? state.longBreak * 60 
            : state.breakDuration * 60);
    
    const circumference = 628; // 2 * π * 100
    const progress = state.timeLeft / totalTime;
    const offset = circumference * (1 - progress);
    progressRing.style.strokeDashoffset = offset;
}

/**
 * Start the timer
 */
function startTimer() {
    if (state.isRunning) return;
    
    state.isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    state.interval = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();
        
        if (state.timeLeft <= 0) {
            completeSession();
        }
    }, 1000);
}

/**
 * Pause the timer
 */
function pauseTimer() {
    state.isRunning = false;
    clearInterval(state.interval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

/**
 * Reset the timer
 */
function resetTimer() {
    pauseTimer();
    state.isWorkSession = true;
    state.timeLeft = state.workDuration * 60;
    state.currentSession = 1;
    updateSessionDisplay();
    updateTimerDisplay();
}

/**
 * Handle session completion
 */
function completeSession() {
    pauseTimer();
    
    if (state.isWorkSession) {
        // Completed work session
        state.completedSessionsCount++;
        state.totalFocusTimeSeconds += state.workDuration * 60;
        state.currentStreak++;
        
        // Determine break type
        const isLongBreak = state.currentSession % state.sessionsUntilLong === 0;
        const breakTime = isLongBreak ? state.longBreak * 60 : state.breakDuration * 60;
        
        state.isWorkSession = false;
        state.timeLeft = breakTime;
        
        notify('Work session complete!', 'Time for a break. Great work!');
    } else {
        // Completed break session
        state.totalBreakTimeSeconds += state.isWorkSession ? 0 : state.breakDuration * 60;
        
        state.isWorkSession = true;
        state.currentSession++;
        state.timeLeft = state.workDuration * 60;
        
        notify('Break time over!', 'Ready for another work session?');
    }
    
    updateSessionDisplay();
    updateTimerDisplay();
    updateStatistics();
}

/**
 * Update session display info
 */
function updateSessionDisplay() {
    sessionType.textContent = state.isWorkSession ? 'Work Session' : 'Break Time';
    sessionCount.textContent = state.currentSession;
    totalSessions.textContent = state.totalSessionsPlanned;
}

/**
 * Update statistics display
 */
function updateStatistics() {
    completedSessions.textContent = state.completedSessionsCount;
    streakCount.textContent = state.currentStreak;
    
    const hours = Math.floor(state.totalFocusTimeSeconds / 3600);
    const mins = Math.floor((state.totalFocusTimeSeconds % 3600) / 60);
    totalFocusTime.textContent = `${hours}h ${mins}m`;
    
    const breakHours = Math.floor(state.totalBreakTimeSeconds / 3600);
    const breakMins = Math.floor((state.totalBreakTimeSeconds % 3600) / 60);
    totalBreakTime.textContent = `${breakHours}h ${breakMins}m`;
}

/**
 * Send browser notification
 */
function notify(title, message) {
    if (!notificationsEnabled.checked) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '🍅'
        });
    }
}

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// =========================================
// Task Management
// =========================================

/**
 * Add a new task
 */
function addTask(taskText) {
    if (!taskText.trim()) return;
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date()
    };
    
    state.tasks.push(task);
    renderTasks();
    taskInput.value = '';
    updateTaskStats();
}

/**
 * Remove a task
 */
function removeTask(taskId) {
    state.tasks = state.tasks.filter(task => task.id !== taskId);
    renderTasks();
    updateTaskStats();
}

/**
 * Toggle task completion
 */
function toggleTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
        updateTaskStats();
    }
}

/**
 * Clear completed tasks
 */
function clearCompleted() {
    state.tasks = state.tasks.filter(task => !task.completed);
    renderTasks();
    updateTaskStats();
}

/**
 * Render all tasks
 */
function renderTasks() {
    if (state.tasks.length === 0) {
        tasksList.innerHTML = '<li class="empty-state"><p>No tasks yet. Add one to get started!</p></li>';
        return;
    }
    
    tasksList.innerHTML = state.tasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="task-delete" onclick="removeTask(${task.id})">×</button>
        </li>
    `).join('');
}

/**
 * Update task statistics
 */
function updateTaskStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    taskCount.textContent = total;
    completedCount.textContent = completed;
    totalCount.textContent = total;
    progressPercent.textContent = percent + '%';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// =========================================
// Event Listeners
// =========================================

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

addTaskBtn.addEventListener('click', () => {
    addTask(taskInput.value);
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(taskInput.value);
    }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Settings change handlers
workDurationInput.addEventListener('change', () => {
    state.workDuration = parseInt(workDurationInput.value) || 25;
    if (!state.isRunning && state.isWorkSession) {
        state.timeLeft = state.workDuration * 60;
        updateTimerDisplay();
    }
});

breakDurationInput.addEventListener('change', () => {
    state.breakDuration = parseInt(breakDurationInput.value) || 5;
    if (!state.isRunning && !state.isWorkSession) {
        state.timeLeft = state.breakDuration * 60;
        updateTimerDisplay();
    }
});

longBreakInput.addEventListener('change', () => {
    state.longBreak = parseInt(longBreakInput.value) || 15;
});

sessionsUntilLongInput.addEventListener('change', () => {
    state.sessionsUntilLong = parseInt(sessionsUntilLongInput.value) || 4;
});

// =========================================
// Theme Support
// =========================================

function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('pomodoro-theme');
    
    if (savedTheme === 'dark' || (prefersDark && !savedTheme)) {
        document.body.classList.add('theme-dark');
    }
}

// =========================================
// Initialization
// =========================================

window.addEventListener('load', () => {
    initTheme();
    updateTimerDisplay();
    updateSessionDisplay();
    updateStatistics();
    renderTasks();
});

console.log('Pomodoro Timer initialized successfully!');

