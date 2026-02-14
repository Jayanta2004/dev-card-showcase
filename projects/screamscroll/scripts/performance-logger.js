/**
 * ScreamScroll - Performance & Event Logger
 * 
 * Tracks engine statistics, audio events, and ensures system stability
 * by monitoring frame rates and processing times.
 */

class PerformanceLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.startTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = performance.now();

        this.metrics = {
            peakAmplitude: 0,
            totalScrollDistance: 0,
            whistleCount: 0,
            glitchCount: 0
        };

        this.enabled = true;
    }

    /**
     * Record a new event log
     * @param {string} category - Logger category (AUDIO, ENGINE, UI, SYSTEM)
     * @param {string} message - Detailed log message
     */
    log(category, message) {
        if (!this.enabled) return;

        const timestamp = (performance.now() - this.startTime).toFixed(2);
        const entry = `[${timestamp}ms] ${category}: ${message}`;

        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Output to console in development
        if (category === 'SYSTEM' || category === 'ERROR') {
            console.log(entry);
        }
    }

    /**
     * Update frame-based metrics
     */
    tick() {
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastFpsUpdate;

        if (elapsed >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastFpsUpdate = now;

            // Log FPS if it drops significantly
            if (this.fps < 30) {
                this.log('SYSTEM', `Performance Warning: FPS dropped to ${this.fps}`);
            }
        }
    }

    /**
     * Record a specific metric event
     * @param {string} key - Metric key
     * @param {number} value - Delta to add (default 1)
     */
    recordMetric(key, value = 1) {
        if (key in this.metrics) {
            if (key === 'peakAmplitude') {
                this.metrics[key] = Math.max(this.metrics[key], value);
            } else {
                this.metrics[key] += value;
            }
        }
    }

    /**
     * Get current diagnostic report
     */
    getReport() {
        return {
            fps: this.fps,
            uptime: (performance.now() - this.startTime) / 1000,
            metrics: this.metrics,
            recentLogs: this.logs
        };
    }

    /**
     * Clear all recorded logs
     */
    clear() {
        this.logs = [];
        this.log('SYSTEM', 'Logger cleared.');
    }
}

// Export as a singleton
window.PerformanceLogger = new PerformanceLogger();
