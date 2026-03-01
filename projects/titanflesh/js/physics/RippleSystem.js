'use strict';

class Ripple {
  constructor(x, y, force, maxRadius, birthTime) {
    /** @type {number} Origin X of the wavefront centre. */
    this.x = x;
    /** @type {number} Origin Y of the wavefront centre. */
    this.y = y;
    /** @type {number} Initial force amplitude. */
    this.force = force;
    /** @type {number} Outward-growth speed (pixels per tick). */
    this.speed = CFG.RIPPLE_SPEED ?? 3.5;
    /** @type {number} Maximum radius before ring expires. */
    this.maxRadius = maxRadius;
    /** @type {number} Current outer radius of the wavefront. */
    this.radius = 0;
    /** @type {number} Current amplitude (decays over time). */
    this.amplitude = force;
    /** @type {number} Amplitude decay factor per tick. */
    this.decay = CFG.RIPPLE_DECAY ?? 0.94;
    /** @type {number} Half-width of the sine-profile wavefront band. */
    this.width = maxRadius * 0.22;
    /** @type {number} Simulation time this ripple was born. */
    this.birthTime = birthTime;
    /** @type {boolean} Set to true once the ring has expired. */
    this.dead = false;
  }

  update(dt) {
    this.radius    += this.speed * dt * 0.06;
    this.amplitude *= Math.pow(this.decay, dt * 0.06);
    if (this.radius > this.maxRadius || this.amplitude < 0.005) {
      this.dead = true;
    }
  }

  influenceAt(px, py) {
    const dx   = px - this.x;
    const dy   = py - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const diff = Math.abs(dist - this.radius);
    if (diff > this.width) return 0;
    const t = 1 - diff / this.width;
    return Math.sin(t * Math.PI) * this.amplitude * t;
  }

  /**
   * Return the age of this ripple in seconds.
   */
  age(currentTime) {
    return currentTime - this.birthTime;
  }
}

class RippleSystem {
  constructor() {
    /** @type {Ripple[]} Pool of currently active ripples. */
    this._ripples = [];
    /** @type {number} Internal simulation time (seconds). */
    this._time = 0;
    /** @type {boolean} When false the system updates nothing. */
    this._enabled = true;
    /** @type {number} Maximum concurrent ripples (oldest removed when exceeded). */
    this._maxRipples = CFG.MAX_RIPPLES ?? 6;
  }

  spawn(x, y, force, maxRadius) {
    if (!this._enabled) return;
    while (this._ripples.length >= this._maxRipples) {
      this._ripples.shift();
    }
    this._ripples.push(new Ripple(x, y, force, maxRadius, this._time));
  }

  /**
   * Advance all ripples and apply forces to particles.
   */
  update(particles, dt) {
    if (!this._enabled) return;
    this._time += dt;

    for (const r of this._ripples) {
      r.update(dt);
    }

    // Remove expired ripples
    for (let i = this._ripples.length - 1; i >= 0; i--) {
      if (this._ripples[i].dead) this._ripples.splice(i, 1);
    }

    if (this._ripples.length > 0) {
      this._applyToParticles(particles);
    }
  }

  _applyToParticles(particles) {
    for (const p of particles) {
      if (p.pinned || p.dead) continue;
      let totalInfluence = 0;

      for (const ripple of this._ripples) {
        const inf = ripple.influenceAt(p.pos.x, p.pos.y);
        if (Math.abs(inf) < 1e-4) continue;

        // Radial direction away from ripple origin
        const dx   = p.pos.x - ripple.x;
        const dy   = p.pos.y - ripple.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1e-6) continue;

        const nx = dx / dist;
        const ny = dy / dist;
        const scale = inf * (p.mass ?? 1) * 0.12;

        p.addForce(nx * scale, ny * scale);
        totalInfluence += Math.abs(inf);
      }

      // Visual response proportional to summed influence
      if (totalInfluence > 0.05) {
        p.setRipple?.(totalInfluence * 8);
        p.addStress?.(totalInfluence * 0.1);
      }
    }
  }

  /**
   * Remove all active ripples immediately.
   */
  clear() {
    this._ripples = [];
  }

  /**
   * Return stats for HUD display.
   */
  getStats() {
    return {
      count:   this._ripples.length,
      enabled: this._enabled,
      time:    this._time
    };
  }

  // ---- Accessors ----

  /** @param {boolean} v */
  setEnabled(v) { this._enabled = Boolean(v); }

  /** @returns {number} Number of currently active ripples. */
  get count() { return this._ripples.length; }

  /** @returns {boolean} */
  get enabled() { return this._enabled; }
}
