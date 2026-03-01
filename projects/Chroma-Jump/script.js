/**
 * ═══════════════════════════════════════════════════════════
 * Chroma-Jump · script.js
 * ═══════════════════════════════════════════════════════════
 *
 * Color-Switching Endless Runner
 * Match your body color to the platform or fall right through!
 *
 * Architecture:
 *  1.  Constants & Config
 *  2.  DOM Cache
 *  3.  Utility Functions
 *  4.  Color System
 *  5.  Parallax Background
 *  6.  Platform Manager
 *  7.  Particle System
 *  8.  Player Object
 *  9.  AABB Collision Detection
 * 10.  Game State & Loop
 * 11.  Input Handling
 * 12.  Bootstrap
 *
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. CONSTANTS & CONFIG
   ────────────────────────────────────────────────────────── */

/** The three possible colors in the game (order = key binding 1/2/3) */
const COLORS = ['pink', 'cyan', 'yellow'];

/** Neon hex values for each color name */
const COLOR_HEX = {
  pink:   '#ff2d78',
  cyan:   '#00e5ff',
  yellow: '#ffe600',
};

/** Glow rgba strings for canvas shadow effects */
const COLOR_GLOW = {
  pink:   'rgba(255, 45, 120, 0.9)',
  cyan:   'rgba(0, 229, 255, 0.9)',
  yellow: 'rgba(255, 230, 0, 0.9)',
};

/** Player physical constants */
const PLAYER_W   = 32;        // Player width (px)
const PLAYER_H   = 36;        // Player height (px)
const GRAVITY     = 0.52;     // Downward acceleration (px/frame²)
const JUMP_FORCE  = -13.5;    // Y-velocity on jump (negative = up)
const MAX_FALL    = 16;       // Terminal velocity (px/frame)

/** Initial world scroll speed (platform moves left per frame) */
const INITIAL_SPEED = 3.8;

/** Speed increase per 500 score points */
const SPEED_INCREMENT = 0.45;

/** How often to increase speed (score interval) */
const SPEED_INTERVAL = 500;

/** Platform dimensions */
const PLAT_MIN_W = 80;
const PLAT_MAX_W = 220;
const PLAT_H     = 18;

/** Gap between platforms (horizontal space to jump over) */
const GAP_MIN = 120;
const GAP_MAX = 240;

/** Vertical variance: how much platforms can shift up/down from ref */
const PLAT_Y_VARIANCE = 70;

/** Player's fixed screen X position (left side of screen) */
const PLAYER_SCREEN_X = 120;

/** Number of background star layers */
const BG_LAYER_COUNT = 3;

/** Number of particles to burst on color switch */
const PARTICLE_COUNT = 14;

/* ──────────────────────────────────────────────────────────
   2. DOM CACHE
   ────────────────────────────────────────────────────────── */

/** @type {HTMLCanvasElement} */
const canvas   = document.getElementById('game-canvas');

/** @type {CanvasRenderingContext2D} */
const ctx      = canvas.getContext('2d');

const scoreEl  = document.getElementById('score-val');
const bestEl   = document.getElementById('best-val');
const overlay  = document.getElementById('overlay');
const overlayPre   = document.getElementById('overlay-pre');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg   = document.getElementById('overlay-msg');
const overlayBtn   = document.getElementById('overlay-btn');

/** Color indicator dots (keyed by color name) */
const ciDots = {
  pink:   document.getElementById('ci-pink'),
  cyan:   document.getElementById('ci-cyan'),
  yellow: document.getElementById('ci-yellow'),
};

/* ──────────────────────────────────────────────────────────
   3. UTILITY FUNCTIONS
   ────────────────────────────────────────────────────────── */

/**
 * Random integer in [min, max] (inclusive).
 * @param {number} min @param {number} max @returns {number}
 */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Random float in [min, max).
 * @param {number} min @param {number} max @returns {number}
 */
const randF = (min, max) => min + Math.random() * (max - min);

