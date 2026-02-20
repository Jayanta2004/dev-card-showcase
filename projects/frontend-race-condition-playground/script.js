/* =========================================================
   Frontend Race Condition Playground
   ========================================================= */

/* ================= GLOBAL STATE ================= */

let sharedState = 0;
let isLocked = false;

const stateValue = document.getElementById("stateValue");
const logContainer = document.getElementById("logContainer");
const timeline = document.getElementById("timeline");

const unsafeBtn = document.getElementById("unsafeBtn");
const safeBtn = document.getElementById("safeBtn");
const resetBtn = document.getElementById("resetBtn");

/* ================= EVENT LISTENERS ================= */

unsafeBtn.addEventListener("click", runUnsafeTasks);
safeBtn.addEventListener("click", runSafeTasks);
resetBtn.addEventListener("click", resetState);

/* ================= LOGGING ================= */

function log(message, type = "unsafe") {
  const div = document.createElement("div");
  div.className = `log-entry log-${type}`;
  div.innerText = message;
  logContainer.appendChild(div);
  logContainer.scrollTop = logContainer.scrollHeight;
}

/* ================= VISUAL ================= */

function addTimelineBar(value, delay) {
  const bar = document.createElement("div");
  bar.className = "timeline-item";
  bar.style.height = Math.min(delay / 5, 120) + "px";
  bar.innerText = value;
  timeline.appendChild(bar);
}

/* ================= UNSAFE TASKS ================= */

function runUnsafeTasks() {
  log("Starting UNSAFE async tasks...", "unsafe");

  for (let i = 1; i <= 5; i++) {
    runAsyncIncrementUnsafe(i);
  }
}

function runAsyncIncrementUnsafe(id) {
  const delay = Math.random() * 2000 + 500;

  log(`Task ${id} scheduled with delay ${delay.toFixed(0)}ms`, "unsafe");

  setTimeout(() => {
    const current = sharedState;
    log(`Task ${id} read state: ${current}`, "unsafe");

    const newValue = current + 1;
    sharedState = newValue;

    log(`Task ${id} wrote state: ${newValue}`, "unsafe");

    updateUI();
    addTimelineBar(newValue, delay);
  }, delay);
}

/* ================= SAFE TASKS ================= */

function runSafeTasks() {
  log("Starting SAFE async tasks...", "safe");

  for (let i = 1; i <= 5; i++) {
    runAsyncIncrementSafe(i);
  }
}

function runAsyncIncrementSafe(id) {
  const delay = Math.random() * 2000 + 500;

  log(`Task ${id} scheduled with delay ${delay.toFixed(0)}ms`, "safe");

  setTimeout(() => {
    acquireLock(() => {
      const current = sharedState;
      log(`Task ${id} safely read state: ${current}`, "safe");

      const newValue = current + 1;
      sharedState = newValue;

      log(`Task ${id} safely wrote state: ${newValue}`, "safe");

      updateUI();
      addTimelineBar(newValue, delay);

      releaseLock();
    });
  }, delay);
}

/* ================= LOCK MECHANISM ================= */

function acquireLock(callback) {
  const tryLock = () => {
    if (!isLocked) {
      isLocked = true;
      callback();
    } else {
      setTimeout(tryLock, 50);
    }
  };
  tryLock();
}

function releaseLock() {
  isLocked = false;
}

/* ================= UI ================= */

function updateUI() {
  stateValue.innerText = sharedState;
}

/* ================= RESET ================= */

function resetState() {
  sharedState = 0;
  isLocked = false;
  stateValue.innerText = "0";
  logContainer.innerHTML = "";
  timeline.innerHTML = "";
  log("State reset.", "safe");
}