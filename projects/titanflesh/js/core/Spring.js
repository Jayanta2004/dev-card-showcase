'use strict';

/** Spring type constants for categorizing spring topology in the mesh. */
const SPRING_TYPE = Object.freeze({
  /** Connects adjacent particles within the same ring. */
  EDGE: 'edge',
  /** Connects a ring to the next ring (radial support). */
  STRUCTURAL: 'structural',
  /** Diagonal cross-ring connections for shear resistance. */
  DIAGONAL: 'diagonal',
  /** Long-range connections that preserve global shape. */
  CROSS: 'cross'
});

/**
 * Represents a spring constraint between two particles.
 * Implements both force-based and XPBD position-correction solving.
 */
class Spring {
  constructor(a, b, type = SPRING_TYPE.EDGE) {
    /** @type {Particle} */ this.a = a;
    /** @type {Particle} */ this.b = b;
    /** @type {string} */   this.type = type;
    /** Whether this spring has been torn by the tear detector. */
    this.torn = false;

    const dx = b.pos.x - a.pos.x;
    const dy = b.pos.y - a.pos.y;
    /** Rest (natural) length at time of creation. */
    this.restLength = Math.hypot(dx, dy);
    this._baseRestLength = this.restLength;
    /** Stiffness coefficient (0..1). Higher = stiffer spring. */
    this.stiffness = this._defaultStiffness(type);
    this._baseStiffness = this.stiffness;
    /** Velocity-proportional damping factor. */
    this.damping = CFG.SPRING_DAMPING ?? 0.02;
    /** Internal stress ratio (0..1) for rendering/tearing logic. */
    this._stressRatio = 0;
    /** Absolute force magnitude computed last frame. */
    this._forceMag = 0;
    /** Whether the spring is currently active. */
    this._active = true;
  }

  /** Returns default stiffness based on spring type. */
  _defaultStiffness(type) {
    const base = CFG.SPRING_STIFFNESS ?? 0.85;
    switch (type) {
      case SPRING_TYPE.EDGE:       return base;
      case SPRING_TYPE.STRUCTURAL: return base * 0.90;
      case SPRING_TYPE.DIAGONAL:   return base * 0.65;
      case SPRING_TYPE.CROSS:      return base * 0.45;
      default:                     return base;
    }
  }

  /** Current Euclidean length of this spring. */
  get currentLength() {
    const dx = this.b.pos.x - this.a.pos.x;
    const dy = this.b.pos.y - this.a.pos.y;
    return Math.hypot(dx, dy);
  }

  /** Fractional strain = (currentLength - restLength) / restLength. */
  get strain() {
    return this.restLength > 1e-8
      ? (this.currentLength - this.restLength) / this.restLength
      : 0;
  }

  /** Read-only stress ratio set by accumulateForce. */
  get stressRatio() { return this._stressRatio; }

  /** Read-only absolute force magnitude last frame. */
  get forceMag() { return this._forceMag; }

  /** True when stress exceeds the configured tear ratio. */
  get isOverstretched() {
    return this._stressRatio > (CFG.SPRING_TEAR_RATIO ?? 0.85);
  }

  /**
   * Accumulates spring + damping forces onto both endpoint particles.
   * Called once per update step before constraint solving.
   */
  accumulateForce() {
    if (this.torn || !this._active) return;
    const dx = this.b.pos.x - this.a.pos.x;
    const dy = this.b.pos.y - this.a.pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1e-8) return;
    const stretch = dist - this.restLength;
    const forceMag = stretch * this.stiffness;
    this._forceMag = Math.abs(forceMag);
    const maxStress = this.restLength * this.stiffness * (CFG.SPRING_TEAR_THRESHOLD ?? 800);
    this._stressRatio = MathUtils.clamp(this._forceMag / (maxStress + 1e-8), 0, 1);
    const nx = dx / dist, ny = dy / dist;
    const vax = this.a.pos.x - this.a.prevPos.x;
    const vay = this.a.pos.y - this.a.prevPos.y;
    const vbx = this.b.pos.x - this.b.prevPos.x;
    const vby = this.b.pos.y - this.b.prevPos.y;
    const relVel = (vbx - vax) * nx + (vby - vay) * ny;
    const dampForce = relVel * this.damping;
    const total = forceMag + dampForce;
    this.a.addForce( nx * total * this.a.invMass,  ny * total * this.a.invMass);
    this.b.addForce(-nx * total * this.b.invMass, -ny * total * this.b.invMass);
  }

  /**
   * Position-based XPBD constraint solve.
   * @param {number} compliance - Inverse stiffness (0 = rigid).
   * @param {number} dt - Sub-step delta time.
   */
  solveConstraint(compliance = 0, dt = 16) {
    if (this.torn || !this._active) return;
    const dx = this.b.pos.x - this.a.pos.x;
    const dy = this.b.pos.y - this.a.pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1e-8) return;
    const diff = dist - this.restLength;
    if (Math.abs(diff) < 1e-6) return;
    const wA = this.a.pinned || this.a.dead ? 0 : this.a.invMass;
    const wB = this.b.pinned || this.b.dead ? 0 : this.b.invMass;
    const wSum = wA + wB;
    if (wSum < 1e-12) return;
    const alpha = compliance / (dt * dt);
    const lambda = -diff / (wSum + alpha);
    const nx = dx / dist, ny = dy / dist;
    const wa = wA / wSum, wb = wB / wSum;
    if (!this.a.pinned && !this.a.dead) {
      this.a.pos.x -= nx * lambda * wa * this.stiffness;
      this.a.pos.y -= ny * lambda * wa * this.stiffness;
    }
    if (!this.b.pinned && !this.b.dead) {
      this.b.pos.x += nx * lambda * wb * this.stiffness;
      this.b.pos.y += ny * lambda * wb * this.stiffness;
    }
  }

  /** Mark this spring as torn and boost stress on endpoints. */
  tear() {
    this.torn = true;
    this._active = false;
    this.a.addStress(this._stressRatio * 0.5);
    this.b.addStress(this._stressRatio * 0.5);
  }

  /** Set rest length to the current Euclidean distance. */
  setRestLengthToCurrent() {
    this.restLength = this.currentLength;
  }

  /** Gradually relax rest length toward current length (soft settle). */
  relax(rate = 0.01) {
    this.restLength = MathUtils.lerp(this.restLength, this.currentLength, rate);
  }

  /** Restore stiffness to the value determined by spring type. */
  resetStiffness() {
    this.stiffness = this._baseStiffness;
  }
}
