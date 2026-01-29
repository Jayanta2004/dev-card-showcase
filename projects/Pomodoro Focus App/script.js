const modeDisplay = document.getElementById("mode");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const workInput = document.getElementById("workTime");
const breakInput = document.getElementById("breakTime");
const progress = document.getElementById("progress");
const themeBtn = document.getElementById("themeBtn");

let workMinutes = parseInt(workInput.value);
let breakMinutes = parseInt(breakInput.value);
let time = workMinutes * 60;
let isRunning = false;
let isWork = true;
let timerInterval;

const circumference = 2 * Math.PI * 90; // r=90

function updateDisplay(){
  const m = Math.floor(time/60).toString().padStart(2,'0');
  const s = (time%60).toString().padStart(2,'0');
  timeDisplay.textContent = `${m}:${s}`;
  const total = isWork ? workMinutes*60 : breakMinutes*60;
  progress.style.strokeDashoffset = circumference - (time/total)*circumference;
}

function switchMode(){
  isWork = !isWork;
  modeDisplay.textContent = isWork ? "Work" : "Break";
  time = (isWork ? parseInt(workInput.value) : parseInt(breakInput.value)) * 60;
  updateDisplay();
}

function startTimer(){
  if(isRunning) return;
  isRunning = true;
  timerInterval = setInterval(()=>{
    time--;
    updateDisplay();
    if(time<=0){
      clearInterval(timerInterval);
      isRunning = false;
      switchMode();
      startTimer();
    }
  },1000);
}

function resetTimer(){
  clearInterval(timerInterval);
  isRunning = false;
  time = (isWork ? parseInt(workInput.value) : parseInt(breakInput.value))*60;
  updateDisplay();
}

startBtn.onclick = startTimer;
resetBtn.onclick = resetTimer;

workInput.onchange = () => {workMinutes = parseInt(workInput.value); if(isWork) resetTimer();}
breakInput.onchange = () => {breakMinutes = parseInt(breakInput.value); if(!isWork) resetTimer();}

themeBtn.onclick = () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
}

// Initialize
updateDisplay();

// ------------------- Background Animation -------------------
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

let particles = [];
for(let i=0;i<150;i++){
  particles.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*2+1,
    dx: (Math.random()-0.5)*0.5,
    dy: (Math.random()-0.5)*0.5,
    color: `hsl(${Math.random()*360}, 80%, 60%)`
  });
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x += p.dx;
    p.y += p.dy;
    if(p.x<0 || p.x>canvas.width) p.dx*=-1;
    if(p.y<0 || p.y>canvas.height) p.dy*=-1;

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });
  requestAnimationFrame(animate);
}

animate();
window.addEventListener('resize',()=>{
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});
