/**
 * ═══════════════════════════════════════════════════════════
 * Hex-Guess · script.js
 * ═══════════════════════════════════════════════════════════
 *
 * Daily hex color puzzle for web developers.
 * Guess the mystery #RRGGBB color in 6 tries.
 * Each guess gives per-channel (R, G, B) proximity feedback.
 *
 * Architecture:
 *  1.  Constants & Config
 *  2.  DOM Cache
 *  3.  Daily Color Seeding
 *  4.  Hex ↔ RGB Utilities
 *  5.  Proximity & Feedback Engine
 *  6.  LocalStorage — State Persistence
 *  7.  LocalStorage — Stats Persistence
 *  8.  Grid Rendering
 *  9.  Tile Flip Animation
 * 10.  Toast Notifications
 * 11.  Game Logic (submit, win, lose)
 * 12.  Stats Modal
 * 13.  Help Modal
 * 14.  Countdown Timer
 * 15.  Input Handling & Validation
 * 16.  Bootstrap
 *
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. CONSTANTS & CONFIG
   ────────────────────────────────────────────────────────── */

/** Maximum number of guesses per day */
const MAX_GUESSES = 6;

/**
 * Proximity tier thresholds for each channel (0–255 distance).
 * Checked in order: smallest first.
 */
const TIERS = [
  { name: 'exact', max: 0,   arrow: ''  },
  { name: 'hot',   max: 15,  arrow: ''  },   // Arrow added dynamically
  { name: 'warm',  max: 40,  arrow: ''  },
  { name: 'cool',  max: 80,  arrow: ''  },
  { name: 'cold',  max: 255, arrow: ''  },
];

/** Emoji map for clipboard share result */
const TIER_EMOJI = {
  exact: '🟩',
  hot:   '🟧',
  warm:  '🟨',
  cool:  '🟦',
  cold:  '⬛',
};

/** localStorage keys */
const LS_STATE  = 'hexGuessState';
const LS_STATS  = 'hexGuessStats';

/* ──────────────────────────────────────────────────────────
   2. DOM CACHE
   ────────────────────────────────────────────────────────── */

const targetSwatchEl  = document.getElementById('target-swatch');
const swatchQuestion  = document.getElementById('swatch-question');
const swatchReveal    = document.getElementById('swatch-reveal');
const guessGrid       = document.getElementById('guess-grid');
const hexInput        = document.getElementById('hex-input');
const inputWrapper    = document.getElementById('input-wrapper');
const submitBtn       = document.getElementById('submit-btn');
const feedbackMsg     = document.getElementById('feedback-msg');
const timerDisplay    = document.getElementById('timer-display');
const toastEl         = document.getElementById('toast');

// Stats modal
const modalStats      = document.getElementById('modal-stats');
const statsClose      = document.getElementById('stats-close');
const statPlayedEl    = document.getElementById('stat-played');
const statWinPctEl    = document.getElementById('stat-winpct');
const statStreakEl    = document.getElementById('stat-streak');
const statMaxStreakEl = document.getElementById('stat-maxstreak');
const distChart       = document.getElementById('dist-chart');
const shareBtn        = document.getElementById('share-btn');
const shareConfirm    = document.getElementById('share-confirm');

// Help modal
const modalHelp       = document.getElementById('modal-help');
const helpClose       = document.getElementById('help-close');
const modalBackdrop   = document.getElementById('modal-backdrop');

// Header buttons
const btnStats        = document.getElementById('btn-stats');
const btnHelp         = document.getElementById('btn-help');

/* ──────────────────────────────────────────────────────────
   3. DAILY COLOR SEEDING
   ────────────────────────────────────────────────────────── */

/**
 * Generate a deterministic pseudo-random number in [0, 1) from a seed.
 * Uses a simple but effective integer hash (xorshift-style).
 * This ensures every player gets the same color on the same day.
 *
 * @param {number} seed  Integer seed value
 * @returns {number}     Float in [0, 1)
 */
function seededRandom(seed) {
  let s = seed >>> 0;           // Ensure unsigned 32-bit integer
  s ^= s << 13;
  s ^= s >> 17;
  s ^= s << 5;
  return (s >>> 0) / 4294967296;
}

/**
 * Get a date-string key for today in UTC format "YYYY-MM-DD".
 * This is the seed for today's color.
 * @returns {string}
 */
