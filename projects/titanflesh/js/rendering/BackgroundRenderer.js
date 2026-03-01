'use strict';

/**
 * Renders the animated void background:
 * - Deep-space gradient fill
 * - Twinkling distant stars (small, high frequency)
 * - Slow-moving nebula clouds (radial gradient blobs)
 * - Slow pulsing atmospheric haze
 */
class BackgroundRenderer {
  constructor() {
    this._stars = [];
    this._nebulae = [];
    this._initialized = false;
    this._w = 0;
    this._h = 0;
  }

  /** Lazily initialize star and nebula arrays based on canvas size. */
  _init(ctx) {
    const w = ctx.canvas.width, h = ctx.canvas.height;
    if (this._initialized && w === this._w && h === this._h) return;
    this._w = w; this._h = h;
    this._initStars(w, h);
    this._initNebulae(w, h);
    this._initialized = true;
  }

  _initStars(w, h) {
    this._stars = [];
    const count = Math.round((w * h) / 3200);
    for (let i = 0; i < count; i++) {
      this._stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.6,
        alpha: 0.15 + Math.random() * 0.55
      });
    }
  }

  _initNebulae(w, h) {
    this._nebulae = [];
    const count = 5 + Math.floor(Math.random() * 4);
    const colors = [
      [80, 10, 100], [30, 0, 80], [100, 20, 20],
      [20, 10, 60], [60, 0, 80], [40, 5, 60]
    ];
    for (let i = 0; i < count; i++) {
      const c = colors[i % colors.length];
      this._nebulae.push({
        x: 0.1 * w + Math.random() * 0.8 * w,
        y: 0.1 * h + Math.random() * 0.8 * h,
        rx: 80 + Math.random() * 180,
        ry: 60 + Math.random() * 140,
        r: c[0], g: c[1], b: c[2],
        alpha: 0.03 + Math.random() * 0.05,
        driftX: (Math.random() - 0.5) * 0.008,
        driftY: (Math.random() - 0.5) * 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render(ctx, time) {
    this._init(ctx);
    const w = this._w, h = this._h;

    // Void fill gradient
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    grad.addColorStop(0, '#0c030f');
    grad.addColorStop(0.5, '#070309');
    grad.addColorStop(1, '#020103');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Nebula clouds
    this._renderNebulae(ctx, time);

    // Stars
    this._renderStars(ctx, time);
  }

  _renderNebulae(ctx, time) {
    ctx.save();
    for (const n of this._nebulae) {
      const ox = Math.sin(time * 0.0002 + n.phase) * 30 * n.driftX * 100;
      const oy = Math.cos(time * 0.0003 + n.phase) * 20 * n.driftY * 100;
      const pulse = 1 + 0.08 * Math.sin(time * 0.00045 + n.phase);
      const x = n.x + ox, y = n.y + oy;
      const r = Math.max(n.rx, n.ry) * pulse;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.alpha * 1.5})`);
      grd.addColorStop(0.5, `rgba(${n.r},${n.g},${n.b},${n.alpha * 0.6})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.scale(n.rx / n.ry, 1);
      ctx.beginPath();
      ctx.arc(x * (n.ry / n.rx), y, r * (n.ry / n.rx), 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  _renderStars(ctx, time) {
    ctx.save();
    for (const s of this._stars) {
      const twinkle = s.alpha * (0.6 + 0.4 * Math.sin(time * s.speed * 0.002 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,200,230,${twinkle.toFixed(3)})`;
      ctx.fill();
    }
    ctx.restore();
  }
}
