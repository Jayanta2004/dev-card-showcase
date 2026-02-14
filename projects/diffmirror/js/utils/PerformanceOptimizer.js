/**
 * PerformanceOptimizer.js
 * Manages resource allocation, frame rate stability, and throttled execution for DiffMirror.
 * Specifically designed to handle 1000+ particles smoothly.
 */

export class PerformanceOptimizer {
    constructor() {
        this.frameTimes = [];
        this.maxFrameHistory = 60;
        this.fps = 60;
        this.lastTime = performance.now();

        // Dynamic quality settings
        this.quality = {
            particleDensity: 1.0,
            effectsEnabled: true,
            useShadows: false
        };
    }

    /**
     * Monitors frame time and adjusts quality if necessary.
     */
    tick() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;

        this.frameTimes.push(delta);
        if (this.frameTimes.length > this.maxFrameHistory) {
            this.frameTimes.shift();
        }

        const avgDelta = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
        this.fps = 1000 / avgDelta;

        this._adaptQuality();
    }

    /**
     * Adjusts system parameters based on average FPS.
     */
    _adaptQuality() {
        if (this.fps < 30 && this.quality.particleDensity > 0.5) {
            this.quality.particleDensity -= 0.01;
            console.warn('DiffMirror: Reducing quality due to performance drop.');
        } else if (this.fps > 55 && this.quality.particleDensity < 1.0) {
            this.quality.particleDensity += 0.005;
        }

        if (this.fps < 20) {
            this.quality.effectsEnabled = false;
        } else if (this.fps > 40) {
            this.quality.effectsEnabled = true;
        }
    }

    /**
     * Helper to throttle function execution.
     */
    static throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Helper to debounce function execution.
     */
    static debounce(func, delay) {
        let debounceTimer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }

    /**
     * Returns true if heavy effects should be rendered.
     */
    isHighPerformance() {
        return this.quality.effectsEnabled;
    }

    getStats() {
        return {
            fps: Math.round(this.fps),
            density: this.quality.particleDensity.toFixed(2),
            heavyEffects: this.quality.effectsEnabled
        };
    }
}