/**
 * Clamp value v between lo and hi.
 * @param {number} v @param {number} lo @param {number} hi @returns {number}
 */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Pick a random element from an array.
 * @template T @param {T[]} arr @returns {T}
 */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Animate the score element with a CSS pop.
 */
function scorePopFX() {
  scoreEl.classList.remove('score-pop');
  void scoreEl.offsetWidth;  // Force reflow to restart animation
  scoreEl.classList.add('score-pop');
}

/* ──────────────────────────────────────────────────────────
   4. COLOR SYSTEM
   ────────────────────────────────────────────────────────── */

/**
 * The player's active color. Changed by keyboard / touch input.
 * @type {'pink'|'cyan'|'yellow'}
 */
let activeColor = 'cyan';

/**
 * Update the active color and sync the HUD indicator dots.
 * Also fires a particle burst for visual feedback.
 * @param {'pink'|'cyan'|'yellow'} newColor
 */
function setColor(newColor) {
  if (newColor === activeColor) return;  // No-op if already active
  activeColor = newColor;

  // Sync all indicator dots
  COLORS.forEach(c => {
    ciDots[c].classList.toggle('active', c === newColor);
  });

  // Emit particles from the player's current position
  spawnParticles(
    PLAYER_SCREEN_X + PLAYER_W / 2,
    player.screenY + PLAYER_H / 2,
    COLOR_HEX[newColor]
  );
}

/**
 * Force-set the initial active color and sync the HUD without particles.
 * Called at the start of each game run.
 * @param {'pink'|'cyan'|'yellow'} color
 */
function initColor(color) {
  activeColor = color;
  COLORS.forEach(c => {
    ciDots[c].classList.toggle('active', c === color);
  });
}

/* ──────────────────────────────────────────────────────────
   5. PARALLAX BACKGROUND
   ────────────────────────────────────────────────────────── */

/**
 * Each background layer is a collection of vertical grid lines
 * or "neon columns" at varying depths (parallax speeds).
 * Layer 0 = farthest/slowest, Layer 2 = nearest/fastest.
 */
const bgLayers = [
  { lines: [], speed: 0.15, gap: 110, alpha: 0.06, color: '#00e5ff' },
  { lines: [], speed: 0.35, gap: 58,  alpha: 0.08, color: '#ff2d78' },
  { lines: [], speed: 0.6,  gap: 32,  alpha: 0.04, color: '#ffe600' },
];

/**
 * Populate each background layer with X-positions covering
 * the entire canvas width + one gap of margin.
 */
function generateBackground() {
  bgLayers.forEach(layer => {
    layer.lines = [];
    for (let x = 0; x <= canvas.width + layer.gap; x += layer.gap) {
      layer.lines.push(x);
    }
  });
}

/**
 * Scroll and draw background layers. Lines that scroll off the
 * left edge are recycled to the right.
 * @param {number} worldSpeed  Current platform scroll speed
 */
