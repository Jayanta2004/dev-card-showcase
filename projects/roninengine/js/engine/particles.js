// ============================================================
//  RoninEngine — engine/particles.js
//  Lightweight spark, blood and ash particle system
// ============================================================

'use strict';

import { Vec2, clamp, randomRange } from '../core/math.js';
import { PARTICLES as CFG, VFX, GROUND_Y }      from '../core/config.js';

// ─── Particle types ───────────────────────────────────────────────────────────
const TYPE_SPARK = 0;
const TYPE_BLOOD = 1;
const TYPE_ASH   = 2;

// ─── Single Particle ──────────────────────────────────────────────────────────
class Particle {
  constructor() { this.reset(); }

  reset() {
    this.active  = false;
    this.type    = TYPE_SPARK;
    this.pos     = Vec2.zero();
    this.vel     = Vec2.zero();
    this.acc     = Vec2.zero();
    this.life    = 0;
    this.maxLife = 1;
    this.size    = 2;
    this.alpha   = 1;
    this.color   = '#ffffff';
    this.rot     = 0;
    this.rotVel  = 0;
    this.trail   = null;
  }

  get t()   { return clamp(1 - this.life / this.maxLife, 0, 1); }
  get alive() { return this.active && this.life > 0; }
}

// ─── Particle System ──────────────────────────────────────────────────────────
export class ParticleSystem {
  constructor() {
    this._sparks  = this._allocPool(CFG.maxSparks);
    this._bloods  = this._allocPool(CFG.maxBlood);
    this._ashes   = this._allocPool(CFG.maxAsh);
  }

