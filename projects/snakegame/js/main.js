/**
 * main.js
 * Main application for SnakeSwarm
 * Coordinates all modules and manages UI
 */

import { GameState, CONFIG, STATUS } from './game-state.js';
import { GameLoop } from './game-loop.js';
import { InputHandler } from './input-handler.js';
import { CanvasRenderer } from './renderer.js';
import { PaintTrail } from './paint-trail.js';

/**
 * SnakeSwarm Application
 */
class SnakeSwarmApp {
    constructor() {
        // Get canvas
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }

        // Initialize modules
        this.gameState = new GameState(3);
        this.renderer = new CanvasRenderer(this.canvas);
        this.paintTrail = new PaintTrail(this.canvas.width, this.canvas.height);
        this.gameLoop = new GameLoop(this.gameState, this.renderer, this.paintTrail);
        this.inputHandler = new InputHandler(this.gameState);

        // UI elements
        this.ui = {
            overlay: document.getElementById('game-overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayMessage: document.getElementById('overlay-message'),
            overlayButton: document.getElementById('overlay-button'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            restartBtn: document.getElementById('restart-btn'),
            snakeCount: document.getElementById('snake-count'),
            snakeCountValue: document.getElementById('snake-count-value'),
            trailOpacity: document.getElementById('trail-opacity'),
            trailOpacityValue: document.getElementById('trail-opacity-value'),
            trailFade: document.getElementById('trail-fade'),
            clearTrailsBtn: document.getElementById('clear-trails-btn'),
            exportBtn: document.getElementById('export-btn'),
            totalScore: document.getElementById('total-score'),
            aliveCount: document.getElementById('alive-count'),
            snakeStats: document.getElementById('snake-stats'),
        };

        this.setupCallbacks();
        this.setupUIEventListeners();
        this.updateUI();

        // Start game loop
        this.gameLoop.start();

        // Initial render
        this.renderer.render(this.gameState, this.paintTrail);
    }

    /**
     * Setup callbacks
     */
    setupCallbacks() {
        // Input handler callbacks
        this.inputHandler.on('pause', () => this.handlePauseToggle());
        this.inputHandler.on('restart', () => this.handleRestart());
        this.inputHandler.on('clearTrails', () => this.handleClearTrails());
        this.inputHandler.on('export', () => this.handleExport());

        // Game loop callbacks
        this.gameLoop.onUpdate(() => {
            this.inputHandler.processBufferedInput();
        });

        this.gameLoop.onRender(() => {
            this.updateUI();
        });
    }

    /**
     * Setup UI event listeners
     */
    setupUIEventListeners() {
        // Overlay button
        this.ui.overlayButton.addEventListener('click', () => {
            this.handleStart();
        });

        // Control buttons
        this.ui.startBtn.addEventListener('click', () => this.handleStart());
        this.ui.pauseBtn.addEventListener('click', () => this.handlePauseToggle());
        this.ui.restartBtn.addEventListener('click', () => this.handleRestart());
        this.ui.clearTrailsBtn.addEventListener('click', () => this.handleClearTrails());
        this.ui.exportBtn.addEventListener('click', () => this.handleExport());

        // Snake count slider
        this.ui.snakeCount.addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            this.ui.snakeCountValue.textContent = count;
        });