function drawBackground(worldSpeed) {
  // Paint solid background first
  ctx.fillStyle = '#0a000f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bgLayers.forEach(layer => {
    // Scroll
    const delta = worldSpeed * layer.speed;
    for (let i = 0; i < layer.lines.length; i++) {
      layer.lines[i] -= delta;
      // Wrap off-screen lines to the right
      if (layer.lines[i] < -layer.gap) {
        layer.lines[i] += canvas.width + layer.gap * 2;
      }
    }

    // Draw
    ctx.save();
    ctx.strokeStyle = layer.color;
    ctx.globalAlpha = layer.alpha;
    ctx.lineWidth   = 1;
    layer.lines.forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    });
    ctx.restore();
  });

  // Horizontal "ground grid" line near the bottom
  ctx.save();
  ctx.strokeStyle = '#00e5ff';
  ctx.globalAlpha = 0.05;
  ctx.lineWidth   = 1;
  for (let y = canvas.height - 60; y < canvas.height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

/* ──────────────────────────────────────────────────────────
   6. PLATFORM MANAGER
   ────────────────────────────────────────────────────────── */

/**
 * Platform data object.
 * @typedef {{ x:number, y:number, w:number, h:number, color:string }} Platform
 */

/** @type {Platform[]} All active platforms in the scene */
let platforms = [];

/**
 * Y-coordinate of the "ground level" for platform spawning.
 * Recalculated based on canvas height.
 * @type {number}
 */
let groundY = 0;

/**
 * The rightmost X edge of the last generated platform.
 * New platforms are placed beyond this point.
 * @type {number}
 */
let lastPlatRightEdge = 0;

/**
 * Current world scroll speed (platforms move left each frame).
 * @type {number}
 */
let worldSpeed = INITIAL_SPEED;

/**
 * Initialize the platform system.
 * Generates a safe starting platform directly under the player
 * and fills the screen ahead.
 */
function initPlatforms() {
  platforms     = [];
  groundY       = Math.floor(canvas.height * 0.62);

  // --- First "safe" starting platform ---
  // Wide, same color as player's initial color, right under spawn point.
  const startPlat = {
    x:     PLAYER_SCREEN_X - 30,
    y:     groundY,
    w:     260,
    h:     PLAT_H,
    color: activeColor,
  };
  platforms.push(startPlat);
  lastPlatRightEdge = startPlat.x + startPlat.w;

  // Fill screen with platforms ahead
  while (lastPlatRightEdge < canvas.width + 400) {
    spawnNextPlatform();
  }
}

/**
 * Spawn one platform just off the right edge of the last platform.
 * Randomizes width, gap, vertical position, and color.
 *
 * Progressive difficulty: as world speed increases, cap the max
 * width downward and push the min gap up so it gets harder.
 */
function spawnNextPlatform() {
  const difficultyT = clamp((worldSpeed - INITIAL_SPEED) / 5, 0, 1);

  const gap   = randInt(GAP_MIN, GAP_MIN + (GAP_MAX - GAP_MIN) * (1 + difficultyT));
  const w     = randInt(
    PLAT_MIN_W,
    Math.round(PLAT_MAX_W - difficultyT * 70)
  );
  const yShift = randInt(-PLAT_Y_VARIANCE, PLAT_Y_VARIANCE);
  const y      = clamp(groundY + yShift, canvas.height * 0.3, canvas.height * 0.75);

  platforms.push({
    x:     lastPlatRightEdge + gap,
    y:     Math.round(y),
    w,
    h:     PLAT_H,
    color: pick(COLORS),
  });

  lastPlatRightEdge += gap + w;
}

/**
 * Scroll platforms left, spawn new ones on the right,
 * and garbage-collect ones that are fully off-screen left.
 */
function updatePlatforms() {
  // Scroll all platforms
  platforms.forEach(p => { p.x -= worldSpeed; });
  lastPlatRightEdge -= worldSpeed;

  // Garbage collect off-screen left
  platforms = platforms.filter(p => p.x + p.w > -50);

  // Spawn more ahead if needed
  while (lastPlatRightEdge < canvas.width + 500) {
    spawnNextPlatform();
  }
}

/**
 * Draw all platforms.
 * Each platform renders as:
 *   - Soft underglow (radial gradient below)
 *   - Solid body with neon fill
 *   - Bright top edge (specular highlight)
 *   - Faint color label letter ("P"/"C"/"Y") for accessibility at a glance
 */
function drawPlatforms() {
  platforms.forEach(p => {
    const hex  = COLOR_HEX[p.color];
    const glow = COLOR_GLOW[p.color];
    const cx   = p.x + p.w / 2;
    const cy   = p.y + p.h / 2;

    // ── Underglow (soft radial below the slab) ───────────────
    const glowGrad = ctx.createRadialGradient(cx, p.y + p.h, 0, cx, p.y + p.h, p.w * 0.8);
    glowGrad.addColorStop(0,   hex.replace('#', 'rgba(') + ',0.35)');  // Quick hack; use glow string instead
    glowGrad.addColorStop(1,   'rgba(0,0,0,0)');

    // Use proper approach with glow string
    ctx.save();
    ctx.shadowColor = hex;
    ctx.shadowBlur  = 22;
    ctx.fillStyle   = hex;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.shadowBlur  = 0;
    ctx.restore();

    // ── Bright top-edge highlight ────────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(p.x, p.y, p.w, 2);

    // ── Dark inner body (glassmorphism effect) ───────────────
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.fillRect(p.x + 1, p.y + 2, p.w - 2, p.h - 3);

    // ── Side stripes (visual rhythm on platform surface) ─────
    ctx.fillStyle = hex;
    ctx.globalAlpha = 0.15;
    const stripeW = 4, stripeGap = 14;
    for (let sx = p.x + stripeGap; sx < p.x + p.w - stripeW; sx += stripeW + stripeGap) {
      ctx.fillRect(sx, p.y + 2, stripeW, p.h - 4);
    }
    ctx.globalAlpha = 1;
  });
}

/* ──────────────────────────────────────────────────────────
   7. PARTICLE SYSTEM
   ────────────────────────────────────────────────────────── */

/**
 * A single particle emitted on color switch.
 * @typedef {{ x:number, y:number, vx:number, vy:number, r:number, life:number, maxLife:number, color:string }} Particle
 */

/** @type {Particle[]} */
let particles = [];

/**
 * Spawn a burst of particles at a screen-space position.
 * @param {number} x        Screen X origin
 * @param {number} y        Screen Y origin
 * @param {string} color    Hex color string
 */
function spawnParticles(x, y, color) {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + randF(-0.3, 0.3);
    const speed = randF(1.5, 5);
    particles.push({
      x, y,
      vx:      Math.cos(angle) * speed,
      vy:      Math.sin(angle) * speed - randF(0, 2),
      r:       randF(2, 5),
      life:    0,
      maxLife: randInt(22, 42),
      color,
    });
  }
}

