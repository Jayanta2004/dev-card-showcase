// ============================================================
//  RoninEngine — engine/impulse.js
//  Sequential impulse resolution: restitution + friction
//  Operates on rigid body pairs that have collided (SAT result)
// ============================================================

'use strict';

import { Vec2, clamp } from '../core/math.js';

// ─── Rigid Body ───────────────────────────────────────────────────────────────
/**
 * Minimal 2-D rigid body used by the impulse solver.
 * Entities own one of these and sync it with their visual state.
 */
export class RigidBody {
  /**
   * @param {object} opts
   * @param {Vec2}   opts.pos
   * @param {number} opts.mass       – 0 = infinite (static)
   * @param {number} opts.inertia    – rotational inertia (0 = infinite)
   * @param {number} opts.restitution – bounciness [0,1]
   * @param {number} opts.friction   – coulomb friction [0,1]
   */
  constructor(opts = {}) {
    this.pos         = (opts.pos || Vec2.zero()).clone();
    this.vel         = Vec2.zero();
    this.angle       = opts.angle || 0;
    this.angVel      = 0;
    this.force       = Vec2.zero();
    this.torque      = 0;

    const m          = opts.mass || 1;
    this.mass        = m;
    this.invMass     = m === 0 ? 0 : 1 / m;

    const I          = opts.inertia || 1;
    this.inertia     = I;
    this.invI        = I === 0 ? 0 : 1 / I;

    this.restitution = opts.restitution !== undefined ? opts.restitution : 0.4;
    this.friction    = opts.friction    !== undefined ? opts.friction    : 0.2;

    this.isStatic    = m === 0;
  }

  applyForce(f) {
    if (this.isStatic) return;
    this.force.addSelf(f);
  }

  applyTorque(t) {
    if (this.isStatic) return;
    this.torque += t;
  }

  applyImpulse(j, contactVec) {
    if (this.isStatic) return;
    this.vel.addSelf(j.mul(this.invMass));
    this.angVel += Vec2.cross(contactVec, j) * this.invI;
  }

  integrate(dt, gravity = 0) {
    if (this.isStatic) return;
    // Semi-implicit Euler
    if (gravity > 0) this.force.y += this.mass * gravity;
    this.vel.addSelf(this.force.mul(this.invMass * dt));
    this.angVel += this.torque * this.invI * dt;
    this.pos.addSelf(this.vel.mul(dt));
    this.angle  += this.angVel * dt;

    // Damping
    this.vel.mulSelf(0.995);
    this.angVel *= 0.98;

    this.force.set(0, 0);
    this.torque = 0;
  }

  /** Velocity of a point on the body in world space */
  velocityAt(worldPoint) {
    const r = worldPoint.sub(this.pos);
    return new Vec2(
      this.vel.x - r.y * this.angVel,
      this.vel.y + r.x * this.angVel
    );
  }
}

// ─── Impulse Resolver ─────────────────────────────────────────────────────────
/**
 * Resolve a collision between two rigid bodies using the impulse method.
 * Handles restitution (bounce) and coulomb friction in one pass.
 *
 * @param {RigidBody} bodyA
 * @param {RigidBody} bodyB
 * @param {Contact}   contact   – from SAT (normal, depth)
 * @param {number}    bias      – position correction factor (Baumgarte)
 */
export function resolveImpulse(bodyA, bodyB, contact) {
  const { normal, depth } = contact;
  if (!contact.hit || depth <= 0) return;

  // Contact point in world space (average)
  const cp     = contact.pointA;
  const rA     = cp.sub(bodyA.pos);
  const rB     = cp.sub(bodyB.pos);

  // Relative velocity at contact point
  const vA     = bodyA.velocityAt(cp);
  const vB     = bodyB.velocityAt(cp);
  const relVel = vA.sub(vB);

  // Velocity along normal
  const velN   = relVel.dot(normal);

  // Don't resolve if bodies are separating
  if (velN > 0) return;

  // Combined restitution
  const e      = Math.min(bodyA.restitution, bodyB.restitution);

  // Effective mass along normal
  const rAN    = Vec2.cross(rA, normal);
  const rBN    = Vec2.cross(rB, normal);
  const denom  = bodyA.invMass + bodyB.invMass +
                 rAN * rAN * bodyA.invI +
                 rBN * rBN * bodyB.invI;

  if (Math.abs(denom) < 1e-9) return;

  // Normal impulse scalar
  const jN    = -(1 + e) * velN / denom;
  const jVec  = normal.mul(jN);

  bodyA.applyImpulse(jVec,        rA);
  bodyB.applyImpulse(jVec.neg(),  rB);

  // ── Friction ──────────────────────────────────────────────
  // Recalculate relative velocity after normal correction
  const vA2    = bodyA.velocityAt(cp);
  const vB2    = bodyB.velocityAt(cp);
  const relV2  = vA2.sub(vB2);

  // Tangent direction
  const tangent = relV2.sub(normal.mul(relV2.dot(normal))).norm();

  const velT    = relV2.dot(tangent);
  if (Math.abs(velT) < 1e-9) return;

  const rAT     = Vec2.cross(rA, tangent);
  const rBT     = Vec2.cross(rB, tangent);
  const denomT  = bodyA.invMass + bodyB.invMass +
                  rAT * rAT * bodyA.invI +
                  rBT * rBT * bodyB.invI;
  if (Math.abs(denomT) < 1e-9) return;

  const jT      = -velT / denomT;

  // Coulomb clamp
  const mu      = (bodyA.friction + bodyB.friction) * 0.5;
  const jTClamped = clamp(jT, -Math.abs(jN) * mu, Math.abs(jN) * mu);

  const frictionVec = tangent.mul(jTClamped);
  bodyA.applyImpulse(frictionVec,        rA);
  bodyB.applyImpulse(frictionVec.neg(),  rB);
}

