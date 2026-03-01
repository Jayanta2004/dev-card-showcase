// ============================================================
//  RoninEngine — engine/cloth.js
//  Verlet-integrated robe lattice with distance constraints,
//  wind influence, and motion-reactive sway
// ============================================================

'use strict';

import { Vec2, clamp, randomRange } from '../core/math.js';
import { CLOTH as CFG, GROUND_Y }   from '../core/config.js';

// ─── Cloth Particle ──────────────────────────────────────────────────────────
class ClothParticle {
  constructor(x, y, pinned = false) {
    this.pos     = new Vec2(x, y);
    this.prev    = new Vec2(x, y);
    this.acc     = Vec2.zero();
    this.pinned  = pinned;
    this.mass    = CFG.mass;
  }

  /** Verlet integration step */
  integrate(dt, damping) {
    if (this.pinned) return;
    const vel    = this.pos.sub(this.prev).mulSelf(damping);
    const nextP  = this.pos.add(vel).add(this.acc.mul(dt * dt));
    this.prev.setV(this.pos);
    this.pos.setV(nextP);
    this.acc.set(0, 0);
  }

  addForce(fx, fy) {
    if (this.pinned) return;
    this.acc.x += fx / this.mass;
    this.acc.y += fy / this.mass;
  }
}

// ─── Constraint ──────────────────────────────────────────────────────────────
class Constraint {
  constructor(a, b, rest) {
    this.a    = a;
    this.b    = b;
    this.rest = rest;
  }

  /** Satisfy distance constraint (position-based) */
  satisfy(stiffness) {
    const dx   = this.b.pos.x - this.a.pos.x;
    const dy   = this.b.pos.y - this.a.pos.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1e-9;
    const diff = (dist - this.rest) / dist * stiffness;

    const corrX = dx * diff * 0.5;
    const corrY = dy * diff * 0.5;

    if (!this.a.pinned) { this.a.pos.x += corrX; this.a.pos.y += corrY; }
    if (!this.b.pinned) { this.b.pos.x -= corrX; this.b.pos.y -= corrY; }
  }
}

