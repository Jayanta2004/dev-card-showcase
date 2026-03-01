/* ═══════════════════════════════════════════════════════════
   Mine-Sweep 3000 · script.js
   Pure DOM + CSS Grid — No Canvas
   Safe first click · Recursive flood-fill · contextmenu flags
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────
   DIFFICULTY CONFIGS
   ────────────────────────────────────────────── */
const CONFIGS = {
  beginner:     { rows:  9, cols:  9, mines:  10 },
  intermediate: { rows: 16, cols: 16, mines:  40 },
  expert:       { rows: 16, cols: 30, mines:  99 }
};

/* Cell states */
const STATE = {
  UNREVEALED: 'unrevealed',
  REVEALED:   'revealed',
  FLAGGED:    'flagged',
  QUESTIONED: 'questioned',
  MINE:       'mine',
  MINE_HIT:   'mine-hit',
  MINE_WRONG: 'mine-wrong'
};

/* Smiley faces */
const FACE = { idle: '🙂', active: '😮', win: '😎', lose: '😵' };

/* ──────────────────────────────────────────────
   DOM REFS
   ────────────────────────────────────────────── */
const boardEl     = document.getElementById('board');
const mineCountEl = document.getElementById('mine-counter');
const resetBtn    = document.getElementById('reset-btn');
const timerEl     = document.getElementById('timer-display');
const diffBtns    = document.querySelectorAll('.diff-btn');
const overlay     = document.getElementById('overlay');
const backdrop    = document.getElementById('overlay-backdrop');
const oIcon       = document.getElementById('overlay-icon');
const oTitle      = document.getElementById('overlay-title');
const oMsg        = document.getElementById('overlay-msg');
const overlayBtn  = document.getElementById('overlay-btn');
const srAnnounce  = document.getElementById('sr-announce');

/* ──────────────────────────────────────────────
   GAME STATE
   ────────────────────────────────────────────── */
let grid      = [];      // grid[r][c] = { isMine, revealed, flagged, questioned, adjacentMines }
let rows      = 0;
let cols      = 0;
let totalMines= 0;
let diffKey   = 'beginner';
let gameOver  = false;
let firstClick= true;
let flagCount = 0;
let timerVal  = 0;
let timerInterval = null;
let cellEls   = [];      // cellEls[r][c] = <div>

/* Optimal cell size (px) chosen by viewport */
const CELL_SIZE_PREF = 34;
const CELL_SIZE_MIN  = 20;

function chooseCellSize(c, r) {
  const availW = Math.min(window.innerWidth  - 40, 800);
  const availH = Math.max(window.innerHeight - 200, 300);
  const byW = Math.floor(availW / c);
  const byH = Math.floor(availH / r);
  return Math.max(CELL_SIZE_MIN, Math.min(CELL_SIZE_PREF, byW, byH));
}

/* ──────────────────────────────────────────────
   INIT GRID (empty — mines placed after first click)
   ────────────────────────────────────────────── */
function initGrid(r, c) {
  rows = r; cols = c;
  grid = Array.from({ length: r }, () =>
    Array.from({ length: c }, () => ({
      isMine: false, revealed: false, flagged: false, questioned: false, adjacentMines: 0
    }))
  );
}

/* ──────────────────────────────────────────────
   MINE PLACEMENT  (after first click, safe zone = 3×3)
   ────────────────────────────────────────────── */
function placeMines(safeR, safeC) {
  const forbidden = new Set();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = safeR + dr, nc = safeC + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
        forbidden.add(`${nr},${nc}`);
    }
  }

  const candidates = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!forbidden.has(`${r},${c}`)) candidates.push([r, c]);

  // Shuffle (Fisher-Yates partial)
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const toPlace = Math.min(totalMines, candidates.length);
  for (let k = 0; k < toPlace; k++) {
    const [r, c] = candidates[k];
    grid[r][c].isMine = true;
  }
  computeAdjacency();
}

function computeAdjacency() {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isMine) { grid[r][c].adjacentMines = 0; continue; }
      let count = 0;
      eachNeighbour(r, c, (nr, nc) => { if (grid[nr][nc].isMine) count++; });
      grid[r][c].adjacentMines = count;
    }
}

function eachNeighbour(r, c, fn) {
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) fn(nr, nc);
    }
}

/* ──────────────────────────────────────────────
   FLOOD FILL (recursive reveal)
   ────────────────────────────────────────────── */
