/**
 * game-state.js
 * Multi-snake game state management for SnakeSwarm
 */

// Game configuration
export const CONFIG = {
    GRID_WIDTH: 40,
    GRID_HEIGHT: 30,
    CELL_SIZE: 20,
    INITIAL_SNAKE_LENGTH: 4,
    POINTS_PER_FOOD: 10,
    TICK_INTERVAL: 100,
    MIN_SNAKES: 2,
    MAX_SNAKES: 4,
};

// Direction constants
export const DIRECTION = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
};

// Game status
export const STATUS = {
    READY: 'ready',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
};

// Snake colors (vibrant gradients)
export const SNAKE_COLORS = [
    { name: 'Pink', primary: '#ff0080', secondary: '#ff00ff', rgb: { r: 255, g: 0, b: 128 } },
    { name: 'Cyan', primary: '#00ffff', secondary: '#0080ff', rgb: { r: 0, g: 255, b: 255 } },
    { name: 'Yellow', primary: '#ffff00', secondary: '#ffaa00', rgb: { r: 255, g: 255, b: 0 } },
    { name: 'Green', primary: '#00ff00', secondary: '#00ff80', rgb: { r: 0, g: 255, b: 0 } },
];

/**
 * Snake class
 * Represents a single snake in the swarm
 */
class Snake {
    constructor(id, startX, startY, color, personality = {}) {
        this.id = id;
        this.body = [];
        this.direction = DIRECTION.RIGHT;
        this.nextDirection = DIRECTION.RIGHT;
        this.color = color;
        this.score = 0;
        this.alive = true;

        // Personality traits (slight variations)
        this.speedMultiplier = personality.speedMultiplier || 1.0;
        this.turnPreference = personality.turnPreference || 0; // -1 left, 0 none, 1 right

        // Initialize body
        for (let i = 0; i < CONFIG.INITIAL_SNAKE_LENGTH; i++) {
            this.body.push({ x: startX - i, y: startY });
        }
    }

    /**
     * Set direction
     * @param {{x: number, y: number}} newDirection
     */
    setDirection(newDirection) {
        // Prevent 180-degree turns
        const isOpposite =
            this.direction.x === -newDirection.x &&
            this.direction.y === -newDirection.y;

        if (!isOpposite) {
            this.nextDirection = newDirection;
        }
    }

    /**
     * Move the snake
     * @returns {{x: number, y: number}} New head position
     */
    move() {
        if (!this.alive) return null;

        this.direction = this.nextDirection;
        const head = this.body[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y,
        };

        this.body.unshift(newHead);
        return newHead;
    }

    /**
     * Grow the snake (don't remove tail)
     */
    grow() {
        // Next move won't remove tail
        this.score += CONFIG.POINTS_PER_FOOD;
    }

    /**
     * Remove tail segment
     */
    removeTail() {
        this.body.pop();
    }

    /**
     * Kill this snake
     */
    die() {
        this.alive = false;
    }

    /**
     * Get head position
     * @returns {{x: number, y: number}}
     */
    getHead() {
        return this.body[0];
    }

    /**
     * Get body without head
     * @returns {Array<{x: number, y: number}>}
     */
    getBodyWithoutHead() {
        return this.body.slice(1);
    }
}

/**
 * GameState class
 * Manages multiple snakes and game state
 */
export class GameState {
    constructor(snakeCount = 3) {
        this.snakeCount = snakeCount;
        this.snakes = [];
        this.food = null;
        this.status = STATUS.READY;
        this.totalScore = 0;
        this.highScore = 0;
        this.reset();
    }

    /**
     * Reset game state
     */
    reset() {
        this.snakes = [];
        this.createSnakes(this.snakeCount);
        this.food = this.spawnFood();
        this.status = STATUS.READY;
        this.totalScore = 0;
    }

    /**
     * Create snakes at starting positions
     * @param {number} count
     */
    createSnakes(count) {
        this.snakeCount = Math.max(CONFIG.MIN_SNAKES, Math.min(CONFIG.MAX_SNAKES, count));
        this.snakes = [];

        // Starting positions (corners and midpoints)
        const positions = [
            { x: 5, y: 5 },                                    // Top-left
            { x: CONFIG.GRID_WIDTH - 6, y: 5 },               // Top-right
            { x: 5, y: CONFIG.GRID_HEIGHT - 6 },              // Bottom-left
            { x: CONFIG.GRID_WIDTH - 6, y: CONFIG.GRID_HEIGHT - 6 }, // Bottom-right
        ];

        for (let i = 0; i < this.snakeCount; i++) {
            const pos = positions[i % positions.length];
            const color = SNAKE_COLORS[i % SNAKE_COLORS.length];

            // Add personality variance
            const personality = {
                speedMultiplier: 0.9 + Math.random() * 0.2, // 0.9 to 1.1
                turnPreference: Math.random() > 0.5 ? 1 : -1,
            };

            const snake = new Snake(i, pos.x, pos.y, color, personality);
            this.snakes.push(snake);
        }
    }