function getTodayKey() {
  const now = new Date();
  const y   = now.getUTCFullYear();
  const m   = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d   = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Convert a date key string to a numeric seed by summing
 * char codes multiplied by position — simple and deterministic.
 * @param {string} key   e.g. "2026-02-26"
 * @returns {number}
 */
function dateKeyToSeed(key) {
  return key.split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);
}

/**
 * Generate today's mystery hex color from the UTC date.
 * Each of R, G, B is independently seeded using offset seeds
 * so all three channels are independent.
 *
 * @returns {string} Uppercase hex string, e.g. "A3F28C"
 */
function getTodayColor() {
  const key  = getTodayKey();
  const seed = dateKeyToSeed(key);

  // Use offset seeds for each channel to ensure independence
  const r = Math.floor(seededRandom(seed)          * 256);
  const g = Math.floor(seededRandom(seed + 37)     * 256);
  const b = Math.floor(seededRandom(seed + 91)     * 256);

  return toHex(r) + toHex(g) + toHex(b);
}

/* ──────────────────────────────────────────────────────────
   4. HEX ↔ RGB UTILITIES
   ────────────────────────────────────────────────────────── */

/**
 * Convert a single byte (0–255) to a 2-char uppercase hex string.
 * @param {number} byte  Integer 0–255
 * @returns {string}     e.g. 255 → "FF", 10 → "0A"
 */
const toHex = (byte) => byte.toString(16).padStart(2, '0').toUpperCase();

/**
 * Parse a 6-character hex string (without #) into RGB channels.
 * Uses parseInt with base 16 per the issue spec.
 *
 * @param {string} hex   6-char hex string, e.g. "FF5733"
 * @returns {{ r:number, g:number, b:number }}
 */
