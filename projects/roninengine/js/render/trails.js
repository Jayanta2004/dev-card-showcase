// RoninEngine — render/trails.js  ·  Motion-trail renderer for katana tips
'use strict';
import { Vec2 } from '../core/math.js';

const MAX_TRAIL = 18;

export class TrailRenderer {
  constructor(color = 'rgba(200,230,255,0.6)', width = 4) {
    this._pts   = [];      // Vec2 ring buffer
    this._color = color;
    this._width = width;
  }

  /** Call every frame with the current tip position */
  push(x, y) {
    this._pts.push(new Vec2(x, y));
    if (this._pts.length > MAX_TRAIL) this._pts.shift();
  }

  clear() { this._pts.length = 0; }

  /** Render the trail as a fading polyline */
  render(ctx) {
    const pts = this._pts;
    if (pts.length < 2) return;
    ctx.save();
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < pts.length; i++) {
      const t = i / pts.length;
      ctx.beginPath();
      ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
      ctx.lineTo(pts[i].x, pts[i].y);
      ctx.globalAlpha = t * t * 0.8;
      ctx.lineWidth   = this._width * t;
      ctx.strokeStyle = this._color;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
