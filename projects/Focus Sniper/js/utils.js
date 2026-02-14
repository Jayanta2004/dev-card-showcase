// ==================== UTILITY FUNCTIONS ====================

const Utils = {
    /**
     * Generate a random number between min and max
     */
    random: (min, max) => Math.random() * (max - min) + min,

    /**
     * Generate a random integer between min and max (inclusive)
     */
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    /**
     * Get random item from array
     */
    randomChoice: (array) => array[Math.floor(Math.random() * array.length)],

    /**
     * Clamp a value between min and max
     */
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),

    /**
     * Linear interpolation
     */
    lerp: (start, end, t) => start + (end - start) * t,

    /**
     * Map a value from one range to another
     */
    map: (value, inMin, inMax, outMin, outMax) => {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    /**
     * Calculate distance between two points
     */
    distance: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Calculate angle between two points (in radians)
     */
    angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),

    /**
     * Check if point is inside circle
     */
    isInsideCircle: (px, py, cx, cy, radius) => {
        return Utils.distance(px, py, cx, cy) <= radius;
    },

    /**
     * Check if two circles are overlapping
     */
    circlesOverlap: (x1, y1, r1, x2, y2, r2) => {
        return Utils.distance(x1, y1, x2, y2) < (r1 + r2);
    },

    /**
     * Get random position within bounds
     */
    randomPosition: (minX, minY, maxX, maxY) => ({
        x: Utils.random(minX, maxX),
        y: Utils.random(minY, maxY)
    }),

    /**
     * Get random color
     */
    randomColor: () => {
        const colors = ['#00ff00', '#00ffff', '#ff0066', '#ffaa00', '#ff00ff', '#00ff99'];
        return Utils.randomChoice(colors);
    },

    /**
     * Format number with commas
     */
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    /**
     * Format time in MM:SS format
     */
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Debounce function
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
    },

    /**
     * Throttle function
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Shuffle array
     */
    shuffle: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * Calculate percentage
     */
    percentage: (value, total) => {
        if (total === 0) return 0;
        return (value / total) * 100;
    },

    /**
     * Ease in/out cubic function
     */
    easeInOutCubic: (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    /**
     * Ease out bounce function
     */
    easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },

    /**
     * Create UUID
     */
    uuid: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Deep clone object
     */
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Check if element is visible in viewport
     */
    isElementVisible: (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Get mouse position relative to element
     */
    getMousePosition: (event, element) => {
        const rect = element.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    },

    /**
     * Vibrate device (if supported)
     */
    vibrate: (duration = 50) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    },

    /**
     * Save to localStorage
     */
    saveToStorage: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    },

    /**
     * Load from localStorage
     */
    loadFromStorage: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return defaultValue;
        }
    },

    /**
     * Remove from localStorage
     */
    removeFromStorage: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Failed to remove from localStorage:', e);
            return false;
        }
    },

    /**
     * Generate random fake message
     */
    randomMessage: () => {
        const messages = [
            'Your computer has been compromised!',
            'Click here to claim your prize!',
            'You have 3 unread messages',
            'Update required: Click to install',
            'Your account will be suspended',
            'Congratulations! You won!',
            'Warning: Virus detected',
            'Accept cookies to continue',
            'Your free trial has expired',
            'Limited time offer: 90% off!',
            'Your password has been changed',
            'New friend request from Unknown',
            'System update in progress...',
            'Download failed - Retry?',
            'Your session is about to expire',
            'Enable notifications?',
            'Subscribe to our newsletter',
            'Your payment method declined',
            'Security alert: New login detected',
            'You have pending notifications'
        ];
        return Utils.randomChoice(messages);
    },

    /**
     * Generate random fake title
     */
    randomTitle: () => {
        const titles = [
            'System Alert',
            'Security Warning',
            'Important Update',
            'Action Required',
            'Critical Notice',
            'Special Offer',
            'Notification',
            'Windows Defender',
            'Chrome Update',
            'Adobe Flash Player',
            'Java Update',
            'System32',
            'Task Manager',
            'Control Panel',
            'Settings',
            'Facebook',
            'Instagram',
            'Twitter',
            'Email',
            'Messages'
        ];
        return Utils.randomChoice(titles);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
