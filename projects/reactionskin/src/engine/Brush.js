/**
 * Brush Interactor for ReactionSkin PRO
 * 
 * Provides an interactive interface for users to "paint" chemical 
 * concentrations onto the simulation grid. Supports both mouse and 
 * touch inputs with smooth line interpolation to prevent "spotty" 
 * drawing during rapid movements.
 * 
 * @class Brush
 */
export class Brush {
    /**
     * @param {HTMLCanvasElement} canvas - The interaction surface
     * @param {Simulation} simulation - The simulation engine to modify
     */
    constructor(canvas, simulation) {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;
        /** @type {Simulation} */
        this.sim = simulation;

        // --- Brush Configuration ---

        /** @type {number} Radius of the brush effect in simulation pixels */
        this.size = 20;

        /** @type {number} Strength of the concentration injection (0.0 to 1.0) */
        this.flow = 1.0;

        /** @type {string} Target chemical substance ('a' or 'b') */
        this.type = 'b';

        // --- Input State Tracking ---

        /** @type {boolean} True if the user is currently pressing down/touching */
        this.isDrawing = false;

        /** @type {number} Last recorded X coordinate in grid space */
        this.lastX = 0;

        /** @type {number} Last recorded Y coordinate in grid space */
        this.lastY = 0;

        this.initEvents();
    }

    /**
     * Attaches mouse and touch event listeners to the canvas.
     * Implements coordinate mapping from screen space to simulation space.
     * 
     * @private
     */
    initEvents() {
        /**
         * Generic handler for the start of a drawing gesture.
         * @param {MouseEvent|Touch} e 
         */
        const handleStart = (e) => {
            this.isDrawing = true;
            this.handleMove(e, true); // Force initial point
        };

        /**
         * Generic handler for the end of a drawing gesture.
         */
        const handleEnd = () => {
            this.isDrawing = false;
        };

        /**
         * Generic handler for movement during a gesture.
         * @param {MouseEvent|Touch} e 
         */
        const handleMove = (e) => {
            if (this.isDrawing) {
                this.handleMove(e);
            }
        };

        // Desktop Mouse Events
        this.canvas.addEventListener('mousedown', handleStart);
        window.addEventListener('mouseup', handleEnd);
        this.canvas.addEventListener('mousemove', handleMove);

        // Mobile Touch Events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling while painting
            handleStart(e.touches[0]);
        }, { passive: false });

        window.addEventListener('touchend', handleEnd);

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            handleMove(e.touches[0]);
        }, { passive: false });
    }

    /**
     * Entry point for coordinate processing. Translates screen-space 
     * coordinates to normalized grid coordinates.
     * 
     * @param {MouseEvent|Touch} e - The raw input event
     * @param {boolean} [isFirstPoint=false] - If true, skips interpolation for this point
     * @private
     */
    handleMove(e, isFirstPoint = false) {
        const rect = this.canvas.getBoundingClientRect();

        // Target relative coordinates
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;

        // Project screen coordinates to simulation resolution (e.g. 256x256)
        const gridX = Math.floor((rawX / rect.width) * this.sim.width);
        const gridY = Math.floor((rawY / rect.height) * this.sim.height);

        if (isFirstPoint) {
            // Just inject at the single point
            this.sim.inject(gridX, gridY, this.size, this.flow, this.type);
        } else {
            // Draw a continuous line between the current and last point
            this.injectLine(this.lastX, this.lastY, gridX, gridY);
        }

        this.lastX = gridX;
        this.lastY = gridY;
    }

    /**
     * Ensures smooth brush strokes by interpolating points along a vector.
     * Prevents "dotted" lines when the mouse/touch moves faster than the
     * browser's event polling frequency.
     * 
     * @param {number} x0 - Start coordinate X
     * @param {number} y0 - Start coordinate Y
     * @param {number} x1 - End coordinate X
     * @param {number} y1 - End coordinate Y
     * @private
     */
    injectLine(x0, y0, x1, y1) {
        // Calculate Euclidean distance between points
        const dist = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);

        // Determine number of steps needed. A good heuristic is 
        // 1/4 of the brush size to ensure sufficient overlap.
        const steps = Math.max(1, Math.floor(dist / (this.size / 4)));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps; // Interpolation factor (0 to 1)
            const x = Math.floor(x0 + (x1 - x0) * t);
            const y = Math.floor(y0 + (y1 - y0) * t);

            this.sim.inject(x, y, this.size, this.flow, this.type);
        }
    }

    /**
     * Core configuration update method. 
     * Binds UI control values to the internal brush state.
     * 
     * @param {Object} settings - Delta settings object
     * @param {number} [settings.size] - New radius
     * @param {number} [settings.flow] - New injection strength
     * @param {string} [settings.type] - Substance choice ('a' atau 'b')
     */
    setSettings(settings) {
        if (settings.size !== undefined) this.size = settings.size;
        if (settings.flow !== undefined) this.flow = settings.flow;
        if (settings.type !== undefined) this.type = settings.type;
    }
}
