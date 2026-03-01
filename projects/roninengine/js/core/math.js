// ============================================================
//  RoninEngine — core/math.js
//  Low-level 2-D math primitives: Vec2, Mat2, AABB, utilities
// ============================================================

'use strict';

// ─── Vec2 ────────────────────────────────────────────────────────────────────
export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone()                  { return new Vec2(this.x, this.y); }

  set(x, y)                { this.x = x; this.y = y; return this; }
  setV(v)                  { this.x = v.x; this.y = v.y; return this; }

  add(v)                   { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v)                   { return new Vec2(this.x - v.x, this.y - v.y); }
  mul(s)                   { return new Vec2(this.x * s,   this.y * s);   }
  div(s)                   { return new Vec2(this.x / s,   this.y / s);   }
  neg()                    { return new Vec2(-this.x,      -this.y);      }

  addSelf(v)               { this.x += v.x; this.y += v.y; return this; }
  subSelf(v)               { this.x -= v.x; this.y -= v.y; return this; }
  mulSelf(s)               { this.x *= s;   this.y *= s;   return this; }

  dot(v)                   { return this.x * v.x + this.y * v.y; }
  cross(v)                 { return this.x * v.y - this.y * v.x; }

  lenSq()                  { return this.x * this.x + this.y * this.y; }
  len()                    { return Math.sqrt(this.lenSq()); }

  norm() {
    const l = this.len();
    return l > 1e-9 ? new Vec2(this.x / l, this.y / l) : new Vec2(0, 0);
  }

  normSelf() {
    const l = this.len();
    if (l > 1e-9) { this.x /= l; this.y /= l; }
    return this;
  }

  perp()                   { return new Vec2(-this.y, this.x); }
  perpRight()              { return new Vec2(this.y, -this.x); }

  rotate(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return new Vec2(this.x * c - this.y * s, this.x * s + this.y * c);
  }

  rotateSelf(a) {
    const c = Math.cos(a), s = Math.sin(a);
    const nx = this.x * c - this.y * s;
    const ny = this.x * s + this.y * c;
    this.x = nx; this.y = ny;
    return this;
  }

  lerp(v, t)               { return new Vec2(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t); }

  distSq(v)                { const dx = this.x - v.x, dy = this.y - v.y; return dx*dx + dy*dy; }
  dist(v)                  { return Math.sqrt(this.distSq(v)); }

  angleTo(v)               { return Math.atan2(v.y - this.y, v.x - this.x); }
  angle()                  { return Math.atan2(this.y, this.x); }

  projectOnto(axis) {
    const s = this.dot(axis) / axis.lenSq();
    return axis.mul(s);
  }

  reflect(normal) {
    const d = 2 * this.dot(normal);
    return new Vec2(this.x - d * normal.x, this.y - d * normal.y);
  }

  clampLen(maxLen) {
    const l = this.len();
    return l > maxLen ? this.mul(maxLen / l) : this.clone();
  }

  toString()               { return `Vec2(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`; }

  static zero()            { return new Vec2(0, 0); }
  static one()             { return new Vec2(1, 1); }
  static fromAngle(a, r=1) { return new Vec2(Math.cos(a) * r, Math.sin(a) * r); }

  static add(a, b)         { return new Vec2(a.x + b.x, a.y + b.y); }
  static sub(a, b)         { return new Vec2(a.x - b.x, a.y - b.y); }
  static scale(v, s)       { return new Vec2(v.x * s,   v.y * s);   }
  static dot(a, b)         { return a.x * b.x + a.y * b.y; }
  static cross(a, b)       { return a.x * b.y - a.y * b.x; }
  static lerp(a, b, t)     { return a.lerp(b, t); }
  static dist(a, b)        { return a.dist(b); }
  static distSq(a, b)      { return a.distSq(b); }
}

// ─── Mat2 ────────────────────────────────────────────────────────────────────
export class Mat2 {
  // Column-major 2x2: | a c |
  //                   | b d |
  constructor(a=1, b=0, c=0, d=1) {
    this.a = a; this.b = b; this.c = c; this.d = d;
  }

  static identity()        { return new Mat2(1,0,0,1); }
  static fromAngle(a)      { const c=Math.cos(a),s=Math.sin(a); return new Mat2(c,s,-s,c); }

  mul(m) {
    return new Mat2(
      this.a*m.a + this.c*m.b,
      this.b*m.a + this.d*m.b,
      this.a*m.c + this.c*m.d,
      this.b*m.c + this.d*m.d
    );
  }

  mulVec(v) {
    return new Vec2(this.a*v.x + this.c*v.y, this.b*v.x + this.d*v.y);
  }

  transpose()              { return new Mat2(this.a, this.c, this.b, this.d); }

  det()                    { return this.a*this.d - this.b*this.c; }

  inverse() {
    const d = this.det();
    if (Math.abs(d) < 1e-9) return Mat2.identity();
    const inv = 1/d;
    return new Mat2(this.d*inv, -this.b*inv, -this.c*inv, this.a*inv);
  }
}

// ─── AABB ─────────────────────────────────────────────────────────────────────
export class AABB {
  constructor(minX=0, minY=0, maxX=0, maxY=0) {
    this.minX = minX; this.minY = minY;
    this.maxX = maxX; this.maxY = maxY;
  }

