const meterFill = document.getElementById("meterFill");
const loadValue = document.getElementById("loadValue");
const statusText = document.getElementById("status");
const app = document.getElementById("app");

const taskButtons = document.querySelectorAll("[data-load]");
const interruptBtn = document.getElementById("interrupt");
const resetBtn = document.getElementById("reset");

let cognitiveLoad = 0;
const OVERLOAD_THRESHOLD = 70;

const isTyping = () => {
  const activeElement = document.activeElement;
  return activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
};

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