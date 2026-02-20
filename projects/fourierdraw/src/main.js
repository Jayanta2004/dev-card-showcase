import { Sketch } from './core/Sketch.js';
import { Renderer } from './core/Renderer.js';
import { AudioEngine } from './core/AudioEngine.js';
import { ControlPanel } from './core/ControlPanel.js';
import { ThemeManager } from './core/ThemeManager.js';
import { CommandManager, DrawPathCommand } from './core/Command.js';
import { dft } from './core/Fourier.js';
import { processSignalFFT } from './core/FFT.js';
import { CONFIG } from './config.js';

/**
 * @fileoverview Main Application Controller.
 * The central nervous system of FourierDraw, managing the lifecycle and 
 * communication between independent sub-systems.
 */

class App {
    /**
     * Initializes all core components and starts the animation loop.
     */
    constructor() {
        console.log('FourierDraw: Booting system...');

        // --- Core Modules ---
        /** @type {Renderer} */
        this.renderer = new Renderer('drawing-canvas');
        /** @type {Sketch} */
        this.sketch = new Sketch('sketch-canvas');
        /** @type {AudioEngine} */
        this.audio = new AudioEngine();
        /** @type {ThemeManager} */
        this.theme = new ThemeManager();
        /** @type {CommandManager} */
        this.commands = new CommandManager();

        // --- State Management ---
        /** @type {Object|null} */
        this.currentPathData = null;
        /** @type {boolean} */
        this.useFFT = false;

        // --- UI Layer ---
        /** @type {ControlPanel} */
        this.ui = new ControlPanel(this);

        /** @type {Object<string, HTMLElement>} */
        this.dom = {
            clearBtn: document.getElementById('clear-btn'),
            reconstructBtn: document.getElementById('reconstruct-btn'),
            statusBar: document.getElementById('status-bar')
        };

        this.setupEventListeners();
        this.startLoop();

        console.log('FourierDraw: System Ready.');
    }

    /**
     * Binds application-level event listeners.
     */
    setupEventListeners() {
        // Handle path completion from the Sketch module
        window.addEventListener('pathComplete', (e) => {
            this.currentPathData = e.detail;
            console.log(`Path captured: ${this.currentPathData.rawCount} points.`);
        });

        // Button Interactions
        this.dom.reconstructBtn.addEventListener('click', () => this.handleReconstruction());
        this.dom.clearBtn.addEventListener('click', () => this.handleClear());

        // Global Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') this.commands.undo();
            if (e.ctrlKey && e.key === 'y') this.commands.redo();
            if (e.key === 'c') this.handleClear();
            if (e.key === 'Enter') this.handleReconstruction();
        });

        // Interaction for Audio (Web Audio API requires gesture)
        document.body.addEventListener('mousedown', () => {
            if (!this.audio.isInitialized) this.audio.init();
        }, { once: true });
    }

    /**
     * Orchestrates the transformation of drawing points into frequency domain.
     */
    async handleReconstruction() {
        if (!this.currentPathData || this.currentPathData.path.length < 5) {
            this.notify('Draw a longer path first!');
            return;
        }

        this.notify('Calculating Fourier Series...');
        this.dom.reconstructBtn.disabled = true;

        // Perform the transform (FFT or DFT)
        // We use a small delay to ensure UI updates before heavy calculation
        setTimeout(() => {
            const start = performance.now();

            let fourierData;
            if (this.useFFT) {
                fourierData = processSignalFFT(this.currentPathData.path);
            } else {
                fourierData = dft(this.currentPathData.path);
            }

            const end = performance.now();
            console.log(`Transformation complete in ${(end - start).toFixed(2)}ms`);

            // Apply results to Renderer (Visual) and Audio Engine (Sound)
            this.renderer.setDFTData(fourierData, this.currentPathData.center);
            this.audio.setupFrequencies(fourierData);

            this.hideNotification();
            this.dom.reconstructBtn.disabled = false;

            // Periodically shift theme if drawing is complex
            if (fourierData.length > 100) {
                this.theme.cycle();
            }
        }, 32);
    }

    /**
     * Resets the entire application state.
     */
    handleClear() {
        this.sketch.clear();
        this.renderer.clear();
        this.audio.stopAll();
        this.commands.clear();
        this.currentPathData = null;
        this.notify('Canvas Cleared', 2000);
    }

    /**
     * Displays a temporary notification in the UI.
     * @param {string} msg - The message to display.
     * @param {number} [duration=0] - Duration in ms (0 for indefinite).
     */
    notify(msg, duration = 0) {
        this.dom.statusBar.textContent = msg;
        this.dom.statusBar.classList.remove('hidden');

        if (duration > 0) {
            setTimeout(() => this.hideNotification(), duration);
        }
    }

    /**
     * Hides the status notification.
     */
    hideNotification() {
        this.dom.statusBar.classList.add('hidden');
    }

    /**
     * The main 60FPS update cycle.
     */
    startLoop() {
        const step = () => {
            this.renderer.update();
            this.audio.update(this.renderer.time);

            // Occasional shimmy for aesthetics
            if (this.renderer.isAnimating && Math.random() > 0.99) {
                // this.theme.shimmer();
            }

            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }
}

// Entry point initialization
window.addEventListener('load', () => {
    window.fourierApp = new App();
});