function revealCell(r, c) {
  const cell = grid[r][c];
  if (cell.revealed || cell.flagged || cell.questioned) return;
  cell.revealed = true;
  renderCell(r, c);
  if (cell.adjacentMines === 0) {
    eachNeighbour(r, c, (nr, nc) => revealCell(nr, nc));
  }
}

/* ──────────────────────────────────────────────
   RENDER (single cell)
   ────────────────────────────────────────────── */
function renderCell(r, c) {
  const cell  = grid[r][c];
  const el    = cellEls[r][c];
  if (!el) return;

  // Clear content + attributes
  el.textContent = '';
  el.removeAttribute('data-state');
  el.removeAttribute('data-num');

  if (cell.revealed && !cell.isMine) {
    el.setAttribute('data-state', STATE.REVEALED);
    if (cell.adjacentMines > 0) {
      el.textContent = cell.adjacentMines;
      el.setAttribute('data-num', cell.adjacentMines);
    }
  } else if (cell.flagged) {
    el.setAttribute('data-state', STATE.FLAGGED);
    el.textContent = '🚩';
  } else if (cell.questioned) {
    el.setAttribute('data-state', STATE.QUESTIONED);
    el.textContent = '❓';
  } else {
    el.setAttribute('data-state', STATE.UNREVEALED);
  }
}

/* ──────────────────────────────────────────────
   BUILD DOM BOARD
   ────────────────────────────────────────────── */
function buildBoard() {
  boardEl.innerHTML = '';
  const cs = chooseCellSize(cols, rows);
  boardEl.style.setProperty('--cell-size', `${cs}px`);
  boardEl.style.gridTemplateColumns = `repeat(${cols}, ${cs}px)`;

  cellEls = Array.from({ length: rows }, () => new Array(cols).fill(null));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.setAttribute('data-state', STATE.UNREVEALED);
      el.setAttribute('role', 'gridcell');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `Row ${r + 1} Column ${c + 1}`);

      // Left click — reveal
      el.addEventListener('click', () => handleClick(r, c));

      // Keyboard — reveal
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(r, c); }
        if (e.key === 'f' || e.key === 'F')      { e.preventDefault(); handleFlag(r, c); }
      });

      // Right click — flag cycle
      el.addEventListener('contextmenu', e => { e.preventDefault(); handleFlag(r, c); });

      // Depress smiley on mousedown
      el.addEventListener('mousedown', () => { if (!gameOver) resetBtn.textContent = FACE.active; });
      el.addEventListener('mouseup',   () => { if (!gameOver) resetBtn.textContent = FACE.idle;   });

      boardEl.appendChild(el);
      cellEls[r][c] = el;
    }
  }
}

/* ──────────────────────────────────────────────
   CLICK HANDLER
   ────────────────────────────────────────────── */
function handleClick(r, c) {
  if (gameOver) return;
  const cell = grid[r][c];
  if (cell.revealed || cell.flagged || cell.questioned) return;

  // First click: plant mines safely
  if (firstClick) {
    firstClick = false;
    placeMines(r, c);
    startTimer();
  }

  if (cell.isMine) {
    triggerLoss(r, c);
    return;
  }

  revealCell(r, c);
  checkWin();
}

/* ──────────────────────────────────────────────
   FLAG CYCLE  (unrevealed → flagged → questioned → unrevealed)
   ────────────────────────────────────────────── */
function handleFlag(r, c) {
  if (gameOver) return;
  const cell = grid[r][c];
  if (cell.revealed) return;

  if (!cell.flagged && !cell.questioned) {
    cell.flagged = true;
    flagCount++;
  } else if (cell.flagged) {
    cell.flagged = false;
    cell.questioned = true;
    flagCount--;
  } else {
    cell.questioned = false;
  }
  updateMineCounter();
  renderCell(r, c);
}

/* ──────────────────────────────────────────────
   WIN / LOSE
   ────────────────────────────────────────────── */
function checkWin() {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (!cell.isMine && !cell.revealed) return;
    }
  // All non-mine cells revealed
  stopTimer();
  gameOver = true;
  resetBtn.textContent = FACE.win;
  announce('You win!');

  // Add win pulse to all revealed cells with a stagger
  cellEls.flat().forEach((el, i) => {
    if (el.getAttribute('data-state') === STATE.REVEALED) {
      setTimeout(() => el.classList.add('win-pulse'), i * 4);
    }
  });

  setTimeout(() => showOverlay(true), 800);
}