function hexToRGB(hex) {
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

/**
 * Validate a raw input string as a 6-digit hex code.
 * Strips leading # if present. Returns the cleaned 6-char string
 * on success, or null on failure.
 *
 * @param {string} raw   User-typed input
 * @returns {string|null}
 */
function parseHexInput(raw) {
  let cleaned = raw.trim().toUpperCase();
  if (cleaned.startsWith('#')) cleaned = cleaned.slice(1);

  // Must be exactly 6 hex characters
  if (/^[0-9A-F]{6}$/.test(cleaned)) return cleaned;
  return null;
}

/* ──────────────────────────────────────────────────────────
   5. PROXIMITY & FEEDBACK ENGINE
   ────────────────────────────────────────────────────────── */

/**
 * Determine the proximity tier name for a channel distance.
 * @param {number} distance   Absolute difference between guess and target (0–255)
 * @returns {string}          One of: 'exact' | 'hot' | 'warm' | 'cool' | 'cold'
 */
function getTier(distance) {
  if (distance === 0)  return 'exact';
  if (distance <= 15)  return 'hot';
  if (distance <= 40)  return 'warm';
  if (distance <= 80)  return 'cool';
  return 'cold';
}

/**
 * Compute full feedback for a guessed hex against the target.
 * Returns an array of 3 channel result objects (R, G, B order).
 *
 * Each result: { tier:string, arrow:string, guessVal:number, targetVal:number }
 *
 * @param {string} guessHex   6-char uppercase guess hex (no #)
 * @param {string} targetHex  6-char uppercase target hex (no #)
 * @returns {Array<{tier:string, arrow:string, channelName:string}>}
 */
function computeFeedback(guessHex, targetHex) {
  const guess  = hexToRGB(guessHex);
  const target = hexToRGB(targetHex);

  return ['r', 'g', 'b'].map(ch => {
    const guessVal  = guess[ch];
    const targetVal = target[ch];
    const distance  = Math.abs(guessVal - targetVal);
    const tier      = getTier(distance);

    // Direction arrow: ↑ means target > guess (need to go higher),
    //                  ↓ means target < guess (need to go lower)
    const arrow = tier === 'exact' ? '' :
                  (targetVal > guessVal ? '↑' : '↓');

    return { tier, arrow, channelName: ch.toUpperCase(), guessVal, targetVal };
  });
}

/**
 * Check if all 3 channels are 'exact' (i.e. perfect guess).
 * @param {Array}   feedback  Result from computeFeedback()
 * @returns {boolean}
 */
const isExactMatch = (feedback) => feedback.every(f => f.tier === 'exact');

/* ──────────────────────────────────────────────────────────
   6. LOCALSTORAGE — STATE PERSISTENCE
   ────────────────────────────────────────────────────────── */

/**
 * Default game state structure.
 * @typedef {{
 *   dateKey:  string,
 *   guesses:  string[],
 *   status:   'playing'|'won'|'lost',
 *   feedback: Array<Array>
 * }} GameState
 */

/**
 * Load today's saved game state from localStorage.
 * If none exists, or the saved date doesn't match today, returns a fresh state.
 * @returns {GameState}
 */
function loadState() {
  const today = getTodayKey();
  try {
    const raw   = localStorage.getItem(LS_STATE);
    if (!raw) return freshState(today);
    const saved = JSON.parse(raw);
    // If a different day → fresh state (yesterday's data is stale)
    if (saved.dateKey !== today) return freshState(today);
    return saved;
  } catch {
    return freshState(today);
  }
}

/**
 * Return a blank game state for today.
 * @param {string} dateKey
 * @returns {GameState}
 */
const freshState = (dateKey) => ({
  dateKey,
  guesses:  [],
  status:   'playing',
  feedback: [],          // Array of per-row feedback arrays
});

/**
 * Persist the current game state to localStorage.
 * @param {GameState} state
 */
const saveState = (state) => {
  localStorage.setItem(LS_STATE, JSON.stringify(state));
};

/* ──────────────────────────────────────────────────────────
   7. LOCALSTORAGE — STATS PERSISTENCE
   ────────────────────────────────────────────────────────── */

/**
 * @typedef {{
 *   played:      number,
 *   won:         number,
 *   streak:      number,
 *   maxStreak:   number,
 *   lastWonDate: string,
 *   distribution: number[]   // Index 0 = won in 1 guess, etc.
 * }} Stats
 */

/** Load lifetime stats from localStorage */
function loadStats() {
  try {
    const raw = localStorage.getItem(LS_STATS);
    if (!raw) return freshStats();
    return { ...freshStats(), ...JSON.parse(raw) };
  } catch {
    return freshStats();
  }
}

/** Default stats object */
const freshStats = () => ({
  played:       0,
  won:          0,
  streak:       0,
  maxStreak:    0,
  lastWonDate:  '',
  distribution: [0, 0, 0, 0, 0, 0],   // Counts for guesses 1–6
});

/** Save stats to localStorage */
const saveStats = (stats) => {
  localStorage.setItem(LS_STATS, JSON.stringify(stats));
};

/**
 * Update stats after a game ends.
 * @param {'won'|'lost'} result
 * @param {number}       guessCount  How many guesses used (1–6); only used if won
 */
function recordResult(result, guessCount) {
  const stats   = loadStats();
  const today   = getTodayKey();
  stats.played++;

  if (result === 'won') {
    stats.won++;

    // Update distribution (guessCount is 1-based)
    const idx = Math.min(guessCount - 1, 5);
    stats.distribution[idx]++;

    // Streak: if last win was yesterday, continue; else reset to 1
    const yesterday = getYesterdayKey();
    stats.streak = (stats.lastWonDate === yesterday || stats.lastWonDate === today)
      ? stats.streak + 1
      : 1;

    if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;
    stats.lastWonDate = today;

  } else {
    // Loss breaks streak
    stats.streak = 0;
  }

  saveStats(stats);
}

/**
 * Get UTC "yesterday" date key.
 * @returns {string}
 */
function getYesterdayKey() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ──────────────────────────────────────────────────────────
   8. GRID RENDERING
   ────────────────────────────────────────────────────────── */

/**
 * Build the full 6-row guess grid in the DOM.
 * Each row starts empty; rows are filled as guesses are submitted.
 */
function buildGrid() {
  guessGrid.innerHTML = '';

  for (let i = 0; i < MAX_GUESSES; i++) {
    const row = document.createElement('div');
    row.classList.add('guess-row', 'empty');
    row.setAttribute('role', 'listitem');
    row.dataset.row = i;

    // Small color swatch on the left
    const swatch = document.createElement('span');
    swatch.classList.add('row-swatch');

    // Three channel tiles (R, G, B)
    const tileR = makeTile('R');
    const tileG = makeTile('G');
    const tileB = makeTile('B');

    // Hex label on the right
    const hexLabel = document.createElement('span');
    hexLabel.classList.add('row-hex-label');
    hexLabel.textContent = '------';

    row.append(swatch, tileR, tileG, tileB, hexLabel);
    guessGrid.appendChild(row);
  }
}

/**
 * Create a single feedback tile DOM element.
 * @param {string} channelName  'R', 'G', or 'B'
 * @returns {HTMLElement}
 */
function makeTile(channelName) {
  const tile = document.createElement('div');
  tile.classList.add('tile');
  tile.setAttribute('aria-label', `${channelName} channel`);

  const inner = document.createElement('div');
  inner.classList.add('tile-inner');

  const val   = document.createElement('span');
  val.classList.add('tile-val');
  val.textContent = channelName;

  const arrow = document.createElement('span');
  arrow.classList.add('tile-arrow');

  inner.append(val, arrow);
  tile.appendChild(inner);
  return tile;
}

/**
 * Fill in a completed guess row (call after animation).
 * Populates the swatch, tiles, and hex label.
 *
 * @param {number} rowIndex    0-based row index
 * @param {string} guessHex   6-char hex e.g. "FF5733"
 * @param {Array}  feedback   Result from computeFeedback()
 */
function fillRow(rowIndex, guessHex, feedback) {
  const row    = guessGrid.children[rowIndex];
  const swatch = row.querySelector('.row-swatch');
  const tiles  = row.querySelectorAll('.tile');
  const hexLbl = row.querySelector('.row-hex-label');

  row.classList.remove('empty');

  // Color swatch = the guessed color
  swatch.style.background = `#${guessHex}`;

  // Hex label
  hexLbl.textContent = `#${guessHex}`;

  // Tile values and arrows (visual content set after flip — see animateTiles)
  tiles.forEach((tile, i) => {
    const fb = feedback[i];
    const inner = tile.querySelector('.tile-inner');
    inner.querySelector('.tile-val').textContent   = guessHex.slice(i * 2, i * 2 + 2);
    inner.querySelector('.tile-arrow').textContent = fb.arrow;
    tile.setAttribute('aria-label',
      `${fb.channelName}: ${fb.tier}${fb.arrow ? ' ' + fb.arrow : ''}`
    );
  });
}

/**
 * Restore the full grid from saved state (called on page load).
 * Tiles are rendered instantly without animation.
 *
 * @param {GameState} state
 */
function restoreGrid(state) {
  state.guesses.forEach((hex, i) => {
    const feedback = state.feedback[i];
    fillRow(i, hex, feedback);
    // Apply tier classes immediately (no animation on restore)
    const tiles = guessGrid.children[i].querySelectorAll('.tile');
    tiles.forEach((tile, j) => {
      tile.classList.add(`t-${feedback[j].tier}`);
    });
  });
}

/* ──────────────────────────────────────────────────────────
   9. TILE FLIP ANIMATION
   ────────────────────────────────────────────────────────── */

/**
 * Animate the 3 tiles in a row with a staggered flip.
 * The color/tier class is applied at the midpoint of each tile's
 * flip (when the tile is edge-on to the viewer) for the Wordle effect.
 *
 * @param {number} rowIndex   0-based row
 * @param {Array}  feedback   computeFeedback() result for this row
 * @param {string} guessHex   Hex string for the fill step
 * @returns {Promise}         Resolves when all flips complete
 */
function animateTiles(rowIndex, feedback, guessHex) {
  const row   = guessGrid.children[rowIndex];
  const tiles = row.querySelectorAll('.tile');
  const FLIP_DURATION = 380;     // ms per tile (matches CSS --t-flip)
  const STAGGER       = 120;     // ms between tiles

  // First, fill row content (text/swatch) before animation starts
  fillRow(rowIndex, guessHex, feedback);

  return new Promise(resolve => {
    tiles.forEach((tile, i) => {
      const delay = i * STAGGER;

      // Add flip class after stagger delay
      setTimeout(() => {
        tile.classList.add('flip', `flip-${i}`);

        // Apply tier color class at the visual midpoint (half flip duration)
        setTimeout(() => {
          tile.classList.add(`t-${feedback[i].tier}`);
        }, FLIP_DURATION / 2);

      }, delay);
    });

    // Resolve after all tiles have completed their animations
    const totalTime = (tiles.length - 1) * STAGGER + FLIP_DURATION + 60;
    setTimeout(resolve, totalTime);
  });
}

/* ──────────────────────────────────────────────────────────
   10. TOAST NOTIFICATIONS
   ────────────────────────────────────────────────────────── */

let toastTimer = null;

/**
 * Show a temporary toast notification.
 * @param {string}  message   Text to display
 * @param {number}  duration  How long to show in ms (default 2200)
 */
function showToast(message, duration = 2200) {
  if (toastTimer) clearTimeout(toastTimer);

  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  // Force reflow before adding visible class
  void toastEl.offsetWidth;
  toastEl.classList.add('visible');

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('visible');
    setTimeout(() => toastEl.classList.add('hidden'), 320);
  }, duration);
}

