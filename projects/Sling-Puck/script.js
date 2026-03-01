/* ═══════════════════════════════════════════════════════════
   Sling-Puck · script.js
   Canvas 2D | Mouse-drag physics | Euler-step trajectory
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */
const PUCK_RADIUS     = 14;
const HOLE_RADIUS     = 22;
const WALL_DAMPING    = 0.72;       // velocity kept on elastic bounce
const FRICTION        = 0.992;      // per-frame speed decay
const MAX_DRAG        = 220;        // px — maximum sling length
const POWER_SCALE     = 0.085;      // drag length → launch speed
const GRAVITY_STRENGTH= 2800;       // black hole "G·M" value
const GRAVITY_MIN_DIST= 40;         // avoid div-by-zero singularity
const TRAIL_MAX       = 48;
const STAR_COUNT      = 180;
const PREVIEW_STEPS   = 90;         // Euler steps for trajectory preview
const PREVIEW_DT      = 1 / 30;    // sim timestep for preview

const DIFFICULTIES = {
  easy:   { holes: 1, label: 'EASY'   },
  medium: { holes: 3, label: 'MEDIUM' },
  hard:   { holes: 5, label: 'HARD'   }
};

const LS_KEY = 'slingPuckBest';

/* ──────────────────────────────────────────────
   DOM
   ────────────────────────────────────────────── */
const canvas    = document.getElementById('game-canvas');
const ctx       = canvas.getContext('2d');
const shotEl    = document.getElementById('shot-count');
const bestEl    = document.getElementById('best-count');
const diffBtns  = document.querySelectorAll('.diff-btn');
const dragHint  = document.getElementById('drag-hint');
const overlay   = document.getElementById('overlay');
const oIcon     = document.getElementById('overlay-icon');
const oTitle    = document.getElementById('overlay-title');
const oMsg      = document.getElementById('overlay-msg');
const oBtnEl    = document.getElementById('overlay-btn');

/* ──────────────────────────────────────────────
   STAR FIELD
   ────────────────────────────────────────────── */
let stars = [];

function initStars() {
  stars = Array.from({ length: STAR_COUNT }, () => ({
    x:  Math.random(),     // normalised 0-1
    y:  Math.random(),
    r:  Math.random() * 1.6 + 0.3,
    a:  Math.random() * 0.8 + 0.2,
    vx: (Math.random() - 0.5) * 0.00006  // very slow drift
  }));
}

function drawStars() {
  const { width: W, height: H } = canvas;
  ctx.save();
  stars.forEach(s => {
    s.x = (s.x + s.vx + 1) % 1;
    const sx = s.x * W, sy = s.y * H;
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, Math.TAU);
    ctx.fillStyle = `rgba(200,220,255,${s.a})`;
    ctx.fill();
  });
  ctx.restore();
}

/* ──────────────────────────────────────────────
   GAME STATE
   ────────────────────────────────────────────── */
let puck, holes, trail, shots, diffKey, gameOver;
let dragging = false, dragStart = null, dragCur = null;
let best = {};         // { easy: n, medium: n, hard: n }

