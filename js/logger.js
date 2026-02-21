'use strict';

const Logger = {
    isDevelopment: function() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('dev.');
    },

    debug: function(message, ...args) {
        if (this.isDevelopment()) {
            console.log('[DEBUG]', message, ...args);
        }
    },

    info: function(message, ...args) {
        if (this.isDevelopment()) {
            console.info('[INFO]', message, ...args);
        }
    },

    warn: function(message, ...args) {
        console.warn('[WARN]', message, ...args);
    },

    error: function(message, ...args) {
        console.error('[ERROR]', message, ...args);
    },

    group: function(label) {
        if (this.isDevelopment()) {
            console.group(label);
        }
    },

    groupEnd: function() {
        if (this.isDevelopment()) {
            console.groupEnd();
        }
    },

    time: function(label) {
        if (this.isDevelopment()) {
            console.time(label);
        }
    },

    timeEnd: function(label) {
        if (this.isDevelopment()) {
            console.timeEnd(label);
        }
    }
};

if (typeof window !== 'undefined') {
    window.Logger = Logger;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
