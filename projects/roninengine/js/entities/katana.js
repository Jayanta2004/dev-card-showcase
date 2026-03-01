// ============================================================
//  RoninEngine — entities/katana.js
//  Katana entity: polygon geometry, rigid body, swing state
// ============================================================

'use strict';

import { Vec2, wrapAngle, lerp, clamp }         from '../core/math.js';
import { KATANA as CFG, SKEL }                   from '../core/config.js';
import { RigidBody }                             from '../engine/impulse.js';
import { makeKatanaPoly }                        from '../engine/sat.js';

// ─── Katana ───────────────────────────────────────────────────────────────────
export class Katana {
  /**
   * @param {Vec2}   pivotPos  – initial handle position (wrist joint world pos)
   * @param {number} facing    – +1 right, -1 left
   */
  constructor(pivotPos, facing = 1) {
    this.facing   = facing;

    // Build rigid body at pivot
    this.body = new RigidBody({
      pos        : pivotPos.clone(),
      angle      : 0,
      mass       : CFG.mass,
      inertia    : (1/12) * CFG.mass * CFG.totalLen * CFG.totalLen,
      restitution: CFG.restitution,
      friction   : CFG.friction,
    });

    // Build SAT polygon
    this.polygon = makeKatanaPoly(
      CFG.bladeLen, CFG.maxWidth, CFG.tipWidth, this.body
    );

    // A second smaller polygon for the handle
    this.handlePoly = makeKatanaPoly(
      CFG.handleLen, CFG.handleW, CFG.handleW * 0.8, {
        pos  : this.body.pos,
        angle: this.body.angle + Math.PI,   // opposite direction
        vel  : this.body.vel,
        angVel: this.body.angVel,
      }
    );

    // Visual state
    this.swingProgress = 0;    // 0–1 during an attack
    this.swingType     = 'horizontal';
    this.isSwinging    = false;
    this.isBlocking    = false;
    this.blockAngle    = -Math.PI * 0.6;
    this.trailPoints   = [];   // last N tip positions
    this.trailMaxLen   = 14;

    this.clashCooldown = 0;
    this.clashFlash    = 0;
  }

  // ─── Geometry helpers ────────────────────────────────────

  /** Tip world position (end of blade) */
  get tipPos() {
    const a = this.body.angle;
    return new Vec2(
      this.body.pos.x + Math.cos(a) * CFG.totalLen,
      this.body.pos.y + Math.sin(a) * CFG.totalLen
    );
  }

  /** Middle of blade (for force application) */
  get midPos() {
    const a = this.body.angle;
    return new Vec2(
      this.body.pos.x + Math.cos(a) * (CFG.totalLen * 0.5),
      this.body.pos.y + Math.sin(a) * (CFG.totalLen * 0.5)
    );
  }

  /** Guard position (junction handle/blade) */
  get guardPos() {
    const a = this.body.angle;
    return new Vec2(
      this.body.pos.x + Math.cos(a) * CFG.handleLen,
      this.body.pos.y + Math.sin(a) * CFG.handleLen
    );
  }

  // ─── Swing control ────────────────────────────────────────

  /** Begin a new swing */
  startSwing(type = 'horizontal') {
    this.isSwinging    = true;
    this.isBlocking    = false;
    this.swingProgress = 0;
    this.swingType     = type;
    this.trailPoints   = [];
  }

  /** Cancel active swing */
  cancelSwing() {
    this.isSwinging    = false;
    this.swingProgress = 0;
  }

  /** Set blade to blocking pose */
  setBlock(on) {
    this.isBlocking = on;
    if (on) this.isSwinging = false;
  }

  // ─── Update ──────────────────────────────────────────────

