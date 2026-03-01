/**
 * ═══════════════════════════════════════════════════════════
 * Orbit-Dash · script.js
 * ═══════════════════════════════════════════════════════════
 *
 * One-button physics arcade game.
 * The ship orbits a planet. Press SPACE to break orbit and dash
 * in the tangential direction. Reach the next planet to score.
 *
 * Architecture:
 *  1. Constants & Config
 *  2. DOM Cache
 *  3. Utility Functions
 *  4. Star Field
 *  5. Planet Class
 *  6. Ship Object
 *  7. Trail System
 *  8. Camera System
 *  9. Game State & Loop
 * 10. Input Handling
 * 11. Bootstrap
 *
 * ═══════════════════════════════════════════════════════════
 */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. CONSTANTS & CONFIG
   ────────────────────────────────────────────────────────── */

/** Angular velocity of orbit (radians per frame, ~60 FPS) */
const ORBIT_SPEED = 0.026;

/** Linear speed of the ship while dashing (px/frame) */
const DASH_SPEED = 5.8;

/** Extra capture radius beyond orbit ring; forgiveness zone */
const CAPTURE_BUFFER = 32;

/** Distance between planet surface and its orbit ring (px) */
const ORBIT_RING_GAP = 50;

/** Number of trail positions stored for rendering */
const TRAIL_MAX = 55;

/** Minimum world-distance between consecutive planets */
const PLANET_MIN_DIST = 230;

/** Maximum world-distance between consecutive planets */
const PLANET_MAX_DIST = 370;

/** Min / Max planet visual radius */
const PLANET_MIN_R = 16;
const PLANET_MAX_R = 30;

/** Planets to keep pre-generated ahead of the active planet */
const LOOKAHEAD = 5;

/** Camera lerp factor — lower = smoother but laggier */
const CAM_LERP = 0.06;

/** Max dash distance before "missed" → game over (px) */
const MAX_DASH_DIST = 520;

/** Number of background stars */
const STAR_COUNT = 200;

/**
 * Neon planet color palette.
 * Each entry: { core, glow, ring }
 */
const PALETTE = [
  { core: '#00e5ff', glow: 'rgba(0,229,255,',   ring: 'rgba(0,229,255,'   },
  { core: '#ff00ff', glow: 'rgba(255,0,255,',   ring: 'rgba(255,0,255,'   },
  { core: '#39ff14', glow: 'rgba(57,255,20,',   ring: 'rgba(57,255,20,'   },
  { core: '#ff6600', glow: 'rgba(255,102,0,',   ring: 'rgba(255,102,0,'   },
  { core: '#bf5fff', glow: 'rgba(191,95,255,',  ring: 'rgba(191,95,255,'  },
  { core: '#ffdd00', glow: 'rgba(255,221,0,',   ring: 'rgba(255,221,0,'   },
  { core: '#ff3366', glow: 'rgba(255,51,102,',  ring: 'rgba(255,51,102,'  },
];

/* ──────────────────────────────────────────────────────────
   2. DOM CACHE
   ────────────────────────────────────────────────────────── */

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

const scoreEl      = document.getElementById('score-value');
const bestEl       = document.getElementById('best-value');
const overlay      = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg   = document.getElementById('overlay-msg');
const overlayBtn   = document.getElementById('overlay-btn');
const hud          = document.getElementById('hud');

/* ──────────────────────────────────────────────────────────
   3. UTILITY FUNCTIONS
   ────────────────────────────────────────────────────────── */

/**
 * Euclidean distance between two world-space points.
 * @param {number} x1 @param {number} y1
 * @param {number} x2 @param {number} y2
 * @returns {number}
 */
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

/**
 * Linear interpolation between a and b by factor t.
 * @param {number} a  @param {number} b  @param {number} t  [0..1]
 * @returns {number}
 */
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Random float in [min, max).
 * @param {number} min @param {number} max @returns {number}
 */
const randF = (min, max) => min + Math.random() * (max - min);

/**
 * Convert world coordinates to screen coordinates using the
 * current camera offset.
 * @param {number} wx  @param {number} wy
 * @returns {{ x: number, y: number }}
 */