    /**
     * Spawn food at random empty position
     * @returns {{x: number, y: number}}
     */
    spawnFood() {
        const emptyPositions = [];

        for (let y = 1; y < CONFIG.GRID_HEIGHT - 1; y++) {
            for (let x = 1; x < CONFIG.GRID_WIDTH - 1; x++) {
                const occupied = this.snakes.some(snake =>
                    snake.body.some(segment => segment.x === x && segment.y === y)
                );
                if (!occupied) {
                    emptyPositions.push({ x, y });
                }
            }
        }

        if (emptyPositions.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * emptyPositions.length);
        return emptyPositions[randomIndex];
    }

    /**
     * Set direction for all alive snakes
     * @param {{x: number, y: number}} direction
     */
    setDirection(direction) {
        this.snakes.forEach(snake => {
            if (snake.alive) {
                snake.setDirection(direction);
            }
        });
    }

    /**
     * Update game state (move all snakes)
     * @returns {Array} Array of events that occurred
     */
    update() {
        if (this.status !== STATUS.PLAYING) return [];

        const events = [];
        const grewSnakes = new Set();

        // Move all alive snakes
        for (const snake of this.snakes) {
            if (!snake.alive) continue;

            const newHead = snake.move();

            // Check wall collision
            if (
                newHead.x < 0 || newHead.x >= CONFIG.GRID_WIDTH ||
                newHead.y < 0 || newHead.y >= CONFIG.GRID_HEIGHT
            ) {
                snake.die();
                events.push({ type: 'death', snakeId: snake.id, reason: 'wall' });
                continue;
            }

            // Check self collision
            if (snake.getBodyWithoutHead().some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
                snake.die();
                events.push({ type: 'death', snakeId: snake.id, reason: 'self' });
                continue;
            }

            // Check collision with other snakes
            let hitOther = false;
            for (const other of this.snakes) {
                if (other.id === snake.id || !other.alive) continue;
                if (other.body.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
                    snake.die();
                    events.push({ type: 'death', snakeId: snake.id, reason: 'collision' });
                    hitOther = true;
                    break;
                }
            }
            if (hitOther) continue;

            // Check food collision
            if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
                snake.grow();
                grewSnakes.add(snake.id);
                this.totalScore += CONFIG.POINTS_PER_FOOD;
                events.push({ type: 'food', snakeId: snake.id });
                this.food = this.spawnFood();
            }
        }

        // Remove tails for snakes that didn't grow
        for (const snake of this.snakes) {
            if (snake.alive && !grewSnakes.has(snake.id)) {
                snake.removeTail();
            }
        }

        // Check game over
        if (this.getAliveCount() === 0) {
            this.status = STATUS.GAME_OVER;
            if (this.totalScore > this.highScore) {
                this.highScore = this.totalScore;
            }
            events.push({ type: 'game_over' });
        }

        return events;
    }

    /**
     * Get number of alive snakes
     * @returns {number}
     */
    getAliveCount() {
        return this.snakes.filter(s => s.alive).length;
    }

    /**
     * Start the game
     */
    start() {
        this.status = STATUS.PLAYING;
    }

    /**
     * Pause the game
     */
    pause() {
        if (this.status === STATUS.PLAYING) {
            this.status = STATUS.PAUSED;
        }
    }

    /**
     * Resume the game
     */
    resume() {
        if (this.status === STATUS.PAUSED) {
            this.status = STATUS.PLAYING;
        }
    }

    /**
     * Toggle pause
     */
    togglePause() {
        if (this.status === STATUS.PLAYING) {
            this.pause();
        } else if (this.status === STATUS.PAUSED) {
            this.resume();
        }
    }

    /**
     * Check if playing
     * @returns {boolean}
     */
    isPlaying() {
        return this.status === STATUS.PLAYING;
    }

    /**
     * Check if game over
     * @returns {boolean}
     */
    isGameOver() {
        return this.status === STATUS.GAME_OVER;
    }

    /**
     * Check if paused
     * @returns {boolean}
     */
    isPaused() {
        return this.status === STATUS.PAUSED;
    }

    /**
     * Change snake count (requires reset)
     * @param {number} count
     */
    setSnakeCount(count) {
        this.snakeCount = count;
        this.reset();
    }
}
