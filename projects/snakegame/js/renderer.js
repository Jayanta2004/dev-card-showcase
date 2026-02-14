/**
 * renderer.js
 * Canvas-based renderer for SnakeSwarm
 * Renders multiple snakes with paint trails
 */

import { CONFIG } from './game-state.js';

/**
 * CanvasRenderer class
 * Renders game state to canvas with paint trails
 */
export class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = CONFIG.GRID_WIDTH * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.GRID_HEIGHT * CONFIG.CELL_SIZE;

        this.showGrid = false;
    }

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Render grid (optional)
     */
    renderGrid() {
        if (!this.showGrid) return;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= CONFIG.GRID_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CONFIG.CELL_SIZE, 0);
            this.ctx.lineTo(x * CONFIG.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= CONFIG.GRID_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CONFIG.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, y * CONFIG.CELL_SIZE);
            this.ctx.stroke();
        }
    }

    /**
     * Render all snakes
     * @param {Array} snakes
     */
    renderSnakes(snakes) {
        for (const snake of snakes) {
            if (!snake.alive) continue;

            // Render body
            for (let i = 0; i < snake.body.length; i++) {
                const segment = snake.body[i];
                const isHead = i === 0;

                const x = segment.x * CONFIG.CELL_SIZE;
                const y = segment.y * CONFIG.CELL_SIZE;

                // Create gradient for snake segment
                const gradient = this.ctx.createRadialGradient(
                    x + CONFIG.CELL_SIZE / 2,
                    y + CONFIG.CELL_SIZE / 2,
                    0,
                    x + CONFIG.CELL_SIZE / 2,
                    y + CONFIG.CELL_SIZE / 2,
                    CONFIG.CELL_SIZE / 2
                );

                if (isHead) {
                    // Brighter head
                    gradient.addColorStop(0, snake.color.primary);
                    gradient.addColorStop(1, snake.color.secondary);
                } else {
                    // Dimmer body
                    gradient.addColorStop(0, snake.color.secondary);
                    gradient.addColorStop(1, this.adjustBrightness(snake.color.secondary, 0.5));
                }

                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + 1, y + 1, CONFIG.CELL_SIZE - 2, CONFIG.CELL_SIZE - 2);

                // Add glow for head
                if (isHead) {
                    this.ctx.shadowColor = snake.color.primary;
                    this.ctx.shadowBlur = 15;
                    this.ctx.fillRect(x + 1, y + 1, CONFIG.CELL_SIZE - 2, CONFIG.CELL_SIZE - 2);
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }

    /**
     * Render food
     * @param {{x: number, y: number}} food
     */
    renderFood(food) {
        if (!food) return;

        const x = food.x * CONFIG.CELL_SIZE;
        const y = food.y * CONFIG.CELL_SIZE;
        const centerX = x + CONFIG.CELL_SIZE / 2;
        const centerY = y + CONFIG.CELL_SIZE / 2;

        // Pulsing glow effect
        const time = Date.now() / 500;
        const pulse = Math.sin(time) * 0.3 + 0.7;

        // Outer glow
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, CONFIG.CELL_SIZE
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${pulse})`);
        gradient.addColorStop(0.5, `rgba(255, 200, 0, ${pulse * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, CONFIG.CELL_SIZE, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner circle
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, CONFIG.CELL_SIZE / 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Render complete frame
     * @param {GameState} gameState
     * @param {PaintTrail} paintTrail
     */
    render(gameState, paintTrail) {
        // Clear canvas
        this.clear();

        // Render grid
        this.renderGrid();

        // Render paint trails
        if (paintTrail) {
            paintTrail.render(this.ctx);
        }

        // Render food
        this.renderFood(gameState.food);

        // Render snakes
        this.renderSnakes(gameState.snakes);
    }

    /**
     * Adjust color brightness
     * @param {string} color - hex color
     * @param {number} factor - 0 to 1
     * @returns {string}
     */
    adjustBrightness(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const newR = Math.round(r * factor);
        const newG = Math.round(g * factor);
        const newB = Math.round(b * factor);

        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * Toggle grid visibility
     */
    toggleGrid() {
        this.showGrid = !this.showGrid;
    }

    /**
     * Export canvas as image
     * @param {boolean} includeSnakes - Whether to include snakes in export
     * @returns {string} Data URL
     */
    exportImage(includeSnakes = true) {
        if (includeSnakes) {
            return this.canvas.toDataURL('image/png');
        } else {
            // Create temporary canvas without snakes
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            // Copy current canvas
            tempCtx.drawImage(this.canvas, 0, 0);

            return tempCanvas.toDataURL('image/png');
        }
    }
}
