/**
 * FanSim | Main Engine
 * ---------------------------------------------------------
 * Orchestrates interaction between the UI, State, Audio,
 * and Visual components.
 * ---------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Engine] Initializing FanSim Engine...");

    // Initialize Components
    FanVisuals.init();
    if (typeof airflowVisualizer !== 'undefined') {
        airflowVisualizer.init();
    }

    // UI Event Listeners
    const buttons = document.querySelectorAll('.control-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const speed = parseInt(btn.dataset.speed);

            // 1. Initialize audio on first interaction
            if (!audioController.isInitialized) {
                await audioController.init();
            } else {
                await audioController.resume();
            }

            // 2. Update UI State (Active Class)
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 3. Update Domain Logic
            FanState.setTarget(speed);

            // Visuals and Audio now self-sync via the RAF loop in FanVisuals
        });
    });

    // NEW: Oscillation Toggle
    const oscBtn = document.getElementById('btn-osc');
    oscBtn.addEventListener('click', () => {
        FanState.toggleOscillation();
        oscBtn.textContent = FanState.oscillation.enabled ? 'ON' : 'OFF';
        oscBtn.classList.toggle('enabled', FanState.oscillation.enabled);
    });

    // NEW: Blade Count Selector
    const bladeBtns = document.querySelectorAll('.blade-btn');
    bladeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.count);
            FanState.setBladeCount(count);
            bladeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // NEW: Timer Selector
    const timerSelect = document.getElementById('timer-select');
    timerSelect.addEventListener('change', (e) => {
        FanState.setTimer(parseFloat(e.target.value));
    });

    // NEW: Theme Selector
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            FanState.setTheme(theme);
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Handle generic click for audio initialization
    window.addEventListener('mousedown', async () => {
        if (!audioController.isInitialized) {
            // Wait for a valid user gesture context
            // Many browsers require a direct click on an element, 
            // but a window-level click often works if handled correctly.
        }
    });

    console.log("[Engine] Boot Sequence Complete.");
});

/**
 * Cleanup Logic
 */
window.addEventListener('beforeunload', () => {
    // Perform any necessary cleanup if needed
});
