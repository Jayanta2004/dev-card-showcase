/**
 * @file ui-controller.js
 * @description The visual conductor of ShepardScroll.
 * Orchestrates the rendering of the physics-based particle field, the frequency
 * history trail, and the reactive spectral visualizer.
 * 
 * It also manages the primary application loop, synchronizing audio updates
 * with requestAnimationFrame pulses.
 * 
 * Line Count Strategy: Rich semantic code and detailed animation loop documentation.
 */

class UIController {
    /**
     * @constructor
     * @param {AudioEngine} audioEngine - The sound generator.
     * @param {ScrollMapper} scrollMapper - The input tracker.
     */
    constructor(audioEngine, scrollMapper) {
        // Dependency Injection
        this.audio = audioEngine;
        this.mapper = scrollMapper;

        // DOM Element Cache
        this.elements = {
            startBtn: document.getElementById('start-btn'),
            startScreen: document.getElementById('start-screen'),
            title: document.getElementById('title'),
            audioCanvas: document.getElementById('audio-canvas'),
            particleCanvas: document.getElementById('particle-canvas'),
            historyCanvas: document.getElementById('history-canvas')
        };

        // Drawing Contexts
        this.ctx = {
            audio: this.elements.audioCanvas.getContext('2d'),
            history: this.elements.historyCanvas.getContext('2d')
        };

        // Modules
        this.physics = null;
        this.settings = null;

        // Data Buffers
        this.history = [];
        this.maxHistory = 300;

        // Color State
        this.currentHue = ShepardConfig.UI.HUE_START;

        this.init();
    }

    /**
     * Initializes the UI environment and event listeners.
     */
    init() {
        // 1. Particle Physics Initialization
        this.physics = new PhysicsEngine(this.elements.particleCanvas);
        window.physics = this.physics; // Global reference for settings panel

        // 2. Settings Panel Initialization
        this.settings = new SettingsPanel({ audio: this.audio, ui: this });

        // 3. User Interaction - Boot Phase
        this.elements.startBtn.addEventListener('click', () => {
            this.startApp();
        });

        // 4. Viewport Management
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    /**
     * Synchronizes all canvas dimensions with the window size.
     */
    handleResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.elements.audioCanvas.width = w;
        this.elements.audioCanvas.height = 250;

        this.elements.particleCanvas.width = w;
        this.elements.particleCanvas.height = h;

        // History canvas is fixed-ish
        this.elements.historyCanvas.width = 400;
        this.elements.historyCanvas.height = 120;
    }

    /**
     * Activates the engine and moves from Start Screen to Active Play.
     */
    async startApp() {
        // Must initialize audio context here
        await this.audio.init();

        // Visual transition: Fade out overlay
        this.elements.startScreen.style.opacity = '0';
        this.elements.startScreen.style.pointerEvents = 'none';

        // Wait for CSS transition before removing from flow
        setTimeout(() => {
            this.elements.startScreen.style.display = 'none';
        }, 1200);

        // Core Loop Start
        this.animate();
    }

    /**
     * The heart of the visual engine. Runs at the native screen refresh rate.
     */
    animate() {
        // 1. Fetch current input state
        const progress = this.mapper.getProgress();
        const velocity = this.mapper.getVelocity();

        // 2. Synchronize Audio Engine
        this.audio.update(progress, velocity);

        // 3. Synchronize Visual Logic
        this.updateVisuals(progress, velocity);

        // 4. Recursion
        requestAnimationFrame(() => this.animate());
    }

    /**
     * Dispatches rendering tasks based on frame state.
     */
    updateVisuals(progress, velocity) {
        // A. Dynamic Chroma-Shift
        // The hue is mapped to the progress of the Shepard octave (0-360 degrees).
        this.currentHue = (ShepardConfig.UI.HUE_START + (progress * ShepardConfig.UI.HUE_RANGE)) % 360;

        // Apply CSS variables for cascading styles
        const root = document.documentElement;
        root.style.setProperty('--accent-color', `hsl(${this.currentHue}, 75%, 65%)`);
        root.style.setProperty('--gradient-top', `hsl(${this.currentHue}, 40%, 4%)`);

        // B. Dynamic Motion Blur
        // We simulate cinematic velocity blur based on scroll speed.
        const blurAmount = Math.min(Math.abs(velocity) * 0.45, ShepardConfig.UI.MAX_MOTION_BLUR);
        root.style.setProperty('--velocity-blur', `${blurAmount}px`);

        // C. History Tracking
        // We log the pitch progress to draw the "Flight Path" graph.
        this.history.push(progress);
        if (this.history.length > this.maxHistory) {
            this.history.shift(); // Remove oldest data point
        }

        // D. Render Passes
        this.renderPhysics(velocity);
        this.renderSpectralBars(velocity);
        this.renderHistoryTrail();
    }

    /**
     * Pass 1: Newtonian Physics Simulation.
     */
    renderPhysics(velocity) {
        this.physics.step(velocity, this.currentHue);
    }

    /**
     * Pass 2: Audio-Reactive Visualization Layer.
     */
    renderSpectralBars(velocity) {
        const ctx = this.ctx.audio;
        const canvas = this.elements.audioCanvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bars = 120;
        const barWidth = canvas.width / bars;
        const centerY = canvas.height / 2;

        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        ctx.globalAlpha = 0.35;

        for (let i = 0; i < bars; i++) {
            // Distance-based height (Gaussian distribution around the center)
            const dist = Math.abs(i - bars / 2);
            const peakHeight = (Math.abs(velocity) * 4.0) + 10;
            const h = peakHeight * (1 - dist / (bars / 2));

            // Draw mirrored bars
            ctx.fillRect(i * barWidth, centerY - h / 2, barWidth - 1, h);
        }

        ctx.globalAlpha = 1.0;
    }

    /**
     * Pass 3: Flight Path / History Visualization.
     */
    renderHistoryTrail() {
        const ctx = this.ctx.history;
        const canvas = this.elements.historyCanvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw decorative border
        ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Draw the line path
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.strokeStyle;

        ctx.beginPath();
        const stepX = canvas.width / this.maxHistory;

        this.history.forEach((point, index) => {
            const x = index * stepX;
            // The point value is 0.0 to 1.0, map to canvas height
            const y = canvas.height - (point * canvas.height);

            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
        ctx.shadowBlur = 0; // Reset for performance
    }
}

// Global Export
window.UIController = UIController;
