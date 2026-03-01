// ============================================================
//  RoninEngine — core/state.js
//  Shared mutable game state (singleton)
// ============================================================

'use strict';

/**
 * Central game state object.
 * All modules read/write through this reference so there is
 * a single source of truth for every runtime variable.
 */
export const State = {

  // ── Loop control ─────────────────────────────────────────
  running          : false,
  paused           : false,
  slowMo           : false,
  timeScale        : 1.0,
  elapsedTime      : 0,        // total game seconds (unscaled)
  physicTime       : 0,        // accumulated scaled time (s)
  frameCount       : 0,

  // ── Performance monitoring ────────────────────────────────
  fps              : 0,
  fpsSmoothed      : 0,
  frameTime        : 0,        // ms
  _fpsAccum        : 0,
  _fpsSamples      : 0,

  // ── Feature toggles ──────────────────────────────────────
  showDebug        : false,
  showCloth        : true,
  showSparks       : true,
  showBlood        : true,
  showShadows      : true,
  showFog          : true,

  // ── Input snapshot ───────────────────────────────────────
  input: {
    left           : false,
    right          : false,
    up             : false,
    down           : false,
    attackLight    : false,
    attackHeavy    : false,
    block          : false,
    dash           : false,
    // edge-triggered flags (consumed each frame)
    attackLightEdge: false,
    attackHeavyEdge: false,
    blockEdge      : false,
    dashEdge       : false,
  },

  // ── Match state ──────────────────────────────────────────
  matchState       : 'intro',    // 'intro' | 'fight' | 'slowkill' | 'results'
  matchTimer       : 0,
  round            : 1,
  playerWins       : 0,
  aiWins           : 0,

  // ── Entity references (set by main.js) ───────────────────
  player           : null,
  ai               : null,

  // ── Subsystem references (set by main.js) ─────────────────
  particleSystem   : null,
  renderer         : null,
  aiController     : null,

  // ── Collision pairs last frame ────────────────────────────
  lastCollisions   : [],

  // ── Wind state (used by cloth) ────────────────────────────
  wind: {
    base           : 0,
    phase          : 0,
    strength       : 0,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Consume and return an edge-triggered input flag */
export function consumeEdge(flag) {
  const val = State.input[flag];
  State.input[flag] = false;
  return val;
}

/** Advance wind simulation */
export function tickWind(dt) {
  const { CLOTH } = State._config || {};
  State.wind.phase += dt * (CLOTH ? CLOTH.windFreq : 0.4);
  State.wind.strength = (
    Math.sin(State.wind.phase * 1.0) * 0.6 +
    Math.sin(State.wind.phase * 2.3) * 0.3 +
    Math.sin(State.wind.phase * 5.1) * 0.1
  );
}

/** Update the FPS tracker */
export function tickFPS(dt) {
  State._fpsAccum  += dt;
  State._fpsSamples++;
  if (State._fpsAccum >= 0.25) {
    State.fps        = Math.round(State._fpsSamples / State._fpsAccum);
    State.fpsSmoothed = State.fpsSmoothed * 0.7 + State.fps * 0.3;
    State._fpsAccum  = 0;
    State._fpsSamples = 0;
  }
}

/** Reset everything for a new round */
export function resetRound() {
  State.matchTimer    = 0;
  State.elapsedTime   = 0;
  State.physicTime    = 0;
  State.frameCount    = 0;
  State.lastCollisions = [];
  State.wind.phase    = 0;
  State.wind.strength = 0;
  State.matchState    = 'fight';
  if (State.player)        State.player.reset();
  if (State.ai)            State.ai.reset();
  if (State.particleSystem) State.particleSystem.clear();
}