        this.ui.snakeCount.addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            this.handleSnakeCountChange(count);
        });

        // Trail opacity slider
        this.ui.trailOpacity.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value);
            this.ui.trailOpacityValue.textContent = `${opacity}%`;
            this.paintTrail.setBaseOpacity(opacity / 100);
        });

        // Trail fade checkbox
        this.ui.trailFade.addEventListener('change', (e) => {
            this.paintTrail.setFadeEnabled(e.target.checked);
        });
    }

    /**
     * Handle start
     */
    handleStart() {
        if (this.gameState.status === STATUS.READY) {
            this.gameState.start();
            this.hideOverlay();
            this.updateUI();
        }
    }

    /**
     * Handle pause toggle
     */
    handlePauseToggle() {
        this.gameState.togglePause();

        if (this.gameState.isPaused()) {
            this.showOverlay('Paused', 'Press SPACE to resume', 'Resume');
            this.gameLoop.pause();
        } else if (this.gameState.isPlaying()) {
            this.hideOverlay();
            this.gameLoop.resume();
        }

        this.updateUI();
    }

    /**
     * Handle restart
     */
    handleRestart() {
        this.gameState.reset();
        this.gameLoop.reset();
        this.paintTrail.clear();
        this.inputHandler.clearBuffer();
        this.showOverlay('Ready to Swarm?', 'Press SPACE or click Start to begin', 'Start Game');
        this.updateUI();
    }

    /**
     * Handle snake count change
     */
    handleSnakeCountChange(count) {
        this.gameState.setSnakeCount(count);
        this.paintTrail.clear();
        this.showOverlay('Ready to Swarm?', 'Press SPACE or click Start to begin', 'Start Game');
        this.updateUI();
    }

    /**
     * Handle clear trails
     */
    handleClearTrails() {
        this.paintTrail.clear();
    }

    /**
     * Handle export
     */
    handleExport() {
        const dataUrl = this.renderer.exportImage(false);
        const link = document.createElement('a');
        link.download = `snakeswarm-art-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    }

    /**
     * Update UI
     */
    updateUI() {
        // Update scores
        this.ui.totalScore.textContent = this.gameState.totalScore;
        this.ui.aliveCount.textContent = this.gameState.getAliveCount();

        // Update button states
        const isReady = this.gameState.status === STATUS.READY;
        const isPlaying = this.gameState.isPlaying();
        const isPaused = this.gameState.isPaused();
        const isGameOver = this.gameState.isGameOver();

        this.ui.startBtn.disabled = !isReady;
        this.ui.pauseBtn.disabled = !(isPlaying || isPaused);
        this.ui.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';

        // Update snake stats
        this.updateSnakeStats();

        // Handle game over
        if (isGameOver) {
            this.showOverlay(
                'Game Over!',
                `Total Score: ${this.gameState.totalScore} | High Score: ${this.gameState.highScore}`,
                'Restart'
            );
        }
    }

    /**
     * Update snake stats display
     */
    updateSnakeStats() {
        this.ui.snakeStats.innerHTML = '';

        for (const snake of this.gameState.snakes) {
            const statDiv = document.createElement('div');
            statDiv.className = 'snake-stat';
            if (!snake.alive) {
                statDiv.classList.add('dead');
            }
            statDiv.style.borderLeftColor = snake.color.primary;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'snake-stat-name';
            nameSpan.textContent = `${snake.color.name} Snake`;
            nameSpan.style.color = snake.color.primary;

            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'snake-stat-score';
            scoreSpan.textContent = snake.alive ? snake.score : `${snake.score} ☠️`;
            scoreSpan.style.color = snake.color.secondary;

            statDiv.appendChild(nameSpan);
            statDiv.appendChild(scoreSpan);
            this.ui.snakeStats.appendChild(statDiv);
        }
    }

    /**
     * Show overlay
     * @param {string} title
     * @param {string} message
     * @param {string} buttonText
     */
    showOverlay(title, message, buttonText) {
        this.ui.overlayTitle.textContent = title;
        this.ui.overlayMessage.textContent = message;
        this.ui.overlayButton.textContent = buttonText;
        this.ui.overlay.classList.remove('hidden');
    }

    /**
     * Hide overlay
     */
    hideOverlay() {
        this.ui.overlay.classList.add('hidden');
    }
}

/**
 * Initialize app when DOM is ready
 */
function init() {
    const app = new SnakeSwarmApp();
    window.snakeSwarmApp = app;
    console.log('🐍 SnakeSwarm initialized!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