const toScreen = (wx, wy) => ({ x: wx + cam.x, y: wy + cam.y });

/**
 * Trigger the CSS scorePop animation on the score element.
 */
function animateScorePop() {
  scoreEl.classList.remove('score-pop');
  // Force reflow to restart animation
  void scoreEl.offsetWidth;
  scoreEl.classList.add('score-pop');
}

/* ──────────────────────────────────────────────────────────
   4. STAR FIELD
   ────────────────────────────────────────────────────────── */

/** @type {{ x:number, y:number, r:number, a:number, p:number }[]} */
let stars = [];

/**
 * Populate the star field with randomly placed stars.
 * Stars store a parallax factor so distant stars scroll slower
 * (creating a sense of depth).
 */
function generateStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: randF(0, 2000),          // Base world position (large area)
      y: randF(0, 2000),
      r: randF(0.4, 2.2),         // Radius
      a: randF(0.2, 0.95),        // Alpha
      p: randF(0.04, 0.18),       // Parallax factor (0 = fixed, 1 = full camera)
    });
  }
}

/**
 * Draw stars. Each star's screen position is computed with
 * a partial parallax offset and then wrapped to canvas bounds.
 */
function drawStars() {
  stars.forEach(s => {
    // Parallax: closer stars move more with the camera
    const sx = s.x + cam.x * s.p;
    const sy = s.y + cam.y * s.p;

    // Tile / wrap so stars fill the screen on any scroll direction
    const wx = ((sx % canvas.width)  + canvas.width)  % canvas.width;
    const wy = ((sy % canvas.height) + canvas.height) % canvas.height;

    ctx.beginPath();
    ctx.arc(wx, wy, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fill();
  });
}

/* ──────────────────────────────────────────────────────────
   5. PLANET CLASS
   ────────────────────────────────────────────────────────── */

class Planet {
  /**
   * @param {number} x            World x-coordinate
   * @param {number} y            World y-coordinate
   * @param {number} radius       Visual radius (px)
   * @param {number} colorIndex   Index into PALETTE array
   */
  constructor(x, y, radius, colorIndex) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    /** Distance from planet center at which the ship orbits */
    this.orbitRadius = radius + ORBIT_RING_GAP;

    /**
     * Capture zone: if the dashing ship enters this radius,
     * it gets pulled into orbit — includes a forgiveness buffer
     * for better game-feel.
     */
    this.captureRadius = this.orbitRadius + CAPTURE_BUFFER;

    /** Assign color theme from palette (wraps around) */
    this.color = PALETTE[colorIndex % PALETTE.length];

    /** Random phase so each planet's glow pulses independently */
    this.pulseOffset = randF(0, Math.PI * 2);
  }

  /**
   * Draw this planet: outer glow → dashed orbit ring → body.
   * @param {number} frame  Current frame counter for pulse animation
   */
  draw(frame) {
    const { x, y } = toScreen(this.x, this.y);

    // Smooth pulsing factor in [0.6, 1.0]
    const pulse = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(frame * 0.04 + this.pulseOffset));

    // ── Outer atmospheric glow (large radial gradient) ──────
    const glowR = this.radius * 3.2;
    const glowGrad = ctx.createRadialGradient(x, y, this.radius * 0.5, x, y, glowR);
    glowGrad.addColorStop(0, `${this.color.glow}${(0.55 * pulse).toFixed(2)})`);
    glowGrad.addColorStop(1, `${this.color.glow}0)`);

    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // ── Dashed orbit ring ────────────────────────────────────
    ctx.save();
    ctx.setLineDash([6, 12]);
    ctx.beginPath();
    ctx.arc(x, y, this.orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `${this.color.ring}${(0.4 * pulse).toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();                  // Restores setLineDash

    // ── Planet body: radial gradient for 3-D sphere look ────
    const bodyGrad = ctx.createRadialGradient(
      x - this.radius * 0.28, y - this.radius * 0.28, this.radius * 0.05,
      x,                       y,                       this.radius
    );
    bodyGrad.addColorStop(0,   'rgba(255,255,255,0.9)'); // specular highlight
    bodyGrad.addColorStop(0.25, this.color.core);
    bodyGrad.addColorStop(0.75, this.color.core.replace(/[^,]+(?=\))/, '0.7'));
    bodyGrad.addColorStop(1,   '#000000');

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // ── Rim glow stroke ─────────────────────────────────────
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = this.color.core;
    ctx.lineWidth   = 2;
    ctx.shadowColor = this.color.core;
    ctx.shadowBlur  = 14 * pulse;
    ctx.stroke();
    ctx.shadowBlur  = 0;
  }
}

/* ──────────────────────────────────────────────────────────
   5b. PLANET GENERATION
   ────────────────────────────────────────────────────────── */

/** @type {Planet[]} Active planets in world space */
let planets = [];

/**
 * Append one new planet to the end of the planet chain.
 * Position is chosen randomly relative to the previous planet
 * so the player can potentially reach it from any tangent angle.
 */
function addNextPlanet() {
  // Anchor: last planet's position, or world origin for the first
  const last = planets.length > 0
    ? planets[planets.length - 1]
    : { x: 0, y: 0 };

  // Fully random direction keeps the game surprising
  const angle  = randF(0, Math.PI * 2);
  const d      = randF(PLANET_MIN_DIST, PLANET_MAX_DIST);
  const radius = Math.round(randF(PLANET_MIN_R, PLANET_MAX_R));

  planets.push(new Planet(
    last.x + Math.cos(angle) * d,
    last.y + Math.sin(angle) * d,
    radius,
    planets.length         // colorIndex wraps through palette
  ));
}

/**
 * Ensure at least LOOKAHEAD planets exist beyond the current active
 * planet (planets[0]).
 */
function refillPlanets() {
  while (planets.length < LOOKAHEAD) {
    addNextPlanet();
  }
}

/* ──────────────────────────────────────────────────────────
   6. SHIP
   ────────────────────────────────────────────────────────── */

/**
 * The ship is a singleton object (not a class) since there is
 * only ever one ship. All properties are reset via ship.init().
 */
const ship = {
  /** World-space position */
  x: 0,
  y: 0,

  /** Current orbit angle around the active planet (radians) */
  angle: 0,

  /** Linear velocity components used during DASHING state */
  vx: 0,
  vy: 0,

  /** Reference to the planet currently being orbited */
  orbitPlanet: null,

  /** Ship triangle half-size (px) */
  size: 9,

  /**
   * Snap the ship onto the orbit ring of a planet and begin
   * orbiting it at angle 0 (rightmost point).
   * @param {Planet} planet
   */
  attachTo(planet) {
    this.orbitPlanet = planet;
    this.angle       = 0;
    // Place ship at the 3 o'clock position of the orbit ring
    this.x  = planet.x + planet.orbitRadius;
    this.y  = planet.y;
    this.vx = 0;
    this.vy = 0;
  },

  /**
   * Break orbit: compute the instantaneous tangential velocity
   * from the current orbital angle and transition to DASHING.
   *
   * For counter-clockwise orbital motion:
   *   ship.x = cx + cos(θ) * R
   *   ship.y = cy + sin(θ) * R
   * ∴ tangent direction = (d/dθ)(cos θ, sin θ) = (-sin θ, cos θ)
   */
  dash() {
    this.vx = -Math.sin(this.angle) * DASH_SPEED;
    this.vy =  Math.cos(this.angle) * DASH_SPEED;
    this.orbitPlanet = null;
  },

  /**
   * Advance orbit angle and recompute ship position from trig.
   * Called every frame while state === 'ORBITING'.
   */
  updateOrbit() {
    this.angle += ORBIT_SPEED;
    this.x = this.orbitPlanet.x + Math.cos(this.angle) * this.orbitPlanet.orbitRadius;
    this.y = this.orbitPlanet.y + Math.sin(this.angle) * this.orbitPlanet.orbitRadius;
  },

  /**
   * Advance position by velocity.
   * Called every frame while state === 'DASHING'.
   */
  updateDash() {
    this.x += this.vx;
    this.y += this.vy;
  },

  /**
   * Draw the ship as a pointed triangle, rotated to face the
   * direction of travel (tangent when orbiting, velocity when dashing).
   * Includes engine glow and cyan outline for the cyberpunk aesthetic.
   * @param {string} gameState  Current game state string
   */
  draw(gameState) {
    const { x, y } = toScreen(this.x, this.y);

    // Heading: tangent direction when orbiting, velocity dir when dashing
    const heading = (gameState === 'ORBITING')
      ? this.angle + Math.PI / 2          // perpendicular to radius = tangent
      : Math.atan2(this.vy, this.vx);     // direction of linear velocity

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading);

    // ── Engine glow behind the ship (opposite to heading) ──
    const engineGrad = ctx.createRadialGradient(0, 8, 0, 0, 8, 18);
    engineGrad.addColorStop(0, 'rgba(0,229,255,0.85)');
    engineGrad.addColorStop(1, 'rgba(0,229,255,0)');
    ctx.beginPath();
    ctx.arc(0, 8, 18, 0, Math.PI * 2);
    ctx.fillStyle = engineGrad;
    ctx.fill();

    // ── Ship body: isosceles triangle, tip pointing up ──────
    const s = this.size;
    ctx.beginPath();
    ctx.moveTo(0,         -s);          // Tip / nose
    ctx.lineTo(-s * 0.65,  s * 0.85);  // Bottom-left wing
    ctx.lineTo( s * 0.65,  s * 0.85);  // Bottom-right wing
    ctx.closePath();

    ctx.fillStyle   = '#ffffff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur  = 18;
    ctx.fill();

    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    ctx.restore();
  },
};

/* ──────────────────────────────────────────────────────────
   7. TRAIL SYSTEM
   ────────────────────────────────────────────────────────── */

/**
 * Trail: array of world-space {x, y} positions from recent frames.
 * Rendered as a gradient polyline from transparent → bright cyan.
 * @type {{ x:number, y:number }[]}
 */
let trail = [];

/**
 * Append the current ship position to the trail buffer,
 * capping at TRAIL_MAX entries.
 */
function updateTrail() {
  trail.push({ x: ship.x, y: ship.y });
  if (trail.length > TRAIL_MAX) trail.shift();
}

/**
 * Render the trail as a fading line.
 * Opacity and line width both increase toward the head (newest point).
 */
function drawTrail() {
  if (trail.length < 2) return;

  for (let i = 1; i < trail.length; i++) {
    const t = i / trail.length;           // 0 = tail, 1 = head
    const { x: x1, y: y1 } = toScreen(trail[i - 1].x, trail[i - 1].y);
    const { x: x2, y: y2 } = toScreen(trail[i].x,     trail[i].y);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(0,229,255,${(t * 0.65).toFixed(2)})`;
    ctx.lineWidth   = t * 3;
    ctx.stroke();
  }
}

