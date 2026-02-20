import { Complex } from './Vector.js';
import { CONFIG } from '../config.js';
import { SymmetryEngine } from './Symmetry.js';

/**
 * @fileoverview Sketch Interface Manager.
 * Handles the capture of raw user input and transforms it into mathematically valid paths.
 */

export class Sketch {
    /**
     * @param {string} canvasId - The ID of the drawing interaction canvas.
     */
    constructor(canvasId) {
        /** @type {HTMLCanvasElement} */
        this.canvas = document.getElementById(canvasId);
        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');

        /** @type {boolean} */
        this.drawing = false;
        /** @type {Array<{x: number, y: number}>} */
        this.path = [];
        /** @type {Complex[]} */
        this.complexPath = [];

        this.symmetry = new SymmetryEngine();

        this.setupEvents();
        this.resize();
    }

    /**
     * Attaches mouse, touch, and window listeners.
     */
    setupEvents() {
        window.addEventListener('resize', () => this.resize());

        // Mouse Listeners
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e.clientX, e.clientY));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e.clientX, e.clientY));
        this.canvas.addEventListener('mouseup', () => this.handleEnd());
        this.canvas.addEventListener('mouseleave', () => this.handleEnd());

        // Touch Listeners
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleStart(touch.clientX, touch.clientY);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMove(touch.clientX, touch.clientY);
        });
        this.canvas.addEventListener('touchend', () => this.handleEnd());
    }

    /**
     * Resizes canvas and updates symmetry center.
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.symmetry.setCenter(this.canvas.width / 2, this.canvas.height / 2);
        this.redraw();
    }

    /**
     * Marks the beginning of a drawing stroke.
     * @param {number} clientX 
     * @param {number} clientY 
     */
    handleStart(clientX, clientY) {
        this.drawing = true;
        this.path = [];
        this.complexPath = [];

        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        this.addPoint(x, y);
    }

    /**
     * Records moving coordinates during a stroke.
     * @param {number} clientX 
     * @param {number} clientY 
     */
    handleMove(clientX, clientY) {
        if (!this.drawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const lastPoint = this.path[this.path.length - 1];
        if (!lastPoint) return;

        /**
         * We use a distance threshold to avoid capturing too many redundant points
         * which would slow down the brute-force DFT.
         */
        const dist = Math.hypot(x - lastPoint.x, y - lastPoint.y);

        if (dist > 3) {
            this.addPoint(x, y);
            this.redraw();
        }
    }

    /**
     * Concludes the drawing stroke and triggers processing.
     */
    handleEnd() {
        if (!this.drawing) return;
        this.drawing = false;

        if (this.path.length > 5) {
            this.processPath();
        } else {
            this.clear();
        }
    }

    /**
     * Internal helper to record points and apply symmetry.
     * @param {number} x 
     * @param {number} y 
     */
    addPoint(x, y) {
        this.path.push({ x, y });
    }

    /**
     * Centers the path and converts it into complex numbers for DFT.
     */
    processPath() {
        // Calculate the centroid of the path
        const avgX = this.path.reduce((sum, p) => sum + p.x, 0) / this.path.length;
        const avgY = this.path.reduce((sum, p) => sum + p.y, 0) / this.path.length;

        // Convert to Complex Plane relative to center
        this.complexPath = this.path.map(p => new Complex(p.x - avgX, p.y - avgY));

        /**
         * Broadcast the completed path to the App coordinator.
         * @event pathComplete
         */
        const event = new CustomEvent('pathComplete', {
            detail: {
                path: this.complexPath,
                center: { x: avgX, y: avgY },
                rawCount: this.path.length
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Renders the current sketch stroke to the interaction layer.
     */
    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.path.length < 2) return;

        this.ctx.strokeStyle = CONFIG.COLORS.SKETCH;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Dynamic feedback if drawing is active
        if (this.drawing) {
            this.ctx.strokeStyle = CONFIG.COLORS.SKETCH_ACTIVE;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);

        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }

        this.ctx.stroke();
    }

    /**
     * Resets the sketch data and clears the canvas.
     */
    clear() {
        this.path = [];
        this.complexPath = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
