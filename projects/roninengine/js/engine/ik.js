// ============================================================
//  RoninEngine — engine/ik.js
//  Multi-joint IK skeleton with two-bone solver,
//  joint constraints, momentum propagation
// ============================================================

'use strict';

import { Vec2, clamp, wrapAngle, angleDiff, lerpAngle, lerp } from '../core/math.js';
import { SKEL, IK as IK_CFG, GROUND_Y } from '../core/config.js';

// ─── Joint ────────────────────────────────────────────────────────────────────
export class Joint {
  constructor(name, parent = null) {
    this.name     = name;
    this.parent   = parent;
    this.children = [];

    this.localAngle   = 0;     // angle relative to parent
    this.worldAngle   = 0;     // computed each frame
    this.worldPos     = Vec2.zero();

    // Constraints
    this.minAngle     = -Math.PI;
    this.maxAngle     =  Math.PI;

    // Dynamics
    this.angularVel   = 0;     // rad/s
    this.torque       = 0;
    this.stiffness    = 0.8;
    this.damping      = 0.88;

    if (parent) parent.children.push(this);
  }

  applyConstraints() {
    this.localAngle = clamp(this.localAngle, this.minAngle, this.maxAngle);
  }

  integrate(dt) {
    this.angularVel  += this.torque * dt;
    this.angularVel  *= this.damping;
    this.localAngle  += this.angularVel * dt;
    this.applyConstraints();
    this.torque       = 0;
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export class Skeleton {
  /**
   * @param {Vec2} rootPos  – hip / root world position
   * @param {number} facing – +1 right, -1 left
   */
  constructor(rootPos, facing = 1) {
    this.root    = rootPos.clone();
    this.facing  = facing;

    // ── Build joints ────────────────────────────────────────
    this.hip          = new Joint('hip');
    this.torso        = new Joint('torso',      this.hip);
    this.neck         = new Joint('neck',       this.torso);
    this.head         = new Joint('head',       this.neck);

    this.lShoulder    = new Joint('lShoulder',  this.torso);
    this.lElbow       = new Joint('lElbow',     this.lShoulder);
    this.lWrist       = new Joint('lWrist',     this.lElbow);

    this.rShoulder    = new Joint('rShoulder',  this.torso);
    this.rElbow       = new Joint('rElbow',     this.rShoulder);
    this.rWrist       = new Joint('rWrist',     this.rElbow);

    this.lHip         = new Joint('lHip',       this.hip);
    this.lKnee        = new Joint('lKnee',      this.lHip);
    this.lAnkle       = new Joint('lAnkle',     this.lKnee);

    this.rHip         = new Joint('rHip',       this.hip);
    this.rKnee        = new Joint('rKnee',      this.rHip);
    this.rAnkle       = new Joint('rAnkle',     this.rKnee);

    // ── Bone lengths ────────────────────────────────────────
    this.lengths = {
      hip       : 0,
      torso     : SKEL.torsoLen,
      neck      : SKEL.neckLen,
      head      : SKEL.headRadius,
      lShoulder : SKEL.upperArmLen,
      lElbow    : SKEL.lowerArmLen,
      lWrist    : SKEL.handLen,
      rShoulder : SKEL.upperArmLen,
      rElbow    : SKEL.lowerArmLen,
      rWrist    : SKEL.handLen,
      lHip      : SKEL.upperLegLen,
      lKnee     : SKEL.lowerLegLen,
      lAnkle    : SKEL.footLen,
      rHip      : SKEL.upperLegLen,
      rKnee     : SKEL.lowerLegLen,
      rAnkle    : SKEL.footLen,
    };

    // ── Apply joint constraints ──────────────────────────────
    this._applyJointLimits();

    // Cached world positions for rendering
    this.positions = {};

    // Velocities for momentum-based propagation
    this.rootVel = Vec2.zero();
    this.prevRoot = rootPos.clone();

    this._defaultPose();
  }

  // ─────────────────────────────────────────────────────────
  _applyJointLimits() {
    this.lElbow.minAngle = IK_CFG.elbowMinAngle;
    this.lElbow.maxAngle = IK_CFG.elbowMaxAngle;
    this.rElbow.minAngle = IK_CFG.elbowMinAngle;
    this.rElbow.maxAngle = IK_CFG.elbowMaxAngle;

    this.lShoulder.minAngle = IK_CFG.shoulderMinH;
    this.lShoulder.maxAngle = IK_CFG.shoulderMaxH;
    this.rShoulder.minAngle = IK_CFG.shoulderMinH;
    this.rShoulder.maxAngle = IK_CFG.shoulderMaxH;

    this.lKnee.minAngle = IK_CFG.kneeMinAngle;
    this.lKnee.maxAngle = IK_CFG.kneeMaxAngle;
    this.rKnee.minAngle = IK_CFG.kneeMinAngle;
    this.rKnee.maxAngle = IK_CFG.kneeMaxAngle;
  }

  _defaultPose() {
    this.hip.localAngle      = 0;
    this.torso.localAngle    = -0.05;
    this.neck.localAngle     =  0.06;
    this.rShoulder.localAngle = -0.35;
    this.rElbow.localAngle   = -1.2;
    this.lShoulder.localAngle =  0.3;
    this.lElbow.localAngle   = -1.0;
    this.rHip.localAngle     =  0.1;
    this.rKnee.localAngle    = -0.35;
    this.lHip.localAngle     = -0.1;
    this.lKnee.localAngle    = -0.35;
    this.forwardKinematics();
  }

  // ─── Forward Kinematics ───────────────────────────────────
  /**
   * Walk the skeleton tree and compute world positions / angles
   * for every joint given the current local angles.
   */
  forwardKinematics() {
    const fac = this.facing;

    // Hip sits at root
    this.hip.worldPos.setV(this.root);
    this.hip.worldAngle = this.hip.localAngle;

    // Torso goes upward from hip
    this._fkStep(this.hip, this.torso,     0, -this.lengths.torso);

    // Neck / head from torso top
    this._fkStep(this.torso, this.neck,    0, -this.lengths.neck);
    this._fkStep(this.neck,  this.head,    0, -this.lengths.head);

    // Shoulders branch off torso mid-point
    const shoulderY = -SKEL.torsoLen * 0.75;
    this._fkStep(this.torso, this.lShoulder,  fac * -SKEL.shoulderW * 0.5, shoulderY);
    this._fkStep(this.torso, this.rShoulder,  fac *  SKEL.shoulderW * 0.5, shoulderY);
    this._fkStep(this.lShoulder, this.lElbow, 0, -this.lengths.lShoulder);
    this._fkStep(this.rShoulder, this.rElbow, 0, -this.lengths.rShoulder);
    this._fkStep(this.lElbow,    this.lWrist, 0, -this.lengths.lElbow);
    this._fkStep(this.rElbow,    this.rWrist, 0, -this.lengths.rElbow);

    // Legs branch from hip sides
    const legOffX = fac * SKEL.hipW * 0.5;
    this._fkStep(this.hip,  this.lHip,   -legOffX, 0);
    this._fkStep(this.hip,  this.rHip,    legOffX, 0);
    this._fkStep(this.lHip,  this.lKnee,  0,  this.lengths.lHip);
    this._fkStep(this.rHip,  this.rKnee,  0,  this.lengths.rHip);
    this._fkStep(this.lKnee, this.lAnkle, 0,  this.lengths.lKnee);
    this._fkStep(this.rKnee, this.rAnkle, 0,  this.lengths.rKnee);

    // Cache positions map
    this._cachePositions();
  }

  /** Compute child world pos/angle from parent + local offset */
  _fkStep(parent, child, localX, localY) {
    const pa  = parent.worldAngle;
    const c   = Math.cos(pa), s = Math.sin(pa);
    const wx  = parent.worldPos.x + localX * c - localY * s;
    const wy  = parent.worldPos.y + localX * s + localY * c;
    child.worldPos.set(wx, wy);
    child.worldAngle = pa + child.localAngle;
  }

  _cachePositions() {
    const joints = [
      'hip','torso','neck','head',
      'lShoulder','lElbow','lWrist',
      'rShoulder','rElbow','rWrist',
      'lHip','lKnee','lAnkle',
      'rHip','rKnee','rAnkle',
    ];
    for (const name of joints) {
      this.positions[name] = this[name].worldPos.clone();
    }
  }

  // ─── Two-Bone IK Solver ───────────────────────────────────
  /**
   * Solves a two-bone (upper + lower) chain so the tip reaches `target`.
   * Optionally enforces an "inside" bend direction via `hint` (+1 / -1).
   *
   * @param {Joint}  upper     – root of upper bone
   * @param {Joint}  lower     – elbow / knee
   * @param {Joint}  end       – tip (wrist / ankle)
   * @param {Vec2}   target    – desired world position of tip
   * @param {number} upperLen
   * @param {number} lowerLen
   * @param {number} hint      – bend direction preference
   */
  solveIK2Bone(upper, lower, end, target, upperLen, lowerLen, hint = 1) {
    const root   = upper.worldPos;
    const dx     = target.x - root.x;
    const dy     = target.y - root.y;
    const dist   = Math.sqrt(dx*dx + dy*dy);
    const maxLen = upperLen + lowerLen - 0.01;
    const minLen = Math.abs(upperLen - lowerLen) + 0.01;
    const reach  = clamp(dist, minLen, maxLen);

    // Direction to target
    const targetAngle = Math.atan2(dy, dx);

    // Law of cosines for elbow angle
    const cosElbow = (upperLen*upperLen + lowerLen*lowerLen - reach*reach)
                     / (2 * upperLen * lowerLen);
    const elbowAngle = Math.acos(clamp(cosElbow, -1, 1));

    // Upper bone angle
    const cosUpper  = (upperLen*upperLen + reach*reach - lowerLen*lowerLen)
                      / (2 * upperLen * reach);
    const upperBend = Math.acos(clamp(cosUpper, -1, 1)) * hint;

    // Convert to local angles (subtract parent world angle)
    const newUpperWorld = targetAngle - upperBend;
    upper.localAngle    = wrapAngle(newUpperWorld - (upper.parent ? upper.parent.worldAngle : 0));
    upper.applyConstraints();

    // Recompute elbow position
    const upperW = upper.parent ? upper.parent.worldAngle + upper.localAngle : upper.localAngle;
    const elbowX = root.x + Math.cos(upperW) * upperLen;
    const elbowY = root.y + Math.sin(upperW) * upperLen;
    lower.worldPos.set(elbowX, elbowY);

    // Lower bone angle
    const dex = target.x - elbowX, dey = target.y - elbowY;
    const lowerWorld = Math.atan2(dey, dex);
    lower.localAngle = wrapAngle(lowerWorld - upperW);
    lower.applyConstraints();

    // Forward-kinematics to propagate
    lower.worldAngle = upperW + lower.localAngle;
    end.worldPos.set(
      elbowX + Math.cos(lower.worldAngle) * lowerLen,
      elbowY + Math.sin(lower.worldAngle) * lowerLen
    );
    end.worldAngle = lower.worldAngle + end.localAngle;
  }

  // ─── Swing Arc ────────────────────────────────────────────
  /**
   * Generate a natural swing arc target for the sword arm.
   * Returns interpolated world-space Vec2 target for the wrist.
   *
   * @param {Vec2}   anchor  – shoulder world pos
   * @param {number} t       – arc progress 0→1
   * @param {string} type    – 'horizontal' | 'vertical' | 'diagonal'
   * @param {number} facing  – +1 / -1
   */
  generateSwingArc(anchor, t, type = 'horizontal', facing = 1) {
    const ease = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;   // cubic ease in-out

    let angle, radius;
    switch (type) {
      case 'horizontal':
        angle  = lerp(-0.8, 1.6, ease) * facing;
        radius = SKEL.upperArmLen + SKEL.lowerArmLen - 10;
        return new Vec2(
          anchor.x + Math.cos(angle) * radius,
          anchor.y + Math.sin(angle) * radius * 0.3 - 20
        );
      case 'vertical':
        angle  = lerp(-1.5, -0.1, ease);
        radius = SKEL.upperArmLen + SKEL.lowerArmLen;
        return new Vec2(
          anchor.x + facing * Math.cos(angle) * radius * 0.5,
          anchor.y + Math.sin(angle) * radius
        );
      case 'diagonal':
        angle  = lerp(-1.2, 0.8, ease) * facing;
        radius = SKEL.upperArmLen + SKEL.lowerArmLen - 5;
        return new Vec2(
          anchor.x + Math.cos(angle - 0.4) * radius,
          anchor.y + Math.sin(angle + 0.3) * radius
        );
      default:
        return anchor.clone();
    }
  }

  // ─── Momentum Propagation ───────────────────────────────────
  /**
   * Compute root velocity from position delta, then nudge
   * limb joints according to inertia (momentum carry-over).
   */
  propagateMomentum(dt) {
    if (dt <= 0) return;
    const vel = this.root.sub(this.prevRoot).div(dt);
    this.prevRoot.setV(this.root);
    this.rootVel = vel;

    // Limbs swing opposite to movement direction
    const vx = vel.x * 0.0008;
    const vy = vel.y * 0.0004;

    this.lShoulder.torque += -vx * 0.5;
    this.rShoulder.torque +=  vx * 0.5;
    this.lHip.torque      +=  vx * 0.3;
    this.rHip.torque      += -vx * 0.3;
    this.torso.torque     += -vx * 0.2 + vy * 0.1;
  }

  // ─── Integrate Dynamics ───────────────────────────────────
  integrate(dt) {
    const dynJoints = [
      this.torso, this.neck,
      this.lShoulder, this.lElbow,
      this.rShoulder, this.rElbow,
      this.lHip, this.lKnee,
      this.rHip, this.rKnee,
    ];
    for (const j of dynJoints) j.integrate(dt);
  }

  // ─── Get all bone segments (for rendering) ────────────────
  getBones() {
    const p = this.positions;
    return [
      { a: p.hip,       b: p.torso,      r: 9  },
      { a: p.torso,     b: p.neck,       r: 7  },
      { a: p.neck,      b: p.head,       r: 6  },
      { a: p.torso,     b: p.lShoulder,  r: 7  },
      { a: p.lShoulder, b: p.lElbow,     r: 6  },
      { a: p.lElbow,    b: p.lWrist,     r: 5  },
      { a: p.torso,     b: p.rShoulder,  r: 7  },
      { a: p.rShoulder, b: p.rElbow,     r: 6  },
      { a: p.rElbow,    b: p.rWrist,     r: 5  },
      { a: p.hip,       b: p.lHip,       r: 8  },
      { a: p.lHip,      b: p.lKnee,      r: 7  },
      { a: p.lKnee,     b: p.lAnkle,     r: 6  },
      { a: p.hip,       b: p.rHip,       r: 8  },
      { a: p.rHip,      b: p.rKnee,      r: 7  },
      { a: p.rKnee,     b: p.rAnkle,     r: 6  },
    ];
  }
}

// ─── Utility: solve FABRIK-style single chain ────────────────────────────────
/**
 * Forward And Backward Reaching IK for longer chains (optional).
 * Modifies `joints` positions in place (world space).
 *
 * @param {Vec2[]} positions  – mutable world positions array [root … tip]
 * @param {number[]} lengths  – bone lengths array (length = positions.length - 1)
 * @param {Vec2} base         – fixed root position
 * @param {Vec2} target       – desired tip position
 * @param {number} iterations
 */
export function solveFABRIK(positions, lengths, base, target, iterations = 6) {
  const n   = positions.length;
  const tip = n - 1;

  for (let iter = 0; iter < iterations; iter++) {
    // Forward pass (tip → base)
    positions[tip].setV(target);
    for (let i = tip - 1; i >= 0; i--) {
      const dir  = positions[i].sub(positions[i+1]).norm();
      positions[i] = positions[i+1].add(dir.mul(lengths[i]));
    }

    // Backward pass (base → tip)
    positions[0].setV(base);
    for (let i = 1; i < n; i++) {
      const dir  = positions[i].sub(positions[i-1]).norm();
      positions[i] = positions[i-1].add(dir.mul(lengths[i-1]));
    }
  }
}
