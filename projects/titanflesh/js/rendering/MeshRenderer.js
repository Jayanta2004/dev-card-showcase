'use strict';

class MeshRenderer {
  constructor(canvas) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = canvas.getContext('2d');

    this._glow = document.createElement('canvas');
    this._gctx = this._glow.getContext('2d');
    this._w = 0;
    this._h = 0;
  }

  /**
   * Update internal size cache and resize the glow buffer.
   */
  resize(w, h) {
    this._w = w;
    this._h = h;
    this._glow.width = w;
    this._glow.height = h;
  }

  /**
   * Render the full mesh to the provided context.
   */
  render(ctx, state) {
    if (!state || !state.triangles) return;
    const { triangles, boundaryLoop, tearFlash, time, particles, ripples } = state;
    const t = time ?? 0;

    ctx.save();
    this._drawTriangles(ctx, triangles, t);
    this._drawSpikes(ctx, particles);
    this._drawBoundaryGlow(ctx, boundaryLoop, t);
    if (ripples && ripples.length) {
      this._drawRippleRings(ctx, ripples, t);
    }
    if (tearFlash > 0) {
      this._drawTearFlash(ctx, tearFlash);
    }
    ctx.restore();
  }

  _drawTriangles(ctx, triangles, time) {
    for (const tri of triangles) {
      const { a, b, c } = tri;
      if (!a || !b || !c) continue;

      const pressure = MathUtils.clamp(tri.pressureRatio ?? 1, 0, 2);
      const stress = MathUtils.clamp(
        ((a.stressLevel ?? 0) + (b.stressLevel ?? 0) + (c.stressLevel ?? 0)) / 3,
        0, 1
      );

      const shimmer = Math.sin(time * 0.0023 + (a.x + b.x + c.x) * 0.002) * 0.06;

      const r = Math.round(MathUtils.lerp(55, 200, stress));
      const g = Math.round(MathUtils.lerp(8, 45, Math.min(pressure, 1))) + Math.round(shimmer * 20);
      const bl = Math.round(MathUtils.lerp(8, 20, pressure * 0.3));
      const alpha = MathUtils.clamp(0.68 + stress * 0.22 + shimmer, 0, 1);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.closePath();
      ctx.fillStyle = `rgba(${r},${Math.max(0, g)},${bl},${alpha.toFixed(2)})`;
      ctx.fill();

      if (stress > 0.35) {
        const edgeAlpha = (stress - 0.35) * 1.5;
        ctx.strokeStyle = `rgba(255,${Math.round(60 + stress * 80)},50,${edgeAlpha.toFixed(2)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  _drawSpikes(ctx, particles) {
    if (!particles || !particles.length) return;
    ctx.save();
    for (const p of particles) {
      if (!p.spike || p.spike < 0.1) continue;
      const len = p.spike * 18;
      const glow = p.glow ?? 0;
      const angle = p.spikeAngle ?? 0;
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      const x1 = p.x - nx * 3;
      const y1 = p.y - ny * 3;
      const x2 = p.x + nx * len;
      const y2 = p.y + ny * len;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(220,50,50,${(0.4 + glow * 0.4).toFixed(2)})`;
      ctx.lineWidth = 1 + p.spike * 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x2, y2, 1 + p.spike, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,80,60,${(0.5 + glow * 0.4).toFixed(2)})`;
      ctx.fill();
    }
    ctx.restore();
  }

  _drawBoundaryGlow(ctx, boundaryLoop, time) {
    if (!boundaryLoop || boundaryLoop.length < 3) return;

    const pulse = 0.55 + 0.45 * Math.sin(time * 0.0025);
    const pulse2 = 0.40 + 0.60 * Math.sin(time * 0.0040 + 1.5);

    // Outer glow pass
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(boundaryLoop[0].x, boundaryLoop[0].y);
    for (let i = 1; i < boundaryLoop.length; i++) {
      ctx.lineTo(boundaryLoop[i].x, boundaryLoop[i].y);
    }
    ctx.closePath();
    ctx.shadowColor = 'rgba(200,20,40,0.9)';
    ctx.shadowBlur = 16 * pulse;
    ctx.strokeStyle = `rgba(200,35,55,${pulse.toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Inner fine-line pass
    ctx.beginPath();
    ctx.moveTo(boundaryLoop[0].x, boundaryLoop[0].y);
    for (let i = 1; i < boundaryLoop.length; i++) {
      ctx.lineTo(boundaryLoop[i].x, boundaryLoop[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(255,80,80,${(pulse2 * 0.4).toFixed(2)})`;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  /**
   * Draw translucent expanding rings for active ripple wavefronts.
   */
  _drawRippleRings(ctx, ripples, time) {
    ctx.save();
    for (const r of ripples) {
      if (!r || r.dead) continue;
      const alpha = MathUtils.clamp(r.amplitude * 0.35, 0, 0.5);
      if (alpha < 0.01) continue;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,100,80,${alpha.toFixed(2)})`;
      ctx.lineWidth = 2 + r.amplitude * 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawTearFlash(ctx, tearFlash) {
    const alpha = MathUtils.clamp(tearFlash * 0.45, 0, 0.45);
    const cx = this._w * 0.5;
    const cy = this._h * 0.5;
    const r = Math.max(this._w, this._h) * 0.6;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grd.addColorStop(0, `rgba(255,80,50,${alpha})`);
    grd.addColorStop(0.5, `rgba(180,20,30,${(alpha * 0.5).toFixed(2)})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, this._w, this._h);
  }
}
