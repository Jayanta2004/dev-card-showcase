// ============================================================
//  RoninEngine — main.js
//  Engine bootstrap: game loop, input, collision dispatch,
//  scene management
// ============================================================

'use strict';

import { Vec2, clamp }                          from './core/math.js';
import { State, tickFPS, tickWind, resetRound,
         consumeEdge }                          from './core/state.js';
import { CANVAS_W, CANVAS_H, GROUND_Y,
         FIXED_DT, MAX_FRAME_DT, SLOW_MO_FACTOR,
         COMBAT } from './core/config.js';
import { Samurai, STANCE }                      from './entities/samurai.js';
import { ParticleSystem }                       from './engine/particles.js';
import { satTest, ccdSweep }                    from './engine/sat.js';
import { resolveClash, resolveImpulse,
         positionalCorrection }                 from './engine/impulse.js';
import { AIController }                         from './ai/controller.js';
import { Renderer }                             from './render/renderer.js';

// ─── Bootstrap ────────────────────────────────────────────────────────────────
let canvas, renderer, lastTime, accumulator;

export function init() {
  canvas   = document.getElementById('roninCanvas');
  if (!canvas) { console.error('Canvas not found!'); return; }

  renderer = new Renderer(canvas);

  // Spawn entities
  const playerSpawn = new Vec2(CANVAS_W * 0.28, GROUND_Y);
  const aiSpawn     = new Vec2(CANVAS_W * 0.72, GROUND_Y);

  State.player = new Samurai(playerSpawn,  1,  true);
  State.ai     = new Samurai(aiSpawn,     -1, false);

  // Sub-systems
  State.particleSystem = new ParticleSystem();
  State.aiController   = new AIController(State.ai, State.player);
  State.renderer       = renderer;
  State._config        = { CLOTH: { windFreq: 0.4 } };

  // Input
  _bindInput();

  // Intro countdown
  State.matchState = 'intro';
  State.matchTimer = 2.0;

  // Start loop
  State.running    = true;
  lastTime         = performance.now();
  accumulator      = 0;
  requestAnimationFrame(_loop);

  console.log('[RoninEngine] Initialised — Blade awaits.');
}

// ─── Main loop ────────────────────────────────────────────────────────────────
function _loop(now) {
  if (!State.running) return;
  requestAnimationFrame(_loop);

  const rawDt = clamp((now - lastTime) / 1000, 0, MAX_FRAME_DT);
  lastTime    = now;
  State.frameTime = rawDt * 1000;

  // FPS sampling
  tickFPS(rawDt);
  State.elapsedTime += rawDt;
  State.frameCount++;

  // Time scaling
  const dt = State.paused ? 0 : rawDt * State.timeScale;

  tickWind(dt);
  _processInput();
  _updateMatchState(dt);

  // Fixed-step physics accumulator
  if (dt > 0) {
    accumulator += dt;
    const maxSteps = 4;
    let steps = 0;
    while (accumulator >= FIXED_DT && steps < maxSteps) {
      _physicsStep(FIXED_DT);
      accumulator -= FIXED_DT;
      steps++;
    }
  }

  renderer.render(rawDt);
}

// ─── Match state machine ─────────────────────────────────────────────────────
function _updateMatchState(dt) {
  switch (State.matchState) {
    case 'intro':
      State.matchTimer -= dt;
      if (State.matchTimer <= 0) {
        State.matchState = 'fight';
        State.matchTimer = 0;
      }
      break;

    case 'fight':
      // Check for death → trigger slow-kill
      if (State.player.dead || State.ai.dead) {
        State.matchState = 'slowkill';
        State.matchTimer = 1.6;
        State.timeScale  = SLOW_MO_FACTOR;
        renderer.shake(14);
        renderer.flash('#ff2200', 0.45);
      }
      break;

    case 'slowkill':
      State.matchTimer -= dt / SLOW_MO_FACTOR;
      if (State.matchTimer <= 0) {
        State.timeScale  = 1.0;
        State.matchState = 'results';
        State.matchTimer = 0;
        if (State.player.dead) State.aiWins++;
        else                   State.playerWins++;
      }
      break;

    case 'results':
      // Wait for Enter / tap
      break;
  }
}

