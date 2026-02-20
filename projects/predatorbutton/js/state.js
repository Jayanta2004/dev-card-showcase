/**
 * PREDATOR BUTTON - GLOBAL STATE MANAGEMENT MODULE
 * ===============================================
 * 
 * This module serves as the single source of truth for the PredatorButton 
 * application logic. It encapsulates geometric data, interaction flags, 
 * and configuration constants.
 * 
 * OBJECTIVES:
 * 1. Centralize the tracking of cursor and button coordinates.
 * 2. Maintain the lifecycle status of the "Predator" (Idle vs Hunting).
 * 3. Provide a configuration layer for tuning the "creepy" movement feel.
 * 4. Optimize performance by reducing DOM queries for static geometry.
 * 
 * ARCHITECTURE:
 * The state is attached to the global 'window' object to allow seamless
 * communication between modular JS files without the need for a 
 * complex build system or framework.
 */

(function (exports) {
    "use strict";

    /**
     * @typedef {Object} Vector2
     * @property {number} x - Horizontal coordinate
     * @property {number} y - Vertical coordinate
     */

    /**
     * @typedef {Object} PredatorConfig
     * @property {number} idleThreshold - Time in ms before the button starts hunting (Default: 1000)
     * @property {number} lerpFactor - Interpolation speed. Lower is slower/creepier. (Default: 0.02)
     * @property {number} collisionBuffer - Pixel padding for capture detection. (Default: 5)
     */

    const State = {
        /**
         * The user's mouse/cursor position relative to the viewport.
         * Updated by tracker.js.
         * @type {Vector2}
         */
        mouse: {
            x: 0,
            y: 0
        },

        /**
         * The predator button's current geometric center and dimensions.
         * Calculated based on boundingClientRect.
         * @type {Object}
         */
        button: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },

        /**
         * Boolean flag indicating if the predator is currently in the 'Hunt' phase.
         * Transistions from false -> true after 1 second of inactivity.
         * @type {boolean}
         */
        isHunting: false,

        /**
         * Boolean flag indicating if the cursor has stopped moving.
         * Used to sync visual feedback in the footer.
         * @type {boolean}
         */
        isIdle: false,

        /**
         * Game engine configuration parameters.
         * These can be tweaked during runtime for difficulty adjustments.
         * @type {PredatorConfig}
         */
        config: {
            idleThreshold: 1000,
            lerpFactor: 0.02,
            lungeFactor: 0.1,    // NEW: Speed burst factor
            collisionBuffer: 8
        },

        /**
         * Dynamic state for advanced features
         */
        agitation: 0,        // Increases with user activity
        isLunging: false,    // True during a speed burst
        proximity: 0,        // 0 (far) to 1 (close)

        /**
         * Refreshes the button's geometric metadata in the state object.
         * Should be called whenever the button moves to ensure collision
         * checks remain accurate.
         * 
         * @param {HTMLElement} btn - The DOM element representing the button.
         * @throws {Error} If btn is null or not a valid HTMLElement.
         */
        updateButtonRect(btn) {
            if (!btn) {
                console.warn("PredatorState.updateButtonRect: btn argument is null.");
                return;
            }

            const rect = btn.getBoundingClientRect();

            // We use the center point for the Lerp target and collision logic
            this.button.width = rect.width;
            this.button.height = rect.height;
            this.button.x = rect.left + rect.width / 2;
            this.button.y = rect.top + rect.height / 2;

            // Debugging point: 
            // console.debug(`Button Pos: [${this.button.x}, ${this.button.y}]`);
        }
    };

    // Expose to global scope
    exports.PredatorState = State;

})(window);
