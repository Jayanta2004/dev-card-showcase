'use strict';

/**
 * Tracks cumulative damage and applies permanent mesh mutations:
 * - Spike growth on boundary particles
 * - Mass variance (heavier/lighter sections)
 * - Constraint stiffness degradation with heal-over-time
 */
class MutationSystem {
  constructor(body) {
    /** @type {FleshBody} */
    this._body = body;
    this._totalTears = 0;
    this._damageLevel = 0;
    this._healRate = CFG.HEAL_RATE ?? 0.00015;
    this._maxDamage = 1;
    this._spikeThreshold = CFG.MUTATION_SPIKE_THRESHOLD ?? 0.25;
    this._degradeThreshold = CFG.MUTATION_DEGRADE_THRESHOLD ?? 0.5;
    this._time = 0;
    this._lastMutationTime = 0;
  }

  /** Called each frame. Processes healing and spike animation. */
  update(dt) {
    if (!this._body) return;
    this._time += dt;
    this._healDamage(dt);
    if (this._damageLevel > this._spikeThreshold) {
      this._animateSpikes(dt);
    }
  }

  /** Register a batch of tear events and apply mutations. */
  processTears(tearEvents) {
    if (!tearEvents.length) return;
    this._totalTears += tearEvents.length;
    this._damageLevel = Math.min(this._maxDamage, this._damageLevel + tearEvents.length * 0.06);
    this._lastMutationTime = this._time;
    for (const ev of tearEvents) {
      this._growSpikesNear(ev.x, ev.y);
    }
    if (this._damageLevel > this._degradeThreshold) {
      this._degradeNearSprings(tearEvents);
    }
    if (this._damageLevel > 0.7) {
      this._perturbMass();
    }
  }

  /** Grow spikes on boundary particles near a tear position. */
  _growSpikesNear(x, y) {
    const body = this._body;
    const bound = body.lattice?.boundaryLoop ?? [];
    const radius = 90;
    for (const p of bound) {
      if (p.dead) continue;
      const dx = p.pos.x - x, dy = p.pos.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) continue;
      const t = 1 - dist / radius;
      const ang = Math.atan2(dy, dx);
      const existing = p.spikeLength ?? 0;
      p.setSpike(Math.min(1, existing + t * 0.6), ang);
    }
  }

  /** Gradually increase spring stiffness variance near recent tears. */
  _degradeNearSprings(tearEvents) {
    const body = this._body;
    const rate = MathUtils.clamp((this._damageLevel - this._degradeThreshold) * 0.1, 0, 0.06);
    for (const s of body.springs) {
      if (s.torn) continue;
      for (const ev of tearEvents) {
        const mx = (s.a.pos.x + s.b.pos.x) * 0.5;
        const my = (s.a.pos.y + s.b.pos.y) * 0.5;
        const dist = Math.hypot(mx - ev.x, my - ev.y);
        if (dist < 60) {
          s.stiffness = Math.max(s.stiffness * (1 - rate), s._baseStiffness * 0.4);
        }
      }
    }
  }

  /** Apply slight random mass perturbation to add organic variation. */
  _perturbMass() {
    const body = this._body;
    for (const p of body.particles) {
      if (p.dead || p.pinned || Math.random() > 0.05) continue;
      const delta = (Math.random() - 0.5) * 0.08 * this._damageLevel;
      p.setMass(Math.max(0.1, p.mass + delta));
    }
  }

  /** Animate spike lengths with slight oscillation. */
  _animateSpikes(dt) {
    const bound = this._body.lattice?.boundaryLoop ?? [];
    const wave = Math.sin(this._time * 0.003);
    for (const p of bound) {
      if (p.spikeLength > 0.05) {
        p.spikeLength = MathUtils.clamp(p.spikeLength + wave * dt * 0.0002, 0, 1);
      }
    }
  }

  /** Slowly heal damage level over time. */
  _healDamage(dt) {
    if (this._damageLevel > 0) {
      this._damageLevel = Math.max(0, this._damageLevel - this._healRate * dt);
    }
    if (this._damageLevel < this._spikeThreshold) {
      this._retractSpikes(dt);
    }
  }

  /** Slowly retract spikes when sufficiently healed. */
  _retractSpikes(dt) {
    const bound = this._body?.lattice?.boundaryLoop ?? [];
    for (const p of bound) {
      if (p.spikeLength > 0) {
        p.spikeLength = Math.max(0, p.spikeLength - dt * 0.0004);
      }
    }
  }

  /** Reset all mutation state (called on rebuild). */
  reset() {
    this._damageLevel = 0;
    this._totalTears = 0;
    this._time = 0;
    this._lastMutationTime = 0;
  }

  get totalTears() { return this._totalTears; }
  get damageLevel() { return this._damageLevel; }
  get isMutating() { return this._damageLevel > this._spikeThreshold; }
}
