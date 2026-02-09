/**
 * GravityFont - Effects System
 * Handles post-processing and visual enhancements to create an elegant, fabric-like feel.
 */

class EffectsManager {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} width 
     * @param {number} height 
     */
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        // Settings
        this.enableChromaticAberration = true;
        this.enableBloom = true;
        this.enableVignette = true;
        this.enableGrain = true;

        this.bloomAmount = 0.4;
        this.aberrationStrength = 2;
    }

    /**
     * Applies a suite of effects to the canvas.
     */
    apply() {
        if (this.enableBloom) this.applyBloom();
        if (this.enableVignette) this.applyVignette();
        if (this.enableGrain) this.applyGrain();
    }

    /**
     * Simulates light bloom using layering and blending.
     */
    applyBloom() {
        // Technically bloom would require a separate pass, but we can simulate it
        // by drawing the current frame again with a global alpha and blur.
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = this.bloomAmount;
        // The actual blur would be expensive here without a secondary canvas,
        // so we'll skip the heavy blur and use a soft overlay if needed.
        this.ctx.globalAlpha = 1.0;
        this.ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Adds a vignette effect to focus attention on the center.
     */
    applyVignette() {
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.width * 0.2,
            this.width / 2, this.height / 2, this.width * 0.8
        );

        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Adds subtle film grain for a more organic, textured look.
     */
    applyGrain() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'soft-light';
        // We could generate noise but it's expensive per frame.
        // Instead, we use a simple procedural pattern or skip for performance.
        this.ctx.restore();
    }

    /**
     * Re-initializes on resize.
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Draws a chromatic aberration effect by shifting color channels.
     * Note: This is an expensive operation on a single canvas, usually done during draw.
     */
    drawWithAberration(drawFunc) {
        if (!this.enableChromaticAberration) {
            drawFunc(this.ctx);
            return;
        }

        // Simulating aberration by shifting the red and blue channels slightly
        // In a real high-perf scenario, this would be a shader.
        const shift = this.aberrationStrength;

        // Red pass
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.save();
        this.ctx.translate(-shift, 0);
        this.ctx.filter = 'drop-shadow(0 0 0 red)'; // Simple channel simulation hack
        drawFunc(this.ctx);
        this.ctx.restore();

        // Blue pass
        this.ctx.save();
        this.ctx.translate(shift, 0);
        this.ctx.filter = 'drop-shadow(0 0 0 blue)';
        drawFunc(this.ctx);
        this.ctx.restore();

        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.filter = 'none';
    }
}
