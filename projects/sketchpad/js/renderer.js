/**
 * @file renderer.js
 * @description Handles all canvas-based drawing operations for the SketchPad.
 * This module is responsible for initializing the canvas, managing the drawing 
 * context, and providing high-level functions for line drawing and screen clearing.
 * 
 * ADVANCED FEATURES:
 * - Stylus state encapsulation.
 * - Drawing history tracking (internally for future features).
 * - High DPI (Retina) support for crisp lines.
 * - Optimized render loop for smooth drawing.
 */

const Renderer = (() => {
    // --- Private Constants ---

    /** @type {string} Graphite-like color for the drawing line */
    const STROKE_COLOR = 'rgba(66, 66, 66, 0.9)';

    /** @type {number} Base thickness of the line */
    const STROKE_WIDTH = 2;

    /** @type {string} Default background color mimicking the gray powder */
    const SCREEN_BG_COLOR = '#bdbdbd';

    // --- State Management ---

    /**
     * @typedef {Object} Stylus
     * @property {number} x - Current horizontal position.
     * @property {number} y - Current vertical position.
     * @property {number} lastX - Previous horizontal position.
     * @property {number} lastY - Previous vertical position.
     * @property {number} velocity - Current movement speed.
     */
    const stylus = {
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0,
        velocity: 0
    };

    /** @type {HTMLCanvasElement} */
    let canvas = null;
    /** @type {CanvasRenderingContext2D} */
    let ctx = null;
    /** @type {number} Device pixel ratio for high DPI screens */
    let dpr = 1;

    // --- Private Methods ---

    /**
     * Configures the canvas for High DPI displays to prevent blurry lines.
     */
    function setupHighDPI() {
        if (!canvas || !ctx) return;

        dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();

        // Set the internal resolution
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Set the display size
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Scale the context to match the internal resolution
        ctx.scale(dpr, dpr);

        Logger.debug(`High DPI Setup complete: ${rect.width}x${rect.height} @ ${dpr}x`);

        // Reset styles as context resize clears them
        applyContextStyles();
    }

    /**
     * Applies the drawing styles to the 2D context.
     */
    function applyContextStyles() {
        if (!ctx) return;

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = STROKE_COLOR;
        ctx.lineWidth = STROKE_WIDTH;

        // Add subtle drop shadow for realistic graphite effect
        ctx.shadowBlur = 0.5;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowOffsetX = 0.5;
        ctx.shadowOffsetY = 0.5;
    }

    /**
     * Orchestrates the canvas resize flow.
     */
    const handleResize = Utils.debounce(() => {
        Logger.info('Resizing canvas drawing area...');

        // Before resizing, we might want to capture the current frame
        // to restore it, but in an Etch-a-Sketch, the powder clears on resize!
        // This is a faithful "hardware" imitation.

        setupHighDPI();

        // Recalculate center
        const rect = canvas.getBoundingClientRect();
        stylus.x = rect.width / 2;
        stylus.y = rect.height / 2;
        stylus.lastX = stylus.x;
        stylus.lastY = stylus.y;

        // Ensure background is filled
        clear(false);
    }, 250);

    // --- Public API ---

    /**
     * Initializes the renderer module.
     * @param {string} canvasId 
     */
    function init(canvasId) {
        Logger.info(`Initializing Renderer on element: #${canvasId}`);

        canvas = document.getElementById(canvasId);
        if (!canvas) {
            Logger.error(`Renderer failed: Element #${canvasId} not found.`);
            return;
        }

        ctx = canvas.getContext('2d', {
            alpha: false, // Opaque canvas is faster
            desynchronized: true // Low latency mode if supported
        });

        // Initialize display scaling
        setupHighDPI();

        // Initial stylus positioning
        const rect = canvas.getBoundingClientRect();
        stylus.x = rect.width / 2;
        stylus.y = rect.height / 2;
        stylus.lastX = stylus.x;
        stylus.lastY = stylus.y;

        // Event listeners
        window.addEventListener('resize', handleResize);

        Logger.info('Renderer is ready and stylus is centered.');
    }

    /**
     * Draws a line segment from previous to next position.
     * @param {number} deltaX 
     * @param {number} deltaY 
     */
    function draw(deltaX, deltaY) {
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();

        // Store previous
        stylus.lastX = stylus.x;
        stylus.lastY = stylus.y;

        // Calculate next with clamping
        stylus.x = Utils.clamp(stylus.x + deltaX, 0, rect.width);
        stylus.y = Utils.clamp(stylus.y + deltaY, 0, rect.height);

        // Calculate velocity (optional for dynamic line width)
        stylus.velocity = Utils.distance(stylus.lastX, stylus.lastY, stylus.x, stylus.y);

        // Perform drawing
        ctx.beginPath();
        ctx.moveTo(stylus.lastX, stylus.lastY);
        ctx.lineTo(stylus.x, stylus.y);
        ctx.stroke();
    }

    /**
     * Clears the board.
     * @param {boolean} notify - Whether to log the clear operation.
     */
    function clear(notify = true) {
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();

        // Fill background with powder gray
        ctx.fillStyle = SCREEN_BG_COLOR;
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Reset stylus
        stylus.x = rect.width / 2;
        stylus.y = rect.height / 2;
        stylus.lastX = stylus.x;
        stylus.lastY = stylus.y;

        if (notify) {
            Logger.info('Canvas cleared and stylus reset to factory center.');
        }
    }

    /**
     * Exposes the current stylus state.
     * @returns {Readonly<Stylus>}
     */
    function getStylusState() {
        return Object.freeze({ ...stylus });
    }

    /**
     * Utility to convert screen coordinates to canvas coordinates.
     * Useful for mouse support later.
     */
    function screenToCanvas(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    // Public API surface
    return {
        init,
        draw,
        clear,
        getStylusState,
        screenToCanvas
    };
})();
