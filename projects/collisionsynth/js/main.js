/**
 * @file main.js
 * @description Main entry point and coordinator for CollisionSynth.
 * Initializes the environment, manages the simulation loop, and transitions states.
 */

window.addEventListener('DOMContentLoaded', () => {
    // 1. Core System Instances
    const canvas = document.getElementById('main-canvas');
    const world = new PhysicsWorld(canvas);
    const audio = new AudioEngine();
    const ui = new UIController(world, audio);
    const visualizer = new Visualizer(audio, canvas);

    let framesSinceLastHitCount = 0;
    let hitCount = 0;
    let bpm = 120;

    // 2. State Management
    const loadingOverlay = document.getElementById('loading-overlay');
    const startBtn = document.getElementById('btn-start');

    // 3. Glue Logic
    world.onCollision = (ball, wall, normal) => {
        audio.trigger(ball, wall, normal);
        hitCount++;
    };

    const startApp = async () => {
        await audio.init();
        visualizer.init();

        loadingOverlay.classList.add('hidden');

        // Initial setup
        ui.handleResize();
        Presets.apply('standard', world);

        // Add starting ball
        world.addBall(world.width / 2, world.height / 2, 12);
        ui.updateStats();

        requestAnimationFrame(mainLoop);
    };

    startBtn.onclick = startApp;

    // 4. Main Loop
    function mainLoop(timestamp) {
        // Step 1: Physical Simulation
        world.update(timestamp);

        // Step 2: Audio Visualization (background layer)
        visualizer.draw();

        // Step 3: Global Metrics
        updateTemporalStats();

        // Continue
        requestAnimationFrame(mainLoop);
    }

    function updateTemporalStats() {
        framesSinceLastHitCount++;

        // Calculate a rough BPM every 120 frames (~2 seconds)
        if (framesSinceLastHitCount >= 120) {
            // Very simplified: hits per 2 seconds * 30
            const currentBpm = Math.round((hitCount / 2) * 60);

            // Smoothed transition
            bpm = Math.round(Utils.lerp(bpm, currentBpm, 0.2));

            ui.controls.statBPM.innerText = bpm;

            // Reset
            hitCount = 0;
            framesSinceLastHitCount = 0;
        }
    }

    // Console Branding & Hints
    console.log(
        "%c CollisionSynth %c v1.0.0 %c",
        "background:#00f2ff;color:#000;font-weight:700;padding:4px 8px;",
        "background:#ff007a;color:#fff;padding:4px 8px;",
        "padding:4px 0;"
    );
    console.log("System initialized. Press space to pause. Drag wall nodes to reshape.");
});
