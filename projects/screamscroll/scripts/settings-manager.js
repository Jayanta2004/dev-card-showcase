/**
 * ScreamScroll - Settings Manager
 * 
 * Handles persistence of user configurations and calibration data
 * using the Browser's LocalStorage API.
 */

class SettingsManager {
    constructor() {
        this.STORAGE_KEY = 'screamscroll_settings';
        this.defaults = {
            sensitivity: 0.25,
            particlesEnabled: true,
            echoEnabled: true,
            visualizerQuality: 'high',
            glitchEnabled: true,
            theme: 'void'
        };
        this.current = this.load();
    }

    /**
     * Load settings from localStorage or return defaults
     */
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...this.defaults, ...parsed };
            }
        } catch (e) {
            console.warn("Failed to load settings from localStorage:", e);
        }
        return { ...this.defaults };
    }

    /**
     * Save current settings to localStorage
     */
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.current));
            console.log("Settings saved successfully.");
        } catch (e) {
            console.error("Failed to save settings to localStorage:", e);
        }
    }

    /**
     * Update a specific setting value
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     */
    set(key, value) {
        if (key in this.current) {
            this.current[key] = value;
            this.save();
            this.applySetting(key, value);
        }
    }

    /**
     * Get a specific setting value
     * @param {string} key - Setting key
     */
    get(key) {
        return this.current[key];
    }

    /**
     * Apply settings to the application state
     */
    applyAll() {
        Object.keys(this.current).forEach(key => {
            this.applySetting(key, this.current[key]);
        });
    }

    /**
     * Direct logic for applying a single setting change
     */
    applySetting(key, value) {
        switch (key) {
            case 'sensitivity':
                if (window.AudioProcessor) {
                    const threshold = 0.5 - value;
                    window.AudioProcessor.setThreshold(threshold);
                }
                break;
            case 'glitchEnabled':
                if (!value) {
                    document.body.classList.remove('glitch-active');
                }
                break;
            // Additional logic for other settings can be added here
        }
    }

    /**
     * Reset settings to factory defaults
     */
    reset() {
        this.current = { ...this.defaults };
        this.save();
        this.applyAll();
    }
}

// Export as a singleton
window.SettingsManager = new SettingsManager();
