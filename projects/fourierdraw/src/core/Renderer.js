import { CONFIG } from '../config.js';
import { ParticleSystem } from './ParticleSystem.js';

/**
 * @fileoverview Enhanced Renderer for FourierDraw.
 * Responsible for the visual orchestration of epicycles, trails, and particles.
 */

export class Renderer {
    /**
     * @param {string} canvasId - The ID of the canvas element to render onto.
     */
    constructor(canvasId) {
        /** @type {HTMLCanvasElement} */
        this.canvas = document.getElementById(canvasId);
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');

        /** @type {Object[]} */
        this.fourierX = [];
        /** @type {number} */
        this.time = 0;
        /** @type {Array<{x: number, y: number}>} */
        this.path = [];
        /** @type {{x: number, y: number}} */
        this.center = { x: 0, y: 0 };

        // Display Toggle Settings
        this.showCircles = true;
        this.showRadius = true;
        this.showPath = true;
        this.showParticles = true;

        /** @type {number} */
        this.speed = CONFIG.ANIMATION.DEFAULT_SPEED;
        /** @type {boolean} */
        this.isAnimating = false;

        this.particles = new ParticleSystem();

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Syncs canvas dimensions with the window size.
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Initializes the data for a new animation sequence.
     * @param {Object[]} data - Transformed frequency components.
     * @param {{x: number, y: number}} center - Geometric center of the drawing.
     */
    setDFTData(data, center) {
        this.fourierX = data;
        this.center = center;
        this.time = 0;
        this.path = [];
        this.isAnimating = true;
        this.particles.clear();
    }

    /**
     * Main update loop for visibility and animation frame logic.
     */
    update() {
        if (!this.isAnimating || this.fourierX.length === 0) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate and draw the hierarchy of epicycles
        let v = this.drawEpicycles(this.center.x, this.center.y, this.fourierX);

        // Accumulate trailing path
        this.path.unshift(v);
        if (this.path.length > CONFIG.ANIMATION.TRACE_LENGTH) {
            this.path.pop();
        }

        // Emit particles from the tracing point
        if (this.showParticles) {
            this.particles.emit(v.x, v.y, CONFIG.ANIMATION.PARTICLE_COUNT);
            this.particles.update();
            this.particles.draw(this.ctx);
        }

        if (this.showPath) {
            this.drawPath();
        }

        // Increment phase based on speed and resolution
        const dt = (2 * Math.PI) / this.fourierX.length;
        this.time += dt * (this.speed * 20);

        // Reset loop when periodic cycle completes
        if (this.time > 2 * Math.PI) {
            this.time = 0;
            this.path = [];
            this.particles.clear();
        }
    }

    /**
     * Recursively calculates the complex vector sum and renders the circles/arms.
     * @param {number} x - Current origin X.
     * @param {number} y - Current origin Y.
     * @param {Object[]} fourier - Array of frequency components.
     * @returns {{x: number, y: number}} The final endpoint coordinate.
     */
    drawEpicycles(x, y, fourier) {
        for (let i = 0; i < fourier.length; i++) {
            let prevX = x;
            let prevY = y;
            let { freq, amp, phase } = fourier[i];

            // Standard Fourier Series expansion: v = sum( c_n * exp(i * n * omega * t) )
            x += amp * Math.cos(freq * this.time + phase);
            y += amp * Math.sin(freq * this.time + phase);

            // Only render visual guides if amplitude is significant enough to see
            if (amp > 0.3) {
                if (this.showCircles) {
                    this.ctx.strokeStyle = CONFIG.COLORS.EPICYCLE_RING;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.arc(prevX, prevY, amp, 0, 2 * Math.PI);
                    this.ctx.stroke();
                }

                if (this.showRadius) {
                    this.ctx.strokeStyle = CONFIG.COLORS.EPICYCLE_RADIUS;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(prevX, prevY);
                    this.ctx.lineTo(x, y);
                    this.ctx.stroke();
                }
            }
        }
        return { x, y };
    }

    /**
     * Renders the reconstructed drawing trace with glow effects.
     */
    drawPath() {
        if (this.path.length < 2) return;

        this.ctx.strokeStyle = CONFIG.COLORS.PATH_TRACE;
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Add glow bloom effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = CONFIG.COLORS.PATH_SHADOW;

        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);

        for (let i = 1; i < this.path.length; i++) {
            // Gradient trail effect based on point age
            const opacity = 1 - (i / CONFIG.ANIMATION.TRACE_LENGTH);
            if (opacity < 0.1) break;

            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }

        this.ctx.stroke();

        // Clean up context state for next drawing operation
        this.ctx.shadowBlur = 0;
    }

    /**
     * Resets the rendering state.
     */
    clear() {
        this.isAnimating = false;
        this.fourierX = [];
        this.path = [];
        this.particles.clear();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
