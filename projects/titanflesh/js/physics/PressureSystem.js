'use strict';
class PressureSystem {
  /**
   */
  constructor(opts = {}) {
    this.strength  = opts.strength  ?? 0.4;
    this.passes    = opts.passes    ?? 1;
    this.enabled   = opts.enabled  !== false;
    this.restArea  = 0;
    this.currentArea = 0;
    this.minAreaRatio = 0.25;
    this.maxAreaRatio = 2.5;
    this.isCompressed    = false;
    this.isOverPressured = false;
  }

  calibrate(boundaryLoop) {
    if (!boundaryLoop || boundaryLoop.length < 3) {
      this.restArea = 0;
      return;
    }
    this.restArea    = Math.abs(this._computeArea(boundaryLoop));
    this.currentArea = this.restArea;
    this.isCompressed    = false;
    this.isOverPressured = false;
  }

  solve(boundaryLoop) {
    if (!this.enabled || !boundaryLoop || boundaryLoop.length < 3) return;
    if (this.restArea < 1e-6) return;
    for (let pass = 0; pass < this.passes; pass++) {
      this._pressurePass(boundaryLoop);
    }
  }

  _pressurePass(loop) {
    this.currentArea = this._computeArea(loop);
    const ratio = this.currentArea / this.restArea;

    this.isCompressed    = ratio < 0.5;
    this.isOverPressured = ratio > 1.6;

    const clampedRatio = Math.max(this.minAreaRatio, Math.min(this.maxAreaRatio, ratio));
    const pressureScale = this.strength * (1 - clampedRatio);
    if (Math.abs(pressureScale) < 1e-9) return;

    const n = loop.length;
    for (let i = 0; i < n; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % n];
      if (a.pinned && b.pinned) continue;

      const ex = b.pos.x - a.pos.x;
      const ey = b.pos.y - a.pos.y;
      const nx = -ey;
      const ny =  ex;
      const edgeLen = Math.sqrt(nx * nx + ny * ny);
      if (edgeLen < 1e-9) continue;

      const invLen = 1 / edgeLen;
      const fx = nx * invLen * pressureScale * edgeLen * 0.5;
      const fy = ny * invLen * pressureScale * edgeLen * 0.5;

      if (!a.pinned) { a.force.x += fx; a.force.y += fy; }
      if (!b.pinned) { b.force.x += fx; b.force.y += fy; }
    }
  }

  _computeArea(loop) {
    let area = 0;
    const n  = loop.length;
    for (let i = 0; i < n; i++) {
      const a = loop[i];
      const b = loop[(i + 1) % n];
      area += a.pos.x * b.pos.y - b.pos.x * a.pos.y;
    }
    return area * 0.5;
  }

  _edgeNormal(a, b) {
    const ex  = b.pos.x - a.pos.x;
    const ey  = b.pos.y - a.pos.y;
    const len = Math.sqrt(ex * ex + ey * ey);
    if (len < 1e-9) return { x: 0, y: 0 };
    return { x: -ey / len, y: ex / len };
  }

  /**
   * Return extended area statistics for HUD and diagnostics.
   */
  getAreaStats() {
    const ratio = this.restArea > 0 ? this.currentArea / this.restArea : 1;
    return {
      restArea:        this.restArea,
      currentArea:     this.currentArea,
      ratio:           ratio,
      isCompressed:    this.isCompressed,
      isOverPressured: this.isOverPressured
    };
  }

  /**
   * Set the pressure strength multiplier.
   */
  setStrength(v) { this.strength = Math.max(0, v); }

  /**
   * Enable or disable the pressure system.
   */
  setEnabled(v) { this.enabled = Boolean(v); }

  /**
   * Set number of accumulation passes per timestep.
   */
  setPasses(n) { this.passes = Math.max(1, n | 0); }
}