/* ──────────────────────────────────────────────────────────
   8. CAMERA SYSTEM
   ────────────────────────────────────────────────────────── */

/**
 * Camera object. `x` and `y` are the current offsets applied to
 * every world-space coordinate before drawing (toScreen).
 *
 * The camera target is:
 *  - Orbit center (planet position) when orbiting → stable framing
 *  - Ship position when dashing → dynamic follow
 */
const cam = { x: 0, y: 0 };

/**
 * Smoothly interpolate camera toward the current target.
 * Using lerp prevents jarring snaps between states.
 * @param {string} gameState
 */
function updateCamera(gameState) {
  let targetWorldX, targetWorldY;

  if (gameState === 'ORBITING' && ship.orbitPlanet) {
    // Center the camera on the orbit planet for a stable view
    targetWorldX = ship.orbitPlanet.x;
    targetWorldY = ship.orbitPlanet.y;
  } else {
    // Follow the ship directly during dash
    targetWorldX = ship.x;
    targetWorldY = ship.y;
  }

  // Camera offset = center of screen − target world position
  const targetCamX = canvas.width  / 2 - targetWorldX;
  const targetCamY = canvas.height / 2 - targetWorldY;

  cam.x = lerp(cam.x, targetCamX, CAM_LERP);
  cam.y = lerp(cam.y, targetCamY, CAM_LERP);
}

