/**
 * FanSim | Fan Visual Controller
 * ---------------------------------------------------------
 * Updates the CSS properties of the fan blades to match
 * the current state.
 * ---------------------------------------------------------
 */

const FanVisuals = {
    container: null,
    rpmDisplay: null,
    tempDisplay: null,
    powerDisplay: null,
    revDisplay: null,

    // Animation frame handle
    frameId: null,
    lastTime: 0,

    init() {
        this.container = document.getElementById('fan-blades-container');
        this.rpmDisplay = document.getElementById('speed-status').querySelector('.val');

        // Initial Blade Render
        this.renderBlades();

        // Start the physics/visual sync loop
        this.startLoop();
        console.log("[Visuals] Physics Loop Started");
    },

    /**
     * Main Animation Loop
     * Synchronizes DOM with Physics State
     */
    startLoop() {
        const loop = (time) => {
            const deltaTime = (time - this.lastTime) / 1000;
            this.lastTime = time;

            // 1. Update Physics State
            // Note: deltaTime is typically ~0.016s at 60fps
            FanState.updatePhysics(deltaTime || 0.016);

            // 2. Map velocity to CSS Variables
            this.syncCSS();

            // 3. Update Status UI
            this.updateStats();

            this.frameId = requestAnimationFrame(loop);
        };
        this.frameId = requestAnimationFrame(loop);
    },

    /**
     * Sync CSS variables with current velocity
     */
    syncCSS() {
        const velocity = FanState.physics.velocity;

        if (velocity < 0.01) {
            this.container.style.animationPlayState = 'paused';
            this.container.style.filter = 'blur(0px)';
        } else {
            this.container.style.animationPlayState = 'running';

            // Map velocity to duration: 
            // 0 velocity -> Infinity duration
            // 1 velocity -> 0.3s duration
            // Formula: 2.5s - (velocity * 2.2s)
            const duration = Math.max(0.3, 2.5 - (velocity * 2.2));
            const blur = velocity * 12;

            this.container.style.setProperty('--fan-speed-duration', `${duration}s`);
            this.container.style.setProperty('--fan-blur-amount', `${blur}px`);
        }

        // Sync Oscillation
        const fanHead = document.querySelector('.fan-head');
        if (fanHead) {
            fanHead.style.transform = `rotateY(${FanState.oscillation.angle}deg)`;
        }
    },

    /**
     * Dynamically render blades based on configuration
     */
    renderBlades() {
        const count = FanState.config.bladeCount;
        // Keep the hub
        this.container.innerHTML = '<div class="fan-hub"></div><div class="blade-glare"></div>';

        for (let i = 0; i < count; i++) {
            const blade = document.createElement('div');
            blade.className = `blade blade-${i + 1}`;
            const rotation = (360 / count) * i;
            blade.style.transform = `rotate(${rotation}deg)`;
            this.container.appendChild(blade);
        }
        console.log(`[Visuals] Rendered ${count} blades`);
    },

    /**
     * Update Telemetry in UI
     */
    updateStats() {
        // Approximate RPM based on normalized velocity
        const rpm = Math.round(FanState.physics.velocity * 1800);
        this.rpmDisplay.textContent = `RPM: ${rpm}`;

        // Update audio based on velocity in the audio controller
        if (audioController.isInitialized) {
            audioController.syncWithVelocity(FanState.physics.velocity);
        }
    },

    /**
     * Legacy trigger, handled by loop now
     * @param {number} level 
     */
    update(level) {
        console.log(`[Visuals] Targeted Level ${level}`);
    }
};
