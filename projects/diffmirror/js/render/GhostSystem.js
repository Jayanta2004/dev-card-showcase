/**
 * GhostSystem.js
 * Renders the "Past Self" as a spectral path.
 * The visibility and distortion of this path depend on the behavioral delta.
 */

import { Vector2D, MathUtils } from '../utils/MathUtils.js';

export class GhostSystem {
    /**
     * @param {number} width 
     * @param {number} height 
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.points = [];
        this.opacity = 0;
        this.targetOpacity = 0.3;
    }

    /**
     * Prepares the ghost path from previous session samples.
     * @param {Array} samples 
     */
    setPath(samples) {
        if (!samples || samples.length === 0) return;

        this.points = samples.map(s => ({
            pos: new Vector2D(s.x * this.width, s.y * this.height),
            original: new Vector2D(s.x * this.width, s.y * this.height),
            t: s.t
        }));
    }

    /**
     * Updates the ghost points, adding slight drift or distortion based on delta.
     * @param {Object} deltas 
     */
    update(deltas) {
        const time = Date.now() * 0.001;

        // As delta increases, the ghost path becomes more unstable
        const instability = deltas.composite * 50;

        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];

            // Per-point noise/wobble
            const noiseX = Math.sin(time + i * 0.2) * instability;
            const noiseY = Math.cos(time + i * 0.23) * instability;

            p.pos.x = MathUtils.lerp(p.pos.x, p.original.x + noiseX, 0.1);
            p.pos.y = MathUtils.lerp(p.pos.y, p.original.y + noiseY, 0.1);
        }

        // Fade in ghost slowly
        this.opacity = MathUtils.lerp(this.opacity, this.targetOpacity, 0.01);
    }

    /**
     * Renders the spectral path to the canvas.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Object} deltas 
     */
    render(ctx, deltas) {
        if (this.points.length < 2) return;

        ctx.save();

        // The more different you are, the more the "past self" flickers and dims
        const flicker = 1.0 - (deltas.composite * 0.5 * Math.random());
        ctx.globalAlpha = this.opacity * flicker;
        ctx.strokeStyle = `hsla(180, 100%, 70%, ${0.5})`;
        ctx.lineWidth = 1 + deltas.spatial * 5;
        ctx.setLineDash([5, 15]);

        ctx.beginPath();
        ctx.moveTo(this.points[0].pos.x, this.points[0].pos.y);

        for (let i = 1; i < this.points.length; i++) {
            const p = this.points[i];

            // Quadratic curve for smoother path
            const xc = (p.pos.x + this.points[i - 1].pos.x) / 2;
            const yc = (p.pos.y + this.points[i - 1].pos.y) / 2;
            ctx.quadraticCurveTo(this.points[i - 1].pos.x, this.points[i - 1].pos.y, xc, yc);
        }

        ctx.stroke();

        // Render click markers on the ghost path
        this._renderGhostClicks(ctx, deltas);

        ctx.restore();
    }

    /**
     * Draws small pulses where the past self clicked.
     */
    _renderGhostClicks(ctx, deltas) {
        // We simulate clicks as specific nodes in the path that pulse
        const pulseSize = 10 * (1 + deltas.temporal * 2);
        ctx.fillStyle = `hsla(180, 100%, 80%, ${0.2})`;

        for (let i = 0; i < this.points.length; i += 20) {
            const p = this.points[i];
            const s = pulseSize * (0.5 + 0.5 * Math.sin(Date.now() * 0.005 + i));
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, s, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
