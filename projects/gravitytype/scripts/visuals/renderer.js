/**
 * GRAVITYTYPE // RENDERER
 * scripts/visuals/renderer.js
 * 
 * Handles Canvas 2D interactions and visual polish.
 */

class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {PhysicsWorld} world 
     * @param {ParticleSystem} particles 
     */
    constructor(canvas, world, particles) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.world = world;
        this.particles = particles;

        // Cache dimensions
        this.width = canvas.width;
        this.height = canvas.height;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        if (this.world) {
            this.world.resize(this.width, this.height);
        }
    }

    render() {
        const ctx = this.ctx;

        // Motion Blur / Trail
        // Instead of clearRect, we draw a semi-transparent black rect
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(5, 5, 5, 0.4)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Render Bodies
        for (const body of this.world.bodies) {
            this.drawBody(body);
        }

        // Render Particles
        // Additive blending for sparks
        ctx.globalCompositeOperation = 'lighter';
        this.particles.draw(ctx);
        ctx.globalCompositeOperation = 'source-over';

        // Optional: Render Constraints (Debug)
        /*
        for (const c of this.world.constraints) {
            c.draw(ctx);
        }
        */
    }

    /**
     * @param {RigidBody} body 
     */
    drawBody(body) {
        const ctx = this.ctx;

        // Save Context
        ctx.save();
        ctx.translate(body.pos.x, body.pos.y);

        // Calculate velocity-based effects
        const vel = body.getVelocity();
        const speed = vel.mag();

        // Neon Glow
        if (speed > 1.0) {
            ctx.shadowBlur = Math.min(speed * 2, 20);
            ctx.shadowColor = body.color;
        }

        ctx.fillStyle = body.color;
        ctx.font = `bold ${body.fontSize}px 'JetBrains Mono'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Character
        ctx.fillText(body.char, 0, 0);

        // Restore
        ctx.restore();
    }
}
