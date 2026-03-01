// RoninEngine — engine/constraints.js  ·  Higher-level constraint utilities
'use strict';
import { Vec2 } from '../core/math.js';

/**
 * Apply an angular limit to a joint chain segment.
 * @param {Vec2} parent  Parent joint world position
 * @param {Vec2} child   Child joint world position
 * @param {number} refAngle  Reference (rest) angle in radians
 * @param {number} minDeg    Minimum deviation in degrees
 * @param {number} maxDeg    Maximum deviation in degrees
 * @returns {Vec2} Clamped child position
 */
export function angleConstraint(parent, child, refAngle, minDeg, maxDeg) {
  const angle   = Math.atan2(child.y - parent.y, child.x - parent.x);
  const diff    = wrapAngle(angle - refAngle);
  const minR    = minDeg * (Math.PI / 180);
  const maxR    = maxDeg * (Math.PI / 180);
  const clamped = Math.max(minR, Math.min(maxR, diff));
  if (Math.abs(clamped - diff) < 1e-6) return child;
  const finalAngle = refAngle + clamped;
  const dist = Vec2.dist(parent, child);
  return new Vec2(
    parent.x + Math.cos(finalAngle) * dist,
    parent.y + Math.sin(finalAngle) * dist,
  );
}

function wrapAngle(a) {
  while (a >  Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/**
 * Spring constraint: apply a soft spring force between two Vec2 positions.
 * Returns the delta displacement to add to point a (negate for point b).
 */
export function springForce(a, b, restLen, stiffness) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d  = Math.sqrt(dx * dx + dy * dy) || 1e-9;
  const f  = (d - restLen) * stiffness;
  return new Vec2((dx / d) * f, (dy / d) * f);
}

/**
 * Weld constraint: pull point a toward target position.
 */
export function weldConstraint(point, target, alpha = 0.5) {
  return new Vec2(
    point.x + (target.x - point.x) * alpha,
    point.y + (target.y - point.y) * alpha,
  );
}
