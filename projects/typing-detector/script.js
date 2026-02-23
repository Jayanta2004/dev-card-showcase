/* =========================================================
   Human vs Bot Typing Detector
   ========================================================= */

/* ================= GLOBAL STATE ================= */

const input = document.getElementById("typingInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");

const avgIntervalEl = document.getElementById("avgInterval");
const varianceEl = document.getElementById("variance");
const pausesEl = document.getElementById("pauses");
const backspacesEl = document.getElementById("backspaces");
const verdictEl = document.getElementById("verdict");
const timelineContainer = document.getElementById("timelineContainer");

/* Arrays to store typing data */
let keystrokeTimes = [];
let intervals = [];
let backspaceCount = 0;

/*  EVENT LISTENERS  */

input.addEventListener("keydown", recordKey);
analyzeBtn.addEventListener("click", analyzeTyping);
resetBtn.addEventListener("click", resetAll);

/* RECORD KEYSTROKES  */

function recordKey(e) {
  const now = performance.now();

  // Record timestamp
  keystrokeTimes.push(now);

  // Count backspaces
  if (e.key === "Backspace") {
    backspaceCount++;
  }

  // Calculate interval
  if (keystrokeTimes.length > 1) {
    const lastIndex = keystrokeTimes.length - 1;
    const interval =
      keystrokeTimes[lastIndex] - keystrokeTimes[lastIndex - 1];
    intervals.push(interval);
  }
}

/* ANALYSIS */

function analyzeTyping() {
  if (intervals.length < 5) {
    alert("Type more before analyzing.");
    return;
  }

  const avg = calculateAverage(intervals);
  const variance = calculateVariance(intervals, avg);
  const pauses = countPauses(intervals);

  avgIntervalEl.innerText = avg.toFixed(2) + " ms";
  varianceEl.innerText = variance.toFixed(2);
  pausesEl.innerText = pauses;
  backspacesEl.innerText = backspaceCount;

  const verdict = decideVerdict(avg, variance, pauses, backspaceCount);
  verdictEl.innerText = verdict;

  renderTimeline(intervals);
}

/* CALCULATIONS  */

function calculateAverage(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum / arr.length;
}

function calculateVariance(arr, mean) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += Math.pow(arr[i] - mean, 2);
  }
  return total / arr.length;
}

function countPauses(arr) {
  let pauses = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 800) {
      pauses++;
    }
  }
  return pauses;
}

/* VERDICT LOGIC */

function decideVerdict(avg, variance, pauses, backspaces) {
  let score = 0;

  // Humans have higher variance
  if (variance > 20000) score += 2;
  else score -= 2;

  // Humans pause naturally
  if (pauses > 2) score += 2;
  else score -= 1;

  // Humans make mistakes
  if (backspaces > 0) score += 2;
  else score -= 2;

  // Bots are too fast
  if (avg < 80) score -= 3;
  else score += 1;

  if (score >= 3) return "Human Typing Detected 👤";
  return "Bot-like Typing Detected 🤖";
}

/*  TIMELINE  */

function renderTimeline(intervals) {
  timelineContainer.innerHTML = "";

  intervals.forEach(interval => {
    const bar = document.createElement("div");
    bar.className = "timeline-bar";

    const height = Math.min(interval / 5, 100);
    bar.style.height = height + "px";

    timelineContainer.appendChild(bar);
  });
}

/*  RESET */

function resetAll() {
  keystrokeTimes = [];
  intervals = [];
  backspaceCount = 0;

  input.value = "";
  avgIntervalEl.innerText = "-";
  varianceEl.innerText = "-";
  pausesEl.innerText = "-";
  backspacesEl.innerText = "-";
  verdictEl.innerText = "-";
  timelineContainer.innerHTML = "";
}