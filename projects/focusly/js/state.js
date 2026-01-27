/**
 * js/state.js
 * Central State Management
 */

class StateManager {
    constructor() {
        this.state = {
            view: 'setup', // setup, breathing, session, summary

            // Configuration
            config: {
                durationMinutes: 20,
                mode: 'training', // normal, training
                settings: {
                    sound: true,
                    strict: false
                }
            },

            // Session Data
            session: {
                startTime: null,
                active: false,
                paused: false,
                remainingSeconds: 1200,
                focusScore: 100,
                stabilityHistory: [], // Array of numbers 0-100
                events: [] // Array of {time, type, detail}
            },

            // User History
            user: {
                streak: 0,
                totalSessions: 0,
                lastSessionDate: null
            }
        };

        this.listeners = {};
    }

    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }

    emit(key, data) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(cb => cb(data));
        }
    }

    update(path, value) {
        // Simple dot notation update: 'session.remainingSeconds'
        const keys = path.split('.');
        let obj = this.state;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }

        const lastKey = keys[keys.length - 1];
        const oldValue = obj[lastKey];

        if (oldValue !== value) {
            obj[lastKey] = value;
            this.emit(path, value);
            this.emit('stateChanged', { path, value, oldValue });
        }
    }

    get(path) {
        const keys = path.split('.');
        let obj = this.state;
        for (let key of keys) {
            if (obj === undefined) return undefined;
            obj = obj[key];
        }
        return obj;
    }

    // specific helpers
    setFocusScore(score) {
        if (score < 0) score = 0;
        if (score > 100) score = 100;

        // Push to history every ~5 seconds handled by session writer usually, 
        // but we settle state immediately
        this.update('session.focusScore', score);
    }

    logEvent(type, detail = null) {
        const evt = {
            timestamp: Date.now(),
            timeOffset: this.state.config.durationMinutes * 60 - this.state.session.remainingSeconds,
            type,
            detail
        };
        this.state.session.events.push(evt);
        this.emit('event', evt);
    }
}

class StorageManager {
    constructor() {
        this.KEY = 'focusly_data_v1';
        // storage init is called explicitly after state is ready
    }

    init() {
        const data = localStorage.getItem(this.KEY);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.syncToState(parsed);
            } catch (e) {
                console.error('Save file corrupted, resetting.');
                this.save();
            }
        } else {
            this.save();
        }
    }

    syncToState(data) {
        if (data.user) {
            window.appState.state.user = data.user;
            // We can't emit yet if we are too early, but usually fine
        }
        if (data.settings) {
            window.appState.state.config.settings = data.settings;
        }
    }

    save() {
        const data = {
            user: window.appState.state.user,
            settings: window.appState.state.config.settings,
            lastSaved: Date.now()
        };
        localStorage.setItem(this.KEY, JSON.stringify(data));
    }

    recordSession(score) {
        const user = window.appState.state.user;
        const now = new Date();
        const userDate = user.lastSessionDate ? new Date(user.lastSessionDate) : null;

        // Streak Logic: consecutive days
        if (userDate) {
            const oneDay = 24 * 60 * 60 * 1000;
            // Floor dates to ignore time
            const lastDate = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate());
            const currDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const diffDays = Math.round(Math.abs((currDate - lastDate) / oneDay));

            if (diffDays === 1) {
                user.streak++;
            } else if (diffDays > 1) {
                user.streak = 1;
            }
            // if 0, same day, do nothing
        } else {
            user.streak = 1;
        }

        user.totalSessions++;
        user.lastSessionDate = now.toISOString();

        this.save();
        return user.streak;
    }
}

// Global instances
window.appState = new StateManager();
window.appStorage = new StorageManager();
window.appStorage.init(); // Initialize storage immediately

