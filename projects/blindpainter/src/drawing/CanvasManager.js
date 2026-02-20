import { Config } from '../core/Config.js';

/**
 * @class CanvasManager
 * @description Manages the HTML5 Canvas element.
 * Responsible for resizing and clearing.
 * Although BlindPainter is a "black screen" app, we keep this to support:
 * 1. Potential visual debug modes.
 * 2. Subtle visual cues (cursor).
 */
export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Handle resizing
        this.boundResize = this.resize.bind(this);
        window.addEventListener('resize', this.boundResize);

        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.clear();
    }

    clear() {
        // Fill with darkness
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * @method renderCursor
     * @param {Vector2} pos 
     * @param {number} intensity - 0 to 1
     */
    renderCursor(pos, intensity) {
        // We can draw a very faint glint for the user
        // Or keep it completely black as per requirements ("Minimal hidden UI controls")
        // Implementation plan says "Subtle cursor indicators only when needed"

        // Faint redraw of black to create trails (fade effect)
        this.ctx.fillStyle = `rgba(0, 0, 0, ${Config.DRAWING.FADE_RATE})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw cursor
        const size = Math.max(2, intensity * 5);
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(50, 50, 50, ${0.1 + intensity * 0.2})`; // Very subtle grey
        this.ctx.fill();
    }

    renderDebug(spatialHash) {
        // Draw grid if debug mode
        if (!Config.UI.DEBUG_MODE) return;

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;

        // Draw occupied cells
        for (const [key, items] of spatialHash.cells) {
            const [cx, cy] = key.split(',').map(Number);
            this.ctx.strokeRect(
                cx * Config.DRAWING.SPATIAL_CELL_SIZE,
                cy * Config.DRAWING.SPATIAL_CELL_SIZE,
                Config.DRAWING.SPATIAL_CELL_SIZE,
                Config.DRAWING.SPATIAL_CELL_SIZE
            );
        }
    }
}
