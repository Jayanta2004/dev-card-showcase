'use strict';

class DebugRenderer {
  constructor() {
    /** @type {Array} Pre-computed tear markers carried from last state. */
    this._tearMarkers = [];
  }

  render(ctx, state) {
    if (!state) return;
    ctx.save();
    this._drawSprings(ctx, state);
    this._drawParticles(ctx, state);
    this._drawBoundaryLoop(ctx, state);
    this._drawVelocities(ctx, state);
    this._drawTearMarkers(ctx, state);
    if (state.showForces) {
      this._drawForceVectors(ctx, state);
    }
    ctx.restore();
  }

  _drawSprings(ctx, state) {
    if (!state.springs) return;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([]);

    for (const s of state.springs) {
      if (s.torn) continue;
      let color;
      switch (s.type) {
        case SPRING_TYPE?.EDGE:
          color = this._stressColor(s.stressRatio, '#22aa44', '#ffaa00', '#ff2200');
          break;
        case SPRING_TYPE?.STRUCTURAL:
          color = 'rgba(60,100,160,0.5)';
          break;
        case SPRING_TYPE?.DIAGONAL:
          color = 'rgba(80,60,120,0.4)';
          break;
        default:
          color = 'rgba(120,60,60,0.35)';
      }
      ctx.beginPath();
      ctx.moveTo(s.ax, s.ay);
      ctx.lineTo(s.bx, s.by);
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(255,40,40,0.5)';
    ctx.lineWidth   = 0.6;
    for (const s of state.springs) {
      if (!s.torn) continue;
      ctx.beginPath();
      ctx.moveTo(s.ax, s.ay);
      ctx.lineTo(s.bx, s.by);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  _stressColor(t, lo, mid, hi) {
    t = MathUtils.clamp(t, 0, 1);
    if (t < 0.5) {
      const u = t * 2;
      return this._blendCssColor(lo, mid, u);
    }
    const u = (t - 0.5) * 2;
    return this._blendCssColor(mid, hi, u);
  }

  _blendCssColor(a, b, t) {
    const pa = this._parseCss(a);
    const pb = this._parseCss(b);
    if (!pa || !pb) return a;
    const r = Math.round(pa.r + (pb.r - pa.r) * t);
    const g = Math.round(pa.g + (pb.g - pa.g) * t);
    const bl = Math.round(pa.b + (pb.b - pa.b) * t);
    const al = (pa.a + (pb.a - pa.a) * t).toFixed(2);
    return `rgba(${r},${g},${bl},${al})`;
  }

  _parseCss(c) {
    const m = c.match(/\d+\.?\d*/g);
    if (!m || m.length < 3) return null;
    return {
      r: +m[0],
      g: +m[1],
      b: +m[2],
      a: m.length > 3 ? +m[3] : 1
    };
  }

  _drawParticles(ctx, state) {
    if (!state.particles) return;
    const TWO_PI = Math.PI * 2;
    for (const p of state.particles) {
      const stress = MathUtils.clamp(p.stress ?? 0, 0, 1);
      const radius = 4 + stress * 4;
      const rc     = Math.round(40 + stress * 200);
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, TWO_PI);
      ctx.fillStyle   = `rgba(${rc},${Math.round(20 + stress * 40)},20,0.65)`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,100,100,0.4)';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }
  }

  _drawBoundaryLoop(ctx, state) {
    const bl = state.boundaryLoop;
    if (!bl || bl.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(bl[0].x, bl[0].y);
    for (let i = 1; i < bl.length; i++) {
      ctx.lineTo(bl[i].x, bl[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,180,0,0.65)';
    ctx.lineWidth   = 1.4;
    ctx.stroke();

    const TWO_PI = Math.PI * 2;
    for (const p of bl) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, TWO_PI);
      ctx.fillStyle = 'rgba(255,200,50,0.7)';
      ctx.fill();
    }
  }

  _drawVelocities(ctx, state) {
    if (!state.particles) return;
    ctx.strokeStyle = 'rgba(100,200,255,0.5)';
    ctx.lineWidth   = 0.7;
    for (const p of state.particles) {
      if (!p.vel) continue;
      const len = Math.sqrt(p.vel.x * p.vel.x + p.vel.y * p.vel.y);
      if (len < 0.5) continue;
      const scale = Math.min(len * 2, 20);
      const nx    = p.vel.x / len;
      const ny    = p.vel.y / len;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + nx * scale, p.y + ny * scale);
      ctx.stroke();
    }
  }

  _drawTearMarkers(ctx, state) {
    if (!state.tearMarkers) return;
    const now = Date.now();
    for (const tm of state.tearMarkers) {
      const age   = (now - tm.time) * 0.001;
      if (age > 2) continue;
      const alpha = MathUtils.clamp(1 - age * 0.5, 0, 1);
      const s     = 6 + age * 8;

      ctx.beginPath();
      ctx.moveTo(tm.x, tm.y - s);
      ctx.lineTo(tm.x + s, tm.y + s);
      ctx.lineTo(tm.x - s, tm.y + s);
      ctx.closePath();
      ctx.strokeStyle = `rgba(255,80,80,${alpha.toFixed(2)})`;
      ctx.lineWidth   = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tm.x, tm.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,100,50,${alpha.toFixed(2)})`;
      ctx.fill();
    }
  }

  _drawForceVectors(ctx, state) {
    if (!state.particles) return;
    ctx.strokeStyle = 'rgba(60,255,120,0.45)';
    ctx.lineWidth   = 0.6;
    for (const p of state.particles) {
      if (!p.force) continue;
      const len = Math.sqrt(p.force.x * p.force.x + p.force.y * p.force.y);
      if (len < 0.1) continue;
      const scale = Math.min(len * 0.15, 18);
      const nx    = p.force.x / len;
      const ny    = p.force.y / len;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + nx * scale, p.y + ny * scale);
      ctx.stroke();
    }
  }
}
