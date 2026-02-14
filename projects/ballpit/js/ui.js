/**
 * ui.js
 * Comprehensive User Interface management for the BallPit.
 * Handles the sidebar controls, HUD data, and provides user feedback loops.
 */

const UI = {
    // Cached DOM references
    elements: {},

    /**
     * Mounts the UI and prepares the control layer.
     */
    init() {
        this.cacheElements();
        this.populateInitialValues();
        this.bindEvents();

        // Introduction animation trigger (CSS driven)
        document.body.classList.add('app-loaded');

        console.info("UI System Mounted. Binding controls...");
    },

    /**
     * Saves references to frequently accessed DOM nodes.
     */
    cacheElements() {
        this.elements = {
            gravityRange: document.getElementById('gravity-slider'),
            frictionRange: document.getElementById('friction-slider'),
            countRange: document.getElementById('count-slider'),
            heatmapToggle: document.getElementById('heatmap-toggle'),
            particlesToggle: document.getElementById('particles-toggle'),
            wellToggle: document.getElementById('well-toggle'),
            resetBtn: document.getElementById('reset-btn'),
            envBtns: document.querySelectorAll('.env-btn'),
            fpsVal: document.getElementById('fps-val'),
            colVal: document.getElementById('col-val'),
            ballVal: document.getElementById('ball-val'),
            overlay: document.getElementById('ui-overlay')
        };
    },

    /**
     * Sets range sliders and toggles to match internal CONFIG/STATE.
     */
    populateInitialValues() {
        const { elements } = this;
        if (!elements.gravityRange) return;

        elements.gravityRange.value = CONFIG.GRAVITY;
        elements.frictionRange.value = CONFIG.FRICTION;
        elements.countRange.value = CONFIG.BALL_COUNT;
        elements.heatmapToggle.checked = STATE.showHeatmap;
        elements.particlesToggle.checked = STATE.showParticles;
        elements.wellToggle.checked = STATE.gravityWellActive;

        elements.ballVal.textContent = STATE.ballCount;
    },

    /**
     * Attaches change listeners to all interactive UI components.
     */
    bindEvents() {
        const { elements } = this;

        // ---------------------------------------------------------------------
        // SLIDERS & RANGES
        // ---------------------------------------------------------------------

        // Gravity Control
        elements.gravityRange.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            STATE.currentGravity = val;
            this.updateActiveEnvState(null); // Clear active env highlight if manual slide
        });

        // Friction / Drag Control
        elements.frictionRange.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            STATE.currentFriction = val;
            this.updateActiveEnvState(null);
        });

        // Ball Count (Applied on release/change to avoid stutter)
        elements.countRange.addEventListener('change', (e) => {
            const val = parseInt(e.target.value);
            STATE.ballCount = val;
            this.resetSimulation();
        });

        // ---------------------------------------------------------------------
        // FEATURE TOGGLES
        // ---------------------------------------------------------------------

        elements.heatmapToggle.addEventListener('change', (e) => {
            STATE.showHeatmap = e.target.checked;
        });

        elements.particlesToggle.addEventListener('change', (e) => {
            STATE.showParticles = e.target.checked;
        });

        elements.wellToggle.addEventListener('change', (e) => {
            STATE.gravityWellActive = e.target.checked;
        });

        // ---------------------------------------------------------------------
        // ENVIRONMENT PRESETS
        // ---------------------------------------------------------------------

        elements.envBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const envKey = btn.dataset.env;
                const envData = CONFIG.ENVIRONMENTS[envKey];

                if (envData) {
                    // Update global state
                    STATE.currentGravity = envData.gravity;
                    STATE.currentFriction = envData.friction;
                    STATE.activeEnvironment = envKey;

                    // Sync sliders
                    elements.gravityRange.value = envData.gravity;
                    elements.frictionRange.value = envData.friction;

                    // Visual feedback
                    this.updateActiveEnvState(btn);
                    this.notify(`Environment set: ${envData.label}`);
                }
            });
        });

        // ---------------------------------------------------------------------
        // GLOBAL ACTIONS
        // ---------------------------------------------------------------------

        elements.resetBtn.addEventListener('click', () => {
            this.resetSimulation();
            this.notify("Simulation Reset");
        });
    },

    /**
     * Resets the physics world and updates UI counters.
     */
    resetSimulation() {
        Physics.init(STATE.ballCount);
        this.elements.ballVal.textContent = STATE.ballCount;

        // Pulse the ball count text
        this.elements.ballVal.parentElement.classList.add('pulse-effect');
        setTimeout(() => {
            this.elements.ballVal.parentElement.classList.remove('pulse-effect');
        }, 500);
    },

    /**
     * Updates the "Active" CSS state for environment buttons.
     */
    updateActiveEnvState(activeBtn) {
        this.elements.envBtns.forEach(b => b.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
    },

    /**
     * Periodically updates HUD stats (FPS, Collisions).
     */
    updateHUD() {
        const now = performance.now();
        STATE.stats.frames++;

        // Sampling rate: every 500ms
        if (now - STATE.stats.lastTime >= 500) {
            const timePassed = now - STATE.stats.lastTime;
            const fps = Math.round((STATE.stats.frames * 1000) / timePassed);

            this.elements.fpsVal.textContent = fps;

            // Performance color coding for FPS
            if (fps < 45) {
                this.elements.fpsVal.style.color = '#f43f5e'; // Danger red
            } else {
                this.elements.fpsVal.style.color = '#38bdf8'; // Accent blue
            }

            STATE.stats.frames = 0;
            STATE.stats.lastTime = now;
        }

        // Real-time collision count
        this.elements.colVal.textContent = STATE.stats.collisions;
    },

    /**
     * Simple visual notification system within the UI.
     * @param {string} msg - The message to display briefly.
     */
    notify(msg) {
        console.log("[UI-Event] " + msg);
        // Could expand this to a toast system if needed
    }
};

/**
 * ACCESSIBILITY WARNING:
 * This UI uses transparency and glassmorphism. For a production app, 
 * we should ensure contrast ratios are maintained for users with 
 * visual impairments. Current palette utilizes prominent blacks and 
 * vibrant blues.
 */
