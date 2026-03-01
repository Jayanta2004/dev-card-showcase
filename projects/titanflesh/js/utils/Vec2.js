'use strict';
class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) { this.x = x; this.y = y; return this; }
  copy(v) { this.x = v.x; this.y = v.y; return this; }
  clone() { return new Vec2(this.x, this.y); }

  add(v) { this.x += v.x; this.y += v.y; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; return this; }
  mul(s) { this.x *= s; this.y *= s; return this; }
  div(s) { if (Math.abs(s) > 1e-10) { this.x /= s; this.y /= s; } return this; }
  neg() { this.x = -this.x; this.y = -this.y; return this; }

  addScaled(v, s) { this.x += v.x * s; this.y += v.y * s; return this; }
  lerp(v, t) { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; return this; }

  get length() { return Math.hypot(this.x, this.y); }
  get lengthSq() { return this.x * this.x + this.y * this.y; }

  normalize() {
    const len = this.length;
    if (len > 1e-10) { this.x /= len; this.y /= len; }
    return this;
  }

  limit(max) {
    const len = this.length;
    if (len > max && len > 1e-10) { const s = max / len; this.x *= s; this.y *= s; }
    return this;
  }

  rotate(angle) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const nx = this.x * cos - this.y * sin;
    const ny = this.x * sin + this.y * cos;
    this.x = nx; this.y = ny;
    return this;
  }

  perpCW() { const tmp = this.x; this.x = this.y; this.y = -tmp; return this; }
  perpCCW() { const tmp = this.x; this.x = -this.y; this.y = tmp; return this; }

  dot(v) { return this.x * v.x + this.y * v.y; }
  cross(v) { return this.x * v.y - this.y * v.x; }

  distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
  distanceSqTo(v) { const dx = this.x - v.x, dy = this.y - v.y; return dx * dx + dy * dy; }

  angleTo(v) { return Math.atan2(v.y - this.y, v.x - this.x); }
  angle() { return Math.atan2(this.y, this.x); }

  equals(v, eps = 1e-6) { return Math.abs(this.x - v.x) < eps && Math.abs(this.y - v.y) < eps; }
  isZero(eps = 1e-10) { return this.x * this.x + this.y * this.y < eps * eps; }

  toArray() { return [this.x, this.y]; }
  toString() { return `Vec2(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`; }

  static from(obj) { return new Vec2(obj.x ?? 0, obj.y ?? 0); }
  static fromAngle(a, len = 1) { return new Vec2(Math.cos(a) * len, Math.sin(a) * len); }
  static add(a, b) { return new Vec2(a.x + b.x, a.y + b.y); }
  static sub(a, b) { return new Vec2(a.x - b.x, a.y - b.y); }
  static mul(v, s) { return new Vec2(v.x * s, v.y * s); }
  static dot(a, b) { return a.x * b.x + a.y * b.y; }
  static cross(a, b) { return a.x * b.y - a.y * b.x; }
  static dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  static lerp(a, b, t) { return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t); }
  static normalize(v) { const l = Math.hypot(v.x, v.y); return l > 1e-10 ? new Vec2(v.x / l, v.y / l) : new Vec2(); }
  static midpoint(a, b) { return new Vec2((a.x + b.x) * 0.5, (a.y + b.y) * 0.5); }
  static zero() { return new Vec2(0, 0); }
  static one() { return new Vec2(1, 1); }
}
