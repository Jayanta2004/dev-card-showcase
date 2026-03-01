'use strict';

/**
 * Renders a pressure heatmap overlay on the triangulated mesh.
 * Draws per-triangle color coded by pressure ratio, and radial
 * hot-spot glows centered on high-pressure particles.
 */
class PressureRenderer {
  constructor() {
    this._enabled = true;
    this._opacity = 0.65;
    this._hotSpotRadius = 18;
  }

  /**
   * Render pressure overlay onto the given 2D context.
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} state - Render state from TitanFlesh.buildRenderState()
   */
  render(ctx, state) {
    if (!this._enabled || !state) return;
    ctx.save();
    ctx.globalAlpha = this._opacity;
    ctx.globalCompositeOperation = 'screen';
    this._drawTrianglePressure(ctx, state.triangles);
    ctx.globalCompositeOperation = 'source-over';
    this._drawParticleHotSpots(ctx, state.particles);
    ctx.restore();
  }

  /** Color-fill each triangle based on its pressure ratio. */
  _drawTrianglePressure(ctx, triangles) {
    if (!triangles) return;
    for (const t of triangles) {
      if (!t.a || !t.b || !t.c) continue;
      const p = MathUtils.clamp(t.pressure ?? 0, 0, 1);
      if (p < 0.05) continue;
      const color = MathUtils.pressureColor(p);
      ctx.beginPath();
      ctx.moveTo(t.a.x, t.a.y);
      ctx.lineTo(t.b.x, t.b.y);
      ctx.lineTo(t.c.x, t.c.y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = this._opacity * (0.3 + p * 0.55);
      ctx.fill();
    }
    ctx.globalAlpha = this._opacity;
  }

  /** Draw radial gradient hot-spots for high-pressure particles. */
  _drawParticleHotSpots(ctx, particles) {
    if (!particles) return;
    for (const p of particles) {
      const pressure = MathUtils.clamp(p.pressure ?? 0, 0, 1);
      if (pressure < 0.15) continue;
      const r = this._hotSpotRadius * (0.6 + pressure * 0.8);
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      const inner = this._pressureInnerColor(pressure);
      grd.addColorStop(0, inner);
      grd.addColorStop(0.5, `rgba(180,20,50,${pressure * 0.25})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.globalAlpha = this._opacity * (0.4 + pressure * 0.5);
      ctx.fill();
    }
    ctx.globalAlpha = this._opacity;
  }

  _pressureInnerColor(t) {
    if (t < 0.4) return `rgba(80,0,120,${t * 0.8})`;
    if (t < 0.7) return `rgba(180,0,60,${t * 0.7})`;
    return `rgba(255,60,20,${t * 0.65})`;
  }

  setOpacity(v) { this._opacity = MathUtils.clamp(v, 0, 1); }
  setEnabled(v) { this._enabled = !!v; }
  setHotSpotRadius(v) { this._hotSpotRadius = Math.max(4, v); }
  get enabled() { return this._enabled; }
}
