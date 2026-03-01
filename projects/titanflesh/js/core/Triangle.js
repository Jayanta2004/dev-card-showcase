'use strict';

class Triangle {
  constructor(a, b, c) {
    /** @type {Particle|{x:number,y:number}} Vertex A. */
    this.a = a;
    /** @type {Particle|{x:number,y:number}} Vertex B. */
    this.b = b;
    /** @type {Particle|{x:number,y:number}} Vertex C. */
    this.c = c;

    this._circ = null;

    /** True when circumcircle cache needs recomputing. */
    this._circDirty = true;

    this.pressureRatio = 1;

    /** Cached area value from last area computation. */
    this._area = 0;
  }

  get circumcircle() {
    if (this._circDirty) {
      const { x: ax, y: ay } = this.a.pos ?? this.a;
      const { x: bx, y: by } = this.b.pos ?? this.b;
      const { x: cx, y: cy } = this.c.pos ?? this.c;
      this._circ = MathUtils.circumcircle(ax, ay, bx, by, cx, cy);
      this._circDirty = false;
    }
    return this._circ;
  }

  markDirty() {
    this._circDirty = true;
  }

  inCircumcircle(p) {
    const circ = this.circumcircle;
    const px = p.pos ? p.pos.x : p.x;
    const py = p.pos ? p.pos.y : p.y;
    return MathUtils.inCircumcircle(px, py, circ);
  }

  get area() {
    const { x: ax, y: ay } = this.a.pos ?? this.a;
    const { x: bx, y: by } = this.b.pos ?? this.b;
    const { x: cx, y: cy } = this.c.pos ?? this.c;
    return Math.abs((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) * 0.5;
  }

  get signedArea() {
    const { x: ax, y: ay } = this.a.pos ?? this.a;
    const { x: bx, y: by } = this.b.pos ?? this.b;
    const { x: cx, y: cy } = this.c.pos ?? this.c;
    return ((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) * 0.5;
  }

  get centroid() {
    const { x: ax, y: ay } = this.a.pos ?? this.a;
    const { x: bx, y: by } = this.b.pos ?? this.b;
    const { x: cx, y: cy } = this.c.pos ?? this.c;
    return new Vec2((ax + bx + cx) / 3, (ay + by + cy) / 3);
  }

  get normal() {
    const area  = this.area;
    const len   = Math.sqrt(area * 2 + 1e-10);
    const { x: ax, y: ay } = this.a.pos ?? this.a;
    const { x: bx, y: by } = this.b.pos ?? this.b;
    const ex = bx - ax;
    const ey = by - ay;
    return new Vec2(-ey / len, ex / len);
  }

  enforceWinding() {
    if (this.signedArea < 0) {
      const tmp = this.b;
      this.b = this.c;
      this.c = tmp;
      this._circDirty = true;
    }
  }

  containsPoint(px, py) {
    const { x: ax, y: ay } = this.a.pos ?? this.a;
    const { x: bx, y: by } = this.b.pos ?? this.b;
    const { x: cx, y: cy } = this.c.pos ?? this.c;
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
    const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
    const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  }

  barycentric(px, py) {
    const { x: ax, y: ay } = this.a.pos ?? this.a;
    const { x: bx, y: by } = this.b.pos ?? this.b;
    const { x: cx, y: cy } = this.c.pos ?? this.c;
    const denom = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (Math.abs(denom) < 1e-10) return { u: 0.33, v: 0.33, w: 0.34 };
    const u = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / denom;
    const v = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / denom;
    return { u, v, w: 1 - u - v };
  }

  interpolateValue(px, py, va, vb, vc) {
    const { u, v, w } = this.barycentric(px, py);
    return u * va + v * vb + w * vc;
  }

  getBoundingBox() {
    const { x: ax, y: ay } = this.a.pos ?? this.a;
    const { x: bx, y: by } = this.b.pos ?? this.b;
    const { x: cx, y: cy } = this.c.pos ?? this.c;
    return {
      minX: Math.min(ax, bx, cx),
      minY: Math.min(ay, by, cy),
      maxX: Math.max(ax, bx, cx),
      maxY: Math.max(ay, by, cy)
    };
  }

  getMinAngle() {
    const { x: ax, y: ay } = this.a.pos ?? this.a;
    const { x: bx, y: by } = this.b.pos ?? this.b;
    const { x: cx, y: cy } = this.c.pos ?? this.c;
    const lenAB = Math.sqrt((bx-ax)**2 + (by-ay)**2);
    const lenBC = Math.sqrt((cx-bx)**2 + (cy-by)**2);
    const lenCA = Math.sqrt((ax-cx)**2 + (ay-cy)**2);
    const angles = [
      Math.acos(Math.max(-1, Math.min(1, (lenAB*lenAB + lenCA*lenCA - lenBC*lenBC) / (2*lenAB*lenCA)))),
      Math.acos(Math.max(-1, Math.min(1, (lenAB*lenAB + lenBC*lenBC - lenCA*lenCA) / (2*lenAB*lenBC)))),
      Math.acos(Math.max(-1, Math.min(1, (lenBC*lenBC + lenCA*lenCA - lenAB*lenAB) / (2*lenBC*lenCA))))
    ];
    return Math.min(...angles);
  }

  hasParticle(p) {
    return this.a === p || this.b === p || this.c === p;
  }

  hasEdge(p1, p2) {
    const has1 = this.a === p1 || this.b === p1 || this.c === p1;
    const has2 = this.a === p2 || this.b === p2 || this.c === p2;
    return has1 && has2;
  }

  getOppositeVertex(p1, p2) {
    if (this.a !== p1 && this.a !== p2) return this.a;
    if (this.b !== p1 && this.b !== p2) return this.b;
    if (this.c !== p1 && this.c !== p2) return this.c;
    return null;
  }

  getParticles() {
    return [this.a, this.b, this.c];
  }

  updatePressure(ratio) {
    this.pressureRatio = ratio;
  }
}
