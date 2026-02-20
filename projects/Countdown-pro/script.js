const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const minutesInput = document.getElementById("minutesInput");
const circle = document.getElementById("progressCircle");

let totalTime = 0;
let timeLeft = 0;
let timer;
const circumference = 565;

startBtn.onclick = startTimer;
resetBtn.onclick = resetTimer;

function startTimer() {
  const mins = parseInt(minutesInput.value);
  if (!mins || mins <= 0) return;

  totalTime = mins * 60;
  timeLeft = totalTime;

  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  if (timeLeft <= 0) {
    clearInterval(timer);
    celebrate();
    return;
  }

  timeLeft--;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  minutesDisplay.textContent = String(mins).padStart(2, "0");
  secondsDisplay.textContent = String(secs).padStart(2, "0");

  minutesDisplay.classList.add("animate");
  secondsDisplay.classList.add("animate");
  setTimeout(() => {
    minutesDisplay.classList.remove("animate");
    secondsDisplay.classList.remove("animate");
  }, 200);

  const progress = circumference - (timeLeft / totalTime) * circumference;
  circle.style.strokeDashoffset = progress;
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 0;
  minutesDisplay.textContent = "00";
  secondsDisplay.textContent = "00";
  circle.style.strokeDashoffset = circumference;
}

function celebrate() {
  playBeep();
  launchConfetti();
}

function playBeep() {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(600, ctx.currentTime);
  oscillator.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.3);
}

function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({length: 150}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 6 + 4,
    speed: Math.random() * 3 + 2
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.fillStyle = `hsl(${Math.random()*360}, 100%, 50%)`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      p.y += p.speed;
      if (p.y > canvas.height) p.y = -10;
    });
    requestAnimationFrame(animate);
  }
  animate();
}