function loadBest() {
  try { best = JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { best = {}; }
}

function saveBest(diff, val) {
  best[diff] = val;
  try { localStorage.setItem(LS_KEY, JSON.stringify(best)); } catch {}
}

function getBest(diff) {
  return (typeof best[diff] === 'number') ? best[diff] : null;
}

/* ──────────────────────────────────────────────
   CANVAS RESIZE
   ────────────────────────────────────────────── */
function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* ──────────────────────────────────────────────
   HOLES PLACEMENT
   ────────────────────────────────────────────── */
function placeHoles(count) {
  const W = canvas.width, H = canvas.height;
  const list = [];
  const margin = 80;
  let attempts = 0;

  while (list.length < count && attempts < 2000) {
    attempts++;
    const x = margin + Math.random() * (W - margin * 2);
    const y = margin + Math.random() * (H - margin * 2);
    // Keep away from puck start
    if (Math.hypot(x - W * 0.5, y - H * 0.5) < 180) continue;
    // Keep away from each other
    if (list.some(h => Math.hypot(h.x - x, h.y - y) < 120)) continue;
    list.push({ x, y, captured: false });
  }
  return list;
}

/* ──────────────────────────────────────────────
   INIT / RESET
   ────────────────────────────────────────────── */
function startGame(diff) {
  diffKey  = diff;
  shots    = 0;
  gameOver = false;
  trail    = [];

  puck = {
    x:  canvas.width  * 0.5,
    y:  canvas.height * 0.5,
    vx: 0, vy: 0,
    moving: false
  };

  holes = placeHoles(DIFFICULTIES[diff].holes);

  overlay.classList.add('hidden');
  shotEl.textContent = '0';

  const b = getBest(diff);
  bestEl.textContent = b !== null ? b : '—';

  dragHint.classList.remove('hidden');
  updateDiffButtons();
}

function updateDiffButtons() {
  diffBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.diff === diffKey);
  });
}

/* ──────────────────────────────────────────────
   PHYSICS STEP  (dt = seconds)
   ────────────────────────────────────────────── */
function stepPhysics(state, dt) {
  let { x, y, vx, vy } = state;
  const W = canvas.width, H = canvas.height;

  // Black hole gravity from each uncaptured hole
  holes.forEach(h => {
    if (h.captured) return;
    const dx = h.x - x, dy = h.y - y;
    const dist2 = dx * dx + dy * dy;
    const dist  = Math.sqrt(dist2);
    if (dist < GRAVITY_MIN_DIST) return;
    const force = GRAVITY_STRENGTH / dist2;
    vx += (dx / dist) * force * dt;
    vy += (dy / dist) * force * dt;
  });

  vx *= FRICTION;
  vy *= FRICTION;

  x += vx * dt;
  y += vy * dt;

  // Elastic wall bounce
  if (x - PUCK_RADIUS < 0) { x = PUCK_RADIUS; vx = Math.abs(vx) * WALL_DAMPING; }
  if (x + PUCK_RADIUS > W) { x = W - PUCK_RADIUS; vx = -Math.abs(vx) * WALL_DAMPING; }
  if (y - PUCK_RADIUS < 0) { y = PUCK_RADIUS; vy = Math.abs(vy) * WALL_DAMPING; }
  if (y + PUCK_RADIUS > H) { y = H - PUCK_RADIUS; vy = -Math.abs(vy) * WALL_DAMPING; }

  return { x, y, vx, vy };
}

/* ──────────────────────────────────────────────
   TRAJECTORY PREVIEW (Euler steps, no side-effects)
   ────────────────────────────────────────────── */
function computeTrajectory(x0, y0, vx0, vy0) {
  const pts = [{ x: x0, y: y0 }];
  let state = { x: x0, y: y0, vx: vx0, vy: vy0 };
  for (let i = 0; i < PREVIEW_STEPS; i++) {
    state = stepPhysics(state, PREVIEW_DT);
    pts.push({ x: state.x, y: state.y });
    if (Math.hypot(state.vx, state.vy) < 0.5) break;
  }
  return pts;
}

/* ──────────────────────────────────────────────
   UPDATE (per frame)
   ────────────────────────────────────────────── */
const FRAME_DT = 1 / 60;

function update() {
  if (gameOver || !puck.moving) return;

  trail.push({ x: puck.x, y: puck.y });
  if (trail.length > TRAIL_MAX) trail.shift();

  const next = stepPhysics(puck, FRAME_DT);
  puck.x = next.x; puck.y = next.y;
  puck.vx = next.vx; puck.vy = next.vy;

  // Capture check
  holes.forEach(h => {
    if (h.captured) return;
    if (Math.hypot(puck.x - h.x, puck.y - h.y) < HOLE_RADIUS + PUCK_RADIUS * 0.6) {
      h.captured = true;
      checkWin();
    }
  });

  // Stop when very slow
  if (Math.hypot(puck.vx, puck.vy) < 0.5) {
    puck.vx = 0; puck.vy = 0; puck.moving = false;
  }
}