// ─── Position Correction (Baumgarte) ─────────────────────────────────────────
/**
 * Nudge bodies apart to prevent sinking at low velocities.
 * Should be called after resolveImpulse.
 */
export function positionalCorrection(bodyA, bodyB, contact, percent = 0.4, slop = 0.5) {
  const { normal, depth } = contact;
  if (!contact.hit) return;

  const correction = Math.max(depth - slop, 0) / (bodyA.invMass + bodyB.invMass) * percent;
  const corVec     = normal.mul(correction);

  if (!bodyA.isStatic) bodyA.pos.subSelf(corVec.mul(bodyA.invMass));
  if (!bodyB.isStatic) bodyB.pos.addSelf(corVec.mul(bodyB.invMass));
}

// ─── Clash Resolution (blade-on-blade) ───────────────────────────────────────
/**
 * Special resolution for katana-vs-katana clashes.
 * Returns the bounce impulse magnitude so sparks can be scaled.
 *
 * @param {RigidBody} bladeA
 * @param {RigidBody} bladeB
 * @param {Contact}   contact
 * @returns {number} impulse magnitude
 */
export function resolveClash(bladeA, bladeB, contact) {
  const { normal, depth } = contact;
  if (!contact.hit || depth <= 0) return 0;

  const cp   = contact.pointA;
  const rA   = cp.sub(bladeA.pos);
  const rB   = cp.sub(bladeB.pos);

  const vA   = bladeA.velocityAt(cp);
  const vB   = bladeB.velocityAt(cp);
  const relV = vA.sub(vB);
  const velN = relV.dot(normal);

  if (velN > 0) return 0;

  // High restitution clash
  const e    = 0.75;
  const rAN  = Vec2.cross(rA, normal);
  const rBN  = Vec2.cross(rB, normal);
  const denom = bladeA.invMass + bladeB.invMass +
                rAN * rAN * bladeA.invI +
                rBN * rBN * bladeB.invI;

  if (Math.abs(denom) < 1e-9) return 0;

  const jN   = -(1 + e) * velN / denom;
  const jVec = normal.mul(jN);

  bladeA.applyImpulse(jVec,       rA);
  bladeB.applyImpulse(jVec.neg(), rB);

  return Math.abs(jN);
}

// ─── Velocity constraint (joint) ──────────────────────────────────────────────
/**
 * Simple distance constraint impulse between two points
 * on possibly different bodies.  Used by cloth and robe pins.
 *
 * @param {RigidBody} bodyA
 * @param {Vec2}      anchorA   world space attachment on A
 * @param {RigidBody} bodyB
 * @param {Vec2}      anchorB   world space attachment on B
 * @param {number}    restLen   desired distance
 * @param {number}    stiffness 0–1
 */
export function distanceConstraintImpulse(bodyA, anchorA, bodyB, anchorB, restLen, stiffness = 0.8) {
  const delta = anchorB.sub(anchorA);
  const dist  = delta.len();
  if (dist < 1e-9) return;

  const error  = dist - restLen;
  const normal = delta.div(dist);
  const totalInvMass = (bodyA ? bodyA.invMass : 0) + (bodyB ? bodyB.invMass : 0);
  if (totalInvMass < 1e-9) return;

  const correction = (error * stiffness) / totalInvMass;
  const corVec     = normal.mul(correction);

  if (bodyA && !bodyA.isStatic) bodyA.pos.addSelf(corVec.mul(bodyA.invMass));
  if (bodyB && !bodyB.isStatic) bodyB.pos.subSelf(corVec.mul(bodyB.invMass));
}
