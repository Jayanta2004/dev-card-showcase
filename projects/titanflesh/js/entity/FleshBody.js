'use strict';

class FleshBody {
  constructor(canvas, cfg = {}) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** Configuration passed to lattice build. */
    this.cfg = cfg;

    /** @type {SpringMassLattice} */   this.lattice = null;
    /** @type {VerletIntegrator} */    this.integrator = null;
    /** @type {ConstraintSolver} */    this.constraints = null;
    /** @type {PressureSystem} */      this.pressure = null;
    /** @type {RippleSystem} */        this.ripple = null;
    /** @type {TearDetector} */        this.tearDetector = null;
    /** @type {MeshRebuilder} */       this._rebuilder = null;
    /** @type {DelaunayTriangulator} */ this.triangulator = null;

    this.particles = [];
    this.springs = [];
    this.triangles = [];

    this.tearEnabled = true;
    this.rippleEnabled = true;
    this.tearCount = 0;
    /** Recent TearEvent instances (capped at 40). */
    this.tearEvents = [];

    this._stiffness = 1.0;
    this._damping = CFG.DAMPING ?? 0.985;
    this._tearThreshold = CFG.SPRING_TEAR_THRESHOLD ?? 800;
    this._time = 0;
  }

  build() {
    this.tearCount = 0;
    this.tearEvents = [];
    this._time = 0;

    this.triangulator = new DelaunayTriangulator();

    this.lattice = new SpringMassLattice({
      cx:     this.cfg.cx  ?? 400,
      cy:     this.cfg.cy  ?? 300,
      rx:     this.cfg.rx  ?? CFG.BODY_RX ?? 180,
      ry:     this.cfg.ry  ?? CFG.BODY_RY ?? 140,
      rings:  CFG.RINGS    ?? 6,
      ringPts: CFG.RING_POINTS ?? [8, 12, 16, 20, 24, 28]
    });
    this.lattice.build();
    this.particles = this.lattice.particles;
    this.springs   = this.lattice.springs;

    this.triangles = this.triangulator.triangulate(this.particles);

    this.integrator = new VerletIntegrator({ damping: this._damping });
    this.constraints = new ConstraintSolver({ iterations: CFG.SOLVER_ITERATIONS ?? 8 });
    this.pressure = new PressureSystem({ strength: CFG.PRESSURE_STRENGTH ?? 0.4 });
    this.pressure.calibrate(this.lattice.boundaryLoop);
    this.ripple = new RippleSystem();
    this.tearDetector = new TearDetector({ threshold: this._tearThreshold });
    this._rebuilder = new MeshRebuilder(this.triangulator);

    for (const s of this.springs) {
      s.restLength *= 1 + (Math.random() - 0.5) * 0.02;
    }
  }

  update(dt) {
    if (!this.particles.length || dt <= 0) return;
    this._time += dt;

    this.integrator.integrate(this.particles, dt);

    for (const s of this.springs) {
      if (!s.torn) s.accumulateForce();
    }

    this.pressure.solve(this.lattice.boundaryLoop);

    for (const p of this.particles) {
      if (!p.pinned && !p.dead) p.flushForces?.();
    }

    // 5. XPBD constraint solving (position correction)
    this.constraints.solve(this.particles, this.springs, dt);

    // 6. Ripple wavefront propagation
    if (this.rippleEnabled) {
      this.ripple.update(this.particles, dt);
    }

    // 7. Decay visual properties per particle
    for (const p of this.particles) {
      p.decayVisuals(dt);
      p.clearForces();
    }

    // 8. Tear detection and mesh rebuild
    if (this.tearEnabled) {
      this._processTears();
    }

    // 9. Mark triangles dirty for circumcircle caching
    for (const t of this.triangles) {
      t.markDirty?.();
    }

    // 10. Soft canvas boundary
    this.integrator.applyBoundary(
      this.particles, this.canvas.width, this.canvas.height
    );
  }

  /** Detect, execute, and handle any spring tear events this step. */
  _processTears() {
    const events = this.tearDetector.detect(this.springs);
    if (!events.length) return;

    this.tearCount += events.length;
    for (const ev of events) {
      this.tearEvents.push(ev);
      this.lattice.removeSpring(ev.spring);
    }

    // Cap stored tear events
    if (this.tearEvents.length > 40) {
      this.tearEvents.splice(0, this.tearEvents.length - 40);
    }

    // Rebuild triangulation from surviving particles
    const result = this._rebuilder.rebuild(this.particles, this.springs);
    this.triangles = result.triangles;

    if (result.boundaryLoop && result.boundaryLoop.length >= 3) {
      this.lattice.boundaryLoop = result.boundaryLoop;
      this.pressure.calibrate(result.boundaryLoop);
    }
  }

  strike(x, y, force, radius) {
    this.lattice.applyImpulseAt(x, y, force, radius);
    if (this.rippleEnabled) {
      this.ripple.spawn(x, y, force * 0.6, radius * 1.5);
    }
    // Boost visual stress for particles within 1.2 strike radius
    const r2 = radius * radius * 1.44;
    for (const p of this.particles) {
      const dx = p.pos.x - x, dy = p.pos.y - y;
      if (dx * dx + dy * dy < r2) {
        p.addStress(force * 0.003);
      }
    }
  }

  drag(x, y, dx, dy, force) {
    const radius = CFG.STRIKE_RADIUS ?? 80;
    const r2 = radius * radius;
    for (const p of this.particles) {
      const pdx = p.pos.x - x, pdy = p.pos.y - y;
      const distSq = pdx * pdx + pdy * pdy;
      if (distSq >= r2) continue;
      const t = 1 - Math.sqrt(distSq) / radius;
      p.applyImpulse(dx * t * force * 0.12, dy * t * force * 0.12);
    }
  }

  // ---- Runtime setters ----

  setStiffness(v) {
    this._stiffness = v;
    for (const s of this.springs) {
      s.stiffness = s._baseStiffness * v;
    }
  }

  setDamping(v) {
    this._damping = v;
    if (this.integrator) this.integrator.setDamping(v);
  }

  setTearThreshold(v) {
    this._tearThreshold = v;
    if (this.tearDetector) this.tearDetector.setThreshold(v);
  }

  // ---- Helpers ----

  get aliveParticles() {
    return this.particles.filter(p => !p.dead);
  }

  get activeSprings() {
    return this.springs.filter(s => !s.torn);
  }

  get activeTriangleCount() {
    return this.triangles.filter(t => t.a && t.b && t.c && !t.a.dead && !t.b.dead && !t.c.dead).length;
  }
}
