/**
 * BlinkClick Glitch Engine
 * Dedicated module for handling the futuristic background aesthetics.
 */

class GlitchEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.frame = 0;
        this.glitches = [];
        this.init();
    }

    /**
     * Initialize canvas and events
     */
    init() {
        const resize = () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    /**
     * Create a new glitch slice
     */
    createGlitch() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            w: Math.random() * 200 + 50,
            h: Math.random() * 5 + 1,
            color: Math.random() > 0.5 ? '#00f2ff' : '#7000ff',
            life: Math.random() * 20 + 10,
            speed: Math.random() * 2 - 1
        };
    }

    /**
     * Update and draw the glitch field
     */
    render() {
        this.frame++;

        // Clear with slight trail
        this.ctx.fillStyle = 'rgba(5, 7, 10, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Add new glitches
        if (this.frame % 5 === 0) {
            this.glitches.push(this.createGlitch());
        }

        // Process glitches
        for (let i = this.glitches.length - 1; i >= 0; i--) {
            const g = this.glitches[i];
            g.life--;
            g.x += g.speed * 5;

            if (g.life <= 0) {
                this.glitches.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = g.color + '22';
            this.ctx.fillRect(g.x, g.y, g.w, g.h);

            // Random horizontal displacement
            if (Math.random() > 0.95) {
                this.ctx.fillStyle = '#ffffff11';
                this.ctx.fillRect(0, g.y, this.width, 1);
            }
        }

        // Draw scanlines
        if (this.frame % 2 === 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            for (let i = 0; i < this.height; i += 4) {
                this.ctx.fillRect(0, i, this.width, 1);
            }
        }

        requestAnimationFrame(() => this.render());
    }
}

window.GlitchEngine = GlitchEngine;
