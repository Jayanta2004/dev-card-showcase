// Pomodoro Timer with Analytics
// Uses Chart.js for analytics

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const sessionTypeDiv = document.getElementById('session-type');
const sessionLogDiv = document.getElementById('session-log');
const analyticsChartCanvas = document.getElementById('analytics-chart');

let timer = null;
let isRunning = false;
let isFocus = true;
let timeLeft = 25 * 60; // 25 minutes
let breakTime = 5 * 60; // 5 minutes
let focusTime = 25 * 60; // 25 minutes
let sessionLog = JSON.parse(localStorage.getItem('pomodoroSessionLog') || '[]');

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    sessionTypeDiv.textContent = isFocus ? 'Focus' : 'Break';
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timer);
            isRunning = false;
            logSession();
            if (isFocus) {
                isFocus = false;
                timeLeft = breakTime;
            } else {
                isFocus = true;
                timeLeft = focusTime;
            }
            updateDisplay();
            startTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (timer) clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    pauseTimer();
    isFocus = true;
    timeLeft = focusTime;
    updateDisplay();
}

function logSession() {
    const now = new Date();
    sessionLog.push({
        type: isFocus ? 'Focus' : 'Break',
        date: now.toISOString().slice(0, 10),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem('pomodoroSessionLog', JSON.stringify(sessionLog));
    renderSessionLog();
    renderAnalytics();
}

function renderSessionLog() {
    sessionLogDiv.innerHTML = '';
    sessionLog.slice().reverse().slice(0, 10).forEach(s => {
        const div = document.createElement('div');
        div.textContent = `${s.type} - ${s.date} ${s.time}`;
        sessionLogDiv.appendChild(div);
    });
}

function renderAnalytics() {
    if (window.analyticsChart) window.analyticsChart.destroy();
    // Count focus sessions per day (last 7 days)
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        days.push(dateStr.slice(5));
        counts.push(sessionLog.filter(s => s.type === 'Focus' && s.date === dateStr).length);
    }
    window.analyticsChart = new Chart(analyticsChartCanvas, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Focus Sessions',
                data: counts,
                backgroundColor: '#f7971e',
                borderRadius: 8
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#b87d1a' } },
                x: { ticks: { color: '#f7971e' } }
            }
        }
    });
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initial render
updateDisplay();
renderSessionLog();
renderAnalytics();
