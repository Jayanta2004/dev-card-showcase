// js/engine/stateManager.js
export class StateManager {
    constructor() {
        this.STORAGE_KEY = 'paradoxState';
        this.currentState = {
            timeline: [], // Array of node IDs resolved
            choices: {},  // Map of nodeId -> choiceId made
            flags: {},    // Global story flags modified by choices
            paradoxCount: 0
        };
        this.history = []; // Array of previous states to allow undo
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentState));
    }

    initDefaultState() {
        this.currentState = {
            timeline: ['start_node'],
            choices: {},
            flags: {
                isAwake: true,
                hasLookedBack: false,
                realityIntegrity: 100
            },
            paradoxCount: 0
        };
        this.saveState();
        this.notifyListeners();
    }

    hasSavedState() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }

    loadState() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.currentState = JSON.parse(saved);
                console.log("Timeline state loaded from memory.", this.currentState);
                this.notifyListeners();
            }
        } catch (e) {
            console.error("Timeline corrupted. Reality resetting.", e);
            this.initDefaultState();
        }
    }

    saveState() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentState));
    }

    // The core paradox function: records a choice and its effects
    makeChoice(nodeId, choiceId, effects) {
        // Save history state
        this.history.push(JSON.parse(JSON.stringify(this.currentState)));

        // Update current state
        this.currentState.choices[nodeId] = choiceId;

        if (!this.currentState.timeline.includes(nodeId)) {
            this.currentState.timeline.push(nodeId);
        }

        // Apply effects
        if (effects) {
            this.applyEffects(effects);
        }

        this.saveState();
        this.notifyListeners();
    }

    applyEffects(effects) {
        if (effects.setFlags) {
            Object.assign(this.currentState.flags, effects.setFlags);
        }
        if (effects.integrity) {
            this.currentState.flags.realityIntegrity += effects.integrity;
            // Cap integrity
            if (this.currentState.flags.realityIntegrity > 100) this.currentState.flags.realityIntegrity = 100;
            if (this.currentState.flags.realityIntegrity < 0) this.currentState.flags.realityIntegrity = 0;
        }
    }

    getState() {
        return this.currentState;
    }

    getFlag(flagName) {
        return this.currentState.flags[flagName];
    }

    // Check if a paradox requires rewriting history
    triggerParadox(nodeIdToRewrite) {
        this.currentState.paradoxCount++;
        // Logic to remove future timeline nodes if we rewrote past
        const index = this.currentState.timeline.indexOf(nodeIdToRewrite);
        if (index > -1) {
            // keep up to the rewritten node, discard the future
            this.currentState.timeline = this.currentState.timeline.slice(0, index + 1);
        }

        // Optional integrity loss
        this.currentState.flags.realityIntegrity -= 15;
        this.saveState();
        this.notifyListeners();
    }

    clearState() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.initDefaultState();
    }
}
