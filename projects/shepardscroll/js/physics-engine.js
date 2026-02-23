/**
 * @file physics-engine.js
 * @description Advanced Newtonian physics engine for the ShepardScroll particle system.
 * This module handles the simulation of hundreds of digital particles, incorporating
 * momentum, drag, depth-based perspective, and velocity-responsive repulsion.
 * 
 * The system is designed to provide "spatial feedback" for the auditory illusion,
 * making the user feel like they are moving through a dense field of sound frequencies.
 */

class Particle {
    /**
     * @constructor
     * @param {number} width - Canvas width.
     * @param {number} height - Canvas height.
     */
    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.init();
    }

    /**
     * Initializes particle properties with random values.
     */
    init() {
        // Random spatial position (x, y)
        this.x = Math.random() * this.canvasWidth;
        this.y = Math.random() * this.canvasHeight;

        // Velocity components for momentum simulation
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;

        // Depth coordinate (Z-axis). 
        // Used to simulate perspective: 0 is far, 1 is near.
        this.z = Math.random();

        // Visual traits
        this.size = Math.random() * ShepardConfig.PHYSICS.MAX_SIZE + ShepardConfig.PHYSICS.MIN_SIZE;
        this.baseAlpha = Math.random() * 0.4 + 0.1;
        this.alpha = this.baseAlpha;

        // Aesthetic properties
        this.colorHue = Math.random() * 60; // Deviance from theme color
    }

    /**
     * Updates physics state for a single frame.
     * @param {number} globalVelocity - The current smoothed scroll velocity.
     * @param {object} mouse - Current mouse coordinates for repulsion.
     */
    update(globalVelocity, mouse) {
        // 1. Apply constant drift (simulates ambient air or fluid)
        this.x += this.vx;
        this.y += this.vy;

        // 2. Apply Scroll Momentum (Z-space movement)
        // This is the core feedback loop for the Shepard illusion.
        // If the user scrolls down (positive velocity), particles move "towards" the camera (Z increases).
        // If scrolling up, they retreat into the distance.
        const zDelta = globalVelocity * ShepardConfig.PHYSICS.VELOCITY_INFLUENCE * 0.01;
        this.z += zDelta;

        // 3. Perspective Scaling
        // Calculate rendering scale based on Z depth.
        this.renderScale = Math.pow(this.z, 2); // Quadratic falloff for realism
        this.renderAlpha = this.z * this.baseAlpha;

        // 4. Boundary Re-spawning
        // If a particle gets too close (passes camera) or too far, reset it to the opposite horizon.
        if (this.z > 1.2) {
            this.z = 0.05;
            this.x = Math.random() * this.canvasWidth;
            this.y = Math.random() * this.canvasHeight;
        } else if (this.z < 0.02) {
            this.z = 1.15;
            this.x = Math.random() * this.canvasWidth;
            this.y = Math.random() * this.canvasHeight;
        }

        // 5. Mouse Repulsion Logic
        // Calculate distance between particle and cursor.
        if (mouse && mouse.x) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ShepardConfig.PHYSICS.REPULSION_RADIUS) {
                const force = (ShepardConfig.PHYSICS.REPULSION_RADIUS - distance) / ShepardConfig.PHYSICS.REPULSION_RADIUS;
                const angle = Math.atan2(dy, dx);

                // Push particle away
                this.x += Math.cos(angle) * force * 5;
                this.y += Math.sin(angle) * force * 5;
            }
        }

        // 6. Damping (Friction)
        // Slow down drift velocities over time.
        this.vx *= ShepardConfig.PHYSICS.DAMPING;
        this.vy *= ShepardConfig.PHYSICS.DAMPING;
    }

    /**
     * Renders the particle to the visual buffer.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} themeColor - The current accent hue.
     */
    draw(ctx, themeColor) {
        // Calculate dynamic appearance
        const radius = this.size * this.renderScale;

        // Prevent drawing if too tiny or invisible
        if (radius < 0.2 || this.renderAlpha <= 0) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);

        // Use the application's current accent color for themed depth
        ctx.fillStyle = `hsla(${themeColor}, 70%, 80%, ${this.renderAlpha})`;
        ctx.fill();

        // Optional: Adding a light glow to "near" particles
        if (this.z > 0.8) {
            ctx.shadowBlur = 10 * this.z;
            ctx.shadowColor = `hsla(${themeColor}, 70%, 50%, ${this.renderAlpha * 0.5})`;
        } else {
            ctx.shadowBlur = 0;
        }
    }
}

class PhysicsEngine {
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvas - The particle layer canvas.
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };

        this.init();
    }

    /**
     * populates the particle array based on CONFIG.
     */
    init() {
        this.particles = [];
        for (let i = 0; i < ShepardConfig.PHYSICS.PARTICLE_COUNT; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }

        // Track mouse movements for repulsion
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Handle canvas resizing
        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    /**
     * Updates canvas dimensions and resets particle boundaries.
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Optionally reset particles to fit new aspect ratio
    }

    /**
     * The core simulation loop for physics updates and drawing.
     * @param {number} velocity - Current scroll velocity.
     * @param {string} accentHue - Global accent color code.
     */
    step(velocity, accentHue) {
        // Clear frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw each particle
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.update(velocity, this.mouse);
            p.draw(this.ctx, accentHue);
        }
    }

    /**
     * Batch update particle count (used by settings panel).
     * @param {number} count 
     */
    setCount(count) {
        const diff = count - this.particles.length;
        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                this.particles.push(new Particle(this.canvas.width, this.canvas.height));
            }
        } else if (diff < 0) {
            this.particles.splice(0, Math.abs(diff));
        }
    }
}

window.PhysicsEngine = PhysicsEngine;
