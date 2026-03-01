// RoninEngine — ui/toast.js  ·  Canvas-rendered toast notifications
'use strict';

const _toasts = [];

export const Toast = {
  /** Show a transient message on the canvas (rendered each frame) */
  show(text, { duration = 2.0, color = '#fff', size = 22 } = {}) {
    _toasts.push({ text, duration, color, size, _t: 0 });
  },

  update(dt) {
    for (let i = _toasts.length - 1; i >= 0; i--) {
      _toasts[i]._t += dt;
      if (_toasts[i]._t >= _toasts[i].duration) _toasts.splice(i, 1);
    }
  },

  /** Call from render pipeline — draws toasts above HUD */
  render(ctx, canvasW, canvasH) {
    const baseY = canvasH * 0.18;
    _toasts.forEach((t, i) => {
      const progress = t._t / t.duration;
      const alpha    = progress < 0.15 ? progress / 0.15
                     : progress > 0.75 ? 1 - (progress - 0.75) / 0.25
                     : 1;
      ctx.save();
      ctx.globalAlpha  = alpha;
      ctx.font         = `bold ${t.size}px "Cinzel", serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = t.color;
      ctx.shadowBlur   = 18;
      ctx.fillStyle    = t.color;
      ctx.fillText(t.text, canvasW / 2, baseY + i * (t.size + 10));
      ctx.restore();
    });
  },
};
