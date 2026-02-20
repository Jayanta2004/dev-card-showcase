// State Management Module
// Handles centralized state, persistence, and synchronization

class StateManager {
    constructor() {
        this.state = this.getDefaultState();
        this.listeners = new Set();
        this.storageKey = 'parasitecontrol_state';
        this.loadFromStorage();
    }

    getDefaultState() {
        return {
            background: {
                color: '#1a1a2e',
                gradient: null,
                pattern: null
            },
            text: {
                content: 'ParasiteControl',
                size: 64,
                color: '#ffffff',
                position: 'center',
                glow: false
            },
            layout: {
                mode: 'single',
                alignment: 'center'
            },
            effects: {
                blur: 0,
                brightness: 100,
                rotation: false,
                scale: false
            },
            connection: {
                status: 'disconnected',
                lastUpdate: null
            }
        };
    }

    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    setState(updates) {
        const oldState = this.getState();
        this.state = this.deepMerge(this.state, updates);
        this.state.connection.lastUpdate = Date.now();
        this.saveToStorage();
        this.notifyListeners(oldState, this.state);
        return this.state;
    }

    deepMerge(target, source) {
        const output = { ...target };
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    output[key] = source[key];
                }
            });
        }
        
        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notifyListeners(oldState, newState) {
        this.listeners.forEach(listener => {
            try {
                listener(newState, oldState);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save state to storage:', error);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.state = this.deepMerge(this.getDefaultState(), parsed);
                this.state.connection.status = 'disconnected';
            }
        } catch (error) {
            console.warn('Failed to load state from storage:', error);
        }
    }

    clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to clear storage:', error);
        }
    }

    reset() {
        this.state = this.getDefaultState();
        this.saveToStorage();
        this.notifyListeners({}, this.state);
    }

    getDiff(oldState, newState) {
        const diff = {};
        
        const findDifferences = (old, current, path = '') => {
            Object.keys(current).forEach(key => {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (this.isObject(current[key]) && this.isObject(old[key])) {
                    findDifferences(old[key], current[key], currentPath);
                } else if (JSON.stringify(old[key]) !== JSON.stringify(current[key])) {
                    this.setNestedValue(diff, currentPath, current[key]);
                }
            });
        };
        
        findDifferences(oldState, newState);
        return diff;
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    exportState() {
        return JSON.stringify(this.state, null, 2);
    }

    importState(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.state = this.deepMerge(this.getDefaultState(), imported);
            this.saveToStorage();
            this.notifyListeners({}, this.state);
            return true;
        } catch (error) {
            console.error('Failed to import state:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StateManager = StateManager;
}