/**
 * Update and draw all particles. Dead particles are removed.
 */
function updateAndDrawParticles() {
  particles = particles.filter(p => {
    p.x    += p.vx;
    p.y    += p.vy;
    p.vy   += 0.18;      // Slight gravity on particles
    p.vx   *= 0.93;      // Air friction
    p.life++;

    const t = 1 - p.life / p.maxLife;  // 1 = fresh, 0 = dead
    if (t <= 0) return false;           // Remove expired

    ctx.save();
    ctx.globalAlpha = t * 0.9;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 8;
    ctx.fillStyle   = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return true;
  });
}

/* ──────────────────────────────────────────────────────────
   8. PLAYER OBJECT
   ────────────────────────────────────────────────────────── */

/**
 * Player singleton. Position is split:
 *  - screenY: the actual Y pixel on screen (affected by gravity / jump)
 *  - The X position is always PLAYER_SCREEN_X (world scrolls, not player)
 */
const player = {
  screenY:    0,         // Current Y position on screen
  vy:         0,         // Vertical velocity (positive = down)
  isGrounded: false,     // True when standing on a platform this frame
  jumpsLeft:  0,         // 0 = no jumps, 1 = can jump, 2 = double-jump available
  alive:      true,

  /**
   * Reset player to spawn position above the first platform.
   * Called at game start and retry.
   */
  reset() {
    this.screenY    = groundY - PLAYER_H;
    this.vy         = 0;
    this.isGrounded = false;
    this.jumpsLeft  = 2;    // Start with double-jump available
    this.alive      = true;
  },

  /**
   * Attempt a jump. Consumes one jump charge.
   * Allowed if jumpsLeft > 0 (enables double-jump mid-air).
   */
  jump() {
    if (this.jumpsLeft > 0) {
      this.vy        = JUMP_FORCE;
      this.jumpsLeft--;
      this.isGrounded = false;
    }
  },

  /**
   * Apply gravity, update Y position.
   * isGrounded is set/cleared by the AABB collision step.
   */
  updatePhysics() {
    if (!this.isGrounded) {
      this.vy = Math.min(this.vy + GRAVITY, MAX_FALL);
    }
    this.screenY += this.vy;
  },

  /**
   * Draw the player as a glowing rounded square with a
   * color-tinted body and a bright specular streak.
   */
  draw() {
    const x   = PLAYER_SCREEN_X;
    const y   = this.screenY;
    const hex = COLOR_HEX[activeColor];

    // ── Outer glow ────────────────────────────────────────────
    ctx.save();
    ctx.shadowColor = hex;
    ctx.shadowBlur  = 28;
    ctx.fillStyle   = hex;
    roundRect(ctx, x, y, PLAYER_W, PLAYER_H, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // ── Dark core (body) ──────────────────────────────────────
    ctx.fillStyle = '#0a000f';
    roundRect(ctx, x + 2, y + 2, PLAYER_W - 4, PLAYER_H - 4, 4);
    ctx.fill();

    // ── Inner glow fill ───────────────────────────────────────
    const innerGrad = ctx.createLinearGradient(x, y, x + PLAYER_W, y + PLAYER_H);
    innerGrad.addColorStop(0, hex + 'dd');   // Hex with alpha string note:
    innerGrad.addColorStop(1, hex + '55');   // Canvas doesn't parse this; use rgba below
    ctx.fillStyle = hexAlpha(hex, 0.65);
    roundRect(ctx, x + 3, y + 3, PLAYER_W - 6, PLAYER_H - 6, 3);
    ctx.fill();

    // ── Specular streak ───────────────────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    roundRect(ctx, x + 5, y + 5, PLAYER_W - 18, 5, 2);
    ctx.fill();

    // ── Active-color letter badge (accessibility) ─────────────
    ctx.fillStyle   = 'rgba(255,255,255,0.85)';
    ctx.font        = 'bold 12px "Space Grotesk", sans-serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      activeColor[0].toUpperCase(),
      x + PLAYER_W / 2,
      y + PLAYER_H / 2
    );
  },
};

