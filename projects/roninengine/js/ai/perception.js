// RoninEngine — ai/perception.js  ·  Sensor / world-query helpers for AI
'use strict';
import { Vec2 } from '../core/math.js';

/**
 * All perception queries operate on a lightweight world snapshot
 * passed in each tick (avoids coupling to global State).
 *
 * snapshot = {
 *   aiPos:      Vec2,
 *   playerPos:  Vec2,
 *   aiHP:       number,
 *   playerHP:   number,
 *   aiPosture:  number,
 *   playerPosture: number,
 *   playerAttacking: bool,
 *   playerBlocking:  bool,
 *   dt:         number,
 * }
 */

export const Perception = {
  gapDist(snap)       { return Vec2.dist(snap.aiPos, snap.playerPos); },
  facing(snap)        { return snap.playerPos.x > snap.aiPos.x ? 1 : -1; },
  inMeleeRange(snap, r = 140)  { return this.gapDist(snap) <= r; },
  inStrikeRange(snap, r = 110) { return this.gapDist(snap) <= r; },
  playerBroke(snap)   { return snap.playerPosture  >= 95; },
  aiBroke(snap)       { return snap.aiPosture       >= 95; },
  playerLow(snap)     { return snap.playerHP < 30; },
  aiLow(snap)         { return snap.aiHP     < 30; },
  playerThreat(snap)  { return snap.playerAttacking && this.inMeleeRange(snap, 130); },
  safeToAttack(snap)  { return !snap.playerBlocking && this.inStrikeRange(snap); },

  /** Returns a float 0–1 representing how aggressively AI should push */
  aggression(snap) {
    const hp    = snap.aiHP / 100;
    const posture = snap.playerPosture / 100;
    return Math.min(1, (1 - hp) * 0.4 + posture * 0.6);
  },
};
