/**
 * GravityFont - Canvas Renderer
 * Handles the visual representation of the physics simulation.
 */

class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {PhysicsEngine} engine 
     */
    constructor(canvas, engine) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.engine = engine;

        this.width = canvas.width;
        this.height = canvas.height;

        // Rendering modes
        this.showParticles = true;
        this.showConstraints = true;
        this.fillGlyphs = true;

        // Colors
        this.backgroundColor = '#0c0c0c';
        this.accentGlow = 'rgba(58, 134, 255, 0.2)';

        this.frame = 0;
        this.brushes = new BrushSystem(this.ctx);
    }

    /**
     * Main draw call.
     */
    draw(glyphs) {
        this.frame++;
        this.clear();

        if (this.fillGlyphs) {
            this.drawFabric(glyphs);
        }

        if (this.showConstraints) {
            this.drawConstraints();
        }

        if (this.showParticles) {
            this.drawParticles();
        }

        // Add subtle post-processing glow
        this.drawOverlay();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Draws a filled shape for each glyph group to give a fabric feel.
     */
    drawFabric(glyphs) {
        glyphs.forEach(glyph => {
            if (glyph.particles.length < 3) return;

            // Simplified fabric rendering: 
            // We connect particles based on their original relative positions
            // To create a filled appearance, we'll draw hulls or just many thick lines.
            // For a "soft-body" look, we'll use a semi-transparent fill between constraints.

            this.ctx.beginPath();
            this.ctx.fillStyle = glyph.particles[0].color.replace(')', ', 0.15)').replace('rgb', 'rgba');

            // Draw triangles between triplets of particles that are close
            for (let i = 0; i < glyph.constraints.length; i++) {
                const c = glyph.constraints[i];
                if (c.isBroken) continue;

                // Use the brush system for interesting fabric connections
                // We use a simplified draw here for the "fill" look
                this.ctx.lineWidth = 12;
                this.ctx.strokeStyle = glyph.particles[0].color.replace(')', ', 0.2)').replace('rgb', 'rgba');
                this.ctx.beginPath();
                this.ctx.moveTo(c.p1.position.x, c.p1.position.y);
                this.ctx.lineTo(c.p2.position.x, c.p2.position.y);
                this.ctx.stroke();
            }
        });
    }

    /**
     * Draws all constraints in the engine.
     */
    drawConstraints() {
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.engine.constraints.length; i++) {
            const c = this.engine.constraints[i];
            if (!c.visible || c.isBroken) continue;

            // Delegate to brush system
            this.brushes.drawConstraint(c);
        }
    }

    /**
     * Draws all particles as glowing circles.
     */
    drawParticles() {
        for (let i = 0; i < this.engine.particles.length; i++) {
            const p = this.engine.particles[i];

            // Core
            this.ctx.beginPath();
            this.ctx.arc(p.position.x, p.position.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();

            // Glow
            this.ctx.beginPath();
            this.ctx.arc(p.position.x, p.position.y, p.radius * 2, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(
                p.position.x, p.position.y, 0,
                p.position.x, p.position.y, p.radius * 3
            );
            gradient.addColorStop(0, p.color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
    }

    /**
     * Draws additional UI/Overlay effects.
     */
    drawOverlay() {
        // Draw floor indicator
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.strokeStyle = 'rgba(58, 134, 255, 0.3)';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }
}