/**
 * Helper: convert a hex color + alpha float to rgba() string.
 * e.g. hexAlpha('#ff2d78', 0.6) → 'rgba(255,45,120,0.6)'
 * @param {string} hex    6-digit hex starting with #
 * @param {number} alpha  0..1
 * @returns {string}
 */
function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Draw a rounded rectangle path.
 * @param {CanvasRenderingContext2D} c
 * @param {number} x @param {number} y @param {number} w @param {number} h
 * @param {number} r  Corner radius
 */
function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y,     x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h,     x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y,         x + r, y);
  c.closePath();
}

/* ──────────────────────────────────────────────────────────
   9. AABB COLLISION DETECTION
   ────────────────────────────────────────────────────────── */

/**
 * Axis-Aligned Bounding Box collision resolution.
 *
 * The player's AABB:
 *   left   = PLAYER_SCREEN_X
 *   right  = PLAYER_SCREEN_X + PLAYER_W
 *   top    = player.screenY
 *   bottom = player.screenY + PLAYER_H
 *
 * Platform AABB:
 *   left   = p.x
 *   right  = p.x + p.w
 *   top    = p.y
 *   bottom = p.y + p.h
 *
 * KEY RULE: A platform is only SOLID if its color matches
 * the player's activeColor. Mismatched platforms are skipped
 * entirely — the player phases through them.
 *
 * Collision is only resolved on the TOP face (landing on top),
 * side/bottom collisions are ignored to keep gameplay clean.
 */