function triggerLoss(hitR, hitC) {
  stopTimer();
  gameOver = true;
  resetBtn.textContent = FACE.lose;
  grid[hitR][hitC].revealed = true;

  // Mark the clicked mine
  const hitEl = cellEls[hitR][hitC];
  hitEl.textContent = '💣';
  hitEl.removeAttribute('data-state');
  hitEl.setAttribute('data-state', STATE.MINE_HIT);

  // Staggered reveal of all mines
  const allMines = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isMine && !(r === hitR && c === hitC)) allMines.push([r, c]);
      // Wrong flags
      if (!grid[r][c].isMine && grid[r][c].flagged) {
        const el = cellEls[r][c];
        el.setAttribute('data-state', STATE.MINE_WRONG);
        el.textContent = '❌';
      }
    }

  // Shuffle for random reveal order
  for (let i = allMines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allMines[i], allMines[j]] = [allMines[j], allMines[i]];
  }

  allMines.forEach(([r, c], idx) => {
    setTimeout(() => {
      const el = cellEls[r][c];
      if (!el) return;
      el.textContent = '💣';
      el.removeAttribute('data-state');
      el.setAttribute('data-state', STATE.MINE);
    }, 50 + idx * 35);
  });

  announce('Game over! You hit a mine.');
  setTimeout(() => showOverlay(false), 500 + allMines.length * 35 + 300);
}

/* ──────────────────────────────────────────────
   OVERLAY
   ────────────────────────────────────────────── */
function showOverlay(win) {
  if (win) {
    oIcon.textContent  = '🎉';
    oTitle.textContent = 'FIELD CLEARED';
    oMsg.textContent   = `Swept clean in ${timerVal}s. No mines detonated.`;
  } else {
    oIcon.textContent  = '💥';
    oTitle.textContent = 'BOOM';
    oMsg.textContent   = `You survived ${timerVal}s before hitting a mine.`;
  }
  overlay.classList.remove('hidden');
  backdrop.classList.remove('hidden');
}

overlayBtn.addEventListener('click', () => startNewGame(diffKey));

/* ──────────────────────────────────────────────
   TIMER
   ────────────────────────────────────────────── */
function startTimer() {
  clearInterval(timerInterval);
  timerVal = 0;
  timerEl.textContent = '000';
  timerInterval = setInterval(() => {
    if (timerVal < 999) {
      timerVal++;
      timerEl.textContent = String(timerVal).padStart(3, '0');
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

/* ──────────────────────────────────────────────
   MINE COUNTER DISPLAY
   ────────────────────────────────────────────── */
function updateMineCounter() {
  const remaining = totalMines - flagCount;
  mineCountEl.textContent = String(Math.max(0, remaining)).padStart(3, '0');
}

/* ──────────────────────────────────────────────
   SCREEN READER ANNOUNCE
   ────────────────────────────────────────────── */
function announce(msg) {
  srAnnounce.textContent = '';
  requestAnimationFrame(() => { srAnnounce.textContent = msg; });
}

/* ──────────────────────────────────────────────
   START NEW GAME
   ────────────────────────────────────────────── */
function startNewGame(diff) {
  diffKey    = diff;
  firstClick = true;
  gameOver   = false;
  flagCount  = 0;

  stopTimer();
  timerEl.textContent = '000';
  resetBtn.textContent = FACE.idle;
  overlay.classList.add('hidden');
  backdrop.classList.add('hidden');

  const cfg   = CONFIGS[diff];
  rows        = cfg.rows;
  cols        = cfg.cols;
  totalMines  = cfg.mines;

  updateMineCounter();
  initGrid(rows, cols);
  buildBoard();
  updateDiffButtons();
}

function updateDiffButtons() {
  diffBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.diff === diffKey);
  });
}

/* ──────────────────────────────────────────────
   EVENT LISTENERS
   ────────────────────────────────────────────── */
resetBtn.addEventListener('click', () => startNewGame(diffKey));

diffBtns.forEach(btn => {
  btn.addEventListener('click', () => startNewGame(btn.dataset.diff));
});

window.addEventListener('resize', () => {
  // Recalculate cell size on resize without restarting game
  const cs = chooseCellSize(cols, rows);
  boardEl.style.setProperty('--cell-size', `${cs}px`);
  boardEl.style.gridTemplateColumns = `repeat(${cols}, ${cs}px)`;
});

/* ──────────────────────────────────────────────
   BOOT
   ────────────────────────────────────────────── */
startNewGame('beginner');
