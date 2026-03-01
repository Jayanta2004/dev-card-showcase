'use strict';

/**
 * Central frozen configuration object for TitanFlesh simulation.
 * All tweakable simulation and rendering constants live here.
 */
const CFG = Object.freeze({

  // ---- Physics timestep ----
  /** Fixed physics update step in milliseconds (60 Hz). */
  FIXED_DT: 16.667,
  /** Maximum number of physics catch-up steps per frame. */
  MAX_CATCH_UP: 5,

  // ---- Body geometry ----
  /** Horizontal semi-axis of the body ellipse in pixels. */
  BODY_RX: 180,
  /** Vertical semi-axis of the body ellipse in pixels. */
  BODY_RY: 140,
  /** Number of concentric rings in the spring-mass lattice. */
  RINGS: 6,
  /** Number of particles per ring (inner to outer). */
  RING_POINTS: [8, 12, 16, 20, 24, 28],

  // ---- Particle/lattice noise ----
  /** Amplitude of Fourier radial deformation noise on ring placement. */
  FOLD_AMP: 0.12,
  /** Scale of fbm noise applied to radial ring distances. */
  NOISE_AMP: 0.18,
  /** Position jitter noise applied to each particle after placement. */
  NOISE_POS: 4.0,

  // ---- Particle physics ----
  /** Default particle mass (arbitrary units; heavier = less responsive). */
  BASE_MASS: 1.0,
  /** Global gravity force applied downward per update step. */
  GRAVITY: 0.06,
  /** Velocity damping coefficient per frame (0 = no motion, 1 = no damping). */
  DAMPING: 0.985,
  /** Maximum particle speed (pixels/step). Clamps velocity to prevent explosion. */
  MAX_SPEED: 60,

  // ---- Spring parameters ----
  /** Default spring stiffness coefficient (0..1). Controls constraint firmness. */
  SPRING_STIFFNESS: 0.85,
  /** Velocity-proportional spring damping. Reduces oscillation. */
  SPRING_DAMPING: 0.02,
  /** Force threshold above which a spring tears (arbitrary units). */
  SPRING_TEAR_THRESHOLD: 800,
  /** Stress ratio (0..1) at which a spring is considered about to tear. */
  SPRING_TEAR_RATIO: 0.85,

  // ---- Constraint solver ----
  /** Number of Gauss-Seidel position correction iterations per step. */
  SOLVER_ITERATIONS: 8,

  // ---- Volume preservation ----
  /** Outward pressure force strength applied during pressure passes. */
  PRESSURE_STRENGTH: 0.4,
  /** Number of pressure passes per update step. */
  PRESSURE_PASSES: 2,

  // ---- Ripple system ----
  /** Radial wavefront expansion speed (pixels/step). */
  RIPPLE_SPEED: 3.5,
  /** Amplitude decay multiplier per update (0..1). */
  RIPPLE_DECAY: 0.94,
  /** Maximum simultaneous live ripple wavefronts. */
  MAX_RIPPLES: 6,

  // ---- Boundary ----
  /** Canvas-edge margin in pixels for soft boundary rect. */
  BOUNDARY_MARGIN: 20,
  /** Velocity restitution coefficient on boundary bounce (0..1). */
  BOUNDARY_RESTITUTION: 0.35,

  // ---- Strike mechanics ----
  /** Multiplier applied to input force before passing to simulation. */
  STRIKE_POWER: 1.0,
  /** Radius of area-of-effect for each strike impulse, in pixels. */
  STRIKE_RADIUS: 80,

  // ---- Mutation system ----
  /** Damage level (0..1) above which boundary spikes begin growing. */
  MUTATION_SPIKE_THRESHOLD: 0.25,
  /** Damage level above which spring stiffness degradation begins. */
  MUTATION_DEGRADE_THRESHOLD: 0.50,
  /** Rate at which damage level heals per millisecond of simulation time. */
  HEAL_RATE: 0.00015,

  // ---- Rendering ----
  /** Epsilon for circumcircle containment tests in Delaunay. */
  CIRCUMCIRCLE_EPS: 1e-10,

  // ---- UI ----
  /** Milliseconds before the strike info panel auto-hides. */
  STRIKE_INFO_TIMEOUT: 1600,
  /** DOM update interval for performance panel in milliseconds. */
  PERF_UPDATE_INTERVAL: 200,
});
