// Pomodoro Timer - app.js
// Core logic for timer, tasks, analytics, and UI

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const workMinInput = document.getElementById('work-min');
const shortBreakMinInput = document.getElementById('short-break-min');
const longBreakMinInput = document.getElementById('long-break-min');
const intervalsInput = document.getElementById('intervals');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const analyticsDiv = document.getElementById('analytics');

let timer = null;
let timerType = 'work';
let timeLeft = 25 * 60;
let intervalCount = 0;
let pomodoroStats = {
  completed: 0,
  totalTime: 0,
  today: 0
};
let tasks = [
  { text: 'Write project report', completed: false },
  { text: 'Read 20 pages', completed: true },
  { text: 'Code 1 hour', completed: false }
];

function updateTimerDisplay() {
  const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const sec = (timeLeft % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
}

function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timer);
      timer = null;
      handleTimerEnd();
    }
  }, 1000);
}

function pauseTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resetTimer() {
  pauseTimer();
  setTimerType(timerType);
}

function setTimerType(type) {
  timerType = type;
  let min = parseInt(workMinInput.value);
  if (type === 'short') min = parseInt(shortBreakMinInput.value);
  if (type === 'long') min = parseInt(longBreakMinInput.value);
  timeLeft = min * 60;
  updateTimerDisplay();
}

function handleTimerEnd() {
  if (timerType === 'work') {
    pomodoroStats.completed++;
    pomodoroStats.totalTime += parseInt(workMinInput.value);
    intervalCount++;
    if (intervalCount % parseInt(intervalsInput.value) === 0) {
      setTimerType('long');
    } else {
      setTimerType('short');
    }
  } else {
    setTimerType('work');
  }
  updateAnalytics();
  startTimer();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
workMinInput.addEventListener('change', () => setTimerType('work'));
shortBreakMinInput.addEventListener('change', () => setTimerType('short'));
longBreakMinInput.addEventListener('change', () => setTimerType('long'));
intervalsInput.addEventListener('change', resetTimer);

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.innerHTML = `
      <span>${task.text}</span>
      <input type="checkbox" ${task.completed ? 'checked' : ''} data-idx="${idx}">
    `;
    taskList.appendChild(li);
  });
  document.querySelectorAll('#task-list input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', e => {
      const idx = parseInt(cb.getAttribute('data-idx'));
      tasks[idx].completed = cb.checked;
      renderTasks();
    });
  });
}

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    taskInput.value = '';
    renderTasks();
  }
});

function updateAnalytics() {
  analyticsDiv.innerHTML = `
    <div>Pomodoros completed: <b>${pomodoroStats.completed}</b></div>
    <div>Total focus time: <b>${pomodoroStats.totalTime}</b> min</div>
    <div>Tasks completed: <b>${tasks.filter(t => t.completed).length}</b> / ${tasks.length}</div>
  `;
}

// Initial setup
setTimerType('work');
renderTasks();
updateAnalytics();
