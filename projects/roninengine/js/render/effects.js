// ============================================================
//  RoninEngine — render/effects.js
//  Background, moon, fog, bloom, and post-processing effects
// ============================================================

'use strict';

import { Vec2, lerp, clamp, randomRange } from '../core/math.js';
import { VFX, CANVAS_W, CANVAS_H, GROUND_Y } from '../core/config.js';

// ─── Background Renderer ────────────────────────────────────────────────────
export class BackgroundRenderer {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');

    // Off-screen buffer for the static background (moon, sky)
    this.bgBuf    = document.createElement('canvas');
    this.bgBuf.width  = CANVAS_W;
    this.bgBuf.height = CANVAS_H;
    this.bgCtx        = this.bgBuf.getContext('2d');

    // Fog particles
    this.fogParticles = this._buildFog(80);

    // Moon phase (slow oscillation for visual interest)
    this.moonPhase = 0;

    // Blood moon corona pulse
    this.coronaPhase = 0;

    // Pre-render static background
    this._drawStaticBG();
  }

  // ─── Static background (sky + moon) ───────────────────────

  _drawStaticBG() {
    const ctx = this.bgCtx;
    const W   = CANVAS_W, H = CANVAS_H;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0,   VFX.skyTopColor);
    skyGrad.addColorStop(0.6, VFX.skyBottomColor);
    skyGrad.addColorStop(1,   '#0a0005');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Distant mountain silhouettes
    this._drawMountains(ctx, W, H);
  }

  _drawMountains(ctx, W, H) {
    ctx.fillStyle = '#000008';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.75);

    const peaks = [
      {x: 0.05, y: 0.60}, {x: 0.12, y: 0.48}, {x: 0.20, y: 0.55},
      {x: 0.28, y: 0.42}, {x: 0.38, y: 0.50}, {x: 0.46, y: 0.38},
      {x: 0.54, y: 0.52}, {x: 0.62, y: 0.44}, {x: 0.70, y: 0.57},
      {x: 0.78, y: 0.46}, {x: 0.86, y: 0.53}, {x: 0.94, y: 0.40},
      {x: 1.00, y: 0.60},
    ];

    for (const p of peaks) ctx.lineTo(p.x * W, p.y * H);
    ctx.lineTo(W, H * 0.75);
    ctx.closePath();
    ctx.fill();

    // Foreground ground plane
    const gGrad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    gGrad.addColorStop(0, '#050005');
    gGrad.addColorStop(1, '#000000');
    ctx.fillStyle = gGrad;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  }

  // ─── Moon ─────────────────────────────────────────────────

  drawMoon(ctx, time) {
    this.moonPhase   += time * 0.005;
    this.coronaPhase += time * 1.8;

    const mx = VFX.moonX;
    const my = VFX.moonY;
    const r  = VFX.moonRadius;

    ctx.save();

    // Outer corona (pulsing red aura)
    const pulseR = r * (1.15 + Math.sin(this.coronaPhase) * 0.06);
    const corona  = ctx.createRadialGradient(mx, my, r * 0.9, mx, my, pulseR * 2.2);
    corona.addColorStop(0,   'rgba(160,0,20,0.35)');
    corona.addColorStop(0.4, 'rgba(100,0,10,0.15)');
    corona.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle   = corona;
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    ctx.arc(mx, my, pulseR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Inner moon disc
    ctx.globalCompositeOperation = 'source-over';
    const moonGrd = ctx.createRadialGradient(mx - r*0.2, my - r*0.2, 0, mx, my, r);
    moonGrd.addColorStop(0,   '#ff3333');
    moonGrd.addColorStop(0.4, VFX.moonColor);
    moonGrd.addColorStop(0.85,'#5a0010');
    moonGrd.addColorStop(1,   '#200008');
    ctx.fillStyle   = moonGrd;
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fill();

    // Surface craters (static texture effect)
    ctx.globalAlpha = 0.22;
    const craters = [
      {x: mx - r*0.3, y: my - r*0.2, r: r*0.12},
      {x: mx + r*0.25, y: my + r*0.1, r: r*0.08},
      {x: mx - r*0.1, y: my + r*0.35, r: r*0.15},
      {x: mx + r*0.4,  y: my - r*0.3, r: r*0.06},
    ];
    ctx.fillStyle = '#1a000a';
    for (const c of craters) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ─── Fog ──────────────────────────────────────────────────

  _buildFog(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x    : randomRange(0, CANVAS_W),
        y    : randomRange(GROUND_Y - 80, GROUND_Y + 20),
        r    : randomRange(60, 200),
        alpha: randomRange(0.015, 0.06),
        speed: randomRange(4, 18),
        phase: randomRange(0, Math.PI * 2),
      });
    }
    return arr;
  }

  drawFog(ctx, time) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    for (const f of this.fogParticles) {
      f.x += f.speed * 0.016;
      if (f.x > CANVAS_W + f.r) f.x = -f.r;

      const alpha = f.alpha * (0.7 + Math.sin(time * 0.3 + f.phase) * 0.3);
      const grd   = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      grd.addColorStop(0, `rgba(20,0,10,${alpha})`);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── Ground mist tendrils ───────────────────────────────────

  drawGroundMist(ctx, time) {
    ctx.save();
    const mistGrad = ctx.createLinearGradient(0, GROUND_Y - 40, 0, GROUND_Y + 30);
    const a = 0.12 + Math.sin(time * 0.4) * 0.04;
    mistGrad.addColorStop(0,   'rgba(0,0,0,0)');
    mistGrad.addColorStop(0.5, `rgba(30,0,15,${a})`);
    mistGrad.addColorStop(1,   `rgba(10,0,8,${a * 0.5})`);
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, GROUND_Y - 40, CANVAS_W, 70);
    ctx.restore();
  }

  // ─── Main draw ────────────────────────────────────────────

  draw(ctx, time) {
    // Blit static bg
    ctx.drawImage(this.bgBuf, 0, 0);
    // Dynamic moon
    this.drawMoon(ctx, time);
    // Fog
    this.drawFog(ctx, time);
    // Ground mist
    this.drawGroundMist(ctx, time);
  }
}

