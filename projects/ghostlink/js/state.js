/**
 * GhostLink State Management
 * Handles LocalStorage persistence, event emission, and the core identity of the peer.
 */
(function(global) {
    'use strict';

    // Constants for storage keys
    const STORAGE_PREFIX = 'GHOSTLINK_';
    const EVENT_PREFIX = 'ghostlink:';
    
    // Configuration
    const CONFIG = {
        BROADCAST_CHANNEL: 'ghostlink_bus',
        STORAGE_VERSION: '1.0.0'
    };

    class StateManager {
        constructor() {
            this.identity = this._loadOrGenerateIdentity();
            this.bus = new BroadcastChannel(CONFIG.BROADCAST_CHANNEL);
            this.listeners = new Map();
            this.isOffline = false;

            // Bind methods
            this.handleStorageEvent = this.handleStorageEvent.bind(this);
            this.handleBroadcast = this.handleBroadcast.bind(this);
            
            // Initialize listeners
            window.addEventListener('storage', this.handleStorageEvent);
            this.bus.onmessage = this.handleBroadcast;

            console.log(`[State] Initialized as ${this.identity.name} (${this.identity.id})`);
        }

        /**
         * Generate or retrieve the peer identity
         */
        _loadOrGenerateIdentity() {
            // We use sessionStorage for identity so a refresh keeps the ID, 
            // but a new tab gets a new ID.
            const stored = sessionStorage.getItem(STORAGE_PREFIX + 'IDENTITY');
            
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error('[State] Failed to parse identity, regenerating.');
                }
            }

            const newIdentity = {
                id: this._generateUUID(),
                name: this._generateCoolName(),
                color: this._generateNeonColor(),
                created: Date.now()
            };

            sessionStorage.setItem(STORAGE_PREFIX + 'IDENTITY', JSON.stringify(newIdentity));
            return newIdentity;
        }

        /**
         * Simple UUID generator
         */
        _generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        /**
         * Generate a cyberpunk/hacker style name
         */
        _generateCoolName() {
            const prefixes = ['Ghost', 'Shadow', 'Neon', 'Cyber', 'Null', 'Void', 'Flux', 'Zero', 'Echo', 'Binary'];
            const suffixes = ['Runner', 'Stalker', 'Link', 'Node', 'Surfer', 'Glitch', 'Phantom', 'Daemon', 'Protocol', 'Vector'];
            const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
            return `${rand(prefixes)}_${rand(suffixes)}_${Math.floor(Math.random() * 99)}`;
        }

        /**
         * Generate a neon color for UI
         */
        _generateNeonColor() {
            const h = Math.floor(Math.random() * 360);
            return `hsl(${h}, 100%, 65%)`;
        }

        /**
         * Public API to get current Peer Identity
         */
        getIdentity() {
            return this.identity;
        }

        /**
         * Set offline mode simulation
         */
        setOffline(status) {
            this.isOffline = status;
            this.emit('networkStatsChange', { online: !status });
        }

        /**
         * Check if currently simulating offline
         */
        isSimulatedOffline() {
            return this.isOffline;
        }

        /**
         * Save data to global storage (simulating network persistence)
         */
        persist(key, data) {
            const fullKey = STORAGE_PREFIX + key;
            const payload = JSON.stringify({
                data: data,
                timestamp: Date.now(),
                source: this.identity.id
            });
            
            localStorage.setItem(fullKey, payload);
            
            // Should also notify via BroadcastChannel for immediate local updates if needed
            // But 'storage' event covers other tabs.
        }

        /**
         * Read data from global storage
         */
        retrieve(key) {
            const fullKey = STORAGE_PREFIX + key;
            const item = localStorage.getItem(fullKey);
            if (!item) return null;
            
            try {
                return JSON.parse(item);
            } catch (e) {
                return null;
            }
        }

        /**
         * Remove data from storage
         */
        remove(key) {
            localStorage.removeItem(STORAGE_PREFIX + key);
        }

        /**
         * Retrieve all keys matching a pattern (useful for finding peers/messages)
         */
        scan(pattern) {
            const results = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(STORAGE_PREFIX) && key.includes(pattern)) {
                    // Strip prefix for clean key return
                    const cleanKey = key.replace(STORAGE_PREFIX, '');
                    results.push({
                        key: cleanKey,
                        value: this.retrieve(cleanKey)
                    });
                }
            }
            return results;
        }

        /**
         * Subscribe to internal events
         */
        on(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        }

        /**
         * Emit internal event
         */
        emit(event, payload) {
            if (this.listeners.has(event)) {
                this.listeners.get(event).forEach(cb => cb(payload));
            }
        }

        /**
         * Broadcaster for direct IPC between tabs
         */
        broadcast(type, payload) {
            if (this.isOffline) return; // Can't broadcast if offline
            
            this.bus.postMessage({
                type: type,
                payload: payload,
                sender: this.identity.id
            });
        }

        handleStorageEvent(e) {
            // We only care about our app's keys
            if (!e.key || !e.key.startsWith(STORAGE_PREFIX)) return;

            const cleanKey = e.key.replace(STORAGE_PREFIX, '');
            let parsedNew = null;
            let parsedOld = null;

            try { parsedNew = e.newValue ? JSON.parse(e.newValue) : null; } catch(err) {}
            try { parsedOld = e.oldValue ? JSON.parse(e.oldValue) : null; } catch(err) {}

            this.emit('storageUpdate', {
                key: cleanKey,
                newValue: parsedNew,
                oldValue: parsedOld,
                url: e.url
            });
        }

        handleBroadcast(e) {
            if (this.isOffline) return; // Simulated network partition
            
            const data = e.data;
            if (data.sender === this.identity.id) return; // Ignore self

            this.emit('broadcastMessage', {
                type: data.type,
                payload: data.payload,
                sender: data.sender
            });
        }
        
        /**
         * Wipe all data for this app (Debug utility)
         */
        hardReset() {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                if (localStorage.key(i).startsWith(STORAGE_PREFIX)) {
                    keysToRemove.push(localStorage.key(i));
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            console.warn('[State] System Purged');
            window.location.reload();
        }
    }

    // Export singleton
    global.GhostState = new StateManager();

})(window);
