// ================= STATE =================
let captcha = "";
let startTime = 0;
let timerId = null;

// ================= DOM =================
const captchaText = document.getElementById("captchaText");
const userInput = document.getElementById("userInput");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const refreshBtn = document.getElementById("refreshBtn");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const resultEl = document.getElementById("result");

// ================= STORAGE =================
let bestTime = localStorage.getItem("captchaBestTime");
if (bestTime) bestEl.textContent = bestTime;

// ================= FUNCTIONS =================

// Generate random captcha
function generateCaptcha(length = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < length; i++) {
        text += chars[Math.floor(Math.random() * chars.length)];
    }
    return text;
}

// Start timer
function startTimer() {
    startTime = performance.now();
    timerId = requestAnimationFrame(updateTimer);
}

// Update timer display
function updateTimer() {
    const elapsed = (performance.now() - startTime) / 1000;
    timeEl.textContent = elapsed.toFixed(2);
    timerId = requestAnimationFrame(updateTimer);
}

// Stop timer
function stopTimer() {
    cancelAnimationFrame(timerId);
}

// Start test
function startTest() {
    captcha = generateCaptcha();
    captchaText.textContent = captcha;
    userInput.value = "";
    userInput.disabled = false;
    userInput.focus();
    resultEl.textContent = "";
    timeEl.textContent = "0.00";
    startTimer();
}

// Reset test
function resetTest() {
    stopTimer();
    captchaText.textContent = "------";
    userInput.value = "";
    userInput.disabled = true;
    timeEl.textContent = "0.00";
    resultEl.textContent = "";
}

// Validate input
function validateInput() {
    if (userInput.value === captcha) {
        stopTimer();
        const finalTime = Number(timeEl.textContent);

        resultEl.textContent = `✅ Completed in ${finalTime}s`;

        if (!bestTime || finalTime < bestTime) {
            bestTime = finalTime;
            localStorage.setItem("captchaBestTime", bestTime);
            bestEl.textContent = bestTime;
        }

        userInput.disabled = true;
    } else {
        userInput.classList.add("error");
    }
}

// ================= EVENTS =================
startBtn.addEventListener("click", startTest);
resetBtn.addEventListener("click", resetTest);
refreshBtn.addEventListener("click", startTest);

userInput.addEventListener("input", () => {
    userInput.classList.remove("error");
    if (userInput.value.length === captcha.length) {
        validateInput();
    }
});
