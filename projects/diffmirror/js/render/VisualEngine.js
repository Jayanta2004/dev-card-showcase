/**
 * VisualEngine.js
 * High-performance canvas renderer for DiffMirror.
 * Manages the drawing lifecycle and responsive canvas scaling.
 */

import { DistortionSystem } from './DistortionSystem.js';
import { GhostSystem } from './GhostSystem.js';
import { FilterEngine } from './FilterEngine.js';

export class VisualEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        this.width = 0;
        this.height = 0;
        this.dpr = window.devicePixelRatio || 1;

        this.distortionSystem = null;
        this.ghostSystem = null;

        this._init();
    }

    _init() {
        this._handleResize();
        window.addEventListener('resize', () => this._handleResize());

        this.distortionSystem = new DistortionSystem(this.width, this.height);
        this.ghostSystem = new GhostSystem(this.width, this.height);
        this.filterEngine = new FilterEngine(this.canvas);
    }

    _handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        this.ctx.scale(this.dpr, this.dpr);

        if (this.distortionSystem) {
            this.distortionSystem.resize(this.width, this.height);
        }
        if (this.ghostSystem) {
            this.ghostSystem.resize(this.width, this.height);
        }
    }

    /**
     * Main render iteration.
     * @param {Object} mouse Current mouse state
     * @param {Object} deltas Behavior deltas from DifferenceEngine
     * @param {Object} config Active visual preset configuration
     */
    draw(mouse, deltas, config = {}) {
        // Use config for trail intensity or fallback to delta-based
        const trailBase = config.trailIntensity || 0.1;
        const trailAlpha = trailBase + (deltas.velocity * 0.4);

        this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - trailAlpha})`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Render Ghost (Past Self)
        this.ghostSystem.update(deltas);
        this.ghostSystem.render(this.ctx, deltas);

        // Render generative content
        this.distortionSystem.update(mouse, deltas);
        this.distortionSystem.render(this.ctx, deltas);

        // Apply Post-processing
        this.filterEngine.update(deltas);
        this.filterEngine.apply(deltas);

        // Subtle vignette enhancement in code for more depth
        this._drawPostFX(deltas);
    }

    _drawPostFX(deltas) {
        // If deltas are high, add static/noise effect
        if (deltas.composite > 0.6) {
            const intensity = (deltas.composite - 0.6) * 50;
            for (let i = 0; i < intensity; i++) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                const s = Math.random() * 2;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
                this.ctx.fillRect(x, y, s, s);
            }
        }
    }
}
