'use strict';
class Particle {
  constructor(x, y, mass = 1) {
    this.id = MathUtils.nextId();
    this.pos = new Vec2(x, y);
    this.prevPos = new Vec2(x, y);
    this.force = new Vec2(0, 0);
    this.mass = mass;
    this.invMass = mass > 0 ? 1 / mass : 0;
    this.pinned = false;
    this.dead = false;
    this.springs = [];
    this.pressure = 0;
    this.stressLevel = 0;
    this.rippleOffset = 0;
    this.glowIntensity = 0;
    this.ring = -1;
    this.ringIdx = 0;
    this.ringTotal = 1;
    this.ringFrac = 0;
    this.baseRadius = 0;
    this.spikeLength = 0;
    this.spikeAngle = 0;
    this._accumFx = 0;
    this._accumFy = 0;
  }
  get vel() {
    return { x: this.pos.x - this.prevPos.x, y: this.pos.y - this.prevPos.y };
  }
  get speed() {
    const v = this.vel;
    return Math.hypot(v.x, v.y);
  }
  get kineticEnergy() {
    const v = this.vel;
    return 0.5 * this.mass * (v.x * v.x + v.y * v.y);
  }
  addForce(fx, fy) {
    if (this.pinned || this.dead) return;
    this._accumFx += fx;
    this._accumFy += fy;
  }
  flushForces() {
    this.force.x += this._accumFx;
    this.force.y += this._accumFy;
    this._accumFx = 0;
    this._accumFy = 0;
  }
  applyImpulse(ix, iy) {
    if (this.pinned || this.dead) return;
    const cx = this.pos.x - this.prevPos.x;
    const cy = this.pos.y - this.prevPos.y;
    this.prevPos.x = this.pos.x - cx - ix * this.invMass;
    this.prevPos.y = this.pos.y - cy - iy * this.invMass;
  }
  applyPositionCorrection(dx, dy, weight = 1) {
    if (this.pinned || this.dead || this.invMass === 0) return;
    this.pos.x += dx * weight;
    this.pos.y += dy * weight;
  }
  clearForces() {
    this.force.x = 0;
    this.force.y = 0;
    this._accumFx = 0;
    this._accumFy = 0;
  }
  distanceTo(other) {
    return Math.hypot(this.pos.x - other.pos.x, this.pos.y - other.pos.y);
  }
  distanceSqTo(other) {
    const dx = this.pos.x - other.pos.x;
    const dy = this.pos.y - other.pos.y;
    return dx * dx + dy * dy;
  }
  dirTo(other) {
    const dx = other.pos.x - this.pos.x;
    const dy = other.pos.y - this.pos.y;
    const d = Math.hypot(dx, dy);
    return d < 1e-8 ? new Vec2(0, 0) : new Vec2(dx / d, dy / d);
  }
  decayVisuals(dt) {
    const rate = dt * 0.001;
    this.stressLevel = Math.max(0, this.stressLevel - rate * 0.6);
    this.glowIntensity = Math.max(0, this.glowIntensity - rate * 0.8);
    this.rippleOffset *= Math.pow(0.985, dt * 0.06);
    if (this.spikeLength > 0) {
      this.spikeLength = Math.max(0, this.spikeLength - rate * 0.3);
    }
  }
  addStress(amount) {
    this.stressLevel = MathUtils.clamp(this.stressLevel + amount, 0, 1);
    this.glowIntensity = MathUtils.clamp(this.glowIntensity + amount * 0.8, 0, 1);
  }
  setSpike(length, angle) {
    this.spikeLength = length;
    this.spikeAngle = angle;
  }
  setRipple(offset) {
    this.rippleOffset = offset;
  }
  pin() {
    this.pinned = true;
    this.invMass = 0;
  }
  unpin() {
    this.pinned = false;
    this.invMass = this.mass > 0 ? 1 / this.mass : 0;
  }
  kill() {
    this.dead = true;
    this.pinned = true;
    this.invMass = 0;
    this.springs = [];
  }
  setMass(m) {
    this.mass = m;
    this.invMass = m > 0 && !this.pinned ? 1 / m : 0;
  }
  syncPrevPos() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }
  clone() {
    const p = new Particle(this.pos.x, this.pos.y, this.mass);
    p.prevPos.x = this.prevPos.x;
    p.prevPos.y = this.prevPos.y;
    p.ring = this.ring;
    p.ringIdx = this.ringIdx;
    p.ringFrac = this.ringFrac;
    p.ringTotal = this.ringTotal;
    return p;
  }
}
