/**
 * SonarRoom - Distance Mapper
 * Calculates distances and maps them to audio parameters
 */

const DistanceMapper = (function () {
    // ============================================
    // Private State
    // ============================================

    let targetPosition = { x: 0, y: 0 };
    let currentDistance = 0;
    let normalizedDistance = 1; // 0 = at target, 1 = far away
    let proximityZone = 'veryFar';

    // ============================================
    // Target Management
    // ============================================

    /**
     * Generate random target position within safe bounds
     * @returns {Object} {x, y} position
     */
    function generateRandomTarget() {
        const viewport = Utils.getViewportSize();

        // Calculate safe bounds (away from edges)
        const margin = CONFIG.target.marginFromEdge;
        const targetWidth = CONFIG.target.width;
        const targetHeight = CONFIG.target.height;

        const minX = margin;
        const maxX = viewport.width - margin - targetWidth;
        const minY = margin;
        const maxY = viewport.height - margin - targetHeight;

        // Generate random position
        const position = Utils.randomPosition(minX, maxX, minY, maxY);

        Utils.log('info', 'Generated target position', position);
        return position;
    }

    /**
     * Set target position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    function setTargetPosition(x, y) {
        targetPosition = { x, y };
        Utils.log('debug', `Target position set to (${x}, ${y})`);
    }

    /**
     * Get current target position
     * @returns {Object} {x, y} position
     */
    function getTargetPosition() {
        return { ...targetPosition };
    }

    /**
     * Get target center position (for distance calculation)
     * @returns {Object} {x, y} center position
     */
    function getTargetCenter() {
        return {
            x: targetPosition.x + CONFIG.target.width / 2,
            y: targetPosition.y + CONFIG.target.height / 2
        };
    }

    // ============================================
    // Distance Calculation
    // ============================================

    /**
     * Calculate distance from cursor to target center
     * @param {number} cursorX - Cursor X position
     * @param {number} cursorY - Cursor Y position
     * @returns {number} Distance in pixels
     */
    function calculateDistance(cursorX, cursorY) {
        const center = getTargetCenter();
        const distance = Utils.distance(cursorX, cursorY, center.x, center.y);

        currentDistance = distance;

        // Normalize distance (0 = at target, 1 = max distance away)
        normalizedDistance = Utils.normalize(
            distance,
            0,
            CONFIG.distance.maxDistance
        );

        // Determine proximity zone
        updateProximityZone();

        return distance;
    }

    /**
     * Get current distance
     * @returns {number} Current distance in pixels
     */
    function getCurrentDistance() {
        return currentDistance;
    }

    /**
     * Get normalized distance (0-1)
     * @returns {number} Normalized distance
     */
    function getNormalizedDistance() {
        return normalizedDistance;
    }

    /**
     * Update proximity zone based on normalized distance
     */
    function updateProximityZone() {
        const zones = CONFIG.distance.zones;

        if (normalizedDistance <= zones.veryClose) {
            proximityZone = 'veryClose';
        } else if (normalizedDistance <= zones.close) {
            proximityZone = 'close';
        } else if (normalizedDistance <= zones.medium) {
            proximityZone = 'medium';
        } else if (normalizedDistance <= zones.far) {
            proximityZone = 'far';
        } else {
            proximityZone = 'veryFar';
        }
    }

    /**
     * Get current proximity zone
     * @returns {string} Zone name
     */
    function getProximityZone() {
        return proximityZone;
    }

    // ============================================
    // Audio Parameter Mapping
    // ============================================

    /**
     * Map distance to frequency (closer = higher pitch)
     * Uses inverse exponential curve for dramatic effect
     * @returns {number} Frequency in Hz
     */
    function getFrequency() {
        // Invert normalized distance (0 = far, 1 = close)
        const proximity = 1 - normalizedDistance;

        // Apply exponential easing for more dramatic change near target
        const easedProximity = Utils.inverseExponentialEase(
            proximity,
            CONFIG.distance.frequencyExponent
        );

        // Map to frequency range
        const frequency = Utils.mapRange(
            easedProximity,
            0,
            1,
            CONFIG.audio.minFrequency,
            CONFIG.audio.maxFrequency
        );

        return frequency;
    }

    /**
     * Map distance to ping interval (closer = faster pings)
     * Uses inverse exponential curve
     * @returns {number} Interval in milliseconds
     */
    function getPingInterval() {
        // Invert normalized distance (0 = far, 1 = close)
        const proximity = 1 - normalizedDistance;

        // Apply exponential easing
        const easedProximity = Utils.inverseExponentialEase(
            proximity,
            CONFIG.distance.intervalExponent
        );

        // Map to interval range (inverted - close = short interval)
        const interval = Utils.mapRange(
            easedProximity,
            0,
            1,
            CONFIG.timing.maxPingInterval,
            CONFIG.timing.minPingInterval
        );

        return interval;
    }

    /**
     * Calculate stereo pan based on horizontal position
     * @param {number} cursorX - Cursor X position
     * @returns {number} Pan value (-1 to 1)
     */
    function getPan(cursorX) {
        if (!CONFIG.audio.enablePanning) return 0;

        const center = getTargetCenter();
        const viewport = Utils.getViewportSize();

        // Calculate horizontal offset from target
        const offsetX = cursorX - center.x;

        // Normalize to -1 to 1 range based on viewport width
        const pan = Utils.clamp(
            offsetX / (viewport.width / 2),
            -1,
            1
        );

        return pan;
    }

    /**
     * Get all audio parameters for current position
     * @param {number} cursorX - Cursor X position
     * @param {number} cursorY - Cursor Y position
     * @returns {Object} {frequency, interval, pan}
     */
    function getAudioParameters(cursorX, cursorY) {
        calculateDistance(cursorX, cursorY);

        return {
            frequency: getFrequency(),
            interval: getPingInterval(),
            pan: getPan(cursorX),
            distance: currentDistance,
            normalizedDistance: normalizedDistance,
            zone: proximityZone
        };
    }

    // ============================================
    // Hit Detection
    // ============================================

    /**
     * Check if cursor is within target hit area
     * @param {number} cursorX - Cursor X position
     * @param {number} cursorY - Cursor Y position
     * @returns {boolean} True if hit
     */
    function isHit(cursorX, cursorY) {
        const center = getTargetCenter();
        const distance = Utils.distance(cursorX, cursorY, center.x, center.y);

        const hit = distance <= CONFIG.distance.successRadius;

        if (hit) {
            Utils.log('info', 'Target hit detected!');
        }

        return hit;
    }

    /**
     * Check if cursor is near target (for visual hints)
     * @param {number} cursorX - Cursor X position
     * @param {number} cursorY - Cursor Y position
     * @param {number} threshold - Distance threshold (normalized 0-1)
     * @returns {boolean} True if near
     */
    function isNear(cursorX, cursorY, threshold = 0.3) {
        calculateDistance(cursorX, cursorY);
        return normalizedDistance <= threshold;
    }

    // ============================================
    // Visual Feedback Helpers
    // ============================================

    /**
     * Get proximity percentage (0-100)
     * @returns {number} Proximity percentage
     */
    function getProximityPercent() {
        return Math.round((1 - normalizedDistance) * 100);
    }

    /**
     * Get color based on proximity (for visual feedback)
     * @returns {string} CSS color value
     */
    function getProximityColor() {
        const proximity = 1 - normalizedDistance;

        // Interpolate from blue (far) to cyan (close)
        if (proximity < 0.5) {
            return Utils.lerpColor('#006688', '#0099cc', proximity * 2);
        } else {
            return Utils.lerpColor('#0099cc', '#00d4ff', (proximity - 0.5) * 2);
        }
    }

    /**
     * Get intensity level (0-3) for visual effects
     * @returns {number} Intensity level
     */
    function getIntensityLevel() {
        if (normalizedDistance <= CONFIG.distance.zones.veryClose) return 3;
        if (normalizedDistance <= CONFIG.distance.zones.close) return 2;
        if (normalizedDistance <= CONFIG.distance.zones.medium) return 1;
        return 0;
    }

    // ============================================
    // Debug Helpers
    // ============================================

    /**
     * Get debug information
     * @returns {Object} Debug data
     */
    function getDebugInfo() {
        return {
            targetPosition,
            targetCenter: getTargetCenter(),
            currentDistance,
            normalizedDistance,
            proximityZone,
            frequency: getFrequency(),
            interval: getPingInterval(),
            proximityPercent: getProximityPercent()
        };
    }

    // ============================================
    // Public API
    // ============================================

    return {
        // Target management
        generateRandomTarget,
        setTargetPosition,
        getTargetPosition,
        getTargetCenter,

        // Distance calculation
        calculateDistance,
        getCurrentDistance,
        getNormalizedDistance,
        getProximityZone,

        // Audio mapping
        getFrequency,
        getPingInterval,
        getPan,
        getAudioParameters,

        // Hit detection
        isHit,
        isNear,

        // Visual feedback
        getProximityPercent,
        getProximityColor,
        getIntensityLevel,

        // Debug
        getDebugInfo
    };
})();

// ============================================
// Export
// ============================================

// Freeze public API
if (Object.freeze) {
    Object.freeze(DistanceMapper);
}
