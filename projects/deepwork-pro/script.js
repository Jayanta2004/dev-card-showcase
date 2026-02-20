/* ============================
   STATE
============================ */

let duration = 25 * 60;
let timeLeft = duration;
let timerInterval = null;
let isRunning = false;

const timerDisplay = document.getElementById("timer");
const progressBar = document.getElementById("progressBar");
const sessionList = document.getElementById("sessionList");
const todayStats = document.getElementById("todayStats");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

/* ============================
   EVENT LISTENERS
============================ */

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

document.addEventListener("keydown",(e)=>{
if(e.code==="Space"){
e.preventDefault();
if(isRunning) pauseTimer();
else startTimer();
}
});

/* ============================
   TIMER FUNCTIONS
============================ */

function updateDisplay(){
const minutes = Math.floor(timeLeft/60);
const seconds = timeLeft % 60;

timerDisplay.textContent =
`${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;

const percent = ((duration - timeLeft)/duration)*100;
progressBar.style.width = percent + "%";
}

function startTimer(){
if(isRunning) return;

isRunning = true;

timerInterval = setInterval(()=>{
if(timeLeft>0){
timeLeft--;
updateDisplay();
}else{
completeSession();
}
},1000);
}

function pauseTimer(){
isRunning=false;
clearInterval(timerInterval);
}

function resetTimer(){
pauseTimer();
timeLeft=duration;
updateDisplay();
}

function completeSession(){
pauseTimer();
saveSession();
playSound();
timeLeft=duration;
updateDisplay();
}

/* ============================
   SOUND
============================ */

function playSound(){
const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
audio.play();
}

/* ============================
   STORAGE
============================ */

function saveSession(){
const sessions = JSON.parse(localStorage.getItem("sessions")) || [];
const date = new Date().toLocaleString();

sessions.push({date:date,duration:25});
localStorage.setItem("sessions",JSON.stringify(sessions));

loadSessions();
}

function loadSessions(){
const sessions = JSON.parse(localStorage.getItem("sessions")) || [];
sessionList.innerHTML="";

let todayMinutes=0;
const today = new Date().toDateString();

sessions.forEach(session=>{
const item = document.createElement("div");
item.classList.add("session-item");
item.textContent = `${session.date} - ${session.duration} min`;
sessionList.appendChild(item);

if(new Date(session.date).toDateString()===today){
todayMinutes+=session.duration;
}
});

todayStats.textContent = `Today: ${todayMinutes} min`;
drawChart(sessions);
}

/* ============================
   CHART
============================ */

function drawChart(sessions){
const canvas = document.getElementById("focusChart");
const ctx = canvas.getContext("2d");

ctx.clearRect(0,0,canvas.width,canvas.height);

const weekData = {};

sessions.forEach(s=>{
const d = new Date(s.date).toDateString();
weekData[d]=(weekData[d]||0)+s.duration;
});

const labels = Object.keys(weekData).slice(-7);
const values = labels.map(l=>weekData[l]);

const max = Math.max(...values,150);
const barWidth = canvas.width/(labels.length*2);

labels.forEach((label,i)=>{
const barHeight = (values[i]/max)*150;
ctx.fillStyle="#00ffcc";
ctx.fillRect(i*barWidth*2+20,180-barHeight,barWidth,barHeight);
});
}

/* ============================
   INIT
============================ */

updateDisplay();
loadSessions();