  get width()  { return this.maxX - this.minX; }
  get height() { return this.maxY - this.minY; }
  get cx()     { return (this.minX + this.maxX) * 0.5; }
  get cy()     { return (this.minY + this.maxY) * 0.5; }

  overlaps(b) {
    return this.maxX >= b.minX && this.minX <= b.maxX &&
           this.maxY >= b.minY && this.minY <= b.maxY;
  }

  expand(margin) {
    return new AABB(this.minX-margin, this.minY-margin,
                    this.maxX+margin, this.maxY+margin);
  }

  static fromPoints(pts) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return new AABB(minX, minY, maxX, maxY);
  }
}

// ─── Numeric utilities ────────────────────────────────────────────────────────
export const PI       = Math.PI;
export const TWO_PI   = Math.PI * 2;
export const HALF_PI  = Math.PI * 0.5;
export const DEG2RAD  = Math.PI / 180;
export const RAD2DEG  = 180 / Math.PI;

export function clamp(v, lo, hi)      { return v < lo ? lo : v > hi ? hi : v; }
export function lerp(a, b, t)         { return a + (b - a) * t; }
export function smoothstep(a, b, t)   { t = clamp((t-a)/(b-a),0,1); return t*t*(3-2*t); }
export function sign(x)               { return x < 0 ? -1 : x > 0 ? 1 : 0; }
export function wrap(v, lo, hi)       { const r = hi - lo; return lo + ((((v - lo) % r) + r) % r); }
export function randomRange(lo, hi)   { return lo + Math.random() * (hi - lo); }
export function randomInt(lo, hi)     { return Math.floor(randomRange(lo, hi + 1)); }
export function approxEq(a, b, eps=1e-6) { return Math.abs(a-b) < eps; }

export function lerpAngle(a, b, t) {
  let d = b - a;
  while (d >  PI) d -= TWO_PI;
  while (d < -PI) d += TWO_PI;
  return a + d * t;
}

export function wrapAngle(a) {
  while (a >  PI) a -= TWO_PI;
  while (a < -PI) a += TWO_PI;
  return a;
}

export function angleDiff(a, b) {
  let d = b - a;
  while (d >  PI) d -= TWO_PI;
  while (d < -PI) d += TWO_PI;
  return d;
}

// Spring-damper integration (returns new velocity offset)
export function springStep(cur, target, vel, stiffness, damping, dt) {
  const force = (target - cur) * stiffness - vel * damping;
  const nv    = vel + force * dt;
  const nPos  = cur + nv * dt;
  return { pos: nPos, vel: nv };
}

// Hermite cubic interpolation
export function hermite(p0, p1, m0, m1, t) {
  const t2 = t*t, t3 = t2*t;
  return (2*t3 - 3*t2 + 1)*p0 + (t3 - 2*t2 + t)*m0 +
         (-2*t3 + 3*t2)*p1    + (t3 - t2)*m1;
}

// Bezier cubic
export function bezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
}

// Project point onto line segment, return t [0,1]
export function projectPointSegment(p, a, b) {
  const ab = b.sub(a), ap = p.sub(a);
  const t  = clamp(ap.dot(ab) / (ab.lenSq() || 1), 0, 1);
  return { t, closest: a.add(ab.mul(t)) };
}

// Signed area of triangle
export function triArea(a, b, c) {
  return ((b.x - a.x)*(c.y - a.y) - (c.x - a.x)*(b.y - a.y)) * 0.5;
}

// Rotate a point around a pivot
export function rotateAround(point, pivot, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const dx = point.x - pivot.x, dy = point.y - pivot.y;
  return new Vec2(pivot.x + dx*c - dy*s, pivot.y + dx*s + dy*c);
}

// Linear map from one range to another
export function remap(v, inLo, inHi, outLo, outHi) {
  return outLo + (v - inLo) / (inHi - inLo) * (outHi - outLo);
}

// Exponential decay (frame-rate independent damping)
export function expDecay(cur, target, lambda, dt) {
  return target + (cur - target) * Math.exp(-lambda * dt);
}

// ─── Polygon helpers ──────────────────────────────────────────────────────────

/** Transform a list of Vec2 local vertices by position + rotation */
export function transformVerts(verts, pos, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return verts.map(v => new Vec2(
    pos.x + v.x * c - v.y * s,
    pos.y + v.x * s + v.y * c
  ));
}

/** Get normals (edge perpendiculars) of a convex polygon */
export function polyNormals(verts) {
  const n = verts.length;
  const normals = [];
  for (let i = 0; i < n; i++) {
    const a = verts[i], b = verts[(i+1) % n];
    const edge = b.sub(a);
    normals.push(new Vec2(-edge.y, edge.x).norm());
  }
  return normals;
}

/** Project polygon onto axis, return {min, max} */
export function projectPoly(verts, axis) {
  let min = Infinity, max = -Infinity;
  for (const v of verts) {
    const p = v.dot(axis);
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return { min, max };
}

/** Compute centroid of polygon */
export function polyCentroid(verts) {
  let x = 0, y = 0;
  for (const v of verts) { x += v.x; y += v.y; }
  const n = verts.length;
  return new Vec2(x/n, y/n);
}