/* ──────────────────────────────────────────────────────────
   9. GAME STATE & LOOP
   ────────────────────────────────────────────────────────── */

/**
 * Game state machine:
 *  'IDLE'     → ambient background loop, overlay visible
 *  'ORBITING' → ship locked to orbit, waiting for input
 *  'DASHING'  → ship moving linearly, checking for capture
 *  'DEAD'     → freeze update, show game-over overlay
 */
let gameState = 'IDLE';

/** Current player score (planet captures) */
let score = 0;

/**
 * High score — persisted to localStorage so it survives refresh.
 */
let highScore = parseInt(localStorage.getItem('orbitDashBest') || '0', 10);

/** requestAnimationFrame handle; stored so it can be cancelled */
let rafId = null;

/** Current frame counter (for pulse animations) */
let frame = 0;

/**
 * Cumulative distance traveled since the last dash began.
 * Used to detect "missed all planets" → game over.
 */
let dashDist = 0;

/**
 * Initialize / reset all game data and begin the main loop.
 * Called both on first launch and on retry.
 */
function startGame() {
  // ── Reset counters ────────────────────────────────────────
  score    = 0;
  dashDist = 0;
  frame    = 0;
  trail    = [];

  // Update HUD immediately
  scoreEl.textContent = '0';
  bestEl.textContent  = highScore;

  // ── Build planet chain ────────────────────────────────────
  planets = [];
  refillPlanets();

  // ── Attach ship to first planet ───────────────────────────
  ship.attachTo(planets[0]);

  // ── Center camera on first planet ────────────────────────
  cam.x = canvas.width  / 2 - planets[0].x;
  cam.y = canvas.height / 2 - planets[0].y;

  // ── Transition to ORBITING ────────────────────────────────
  gameState = 'ORBITING';
  overlay.classList.add('hidden');

  // Cancel any previous loop before starting a new one
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(gameLoop);
}

