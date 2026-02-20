const circle = document.getElementById("circle");
const text = document.getElementById("text");
const startBtn = document.getElementById("startBtn");

let breathingInterval;
let running = false;

function startBreathing() {
  if (running) return;

  running = true;
  text.textContent = "Inhale";
  circle.classList.add("inhale");

  breathingInterval = setInterval(() => {
    // Inhale
    text.textContent = "Inhale";
    circle.classList.remove("exhale");
    circle.classList.add("inhale");

    // Hold
    setTimeout(() => {
      text.textContent = "Hold";
    }, 4000);

    // Exhale
    setTimeout(() => {
      text.textContent = "Exhale";
      circle.classList.remove("inhale");
      circle.classList.add("exhale");
    }, 6000);
  }, 10000);
}

startBtn.addEventListener("click", startBreathing);
