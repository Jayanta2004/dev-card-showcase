// ===== MAIN GAME LOOP =====
// Coordinates all systems and manages game state

import { InputSystem } from './input.js';
import { CombatSystem } from './combat.js';
import { AISystem } from './ai.js';
import { RenderingSystem } from './rendering.js';

class Game {
    constructor() {
        // Game state
        this.state = 'menu'; // menu, playing, gameover
        this.score = 0;
        this.wave = 1;

        // Systems
        this.inputSystem = new InputSystem();
        this.combatSystem = new CombatSystem();
        this.aiSystem = new AISystem();
        this.renderingSystem = new RenderingSystem();

        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;

        // UI elements
        this.menuOverlay = document.getElementById('menu-overlay');
        this.gameoverOverlay = document.getElementById('gameover-overlay');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        this.scoreValue = document.getElementById('score-value');
        this.waveValue = document.getElementById('wave-value');
        this.finalScore = document.getElementById('final-score');
        this.finalWave = document.getElementById('final-wave');

        // Bind events
        this.initEvents();
    }

    initEvents() {
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });

        this.restartButton.addEventListener('click', () => {
            this.startGame();
        });
    }

    startGame() {
        // Reset all systems
        this.score = 0;
        this.wave = 1;
        this.inputSystem.reset();
        this.combatSystem.reset();
        this.aiSystem.reset();
        this.renderingSystem.reset();

        // Update UI
        this.updateScoreUI();
        this.updateWaveUI();

        // Hide overlays
        this.menuOverlay.classList.remove('active');
        this.gameoverOverlay.classList.remove('active');

        // Start first wave
        this.aiSystem.startWave(this.wave);

        // Set state
        this.state = 'playing';
    }

    endGame() {
        this.state = 'gameover';

        // Update final stats
        this.finalScore.textContent = this.score;
        this.finalWave.textContent = this.wave;

        // Show gameover overlay
        this.gameoverOverlay.classList.add('active');
    }

    update(currentTime) {
        // Calculate delta time
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
        }
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Clamp delta time to prevent large jumps
        if (this.deltaTime > 100) {
            this.deltaTime = 16;
        }

        // Update based on state
        if (this.state === 'playing') {
            this.updatePlaying();
        }

        // Always render
        this.render();

        // Continue loop
        requestAnimationFrame((time) => this.update(time));
    }

    updatePlaying() {
        // Update input system
        this.inputSystem.update(this.deltaTime);

        // Update combat system
        this.combatSystem.update(this.deltaTime, this.inputSystem);

        // Update AI system
        this.aiSystem.update(
            this.deltaTime,
            this.inputSystem.getMousePosition(),
            this.combatSystem
        );

        // Check for enemy hits
        const scoreGained = this.aiSystem.checkEnemyHit(this.combatSystem);
        if (scoreGained > 0) {
            this.addScore(scoreGained);
            this.renderingSystem.addScreenShake(5);
        }

        // Check for wave completion
        if (this.aiSystem.isWaveComplete()) {
            this.nextWave();
        }

        // Check for player death
        if (this.combatSystem.isPlayerDead()) {
            this.endGame();
        }
    }

    render() {
        if (this.state === 'playing') {
            this.renderingSystem.render(
                this.inputSystem,
                this.combatSystem,
                this.aiSystem
            );
        }
    }

    addScore(points) {
        this.score += points;
        this.updateScoreUI();

        // Show score popup
        const mousePos = this.inputSystem.getMousePosition();
        this.createScorePopup(mousePos.x, mousePos.y, points);
    }

    updateScoreUI() {
        this.scoreValue.textContent = this.score;
    }

    updateWaveUI() {
        this.waveValue.textContent = this.wave;
    }

    nextWave() {
        this.wave++;
        this.updateWaveUI();

        // Start next wave after delay
        setTimeout(() => {
            if (this.state === 'playing') {
                this.aiSystem.startWave(this.wave);
            }
        }, 2000);
    }

    createScorePopup(x, y, score) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${score}`;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    requestAnimationFrame((time) => game.update(time));
});