/**
 * Handle a successful planet capture:
 * update score, prune old planets, generate new ones.
 * @param {Planet} capturedPlanet  The planet the ship just entered
 */
function onCapture(capturedPlanet) {
  // Orbit the newly captured planet
  ship.attachTo(capturedPlanet);

  // ── Score update ──────────────────────────────────────────
  score++;
  scoreEl.textContent = score;
  animateScorePop();

  if (score > highScore) {
    highScore = score;
    bestEl.textContent = highScore;
    localStorage.setItem('orbitDashBest', highScore);
  }

  // ── Prune planets that are now behind the active one ──────
  // Remove all planets before the captured one so memory stays bounded
  const idx = planets.indexOf(capturedPlanet);
  if (idx > 0) {
    planets.splice(0, idx);
  }

  // ── Generate more planets ahead ───────────────────────────
  refillPlanets();

  // ── Reset dash distance counter ───────────────────────────
  dashDist  = 0;
  gameState = 'ORBITING';
}

/**
 * Trigger the death / game-over sequence.
 * Waits briefly before showing the overlay (gives a beat of drama).
 */
function triggerDeath() {
  if (gameState === 'DEAD') return;   // Guard against double-trigger
  gameState = 'DEAD';

  setTimeout(() => {
    overlayTitle.textContent = '💥 ORBIT LOST';
    overlayMsg.innerHTML     =
      `Score: <strong>${score}</strong>&nbsp;&nbsp;|&nbsp;&nbsp;` +
      `Best: <strong>${highScore}</strong>`;
    overlayBtn.textContent   = 'RETRY';
    overlay.classList.remove('hidden');
  }, 550);
}

/**
 * Resize the canvas to fill the window. Called on load and resize.
 */
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