  _allocPool(n) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(new Particle());
    return arr;
  }

  _acquire(pool) {
    // First pass: find inactive
    for (const p of pool) {
      if (!p.active) return p;
    }
    // Evict oldest (smallest remaining life)
    let oldest = pool[0];
    for (const p of pool) {
      if (p.life < oldest.life) oldest = p;
    }
    oldest.reset();
    return oldest;
  }

  // ─── Emitters ────────────────────────────────────────────

  /**
   * Emit metal clash sparks at a world position.
   *
   * @param {Vec2}   pos       – world position
   * @param {Vec2}   normal    – SAT contact normal
   * @param {number} intensity – 0–1 (scales count and speed)
   * @param {number} count
   */
  emitSparks(pos, normal, intensity = 1, count = 12) {
    const speed  = CFG.sparkSpeed * intensity;
    const nAngle = Math.atan2(normal.y, normal.x);

    for (let i = 0; i < count; i++) {
      const p = this._acquire(this._sparks);
      const spreadAngle = nAngle + randomRange(-0.9, 0.9);
      const spd         = randomRange(speed * 0.3, speed);

      p.active   = true;
      p.type     = TYPE_SPARK;
      p.pos.setV(pos);
      p.vel.set(Math.cos(spreadAngle) * spd, Math.sin(spreadAngle) * spd);
      p.acc.set(0, 400);      // gravity
      p.life     = randomRange(CFG.sparkLife * 0.5, CFG.sparkLife);
      p.maxLife  = p.life;
      p.size     = randomRange(1.5, 3.5) * intensity;
      p.alpha    = 1;
      p.color    = VFX.sparkColors[Math.floor(Math.random() * VFX.sparkColors.length)];
      p.rot      = Math.random() * Math.PI * 2;
      p.rotVel   = randomRange(-8, 8);
      p.trail    = [];
    }
  }

  /**
   * Emit blood spray.
   *
   * @param {Vec2}   pos       – hit position
   * @param {Vec2}   dir       – direction of hit force
   * @param {number} amount    – relative amount [0–1]
   */
  emitBlood(pos, dir, amount = 1) {
    const count = Math.floor(amount * 20);
    const angle = Math.atan2(dir.y, dir.x);

    for (let i = 0; i < count; i++) {
      const p = this._acquire(this._bloods);
      const a = angle + randomRange(-0.6, 0.6);
      const s = randomRange(60, 280) * amount;

      p.active   = true;
      p.type     = TYPE_BLOOD;
      p.pos.setV(pos);
      p.vel.set(Math.cos(a) * s, Math.sin(a) * s);
      p.acc.set(0, CFG.bloodGravity);
      p.life     = randomRange(CFG.bloodLife * 0.4, CFG.bloodLife);
      p.maxLife  = p.life;
      p.size     = randomRange(2, 5) * amount;
      p.alpha    = 1;
      p.color    = VFX.bloodColor;
      p.rot      = Math.random() * Math.PI * 2;
      p.rotVel   = randomRange(-3, 3);
      p.trail    = null;
    }
  }

  /**
   * Emit ash / dust (passive ambient)
   *
   * @param {Vec2} area  – center of emit area
   * @param {number} count
   */
  emitAsh(area, count = 3) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire(this._ashes);
      p.active   = true;
      p.type     = TYPE_ASH;
      p.pos.set(area.x + randomRange(-80, 80), area.y + randomRange(-20, 20));
      p.vel.set(randomRange(-CFG.ashDrift, CFG.ashDrift), randomRange(-8, -30));
      p.acc.set(randomRange(-4, 4), 3);
      p.life     = randomRange(CFG.ashLife * 0.5, CFG.ashLife);
      p.maxLife  = p.life;
      p.size     = randomRange(1, 3);
      p.alpha    = randomRange(0.3, 0.7);
      p.color    = '#555555';
      p.rot      = Math.random() * Math.PI * 2;
      p.rotVel   = randomRange(-1, 1);
      p.trail    = null;
    }
  }

  // ─── Update ──────────────────────────────────────────────
  update(dt) {
    this._updatePool(this._sparks, dt);
    this._updatePool(this._bloods, dt);
    this._updatePool(this._ashes,  dt);
  }

  _updatePool(pool, dt) {
    for (const p of pool) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) { p.active = false; continue; }

      // Physics step
      p.vel.addSelf(p.acc.mul(dt));
      p.pos.addSelf(p.vel.mul(dt));
      p.rot += p.rotVel * dt;

      // Air resistance
      if (p.type === TYPE_SPARK) {
        p.vel.mulSelf(0.94);
      } else if (p.type === TYPE_ASH) {
        p.vel.mulSelf(0.98);
      }

      // Ground bounce for sparks
      if (p.type === TYPE_SPARK && p.pos.y >= GROUND_Y) {
        p.pos.y  = GROUND_Y;
        p.vel.y *= -0.3;
        p.vel.x *=  0.6;
        if (Math.abs(p.vel.y) < 10) p.vel.y = 0;
      }

      // Blood splatters on ground
      if (p.type === TYPE_BLOOD && p.pos.y >= GROUND_Y) {
        p.pos.y   = GROUND_Y;
        p.vel.y   = 0;
        p.vel.x  *= 0.4;
        p.acc.y   = 0;
        p.life    = Math.min(p.life, 0.3);
      }

      // Trail recording for sparks
      if (p.type === TYPE_SPARK && p.trail !== null) {
        p.trail.push(p.pos.clone());
        if (p.trail.length > 6) p.trail.shift();
      }

      // Fade
      p.alpha = p.life / p.maxLife;
      if (p.type === TYPE_SPARK) {
        p.alpha = Math.pow(p.alpha, 0.7);
      }
    }
  }

  // ─── Render ──────────────────────────────────────────────
  render(ctx) {
    ctx.save();

    // Sparks
    for (const p of this._sparks) {
      if (!p.active) continue;
      this._drawSpark(ctx, p);
    }

    // Blood
    ctx.globalCompositeOperation = 'source-over';
    for (const p of this._bloods) {
      if (!p.active) continue;
      this._drawBlood(ctx, p);
    }

    // Ash
    for (const p of this._ashes) {
      if (!p.active) continue;
      this._drawAsh(ctx, p);
    }

    ctx.restore();
  }

  _drawSpark(ctx, p) {
    const alpha = p.alpha;
    const size  = p.size;

    // Draw trail first
    if (p.trail && p.trail.length > 1) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = p.color;
      ctx.lineWidth   = size * 0.6;
      ctx.globalAlpha = alpha * 0.4;
      ctx.beginPath();
      for (let i = 0; i < p.trail.length; i++) {
        const pt = p.trail[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else         ctx.lineTo(pt.x, pt.y);
      }
      ctx.lineTo(p.pos.x, p.pos.y);
      ctx.stroke();
    }

    // Glow
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha * 0.6;
    const grd = ctx.createRadialGradient(p.pos.x, p.pos.y, 0, p.pos.x, p.pos.y, size * 3);
    grd.addColorStop(0,   p.color);
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawBlood(ctx, p) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = p.alpha * 0.85;
    ctx.fillStyle   = p.color;
    const r = p.size * (1 + (1 - p.alpha) * 1.5);   // splatter grows
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawAsh(ctx, p) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = p.alpha * 0.5;
    ctx.fillStyle   = p.color;
    ctx.save();
    ctx.translate(p.pos.x, p.pos.y);
    ctx.rotate(p.rot);
    ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
    ctx.restore();
  }

  /** Clear all active particles */
  clear() {
    for (const p of this._sparks) p.active = false;
    for (const p of this._bloods) p.active = false;
    for (const p of this._ashes)  p.active = false;
  }

  /** Active particle count */
  get count() {
    let n = 0;
    for (const p of this._sparks) if (p.active) n++;
    for (const p of this._bloods) if (p.active) n++;
    for (const p of this._ashes)  if (p.active) n++;
    return n;
  }
}
