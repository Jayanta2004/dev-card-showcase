/**
 * MoldPage Animation Module
 * 
 * This module orchestrates the visual progression of the "infection."
 * It handles the transition from a clean state to a fully colonized environment.
 * The animations are designed to be slow, unsettling, and organic,
 * mimicking the rhythmic breathing and spreading of biological mold.
 * 
 * RESPONSIBILITIES:
 * - Bootstrapping the growth cycle upon trigger.
 * - Managing the interval-based expansion of clusters.
 * - Providing real-time visual feedback for user interactions (planting).
 * - Implementing global atmospheric effects (drifting, pulsing).
 * 
 * @namespace MoldAnim
 */
const MoldAnim = (() => {

    /** @type {Array<Object>} List of currently active procedural clusters. */
    let activeClusters = [];

    /** @type {boolean} Flag to prevent multiple initialization of the growth loop. */
    let isGrowing = false;

    /** @type {number|null} Store the interval ID for organic expansion. */
    let expansionInterval = null;

    /**
     * Internal configuration for rhythmic growth.
     * @private
     */
    const ANIM_CONFIG = {
        STAGGER_MS: 350,
        EXPANSION_TICK_MS: 18000,
        MAX_ACTIVE_CLUSTERS: 150,
        PULSE_DURATION_MS: 3000
    };

    /**
     * Initiates the visual growth cycle. 
     * This function is only called once the 10-minute threshold is crossed.
     * 
     * @param {HTMLElement} container - The root element where mold will be rendered.
     * @param {Array<Object>} spores - The persisted spore data from storage.
     */
    const startGrowthCycle = (container, spores) => {
        if (isGrowing) {
            console.warn('[ANIM] Growth cycle already in progress.');
            return;
        }

        isGrowing = true;
        console.group('[ANIM] Initializing living environment...');
        console.info(`[ANIM] Spawning ${spores.length} primary colonies.`);

        // STAGGERED INITIALIZATION:
        // We avoid spawning everything at once to prevent CPU spikes and
        // to create a more natural "waking up" effect for the page.
        spores.forEach((spore, index) => {
            // Apply a unique delay based on index
            const bootDelay = index * ANIM_CONFIG.STAGGER_MS;

            setTimeout(() => {
                // Create the core cluster for this spore
                const cluster = MoldGen.createCluster(container, spore.x, spore.y, {
                    pixelCount: 35 + Math.random() * 50,
                    spread: 28,
                    intensity: spore.intensity || 1.0
                });

                activeClusters.push(cluster);

                // TRIGGER PIXEL ACTIVATION:
                // Each pixel within the cluster has its own transition delay.
                // We force them to "grow" by adding the active class.
                cluster.pixels.forEach((pixel, pIdx) => {
                    // Small local stagger within the cluster
                    setTimeout(() => {
                        pixel.classList.add('active');
                    }, 50 + (pIdx * 40) + Math.random() * 800);
                });

                // CHANCE FOR ROOT SYSTEM (SPREADER):
                // Some spores trigger a deeper stain on the background.
                if (Math.random() > 0.65) {
                    MoldGen.createSpreader(container, spore.x, spore.y);
                }

                if (index === spores.length - 1) {
                    console.groupEnd();
                }
            }, bootDelay);
        });

        // BEGIN THE MACRO GROWTH LOOP:
        if (!expansionInterval) {
            expansionInterval = setInterval(organicExpansionStep, ANIM_CONFIG.EXPANSION_TICK_MS);

            // OCCASIONAL GLITCH EVENTS:
            setInterval(triggerGlitch, 25000);
        }
    };

    /**
     * Triggers a visual "spasm" of the UI.
     */
    const triggerGlitch = () => {
        if (!isGrowing) return;

        console.warn('[ANIM] Environmental instability detected.');
        document.body.classList.add('glitch-active');

        // Randomly warp some divs
        const targets = document.querySelectorAll('.intro-section, .mystic-block');
        targets.forEach(el => {
            el.style.transform = `skew(${Math.random() * 4 - 2}deg) translate(${Math.random() * 10 - 5}px)`;
            el.style.filter = `contrast(${1.5 + Math.random()}) brightness(${0.8 + Math.random() * 0.4})`;
        });

        setTimeout(() => {
            document.body.classList.remove('glitch-active');
            targets.forEach(el => {
                el.style.transform = '';
                el.style.filter = '';
            });
        }, 300 + Math.random() * 1000);
    };

    /**
     * Executes a single step of the global expansion logic.
     * Randomly selects a subset of active clusters and forces them to "bud" new pixels.
     * 
     * @private
     */
    const organicExpansionStep = () => {
        // Safety check: don't expand if growth is disabled or no clusters exist.
        if (!isGrowing || activeClusters.length === 0) return;

        // SELECTION LOGIC:
        // We only grow a small percentage of colonies per tick to maintain performance
        // and create unpredictability.
        const activeCount = activeClusters.length;
        const growthQuota = Math.max(1, Math.floor(activeCount * 0.18));

        console.info(`[ANIM] Macro Expansion Tick: Growing ${growthQuota} nodes.`);

        for (let i = 0; i < growthQuota; i++) {
            // Pick a random target from the established colony
            const randomIndex = Math.floor(Math.random() * activeCount);
            const targetCluster = activeClusters[randomIndex];

            // Invoke the generator to append new life
            MoldGen.expandCluster(targetCluster, 0.12);
        }

        // Update Audio volume based on colony size
        if (window.MoldAudio) {
            MoldAudio.setInfectionVolume(Math.min(100, (activeClusters.length / 30) * 10));
        }

        // OCCASIONAL GLOBAL MODIFICATION:
        // Apply a subtle hue shift or brightness change to simulate nutrient shifts.
        if (Math.random() > 0.8) {
            document.body.style.filter = `hue-rotate(${Math.random() * 10 - 5}deg)`;
        }
    };

    /**
     * Provides an immediate visual indicator when the user plants a new spore.
     * This "pulse" fades away quickly but marks the spot of infection.
     * 
     * @param {HTMLElement} container - UI parent for the pulse element.
     * @param {number} x - Click X.
     * @param {number} y - Click Y.
     */
    const pulseNewSpore = (container, x, y) => {
        const pulse = document.createElement('div');

        // Base styling for the interaction marker
        pulse.className = 'mold-pixel active';
        pulse.style.left = `${x}px`;
        pulse.style.top = `${y}px`;
        pulse.style.width = '12px';
        pulse.style.height = '12px';
        pulse.style.backgroundColor = 'var(--color-danger)';
        pulse.style.boxShadow = '0 0 15px var(--color-danger)';
        pulse.style.borderRadius = '50%';
        pulse.style.zIndex = '100'; // Ensure interaction is visible above everything
        pulse.style.pointerEvents = 'none';

        // Transition for the "fading away" effect
        pulse.style.transition = `all ${ANIM_CONFIG.PULSE_DURATION_MS / 1000}s cubic-bezier(0.1, 0.7, 0.1, 1)`;

        container.appendChild(pulse);

        // TRIGGER THE ANIMATION SEQUENCE:
        // Use requestAnimationFrame to ensure the browser has registered the element
        // before we apply the transformation.
        requestAnimationFrame(() => {
            setTimeout(() => {
                pulse.style.transform = 'scale(0.1)';
                pulse.style.opacity = '0';
                pulse.style.filter = 'blur(10px)';

                // Cleanup phase: Remove from DOM to prevent memory leaks
                setTimeout(() => pulse.remove(), ANIM_CONFIG.PULSE_DURATION_MS);
            }, 50);
        });
    };

    /**
     * Public API for the Animation System.
     */
    return {
        startGrowthCycle,
        pulseNewSpore,
        isGrowing: () => isGrowing,
        clusterCount: () => activeClusters.length
    };
})();

// Export the module.
window.MoldAnim = MoldAnim;
