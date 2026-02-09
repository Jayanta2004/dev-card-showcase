import { Logger } from '../utils/Logger.js';
import { Config } from './Config.js';
import { globalEvents } from './EventManager.js';
import { InputHandler } from '../input/InputHandler.js';
import { CanvasManager } from '../drawing/CanvasManager.js';
import { StrokeManager } from '../drawing/StrokeManager.js';
import { SoundEngine } from '../audio/SoundEngine.js';
import { globalAudioContext } from '../audio/AudioContextManager.js';

/**
 * @class App
 * @description Main application controller.
 * Bootstraps the application, manages the start sequence, and holds references to core systems.
 */
class App {
    constructor() {
        this.ctx = null;
        this.isRunning = false;

        // DOM Elements
        this.container = document.getElementById('app-container');
        this.startBtn = document.getElementById('start-btn');
        this.overlay = document.getElementById('start-overlay');

        // Debug Elements
        this.coordsDiv = document.getElementById('coords');
        this.speedDiv = document.getElementById('speed');
        this.collisionsDiv = document.getElementById('collisions');

        // Systems
        this.events = globalEvents;
        this.canvasManager = new CanvasManager('main-canvas');
        this.inputHandler = new InputHandler(this.container, this.events);
        this.strokeManager = new StrokeManager(this.events);
        this.soundEngine = new SoundEngine(this.events);

        this._init();
    }

    _init() {
        Logger.info('App initializing...');

        this.startBtn.addEventListener('click', this._start.bind(this));

        // Debug Listeners
        if (Config.UI.DEBUG_MODE) {
            document.getElementById('debug-overlay').classList.remove('hidden');
            this.events.on('INPUT_MOVE', (data) => {
                this.coordsDiv.textContent = `${Math.round(data.position.x)}, ${Math.round(data.position.y)}`;
                this.speedDiv.textContent = `Speed: ${data.speed.toFixed(2)}`;
            });
            this.events.on('COLLISION_DETECTED', () => {
                this.collisionsDiv.style.color = 'red';
                this.collisionsDiv.textContent = 'COLLISION!';
            });
            this.events.on('COLLISION_CLEARED', () => {
                this.collisionsDiv.style.color = 'white';
                this.collisionsDiv.textContent = 'Clear';
            });
        }

        // Animation Loop (mostly for cursor cleaning)
        this._loop = this._loop.bind(this);
        requestAnimationFrame(this._loop);
    }

    async _start() {
        const resumed = await globalAudioContext.resume();
        if (resumed) {
            await this.soundEngine.init();

            this.overlay.classList.remove('visible');
            this.overlay.classList.add('hidden');
            this.isRunning = true;
            Logger.info('App Started');
        }
    }

    _loop() {
        if (this.isRunning) {
            // Even though it's "blind", we might want to fade trails or similar for the 'hidden' canvas logic
            // providing a fresh surface for the "cursor" logic in CanvasManager
            this.canvasManager.renderCursor(this.inputHandler.currentPosition, this.inputHandler.isDrawing ? 1 : 0);
        }
        requestAnimationFrame(this._loop);
    }
}

// Start
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
