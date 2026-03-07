const meterFill = document.getElementById("meterFill");
const loadValue = document.getElementById("loadValue");
const statusText = document.getElementById("status");
const app = document.getElementById("app");
const loadGraph = document.getElementById("loadGraph");
const ctx = loadGraph.getContext("2d");

const taskButtons = document.querySelectorAll("[data-load]");
const interruptBtn = document.getElementById("interrupt");
const resetBtn = document.getElementById("reset");

const taskQueueHTML = `
  <div class="task-queue-container">
    <h3>📋 Task Queue 
      <span class="queue-stats" id="queueStats">0 tasks</span>
    </h3>
    <div class="task-queue" id="taskQueue"></div>
    <div class="task-queue-info">
      <span>⏱️ Processing time: <span class="queue-time" id="processingTime">3s</span></span>
      <span id="queueLoad">Load: 0%</span>
    </div>
  </div>
`;

const meter = document.querySelector('.meter');
meter.insertAdjacentHTML('afterend', taskQueueHTML);

const taskQueue = document.getElementById("taskQueue");
const queueStats = document.getElementById("queueStats");
const queueLoad = document.getElementById("queueLoad");

let cognitiveLoad = 0;
const OVERLOAD_THRESHOLD = 70;

let loadHistory = new Array(30).fill(0);
const MAX_HISTORY = 30;

let tasks = [];
let isProcessing = false;
const TASK_DURATION = 3000; 

const TaskTypes = {
  LIGHT: { load: 10, color: 'light', label: 'L', name: 'Light' },
  MEDIUM: { load: 20, color: 'medium', label: 'M', name: 'Medium' },
  HEAVY: { load: 30, color: 'heavy', label: 'H', name: 'Heavy' },
  INTERRUPT: { load: 25, color: 'interrupt', label: 'I', name: 'Interrupt' }
};

class Task {
  constructor(type, loadValue) {
    this.id = Date.now() + Math.random();
    this.type = type;
    this.loadValue = loadValue;
    this.color = this.getColorClass(type);
    this.label = this.getLabel(type);
    this.createdAt = Date.now();
    this.timeRemaining = TASK_DURATION / 1000; 
  }

  getColorClass(type) {
    switch(type) {
      case 'LIGHT': return 'light';
      case 'MEDIUM': return 'medium';
      case 'HEAVY': return 'heavy';
      case 'INTERRUPT': return 'interrupt';
      default: return 'light';
    }
  }

  getLabel(type) {
    switch(type) {
      case 'LIGHT': return 'L';
      case 'MEDIUM': return 'M';
      case 'HEAVY': return 'H';
      case 'INTERRUPT': return 'I';
      default: return '?';
    }
  }
}

function addTask(type) {
  let taskType, loadAmount;
  
  switch(type) {
    case 'LIGHT':
      taskType = 'LIGHT';
      loadAmount = 10;
      break;
    case 'MEDIUM':
      taskType = 'MEDIUM';
      loadAmount = 20;
      break;
    case 'HEAVY':
      taskType = 'HEAVY';
      loadAmount = 30;
      break;
    case 'INTERRUPT':
      taskType = 'INTERRUPT';
      loadAmount = 25;
      break;
    default:
      return;
  }

  const task = new Task(taskType, loadAmount);
  
  if (type === 'INTERRUPT') {
    tasks.unshift(task);
    statusText.textContent = "⚡ Interrupt jumped to front!";
  } else {
    tasks.push(task);
    statusText.textContent = `➕ ${taskType} task added to queue`;
  }

  renderTaskQueue();
  updateTotalLoad();
  
  if (!isProcessing) {
    processNextTask();
  }
}

