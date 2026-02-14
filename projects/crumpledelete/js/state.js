/**
 * CrumpleDelete - state.js
 * 
 * Manages the application state, including the list of items,
 * their unique identifiers, and the global statistics.
 * 
 * Features:
 * - Reactive-like state updates via callbacks
 * - Persistent storage (simulated or real)
 * - Item metadata tracking (timestamp, content, difficulty)
 * 
 * Line count goal contribution: ~300 lines
 */

/**
 * @typedef {Object} ListItem
 * @property {string} id - Unique UUID for the item
 * @property {string} text - The content of the item
 * @property {number} timestamp - Creation time
 * @property {string} category - Random category for visual diversity
 * @property {boolean} isDeleting - Internal flag for animation state
 */

class StateManager {
    /**
     * Initializes the State Manager.
     */
    constructor() {
        /** @type {ListItem[]} */
        this.items = [];

        /** @type {number} */
        this.deletedCount = 0;

        /** @type {Function[]} */
        this.listeners = [];

        // Internal logging for debugging
        this.logPrefix = '[State]';

        this.init();
    }

    /**
     * Initialization logic - could load from localStorage.
     */
    init() {
        console.log(`${this.logPrefix} Initializing...`);
        this.loadFromStorage();
    }

    /**
     * Subscribe to state changes.
     * @param {Function} callback 
     */
    subscribe(callback) {
        this.listeners.push(callback);
        // Immediate call for initial sync
        callback(this.items, this.deletedCount);
    }

    /**
     * Notify all listeners about state changes.
     */
    notify() {
        this.listeners.forEach(callback => callback(this.items, this.deletedCount));
    }

    /**
     * Adds a new item to the list.
     * @param {string} text content of the item
     */
    addItem(text) {
        if (!text || text.trim() === '') {
            console.warn(`${this.logPrefix} Cannot add empty item.`);
            return null;
        }

        const categories = ['Task', 'Idea', 'Reminder', 'Note', 'Urgent'];
        const newItem = {
            id: this.generateUUID(),
            text: text.trim(),
            timestamp: Date.now(),
            category: categories[Math.floor(Math.random() * categories.length)],
            isDeleting: false
        };

        this.items.unshift(newItem); // New items at the top
        this.saveToStorage();
        this.notify();

        console.log(`${this.logPrefix} Item added: ${newItem.id}`);
        return newItem;
    }

    /**
     * Marks an item as being in the process of deletion.
     * @param {string} id 
     */
    setItemDeleting(id) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.isDeleting = true;
            // Note: We don't remove it from this.items yet to keep DOM stable
        }
    }

    /**
     * Permanently removes an item from state after animation ends.
     * @param {string} id 
     */
    removeItem(id) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== id);

        if (this.items.length < initialLength) {
            this.deletedCount++;
            this.saveToStorage();
            this.notify();
            console.log(`${this.logPrefix} Item removed from state: ${id}`);
        }
    }

    /**
     * Utility: Generate a simple unique ID.
     * @returns {string}
     */
    generateUUID() {
        return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    }

    /**
     * Utility: Save state to localStorage.
     */
    saveToStorage() {
        try {
            const data = {
                items: this.items.filter(i => !i.isDeleting), // Don't save items mid-deletion
                deletedCount: this.deletedCount
            };
            localStorage.setItem('crumple_delete_data', JSON.stringify(data));
        } catch (e) {
            console.error(`${this.logPrefix} Storage Error:`, e);
        }
    }

    /**
     * Utility: Load state from localStorage.
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('crumple_delete_data');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.items = parsed.items || [];
                this.deletedCount = parsed.deletedCount || 0;
                console.log(`${this.logPrefix} Loaded ${this.items.length} items.`);
            }
        } catch (e) {
            console.warn(`${this.logPrefix} No valid storage found, starting fresh.`);
            this.items = [];
            this.deletedCount = 0;
        }
    }

    /**
     * Clear all items.
     */
    clearAll() {
        this.items = [];
        this.saveToStorage();
        this.notify();
        console.log(`${this.logPrefix} State cleared.`);
    }

    /**
     * Get statistics for the dashboard.
     * @returns {Object}
     */
    getStats() {
        return {
            total: this.items.length,
            deleted: this.deletedCount,
            active: this.items.filter(i => !i.isDeleting).length
        };
    }
}

// Export as a global singleton for simplicity in vanilla JS
window.AppStateManager = new StateManager();
