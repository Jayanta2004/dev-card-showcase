'use strict';

class ConstraintSolver {
  constructor(opts = {}) {
    /** @type {number} Gauss-Seidel solve iterations. */
    this.iterations = opts.iterations ?? 8;

    this._lambdas = new Map();

    /** Whether to alternate solve direction each iteration (improves convergence). */
    this._alternateDir = true;

    /** Internal iteration counter (used for alternation). */
    this._iterCount = 0;
  }

  solve(particles, springs, dt) {
    this._initLambdas(springs);
    const active = springs.filter(s => !s.torn);

    for (let iter = 0; iter < this.iterations; iter++) {
      if (this._alternateDir && iter % 2 === 1) {
        for (let i = active.length - 1; i >= 0; i--) {
          this._solveXPBD(active[i], dt);
          this._iterCount++;
        }
      } else {
        for (let i = 0; i < active.length; i++) {
          this._solveXPBD(active[i], dt);
          this._iterCount++;
        }
      }
    }
  }

  _initLambdas(springs) {
    this._lambdas.clear();
    for (let i = 0; i < springs.length; i++) {
      this._lambdas.set(springs[i].id, 0);
    }
  }

  _solveXPBD(spring, dt) {
    const a = spring.a;
    const b = spring.b;
    if ((a.pinned && b.pinned) || a.dead || b.dead) return;

    const dx  = b.pos.x - a.pos.x;
    const dy  = b.pos.y - a.pos.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1e-9) return;

    const C = len - spring.restLength;
    if (Math.abs(C) < 1e-7) return;

    const dt2  = dt * dt;
    const alpha = (1 / (spring.stiffness + 1e-12)) / dt2;

    const wA   = a.pinned ? 0 : (a.invMass ?? 1);
    const wB   = b.pinned ? 0 : (b.invMass ?? 1);
    const wSum = wA + wB + alpha;
    if (wSum < 1e-12) return;

    const prevLambda = this._lambdas.get(spring.id) ?? 0;
    const dLambda    = (-C - alpha * prevLambda) / wSum;
    this._lambdas.set(spring.id, prevLambda + dLambda);

    const invLen = 1 / len;
    const nx = dx * invLen;
    const ny = dy * invLen;

    if (!a.pinned) {
      a.pos.x -= wA * dLambda * nx;
      a.pos.y -= wA * dLambda * ny;
    }
    if (!b.pinned) {
      b.pos.x += wB * dLambda * nx;
      b.pos.y += wB * dLambda * ny;
    }
  }

  solveMinDistance(a, b, minDist, maxDist = 0) {
    const dx   = b.pos.x - a.pos.x;
    const dy   = b.pos.y - a.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1e-9) return;

    let correction = 0;
    if (minDist > 0 && dist < minDist) {
      correction = dist - minDist;
    } else if (maxDist > 0 && dist > maxDist) {
      correction = dist - maxDist;
    } else {
      return;
    }

    const wA   = a.pinned ? 0 : (a.invMass ?? 1);
    const wB   = b.pinned ? 0 : (b.invMass ?? 1);
    const wSum = wA + wB;
    if (wSum < 1e-12) return;

    const nx   = dx / dist;
    const ny   = dy / dist;
    const half = correction / wSum;

    if (!a.pinned) {
      a.pos.x -= wA * half * nx;
      a.pos.y -= wA * half * ny;
    }
    if (!b.pinned) {
      b.pos.x -= wB * half * nx;
      b.pos.y -= wB * half * ny;
    }
  }

  getResidual(springs) {
    let sum   = 0;
    let count = 0;
    for (const s of springs) {
      if (s.torn || s.restLength < 1e-9) continue;
      const dx  = s.b.pos.x - s.a.pos.x;
      const dy  = s.b.pos.y - s.a.pos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      sum += Math.abs(len - s.restLength) / s.restLength;
      count++;
    }
    return count ? sum / count : 0;
  }

  bendingConstraint(a, b, c, restAngle = 0, stiffness = 0.001) {
    const ax = a.pos.x - b.pos.x;
    const ay = a.pos.y - b.pos.y;
    const cx = c.pos.x - b.pos.x;
    const cy = c.pos.y - b.pos.y;
    const la = Math.sqrt(ax * ax + ay * ay);
    const lc = Math.sqrt(cx * cx + cy * cy);
    if (la < 1e-9 || lc < 1e-9) return;

    const dot   = (ax * cx + ay * cy) / (la * lc);
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
    const delta = angle - restAngle;
    if (Math.abs(delta) < 1e-4) return;

    const corr = stiffness * delta;
    const nax  = ax / la;
    const nay  = ay / la;
    const ncx  = cx / lc;
    const ncy  = cy / lc;

    if (!a.pinned) {
      a.pos.x -= corr * nax;
      a.pos.y -= corr * nay;
    }
    if (!c.pinned) {
      c.pos.x -= corr * ncx;
      c.pos.y -= corr * ncy;
    }
    if (!b.pinned) {
      b.pos.x += corr * (nax + ncx) * 0.5;
      b.pos.y += corr * (nay + ncy) * 0.5;
    }
  }

  // ---- Configuration ----

  setIterations(n) {
    this.iterations = Math.max(1, n | 0);
  }

  setAlternateDir(v) {
    this._alternateDir = Boolean(v);
  }

  /** Clear lambda accumulator (call when rebuilding spring set). */
  clearLambdas() {
    this._lambdas.clear();
  }
}
