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
const helpRequestBtn = document.getElementById("helpRequestBtn");
const teamMembers = document.getElementById("teamMembers");
const membersList = document.getElementById("membersList");
const memberCount = document.getElementById("memberCount");
const usernameInput = document.getElementById("usernameInput");
const roomIdInput = document.getElementById("roomIdInput");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const connectionStatus = document.getElementById("connectionStatus");

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
let username = localStorage.getItem('username') || 'User';
let roomId = null;
let isConnected = false;
let isHelpRequested = false;
let teamMembersMap = new Map(); 
let peerConnections = new Map(); 
let dataChannels = new Map(); 
let localUserId = generateUserId();
let peer = null;

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
  updateUI();
}