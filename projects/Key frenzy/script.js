const arena = document.getElementById("arena");
const promptEl = document.getElementById("prompt");

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const timeEl = document.getElementById("time");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");

let state = {
  running: false,
  score: 0,
  combo: 0,
  hits: 0,
  misses: 0,
  time: 45,
  currentKey: null,
};

let timer;
let waitTimeout;

startBtn.onclick = start;
document.addEventListener("keydown", onKey);

function start() {
  state = {
    ...state,
    score: 0,
    combo: 0,
    hits: 0,
    misses: 0,
    time: 45,
    running: true,
  };
  overlay.style.display = "none";
  updateHUD();
  nextKey();
  timer = setInterval(tick, 1000);
}

function tick() {
  state.time--;
  timeEl.textContent = state.time;
  if (state.time <= 0) end();
}

function nextKey() {
  if (!state.running) return;

  const keys = "ASDFJKLQWERUIOPZXCVBNM";
  state.currentKey = keys[Math.floor(Math.random() * keys.length)];

  promptEl.textContent = state.currentKey;
  promptEl.classList.remove("flash");

  waitTimeout = setTimeout(
    () => {
      miss();
    },
    Math.max(800 - state.combo * 20, 300),
  );
}

function onKey(e) {
  if (!state.running) return;

  if (e.key.toUpperCase() === state.currentKey) {
    hit();
  } else {
    miss();
  }
}

function hit() {
  state.hits++;
  state.combo++;
  state.score += 10 + state.combo * 3;

  arena.classList.add("hit", "flash");
  setTimeout(() => arena.classList.remove("hit", "flash"), 200);

  updateHUD();
  nextKey();
}

function miss() {
  state.combo = 0;
  state.misses++;

  arena.classList.add("fail", "shake");
  setTimeout(() => arena.classList.remove("fail", "shake"), 300);

  updateHUD();
  nextKey();
}

function updateHUD() {
  scoreEl.textContent = state.score;
  comboEl.textContent = state.combo;
}

function end() {
  clearInterval(timer);
  clearTimeout(waitTimeout);

  state.running = false;

  overlayTitle.textContent = "GAME OVER";
  overlayText.textContent = `Final Score: ${state.score}`;
  overlay.style.display = "flex";
}
