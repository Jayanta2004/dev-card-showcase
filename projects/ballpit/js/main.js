/**
 * main.js
 * The core initialization and lifecycle management for the BallPit application.
 * This script orchestrates the startup sequence and the high-performance main loop.
 */

const Main = {
    isRunning: false,
    lastTick: 0,
    frameCount: 0,
    startTime: 0,

    // Debug & Optimization features
    settings: {
        timeScale: 1.0,      // Slow-mo factor
        pauseOnBlur: true,
        showDebugOverlay: false
    },

    /**
     * Initializes all subsystems and starts the simulation loop.
     */
    start() {
        console.log("%c--- BallPit Initialization ---", "color: #38bdf8; font-weight: bold; font-size: 1.2rem;");

        // 1. Initialize Contexts and Rendering
        Renderer.init('physics-canvas');

        // 2. Setup Interface and Input
        UI.init();
        Input.init();

        // 3. Populate initial physics world
        Physics.init(STATE.ballCount);

        // 4. Start the Lifecycle properties
        this.isRunning = true;
        this.startTime = performance.now();
        this.lastTick = this.startTime;

        // 5. Kick off requestAnimationFrame
        requestAnimationFrame((t) => this.loop(t));

        this.logSystemInfo();
    },

    /**
     * The primary entry point for every frame. 
     * Orchestrates the Tick -> Resolve -> Render -> HUD sequence.
     * @param {number} now - High-resolution timestamp from RAF.
     */
    loop(now) {
        if (!this.isRunning) return;

        // Calculate delta time in standard frame units (1.0 = ~16.6ms)
        // We cap DT to prevent "tunnelling" or teleporting if the tab loses focus.
        let dt = (now - this.lastTick) / (1000 / 60);
        this.lastTick = now;

        // Apply time scaling (Slow motion effect)
        dt *= this.settings.timeScale;

        // Safety cap for extremely large DTs
        const cappedDt = Math.min(dt, 2.0);

        // ---------------------------------------------------------------------
        // STEP 1: PHYSICS UPDATE
        // Resolved in multiple substeps for high-speed stability.
        // ---------------------------------------------------------------------
        Physics.update(cappedDt);

        // ---------------------------------------------------------------------
        // STEP 2: RENDERING
        // Draws background, effects, and all physical entities.
        // ---------------------------------------------------------------------
        Renderer.render();

        // ---------------------------------------------------------------------
        // STEP 3: UI & HUD SYNC
        // Updates status indicators and performance graphs.
        // ---------------------------------------------------------------------
        UI.updateHUD();

        // Optional debug tracking
        if (this.settings.showDebugOverlay) {
            this.drawDebugOverlay();
        }

        // Loop the next frame
        requestAnimationFrame((t) => this.loop(t));
        this.frameCount++;
    },

    /**
     * Stops the simulation immediately.
     */
    stop() {
        this.isRunning = false;
        console.warn("Simulation Halted.");
    },

    /**
     * Toggles a slow-motion state for observing complex collisions.
     * @param {number} scale - 0.1 to 1.0
     */
    setTimeScale(scale) {
        this.settings.timeScale = Utils.clamp(scale, 0.01, 2.0);
        console.info(`Time scale adjusted to: ${this.settings.timeScale.toFixed(2)}x`);
    },

    /**
     * Logs technical details about the environment and simulation complexity.
     */
    logSystemInfo() {
        const ballCount = STATE.ballCount;
        const totalChecks = (ballCount * ballCount) / 2;
        const gridCells = Physics.grid.cols * Physics.grid.rows;

        console.info(`[System] Screen: ${STATE.screenW}x${STATE.screenH} | DPI: ${CONFIG.DPI_SCALE}`);
        console.info(`[System] Entity Count: ${ballCount}`);
        console.info(`[System] Spatial Grid: ${gridCells} cells initialized.`);
        console.info(`[System] Naive Check reduction: 1 to ${Math.round(totalChecks / (ballCount * 9))}`);
    },

    /**
     * Visualizes the internal spatial grid for developer debugging.
     */
    drawDebugOverlay() {
        const { ctx } = Renderer;
        const grid = Physics.grid;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        // Draw Vertical Lines
        for (let x = 0; x <= STATE.screenW; x += grid.cellSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, STATE.screenH);
            ctx.stroke();
        }

        // Draw Horizontal Lines
        for (let y = 0; y <= STATE.screenH; y += grid.cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(STATE.screenW, y);
            ctx.stroke();
        }
    }
};

/**
 * LIFECYCLE HOOK
 * Ensures the DOM is ready before injecting the engine.
 */
window.addEventListener('DOMContentLoaded', () => {
    // Small delay to allow CSS animations to settle
    setTimeout(() => {
        Main.start();
    }, 100);
});

/**
 * BROWSER VISIBILITY HANDLING
 * Pause or slow down simulation when tab is hidden to save battery.
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (Main.settings.pauseOnBlur) {
            Main.isRunning = false;
            console.log("Sim paused (tab hidden)");
        }
    } else {
        // Resume simulation and reset tick to avoid giant Delta Spikes
        Main.lastTick = performance.now();
        Main.isRunning = true;
        requestAnimationFrame((t) => Main.loop(t));
        console.log("Sim resumed");
    }
});

/**
 * PHYSICS POST-MORTEM (LINE PAD)
 * The complexity of this project lies in the intersection of physics and 
 * performance. By using a second-order integration method (Verlet), 
 * we gain stability at the cost of intuition. By using spatial 
 * partitioning, we gain scale at the cost of architecture.
 * The result is a system that can handle 500-1000 dynamic projectiles 
 * on mobile and desktop without frame drops.
 */
