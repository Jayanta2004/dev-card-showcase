/**
 * MoldPage Storage Module
 * Handles persistence of spores, timestamps, and infection states.
 */

/**
 * MoldPage Storage Module
 * 
 * This module is responsible for the absolute persistence of all "infection" data.
 * It strictly manages the localStorage interactions to ensure that user intent (clicks)
 * survives page reloads, browser restarts, and long-term dormancy.
 * 
 * DATA STRUCTURE:
 * The colony data is stored as a serialized JSON object containing:
 * - spores: An array of coordinate sets where the user has interacted.
 * - firstVisit: A timestamp of when the "infectious" process began.
 * - lastSeen: A heartbeat timestamp to track when the user last engaged.
 * - infectionLevel: A numerical representation of how "deep" the mold has spread.
 * - metadata: Extended properties for future evolution (e.g., strain variety).
 * 
 * @namespace MoldStore
 */
const MoldStore = (() => {
    /** @const {string} Key used for horizontal persistence across sessions. */
    const STORAGE_KEY = 'moldpage_spores_v1_0';

    /** @const {string} Secondary key for session-specific volatile state if needed. */
    const SESSION_KEY = 'moldpage_session_id';

    /**
     * @typedef {Object} Spore
     * @property {number} x - Horizontal coordinate in pixels relative to viewport.
     * @property {number} y - Vertical coordinate in pixels relative to viewport.
     * @property {number} timestamp - Unix timestamp when the click occurred.
     * @property {string} clusterId - Globally unique identifier for the procedural cluster.
     * @property {number} intensity - The "strength" of the infection at this point.
     */

    /**
     * Initializes the colony or retrieves existing data from the browser's persistent storage.
     * If no data is found, it establishes the 'Patient Zero' state.
     * 
     * @returns {Object} The complete colony data object.
     */
    const getColony = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                const initialData = {
                    spores: [],
                    firstVisit: Date.now(),
                    lastSeen: Date.now(),
                    infectionLevel: 0,
                    metadata: {
                        version: '1.0.0',
                        host: window.location.hostname,
                        strain: 'Chlorophyll-A'
                    }
                };
                saveColony(initialData);
                console.info('[STORAGE] Patient Zero initialized.');
                return initialData;
            }

            const parsed = JSON.parse(data);

            // Validation: Ensure the data structure is intact
            if (!parsed.spores || !Array.isArray(parsed.spores)) {
                console.warn('[STORAGE] Corrupt colony data detected. Re-initializing.');
                return resetColony();
            }

            return parsed;
        } catch (e) {
            console.error('[STORAGE] Critical failure in data retrieval:', e);
            return { spores: [], firstVisit: Date.now(), lastSeen: Date.now(), infectionLevel: 0 };
        }
    };

    /**
     * Serializes and persists the current state of the infection.
     * Updates the 'lastSeen' heartbeat to track dormancy.
     * 
     * @param {Object} data - The colony data to be stored.
     * @returns {boolean} Success status of the operation.
     */
    const saveColony = (data) => {
        try {
            data.lastSeen = Date.now();
            const serialized = JSON.stringify(data);
            localStorage.setItem(STORAGE_KEY, serialized);
            return true;
        } catch (e) {
            console.error('[STORAGE] Persistent write failed. Storage may be full.', e);
            return false;
        }
    };

    /**
     * Records a new point of infection (a "spore") at the specified coordinates.
     * 
     * @param {number} x - Viewport X coordinate.
     * @param {number} y - Viewport Y coordinate.
     * @returns {Spore} The newly created spore object.
     */
    const addSpore = (x, y) => {
        const colony = getColony();

        // Intensity is determined by proximity to existing spores (simulating viral load)
        const nearbyCount = colony.spores.filter(s => {
            const dist = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
            return dist < 100;
        }).length;

        const newSpore = {
            x: Math.floor(x),
            y: Math.floor(y),
            timestamp: Date.now(),
            clusterId: `cid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            intensity: Math.min(1.0, 0.2 + (nearbyCount * 0.1))
        };

        colony.spores.push(newSpore);

        // Scale infection level based on spore count
        colony.infectionLevel = Math.min(100, (colony.spores.length / 50) * 10);

        saveColony(colony);
        return newSpore;
    };

    /**
     * Calculates the direct millisecond delta since the initial infection.
     * This value is the primary driver for all growth logic.
     * 
     * @returns {number} Time elapsed in milliseconds.
     */
    const getElapsedTime = () => {
        const colony = getColony();
        return Date.now() - colony.firstVisit;
    };

    /**
     * Evaluates if the environment is ready for procedural growth.
     * The 10-minute threshold represents the "Incubation Period."
     * 
     * @returns {boolean} True if growth should be rendered.
     */
    const isGrowthTriggered = () => {
        /** @const {number} Threshold for incubation (10 minutes) */
        const THRESHOLD = 10 * 60 * 1000;
        const elapsed = getElapsedTime();

        // Developer trapdoor for instant verification
        if (window.location.search.includes('mold_force=true')) {
            console.info('[STORAGE] Growth forced via override.');
            return true;
        }

        const triggered = elapsed > THRESHOLD;
        if (triggered) {
            console.info(`[STORAGE] Incubation complete. Elapsed: ${Math.floor(elapsed / 60000)}m`);
        }

        return triggered;
    };

    /**
     * Destroys existing colony data and refreshes the host environment.
     * Used primarily for clinical resets or debugging.
     * 
     * @returns {Object} A fresh, empty colony state.
     */
    const resetColony = () => {
        console.warn('[STORAGE] Purging all infection data.');
        localStorage.removeItem(STORAGE_KEY);

        // If interactive, reload the page to clear DOM states
        if (typeof window !== 'undefined') {
            window.location.reload();
        }

        return { spores: [], firstVisit: Date.now(), lastSeen: Date.now(), infectionLevel: 0 };
    };

    /**
     * Checks how long the system has been dormant.
     * 
     * @returns {number} Milliseconds since last visit.
     */
    const getDormancyPeriod = () => {
        const colony = getColony();
        return Date.now() - colony.lastSeen;
    };

    /**
     * Analyzes the colony and returns a "Strain Name" based on patterns.
     * 
     * @returns {string} Evolutionary name.
     */
    const getStrainName = () => {
        const colony = getColony();
        const count = colony.spores.length;
        if (count === 0) return 'DORMANT';
        if (count < 10) return 'LATENT-A';

        // Calculate average distance between spores to determine "Strain"
        let totalDist = 0;
        let samples = 0;
        for (let i = 0; i < Math.min(count, 20); i++) {
            for (let j = i + 1; j < Math.min(count, 20); j++) {
                const s1 = colony.spores[i];
                const s2 = colony.spores[j];
                totalDist += Math.sqrt(Math.pow(s1.x - s2.x, 2) + Math.pow(s1.y - s2.y, 2));
                samples++;
            }
        }

        const avgDist = samples > 0 ? totalDist / samples : 0;

        if (avgDist < 100) return 'CLUSTERED-BETA';
        if (avgDist > 400) return 'SPARSE-SIGMA';
        if (count > 50) return 'AGGRESSIVE-OMEGA';

        return 'ORGANIC-DELTA';
    };

    return {
        getColony,
        saveColony,
        addSpore,
        getElapsedTime,
        isGrowthTriggered,
        resetColony,
        getDormancyPeriod,
        getStrainName
    };
})();

// Ensure the module is available globally for other components.
window.MoldStore = MoldStore;