/**
 * Core game loop — runs every animation frame via rAF.
 *
 * Order per frame:
 *  1. Clear
 *  2. Draw background + stars
 *  3. Update camera
 *  4. Update ship physics (if active)
 *  5. Check capture / game-over
 *  6. Update trail
 *  7. Draw planets
 *  8. Draw trail
 *  9. Draw ship
 * 10. Schedule next frame
 */
function gameLoop() {
  frame++;

  // ── 1. Clear ──────────────────────────────────────────────
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ── 2. Background ─────────────────────────────────────────
  ctx.fillStyle = '#070014';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();

  // ── 3. Camera ──────────────────────────────────────────────
  updateCamera(gameState);

  // ── 4 & 5. Physics + Capture / Death check ───────────────
  if (gameState === 'ORBITING') {
    ship.updateOrbit();

  } else if (gameState === 'DASHING') {
    ship.updateDash();
    dashDist += DASH_SPEED;

    // Scan all planets after the first (ship came from planets[0])
    let captured = false;
    for (let i = 1; i < planets.length; i++) {
      const p = planets[i];
      if (dist(ship.x, ship.y, p.x, p.y) < p.captureRadius) {
        onCapture(p);
        captured = true;
        break;
      }
    }

    // Game over if ship traveled too far without being captured
    if (!captured && dashDist > MAX_DASH_DIST) {
      triggerDeath();
    }
  }

  // ── 6. Trail ──────────────────────────────────────────────
  if (gameState === 'ORBITING' || gameState === 'DASHING') {
    updateTrail();
  }

  // ── 7. Planets ────────────────────────────────────────────
  planets.forEach(p => p.draw(frame));

  // ── 8. Trail ──────────────────────────────────────────────
  drawTrail();

  // ── 9. Ship ───────────────────────────────────────────────
  if (gameState !== 'IDLE' && gameState !== 'DEAD') {
    ship.draw(gameState);
  }

  // ── 10. Next frame ────────────────────────────────────────
  rafId = requestAnimationFrame(gameLoop);
}

/* ──────────────────────────────────────────────────────────
   10. INPUT HANDLING
   ────────────────────────────────────────────────────────── */

/**
 * Central action handler — dispatches based on current game state.
 * Triggered by both keyboard and pointer events.
 */
function handleAction() {
  if (gameState === 'ORBITING') {
    // Break orbit and begin dashing
    ship.dash();
    dashDist  = 0;
    gameState = 'DASHING';
  }
  // IDLE / DEAD / DASHING states don't respond to mid-game input
  // (button click handles DEAD → retry via overlayBtn listener)
}

/** Spacebar — primary desktop control */
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.key === ' ') {
    e.preventDefault();     // Prevent page scroll
    handleAction();
  }
});

/** Tap / click on the canvas — mobile + desktop alternate control */
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  handleAction();
});

/** Overlay "LAUNCH" / "RETRY" button */
overlayBtn.addEventListener('click', () => {
  startGame();
});

/** Keep canvas full-screen on window resize */
window.addEventListener('resize', () => {
  resizeCanvas();
  // Re-center camera immediately after resize to avoid pop
  if (gameState === 'ORBITING' && ship.orbitPlanet) {
    cam.x = canvas.width  / 2 - ship.orbitPlanet.x;
    cam.y = canvas.height / 2 - ship.orbitPlanet.y;
  }
});

/* ──────────────────────────────────────────────────────────
   11. BOOTSTRAP
   ────────────────────────────────────────────────────────── */

// Size canvas to window
resizeCanvas();

// Populate star field once
generateStars();

// Seed the high score display from localStorage
bestEl.textContent = highScore;

// Show start overlay
overlayTitle.textContent = '🪐 ORBIT-DASH';
overlayMsg.innerHTML =
  'Time your break from orbit perfectly<br>to reach the next planet!';
overlayBtn.textContent = 'LAUNCH';
overlay.classList.remove('hidden');

// Run an ambient idle loop (starfield only) so the background
// is alive before the first game starts
gameState = 'IDLE';
(function idleLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#070014';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawStars();
  frame++;
  // Stop idle loop once a real game loop takes over
  if (gameState === 'IDLE') {
    requestAnimationFrame(idleLoop);
  }
}());
