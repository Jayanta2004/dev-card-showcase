/**
 * StateManager.js
 * Manages the global state of the application (current mood, settings).
 */
export default class StateManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.state = {
            currentMood: null,
            previousMood: null,
            isAudioEnabled: false // Future proofing
        };
    }

    /**
     * Set the current mood and emit change event
     * @param {string} moodName 
     */
    setMood(moodName) {
        if (this.state.currentMood === moodName) return;

        this.state.previousMood = this.state.currentMood;
        this.state.currentMood = moodName;

        console.log(`[StateManager] Mood changed: ${this.state.previousMood} -> ${moodName}`);

        this.eventBus.emit('moodChange', {
            current: this.state.currentMood,
            previous: this.state.previousMood
        });
    }

    getCurrentMood() {
        return this.state.currentMood;
    }
}