// ─── Bloom Post-process ──────────────────────────────────────────────────────
export class BloomEffect {
  constructor(w, h, passes = 2) {
    this.passes = passes;
    this.bufs   = [];
    for (let i = 0; i < passes; i++) {
      const scale = 0.5 / (i + 1);
      const buf   = document.createElement('canvas');
      buf.width   = Math.floor(w * scale);
      buf.height  = Math.floor(h * scale);
      this.bufs.push({ canvas: buf, ctx: buf.getContext('2d'), scale });
    }
  }

  /**
   * Blit the source canvas with bloom overlay.
   * @param {CanvasRenderingContext2D} dstCtx  – main canvas ctx
   * @param {HTMLCanvasElement}        srcCanvas
   * @param {number}                   strength – 0–1
   */
  apply(dstCtx, srcCanvas, strength = 0.35) {
    for (const buf of this.bufs) {
      // Downscale
      buf.ctx.clearRect(0, 0, buf.canvas.width, buf.canvas.height);
      buf.ctx.drawImage(srcCanvas, 0, 0, buf.canvas.width, buf.canvas.height);
      // Simple box blur via repeated scale
      this._boxBlur(buf.ctx, buf.canvas.width, buf.canvas.height, 4);
    }

    for (const buf of this.bufs) {
      dstCtx.save();
      dstCtx.globalCompositeOperation = 'screen';
      dstCtx.globalAlpha = strength;
      dstCtx.drawImage(buf.canvas, 0, 0, dstCtx.canvas.width, dstCtx.canvas.height);
      dstCtx.restore();
    }
  }

  _boxBlur(ctx, w, h, radius) {
    // Shrink and expand to simulate blur
    const halfW = Math.max(1, Math.floor(w / 2));
    const halfH = Math.max(1, Math.floor(h / 2));
    const tmpC  = document.createElement('canvas');
    tmpC.width  = halfW; tmpC.height = halfH;
    const t     = tmpC.getContext('2d');
    t.drawImage(ctx.canvas, 0, 0, halfW, halfH);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tmpC, 0, 0, w, h);
  }
}

// ─── Screen vignette ──────────────────────────────────────────────────────────
export function drawVignette(ctx, w, h, alpha = 0.55) {
  const grd = ctx.createRadialGradient(w*0.5, h*0.5, h*0.2, w*0.5, h*0.5, h*0.8);
  grd.addColorStop(0,   'rgba(0,0,0,0)');
  grd.addColorStop(1,   `rgba(0,0,0,${alpha})`);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ─── Slow-motion overlay ─────────────────────────────────────────────────────
export function drawSlowMoOverlay(ctx, w, h, alpha = 0.08) {
  ctx.save();
  ctx.fillStyle = `rgba(160,200,255,${alpha})`;
  ctx.globalCompositeOperation = 'screen';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ─── Ground grid (combat arena lines) ────────────────────────────────────────
export function drawArenaFloor(ctx, w, groundY) {
  ctx.save();
  ctx.strokeStyle = 'rgba(80,0,20,0.3)';
  ctx.lineWidth   = 1;

  // Perspective grid lines
  const vanishX = w * 0.5, vanishY = groundY - 30;
  const lineCount = 20;
  for (let i = 0; i <= lineCount; i++) {
    const x = (i / lineCount) * w;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.moveTo(vanishX, vanishY);
    ctx.lineTo(x, groundY + 80);
    ctx.stroke();
  }

  // Horizontal lines
  for (let i = 0; i < 5; i++) {
    const t  = i / 4;
    const y  = groundY + t * 80;
    const xL = lerp(vanishX, 0, t * 0.8);
    const xR = lerp(vanishX, w, t * 0.8);
    ctx.globalAlpha = 0.12 * (1 - t);
    ctx.beginPath();
    ctx.moveTo(xL, y);
    ctx.lineTo(xR, y);
    ctx.stroke();
  }

  ctx.restore();
}
