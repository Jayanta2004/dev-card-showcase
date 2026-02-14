// ============================================
// DISTANCE-CALCULATOR.JS
// Mathematical distance calculations and proximity detection
// ============================================

/**
 * DistanceCalculator Module
 * Handles all distance-related calculations between cursor and target
 */
const DistanceCalculator = (function () {
    'use strict';

    // Private variables
    let maxDistance = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;

    // Proximity thresholds (as percentage of max distance)
    const PROXIMITY_THRESHOLDS = {
        VERY_CLOSE: 0.1,  // 10% of max distance
        CLOSE: 0.25,      // 25% of max distance
        MEDIUM: 0.5,      // 50% of max distance
        FAR: 1.0          // 100% of max distance
    };

    /**
     * Initialize the distance calculator
     * Calculates maximum possible distance based on viewport
     */
    function init() {
        updateViewportDimensions();
        calculateMaxDistance();

        // Update on window resize
        window.addEventListener('resize', handleResize);

        return true; // Return success
    }

    /**
     * Update viewport dimensions
     */
    function updateViewportDimensions() {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    }

    /**
     * Calculate maximum possible distance (diagonal of viewport)
     */
    function calculateMaxDistance() {
        maxDistance = Math.sqrt(
            Math.pow(viewportWidth, 2) + Math.pow(viewportHeight, 2)
        );
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        updateViewportDimensions();
        calculateMaxDistance();
    }

    /**
     * Calculate Euclidean distance between two points
     * @param {number} x1 - First point X coordinate
     * @param {number} y1 - First point Y coordinate
     * @param {number} x2 - Second point X coordinate
     * @param {number} y2 - Second point Y coordinate
     * @returns {number} Distance between points
     */
    function calculateDistance(x1, y1, x2, y2) {
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    /**
     * Calculate normalized distance (0-1 range)
     * 0 = at target, 1 = maximum distance away
     * @param {number} distance - Raw distance value
     * @returns {number} Normalized distance (0-1)
     */
    function normalizeDistance(distance) {
        if (maxDistance === 0) return 0;
        return Math.min(distance / maxDistance, 1);
    }

    /**
     * Get distance between cursor and target
     * @param {Object} cursorPos - {x, y} cursor position
     * @param {Object} targetPos - {x, y} target position
     * @returns {Object} {raw, normalized} distance values
     */
    function getDistance(cursorPos, targetPos) {
        const raw = calculateDistance(
            cursorPos.x,
            cursorPos.y,
            targetPos.x,
            targetPos.y
        );
        const normalized = normalizeDistance(raw);

        return {
            raw: raw,
            normalized: normalized
        };
    }

    /**
     * Map distance to frequency (Hz)
     * Closer = higher frequency
     * @param {number} normalizedDistance - Distance in 0-1 range
     * @returns {number} Frequency in Hz
     */
    function distanceToFrequency(normalizedDistance) {
        const MIN_FREQ = 200;  // Hz
        const MAX_FREQ = 800;  // Hz

        // Invert so closer = higher frequency
        const inverted = 1 - normalizedDistance;

        // Apply exponential curve for more dramatic change
        const curved = Math.pow(inverted, 2);

        return MIN_FREQ + (curved * (MAX_FREQ - MIN_FREQ));
    }

    /**
     * Map distance to ping interval (milliseconds)
     * Closer = faster pings
     * @param {number} normalizedDistance - Distance in 0-1 range
     * @returns {number} Interval in milliseconds
     */
    function distanceToInterval(normalizedDistance) {
        const MIN_INTERVAL = 100;   // ms (very close)
        const MAX_INTERVAL = 1000;  // ms (far away)

        // Apply exponential curve for more dramatic change
        const curved = Math.pow(normalizedDistance, 1.5);

        return MIN_INTERVAL + (curved * (MAX_INTERVAL - MIN_INTERVAL));
    }

    /**
     * Get proximity zone based on distance
     * @param {number} normalizedDistance - Distance in 0-1 range
     * @returns {string} Proximity zone name
     */
    function getProximityZone(normalizedDistance) {
        if (normalizedDistance <= PROXIMITY_THRESHOLDS.VERY_CLOSE) {
            return 'very-close';
        } else if (normalizedDistance <= PROXIMITY_THRESHOLDS.CLOSE) {
            return 'close';
        } else if (normalizedDistance <= PROXIMITY_THRESHOLDS.MEDIUM) {
            return 'medium';
        } else {
            return 'far';
        }
    }

    /**
     * Check if cursor is within target threshold
     * @param {number} distance - Raw distance value
     * @param {number} threshold - Threshold radius
     * @returns {boolean} True if within threshold
     */
    function isWithinThreshold(distance, threshold) {
        return distance <= threshold;
    }

    /**
     * Calculate angle between two points (in radians)
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Angle in radians
     */
    function calculateAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Calculate direction vector from point A to point B
     * @param {Object} pointA - {x, y}
     * @param {Object} pointB - {x, y}
     * @returns {Object} {x, y} normalized direction vector
     */
    function getDirectionVector(pointA, pointB) {
        const dx = pointB.x - pointA.x;
        const dy = pointB.y - pointA.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude === 0) {
            return { x: 0, y: 0 };
        }

        return {
            x: dx / magnitude,
            y: dy / magnitude
        };
    }

    /**
     * Interpolate between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    function lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Smooth step interpolation (ease in/out)
     * @param {number} t - Input value (0-1)
     * @returns {number} Smoothed value (0-1)
     */
    function smoothStep(t) {
        return t * t * (3 - 2 * t);
    }

    /**
     * Clamp value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Map value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    function mapRange(value, inMin, inMax, outMin, outMax) {
        const normalized = (value - inMin) / (inMax - inMin);
        return outMin + normalized * (outMax - outMin);
    }

    /**
     * Get viewport center point
     * @returns {Object} {x, y} center coordinates
     */
    function getViewportCenter() {
        return {
            x: viewportWidth / 2,
            y: viewportHeight / 2
        };
    }

    /**
     * Check if point is within viewport bounds
     * @param {Object} point - {x, y} coordinates
     * @returns {boolean} True if within bounds
     */
    function isInViewport(point) {
        return point.x >= 0 &&
            point.x <= viewportWidth &&
            point.y >= 0 &&
            point.y <= viewportHeight;
    }

    /**
     * Get random point within viewport
     * @param {number} margin - Margin from edges (pixels)
     * @returns {Object} {x, y} random coordinates
     */
    function getRandomPoint(margin = 50) {
        return {
            x: margin + Math.random() * (viewportWidth - 2 * margin),
            y: margin + Math.random() * (viewportHeight - 2 * margin)
        };
    }

    /**
     * Calculate distance from point to viewport edge
     * @param {Object} point - {x, y} coordinates
     * @returns {number} Distance to nearest edge
     */
    function distanceToEdge(point) {
        const distToLeft = point.x;
        const distToRight = viewportWidth - point.x;
        const distToTop = point.y;
        const distToBottom = viewportHeight - point.y;

        return Math.min(distToLeft, distToRight, distToTop, distToBottom);
    }

    // Public API
    return {
        init: init,
        getDistance: getDistance,
        distanceToFrequency: distanceToFrequency,
        distanceToInterval: distanceToInterval,
        getProximityZone: getProximityZone,
        isWithinThreshold: isWithinThreshold,
        calculateAngle: calculateAngle,
        getDirectionVector: getDirectionVector,
        lerp: lerp,
        smoothStep: smoothStep,
        clamp: clamp,
        mapRange: mapRange,
        getViewportCenter: getViewportCenter,
        isInViewport: isInViewport,
        getRandomPoint: getRandomPoint,
        distanceToEdge: distanceToEdge,
        getMaxDistance: () => maxDistance,
        getViewportWidth: () => viewportWidth,
        getViewportHeight: () => viewportHeight
    };
})();
