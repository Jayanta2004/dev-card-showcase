/**
 * SCROLLSTORY - INTERPOLATION SYSTEM
 * 
 * Smooth interpolation utilities for visual transitions.
 * Handles color blending, numeric interpolation, and easing functions.
 */

class Interpolator {
    constructor() {
        // Easing functions collection
        this.easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInQuart: t => t * t * t * t,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
            easeInQuint: t => t * t * t * t * t,
            easeOutQuint: t => 1 + (--t) * t * t * t * t,
            easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
            easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
            easeOutSine: t => Math.sin(t * Math.PI / 2),
            easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
            easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
            easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
            easeInOutExpo: t => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                return t < 0.5 
                    ? Math.pow(2, 20 * t - 10) / 2 
                    : (2 - Math.pow(2, -20 * t + 10)) / 2;
            },
            easeInCirc: t => 1 - Math.sqrt(1 - t * t),
            easeOutCirc: t => Math.sqrt(1 - (--t) * t),
            easeInOutCirc: t => {
                return t < 0.5
                    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
                    : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
            },
            easeInBack: t => {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return c3 * t * t * t - c1 * t * t;
            },
            easeOutBack: t => {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
            },
            easeInOutBack: t => {
                const c1 = 1.70158;
                const c2 = c1 * 1.525;
                return t < 0.5
                    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
            }
        };
    }
    
    /**
     * Interpolate between two numbers
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} progress - Progress (0-1)
     * @param {string} easing - Easing function name
     * @returns {number}
     */
    lerp(start, end, progress, easing = 'linear') {
        const easedProgress = this.ease(progress, easing);
        return start + (end - start) * easedProgress;
    }
    
    /**
     * Apply easing function to progress
     * @param {number} progress - Progress (0-1)
     * @param {string} easingName - Name of easing function
     * @returns {number}
     */
    ease(progress, easingName = 'linear') {
        const easingFn = this.easingFunctions[easingName] || this.easingFunctions.linear;
        return easingFn(Math.max(0, Math.min(1, progress)));
    }
    
    /**
     * Parse hex color to RGB
     * @param {string} hex - Hex color string
     * @returns {object} - { r, g, b }
     */
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
    }
    
    /**
     * Convert RGB to hex
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} - Hex color string
     */
    rgbToHex(r, g, b) {
        r = Math.round(Math.max(0, Math.min(255, r)));
        g = Math.round(Math.max(0, Math.min(255, g)));
        b = Math.round(Math.max(0, Math.min(255, b)));
        
        return '#' + [r, g, b]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
    }
    
    /**
     * Interpolate between two colors
     * @param {string} startColor - Start color (hex)
     * @param {string} endColor - End color (hex)
     * @param {number} progress - Progress (0-1)
     * @param {string} easing - Easing function name
     * @returns {string} - Interpolated color (hex)
     */
    lerpColor(startColor, endColor, progress, easing = 'linear') {
        const easedProgress = this.ease(progress, easing);
        
        const start = this.hexToRgb(startColor);
        const end = this.hexToRgb(endColor);
        
        const r = this.lerp(start.r, end.r, easedProgress, 'linear');
        const g = this.lerp(start.g, end.g, easedProgress, 'linear');
        const b = this.lerp(start.b, end.b, easedProgress, 'linear');
        
        return this.rgbToHex(r, g, b);
    }
    
    /**
     * Interpolate between multiple colors
     * @param {array} colors - Array of color stops [{ color: '#fff', position: 0.5 }]
     * @param {number} progress - Progress (0-1)
     * @param {string} easing - Easing function name
     * @returns {string} - Interpolated color (hex)
     */
    lerpMultipleColors(colors, progress, easing = 'linear') {
        if (colors.length === 0) return '#000000';
        if (colors.length === 1) return colors[0].color;
        
        // Sort colors by position
        const sortedColors = [...colors].sort((a, b) => a.position - b.position);
        
        // Apply easing to overall progress
        const easedProgress = this.ease(progress, easing);
        
        // Find the two colors to interpolate between
        let startColor = sortedColors[0];
        let endColor = sortedColors[sortedColors.length - 1];
        
        for (let i = 0; i < sortedColors.length - 1; i++) {
            if (easedProgress >= sortedColors[i].position && 
                easedProgress <= sortedColors[i + 1].position) {
                startColor = sortedColors[i];
                endColor = sortedColors[i + 1];
                break;
            }
        }
        
        // Calculate local progress between the two colors
        const localProgress = (easedProgress - startColor.position) / 
                            (endColor.position - startColor.position);
        
        return this.lerpColor(startColor.color, endColor.color, localProgress, 'linear');
    }
    
    /**
     * Smooth step function (sigmoid-like)
     * @param {number} edge0 - Lower edge
     * @param {number} edge1 - Upper edge
     * @param {number} x - Input value
     * @returns {number}
     */
    smoothStep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }
    
    /**
     * Smoother step function
     * @param {number} edge0 - Lower edge
     * @param {number} edge1 - Upper edge
     * @param {number} x - Input value
     * @returns {number}
     */
    smootherStep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    /**
     * Map value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input minimum
     * @param {number} inMax - Input maximum
     * @param {number} outMin - Output minimum
     * @param {number} outMax - Output maximum
     * @returns {number}
     */
    map(value, inMin, inMax, outMin, outMax) {
        return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
    }
    
    /**
     * Clamp value between min and max
     * @param {number} value - Input value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number}
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    /**
     * Create a spring animation value
     * @param {number} current - Current value
     * @param {number} target - Target value
     * @param {number} velocity - Current velocity
     * @param {number} stiffness - Spring stiffness (default: 0.1)
     * @param {number} damping - Spring damping (default: 0.8)
     * @returns {object} - { value, velocity }
     */
    spring(current, target, velocity, stiffness = 0.1, damping = 0.8) {
        const force = (target - current) * stiffness;
        velocity = (velocity + force) * damping;
        const value = current + velocity;
        
        return { value, velocity };
    }
    
    /**
     * Interpolate array of numbers
     * @param {array} startArray - Start values
     * @param {array} endArray - End values
     * @param {number} progress - Progress (0-1)
     * @param {string} easing - Easing function name
     * @returns {array}
     */
    lerpArray(startArray, endArray, progress, easing = 'linear') {
        const maxLength = Math.max(startArray.length, endArray.length);
        const result = [];
        
        for (let i = 0; i < maxLength; i++) {
            const start = startArray[i] !== undefined ? startArray[i] : 0;
            const end = endArray[i] !== undefined ? endArray[i] : 0;
            result.push(this.lerp(start, end, progress, easing));
        }
        
        return result;
    }
    
    /**
     * Create interpolated gradient
     * @param {number} progress - Progress (0-1)
     * @param {object} config - Gradient configuration
     * @returns {string} - CSS gradient string
     */
    createGradient(progress, config) {
        const { type = 'linear', angle = 0, colors } = config;
        
        const interpolatedColors = colors.map((colorStop, index) => {
            const nextIndex = (index + 1) % colors.length;
            const color = this.lerpColor(
                colorStop.color, 
                colors[nextIndex].color, 
                progress
            );
            return `${color} ${colorStop.position * 100}%`;
        });
        
        if (type === 'linear') {
            return `linear-gradient(${angle}deg, ${interpolatedColors.join(', ')})`;
        } else if (type === 'radial') {
            return `radial-gradient(circle, ${interpolatedColors.join(', ')})`;
        }
        
        return '';
    }
    
    /**
     * Oscillate between two values
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {number} time - Time value
     * @param {number} frequency - Oscillation frequency
     * @returns {number}
     */
    oscillate(min, max, time, frequency = 1) {
        const normalized = (Math.sin(time * frequency) + 1) / 2;
        return this.lerp(min, max, normalized, 'linear');
    }
    
    /**
     * Create a bezier curve interpolation
     * @param {number} progress - Progress (0-1)
     * @param {number} p0 - Control point 0
     * @param {number} p1 - Control point 1
     * @param {number} p2 - Control point 2
     * @param {number} p3 - Control point 3
     * @returns {number}
     */
    cubicBezier(progress, p0, p1, p2, p3) {
        const t = progress;
        const invT = 1 - t;
        
        return (
            invT * invT * invT * p0 +
            3 * invT * invT * t * p1 +
            3 * invT * t * t * p2 +
            t * t * t * p3
        );
    }
}

/**
 * Value Smoother - Smooths rapid value changes
 */
class ValueSmoother {
    constructor(smoothingFactor = 0.1) {
        this.smoothingFactor = smoothingFactor;
        this.currentValue = 0;
        this.targetValue = 0;
    }
    
    /**
     * Set target value
     * @param {number} value - Target value
     */
    setTarget(value) {
        this.targetValue = value;
    }
    
    /**
     * Update and get smoothed value
     * @returns {number}
     */
    update() {
        this.currentValue += (this.targetValue - this.currentValue) * this.smoothingFactor;
        return this.currentValue;
    }
    
    /**
     * Get current value
     * @returns {number}
     */
    getValue() {
        return this.currentValue;
    }
    
    /**
     * Reset to zero
     */
    reset() {
        this.currentValue = 0;
        this.targetValue = 0;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Interpolator = Interpolator;
    window.ValueSmoother = ValueSmoother;
}
