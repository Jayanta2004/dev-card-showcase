const meterFill = document.getElementById("meterFill");
const loadValue = document.getElementById("loadValue");
const statusText = document.getElementById("status");
const app = document.getElementById("app");
const loadGraph = document.getElementById("loadGraph");
const ctx = loadGraph.getContext("2d");
const thresholdLabel = document.getElementById("thresholdLabel");
const settingsToggle = document.getElementById("settingsToggle");
const settingsContent = document.getElementById("settingsContent");
const thresholdSlider = document.getElementById("thresholdSlider");
const thresholdValue = document.getElementById("thresholdValue");
const optimalMax = document.getElementById("optimalMax");
const optimalMaxLabel = document.getElementById("optimalMaxLabel");
const moderateMin = document.getElementById("moderateMin");
const moderateMax = document.getElementById("moderateMax");
const moderateMinLabel = document.getElementById("moderateMinLabel");
const moderateMaxLabel = document.getElementById("moderateMaxLabel");
const overloadMin = document.getElementById("overloadMin");
const overloadMinLabel = document.getElementById("overloadMinLabel");
const saveSettings = document.getElementById("saveSettings");
const resetDefaults = document.getElementById("resetDefaults");

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
let OVERLOAD_THRESHOLD = 70;

const DECAY_CONFIG = {
  baseDecayRate: 0.5,
  logFactor: 2,
  fatigueRate: 0.1,
  fatigueDecayRate: 0.01,
  refractoryPeriod: 5,
  refractoryPenalty: 0.3
};

let fatigueFactor = 0;
let overloadTimestamp = null;
let taskHistory = [];
const MAX_TASK_HISTORY = 10;
let lastUpdateTime = Date.now();

let zones = {
  optimal: { max: 50, color: '#22c55e' },
  moderate: { min: 50, max: 70, color: '#eab308' },
  overload: { min: 70, color: '#ef4444' }
};

function loadPreferences() {
  const saved = localStorage.getItem('cognitiveLoadZones');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      zones = parsed.zones;
      OVERLOAD_THRESHOLD = parsed.overloadThreshold;
      
      thresholdSlider.value = OVERLOAD_THRESHOLD;
      thresholdValue.textContent = OVERLOAD_THRESHOLD;
      thresholdLabel.textContent = `Overload Threshold (${OVERLOAD_THRESHOLD}%)`;
      
      optimalMax.value = zones.optimal.max;
      optimalMaxLabel.textContent = zones.optimal.max;
      
      moderateMin.value = zones.moderate.min;
      moderateMax.value = zones.moderate.max;
      moderateMinLabel.textContent = zones.moderate.min;
      moderateMaxLabel.textContent = zones.moderate.max;
      
      overloadMin.value = zones.overload.min;
      overloadMinLabel.textContent = zones.overload.min;
    } catch (e) {
      console.error('Error loading preferences', e);
    }
  }
}

function savePreferences() {
  const preferences = {
    zones: zones,
    overloadThreshold: OVERLOAD_THRESHOLD
  };
  localStorage.setItem('cognitiveLoadZones', JSON.stringify(preferences));
  
  statusText.textContent = "✅ Preferences saved!";
  setTimeout(() => {
    updateUI();
  }, 1500);
}

function resetToDefaults() {
  zones = {
    optimal: { max: 50, color: '#22c55e' },
    moderate: { min: 50, max: 70, color: '#eab308' },
    overload: { min: 70, color: '#ef4444' }
  };
  OVERLOAD_THRESHOLD = 70;
  
  thresholdSlider.value = 70;
  thresholdValue.textContent = 70;
  thresholdLabel.textContent = `Overload Threshold (70%)`;
  
  optimalMax.value = 50;
  optimalMaxLabel.textContent = 50;
  
  moderateMin.value = 50;
  moderateMax.value = 70;
  moderateMinLabel.textContent = 50;
  moderateMaxLabel.textContent = 70;
  
  overloadMin.value = 70;
  overloadMinLabel.textContent = 70;
  
  savePreferences();
  updateUI();
  statusText.textContent = "🔄 Reset to default settings";
}

function updateZonesFromSliders() {
  let optimal = parseInt(optimalMax.value);
  let modMin = parseInt(moderateMin.value);
  let modMax = parseInt(moderateMax.value);
  let overMin = parseInt(overloadMin.value);
  
  if (optimal > modMin) {
    modMin = optimal;
    moderateMin.value = modMin;
  }
  
  if (modMin > modMax) {
    modMax = modMin;
    moderateMax.value = modMax;
  }
  
  if (modMax > overMin) {
    overMin = modMax;
    overloadMin.value = overMin;
  }
  
  if (overMin > 100) {
    overMin = 100;
    overloadMin.value = 100;
  }
  
  zones.optimal.max = optimal;
  zones.moderate.min = modMin;
  zones.moderate.max = modMax;
  zones.overload.min = overMin;
  
  optimalMaxLabel.textContent = optimal;
  moderateMinLabel.textContent = modMin;
  moderateMaxLabel.textContent = modMax;
  overloadMinLabel.textContent = overMin;
  
  if (OVERLOAD_THRESHOLD !== overMin) {
    OVERLOAD_THRESHOLD = overMin;
    thresholdSlider.value = overMin;
    thresholdValue.textContent = overMin;
    thresholdLabel.textContent = `Overload Threshold (${overMin}%)`;
  }
}

