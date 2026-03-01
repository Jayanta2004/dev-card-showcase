// ============================================================
//  RoninEngine — core/config.js
//  All tuneable constants in one place
// ============================================================

'use strict';

// ─── Canvas / display ─────────────────────────────────────────────────────────
export const CANVAS_W          = 1280;
export const CANVAS_H          = 720;
export const TARGET_FPS        = 60;
export const FIXED_DT          = 1 / 60;          // physics timestep (s)
export const SLOW_MO_FACTOR    = 0.25;
export const MAX_FRAME_DT      = 0.05;             // clamp runaway frames

// ─── World ────────────────────────────────────────────────────────────────────
export const GRAVITY           = 980;              // px / s²
export const GROUND_Y          = 620;
export const ARENA_LEFT        = 80;
export const ARENA_RIGHT       = CANVAS_W - 80;

// ─── Samurai skeleton proportions (px) ───────────────────────────────────────
export const SKEL = {
  neckLen    : 28,
  torsoLen   : 90,
  hipLen     : 24,
  upperArmLen: 52,
  lowerArmLen: 46,
  handLen    : 18,
  upperLegLen: 62,
  lowerLegLen: 58,
  footLen    : 20,
  headRadius : 22,
  shoulderW  : 44,
  hipW       : 32,
};

// ─── IK constraints (radians) ─────────────────────────────────────────────────
export const IK = {
  elbowMinAngle : -2.7,
  elbowMaxAngle :  0.1,
  shoulderMinH  : -Math.PI * 0.9,
  shoulderMaxH  :  Math.PI * 0.9,
  shoulderMinV  : -Math.PI * 0.55,
  shoulderMaxV  :  Math.PI * 0.55,
  wristRange    :  Math.PI * 0.45,
  kneeMinAngle  : -2.8,
  kneeMaxAngle  : -0.05,
};

// ─── Katana geometry ──────────────────────────────────────────────────────────
export const KATANA = {
  totalLen   : 180,
  bladeLen   : 140,
  handleLen  :  40,
  maxWidth   :   6,
  tipWidth   :   1,
  handleW    :   8,
  mass       :   1.2,
  restitution:   0.55,
  friction   :   0.18,
};

// ─── Combat ───────────────────────────────────────────────────────────────────
export const COMBAT = {
  attackCooldown    : 0.55,        // s
  blockWindow       : 0.22,        // s after block input
  parryWindow       : 0.08,        // s — perfect parry
  staggerDuration   : 0.6,         // s
  deathFallDuration : 1.8,         // s
  maxPosture        : 100,
  postureRegen      : 8,           // /s
  postureDmgBlock   : 12,
  postureDmgHit     : 22,
  healthMax         : 100,
  healthDmgLight    : 18,
  healthDmgHeavy    : 34,
  clashImpulse      : 280,         // px/s
};

// ─── Cloth ────────────────────────────────────────────────────────────────────
export const CLOTH = {
  cols              : 7,
  rows              : 10,
  restLength        : 12,          // px
  stiffness         : 0.92,
  constraintIter    : 8,
  mass              : 0.04,
  damping           : 0.98,
  windStrength      : 35,
  windFreq          : 0.4,         // Hz
  motionInfluence   : 0.35,
};

// ─── Particles ────────────────────────────────────────────────────────────────
export const PARTICLES = {
  maxSparks         : 200,
  maxBlood          : 150,
  maxAsh            : 80,
  sparkLife         : 0.55,        // s
  sparkSpeed        : 420,
  bloodLife         : 1.2,         // s
  bloodGravity      : 600,
  ashLife           : 2.4,
  ashDrift          : 18,
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const AI = {
  reactionTime      : 0.14,        // s
  aggressionBase    : 0.55,        // 0–1
  attackRangePx     : 220,
  retreatRangePx    : 140,
  circleSpeed       : 90,          // px/s
  stateDurations: {
    idle    : [1.0, 2.5],
    approach: [0.6, 1.4],
    attack  : [0.1, 0.3],
    retreat : [0.4, 0.9],
    block   : [0.3, 0.7],
    feint   : [0.2, 0.5],
  },
};

// ─── Visual ───────────────────────────────────────────────────────────────────
export const VFX = {
  moonRadius        : 110,
  moonX             : CANVAS_W * 0.72,
  moonY             : CANVAS_H * 0.22,
  fogLayers         : 4,
  bloomPasses       : 2,
  trailLength       : 14,
  shadowAlpha       : 0.28,
  silhouetteColor   : '#0d0d0d',
  bloodColor        : '#8b0000',
  sparkColors       : ['#fff7e0','#ffe066','#ffaa00','#ff6600'],
  moonColor         : '#c00020',
  skyTopColor       : '#000005',
  skyBottomColor    : '#1a000a',
};

// ─── Debug ────────────────────────────────────────────────────────────────────
export const DEBUG = {
  axisColor         : '#00ff88',
  normalColor       : '#ff4455',
  skeletonColor     : '#4488ff',
  clothColor        : '#ff88ff',
  aabbColor         : '#ffff00',
  textColor         : '#ffffff',
};