/**
 * Show an error message in the feedback area + shake the input.
 * @param {string} message
 */
function showError(message) {
  feedbackMsg.textContent = message;
  feedbackMsg.className   = 'feedback-msg error';

  // Shake animation
  inputWrapper.classList.remove('shake');
  void inputWrapper.offsetWidth;
  inputWrapper.classList.add('shake');
  inputWrapper.addEventListener('animationend', () => {
    inputWrapper.classList.remove('shake');
  }, { once: true });
}

/** Clear the feedback message */
const clearFeedback = () => {
  feedbackMsg.textContent = '';
  feedbackMsg.className   = 'feedback-msg';
};

/* ──────────────────────────────────────────────────────────
   11. GAME LOGIC
   ────────────────────────────────────────────────────────── */

/** Target hex (set on bootstrap) */
let targetHex  = '';

/** Current game state (loaded/saved to localStorage) */
let gameState  = null;

/** Whether input is locked (during animation or game over) */
let inputLocked = false;

/**
 * Submit a guess hex string.
 * Validates → computes feedback → animates → checks win/loss → saves state.
 * @param {string} guessHex   6-char clean hex e.g. "FF5733"
 */
async function submitGuess(guessHex) {
  if (inputLocked) return;

  // Guard: already finished
  if (gameState.status !== 'playing') {
    showToast('Today\'s puzzle is complete!');
    return;
  }

  // Guard: max guesses exceeded
  if (gameState.guesses.length >= MAX_GUESSES) return;

  inputLocked = true;
  clearFeedback();

  // Compute per-channel feedback
  const feedback = computeFeedback(guessHex, targetHex);

  // Persist guess + feedback before animation (safe on reload mid-animation)
  gameState.guesses.push(guessHex);
  gameState.feedback.push(feedback);
  saveState(gameState);

  // Animate the row tiles
  const rowIndex = gameState.guesses.length - 1;
  await animateTiles(rowIndex, feedback, guessHex);

  // ── Check win ─────────────────────────────────────────────
  if (isExactMatch(feedback)) {
    gameState.status = 'won';
    saveState(gameState);

    recordResult('won', gameState.guesses.length);
    revealTarget();
    disableInput();

    const guessWord = gameState.guesses.length === 1 ? 'guess' : 'guesses';
    feedbackMsg.textContent = `🎉 ${gameState.guesses.length} ${guessWord}!`;
    feedbackMsg.className   = 'feedback-msg win';
    showToast(`🎉 Genius! You got it in ${gameState.guesses.length}!`, 3500);
    inputLocked = false;
    return;
  }

  // ── Check loss ────────────────────────────────────────────
  if (gameState.guesses.length >= MAX_GUESSES) {
    gameState.status = 'lost';
    saveState(gameState);

    recordResult('lost', MAX_GUESSES);
    revealTarget();
    disableInput();

    feedbackMsg.textContent = `The color was #${targetHex}`;
    feedbackMsg.className   = 'feedback-msg loss';
    showToast(`Game over! The color was #${targetHex}`, 4000);
    inputLocked = false;
    return;
  }

  // ── Continue — give proximity hint toast ──────────────────
  const exactCount = feedback.filter(f => f.tier === 'exact').length;
  const hotCount   = feedback.filter(f => f.tier === 'hot').length;

  if (exactCount === 3) {
    // Shouldn't happen (caught above) but safety guard
  } else if (exactCount === 2) {
    showToast('So close! One channel off.', 1800);
  } else if (hotCount + exactCount === 3) {
    showToast('Burning hot! Keep going!', 1800);
  }

  inputLocked = false;
  hexInput.value = '';
  hexInput.focus();
}

