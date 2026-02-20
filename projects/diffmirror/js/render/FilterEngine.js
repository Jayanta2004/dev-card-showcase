/**
 * FilterEngine.js
 * Manages post-processing effects applied to the mirror canvas.
 * Transitions between "stable" and "glitched" states based on behavioral deltas.
 */

export class FilterEngine {
    /**
     * @param {HTMLCanvasElement} canvas The mirror canvas to filter
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Internal state for glitch bursts
        this.glitchIntensity = 0;
        this.lastGlitchTime = 0;
    }

    /**
     * Updates filter parameters.
     * @param {Object} deltas Behavioral deltas
     */
    update(deltas) {
        // High composite delta can trigger random glitch bursts
        if (deltas.composite > 0.6 && Date.now() - this.lastGlitchTime > 2000) {
            if (Math.random() < 0.05) {
                this.glitchIntensity = deltas.composite;
                this.lastGlitchTime = Date.now();
            }
        }

        // Decay glitch intensity
        this.glitchIntensity *= 0.95;
    }

    /**
     * Applies CSS filters and manual canvas distortions.
     * @param {Object} deltas 
     */
    apply(deltas) {
        const blur = deltas.spatial * 4;
        const contrast = 100 + deltas.velocity * 50;
        const hueRotate = deltas.temporal * 30;
        const sepia = deltas.composite * 0.2;

        // Dynamic CSS Filter string
        let filterStr = `blur(${blur}px) contrast(${contrast}%) hue-rotate(${hueRotate}deg) sepia(${sepia})`;

        if (this.glitchIntensity > 0.1) {
            filterStr += ` invert(${this.glitchIntensity * 20}%)`;
        }

        this.canvas.style.filter = filterStr;

        // Manual scanline displacement if glitch is high
        if (this.glitchIntensity > 0.3) {
            this._renderGlitchOffsets();
        }
    }

    /**
     * Performs a horizontal displacement glitch.
     * @private
     */
    _renderGlitchOffsets() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const sliceH = Math.random() * 50;
        const sliceY = Math.random() * (h - sliceH);
        const offset = (Math.random() - 0.5) * 40 * this.glitchIntensity;

        // Snapshot current state
        this.ctx.save();
        this.ctx.translate(offset, 0);
        this.ctx.drawImage(
            this.canvas,
            0, sliceY, w, sliceH,
            0, sliceY, w, sliceH
        );
        this.ctx.restore();
    }

    /**
     * Resets all filters to baseline state.
     */
    reset() {
        this.canvas.style.filter = 'none';
        this.glitchIntensity = 0;
    }
}