  /**
   * Sync katana body to wrist joint + angle target.
   *
   * @param {Vec2}   wristPos   – wrist world position from IK
   * @param {number} targetAngle – desired blade world angle
   * @param {number} dt
   */
  update(wristPos, targetAngle, dt) {
    this.body.pos.setV(wristPos);
    // Smooth rotate toward target
    const diff = wrapAngle(targetAngle - this.body.angle);
    this.body.angle += diff * clamp(dt * 18, 0, 1);
    this.body.angle  = wrapAngle(this.body.angle);

    // Mark polygon dirty
    this.polygon.markDirty();
    this.handlePoly.body.pos.setV(wristPos);
    this.handlePoly.body.angle = this.body.angle + Math.PI;
    this.handlePoly.markDirty();

    // Cooldowns
    if (this.clashCooldown > 0) this.clashCooldown -= dt;
    if (this.clashFlash    > 0) this.clashFlash    -= dt;

    // Trail
    this.trailPoints.push(this.tipPos.clone());
    if (this.trailPoints.length > this.trailMaxLen) {
      this.trailPoints.shift();
    }
  }

  // ─── Render ──────────────────────────────────────────────

  /**
   * Draw katana onto context.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} isPlayer  – slight color tint difference
   * @param {boolean} showTrail
   */
  render(ctx, isPlayer = true, showTrail = true) {
    const pos   = this.body.pos;
    const angle = this.body.angle;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);

    // Swing trail
    if (showTrail && this.isSwinging && this.trailPoints.length > 2) {
      this._drawTrail(ctx);
    }

    // Handle
    const hGrad = ctx.createLinearGradient(0, 0, -CFG.handleLen, 0);
    hGrad.addColorStop(0,   '#2a1a0a');
    hGrad.addColorStop(0.5, '#5c3a1e');
    hGrad.addColorStop(1,   '#1a0d05');
    ctx.fillStyle = hGrad;
    this._drawRoundedRect(ctx, -CFG.handleLen, -CFG.handleW * 0.5,
                          CFG.handleLen, CFG.handleW, 2);

    // Guard (tsuba)
    ctx.fillStyle = '#888';
    this._drawRoundedRect(ctx, -3, -CFG.handleW * 0.7,
                          6, CFG.handleW * 1.4, 1);

    // Blade gradient
    const flash      = clamp(this.clashFlash, 0, 1);
    const bladeGrad  = ctx.createLinearGradient(0, -CFG.maxWidth * 0.5,
                                                CFG.bladeLen, -CFG.tipWidth * 0.5);
    bladeGrad.addColorStop(0,   `rgba(${lerp(160,255,flash)|0},${lerp(160,255,flash)|0},${lerp(180,255,flash)|0},1)`);
    bladeGrad.addColorStop(0.5, '#d4d4d4');
    bladeGrad.addColorStop(1,   '#b8c8d4');
    ctx.fillStyle = bladeGrad;

    // Blade trapezoid
    ctx.beginPath();
    ctx.moveTo(0,             -CFG.maxWidth * 0.5);
    ctx.lineTo(CFG.bladeLen,  -CFG.tipWidth * 0.5);
    ctx.lineTo(CFG.bladeLen,   CFG.tipWidth * 0.5);
    ctx.lineTo(0,              CFG.maxWidth * 0.5);
    ctx.closePath();
    ctx.fill();

    // Edge highlight (hamon line)
    ctx.strokeStyle = `rgba(255,255,255,${0.3 + flash * 0.5})`;
    ctx.lineWidth   = 0.8;
    ctx.beginPath();
    ctx.moveTo(0,            -CFG.maxWidth * 0.3);
    ctx.lineTo(CFG.bladeLen, -CFG.tipWidth * 0.3);
    ctx.stroke();

    // Clash flash glow
    if (this.clashFlash > 0.05) {
      ctx.globalAlpha = this.clashFlash * 0.7;
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth   = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(CFG.bladeLen, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawTrail(ctx) {
    if (this.trailPoints.length < 2) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);  // reset to world space
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i < this.trailPoints.length; i++) {
      const t     = i / this.trailPoints.length;
      const alpha = t * 0.25;
      const a     = this.trailPoints[i-1];
      const b     = this.trailPoints[i];
      ctx.strokeStyle = `rgba(200,220,255,${alpha})`;
      ctx.lineWidth   = t * 3;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,      y + h, x, y + h - r, r);
    ctx.lineTo(x,     y + r);
    ctx.arcTo(x,      y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
  }

  triggerClash(impulse) {
    this.clashFlash    = clamp(impulse / 400, 0.3, 1.0);
    this.clashCooldown = 0.12;
  }
}
