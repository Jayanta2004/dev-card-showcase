/**
 * Utility Functions for PulsePlan
 */
const Utils = {
    /**
     * Generate a unique ID for tasks
     * @returns {string} Unique ID
     */
    generateId: () => {
        return 'task-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    /**
     * Format time to HH:MM format
     * @param {Date} date 
     * @returns {string}
     */
    formatTime: (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    },

    /**
     * Get current date string formatted "Mon DD"
     * @returns {string}
     */
    getCurrentDateStr: () => {
        const options = { month: 'short', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    },

    /**
     * Convert minutes to "1h 30m" format
     * @param {number} minutes 
     * @returns {string}
     */
    formatDuration: (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    },

    /**
     * Map numerical energy (0-100) to categorical (low, medium, high)
     * @param {number} value 
     * @returns {string} 'low', 'medium', 'high'
     */
    getEnergyCategory: (value) => {
        if (value >= 70) return 'high';
        if (value >= 40) return 'medium';
        return 'low';
    },

    /**
     * Get friendly text for energy state
     * @param {number} value 
     * @returns {string}
     */
    getEnergyStateText: (value) => {
        if (value >= 90) return 'Peak Flow';
        if (value >= 70) return 'High Energy';
        if (value >= 50) return 'Balanced';
        if (value >= 30) return 'Low Energy';
        return 'Recharge Needed';
    },

    /**
     * Ease function for smooth animations (cubic-bezier equivalent)
     * @param {number} t 0-1
     * @returns {number}
     */
    easeOutCubic: (t) => {
        return 1 - Math.pow(1 - t, 3);
    },
    
    /**
     * Debounce function for inputs
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Make available globally
window.Utils = Utils;
