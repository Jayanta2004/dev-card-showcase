const Storage = {
    SESSION_KEY: 'mindtrace_session',
    PATTERNS_KEY: 'mindtrace_patterns',

    saveSession: function(data) {
        try {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save session:', e);
        }
    },

    loadSession: function() {
        try {
            const data = sessionStorage.getItem(this.SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load session:', e);
            return null;
        }
    },

    clearSession: function() {
        try {
            sessionStorage.removeItem(this.SESSION_KEY);
        } catch (e) {
            console.error('Failed to clear session:', e);
        }
    },

    savePatterns: function(patterns) {
        try {
            localStorage.setItem(this.PATTERNS_KEY, JSON.stringify(patterns));
        } catch (e) {
            console.error('Failed to save patterns:', e);
        }
    },

    loadPatterns: function() {
        try {
            const data = localStorage.getItem(this.PATTERNS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Failed to load patterns:', e);
            return {};
        }
    },

    mergePatterns: function(existingPatterns, newPatterns) {
        const merged = { ...existingPatterns };
        for (const [key, value] of Object.entries(newPatterns)) {
            if (merged[key]) {
                merged[key].count += value.count;
                merged[key].lastSeen = value.lastSeen;
            } else {
                merged[key] = { ...value };
            }
        }
        return merged;
    }
};
