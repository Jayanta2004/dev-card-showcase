/**
 * @file analytics.js
 * @description Tracks usage statistics for the current drawing session.
 * This module measures things like total distance drawn, shake frequency, 
 * and session duration.
 * 
 * PURPOSE:
 * While a toy, the digital version can provide interesting feedback about
 * the user's "artwork" complexity.
 */

const Analytics = (() => {

    // --- State ---
    const stats = {
        totalDistance: 0,
        shakeCount: 0,
        startTime: null,
        sessionActive: false,
        peakVelocity: 0,
        pointsDrawn: 0
    };

    // --- Private Methods ---

    /**
     * Formats a distance in pixels to a more "human" unit like "inches" 
     * based on a standard DPI.
     * @param {number} pixels 
     * @returns {string}
     */
    function pixelsToPhysical(pixels) {
        const inches = pixels / 96; // Rough estimate of screen DPI
        return inches.toFixed(2) + '"';
    }

    // --- Public API ---

    /**
     * Starts the session timer.
     */
    function startSession() {
        stats.startTime = Date.now();
        stats.sessionActive = true;
        Logger.debug('Analytics session started.');
    }

    /**
     * Logs a movement segment.
     * @param {number} dx 
     * @param {number} dy 
     * @param {number} velocity 
     */
    function recordMove(dx, dy, velocity) {
        if (!stats.sessionActive) return;

        const distance = Math.sqrt(dx * dx + dy * dy);
        stats.totalDistance += distance;
        stats.pointsDrawn++;

        if (velocity > stats.peakVelocity) {
            stats.peakVelocity = velocity;
        }
    }

    /**
     * Logs a shake event.
     */
    function recordShake() {
        stats.shakeCount++;
        Logger.debug(`Analytics: Shake recorded. Total shakes: ${stats.shakeCount}`);
    }

    /**
     * Generates a summary report of the session.
     * @returns {Object}
     */
    function getSummary() {
        const durationSeconds = stats.startTime ? (Date.now() - stats.startTime) / 1000 : 0;

        return {
            distance: pixelsToPhysical(stats.totalDistance),
            shakes: stats.shakeCount,
            duration: durationSeconds.toFixed(1) + 's',
            complexity: stats.pointsDrawn,
            efficiency: (stats.totalDistance / durationSeconds).toFixed(2) + ' px/s'
        };
    }

    /**
     * Resets the current stats.
     */
    function reset() {
        stats.totalDistance = 0;
        stats.shakeCount = 0;
        stats.startTime = Date.now();
        stats.peakVelocity = 0;
        stats.pointsDrawn = 0;
        Logger.info('Analytics state reset.');
    }

    /**
     * Displays a report in the console for the user.
     */
    function printReport() {
        const summary = getSummary();
        console.table(summary);
    }

    // Exported surface
    return {
        startSession,
        recordMove,
        recordShake,
        getSummary,
        printReport,
        reset
    };
})();
