let timer;
let isRunning = false;
let isFocus = true;
let timeLeft = null;
let sessionsCompleted = 0;
let focusTimeToday = 0;
let focusTimeWeek = 0;
let streak = 0;

const display = document.getElementById("display");
const modeText = document.getElementById("mode");
const sessionsText = document.getElementById("sessions");
const todayTime = document.getElementById("todayTime");
const weekTime = document.getElementById("weekTime");
const streakEl = document.getElementById("streak");
const focusInput = document.getElementById("focusTime");
const breakInput = document.getElementById("breakTime");
const chartCanvas = document.getElementById("chart");
const tipEl = document.getElementById("tip");

const tips = [
    "Take regular breaks to maintain focus and prevent burnout.",
    "Set specific goals for each focus session to stay motivated.",
    "Eliminate distractions by creating a dedicated workspace.",
    "Use the Pomodoro technique: 25 minutes focus, 5 minutes break.",
    "Track your progress to see improvements over time.",
    "Stay hydrated and maintain good posture during long sessions.",
    "Reward yourself after completing focus sessions.",
    "Prioritize tasks and tackle the most important ones first.",
    "Minimize multitasking to improve concentration.",
    "Get enough sleep to enhance cognitive function."
];

function startTimer() {
    if (isRunning) return;

    if (timeLeft === null) {
        const minutes = isFocus ? focusInput.value : breakInput.value;
        timeLeft = minutes * 60;
    }

    isRunning = true;

    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;

            if (isFocus) {
                sessionsCompleted++;
                sessionsText.textContent = sessionsCompleted;
                focusTimeToday += parseInt(focusInput.value);
                updateStats();
                saveData();
            }

            isFocus = !isFocus;
            modeText.textContent = isFocus ? "Focus Mode" : "Break Mode";
            timeLeft = null;
            startTimer();
            return;
        }

        timeLeft--;
        updateDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isFocus = true;
    timeLeft = null;
    sessionsCompleted = 0;

    sessionsText.textContent = "0";
    modeText.textContent = "Focus Mode";
    updateDisplay(true);
}

function updateDisplay(reset = false) {
    const minutes = reset
        ? focusInput.value
        : Math.floor(timeLeft / 60);
    const seconds = reset ? 0 : timeLeft % 60;

    display.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

function updateStats() {
    todayTime.textContent = focusTimeToday;
    weekTime.textContent = focusTimeWeek;
    streakEl.textContent = streak;
    drawChart();
}

function drawChart() {
    const ctx = chartCanvas.getContext('2d');
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    // Simple bar chart for weekly data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [10, 15, 20, 25, 30, 35, 40]; // Mock data, in real app load from storage

    const barWidth = 40;
    const maxHeight = 150;
    const maxData = Math.max(...data);

    ctx.fillStyle = '#48bb78';
    data.forEach((value, index) => {
        const height = (value / maxData) * maxHeight;
        const x = 50 + index * 50;
        const y = chartCanvas.height - height - 20;
        ctx.fillRect(x, y, barWidth, height);
        ctx.fillStyle = '#000';
        ctx.fillText(days[index], x + 10, chartCanvas.height - 5);
        ctx.fillText(value, x + 10, y - 5);
        ctx.fillStyle = '#48bb78';
    });
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tipEl.textContent = randomTip;
}

function saveData() {
    const data = {
        focusTimeToday,
        focusTimeWeek,
        streak,
        sessionsCompleted,
        lastDate: new Date().toDateString()
    };
    localStorage.setItem('focusTracker', JSON.stringify(data));
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('focusTracker'));
    if (data) {
        focusTimeToday = data.focusTimeToday || 0;
        focusTimeWeek = data.focusTimeWeek || 0;
        streak = data.streak || 0;
        sessionsCompleted = data.sessionsCompleted || 0;
        const lastDate = data.lastDate;
        const today = new Date().toDateString();
        if (lastDate !== today) {
            focusTimeToday = 0;
            if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
                streak++;
            } else {
                streak = 0;
            }
        }
    }
    updateStats();
}

// Initialize
updateDisplay(true);
loadData();
getNewTip();</content>
<parameter name="filePath">C:\Users\Gupta\Downloads\dev-card-showcase\projects\Focus-Time-Tracker\script.js