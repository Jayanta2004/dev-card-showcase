'use strict';

class TearEvent {
  /**
   */
  constructor(spring, x, y) {
    /** @type {Spring} Reference to the torn spring. */
    this.spring = spring;
    /** @type {number} World X of tear midpoint. */
    this.x = x;
    /** @type {number} World Y of tear midpoint. */
    this.y = y;
    /** @type {number} Wall-clock timestamp when the tear occurred. */
    this.time = Date.now();
    /** @type {number} Absolute force magnitude at time of tear. */
    this.force = spring._forceMag ?? 0;
    /** @type {number} Stress ratio at time of tear (0-1). */
    this.stressRatio = spring.stressRatio ?? 0;
    /** @type {string} Spring type label for diagnostics. */
    this.springType = spring.type ?? 'unknown';
  }
}

class TearDetector {
  /**
   */
  constructor(cfg = {}) {
    /** @type {number} Absolute tear force threshold. */
    this.threshold = cfg.threshold ?? CFG.SPRING_TEAR_THRESHOLD ?? 800;
    /** @type {number} Relative stress ratio threshold (0 = never, 1 = at max stretch). */
    this.tearRatio = cfg.tearRatio ?? CFG.SPRING_TEAR_RATIO ?? 0.85;
    /** @type {number} Max springs that can tear in one detect() call. */
    this.maxTearsPerFrame = cfg.maxTearsPerFrame ?? 3;
    /** @type {boolean} Kill switch for the entire detection system. */
    this._enabled = true;
    /** @type {number} Total tears detected over the session lifetime. */
    this._totalTears = 0;
    /** @type {TearEvent[]} Circular history of recent tear events (capped at 20). */
    this._history = [];
  }

  detect(springs) {
    if (!this._enabled || !springs.length) return [];

    // Collect tear candidates
    const candidates = [];
    for (let i = 0; i < springs.length; i++) {
      const s = springs[i];
      if (s.torn) continue;
      if (this._shouldTear(s)) candidates.push(s);
    }
    if (!candidates.length) return [];

    // Sort by descending force so highest-stressed tears first
    candidates.sort((a, b) => (b._forceMag ?? 0) - (a._forceMag ?? 0));

    const toTear = candidates.slice(0, this.maxTearsPerFrame);
    const events = [];

    for (const s of toTear) {
      const mx = (s.a.pos.x + s.b.pos.x) * 0.5;
      const my = (s.a.pos.y + s.b.pos.y) * 0.5;
      s.tear();
      this._propagateStress(s);
      const ev = new TearEvent(s, mx, my);
      events.push(ev);
      this._recordHistory(ev);
      this._totalTears++;
    }

    return events;
  }

  _shouldTear(spring) {
    // Check relative stress ratio
    if (spring.stressRatio >= this.tearRatio) return true;

    // Check absolute extension force
    const dx = spring.b.pos.x - spring.a.pos.x;
    const dy = spring.b.pos.y - spring.a.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const extension  = dist - spring.restLength;
    const absForce   = Math.abs(extension * spring.stiffness);
    const tearForce  = spring.restLength * (this.threshold / 100);
    return absForce > tearForce;
  }

  _propagateStress(tornSpring) {
    const neighbors = new Set();

    // Gather non-torn springs connected to either endpoint
    for (const s of (tornSpring.a.springs ?? [])) {
      if (!s.torn) neighbors.add(s);
    }
    for (const s of (tornSpring.b.springs ?? [])) {
      if (!s.torn) neighbors.add(s);
    }

    if (!neighbors.size) return;

    const stressBoost = (tornSpring.stressRatio ?? 0) * 0.25;
    const perSpring   = stressBoost / neighbors.size;

    for (const s of neighbors) {
      s.a.addStress?.(perSpring);
      s.b.addStress?.(perSpring);
    }
  }

  /**
   * Push a TearEvent into the capped history ring.
   */
  _recordHistory(ev) {
    this._history.push(ev);
    if (this._history.length > 20) {
      this._history.shift();
    }
  }

  /**
   * Return a copy of the recent tear history array.
   */
  getTearHistory() {
    return this._history.slice();
  }

  // ---- Configuration ----

  /**
   * Set the absolute tear threshold.
   */
  setThreshold(v) {
    this.threshold = Math.max(10, v);
  }

  /**
   * Enable or disable the detector.
   */
  setEnabled(v) {
    this._enabled = Boolean(v);
  }

  /** @returns {boolean} */
  get enabled() { return this._enabled; }

  /** @returns {number} Lifetime tear count. */
  get totalTears() { return this._totalTears; }
}