/**
 * Reveal the target color swatch (called on win or loss).
 */
function revealTarget() {
  swatchReveal.style.background = `#${targetHex}`;
  swatchReveal.classList.add('revealed');
  swatchQuestion.style.opacity = '0';

  // Nice glow shadow on the swatch
  targetSwatchEl.style.boxShadow =
    `0 0 40px rgba(${hexToRGB(targetHex).r},${hexToRGB(targetHex).g},${hexToRGB(targetHex).b},0.4),
     0 4px 24px rgba(0,0,0,0.5)`;

  // Show share button in stats modal
  shareBtn.classList.remove('hidden');
}

/**
 * If the game was already finished on load, restore the reveal state.
 */
function restoreReveal() {
  if (gameState.status === 'won' || gameState.status === 'lost') {
    revealTarget();
    disableInput();

    if (gameState.status === 'won') {
      feedbackMsg.textContent = `🎉 Solved in ${gameState.guesses.length} guesses!`;
      feedbackMsg.className  = 'feedback-msg win';
    } else {
      feedbackMsg.textContent = `The color was #${targetHex}`;
      feedbackMsg.className  = 'feedback-msg loss';
    }
  }
}

/**
 * Disable the input and submit button (game over).
 */
function disableInput() {
  hexInput.disabled  = true;
  submitBtn.disabled = true;
}

