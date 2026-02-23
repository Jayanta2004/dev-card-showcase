/**
 * DataManager.js
 * Handles persistence of interaction sessions using localStorage.
 * Enables the "Diff" functionality between sessions.
 */

export class DataManager {
    static STORAGE_KEY = 'diff_mirror_session';
    static MAX_SAMPLES = 500; // Limit samples to prevent storage bloat

    constructor() {
        this.currentSession = this._createEmptySession();
        this.previousSession = this.loadPreviousSession();
    }

    /**
     * Creates a fresh session object structure.
     */
    _createEmptySession() {
        return {
            timestamp: Date.now(),
            samples: [], // Array of {x, y, t}
            clicks: [],  // Array of {x, y, t}
            metadata: {
                screenSize: {
                    w: window.innerWidth,
                    h: window.innerHeight
                },
                totalDistance: 0,
                activeTime: 0
            }
        };
    }

    /**
     * Records a movement sample.
     * Values are normalized (0-1) based on screen size for cross-session comparison.
     */
    addSample(x, y) {
        const normalizedX = x / window.innerWidth;
        const normalizedY = y / window.innerHeight;

        if (this.currentSession.samples.length < DataManager.MAX_SAMPLES) {
            this.currentSession.samples.push({
                x: normalizedX,
                y: normalizedY,
                t: Date.now()
            });
        }
    }

    /**
     * Records a click interaction.
     */
    addClick(x, y) {
        const normalizedX = x / window.innerWidth;
        const normalizedY = y / window.innerHeight;

        this.currentSession.clicks.push({
            x: normalizedX,
            y: normalizedY,
            t: Date.now()
        });
    }

    /**
     * Saves the current session to localStorage.
     * This will become the "Previous Session" for the next load.
     */
    save() {
        try {
            const data = JSON.stringify(this.currentSession);
            localStorage.setItem(DataManager.STORAGE_KEY, data);
            console.log('DiffMirror: Session saved.');
        } catch (e) {
            console.warn('DiffMirror: Failed to save session.', e);
        }
    }

    /**
     * Loads the session from previous visit.
     */
    loadPreviousSession() {
        try {
            const data = localStorage.getItem(DataManager.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('DiffMirror: Failed to load previous session.');
            return null;
        }
    }

    /**
     * Clears all session data.
     */
    clear() {
        localStorage.removeItem(DataManager.STORAGE_KEY);
        this.previousSession = null;
        this.currentSession = this._createEmptySession();
    }

    /**
     * Determines if there is a valid previous session to compare against.
     */
    hasPreviousData() {
        return this.previousSession !== null && this.previousSession.samples.length > 0;
    }
}
