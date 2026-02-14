/**
 * Utility Functions
 * Helper functions for common operations and calculations
 */

const Utils = {
    
    /**
     * Linear interpolation between two values
     * @param {number} start - Starting value
     * @param {number} end - Ending value
     * @param {number} factor - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },
    
    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * Map a value from one range to another
     * @param {number} value - Value to map
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },
    
    /**
     * Get random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random value
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Get random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Calculate distance between two points
     * @param {number} x1 - First point x
     * @param {number} y1 - First point y
     * @param {number} x2 - Second point x
     * @param {number} y2 - Second point y
     * @returns {number} Distance
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Calculate squared distance (faster than distance)
     * @param {number} x1 - First point x
     * @param {number} y1 - First point y
     * @param {number} x2 - Second point x
     * @param {number} y2 - Second point y
     * @returns {number} Squared distance
     */
    distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    },
    
    /**
     * Calculate angle between two points in radians
     * @param {number} x1 - First point x
     * @param {number} y1 - First point y
     * @param {number} x2 - Second point x
     * @param {number} y2 - Second point y
     * @returns {number} Angle in radians
     */
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    /**
     * Convert radians to degrees
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },
    
    /**
     * Normalize a vector
     * @param {number} x - Vector x component
     * @param {number} y - Vector y component
     * @returns {Object} Normalized vector {x, y}
     */
    normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    },
    
    /**
     * Calculate dot product of two vectors
     * @param {number} x1 - First vector x
     * @param {number} y1 - First vector y
     * @param {number} x2 - Second vector x
     * @param {number} y2 - Second vector y
     * @returns {number} Dot product
     */
    dotProduct(x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    },
    
    /**
     * Quadratic easing in
     * @param {number} t - Time (0-1)
     * @returns {number} Eased value
     */
    easeInQuad(t) {
        return t * t;
    },
    
    /**
     * Quadratic easing out
     * @param {number} t - Time (0-1)
     * @returns {number} Eased value
     */
    easeOutQuad(t) {
        return t * (2 - t);
    },
    
    /**
     * Quadratic easing in-out
     * @param {number} t - Time (0-1)
     * @returns {number} Eased value
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    
    /**
     * Cubic easing in
     * @param {number} t - Time (0-1)
     * @returns {number} Eased value
     */
    easeInCubic(t) {
        return t * t * t;
    },
    
    /**
     * Cubic easing out
     * @param {number} t - Time (0-1)
     * @returns {number} Eased value
     */
    easeOutCubic(t) {
        return (--t) * t * t + 1;
    },
    
    /**
     * Cubic easing in-out
     * @param {number} t - Time (0-1)
     * @returns {number} Eased value
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    
    /**
     * Elastic easing out
     * @param {number} t - Time (0-1)
     * @returns {number} Eased value
     */
    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : 
               Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    
    /**
     * Smooth step interpolation
     * @param {number} edge0 - Lower edge
     * @param {number} edge1 - Upper edge
     * @param {number} x - Value to interpolate
     * @returns {number} Smooth stepped value
     */
    smoothStep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    },
    
    /**
     * Check if point is inside circle
     * @param {number} px - Point x
     * @param {number} py - Point y
     * @param {number} cx - Circle center x
     * @param {number} cy - Circle center y
     * @param {number} radius - Circle radius
     * @returns {boolean} True if inside
     */
    isPointInCircle(px, py, cx, cy, radius) {
        return this.distanceSquared(px, py, cx, cy) <= radius * radius;
    },
    
    /**
     * Create a debounced function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Create a throttled function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Format number to percentage
     * @param {number} value - Value (0-1)
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted percentage
     */
    toPercentage(value, decimals = 0) {
        return (value * 100).toFixed(decimals) + '%';
    },
    
    /**
     * Get element position relative to viewport
     * @param {HTMLElement} element - DOM element
     * @returns {Object} Position {x, y, width, height}
     */
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
        };
    },
    
    /**
     * Create a 2D vector
     * @param {number} x - X component
     * @param {number} y - Y component
     * @returns {Object} Vector {x, y}
     */
    createVector(x = 0, y = 0) {
        return { x, y };
    },
    
    /**
     * Add two vectors
     * @param {Object} v1 - First vector
     * @param {Object} v2 - Second vector
     * @returns {Object} Sum vector
     */
    addVectors(v1, v2) {
        return { x: v1.x + v2.x, y: v1.y + v2.y };
    },
    
    /**
     * Subtract two vectors
     * @param {Object} v1 - First vector
     * @param {Object} v2 - Second vector
     * @returns {Object} Difference vector
     */
    subtractVectors(v1, v2) {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    },
    
    /**
     * Multiply vector by scalar
     * @param {Object} v - Vector
     * @param {number} scalar - Scalar value
     * @returns {Object} Scaled vector
     */
    multiplyVector(v, scalar) {
        return { x: v.x * scalar, y: v.y * scalar };
    },
    
    /**
     * Get vector magnitude
     * @param {Object} v - Vector
     * @returns {number} Magnitude
     */
    vectorMagnitude(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    },
    
    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Check if value is numeric
     * @param {*} value - Value to check
     * @returns {boolean} True if numeric
     */
    isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
    
    /**
     * Safe division (avoid division by zero)
     * @param {number} numerator - Numerator
     * @param {number} denominator - Denominator
     * @param {number} fallback - Fallback value if division by zero
     * @returns {number} Result
     */
    safeDivide(numerator, denominator, fallback = 0) {
        return denominator === 0 ? fallback : numerator / denominator;
    }
    
};

// Freeze to prevent modification
Object.freeze(Utils);