function checkWin() {
  if (holes.every(h => h.captured)) {
    gameOver = true;
    puck.moving = false;
    // Update best
    const prev = getBest(diffKey);
    if (prev === null || shots < prev) saveBest(diffKey, shots);
    bestEl.textContent = getBest(diffKey);
    setTimeout(() => showOverlay(true), 600);
  }
}

/* ──────────────────────────────────────────────
   DRAW
   ────────────────────────────────────────────── */
function draw() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Background
  const bg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
  bg.addColorStop(0, '#100020');
  bg.addColorStop(1, '#06000f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawStars();
  drawHoles();
  drawTrail();
  drawPuck();

  if (dragging && dragStart && dragCur && !puck.moving && !gameOver) {
    drawSling();
  }
}

function drawHoles() {
  holes.forEach(h => {
    if (h.captured) {
      // captured: glowing filled
      ctx.save();
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur  = 24;
      ctx.beginPath();
      ctx.arc(h.x, h.y, HOLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(57,255,20,0.35)';
      ctx.fill();
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
      return;
    }
    // Uncaptured: dark void with cyan rim
    ctx.save();
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur  = 16;
    ctx.beginPath();
    ctx.arc(h.x, h.y, HOLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,255,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Inner spiral ticks for "black hole" feel
    for (let i = 0; i < 4; i++) {
      const angle  = (Date.now() * 0.001 + i * Math.PI * 0.5) % (Math.PI * 2);
      const ix = h.x + Math.cos(angle) * HOLE_RADIUS * 0.55;
      const iy = h.y + Math.sin(angle) * HOLE_RADIUS * 0.55;
      ctx.beginPath();
      ctx.arc(ix, iy, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,255,0.5)';
      ctx.fill();
    }
  });
}

function drawTrail() {
  if (trail.length < 2) return;
  ctx.save();
  for (let i = 1; i < trail.length; i++) {
    const t   = i / trail.length;
    const a   = t * t * 0.55;
    const r   = PUCK_RADIUS * t * 0.5;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,229,255,${a})`;
    ctx.fill();
  }
  ctx.restore();
}

function drawPuck() {
  const { x, y } = puck;

  // Outer glow
  ctx.save();
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur  = 22;

  // Body gradient
  const g = ctx.createRadialGradient(x - PUCK_RADIUS * 0.3, y - PUCK_RADIUS * 0.3, 1, x, y, PUCK_RADIUS);
  g.addColorStop(0, '#b0f0ff');
  g.addColorStop(1, '#0090c8');

  ctx.beginPath();
  ctx.arc(x, y, PUCK_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawSling() {
  const { x, y } = puck;
  const dx = dragStart.x - dragCur.x;
  const dy = dragStart.y - dragCur.y;
  const dist = Math.hypot(dx, dy);
  const clamped = Math.min(dist, MAX_DRAG);
  const ratio   = clamped / MAX_DRAG;

  // Clamped aim point
  const factor = clamped / (dist || 1);
  const ax = dragStart.x - dx * factor;  // clamp drag
  const ay = dragStart.y - dy * factor;
  const launchVx = dx * POWER_SCALE * (clamped / MAX_DRAG) * (MAX_DRAG * POWER_SCALE);
  const launchVy = dy * POWER_SCALE * (clamped / MAX_DRAG) * (MAX_DRAG * POWER_SCALE);

  // Use the actual launch vector (from drag offset)
  const lvx = dx * POWER_SCALE;
  const lvy = dy * POWER_SCALE;

  // Elastic band lines
  ctx.save();
  ctx.strokeStyle = `rgba(255,0,255,${0.4 + ratio * 0.5})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ax, ay); ctx.stroke();
  ctx.restore();

  // Power indicator dot at drag point
  ctx.save();
  ctx.beginPath();
  ctx.arc(ax, ay, 5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,0,255,${0.5 + ratio * 0.5})`;
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur  = 10;
  ctx.fill();
  ctx.restore();

  // Trajectory preview
  const pts = computeTrajectory(x, y, lvx, lvy);
  if (pts.length > 1) {
    ctx.save();
    for (let i = 1; i < pts.length; i++) {
      const t = i / pts.length;
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, 3 * (1 - t * 0.7), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,${0.6 * (1 - t)})`;
      ctx.fill();
    }
    ctx.restore();
  }
}