function getCurrentZone(load) {
  if (load < zones.optimal.max) return 'optimal';
  else if (load < zones.moderate.max) return 'moderate';
  else return 'overload';
}

function getZoneColor(load) {
  const zone = getCurrentZone(load);
  return zones[zone].color;
}

let loadHistory = new Array(30).fill(0);
const MAX_HISTORY = 30;

let tasks = [];
let isProcessing = false;
const TASK_DURATION = 3000; 

const TaskTypes = {
  LIGHT: { load: 10, color: 'light', label: 'L', name: 'Light', fatigueMultiplier: 0.8 },
  MEDIUM: { load: 20, color: 'medium', label: 'M', name: 'Medium', fatigueMultiplier: 1.0 },
  HEAVY: { load: 30, color: 'heavy', label: 'H', name: 'Heavy', fatigueMultiplier: 1.5 },
  INTERRUPT: { load: 25, color: 'interrupt', label: 'I', name: 'Interrupt', fatigueMultiplier: 1.3 }
};

class Task {
  constructor(type, loadValue) {
    this.id = Date.now() + Math.random();
    this.type = type;
    this.loadValue = loadValue;
    this.fatigueMultiplier = TaskTypes[type].fatigueMultiplier;
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

function updateCognitiveDecay() {
  const now = Date.now();
  const deltaTime = (now - lastUpdateTime) / 1000; 
  
  if (deltaTime <= 0) return;
  
  const loadFactor = 1 - (cognitiveLoad / 200); 
  const baseRecovery = DECAY_CONFIG.baseDecayRate * loadFactor * deltaTime;
  
  const logRecovery = baseRecovery * (1 + DECAY_CONFIG.logFactor * (1 - cognitiveLoad / 100));
  
  let refractoryMultiplier = 1;
  if (overloadTimestamp) {
    const timeSinceOverload = (now - overloadTimestamp) / 1000;
    if (timeSinceOverload < DECAY_CONFIG.refractoryPeriod) {
      refractoryMultiplier = DECAY_CONFIG.refractoryPenalty;
    } else {
      overloadTimestamp = null;
    }
  }
  
  const fatigueMultiplier = 1 / (1 + fatigueFactor);
  
  let recoveryAmount = logRecovery * refractoryMultiplier * fatigueMultiplier;
  
  cognitiveLoad = Math.max(0, cognitiveLoad - recoveryAmount);
  
  fatigueFactor = Math.max(0, fatigueFactor - DECAY_CONFIG.fatigueDecayRate * deltaTime);
  
  lastUpdateTime = now;
}

function updateTaskHistory(taskType) {
  taskHistory.push({
    type: taskType,
    timestamp: Date.now(),
    multiplier: TaskTypes[taskType].fatigueMultiplier
  });
  
  if (taskHistory.length > MAX_TASK_HISTORY) {
    taskHistory.shift();
  }
  
  const now = Date.now();
  const RECENCY_WINDOW = 60000; 
  
  const taskCounts = {};
  taskHistory.forEach(task => {
    if (now - task.timestamp < RECENCY_WINDOW) {
      taskCounts[task.type] = (taskCounts[task.type] || 0) + 1;
    }
  });
  
  fatigueFactor = 0;
  Object.values(taskCounts).forEach(count => {
    fatigueFactor += count * DECAY_CONFIG.fatigueRate;
  });
  
  fatigueFactor = Math.min(2, fatigueFactor);
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

  updateTaskHistory(currentTask.type);
  
  const effectiveLoad = currentTask.loadValue * (1 + fatigueFactor * 0.2);
  cognitiveLoad += effectiveLoad;
  
  if (cognitiveLoad >= OVERLOAD_THRESHOLD && !overloadTimestamp) {
    overloadTimestamp = Date.now();
    statusText.textContent = "🚨 Cognitive overload! Refractory period started.";
  }
  
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
      
      cognitiveLoad = Math.max(0, cognitiveLoad - currentTask.loadValue * 0.7);
      
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
  
  const optimalY = padding + (graphHeight * (1 - zones.optimal.max / 100));
  const moderateY = padding + (graphHeight * (1 - zones.moderate.max / 100));
  
  ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
  ctx.fillRect(padding, optimalY, graphWidth, graphHeight - optimalY + padding);
  
  ctx.fillStyle = 'rgba(234, 179, 8, 0.1)';
  ctx.fillRect(padding, moderateY, graphWidth, optimalY - moderateY);
  
  ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
  ctx.fillRect(padding, padding, graphWidth, moderateY - padding);
  
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

function updateUI() {
  updateCognitiveDecay();
  
  cognitiveLoad = Math.max(0, Math.min(100, cognitiveLoad));
  meterFill.style.width = `${cognitiveLoad}%`;
  
  const fatiguePercent = Math.round(fatigueFactor * 50);
  loadValue.textContent = `Load: ${Math.round(cognitiveLoad)}% ${fatigueFactor > 0 ? `(Fatigue: ${fatiguePercent}%)` : ''}`;

  const zone = getCurrentZone(cognitiveLoad);
  const zoneColor = getZoneColor(cognitiveLoad);
  
  meterFill.style.background = zoneColor;
  
  if (zone === 'optimal') {
    if (fatigueFactor > 0.5) {
      statusText.textContent = "✅ System stable but fatigue accumulating";
    } else {
      statusText.textContent = "✅ System optimal";
    }
    app.classList.remove("overloaded");
    app.classList.remove("moderate");
  } else if (zone === 'moderate') {
    statusText.textContent = `⚠️ Moderate load ${fatigueFactor > 1 ? '- high fatigue' : '- maintain focus'}`;
    app.classList.remove("overloaded");
    app.classList.add("moderate");
  } else {
    if (overloadTimestamp) {
      const timeLeft = Math.ceil(DECAY_CONFIG.refractoryPeriod - ((Date.now() - overloadTimestamp) / 1000));
      statusText.textContent = `🚨 Cognitive overload - Refractory: ${timeLeft}s`;
    } else {
      statusText.textContent = "🚨 Cognitive overload detected";
    }
    app.classList.add("overloaded");
    app.classList.remove("moderate");
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
    case 'l':
      event.preventDefault();
      addTask('LIGHT');
      showKeyPress('l');
      break;
      
    case 'm':
      event.preventDefault();
      addTask('MEDIUM');
      showKeyPress('m');
      break;
      
    case 'h':
      event.preventDefault();
      addTask('HEAVY');
      showKeyPress('h');
      break;
      
    case 'i':
      event.preventDefault();
      addTask('INTERRUPT');
      showKeyPress('i');
      break;
      
    case 'r':
      event.preventDefault();
      cognitiveLoad = 0;
      tasks = [];
      isProcessing = false;
      fatigueFactor = 0;
      overloadTimestamp = null;
      taskHistory = [];
      app.classList.remove("overloaded");
      app.classList.remove("moderate");
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

// Event Listeners
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

resetBtn.addEventListener("click", () => {
  cognitiveLoad = 0;
  tasks = [];
  isProcessing = false;
  fatigueFactor = 0;
  overloadTimestamp = null;
  taskHistory = [];
  app.classList.remove("overloaded");
  app.classList.remove("moderate");
  statusText.textContent = "🔄 System reset";
  
  loadHistory = new Array(MAX_HISTORY).fill(0);
  renderTaskQueue();
  updateTotalLoad();
  updateUI();
});

settingsToggle.addEventListener("click", () => {
  settingsContent.classList.toggle("hidden");
});

thresholdSlider.addEventListener("input", (e) => {
  const val = parseInt(e.target.value);
  thresholdValue.textContent = val;
  thresholdLabel.textContent = `Overload Threshold (${val}%)`;
  OVERLOAD_THRESHOLD = val;
  overloadMin.value = val;
  overloadMinLabel.textContent = val;
  zones.overload.min = val;
  updateUI();
});

optimalMax.addEventListener("input", (e) => {
  optimalMaxLabel.textContent = e.target.value;
  updateZonesFromSliders();
  updateUI();
});

moderateMin.addEventListener("input", (e) => {
  moderateMinLabel.textContent = e.target.value;
  updateZonesFromSliders();
  updateUI();
});

moderateMax.addEventListener("input", (e) => {
  moderateMaxLabel.textContent = e.target.value;
  updateZonesFromSliders();
  updateUI();
});

overloadMin.addEventListener("input", (e) => {
  overloadMinLabel.textContent = e.target.value;
  updateZonesFromSliders();
  updateUI();
});

saveSettings.addEventListener("click", () => {
  updateZonesFromSliders();
  savePreferences();
});

resetDefaults.addEventListener("click", resetToDefaults);

document.addEventListener('keydown', handleKeyPress);

function animationLoop() {
  updateUI();
  requestAnimationFrame(animationLoop);
}

loadPreferences();
lastUpdateTime = Date.now();

console.log('🧠 Cognitive Load Visualizer with Advanced Decay Model');
console.log('Features:');
console.log('- Logarithmic recovery curve');
console.log('- Load-dependent recovery rate');
console.log('- Mental fatigue accumulation');
console.log('- Refractory period after overload');
console.log('- Task history tracking');

// Initial render
renderTaskQueue();
updateUI();
animationLoop();