function processNextTask() {
  if (tasks.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const currentTask = tasks[0]; 
  const taskElement = document.querySelector(`[data-task-id="${currentTask.id}"]`);
  
  if (taskElement) {
    taskElement.classList.add('processing');
  }

  cognitiveLoad += currentTask.loadValue;
  updateUI();

  let timeLeft = TASK_DURATION / 1000;
  const timerInterval = setInterval(() => {
    timeLeft -= 0.1;
    const timerElement = taskElement?.querySelector('.task-timer');
    if (timerElement) {
      timerElement.textContent = `${timeLeft.toFixed(1)}s`;
    }
  }, 100);

  setTimeout(() => {
    clearInterval(timerInterval);
    
    if (taskElement) {
      taskElement.classList.add('completing');
      taskElement.classList.remove('processing');
    }

    setTimeout(() => {
      tasks.shift(); 
      
      cognitiveLoad = Math.max(0, cognitiveLoad - currentTask.loadValue * 0.9);
      
      renderTaskQueue();
      updateTotalLoad();
      updateUI();
      
      processNextTask();
    }, 300); 
  }, TASK_DURATION);
}

function renderTaskQueue() {
  taskQueue.innerHTML = '';
  
  tasks.forEach((task, index) => {
    const taskDot = document.createElement('div');
    taskDot.className = `task-dot ${task.color}`;
    taskDot.setAttribute('data-task-id', task.id);
    
    const label = document.createElement('span');
    label.textContent = task.label;
    taskDot.appendChild(label);
    
    if (index === 0) {
      taskDot.classList.add('processing');
      const timer = document.createElement('span');
      timer.className = 'task-timer';
      timer.textContent = '3.0s';
      taskDot.appendChild(timer);
    }
    
    taskQueue.appendChild(taskDot);
  });

  const taskCount = tasks.length;
  queueStats.textContent = `${taskCount} task${taskCount !== 1 ? 's' : ''}`;
  
  if (taskCount > 0) {
    const firstTask = tasks[0];
    queueLoad.textContent = `Processing: ${firstTask.type}`;
  } else {
    queueLoad.textContent = 'Queue empty';
  }
}

function updateTotalLoad() {
  const pendingLoad = tasks.reduce((total, task) => total + task.loadValue, 0);
  const totalTime = tasks.length * 3;
  
  const processingTimeEl = document.getElementById('processingTime');
  if (tasks.length > 0) {
    processingTimeEl.textContent = `${totalTime}s total`;
  } else {
    processingTimeEl.textContent = '3s per task';
  }
}

const isTyping = () => {
  const activeElement = document.activeElement;
  return activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
};

function updateLoadHistory() {
  loadHistory.push(cognitiveLoad);
  if (loadHistory.length > MAX_HISTORY) {
    loadHistory.shift();
  }
  drawGraph();
}

function drawGraph() {
  ctx.clearRect(0, 0, loadGraph.width, loadGraph.height);
  
  const width = loadGraph.width;
  const height = loadGraph.height;
  const padding = 5;
  const graphWidth = width - (padding * 2);
  const graphHeight = height - (padding * 2);
  
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 0.5;
  
  for (let i = 0; i <= 4; i++) {
    const y = padding + (graphHeight * i / 4);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.strokeStyle = "#e2e8f0";
    ctx.stroke();
  }
  
  const thresholdY = padding + (graphHeight * (1 - OVERLOAD_THRESHOLD / 100));
  ctx.beginPath();
  ctx.moveTo(padding, thresholdY);
  ctx.lineTo(width - padding, thresholdY);
  ctx.strokeStyle = "#ef4444";
  ctx.setLineDash([5, 3]);
  ctx.stroke();
  ctx.setLineDash([]); 
  
  if (loadHistory.length < 2) return;
  
  ctx.beginPath();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  
  const step = graphWidth / (MAX_HISTORY - 1);
  
  for (let i = 0; i < loadHistory.length; i++) {
    const x = padding + (i * step);
    const y = padding + (graphHeight * (1 - loadHistory[i] / 100));
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  
  ctx.lineTo(padding + ((loadHistory.length - 1) * step), padding + graphHeight);
  ctx.lineTo(padding, padding + graphHeight);
  ctx.closePath();
  ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
  ctx.fill();
  
  for (let i = 0; i < loadHistory.length; i++) {
    const x = padding + (i * step);
    const y = padding + (graphHeight * (1 - loadHistory[i] / 100));
    
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// Update UI
function updateUI() {
  cognitiveLoad = Math.max(0, Math.min(100, cognitiveLoad));
  meterFill.style.width = `${cognitiveLoad}%`;
  loadValue.textContent = `Load: ${Math.round(cognitiveLoad)}%`;

  if (cognitiveLoad < OVERLOAD_THRESHOLD) {
    meterFill.style.background = "#22c55e";
    statusText.textContent = "System stable";
    app.classList.remove("overloaded");
  } else {
    meterFill.style.background = "#ef4444";
    statusText.textContent = "⚠ Cognitive overload detected";
    app.classList.add("overloaded");
  }
  
  updateLoadHistory();
}

// Visual feedback for key press
function showKeyPress(key) {
  const buttons = {
    'l': document.querySelector('[data-load="10"]'),
    'm': document.querySelector('[data-load="20"]'),
    'h': document.querySelector('[data-load="30"]'),
    'i': interruptBtn,
    'r': resetBtn
  };
  
  const button = buttons[key.toLowerCase()];
  if (button) {
    button.classList.add('key-press');
    setTimeout(() => {
      button.classList.remove('key-press');
    }, 100);
  }
}

function handleKeyPress(event) {
  if (isTyping()) return;
  
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  
  const key = event.key.toLowerCase();
  
  switch(key) {
    case 'l': // Light task
      event.preventDefault();
      addTask('LIGHT');
      showKeyPress('l');
      break;
      
    case 'm': // Medium task
      event.preventDefault();
      addTask('MEDIUM');
      showKeyPress('m');
      break;
      
    case 'h': // Heavy task
      event.preventDefault();
      addTask('HEAVY');
      showKeyPress('h');
      break;
      
    case 'i': // Interrupt
      event.preventDefault();
      addTask('INTERRUPT');
      showKeyPress('i');
      break;
      
    case 'r': // Reset
      event.preventDefault();
      cognitiveLoad = 0;
      tasks = [];
      isProcessing = false;
      app.classList.remove("overloaded");
      statusText.textContent = "🔄 System reset";
      renderTaskQueue();
      updateTotalLoad();
      showKeyPress('r');
      updateUI();
      break;
      
    default:
      break;
  }
}

taskButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const load = Number(btn.dataset.load);
    if (load === 10) addTask('LIGHT');
    else if (load === 20) addTask('MEDIUM');
    else if (load === 30) addTask('HEAVY');
  });
});

interruptBtn.addEventListener("click", () => {
  addTask('INTERRUPT');
});

// Reset simulation
resetBtn.addEventListener("click", () => {
  cognitiveLoad = 0;
  tasks = [];
  isProcessing = false;
  app.classList.remove("overloaded");
  statusText.textContent = "🔄 System reset";
  
  loadHistory = new Array(MAX_HISTORY).fill(0);
  renderTaskQueue();
  updateTotalLoad();
  updateUI();
});

document.addEventListener('keydown', handleKeyPress);

console.log('Task Queue System initialized with keyboard shortcuts');
console.log('Tasks take 3 seconds to complete');
console.log('Interrupts jump to front of queue');

// Initial render
renderTaskQueue();
updateUI();