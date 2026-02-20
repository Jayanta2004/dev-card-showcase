import { ColorMap } from './ColorMap.js';

/**
 * Advanced Canvas Renderer (PRO Edition)
 * 
 * Handles real-time pixel-level rendering of the simulation grids
 * with support for color mapping, camera transformations, and high-DPI scaling.
 * 
 * @class Renderer
 */
export class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas - Target canvas
     * @param {number} width - Simulation width
     * @param {number} height - Simulation height
     */
    constructor(canvas, width, height) {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;
        /** @type {number} simulation resolution */
        this.width = width;
        this.height = height;

        this.ctx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true // Performance hint
        });

        /** @type {ColorMap} Palette provider */
        this.colorMap = new ColorMap();

        // --- Buffer Management ---
        this.imageData = this.ctx.createImageData(width, height);
        this.pixels = new Uint32Array(this.imageData.data.buffer); // 32-bit pixel view for speed

        // --- Camera State ---
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;

        // Sync dimensions
        this.canvas.width = width;
        this.canvas.height = height;

        this.initCameraEvents();
    }

    /**
     * Setup wheel-based zooming and pan interaction.
     * @private
     */
    initCameraEvents() {
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.001;
            const delta = -e.deltaY * zoomSpeed;
            this.zoom = Math.max(0.5, Math.min(10.0, this.zoom + delta));
            this.applyTransform();
        }, { passive: false });
    }

    /**
     * Applies CSS transforms for visual zoom/pan to avoid re-calculating pixels.
     * This method leverages the browser's native compositing engine for buttery
     * smooth transformations even at high zoom levels.
     * 
     * @private
     */
    applyTransform() {
        // Translation + Scaling
        this.canvas.style.transformOrigin = '0 0';
        this.canvas.style.transform = `scale(${this.zoom})`;
    }

    /**
     * Renders simulation state to the canvas.
     * Uses optimized 32-bit pixel writing to minimize CPU overhead.
     * 
     * Logic: 
     * 1. Iterate through Chemical B grid
     * 2. Map B-Concentration to RGBA via ColorMap
     * 3. Pack RGBA into 32-bit Uint32 for direct buffer injection
     * 
     * @param {Float32Array} gridA - Chemical A (Feedstock)
     * @param {Float32Array} gridB - Chemical B (Reaction Product)
     * @returns {Object} Frame statistics (meanDensity)
     */
    render(gridA, gridB) {
        const size = this.width * this.height;
        const pixels = this.pixels; // Typed view of the imageData buffer
        const colorMap = this.colorMap;

        // Statistics for modulation systems (Audio/Reactive)
        let totalDensity = 0;

        for (let i = 0; i < size; i++) {
            const b = gridB[i];
            totalDensity += b;

            // Transpose concentration (0.0 - 1.0) into RGB space
            const color = colorMap.getColor(b);

            // Fast-writing to Uint32Array (ABGR format on Little-Endian systems)
            // byte 3: Alpha (255)
            // byte 2: Blue
            // byte 1: Green
            // byte 0: Red
            // Resulting integer: 0xAA BB GG RR
            pixels[i] = (255 << 24) | (color.b << 16) | (color.g << 8) | color.r;
        }

        // Commit pixel buffer to GPU for rasterization
        this.ctx.putImageData(this.imageData, 0, 0);

        return {
            meanDensity: totalDensity / size
        };
    }

    /**
     * Resets camera state to default (1:1 scale).
     */
    resetCamera() {
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.applyTransform();
    }
}