/* ──────────────────────────────────────────────
   OVERLAY
   ────────────────────────────────────────────── */
function showOverlay(win) {
  if (win) {
    oIcon.textContent  = '🎯';
    oTitle.textContent = 'PUCK IN!';
    oMsg.textContent   = `You sank all holes in ${shots} shot${shots !== 1 ? 's' : ''}. Best for ${diffKey}: ${getBest(diffKey)}.`;
  } else {
    oIcon.textContent  = '💀';
    oTitle.textContent = 'OUT OF BOUNDS';
    oMsg.textContent   = 'IMPOSSIBLE — the physics are working as intended.';
  }
  overlay.classList.remove('hidden');
}

/* ──────────────────────────────────────────────
   INPUT
   ────────────────────────────────────────────── */
function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.changedTouches?.[0] ?? e;
  return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
}

function onDown(e) {
  if (gameOver || puck.moving) return;
  e.preventDefault();
  const pos = getCanvasPos(e);
  // Only start drag if near puck
  if (Math.hypot(pos.x - puck.x, pos.y - puck.y) > PUCK_RADIUS * 3.5) return;
  dragging  = true;
  dragStart = { ...pos };
  dragCur   = { ...pos };
}

function onMove(e) {
  if (!dragging) return;
  e.preventDefault();
  dragCur = getCanvasPos(e);
}

function onUp(e) {
  if (!dragging) return;
  dragging = false;
  dragHint.classList.add('hidden');

  const dx = dragStart.x - dragCur.x;
  const dy = dragStart.y - dragCur.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 5) return;    // No micro-launches

  const clamped = Math.min(dist, MAX_DRAG);
  const factor  = clamped / dist;
  puck.vx = dx * POWER_SCALE * factor;
  puck.vy = dy * POWER_SCALE * factor;
  puck.moving = true;
  shots++;
  shotEl.textContent = shots;

  dragStart = null;
  dragCur   = null;
}

/* ──────────────────────────────────────────────
   DIFFICULTY BUTTONS
   ────────────────────────────────────────────── */
diffBtns.forEach(btn => {
  btn.addEventListener('click', () => startGame(btn.dataset.diff));
});

/* ──────────────────────────────────────────────
   PLAY AGAIN
   ────────────────────────────────────────────── */
oBtnEl.addEventListener('click', () => startGame(diffKey));

/* ──────────────────────────────────────────────
   GAME LOOP
   ────────────────────────────────────────────── */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

/* ──────────────────────────────────────────────
   POINTER EVENTS
   ────────────────────────────────────────────── */
canvas.addEventListener('pointerdown', onDown, { passive: false });
canvas.addEventListener('pointermove', onMove, { passive: false });
canvas.addEventListener('pointerup',   onUp);
canvas.addEventListener('pointercancel', () => { dragging = false; dragStart = null; dragCur = null; });

/* ──────────────────────────────────────────────
   RESIZE
   ────────────────────────────────────────────── */
window.addEventListener('resize', () => {
  const was = { wx: puck.x / canvas.width, wy: puck.y / canvas.height };
  resize();
  puck.x = was.wx * canvas.width;
  puck.y = was.wy * canvas.height;
  // Reposition holes proportionally
  holes.forEach(h => {
    h.x = (h.x / canvas.width)  * canvas.width;
    h.y = (h.y / canvas.height) * canvas.height;
  });
  initStars();
});

/* ──────────────────────────────────────────────
   BOOT
   ────────────────────────────────────────────── */
Math.TAU = Math.PI * 2;
resize();
initStars();
loadBest();
startGame('easy');
loop();
