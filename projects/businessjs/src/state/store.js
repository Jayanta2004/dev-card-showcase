/**
 * Centralized State Management
 * Uses a subscriber pattern to notify UI of changes.
 */

const initialState = {
    // Meta
    version: '0.1.0',
    paused: true,
    gameSpeed: 1, // 1 = Normal, 2 = Fast, 0 = Paused

    // Time
    day: 1,
    tickCount: 0,

    // Business Health
    health: 100, // 0-100%

    // Finance
    cash: 50000, // Starting capital
    revenue: 0,
    expenses: 0,
    history: {
        cash: [],
        profit: []
    },

    // Market
    demand: 10, // 0-100 scale
    reputation: 1,

    // Product
    product: {
        version: 1,
        quality: 10, // 0-100
        features: 1,
        rdProgress: 0,
        rdInvestment: 0 // Daily cost
    },

    // Strategy
    policies: {
        active: []
    },

    // Employees
    employees: [],

    // Events
    activeEvents: [],
    eventLog: []
};

class Store {
    constructor() {
        // Deep copy initial state
        this.state = JSON.parse(JSON.stringify(initialState));
        this.listeners = new Set();
    }

    /**
     * Get a specific value from state
     * @param {string} key - Dot notation key path (optional)
     */
    get(key) {
        if (!key) return this.state;
        return key.split('.').reduce((obj, k) => obj && obj[k], this.state);
    }

    /**
     * Update state and notify listeners
     * @param {Object} partialState - Object to merge
     */
    update(partialState) {
        // Deep merge logic would go here, for now simple top-level merge
        // For nested updates, we usually want specific actions, but for this vanilla impl:
        Object.assign(this.state, partialState);
        this.notify();
    }

    /**
     * Set a specific nested value (mutates state directly for performance in game loops, then notifies)
     * @param {Function} mutator - Function that receives state and modifies it
     */
    mutate(mutator) {
        mutator(this.state);
        this.notify();
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.state));
    }

    // Actions
    addEventLog(event) {
        this.mutate(state => {
            state.eventLog.unshift(event);
            if (state.eventLog.length > 50) state.eventLog.pop();
        });
    }
}

export const store = new Store();
