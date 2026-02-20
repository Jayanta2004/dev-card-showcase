let timer;
let isRunning = false;
let isFocus = true;
let timeLeft = null;
let sessionsCompleted = 0;

const display = document.getElementById("display");
const modeText = document.getElementById("mode");
const sessionsText = document.getElementById("sessions");
const focusInput = document.getElementById("focusTime");
const breakInput = document.getElementById("breakTime");

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

// Initialize display
updateDisplay(true);
