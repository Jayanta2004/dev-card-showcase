document.addEventListener("DOMContentLoaded", function () {

const timeDisplay = document.getElementById("timeDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const pomodoroMode = document.getElementById("pomodoroMode");
const breakMode = document.getElementById("breakMode");

const totalSessionsEl = document.getElementById("totalSessions");
const totalFocusEl = document.getElementById("totalFocus");

let timer = null;
let duration = 1500; // default 25 min
let timeLeft = duration;
let currentMode = "pomodoro";
let isRunning = false;

let stats = JSON.parse(localStorage.getItem("pomodoroStats")) || {
    sessions: 0,
    focusMinutes: 0
};

/* ================= DISPLAY ================= */
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timeDisplay.textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/* ================= TIMER ================= */
function startTimer() {
    if (isRunning) return;
    isRunning = true;

    let secondsCounter = 0;

    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            secondsCounter++;
            updateDisplay();

            // 🔥 Update analytics every 60 seconds (only in pomodoro mode)
            if (currentMode === "pomodoro" && secondsCounter === 60) {
                stats.focusMinutes += 1;
                secondsCounter = 0;

                localStorage.setItem("pomodoroStats", JSON.stringify(stats));
                updateStats();
                updateChart();
            }

        } else {
            clearInterval(timer);
            isRunning = false;

            // Count completed session
            if (currentMode === "pomodoro") {
                stats.sessions += 1;
                localStorage.setItem("pomodoroStats", JSON.stringify(stats));
                updateStats();
                updateChart();
            }
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = duration;
    updateDisplay();
}

/* ================= MODE SWITCH ================= */
pomodoroMode.onclick = () => {
    clearInterval(timer);
    isRunning = false;
    currentMode = "pomodoro";
    duration = 1500;
    timeLeft = duration;
    updateDisplay();
};

breakMode.onclick = () => {
    clearInterval(timer);
    isRunning = false;
    currentMode = "break";
    duration = 300;
    timeLeft = duration;
    updateDisplay();
};

/* ================= STATS ================= */
function updateStats() {
    totalSessionsEl.textContent = stats.sessions;
    totalFocusEl.textContent = stats.focusMinutes + " min";
}

/* ================= CHART ================= */
let chart;

function updateChart() {
    const ctx = document.getElementById("sessionChart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Sessions Completed", "Total Focus Minutes"],
            datasets: [{
                data: [stats.sessions, stats.focusMinutes],
                backgroundColor: ["#f43f5e", "#6366f1"]
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

/* ================= BUTTON EVENTS ================= */
startBtn.onclick = startTimer;
pauseBtn.onclick = pauseTimer;
resetBtn.onclick = resetTimer;

/* ================= INIT ================= */
updateDisplay();
updateStats();
updateChart();

});