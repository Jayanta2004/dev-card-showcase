/**
 * BubblePop - Procedural Grid Generation Engine
 * 
 * @file generator.js
 * @description Responsible for the algorithmic generation of the bubble grid.
 * Implements infinite scrolling mechanics using the Intersection Observer API.
 * Ensures smooth, stutter-free performance by virtualizing or chunking 
 * DOM node creation.
 * 
 * @author Antigravity
 * @version 1.0.0
 */

import { Utils } from './utils.js';

class GridGenerator {
    /**
     * Constructs the GridGenerator instance.
     * 
     * @param {string} containerId - The ID of the target DOM element for the grid.
     */
    constructor(containerId) {
        /** @type {HTMLElement|null} */
        this.container = document.getElementById(containerId);

        /** @type {IntersectionObserver|null} */
        this.observer = null;

        /** @type {number} Total bubbles across a single row */
        this.rowSize = 0;

        /** @type {boolean} Semaphore to prevent race conditions during generation */
        this.isGenerating = false;

        /** @type {number} How many rows to keep ahead of the user */
        this.bufferRows = 6;

        /** @type {boolean} initialization flag */
        this.initialized = false;

        /** @private @type {number} Tracks total rows created */
        this._rowCount = 0;
    }

    /**
     * Bootstraps the grid generation process.
     * Performs initial calculations and sets up observers.
     * 
     * @returns {void}
     */
    init() {
        if (this.initialized) {
            return;
        }

        if (!this.container) {
            console.error('GridGenerator: Target container not found.');
            return;
        }

        // 1. Setup the Infinite Scroll Observer logic
        this.setupInfiniteObserver();

        // 2. Calculate initial dimensions based on viewport
        this.calculateOptimalRowSize();

        // 3. Perform initial population of the grid
        this.generateInitialVisuals();

        /**
         * Responsive Handling:
         * Recalculate row size on window resize to ensure gapless filling.
         */
        window.addEventListener('resize', Utils.debounce(() => {
            this.calculateOptimalRowSize();
            // Optional: Re-fill if gaps appear
        }, 250));

        this.initialized = true;
        console.log('GridGenerator: Virtualized grid engine ready.');
    }

    /**
     * Calculates how many bubbles can fit horizontally in the current container width.
     * Uses a hardcoded size + gap constant derived from the CSS.
     * 
     * @private
     */
    calculateOptimalRowSize() {
        if (!this.container) return;

        const containerWidth = this.container.offsetWidth;
        /** @const {number} Size (80) + Gap (20) from CSS */
        const SLOT_WIDTH = 100;

        this.rowSize = Math.floor(containerWidth / SLOT_WIDTH);

        // Safety fallback for extremely narrow viewports
        if (this.rowSize <= 0) this.rowSize = 1;

        console.log(`GridGenerator: Optimized for ${this.rowSize} bubbles per row.`);
    }

    /**
     * Initializes the IntersectionObserver for infinite scrolling.
     * Triggers row generation when the "sentinel" bubble enters the root margin.
     * 
     * @private
     */
    setupInfiniteObserver() {
        /** @type {IntersectionObserverInit} */
        const config = {
            root: null, // Default to browser viewport
            rootMargin: '400px', // Start loading 400px before user reaches the end
            threshold: 0.05
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                /**
                 * When the sentinel bubble appears, generate a new chunk.
                 * unobserve the old sentinel immediately to prevent loops.
                 */
                if (entry.isIntersecting && !this.isGenerating) {
                    this.generateBubbleChunk(5); // Generate 5 more rows
                    this.observer.unobserve(entry.target);
                }
            });
        }, config);
    }

    /**
     * Populates the grid initially until the viewport is overflowed.
     * 
     * @private
     */
    generateInitialVisuals() {
        const viewportHeight = window.innerHeight;
        /** Approximate height of a row inclusive of gaps */
        const ROW_HEIGHT = 100;

        const rowsToFill = Math.ceil(viewportHeight / ROW_HEIGHT) + this.bufferRows;

        this.generateBubbleChunk(rowsToFill);
    }

    /**
     * Algorithmic generation of a batch of bubbles.
     * Uses DocumentFragment for performance (single reflow).
     * 
     * @param {number} rowCount - Number of rows to add to the DOM.
     * @returns {void}
     */
    generateBubbleChunk(rowCount) {
        if (this.isGenerating || !this.container) return;

        this.isGenerating = true;

        /** 
         * Using a DocumentFragment is critical for performance 
         * when inserting many nodes at once. 
         */
        const fragment = document.createDocumentFragment();
        let sentinelElement = null;

        const totalToCreate = rowCount * this.rowSize;

        for (let i = 0; i < totalToCreate; i++) {
            const bubble = this.internalCreateBubbleElement();
            fragment.appendChild(bubble);

            // The last element in the batch becomes the next trigger (sentinel)
            sentinelElement = bubble;
        }

        // Add the batch to the main DOM container
        this.container.appendChild(fragment);

        // Register the new sentinel with the observer
        if (sentinelElement && this.observer) {
            this.observer.observe(sentinelElement);
        }

        this._rowCount += rowCount;
        this.isGenerating = false;
    }

    /**
     * Factory method for creating a single bubble DOM node.
     * Applies random stylistic variations to create an organic "non-digital" feel.
     * 
     * @private
     * @returns {HTMLElement} A fully configured bubble element.
     */
    internalCreateBubbleElement() {
        // Create base element with state markers
        const bubble = Utils.createElement('div', {
            dataset: { popped: 'false' },
            role: 'button',
            'aria-label': 'Pop this bubble'
        }, ['bubble']);

        /**
         * Humanization factor:
         * Applying subtle random variations in scale and rotation
         * so the grid doesn't look perfectly uniform.
         */
        const visualScale = Utils.randomFloat(0.92, 1.08);
        const visualRotation = Utils.randomRange(0, 359);
        const hueShift = Utils.randomRange(-15, 15);

        Utils.setCSSVars(bubble, {
            '--v-scale': visualScale,
            '--v-rotate': `${visualRotation}deg`,
            '--v-hue': `${hueShift}deg`
        });

        return bubble;
    }

    /**
     * Fully resets the grid state.
     * 
     * @public
     */
    reset() {
        if (!this.container) return;

        this.container.innerHTML = '';
        this._rowCount = 0;
        this.generateInitialVisuals();

        console.log('GridGenerator: Grid has been reset.');
    }
}

/**
 * Singleton instance of the GridGenerator.
 * Default target: 'grid-container'.
 * @export
 */
export const Generator = new GridGenerator('grid-container');