function resolveCollisions() {
  player.isGrounded = false;

  const pLeft   = PLAYER_SCREEN_X;
  const pRight  = PLAYER_SCREEN_X + PLAYER_W;
  const pTop    = player.screenY;
  const pBottom = player.screenY + PLAYER_H;

  platforms.forEach(plat => {
    // ── Color gate: skip platforms that don't match player color ──
    if (plat.color !== activeColor) return;

    const platLeft   = plat.x;
    const platRight  = plat.x + plat.w;
    const platTop    = plat.y;
    const platBottom = plat.y + plat.h;

    // ── Broad-phase AABB overlap check ──────────────────────────
    const overlapX = pRight > platLeft && pLeft < platRight;
    const overlapY = pBottom > platTop && pTop < platBottom;

    if (!overlapX || !overlapY) return;  // No intersection — skip

    // ── Narrow-phase: only resolve top-face landing ──────────────
    // Player must be moving downward AND was above the platform top last frame
    const prevBottom = pBottom - player.vy;   // Bottom position one frame ago
    const landingFromAbove = player.vy >= 0 && prevBottom <= platTop + 4;

    if (landingFromAbove) {
      // Snap player top of feet to top of platform
      player.screenY  = platTop - PLAYER_H;
      player.vy       = 0;
      player.isGrounded = true;
      player.jumpsLeft  = 2;    // Replenish double-jump on landing
    }
  });
}

/* ──────────────────────────────────────────────────────────
   10. GAME STATE & LOOP
   ────────────────────────────────────────────────────────── */

/**
 * State machine:
 *  'IDLE'    → start screen visible
 *  'PLAYING' → game loop active
 *  'DEAD'    → game over, overlay visible
 */
let gameState = 'IDLE';

/** Numeric score (distance-based, incremented each frame) */
let score    = 0;

/** High score (localStorage-persisted) */
let highScore = parseInt(localStorage.getItem('chromaJumpBest') || '0', 10);

/** rAF handle */
let rafId = null;

/** Frame counter for periodic speed increases */
let frameCount = 0;

/**
 * Initialize and begin a new game run.
 */
function startGame() {
  score      = 0;
  frameCount = 0;
  worldSpeed = INITIAL_SPEED;
  particles  = [];

  scoreEl.textContent = '0';
  bestEl.textContent  = highScore;

  initColor('cyan');
  initPlatforms();
  generateBackground();
  player.reset();

  gameState = 'PLAYING';
  overlay.classList.add('hidden');

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(gameLoop);
}

/**
 * Trigger game over — freeze updates, show overlay after a beat.
 */
function triggerDeath() {
  if (gameState === 'DEAD') return;
  gameState = 'DEAD';

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('chromaJumpBest', highScore);
  }

  setTimeout(() => {
    overlayPre.textContent   = `SCORE: ${score}  |  BEST: ${highScore}`;
    overlayTitle.innerHTML   = 'GAME<br>OVER';
    overlayMsg.textContent   = 'Wrong color — you fell right through!';
    overlayBtn.textContent   = 'RETRY';
    overlay.classList.remove('hidden');
  }, 480);
}

/**
 * Update the score each frame by +1 (distance = score).
 * Every SPEED_INTERVAL points, ramp up world speed.
 */
function updateScore() {
  score++;
  scoreEl.textContent = score;

  // Milestone pop every 100
  if (score % 100 === 0) {
    scorePopFX();
    bestEl.textContent = Math.max(score, highScore);
  }

  // Speed ramp every SPEED_INTERVAL
  const newLevel = Math.floor(score / SPEED_INTERVAL);
  const newSpeed = INITIAL_SPEED + newLevel * SPEED_INCREMENT;
  if (newSpeed !== worldSpeed) {
    worldSpeed = newSpeed;
  }
}

/**
 * Draw a "SPEED UP!" flash text when a speed milestone is crossed.
 * Tracked by comparing previous vs current speed.
 */
let speedFlash = { active: false, life: 0 };
function checkSpeedFlash() {
  if (score > 0 && score % SPEED_INTERVAL === 0) {
    speedFlash = { active: true, life: 60 };
  }
}

function drawSpeedFlash() {
  if (!speedFlash.active) return;
  speedFlash.life--;
  if (speedFlash.life <= 0) { speedFlash.active = false; return; }

  const t = speedFlash.life / 60;
  ctx.save();
  ctx.globalAlpha     = t;
  ctx.font            = `bold ${Math.round(20 + (1 - t) * 10)}px "Press Start 2P", monospace`;
  ctx.fillStyle       = '#ffe600';
  ctx.shadowColor     = '#ffe600';
  ctx.shadowBlur      = 20;
  ctx.textAlign       = 'center';
  ctx.textBaseline    = 'top';
  ctx.fillText('FASTER!', canvas.width / 2, 80);
  ctx.restore();
}

