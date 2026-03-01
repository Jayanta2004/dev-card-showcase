// RoninEngine — utils/perf.js  ·  Frame-performance sampler
'use strict';

const _marks = new Map();   // label → start time

export const Perf = {
  _history: new Map(),        // label → circular buffer of ms values
  _bufSize: 60,

  begin(label) {
    _marks.set(label, performance.now());
  },

  end(label) {
    const start = _marks.get(label);
    if (start === undefined) return 0;
    const ms = performance.now() - start;
    _marks.delete(label);
    if (!this._history.has(label)) this._history.set(label, []);
    const buf = this._history.get(label);
    buf.push(ms);
    if (buf.length > this._bufSize) buf.shift();
    return ms;
  },

  /** Average over last N frames */
  avg(label) {
    const buf = this._history.get(label);
    if (!buf?.length) return 0;
    return buf.reduce((a, b) => a + b, 0) / buf.length;
  },

  /** Render all tracked marks as an overlay */
  render(ctx, x = 4, y = 200) {
    ctx.save();
    ctx.font      = '11px monospace';
    ctx.fillStyle = '#0ff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    let row = 0;
    for (const [label] of this._history) {
      ctx.fillText(`${label}: ${this.avg(label).toFixed(2)}ms`, x, y + row * 14);
      row++;
    }
    ctx.restore();
  },
};
