/**
 * game-loop.js
 * Game loop for SnakeSwarm
 */

import { CONFIG } from './game-state.js';

/**
 * GameLoop class
 */
export class GameLoop {
    constructor(gameState, renderer, paintTrail) {
        this.gameState = gameState;
        this.renderer = renderer;
        this.paintTrail = paintTrail;

        this.isRunning = false;
        this.lastTimestamp = 0;
        this.accumulator = 0;
        this.tickInterval = CONFIG.TICK_INTERVAL;

        this.updateCallback = null;
        this.renderCallback = null;

        this.frameId = null;
        this.tickCount = 0;
    }

    /**
     * Start the loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTimestamp = performance.now();
        this.accumulator = 0;
        this.tickCount = 0;

        this.frameId = requestAnimationFrame((timestamp) => {
            this.loop(timestamp);
        });
    }

    /**
     * Stop the loop
     */
    stop() {
        this.isRunning = false;

        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    /**
     * Main loop
     * @param {number} timestamp
     */
    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        this.accumulator += deltaTime;

        // Fixed time step updates
        while (this.accumulator >= this.tickInterval) {
            this.tick();
            this.accumulator -= this.tickInterval;
            this.tickCount++;
        }

        // Render
        this.render();

        // Next frame
        this.frameId = requestAnimationFrame((ts) => {
            this.loop(ts);
        });
    }

    /**
     * Fixed time step update
     */
    tick() {
        if (!this.gameState.isPlaying()) return;

        // Update callback
        if (this.updateCallback) {
            this.updateCallback();
        }

        // Update game state
        const events = this.gameState.update();

        // Add paint trails for each snake
        for (const snake of this.gameState.snakes) {
            if (!snake.alive) continue;

            const head = snake.getHead();
            const x = (head.x + 0.5) * CONFIG.CELL_SIZE;
            const y = (head.y + 0.5) * CONFIG.CELL_SIZE;

            this.paintTrail.addPoint(x, y, snake.color.rgb, CONFIG.CELL_SIZE / 2);
        }

        // Update paint trails (for fade effect)
        this.paintTrail.update();
    }

    /**
     * Render
     */
    render() {
        // Render callback
        if (this.renderCallback) {
            this.renderCallback();
        }

        // Render to canvas
        this.renderer.render(this.gameState, this.paintTrail);
    }

    /**
     * Reset loop
     */
    reset() {
        this.accumulator = 0;
        this.tickCount = 0;
        this.lastTimestamp = performance.now();
    }

    /**
     * Set update callback
     * @param {Function} callback
     */
    onUpdate(callback) {
        this.updateCallback = callback;
    }

    /**
     * Set render callback
     * @param {Function} callback
     */
    onRender(callback) {
        this.renderCallback = callback;
    }

    /**
     * Pause
     */
    pause() {
        // Loop continues but updates stop
    }

    /**
     * Resume
     */
    resume() {
        this.accumulator = 0;
        this.lastTimestamp = performance.now();
    }
}
