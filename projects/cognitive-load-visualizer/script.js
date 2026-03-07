const meterFill = document.getElementById("meterFill");
const loadValue = document.getElementById("loadValue");
const statusText = document.getElementById("status");
const app = document.getElementById("app");
const loadGraph = document.getElementById("loadGraph");
const ctx = loadGraph.getContext("2d");

const taskButtons = document.querySelectorAll("[data-load]");
const interruptBtn = document.getElementById("interrupt");
const resetBtn = document.getElementById("reset");

let cognitiveLoad = 0;
const OVERLOAD_THRESHOLD = 70;

let loadHistory = new Array(30).fill(0);
const MAX_HISTORY = 30;

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
      cognitiveLoad += 10;
      statusText.textContent = "➕ Light task added";
      showKeyPress('l');
      updateUI();
      break;
      
    case 'm': // Medium task
      event.preventDefault();
      cognitiveLoad += 20;
      statusText.textContent = "➕ Medium task added";
      showKeyPress('m');
      updateUI();
      break;
      
    case 'h': // Heavy task
      event.preventDefault();
      cognitiveLoad += 30;
      statusText.textContent = "➕ Heavy task added";
      showKeyPress('h');
      updateUI();
      break;
      
    case 'i': // Interrupt
      event.preventDefault();
      cognitiveLoad += 25;
      statusText.textContent = "⚡ Interrupted! Load spiked";
      showKeyPress('i');
      updateUI();
      break;
      
    case 'r': // Reset
      event.preventDefault();
      cognitiveLoad = 0;
      app.classList.remove("overloaded");
      statusText.textContent = "🔄 System reset";
      showKeyPress('r');
      updateUI();
      break;
      
    default:
      break;
  }
}

taskButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    cognitiveLoad += Number(btn.dataset.load);
    updateUI();
  });
});

// Interrupt task (higher penalty)
interruptBtn.addEventListener("click", () => {
  cognitiveLoad += 25;
  statusText.textContent = "⚡ Interrupted! Load spiked";
  updateUI();
});

// Reset simulation
resetBtn.addEventListener("click", () => {
  cognitiveLoad = 0;
  app.classList.remove("overloaded");
  statusText.textContent = "🔄 System reset";
  
  loadHistory = new Array(MAX_HISTORY).fill(0);
  updateUI();
});

// Time-based recovery
setInterval(() => {
  if (cognitiveLoad > 0) {
    cognitiveLoad -= cognitiveLoad > OVERLOAD_THRESHOLD ? 0.5 : 1;
    updateUI();
  }
}, 1000);

document.addEventListener('keydown', handleKeyPress);

console.log('Keyboard shortcuts enabled: L (Light), M (Medium), H (Heavy), I (Interrupt), R (Reset)');

// Initial render
updateUI();