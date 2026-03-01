'use strict';

class VerletIntegrator {
  /**
   */
  constructor(opts = {}) {
    /** @type {number} Velocity multiplier applied each step. */
    this.damping = opts.damping  ?? 0.985;
    /** @type {number} Gravitational acceleration (px/s). */
    this.gravity  = opts.gravity  ?? 0;
    /** @type {number} Maximum speed clamp (px/s). */
    this.maxSpeed = opts.maxSpeed ?? 800;
  }

  integrate(particles, dt) {
    const dt2 = dt * dt;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.pinned || p.dead) continue;
      this._integrateParticle(p, dt, dt2);
    }
  }

  _integrateParticle(p, dt, dt2) {
    const px = p.pos.x;
    const py = p.pos.y;

    // Implied velocity from position difference
    let vx = (px - p.prevPos.x) * this.damping;
    let vy = (py - p.prevPos.y) * this.damping;

    // Clamp speed to avoid numerical explosion
    const speedSq = vx * vx + vy * vy;
    const maxV = this.maxSpeed * dt;
    if (speedSq > maxV * maxV) {
      const inv = maxV / Math.sqrt(speedSq);
      vx *= inv;
      vy *= inv;
    }

    // Force  dt / mass  (mass defaults to 1)
    const invMass = p.invMass ?? 1;
    const ax = (p.force.x + 0)             * dt2 * invMass;
    const ay = (p.force.y + this.gravity)  * dt2 * invMass;

    // Advance position
    p.prevPos.x = px;
    p.prevPos.y = py;
    p.pos.x = px + vx + ax;
    p.pos.y = py + vy + ay;
  }

  applyBoundary(particles, w, h, margin = 10) {
    const restitution = 0.4;
    const minX = margin, maxX = w - margin;
    const minY = margin, maxY = h - margin;

    for (const p of particles) {
      if (p.pinned || p.dead) continue;

      if (p.pos.x < minX) {
        const vx = p.pos.x - p.prevPos.x;
        p.pos.x = minX;
        p.prevPos.x = minX + vx * restitution;
      } else if (p.pos.x > maxX) {
        const vx = p.pos.x - p.prevPos.x;
        p.pos.x = maxX;
        p.prevPos.x = maxX + vx * restitution;
      }

      if (p.pos.y < minY) {
        const vy = p.pos.y - p.prevPos.y;
        p.pos.y = minY;
        p.prevPos.y = minY + vy * restitution;
      } else if (p.pos.y > maxY) {
        const vy = p.pos.y - p.prevPos.y;
        p.pos.y = maxY;
        p.prevPos.y = maxY + vy * restitution;
      }
    }
  }

  applyCircularSoftBoundary(particles, cx, cy, radius) {
    const restitution = 0.35;
    const r2 = radius * radius;
    for (const p of particles) {
      if (p.pinned || p.dead) continue;
      const dx = p.pos.x - cx;
      const dy = p.pos.y - cy;
      const distSq = dx * dx + dy * dy;
      if (distSq <= r2) continue;

      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;

      // Push back inside
      p.pos.x = cx + nx * radius;
      p.pos.y = cy + ny * radius;

      // Reflect velocity component along normal
      const vx = p.pos.x - p.prevPos.x;
      const vy = p.pos.y - p.prevPos.y;
      const vDotN = vx * nx + vy * ny;
      p.prevPos.x = p.pos.x - (vx - 2 * vDotN * nx * restitution);
      p.prevPos.y = p.pos.y - (vy - 2 * vDotN * ny * restitution);
    }
  }

  freezeParticle(p) {
    p.prevPos.x = p.pos.x;
    p.prevPos.y = p.pos.y;
  }

  freezeOutOfBounds(particles, w, h) {
    for (const p of particles) {
      if (p.pinned || p.dead) continue;
      if (p.pos.x < 0 || p.pos.x > w || p.pos.y < 0 || p.pos.y > h) {
        this.freezeParticle(p);
      }
    }
  }

  getAverageKineticEnergy(particles, dt) {
    if (!particles.length || dt <= 0) return 0;
    let total = 0;
    let count = 0;
    const invDt2 = 1 / (dt * dt);
    for (const p of particles) {
      if (p.dead) continue;
      const vx = (p.pos.x - p.prevPos.x) * invDt2;
      const vy = (p.pos.y - p.prevPos.y) * invDt2;
      total += 0.5 * (p.mass ?? 1) * (vx * vx + vy * vy);
      count++;
    }
    return count ? total / count : 0;
  }

  // ---- Setters ----

  /** @param {number} v */
  setDamping(v)   { this.damping  = v; }
  /** @param {number} v */
  setGravity(v)   { this.gravity  = v; }
  /** @param {number} v */
  setMaxSpeed(v)  { this.maxSpeed = v; }
}