/* ──────────────────────────────────────────────────────────
   12. STATS MODAL
   ────────────────────────────────────────────────────────── */

/**
 * Open the stats modal and populate it with current data.
 */
function openStats() {
  const stats = loadStats();

  // Top-line numbers
  statPlayedEl.textContent    = stats.played;
  statWinPctEl.textContent    = stats.played > 0
    ? Math.round((stats.won / stats.played) * 100) : 0;
  statStreakEl.textContent    = stats.streak;
  statMaxStreakEl.textContent = stats.maxStreak;

  // Distribution chart
  buildDistChart(stats);

  // Share button only if game complete today
  if (gameState.status !== 'playing') {
    shareBtn.classList.remove('hidden');
  } else {
    shareBtn.classList.add('hidden');
  }
  shareConfirm.classList.add('hidden');

  modalStats.classList.remove('hidden');
  modalBackdrop.classList.remove('hidden');
}

/**
 * Build (or rebuild) the distribution bar chart inside the stats modal.
 * @param {Stats} stats
 */
function buildDistChart(stats) {
  distChart.innerHTML = '';
  const maxVal = Math.max(...stats.distribution, 1);  // Avoid div by 0
  const currentGuessCount = gameState.guesses.length;
  const wonOnRow = gameState.status === 'won' ? currentGuessCount : -1;

  stats.distribution.forEach((count, i) => {
    const guessNum = i + 1;
    const pct = Math.round((count / maxVal) * 100);
    const isCurrent = wonOnRow === guessNum;

    const row = document.createElement('div');
    row.classList.add('dist-row');

    const label = document.createElement('span');
    label.classList.add('dist-label');
    label.textContent = guessNum;

    const barWrap = document.createElement('div');
    barWrap.classList.add('dist-bar-wrap');

    const bar = document.createElement('div');
    bar.classList.add('dist-bar');
    if (isCurrent) bar.classList.add('is-current');

    // Animate width after a tick to trigger CSS transition
    bar.style.width = '0%';
    bar.textContent = count;

    barWrap.appendChild(bar);
    row.append(label, barWrap);
    distChart.appendChild(row);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = `${Math.max(pct, count > 0 ? 8 : 0)}%`;
      });
    });
  });
}

/** Close the stats modal */
const closeStats = () => {
  modalStats.classList.add('hidden');
  if (modalHelp.classList.contains('hidden')) {
    modalBackdrop.classList.add('hidden');
  }
};

/* ──────────────────────────────────────────────────────────
   12b. SHARE / CLIPBOARD
   ────────────────────────────────────────────────────────── */

/**
 * Build the Wordle-style emoji grid string for sharing.
 * @returns {string}
 */
function buildShareText() {
  const today = getTodayKey();
  const lines = [`🎨 Hex-Guess ${today}`];

  gameState.feedback.forEach(fbRow => {
    const line = fbRow.map(fb => TIER_EMOJI[fb.tier]).join('');
    lines.push(line);
  });

  if (gameState.status === 'won') {
    lines.push(`\n✅ Got it in ${gameState.guesses.length}/${MAX_GUESSES}!`);
  } else {
    lines.push(`\n❌ ${MAX_GUESSES}/${MAX_GUESSES} — The color was #${targetHex}`);
  }

  return lines.join('\n');
}

