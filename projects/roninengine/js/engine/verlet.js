// RoninEngine — engine/verlet.js  ·  Verlet integration helpers
'use strict';
import { Vec2 } from '../core/math.js';

/**
 * Single Verlet particle (position + previous position).
 * More efficient than storing velocity — avoids explicit integration.
 */
export class VerletPoint {
  constructor(x = 0, y = 0, pinned = false) {
    this.pos   = new Vec2(x, y);
    this.prev  = new Vec2(x, y);
    this.pinned = pinned;
    this.mass   = 1;
  }

  /** Integrate using Verlet scheme given gravity & drag */
  integrate(gravity, drag, dt) {
    if (this.pinned) return;
    const vel  = Vec2.sub(this.pos, this.prev).scale(1 - drag);
    this.prev  = this.pos.clone();
    this.pos   = Vec2.add(this.pos, vel).add(gravity.clone().scale(dt * dt));
  }

  /** Keep point inside a world AABB */
  constrain(minX, minY, maxX, maxY) {
    this.pos.x = Math.max(minX, Math.min(maxX, this.pos.x));
    this.pos.y = Math.max(minY, Math.min(maxY, this.pos.y));
  }
}

/**
 * Rigid distance constraint between two VerletPoints.
 * Iterate this several times per frame for stiffness.
 */
export function relaxConstraint(a, b, restLen) {
  if (a.pinned && b.pinned) return;
  const dx = b.pos.x - a.pos.x;
  const dy = b.pos.y - a.pos.y;
  const d  = Math.sqrt(dx * dx + dy * dy) || 1e-9;
  const diff = (d - restLen) / d * 0.5;
  const ox = dx * diff, oy = dy * diff;
  if (!a.pinned) { a.pos.x += ox; a.pos.y += oy; }
  if (!b.pinned) { b.pos.x -= ox; b.pos.y -= oy; }
}
