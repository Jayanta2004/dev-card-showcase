/**
 * input-handler.js
 * Keyboard input handling for SnakeSwarm
 */

import { DIRECTION } from './game-state.js';

/**
 * InputHandler class
 */
export class InputHandler {
    constructor(gameState) {
        this.gameState = gameState;
        this.inputBuffer = null;
        this.keyMap = this.createKeyMap();
        this.callbacks = {
            pause: null,
            restart: null,
            clearTrails: null,
            export: null,
        };
        this.setupEventListeners();
    }

    /**
     * Create key mapping
     * @returns {Map}
     */
    createKeyMap() {
        const map = new Map();

        // Arrow keys
        map.set('ArrowUp', DIRECTION.UP);
        map.set('ArrowDown', DIRECTION.DOWN);
        map.set('ArrowLeft', DIRECTION.LEFT);
        map.set('ArrowRight', DIRECTION.RIGHT);

        // WASD
        map.set('w', DIRECTION.UP);
        map.set('W', DIRECTION.UP);
        map.set('s', DIRECTION.DOWN);
        map.set('S', DIRECTION.DOWN);
        map.set('a', DIRECTION.LEFT);
        map.set('A', DIRECTION.LEFT);
        map.set('d', DIRECTION.RIGHT);
        map.set('D', DIRECTION.RIGHT);

        return map;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} event
     */
    handleKeyDown(event) {
        // Direction keys
        if (this.keyMap.has(event.key)) {
            event.preventDefault();
            const direction = this.keyMap.get(event.key);
            this.setDirection(direction);

            // Auto-start game if ready
            if (this.gameState.status === 'ready') {
                this.gameState.start();
            }
            return;
        }

        // Control keys
        switch (event.key) {
            case ' ':
            case 'Spacebar':
                event.preventDefault();
                this.triggerCallback('pause');
                break;

            case 'r':
            case 'R':
                event.preventDefault();
                this.triggerCallback('restart');
                break;

            case 'c':
            case 'C':
                event.preventDefault();
                this.triggerCallback('clearTrails');
                break;

            case 'e':
            case 'E':
                event.preventDefault();
                this.triggerCallback('export');
                break;

            case 'Escape':
                event.preventDefault();
                this.triggerCallback('pause');
                break;
        }
    }

    /**
     * Set direction for all snakes
     * @param {{x: number, y: number}} direction
     */
    setDirection(direction) {
        this.inputBuffer = direction;
        this.gameState.setDirection(direction);
    }

    /**
     * Process buffered input
     */
    processBufferedInput() {
        if (this.inputBuffer) {
            this.gameState.setDirection(this.inputBuffer);
            this.inputBuffer = null;
        }
    }

    /**
     * Clear input buffer
     */
    clearBuffer() {
        this.inputBuffer = null;
    }

    /**
     * Set callback
     * @param {string} event
     * @param {Function} callback
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }

    /**
     * Trigger callback
     * @param {string} event
     */
    triggerCallback(event) {
        if (this.callbacks[event]) {
            this.callbacks[event]();
        }
    }
}