// ─── Cloth Solver ─────────────────────────────────────────────────────────────
export class ClothSolver {
  /**
   * Creates a rectangular cloth grid.
   * The top row can be pinned to anchor positions.
   *
   * @param {number}   originX   – top-left X of grid in world space
   * @param {number}   originY   – top-left Y of grid in world space
   * @param {number}   cols      – horizontal particle count
   * @param {number}   rows      – vertical particle count
   * @param {number}   spacing   – rest length between adjacent particles
   * @param {boolean[]} pinMask  – which top-row columns to pin (length = cols)
   */
  constructor(originX, originY, cols, rows, spacing, pinMask = null) {
    this.cols       = cols;
    this.rows       = rows;
    this.spacing    = spacing;
    this.particles  = [];
    this.constraints = [];
    this.gravity    = 300;   // px/s²

    // Build particle grid
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = originX + c * spacing;
        const y = originY + r * spacing;
        const pinned = (r === 0) && (pinMask ? pinMask[c] : true);
        this.particles.push(new ClothParticle(x, y, pinned));
      }
    }

    // Structural constraints (horizontal + vertical)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (c + 1 < cols)  this.constraints.push(new Constraint(this.particles[idx], this.particles[idx + 1],          spacing));
        if (r + 1 < rows)  this.constraints.push(new Constraint(this.particles[idx], this.particles[idx + cols],       spacing));
        // Shear constraints (diagonal)
        if (c + 1 < cols && r + 1 < rows) {
          this.constraints.push(new Constraint(this.particles[idx], this.particles[idx + cols + 1], spacing * 1.414));
          this.constraints.push(new Constraint(this.particles[idx + 1], this.particles[idx + cols], spacing * 1.414));
        }
      }
    }
  }

  /** Pin the top row particles to new world positions */
  pinTopRow(positions) {
    for (let c = 0; c < this.cols; c++) {
      const p = this.particles[c];
      if (p.pinned && c < positions.length) {
        p.pos.setV(positions[c]);
        p.prev.setV(positions[c]);
      }
    }
  }

  /** Pin a single particle by index */
  pinAt(index, worldPos) {
    const p = this.particles[index];
    p.pos.setV(worldPos);
    p.prev.setV(worldPos);
    p.pinned = true;
  }

  /** Drag all pinned-top particles by delta (body movement reaction) */
  nudgeAnchors(deltaX, deltaY) {
    for (let c = 0; c < this.cols; c++) {
      const p = this.particles[c];
      if (p.pinned) {
        p.pos.x += deltaX;
        p.pos.y += deltaY;
        p.prev.x += deltaX * 0.4;   // lag creates sway
        p.prev.y += deltaY * 0.4;
      }
    }
  }

  /**
   * Main simulation step.
   *
   * @param {number} dt          – scaled delta time (s)
   * @param {number} windX       – wind horizontal acceleration (px/s²)
   * @param {number} windY       – wind vertical acceleration (px/s²)
   * @param {Vec2}   ownerVel    – samurai velocity for motion sway
   */
  step(dt, windX = 0, windY = 0, ownerVel = Vec2.zero()) {
    if (dt <= 0) return;

    // Apply gravity + wind + motion influence
    const motionX = -ownerVel.x * CFG.motionInfluence;
    const motionY = -ownerVel.y * CFG.motionInfluence * 0.5;

    for (const p of this.particles) {
      if (p.pinned) continue;
      p.addForce(windX + motionX, this.gravity + windY + motionY);
    }

    // Verlet integration
    for (const p of this.particles) {
      p.integrate(dt, CFG.damping);
    }

    // Constraint relaxation
    for (let iter = 0; iter < CFG.constraintIter; iter++) {
      for (const c of this.constraints) {
        c.satisfy(CFG.stiffness);
      }
    }

    // Ground collision
    for (const p of this.particles) {
      if (!p.pinned && p.pos.y > GROUND_Y - 2) {
        p.pos.y = GROUND_Y - 2;
        p.prev.y = p.pos.y + (p.pos.y - p.prev.y) * 0.2;   // friction
      }
    }
  }

  /** Get particle at grid coordinate (col, row) */
  getAt(col, row) {
    return this.particles[row * this.cols + col];
  }

  /** Get all quad faces for rendering (filled polygons) */
  getQuads() {
    const quads = [];
    for (let r = 0; r < this.rows - 1; r++) {
      for (let c = 0; c < this.cols - 1; c++) {
        quads.push([
          this.getAt(c,   r  ).pos,
          this.getAt(c+1, r  ).pos,
          this.getAt(c+1, r+1).pos,
          this.getAt(c,   r+1).pos,
        ]);
      }
    }
    return quads;
  }

  /** Tear constraints probabilistically when force is too high */
  checkTearing(maxDist) {
    this.constraints = this.constraints.filter(c => {
      const d = c.a.pos.dist(c.b.pos);
      return d < c.rest * maxDist;
    });
  }

  /** Translate entire cloth grid (for teleporting body) */
  translate(dx, dy) {
    for (const p of this.particles) {
      p.pos.x  += dx; p.pos.y  += dy;
      p.prev.x += dx; p.prev.y += dy;
    }
  }

  /** Reset cloth to a fresh grid from new origin */
  resetToOrigin(ox, oy) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const p = this.getAt(c, r);
        const x = ox + c * this.spacing;
        const y = oy + r * this.spacing;
        p.pos.set(x, y);
        p.prev.set(x, y);
        p.acc.set(0, 0);
      }
    }
  }
}

// ─── Wind Generator ───────────────────────────────────────────────────────────
/**
 * Procedural wind force for cloth simulation.
 * Uses layered sine waves for organic feel.
 */
export class WindField {
  constructor() {
    this.time      = 0;
    this.baseSpeed = CFG.windStrength;
    this.direction = 1;   // +1 right, -1 left
  }

  /** Advance and compute current wind force components */
  update(dt) {
    this.time += dt;
    const t = this.time;

    const gustX = (
      Math.sin(t * 0.7)  * 0.50 +
      Math.sin(t * 1.9)  * 0.30 +
      Math.sin(t * 4.3)  * 0.12 +
      Math.sin(t * 11.1) * 0.08
    ) * this.baseSpeed * this.direction;

    const gustY = (
      Math.sin(t * 1.1)  * 0.25 +
      Math.sin(t * 2.8)  * 0.15
    ) * this.baseSpeed * 0.3;

    return { x: gustX, y: gustY };
  }

  setDirection(dir) { this.direction = dir; }
  setStrength(s)    { this.baseSpeed = s;   }
}
