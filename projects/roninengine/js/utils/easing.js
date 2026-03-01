// RoninEngine — utils/easing.js  ·  Easing / interpolation functions
'use strict';

// All functions take t ∈ [0,1] and return a value ∈ ~[0,1]

export const ease = {
  linear    : t => t,
  inQuad    : t => t * t,
  outQuad   : t => t * (2 - t),
  inOutQuad : t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  inCubic   : t => t * t * t,
  outCubic  : t => (--t) * t * t + 1,
  inOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  inQuart   : t => t * t * t * t,
  outQuart  : t => 1 - (--t) * t * t * t,
  inExpo    : t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  outExpo   : t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inElastic : t => {
    const c = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c);
  },
  outElastic: t => {
    const c = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c) + 1;
  },
  outBounce : t => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1/d1)          return n1 * t * t;
    if (t < 2/d1)          return n1 * (t -= 1.5/d1)  * t + 0.75;
    if (t < 2.5/d1)        return n1 * (t -= 2.25/d1) * t + 0.9375;
    return                        n1 * (t -= 2.625/d1) * t + 0.984375;
  },
};

/** Interpolate a value with a named easing */
export function easedLerp(a, b, t, name = 'outQuad') {
  return a + (b - a) * ease[name](Math.max(0, Math.min(1, t)));
}
