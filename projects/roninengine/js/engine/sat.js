// ============================================================
//  RoninEngine — engine/sat.js
//  Separating Axis Theorem collision detection
//  Handles rotating polygons, CCD for fast-moving blades,
//  and generates contact manifolds
// ============================================================

'use strict';

import {
  Vec2, AABB,
  polyNormals, projectPoly, transformVerts, polyCentroid,
  clamp
} from '../core/math.js';

// ─── Contact Manifold ────────────────────────────────────────────────────────
export class Contact {
  constructor() {
    this.normal    = Vec2.zero();   // from A into B
    this.depth     = 0;
    this.pointA    = Vec2.zero();
    this.pointB    = Vec2.zero();
    this.hit       = false;
  }
}

// ─── Convex Polygon ──────────────────────────────────────────────────────────
export class Polygon {
  /**
   * @param {Vec2[]} localVerts   – vertices in local (model) space
   * @param {object} body         – owning rigid body { pos, angle, vel, angVel, mass, I }
   */
  constructor(localVerts, body) {
    this.localVerts = localVerts.map(v => v.clone());
    this.body       = body;
    this.worldVerts = [];
    this.normals    = [];
    this.aabb       = new AABB();
    this._dirty     = true;
  }

  markDirty() { this._dirty = true; }

  /** Transform local verts to world space */
  update() {
    if (!this._dirty) return;
    this.worldVerts = transformVerts(this.localVerts, this.body.pos, this.body.angle);
    this.normals    = polyNormals(this.worldVerts);
    this.aabb       = AABB.fromPoints(this.worldVerts);
    this._dirty     = false;
  }

  getCentroid() {
    this.update();
    return polyCentroid(this.worldVerts);
  }
}

// ─── SAT Query ────────────────────────────────────────────────────────────────
/**
 * Test two convex polygons using SAT.
 * Returns a filled Contact (hit=true) or hit=false Contact.
 *
 * @param {Polygon} polyA
 * @param {Polygon} polyB
 * @returns {Contact}
 */
export function satTest(polyA, polyB) {
  polyA.update();
  polyB.update();

  const contact = new Contact();

  // Broad-phase AABB reject
  if (!polyA.aabb.overlaps(polyB.aabb)) {
    contact.hit = false;
    return contact;
  }

  let minOverlap = Infinity;
  let minAxis    = null;

  // Test all axes from both polygons
  const allNormals = [...polyA.normals, ...polyB.normals];
  for (const axis of allNormals) {
    const projA = projectPoly(polyA.worldVerts, axis);
    const projB = projectPoly(polyB.worldVerts, axis);
    const overlap = _overlapAmount(projA.min, projA.max, projB.min, projB.max);
    if (overlap <= 0) {
      contact.hit = false;
      return contact;
    }
    if (overlap < minOverlap) {
      minOverlap = overlap;
      minAxis    = axis.clone();
    }
  }

  // Ensure normal points from A to B
  const cA = polyCentroid(polyA.worldVerts);
  const cB = polyCentroid(polyB.worldVerts);
  const d  = cB.sub(cA);
  if (d.dot(minAxis) < 0) minAxis.mulSelf(-1);

  contact.hit    = true;
  contact.normal = minAxis;
  contact.depth  = minOverlap;

  // Find contact points (closest edge on each polygon)
  contact.pointA = _supportPoint(polyA.worldVerts, minAxis.neg());
  contact.pointB = _supportPoint(polyB.worldVerts, minAxis);

  return contact;
}

/** Overlap between two 1-D intervals */
function _overlapAmount(minA, maxA, minB, maxB) {
  return Math.min(maxA, maxB) - Math.max(minA, minB);
}

/** Support point: vertex furthest along axis */
function _supportPoint(verts, axis) {
  let best = -Infinity, pt = verts[0];
  for (const v of verts) {
    const d = v.dot(axis);
    if (d > best) { best = d; pt = v; }
  }
  return pt.clone();
}

// ─── Continuous Collision Detection (CCD) ────────────────────────────────────
/**
 * Sweep test for fast-moving bodies.
 * Returns earliest Time-of-Impact t∈[0,1] or 1 if no hit.
 *
 * @param {Polygon} polyA  – moving polygon (body.vel must be set)
 * @param {Polygon} polyB  – stationary or slower polygon
 * @param {number}  dt     – timestep (s)
 * @returns {{ toi: number, contact: Contact }}
 */