// ─── Physics step ─────────────────────────────────────────────────────────────
function _physicsStep(dt) {
  const player = State.player;
  const ai     = State.ai;
  if (!player || !ai) return;

  // Update AI intent
  if (State.matchState === 'fight') {
    State.aiController.update(dt);
    ai.update(dt, State.aiController.moveIntent, false);
  }

  // Update player
  const inp = State.input;
  const px  = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  player.update(dt, px, inp.up);

  // Collision detection
  _detectCollisions(dt);

  // Ambient ash particles
  if (State.frameCount % 90 === 0) {
    State.particleSystem.emitAsh(
      new Vec2(CANVAS_W * 0.5 + (Math.random()-0.5)*400, GROUND_Y - 20),
      randomInt(1, 3)
    );
  }

  // Update particles
  State.particleSystem.update(dt);
}

function randomInt(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }

// ─── Collision detection ─────────────────────────────────────────────────────
function _detectCollisions(dt) {
  const player = State.player;
  const ai     = State.ai;
  State.lastCollisions = [];

  const pKatana = player.katana;
  const aKatana = ai.katana;
  if (!pKatana || !aKatana) return;

  pKatana.polygon.markDirty();
  aKatana.polygon.markDirty();

  // ── Katana vs Katana (blade clash) ────────────────────────
  const bladeSpeed = pKatana.body.vel.len() + aKatana.body.vel.len();

  let clashContact;
  if (bladeSpeed > 300) {
    // Use CCD for fast-moving blades
    const { toi, contact } = ccdSweep(pKatana.polygon, aKatana.polygon, dt);
    clashContact = toi < 1 ? contact : null;
  } else {
    const c = satTest(pKatana.polygon, aKatana.polygon);
    clashContact = c.hit ? c : null;
  }

  if (clashContact) {
    State.lastCollisions.push(clashContact);
    const impulse = resolveClash(pKatana.body, aKatana.body, clashContact);

    if (impulse > 20) {
      const sparkCount = Math.min(24, Math.floor(impulse / 15));
      State.particleSystem.emitSparks(
        clashContact.pointA,
        clashContact.normal,
        clamp(impulse / 300, 0.3, 1.0),
        sparkCount
      );
      pKatana.triggerClash(impulse);
      aKatana.triggerClash(impulse);
      renderer.shake(clamp(impulse / 80, 1, 8));
    }
  }

  // ── Player katana vs AI body ─────────────────────────────
  if (player.stance === STANCE.ATTACK_LIGHT || player.stance === STANCE.ATTACK_HEAVY) {
    const bodyContact = _knifeBodyTest(pKatana, ai);
    if (bodyContact) {
      const isHeavy  = player.stance === STANCE.ATTACK_HEAVY;
      const dmg      = isHeavy ? COMBAT.healthDmgHeavy : COMBAT.healthDmgLight;
      const died     = ai.takeHit(dmg, isHeavy, clashContact ? clashContact.normal : Vec2.fromAngle(0));
      State.aiController.onPlayerHit();

      State.particleSystem.emitBlood(
        bodyContact, pKatana.body.vel.norm(), isHeavy ? 1.0 : 0.6
      );
      renderer.shake(isHeavy ? 9 : 5);
      renderer.flash('#cc0000', isHeavy ? 0.3 : 0.15);

      if (died) {
        renderer.shake(18);
        renderer.flash('#ff3300', 0.55);
      }
    }
  }

  // ── AI katana vs Player body ─────────────────────────────
  if (ai.stance === STANCE.ATTACK_LIGHT || ai.stance === STANCE.ATTACK_HEAVY) {
    const bodyContact = _knifeBodyTest(aKatana, player);
    if (bodyContact) {
      const isHeavy = ai.stance === STANCE.ATTACK_HEAVY;
      const dmg     = isHeavy ? COMBAT.healthDmgHeavy : COMBAT.healthDmgLight;
      const died    = player.takeHit(dmg, isHeavy, Vec2.fromAngle(Math.PI));
      State.aiController.onAIHit();

      State.particleSystem.emitBlood(
        bodyContact, aKatana.body.vel.norm(), isHeavy ? 1.0 : 0.6
      );
      renderer.shake(isHeavy ? 8 : 4);
    }
  }
}