/** Copy share text to clipboard and show confirmation */
shareBtn.addEventListener('click', () => {
  const text = buildShareText();
  navigator.clipboard.writeText(text)
    .then(() => {
      shareConfirm.classList.remove('hidden');
      setTimeout(() => shareConfirm.classList.add('hidden'), 2500);
    })
    .catch(() => showToast('Could not copy to clipboard', 2000));
});

/* ──────────────────────────────────────────────────────────
   13. HELP MODAL
   ────────────────────────────────────────────────────────── */

const openHelp  = () => {
  modalHelp.classList.remove('hidden');
  modalBackdrop.classList.remove('hidden');
};

const closeHelp = () => {
  modalHelp.classList.add('hidden');
  if (modalStats.classList.contains('hidden')) {
    modalBackdrop.classList.add('hidden');
  }
};

/* ──────────────────────────────────────────────────────────
   14. COUNTDOWN TIMER
   ────────────────────────────────────────────────────────── */

/**
 * Calculate seconds remaining until the next UTC midnight.
 * @returns {number}
 */
function getSecondsUntilMidnight() {
  const now      = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return Math.max(0, Math.floor((midnight - now) / 1000));
}

/**
 * Format seconds as "HH:MM:SS".
 * @param {number} totalSecs
 * @returns {string}
 */
function formatTime(totalSecs) {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

/** Update the countdown display; called every second */
function tickTimer() {
  timerDisplay.textContent = formatTime(getSecondsUntilMidnight());
}

/* ──────────────────────────────────────────────────────────
   15. INPUT HANDLING & VALIDATION
   ────────────────────────────────────────────────────────── */

/** Handle a submission attempt */
function handleSubmit() {
  if (inputLocked) return;
  if (gameState.status !== 'playing') {
    showToast("Today's puzzle is already done!");
    return;
  }

  const raw     = hexInput.value;
  const cleaned = parseHexInput(raw);

  if (!cleaned) {
    showError('Enter a valid 6-digit hex code (e.g. FF5733)');
    return;
  }

  hexInput.value = '';
  submitGuess(cleaned);
}

/** Submit on button click */
submitBtn.addEventListener('click', handleSubmit);

/** Submit on Enter key; auto-uppercase on input */
hexInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
});

/** Auto-uppercase and strip # on input */
hexInput.addEventListener('input', () => {
  let val = hexInput.value.toUpperCase().replace(/[^0-9A-F#]/g, '');
  if (val.startsWith('#')) val = val.slice(1);   // Strip # if pasted with it
  hexInput.value = val.slice(0, 6);              // Enforce maxlength strictly
  clearFeedback();
});

/** Modal buttons */
btnStats.addEventListener('click', openStats);
btnHelp.addEventListener('click',  openHelp);
statsClose.addEventListener('click', closeStats);
helpClose.addEventListener('click',  closeHelp);
modalBackdrop.addEventListener('click', () => {
  closeStats();
  closeHelp();
});

/** Keyboard close for modals */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeStats(); closeHelp(); }
});

/* ──────────────────────────────────────────────────────────
   16. BOOTSTRAP
   ────────────────────────────────────────────────────────── */

(function init() {
  // ── 1. Determine today's color ───────────────────────────
  targetHex = getTodayColor();

  // ── 2. Load (or create) today's game state ───────────────
  gameState = loadState();

  // ── 3. Build the empty guess grid ────────────────────────
  buildGrid();

  // ── 4. Restore any previous guesses from today ───────────
  if (gameState.guesses.length > 0) {
    restoreGrid(gameState);
  }

  // ── 5. Restore finished-game UI (reveal / disable input) ─
  restoreReveal();

  // ── 6. Pre-load stats (used to detect first-ever visit) ──
  const saved = loadStats();

  // ── 7. Start the countdown timer ─────────────────────────
  tickTimer();
  setInterval(tickTimer, 1000);

  // ── 8. Show help modal on very first ever visit ────────────
  const everPlayed = saved.played > 0 || gameState.guesses.length > 0;
  if (!everPlayed) {
    setTimeout(openHelp, 600);
  }

  // ── 9. Focus the input (if game still active) ─────────────
  if (gameState.status === 'playing') {
    hexInput.focus();
  }
})();
