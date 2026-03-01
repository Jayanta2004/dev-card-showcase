import { Vector } from '../core/Vector.js';

/**
 * FontAnalyzer - Analyzes text and returns a list of target points.
 */
export class FontAnalyzer {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.fontSize = 120;
        this.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    }

    /**
     * Extracts points from the given text.
     * @param {string} text - The text to analyze.
     * @param {number} density - Sampling density (higher = fewer points).
     * @returns {Vector[]} Array of target positions.
     */
    extractPoints(text, density = 6) {
        const padding = 100;

        // Measure text
        this.ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
        const metrics = this.ctx.measureText(text);
        const textWidth = Math.ceil(metrics.width);
        const textHeight = this.fontSize;

        // Resize context
        this.canvas.width = textWidth + padding * 2;
        this.canvas.height = textHeight + padding * 2;

        // Draw text
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, padding, padding);

        // Get pixel data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        const points = [];

        // Sample pixels
        for (let y = 0; y < this.canvas.height; y += density) {
            for (let x = 0; x < this.canvas.width; x += density) {
                const index = (y * this.canvas.width + x) * 4;
                const alpha = pixels[index + 3];

                if (alpha > 128) {
                    points.push(new Vector(x, y));
                }
            }
        }

        // Center the points relative to the canvas
        const offsetX = (window.innerWidth - this.canvas.width) / 2;
        const offsetY = (window.innerHeight - this.canvas.height) / 2;

        return points.map(p => {
            p.x += offsetX;
            p.y += offsetY;
            return p;
        });
    }
}
