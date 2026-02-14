/**
 * ReactionSkin PRO v2.0
 * 
 * Orchestrator class for the Reaction Diffusion simulation stack.
 * Manages the lifecycle of the engine, renderer, audio, and UI.
 */

import { Simulation } from './src/engine/Simulation.js';
import { Renderer } from './src/render/Renderer.js';
import { Brush } from './src/engine/Brush.js';
import { AudioEngine } from './src/engine/AudioEngine.js';
import { UIManager } from './src/ui/UIManager.js';
import { ExportEngine } from './src/engine/ExportEngine.js';
import { HistoryManager } from './src/engine/HistoryManager.js';
import { ReactiveEngine } from './src/engine/ReactiveEngine.js';
import { TextureMapper } from './src/engine/TextureMapper.js';

class App {
    constructor() {
        // --- Core configuration ---
        this.simWidth = 256;
        this.simHeight = 256;

        /** @type {Simulation} */
        this.simulation = null;
        /** @type {Renderer} */
        this.renderer = null;
        /** @type {Brush} */
        this.brush = null;
        /** @type {AudioEngine} */
        this.audio = null;
        /** @type {UIManager} */
        this.ui = null;
        /** @type {ExportEngine} */
        this.export = null;
        /** @type {HistoryManager} */
        this.history = null;
        /** @type {ReactiveEngine} */
        this.reactive = null;
        /** @type {TextureMapper} */
        this.textureMapper = null;

        // --- Global State ---
        this.isPaused = false;
        this.lastTimestamp = 0;
        this.frameCount = 0;
        this.currentFPS = 0;
        this.meanDensity = 0;
        this.iterationsPerFrame = 12; // High-performance RD

        this.init();
    }

    /**
     * Bootstrap the application.
     */
    async init() {
        console.log("%c ReactionSkin PRO Loaded %c", "color: #000; background: #00f2ff; font-weight: bold", "color: inherit");

        const canvas = document.getElementById('simulation-canvas');

        // 1. Initialize Simulation Engine
        this.simulation = new Simulation(this.simWidth, this.simHeight);

        // 2. Initialize Renderer
        this.renderer = new Renderer(canvas, this.simWidth, this.simHeight);

        // 3. Initialize Interaction Systems
        this.brush = new Brush(canvas, this.simulation);
        this.audio = new AudioEngine();
        this.export = new ExportEngine(canvas);
        this.history = new HistoryManager(this.simulation);
        this.reactive = new ReactiveEngine(this.simulation);
        this.textureMapper = new TextureMapper(this.simulation);

        // 4. Initialize UI (Binds to DOM and components)
        this.ui = new UIManager(this);

        // Auto-save history every 5 seconds
        setInterval(() => {
            if (!this.isPaused) this.history.save();
        }, 5000);

        // Start Heartbeat
        requestAnimationFrame((t) => this.tick(t));
    }

    /**
     * Main application loop.
     * @param {number} timestamp 
     */
    tick(timestamp) {
        // Calculate Delta and FPS
        const dt = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        if (dt > 0) {
            this.currentFPS = Math.round(1000 / dt);
        }

        // Logic Step
        if (!this.isPaused) {
            for (let i = 0; i < this.iterationsPerFrame; i++) {
                this.simulation.step();
                this.frameCount++;
            }
        }

        // Rendering Step
        const results = this.renderer.render(
            this.simulation.getGridA(),
            this.simulation.getGridB()
        );

        // Feed telemetry into Audio Engine
        if (results && results.meanDensity !== undefined) {
            this.meanDensity = results.meanDensity;
            // Entropy calculation (simplified for now as change in density)
            this.audio.update(this.meanDensity, Math.random() * 0.1);
        }

        // Update Stat Badges (Throttled)
        if (this.frameCount % 30 === 0) {
            this.updateTelemetryUI();
        }

        requestAnimationFrame((t) => this.tick(t));
    }

    /**
     * Sync state with HUD telemetry displays.
     * @private
     */
    updateTelemetryUI() {
        // Use document fragments or cached lookups if this becomes slow
        const fpsEl = document.getElementById('fps-counter');
        const genEl = document.getElementById('generation-counter');
        const loadEl = document.getElementById('load-val');

        if (fpsEl) fpsEl.textContent = this.currentFPS;
        if (genEl) genEl.textContent = this.frameCount;

        if (loadEl) {
            const loadPercent = Math.min(100, (this.simulation.computeTime / 16.6) * 100);
            loadEl.textContent = `${loadPercent.toFixed(1)}%`;
        }
    }

    /**
     * Hard reset of the entire system state.
     */
    reset() {
        this.simulation.reset();
        this.renderer.resetCamera();
        this.frameCount = 0;
        this.ui.showToast('System Reset Matrix Initialized');
    }
}

// Start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.RE_SKIN = new App();
});
