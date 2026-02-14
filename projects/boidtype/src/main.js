import { Simulation } from './core/Simulation.js';
import { Renderer } from './ui/Renderer.js';
import { VisualsController } from './ui/VisualsController.js';
import { Interactions } from './ui/Interactions.js';

/**
 * App - The master application class for BoidType.
 * Coordinates input events, simulation updates, and rendering loops.
 * Bridges the gap between the UI layer and the core physics engine.
 * 
 * @class App
 */
class App {
    /**
     * Initializes the BoidType environment and its various subsystems.
     */
    constructor() {
        /** @type {Simulation} The core physics engine */
        this.simulation = new Simulation();

        /** @type {Renderer} The high-performance canvas renderer */
        this.renderer = new Renderer('canvas');

        /** @type {VisualsController} Orchestrator for aesthetic styles */
        this.visuals = new VisualsController(this.renderer, this.simulation);

        /** @type {Interactions} Manager for complex environmental forces */
        this.interactions = new Interactions(this.simulation);

        /** @type {number} Frame counter for FPS calculations */
        this.frameRecord = [];

        /** @type {number} Reference for performance timestamps */
        this.lastTimestamp = 0;

        /** @type {boolean} Flag for browser-based mic activation */
        this.audioEnabled = false;

        this.init();
    }

    /**
     * Bootstraps the application, starts listeners, and begins the main loop.
     */
    init() {
        console.log("BoidType: Sysem initialising...");

        // Start simulation
        this.simulation.init();

        // Populate preset dropdown
        this.updatePresetUI();

        // Register events
        this.setupIOLearners();
        this.setupUIHandlers();

        // Kickstart the render cycle
        requestAnimationFrame((t) => this.loop(t));

        console.log("BoidType: System ready. Performance loop active.");
    }

    /**
     * Primary application loop running on requestAnimationFrame.
     * @param {number} timestamp - Native browser high-res timestamp.
     */
    loop(timestamp) {
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        // Perform simulation step
        this.simulation.update(timestamp);

        // Apply active user interactions
        this.interactions.applyForces();

        // Draw the frame
        this.renderer.render(this.simulation, this.visuals);

        // Performance metrics
        this.calculateMetrics(deltaTime);

        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Registers low-level browser IO events (mouse, touch, resize).
     */
    setupIOLearners() {
        // Universal pointer movement
        const handleMove = (x, y) => {
            this.simulation.updateMouse(x, y);
            this.interactions.updatePointer(x, y);
        };

        window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));

        window.addEventListener('mousedown', () => this.interactions.handleStart());
        window.addEventListener('mouseup', () => this.interactions.handleEnd());

        window.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            handleMove(t.clientX, t.clientY);
            this.interactions.handleStart();
        });

        window.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            handleMove(t.clientX, t.clientY);
        });

        window.addEventListener('touchend', () => this.interactions.handleEnd());

        // Global Window resize
        window.addEventListener('resize', () => {
            this.renderer.resize();
            this.simulation.resize();
        });
    }

    /**
     * Binds the expanded UI elements to simulation and visual controllers.
     */
    setupUIHandlers() {
        // Typography Input
        const textInput = document.getElementById('textInput');
        textInput.addEventListener('input', (e) => {
            this.simulation.updateTargets(e.target.value);
        });

        // Sliders & Values
        const bindSlider = (id, callback, displayId = null) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                callback(val);
                if (displayId) {
                    const disp = document.querySelector(`[data-target="${displayId}"]`);
                    if (disp) disp.textContent = val + (id === 'density' ? 'px' : '');
                }
            });
        };

        bindSlider('density', (v) => { this.simulation.config.density = v; this.simulation.updateTargets(this.simulation.config.text); }, 'density');
        bindSlider('separation', (v) => this.simulation.boids.forEach(b => b.weights.separation = v));
        bindSlider('cohesion', (v) => this.simulation.boids.forEach(b => b.weights.cohesion = v));
        bindSlider('alignment', (v) => this.simulation.boids.forEach(b => b.weights.alignment = v));
        bindSlider('arrive', (v) => this.simulation.boids.forEach(b => b.weights.arrive = v));
        bindSlider('glow', (v) => this.visuals.setGlow(v));
        bindSlider('blur', (v) => this.visuals.setMotionBlur(v));

        // Interaction Modes
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.interactions.setMode(btn.dataset.mode);
            });
        });

        // Render Style Selection
        document.getElementById('renderMode').addEventListener('change', (e) => {
            this.visuals.setMode(e.target.value);
        });

        // Theme Cycling
        document.getElementById('cycleTheme').addEventListener('click', () => {
            this.visuals.cycleTheme();
        });

        document.getElementById('randomizeColors').addEventListener('click', () => {
            this.simulation.boids.forEach(b => {
                b.color = `hsl(${Math.random() * 360}, 100%, 65%)`;
            });
        });

        // Sequence Engine Controls
        const toggleSeq = document.getElementById('toggleSequence');
        toggleSeq.addEventListener('click', () => {
            if (this.simulation.sequence.isActive) {
                this.simulation.sequence.stop();
                toggleSeq.textContent = "Enable Auto-Morph";
                toggleSeq.classList.remove('active');
            } else {
                this.simulation.sequence.start(['BOIDTYPE', 'EVOLVE', 'FLOCK', 'SWARM', 'SYSTEM'], 4000);
                toggleSeq.textContent = "Auto-Morphing: ON";
                toggleSeq.classList.add('active');
            }
        });

        // Audio Activation
        const audioBtn = document.getElementById('toggleAudio');
        audioBtn.addEventListener('click', async () => {
            if (!this.audioEnabled) {
                await this.simulation.audio.init();
                this.audioEnabled = true;
                audioBtn.textContent = "Mic Reactivity: ON";
                audioBtn.classList.add('active');
            } else {
                audioBtn.textContent = "Mic Reactivity: OFF";
                audioBtn.classList.remove('active');
            }
        });

        // Presets
        document.getElementById('savePreset').addEventListener('click', () => {
            const name = document.getElementById('newPresetName').value || 'User Preset';
            this.simulation.presets.saveCurrentAs(name);
            this.updatePresetUI();
        });

        document.getElementById('presetSelect').addEventListener('change', (e) => {
            this.simulation.presets.load(e.target.value);
        });
    }

    /**
     * Refreshes the preset dropdown list.
     */
    updatePresetUI() {
        const select = document.getElementById('presetSelect');
        select.innerHTML = '';
        const names = this.simulation.presets.getPresetNames();
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        });
    }

    /**
     * Internal: Computes real-time performance indicators (FPS, Agent Count).
     * @param {number} delta - Frame time in milliseconds.
     */
    calculateMetrics(delta) {
        this.frameRecord.push(delta);
        if (this.frameRecord.length > 30) this.frameRecord.shift();

        const avgDelta = this.frameRecord.reduce((a, b) => a + b, 0) / this.frameRecord.length;
        const fps = Math.round(1000 / avgDelta);

        document.getElementById('fpsCount').textContent = fps;
        document.getElementById('agentCount').textContent = this.simulation.boids.length;
    }
}

// Global initialization on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.BoidApp = new App();
});
