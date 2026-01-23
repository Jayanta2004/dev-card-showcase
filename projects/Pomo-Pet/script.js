// --- DOM Elements ---
const timerDisplay = document.getElementById('timerDisplay');
const btnStart = document.getElementById('btnStart');
const btnPause = document.getElementById('btnPause');
const btnReset = document.getElementById('btnReset');
const btnWork = document.getElementById('btnWork');
const btnBreak = document.getElementById('btnBreak');

const petSprite = document.getElementById('petSprite');
const petDialogue = document.getElementById('petDialogue');
const sessionType = document.getElementById('sessionType');
const streakCounter = document.getElementById('streakCounter');

// --- State Variables ---
const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60;  // 5 minutes in seconds

let timeLeft = WORK_TIME;
let timerId = null;
let isRunning = false;
let isWorkMode = true;
let streak = 0;

// --- Initialize ---
updateDisplay();

// --- Timer Logic ---
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    
    // UI Updates
    btnStart.classList.add('hidden');
    btnPause.classList.remove('hidden');
    document.body.classList.remove('distracted');
    
    petSprite.innerText = "🐶";
    petDialogue.innerText = isWorkMode ? "Focus mode ON! Let's go!" : "Relaxing time! Good job.";
    petSprite.style.animationPlayState = "running";

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerId);
            isRunning = false;
            handleSessionEnd();
        }
    }, 1000);
}

function pauseTimer(isDistracted = false) {
    if (!isRunning) return;
    clearInterval(timerId);
    isRunning = false;
    
    btnStart.classList.remove('hidden');
    btnStart.innerText = "RESUME";
    btnPause.classList.add('hidden');
    petSprite.style.animationPlayState = "paused";

    if (isDistracted) {
        document.body.classList.add('distracted');
        petSprite.innerText = "😿";
        petDialogue.innerText = "Hey! You left the tab! Focus lost.";
        streak = 0; // Reset streak on distraction
        streakCounter.innerText = `🔥 ${streak}`;
    } else {
        petSprite.innerText = "😴";
        petDialogue.innerText = "Timer paused.";
    }
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    document.body.classList.remove('distracted');
    
    btnStart.classList.remove('hidden');
    btnStart.innerText = "START";
    btnPause.classList.add('hidden');
    
    timeLeft = isWorkMode ? WORK_TIME : BREAK_TIME;
    updateDisplay();
    
    petSprite.innerText = "🐶";
    petDialogue.innerText = "Ready when you are!";
    petSprite.style.animationPlayState = "running";
}

function handleSessionEnd() {
    btnStart.classList.remove('hidden');
    btnStart.innerText = "START";
    btnPause.classList.add('hidden');
    petSprite.style.animationPlayState = "paused";

    if (isWorkMode) {
        petSprite.innerText = "🎉";
        petDialogue.innerText = "Session complete! Take a break.";
        streak++;
        streakCounter.innerText = `🔥 ${streak}`;
        // Auto-switch to break
        switchMode(false);
    } else {
        petSprite.innerText = "💪";
        petDialogue.innerText = "Break over. Back to work!";
        // Auto-switch to work
        switchMode(true);
    }
}

// --- Mode Switching ---
function switchMode(toWorkMode) {
    isWorkMode = toWorkMode;
    sessionType.innerText = isWorkMode ? "FOCUS MODE" : "BREAK MODE";
    
    if (isWorkMode) {
        btnWork.classList.add('active');
        btnBreak.classList.remove('active');
    } else {
        btnBreak.classList.add('active');
        btnWork.classList.remove('active');
    }
    
    resetTimer();
}

// --- Event Listeners ---
btnStart.addEventListener('click', startTimer);
btnPause.addEventListener('click', () => pauseTimer(false));
btnReset.addEventListener('click', resetTimer);

btnWork.addEventListener('click', () => switchMode(true));
btnBreak.addEventListener('click', () => switchMode(false));

// --- 🔥 Page Visibility API (The Gamification Core) ---
document.addEventListener("visibilitychange", () => {
    // If the timer is running, and the user switches away from the tab
    if (document.hidden && isRunning && isWorkMode) {
        pauseTimer(true); // Pause with distraction penalty
    }
});