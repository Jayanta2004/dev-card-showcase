/**
 * paint-trail.js
 * Paint trail system for SnakeSwarm
 * Manages colored trails left by snakes with blending and effects
 */

/**
 * TrailPoint class
 * Represents a single point in a paint trail
 */
class TrailPoint {
    constructor(x, y, color, timestamp, size = 1) {
        this.x = x;
        this.y = y;
        this.color = color; // {r, g, b}
        this.timestamp = timestamp;
        this.size = size;
        this.opacity = 1.0;
    }

    /**
     * Update opacity based on age (for fade effect)
     * @param {number} currentTime
     * @param {number} fadeTime - Time in ms for full fade
     */
    updateOpacity(currentTime, fadeTime) {
        if (fadeTime <= 0) {
            this.opacity = 1.0;
            return;
        }

        const age = currentTime - this.timestamp;
        this.opacity = Math.max(0, 1 - (age / fadeTime));
    }
}

/**
 * PaintTrail class
 * Manages the paint trail system
 */
export class PaintTrail {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.trails = []; // Array of TrailPoint objects
        this.maxTrailPoints = 10000; // Limit for performance
        this.fadeEnabled = true;
        this.fadeTime = 30000; // 30 seconds to fade
        this.baseOpacity = 0.8;
    }

    /**
     * Add a new trail point
     * @param {number} x
     * @param {number} y
     * @param {{r: number, g: number, b: number}} color
     * @param {number} size
     */
    addPoint(x, y, color, size = 1) {
        const point = new TrailPoint(x, y, color, Date.now(), size);
        this.trails.push(point);

        // Remove oldest points if we exceed max
        if (this.trails.length > this.maxTrailPoints) {
            this.trails.shift();
        }
    }

    /**
     * Update all trail points (for fade effect)
     */
    update() {
        if (!this.fadeEnabled) return;

        const currentTime = Date.now();

        // Update opacity and remove fully faded points
        this.trails = this.trails.filter(point => {
            point.updateOpacity(currentTime, this.fadeTime);
            return point.opacity > 0.01;
        });
    }

    /**
     * Clear all trails
     */
    clear() {
        this.trails = [];
    }

    /**
     * Render trails to canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        // Group trails by approximate position for blending
        const blendRadius = 3;

        // Render each trail point
        for (const point of this.trails) {
            const opacity = point.opacity * this.baseOpacity;

            // Create radial gradient for glow effect
            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, point.size * 3
            );

            const color = point.color;
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Set fade enabled
     * @param {boolean} enabled
     */
    setFadeEnabled(enabled) {
        this.fadeEnabled = enabled;

        // If disabling fade, reset all opacities
        if (!enabled) {
            this.trails.forEach(point => {
                point.opacity = 1.0;
            });
        }
    }

    /**
     * Set base opacity
     * @param {number} opacity - 0 to 1
     */
    setBaseOpacity(opacity) {
        this.baseOpacity = Math.max(0, Math.min(1, opacity));
    }

    /**
     * Get trail count
     * @returns {number}
     */
    getTrailCount() {
        return this.trails.length;
    }

    /**
     * Blend two colors additively
     * @param {{r: number, g: number, b: number}} color1
     * @param {{r: number, g: number, b: number}} color2
     * @returns {{r: number, g: number, b: number}}
     */
    static blendColors(color1, color2) {
        return {
            r: Math.min(255, color1.r + color2.r),
            g: Math.min(255, color1.g + color2.g),
            b: Math.min(255, color1.b + color2.b),
        };
    }

    /**
     * Convert hex color to RGB
     * @param {string} hex - e.g., "#ff0080"
     * @returns {{r: number, g: number, b: number}}
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    /**
     * Create gradient color between two colors
     * @param {{r: number, g: number, b: number}} color1
     * @param {{r: number, g: number, b: number}} color2
     * @param {number} ratio - 0 to 1
     * @returns {{r: number, g: number, b: number}}
     */
    static gradientColor(color1, color2, ratio) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * ratio),
            g: Math.round(color1.g + (color2.g - color1.g) * ratio),
            b: Math.round(color1.b + (color2.b - color1.b) * ratio),
        };
    }
}
