/**
 * @fileoverview Symmetry Engine for FourierDraw.
 * Provides methods to transform a single point into multiple symmetric points.
 */

export class SymmetryEngine {
    constructor() {
        /** @type {number} */
        this.radialPoints = 1;
        /** @type {boolean} */
        this.mirrorEnabled = false;
        /** @type {{x: number, y: number}} */
        this.center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    /**
     * Set the center of symmetry.
     * @param {number} x 
     * @param {number} y 
     */
    setCenter(x, y) {
        this.center = { x, y };
    }

    /**
     * Transforms a point based on current symmetry settings.
     * @param {number} x - Input X coordinate.
     * @param {number} y - Input Y coordinate.
     * @returns {Array<{x: number, y: number}>} Array of symmetric points.
     */
    reflect(x, y) {
        const points = [{ x, y }];

        // Horizontal Mirror
        if (this.mirrorEnabled) {
            const dx = x - this.center.x;
            points.push({ x: this.center.x - dx, y });
        }

        // Radial Symmetry
        if (this.radialPoints > 1) {
            const angleStep = (Math.PI * 2) / this.radialPoints;
            const dx = x - this.center.x;
            const dy = y - this.center.y;
            const radius = Math.sqrt(dx * dx + dy * dy);
            const startAngle = Math.atan2(dy, dx);

            for (let i = 1; i < this.radialPoints; i++) {
                const angle = startAngle + i * angleStep;
                points.push({
                    x: this.center.x + radius * Math.cos(angle),
                    y: this.center.y + radius * Math.sin(angle)
                });
            }
        }

        return points;
    }
}