export function ccdSweep(polyA, polyB, dt) {
  const steps   = 6;
  const step    = 1 / steps;

  // Save current positions
  const posA0   = polyA.body.pos.clone();
  const angA0   = polyA.body.angle;
  const posB0   = polyB.body.pos.clone();
  const angB0   = polyB.body.angle;

  let toi = 1;

  for (let i = 0; i <= steps; i++) {
    const t = i * step;

    // Advance A
    polyA.body.pos   = posA0.add(polyA.body.vel.mul(t * dt));
    polyA.body.angle = angA0 + polyA.body.angVel * t * dt;
    polyA.markDirty();

    // Advance B
    polyB.body.pos   = posB0.add(polyB.body.vel.mul(t * dt));
    polyB.body.angle = angB0 + polyB.body.angVel * t * dt;
    polyB.markDirty();

    const c = satTest(polyA, polyB);
    if (c.hit) { toi = (i === 0) ? 0 : (i - 1) * step; break; }
  }

  // Restore positions
  polyA.body.pos   = posA0;
  polyA.body.angle = angA0;
  polyA.markDirty();
  polyB.body.pos   = posB0;
  polyB.body.angle = angB0;
  polyB.markDirty();

  // Re-run SAT at TOI for contact info
  if (toi < 1) {
    polyA.body.pos   = posA0.add(polyA.body.vel.mul(toi * dt));
    polyA.body.angle = angA0 + polyA.body.angVel * toi * dt;
    polyA.markDirty();
    polyB.body.pos   = posB0.add(polyB.body.vel.mul(toi * dt));
    polyB.body.angle = angB0 + polyB.body.angVel * toi * dt;
    polyB.markDirty();

    const finalContact = satTest(polyA, polyB);

    // Restore again
    polyA.body.pos   = posA0; polyA.body.angle = angA0; polyA.markDirty();
    polyB.body.pos   = posB0; polyB.body.angle = angB0; polyB.markDirty();

    return { toi, contact: finalContact };
  }

  return { toi: 1, contact: new Contact() };
}

// ─── Polygon factory helpers ──────────────────────────────────────────────────

/** Create a simple rectangle polygon centered at origin */
export function makeRectPoly(w, h, body) {
  const hw = w * 0.5, hh = h * 0.5;
  const verts = [
    new Vec2(-hw, -hh), new Vec2(hw, -hh),
    new Vec2(hw,   hh), new Vec2(-hw,  hh),
  ];
  return new Polygon(verts, body);
}

/** Create a katana blade polygon (thin trapezoid elongated on X-axis) */
export function makeKatanaPoly(bladeLen, baseW, tipW, body) {
  const hBase = baseW * 0.5;
  const hTip  = tipW  * 0.5;
  const verts = [
    new Vec2(0,          -hBase),
    new Vec2(bladeLen,   -hTip),
    new Vec2(bladeLen,    hTip),
    new Vec2(0,           hBase),
  ];
  return new Polygon(verts, body);
}

/** Circle approximation as N-gon for SAT */
export function makeCirclePoly(radius, sides = 12, body) {
  const verts = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    verts.push(new Vec2(Math.cos(a) * radius, Math.sin(a) * radius));
  }
  return new Polygon(verts, body);
}

// ─── Debug helpers ────────────────────────────────────────────────────────────

/**
 * Draw SAT axes and contact normal onto a canvas context (debug mode).
 */
export function debugDrawSAT(ctx, polyA, polyB, contact, opts = {}) {
  const axisColor   = opts.axisColor   || '#00ff88';
  const normalColor = opts.normalColor || '#ff4455';

  polyA.update(); polyB.update();

  ctx.save();
  ctx.lineWidth = 1;

  // Draw polygon edges
  [polyA, polyB].forEach(poly => {
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    poly.worldVerts.forEach((v, i) => {
      if (i === 0) ctx.moveTo(v.x, v.y);
      else         ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();
    ctx.stroke();
  });

  // Draw SAT edge normals
  [polyA, polyB].forEach(poly => {
    const verts = poly.worldVerts;
    const n     = verts.length;
    for (let i = 0; i < n; i++) {
      const a   = verts[i], b = verts[(i+1) % n];
      const mid = a.add(b).mul(0.5);
      const nrm = poly.normals[i];
      ctx.strokeStyle = axisColor + '88';
      ctx.beginPath();
      ctx.moveTo(mid.x, mid.y);
      ctx.lineTo(mid.x + nrm.x * 16, mid.y + nrm.y * 16);
      ctx.stroke();
    }
  });

  // Draw contact normal
  if (contact && contact.hit) {
    const cp = contact.pointA;
    ctx.strokeStyle = normalColor;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(cp.x, cp.y);
    ctx.lineTo(cp.x + contact.normal.x * 30, cp.y + contact.normal.y * 30);
    ctx.stroke();
    // Dot at contact point
    ctx.fillStyle = normalColor;
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
