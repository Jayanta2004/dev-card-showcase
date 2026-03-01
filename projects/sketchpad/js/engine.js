/**
 * @file engine.js
 * @description The central nervous system of the SketchPad application. 
 * Orchestrates the lifecycle of all internal modules and handles the 
 * high-level interaction logic between physical UI, digital input, 
 * and canvas rendering.
 * 
 * INTEGRATIONS:
 * - Config: Runtime settings.
 * - Analytics: Usage tracking.
 * - UI: Physical component management.
 * - Effects: Visual/Audio feedback.
 * - Renderer: Graphics engine.
 * - Input: Event polling.
 */

const Engine = (() => {
    // --- Selectors ---
    const SELECTORS = {
        CANVAS: '#sketch-canvas',
        SHAKE_BTN: '#shake-btn',
        INFO_OVERLAY: '#info-overlay',
        CLOSE_INFO: '#close-info'
    };

    // --- State ---
    let initialized = false;

    /**
     * The movement bridge. Connects input polling to rendering and UI.
     * @param {number} dx 
     * @param {number} dy 
     */
    function onMove(dx, dy) {
        // 1. Draw segment
        Renderer.draw(dx, dy);

        // 2. Rotate physical knobs
        UI.update(dx, dy);

        // 3. Track analytics
        const stylus = Renderer.getStylusState();
        Analytics.recordMove(dx, dy, stylus.velocity);
    }

    /**
     * Erase sequence orchestration.
     */
    function handleShake() {
        if (Effects.isAnimating()) return;

        Effects.shake(() => {
            Renderer.clear();
            UI.reset();
            Analytics.recordShake();
        });
    }

    /**
     * Modal management for instructions.
     */
    function toggleInfo(show) {
        const overlay = Utils.qs(SELECTORS.INFO_OVERLAY);
        if (!overlay) return;

        if (show) {
            overlay.classList.remove('hidden');
            Input.pause(); // Stop drawing while reading
        } else {
            overlay.classList.add('hidden');
            Input.resume();
        }
    }

    /**
     * App-wide keyboard management.
     */
    function setupEvents() {
        // Shake Trigger
        const btn = Utils.qs(SELECTORS.SHAKE_BTN);
        if (btn) btn.addEventListener('click', handleShake);

        // Close Info Trigger
        const closeBtn = Utils.qs(SELECTORS.CLOSE_INFO);
        if (closeBtn) closeBtn.addEventListener('click', () => toggleInfo(false));

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();

            // S or Space for Shake
            if (key === ' ' || key === 's') {
                handleShake();
                e.preventDefault();
            }

            // L for Analytics Report
            if (key === 'l') {
                Analytics.printReport();
            }

            // I or H for Help
            if (key === 'i' || key === 'h' || key === '?') {
                const overlay = Utils.qs(SELECTORS.INFO_OVERLAY);
                const isHidden = overlay && overlay.classList.contains('hidden');
                toggleInfo(isHidden);
            }
        });
    }

    /**
     * Main Startup Logic.
     */
    function startup() {
        if (initialized) return;

        Logger.info('SketchPad Engine v' + Config.VERSION + ' powering up...');

        // 1. Module Inits
        Analytics.startSession();
        UI.init();
        Renderer.init('sketch-canvas');
        Effects.init();

        // 2. Event Binding
        setupEvents();

        // 3. Input Polling
        Input.init(onMove);

        // 4. Initial State
        Renderer.clear(false);

        // Show instructions on first load
        setTimeout(() => toggleInfo(true), Config.get('engine.initialDelay'));

        initialized = true;
        Logger.info('--- System Ready ---');
    }

    // Exported surface
    return {
        startup,
        handleShake,
        showHelp: () => toggleInfo(true)
    };
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', Engine.startup);
