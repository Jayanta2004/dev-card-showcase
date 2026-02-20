import DOMHelper from '../core/DOMHelper.js';

/**
 * SceneManager.js
 * Orchestrates the visual changes in the room (colors, lighting, etc.)
 */
export default class SceneManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.roomContainer = document.querySelector('.room-container');
        this.lightingOverlay = document.querySelector('.lighting-overlay');

        // Listen for mood changes
        this.eventBus.on('moodChange', this.handleMoodChange.bind(this));
    }

    handleMoodChange({ current }) {
        // We expect the mood object to be passed via a separate configuration or 
        // retrieved from a MoodFactory. Ideally the main.js coordinates this, 
        // providing the mood CONFIG to the engines.
        // But for now, let's assume 'current' is the mood name, and we'll need the config.
        // Refactoring: The payload should probably be the full mood config object.
    }

    /**
     * Apply mood visual settings
     * @param {object} moodConfig 
     */
    applyMood(moodConfig) {
        console.log(`[SceneManager] Applying mood: ${moodConfig.name}`);

        // Set CSS Variables for global colors
        DOMHelper.setCSSVar('--mood-bg-primary', moodConfig.colors.primary);
        DOMHelper.setCSSVar('--mood-bg-secondary', moodConfig.colors.secondary);
        DOMHelper.setCSSVar('--mood-accent', moodConfig.colors.accent);

        // Update lighting overlay
        this.lightingOverlay.style.background = moodConfig.lighting.overlayGradient;

        // Apply wall gradients if specified
        // (This could be expanded to individual walls if needed)
    }
}
