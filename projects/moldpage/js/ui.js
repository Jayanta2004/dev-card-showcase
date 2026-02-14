/**
 * MoldPage UI Module
 * 
 * This module manages the bridge between the user and the infection.
 * it handles click event captures, DOM state updates, and real-time
 * telemetry (stats) display. It also implements the "text infection" 
 * logic which allows the mold to visually corrupt static HTML content.
 * 
 * FEATURES:
 * - Persistent telemetry (spore counts, colony age).
 * - Immersive interaction feedback (screen shake, sound stubs).
 * - Content corruption (infecting text elements).
 * - UI status monitoring (CLEAN vs INFECTED states).
 * 
 * @namespace MoldUI
 */
const MoldUI = (() => {

    /** 
     * Cache for core UI elements to minimize DOM lookups.
     * @private
     */
    const elements = {
        surface: null,
        moldRoot: null,
        sporeCount: null,
        colonyAge: null,
        systemStatus: null,
        mainHeader: null
    };

    /** 
     * Local state tracking for transient UI behaviors.
     * @private
     */
    const state = {
        clickCount: 0,
        lastClickTime: 0,
        shakeEnabled: true
    };

    /**
     * Bootstraps the UI system and connects event listeners.
     * Should be called on DOMContentLoaded.
     */
    const init = () => {
        console.group('[UI] Initializing interface...');

        // 1. Assign Element References
        elements.surface = document.getElementById('infection-surface');
        elements.moldRoot = document.getElementById('mold-root');
        elements.sporeCount = document.getElementById('spore-count');
        elements.colonyAge = document.getElementById('colony-age');
        elements.systemStatus = document.getElementById('system-status');
        elements.mainHeader = document.querySelector('.app-header h1');

        if (!elements.surface) {
            console.error('[UI] Critical Error: Interaction surface not found.');
            console.groupEnd();
            return;
        }

        // 2. Attach Event Handlers
        elements.surface.addEventListener('mousedown', handleGlobalInteraction);
        elements.surface.addEventListener('mousemove', handleMouseMove);

        // 3. Audio Bootstrap (Wait for first click)
        const audioInit = () => {
            MoldAudio.init();
            document.removeEventListener('mousedown', audioInit);
        };
        document.addEventListener('mousedown', audioInit);

        // 4. System Heartbeat
        // Update the statistics display every second.
        setInterval(updateTelemetry, 1000);

        // 4. Content Corruption Loop
        // Occasionally "infect" a text element if growth is active.
        setInterval(polluteContentStep, 15000);

        // Initial telemetry synchronization
        updateTelemetry();

        console.info('[UI] Interface ready.');
        console.groupEnd();
    };

    /**
     * Universal handler for user interactions on the page.
     * Every click translates into a biological "spore."
     * 
     * @param {MouseEvent} e - The browser mouse event.
     */
    const handleGlobalInteraction = (e) => {
        const now = Date.now();

        // Anti-spam protection: ensure clicks are meaningful (at least 100ms apart)
        if (now - state.lastClickTime < 100) return;
        state.lastClickTime = now;

        const x = e.clientX;
        const y = e.clientY;

        const spore = MoldStore.addSpore(x, y);

        // AUDIO FEEDBACK:
        MoldAudio.playSquelch();

        // VISUAL FEEDBACK:
        // 1. Particle Pulse at the click site.
        MoldAnim.pulseNewSpore(elements.moldRoot, x, y);

        // 2. Immersive Effects (Shake & Glitch)
        applyHapticFeedback();

        // 3. Telemetry Update
        state.clickCount++;
        updateTelemetry();

        // If clicking on specific nodes, provide special logic
        if (e.target.closest('.interactive-node')) {
            handleNodeTrigger(e.target.closest('.interactive-node'));
        }
    };

    /**
     * Tracks mouse movement for proximity effects and "void" glow.
     */
    const handleMouseMove = (e) => {
        const voidEl = document.getElementById('cursor-void');
        if (!voidEl) return;

        voidEl.style.display = 'block';
        voidEl.style.left = `${e.clientX}px`;
        voidEl.style.top = `${e.clientY}px`;

        // If growth is triggered, the void glow slightly interacts with clusters
        if (MoldStore.isGrowthTriggered()) {
            const intensity = Math.sin(Date.now() / 500) * 0.1 + 0.2;
            voidEl.style.background = `radial-gradient(circle, rgba(45, 90, 39, ${intensity}) 0%, transparent 70%)`;
        }
    };

    /**
     * Updates the status dashboard with live data.
     */
    const updateTelemetry = () => {
        const colony = MoldStore.getColony();
        const elapsedMs = MoldStore.getElapsedTime();
        const elapsedMins = Math.floor(elapsedMs / 60000);

        // 1. Update Spore Inventory
        if (elements.sporeCount) {
            elements.sporeCount.textContent = colony.spores.length.toLocaleString();
        }

        // 2. Update Temporal Progress
        if (elements.colonyAge) {
            const ageText = elapsedMins > 60
                ? `${Math.floor(elapsedMins / 60)}h ${elapsedMins % 60}m`
                : `${elapsedMins}m`;
            elements.colonyAge.textContent = ageText;
        }

        // 3. Evaluate System Integrity
        if (MoldStore.isGrowthTriggered()) {
            if (elements.systemStatus && elements.systemStatus.textContent !== 'INFECTED') {
                elements.systemStatus.textContent = 'INFECTED';
                elements.systemStatus.classList.add('warning');
                elements.moldRoot.classList.add('growth-triggered');

                // Visual glitch for the main title
                if (elements.mainHeader) {
                    elements.mainHeader.style.animation = 'drift 10s infinite';
                }
            }
        } else {
            if (elements.systemStatus) {
                elements.systemStatus.textContent = 'CLEAN';
                elements.systemStatus.classList.remove('warning');
            }
        }
    };

    /**
     * Triggers a subtle screen shake to simulate physical impact.
     * @private
     */
    const applyHapticFeedback = () => {
        if (!state.shakeEnabled) return;

        const intensity = 3;
        const rx = (Math.random() - 0.5) * intensity;
        const ry = (Math.random() - 0.5) * intensity;

        elements.surface.style.transition = 'none';
        elements.surface.style.transform = `translate(${rx}px, ${ry}px)`;

        setTimeout(() => {
            elements.surface.style.transition = 'transform 0.2s ease-out';
            elements.surface.style.transform = 'translate(0, 0)';
        }, 30);
    };

    /**
     * Orchestrates the corruption of static text elements.
     * Finds clean text and marks it as "infected."
     */
    const polluteContentStep = () => {
        if (!MoldStore.isGrowthTriggered()) return;

        // Selection: Find all potentially infectable elements
        const targets = document.querySelectorAll('p, h2, span:not(.label)');

        // Probabilistic growth: only infect a small percentage per poll
        targets.forEach(el => {
            if (el.classList.contains('infected-text')) return;

            if (Math.random() > 0.95) {
                el.classList.add('infected-text');

                // Randomly distort the text slightly
                if (Math.random() > 0.5) {
                    el.style.letterSpacing = `${Math.random() * 2}px`;
                }
            }
        });
    };

    /**
     * Logic for clicking the main interactive nodes.
     * @param {HTMLElement} node - The element that was clicked.
     */
    const handleNodeTrigger = (node) => {
        node.style.borderColor = 'var(--color-danger)';
        setTimeout(() => {
            node.style.borderColor = '';
        }, 500);

        console.info('[UI] Interactive node engaged.');
    };

    return {
        init,
        updateTelemetry,
        getMoldRoot: () => elements.moldRoot,
        toggleShake: (val) => state.shakeEnabled = val
    };
})();

// Export the UI handler globally.
window.MoldUI = MoldUI;
