const inputs = document.querySelectorAll(".inputs input");
const display = document.querySelector(".display");
const startBtn = document.querySelector(".start");
const pauseBtn = document.querySelector(".pause");
const resetBtn = document.querySelector(".reset");
const statusText = document.querySelector(".status");

let totalSeconds = 0;
let timer = null;
let isPaused = false;

function getInputTime() {
    const hours = parseInt(inputs[0].value) || 0;
    const minutes = parseInt(inputs[1].value) || 0;
    const seconds = parseInt(inputs[2].value) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}

function updateDisplay() {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    display.textContent = 
    `${String(h).padStart(2, "0")}:` +
    `${String(m).padStart(2, "0")}:` +
    `${String(s).padStart(2, "0")}`;
}

    startBtn.addEventListener("click", () => {
        if (timer) return;

        if (!isPaused) {
            totalSeconds = getInputTime();
        }

        if (totalSeconds <= 0) {
            statusText.textContent = "Plese enter a valid time.";
            return;
        }

        statusText.textContent = "Timer running...";
        isPaused = false;

        timer = setInterval( () => {
            if (totalSeconds <= 0) {
                clearInterval(timer);
                timer = null;
                statusText.textContent = "⏰ Time's up!";
                return;
            }

            totalSeconds--;
            updateDisplay();
        }, 1000);
    });

    pauseBtn.addEventListener("click", () => {
        if (!timer) return;

        clearInterval(timer);
        timer = null;
        isPaused = true;
        statusText.textContent = "Paused";
    });

    resetBtn.addEventListener("click", () => {
        clearInterval(timer);
        timer = null;
        isPaused = false;
        totalSeconds = 0;

        inputs.forEach(input => input.value = "");
        display.textContent = "00:00:00";
        statusText.textContent = "";
    });

// Dark mode toggle
const themeToggle = document.querySelector(".theme-toggle");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
