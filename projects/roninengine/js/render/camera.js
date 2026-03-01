// RoninEngine — render/camera.js  ·  2D camera with shake, zoom, pan
'use strict';
import { Vec2, lerp } from '../core/math.js';

export class Camera {
  constructor(canvasW, canvasH) {
    this.canvasW    = canvasW;
    this.canvasH    = canvasH;
    this.pos        = new Vec2(canvasW / 2, canvasH / 2);
    this._target    = new Vec2(canvasW / 2, canvasH / 2);
    this.zoom       = 1;
    this._zoomTarget = 1;
    this._shakeAmt  = 0;
    this._shakeDecay = 8;
    this.smoothing  = 6;   // lerp speed (units/s)
  }

  shake(amount = 6) {
    this._shakeAmt = Math.max(this._shakeAmt, amount);
  }

  follow(worldX, worldY) {
    this._target.x = worldX;
    this._target.y = worldY;
  }

  zoomTo(z, speed = 3) {
    this._zoomTarget = z;
    this._zoomSpeed  = speed;
  }

  update(dt) {
    const s         = Math.min(1, this.smoothing * dt);
    this.pos.x      = lerp(this.pos.x, this._target.x, s);
    this.pos.y      = lerp(this.pos.y, this._target.y, s);
    this.zoom       = lerp(this.zoom, this._zoomTarget, Math.min(1, (this._zoomSpeed ?? 3) * dt));
    this._shakeAmt  = Math.max(0, this._shakeAmt - this._shakeDecay * dt);
  }

  /** Apply camera transform to canvas context */
  apply(ctx) {
    const ox = (Math.random() * 2 - 1) * this._shakeAmt;
    const oy = (Math.random() * 2 - 1) * this._shakeAmt;
    ctx.translate(this.canvasW / 2 + ox, this.canvasH / 2 + oy);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.pos.x, -this.pos.y);
  }

  /** World → screen */
  worldToScreen(wx, wy) {
    return new Vec2(
      (wx - this.pos.x) * this.zoom + this.canvasW / 2,
      (wy - this.pos.y) * this.zoom + this.canvasH / 2,
    );
  }
}