/**
 * The core game loop. Runs every animation frame.
 *
 * Frame order:
 *  1. Background + parallax
 *  2. Platform update + draw
 *  3. Player physics
 *  4. AABB collision
 *  5. Death check (fell below screen)
 *  6. Draw player
 *  7. Particles
 *  8. Score + speed flash
 *  9. rAF schedule
 */
function gameLoop() {
  frameCount++;

  // ── 1. Background ─────────────────────────────────────────
  drawBackground(gameState === 'PLAYING' ? worldSpeed : 0);

  if (gameState === 'PLAYING') {
    // ── 2. Platforms ────────────────────────────────────────
    updatePlatforms();
    drawPlatforms();

    // ── 3. Player physics ────────────────────────────────────
    player.updatePhysics();

    // ── 4. AABB Collision ────────────────────────────────────
    resolveCollisions();

    // ── 5. Death check: fell off the bottom ──────────────────
    if (player.screenY > canvas.height + 60) {
      triggerDeath();
    }

    // ── 6. Draw player ───────────────────────────────────────
    player.draw();

    // ── 7. Particles ─────────────────────────────────────────
    updateAndDrawParticles();

    // ── 8. Score / speed ─────────────────────────────────────
    checkSpeedFlash();
    drawSpeedFlash();
    if (gameState === 'PLAYING') updateScore();
  }

  // ── 9. Schedule next frame ────────────────────────────────
  rafId = requestAnimationFrame(gameLoop);
}

/**
 * Resize canvas to fill the window.
 */
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  groundY = Math.floor(canvas.height * 0.62);
}

/* ──────────────────────────────────────────────────────────
   11. INPUT HANDLING
   ────────────────────────────────────────────────────────── */

document.addEventListener('keydown', (e) => {
  if (gameState !== 'PLAYING') return;

  switch (e.code) {
    // Jump
    case 'Space':
    case 'ArrowUp':
      e.preventDefault();
      player.jump();
      break;

    // Color switch — 1 / Q → pink
    case 'Digit1':
    case 'KeyQ':
      setColor('pink');
      break;

    // Color switch — 2 / W → cyan
    case 'Digit2':
    case 'KeyW':
      setColor('cyan');
      break;

    // Color switch — 3 / E → yellow
    case 'Digit3':
    case 'KeyE':
      setColor('yellow');
      break;
  }
});

/** Overlay start/retry button */
overlayBtn.addEventListener('click', startGame);

/** Mobile: jump tap zone */
document.getElementById('touch-jump').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (gameState === 'PLAYING') player.jump();
});

/** Mobile: color buttons */
document.querySelectorAll('.touch-color-btn').forEach(btn => {
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (gameState === 'PLAYING') {
      setColor(btn.dataset.color);
    }
  });
});

/** Window resize */
window.addEventListener('resize', () => {
  resizeCanvas();
  generateBackground();
  // Re-anchor ground level for active platforms if playing
  if (gameState === 'PLAYING') {
    groundY = Math.floor(canvas.height * 0.62);
  }
});

/* ──────────────────────────────────────────────────────────
   12. BOOTSTRAP
   ────────────────────────────────────────────────────────── */

// Size canvas
resizeCanvas();

// Populate background for idle
generateBackground();

// Seed best score from localStorage
bestEl.textContent = highScore;

// Boot into IDLE with animated background loop
gameState = 'IDLE';

(function idleLoop() {
  drawBackground(1.2);
  if (gameState === 'IDLE') requestAnimationFrame(idleLoop);
}());

// Show start overlay
overlayPre.textContent   = '';
overlayTitle.innerHTML   = 'CHROMA<br>JUMP';
overlayMsg.innerHTML     =
  'Match your color to the platform.<br>Wrong color &mdash; you fall through!';
overlayBtn.textContent   = 'START';
overlay.classList.remove('hidden');
