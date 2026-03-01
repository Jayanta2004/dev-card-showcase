// RoninEngine — utils/debug.js  ·  Debug overlay helpers
'use strict';
import { State } from '../core/state.js';

const _lines = [];

export const Debug = {
  /** Push a line to the debug overlay (cleared each frame) */
  log(text) { if (State.debug) _lines.push(text); },

  /** Render all buffered lines to top-left of canvas */
  render(ctx) {
    if (!State.debug) { _lines.length = 0; return; }
    ctx.save();
    ctx.font         = '12px monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign    = 'left';
    ctx.fillStyle    = 'rgba(0,0,0,0.55)';
    ctx.fillRect(4, 4, 260, _lines.length * 16 + 8);
    ctx.fillStyle = '#0f0';
    _lines.forEach((l, i) => ctx.fillText(l, 8, 8 + i * 16));
    ctx.restore();
    _lines.length = 0;
  },

  /** Draw a Vec2 point */
  dot(ctx, v, color = '#f0f', r = 4) {
    if (!State.debug) return;
    ctx.beginPath();
    ctx.arc(v.x, v.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  },

  /** Draw a line between two Vec2s */
  line(ctx, a, b, color = '#ff0') {
    if (!State.debug) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1;
    ctx.stroke();
  },
};