/** Simple proximity check: katana tip near samurai torso */
function _knifeBodyTest(katana, samurai) {
  const tip  = katana.tipPos;
  const mid  = katana.midPos;
  const torso = samurai.skeleton.positions.torso;
  const hip   = samurai.skeleton.positions.hip;
  if (!torso || !hip) return null;

  const bodyCenter = torso.add(hip).mul(0.5);
  const tipDist    = tip.dist(bodyCenter);
  const midDist    = mid.dist(bodyCenter);

  if (tipDist < 32 || midDist < 28) {
    return tip.lerp(mid, 0.5);
  }
  return null;
}

// ─── Input binding ────────────────────────────────────────────────────────────
function _bindInput() {
  const keyMap = {
    ArrowLeft : 'left',  KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp   : 'up',    KeyW: 'up',
    ArrowDown : 'down',  KeyS: 'down',
    KeyJ      : 'attackLight',
    KeyK      : 'attackHeavy',
    KeyL      : 'block',
    Space     : 'dash',
    ShiftLeft : 'up',      // run
    ShiftRight: 'up',
  };

  const held    = new Set();
  const inp     = State.input;

  document.addEventListener('keydown', e => {
    const action = keyMap[e.code];
    if (!action) {
      // Non-movement keys
      if (e.code === 'Enter' && State.matchState === 'results') {
        _newRound();
      }
      if (e.code === 'KeyZ') { State.slowMo = !State.slowMo; State.timeScale = State.slowMo ? SLOW_MO_FACTOR : 1.0; }
      if (e.code === 'KeyX') { State.showDebug = !State.showDebug; }
      if (e.code === 'KeyC') { State.showCloth = !State.showCloth; }
      if (e.code === 'KeyP') { State.paused    = !State.paused;    }
      return;
    }

    if (held.has(e.code)) return;  // already down
    held.add(e.code);
    inp[action] = true;

    // Edge triggers
    if (action === 'attackLight') inp.attackLightEdge = true;
    if (action === 'attackHeavy') inp.attackHeavyEdge = true;
    if (action === 'block')       inp.blockEdge       = true;
    if (action === 'dash')        inp.dashEdge        = true;
  });

  document.addEventListener('keyup', e => {
    held.delete(e.code);
    const action = keyMap[e.code];
    if (action) {
      // Only clear if no other key maps to the same action is held
      const stillHeld = [...held].some(k => keyMap[k] === action);
      if (!stillHeld) inp[action] = false;
    }
  });

  // Touch controls (mobile)
  _bindTouchControls();
}

function _bindTouchControls() {
  const btns = document.querySelectorAll('[data-action]');
  btns.forEach(btn => {
    const action = btn.dataset.action;
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      State.input[action] = true;
      if (action === 'attackLight') State.input.attackLightEdge = true;
      if (action === 'attackHeavy') State.input.attackHeavyEdge = true;
      if (action === 'block')       State.input.blockEdge       = true;
      if (action === 'dash')        State.input.dashEdge        = true;
    }, { passive: false });
    btn.addEventListener('touchend',   e => { e.preventDefault(); State.input[action] = false; }, { passive: false });
    btn.addEventListener('mousedown',  () => { State.input[action] = true; });
    btn.addEventListener('mouseup',    () => { State.input[action] = false; });
  });
}

// ─── Input processing (edge → actions) ───────────────────────────────────────
function _processInput() {
  if (State.matchState !== 'fight') return;
  const player = State.player;
  if (!player || player.dead) return;

  if (consumeEdge('attackLightEdge')) player.attackLight();
  if (consumeEdge('attackHeavyEdge')) player.attackHeavy();

  if (consumeEdge('blockEdge'))  player.startBlock();
  if (!State.input.block && player.stance === STANCE.BLOCK) player.stopBlock();

  if (consumeEdge('dashEdge')) {
    const dir = (State.input.right ? 1 : 0) - (State.input.left ? 1 : 0) || player.facing;
    player.dash(dir);
  }
}

// ─── New round ────────────────────────────────────────────────────────────────
function _newRound() {
  State.round++;
  resetRound();
}

// ─── Auto-start ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
