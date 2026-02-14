/**
 * CrumpleDelete - utils.js
 * 
 * A collection of helper functions and utilities to assist with
 * string manipulation, date formatting, and logging.
 * 
 * Line count goal contribution: ~200 lines
 */

class Utils {
    /**
     * Formats a timestamp into a human-readable relative string.
     * @param {number} timestamp 
     * @returns {string}
     */
    static formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60000) return 'Just now';

        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        return new Date(timestamp).toLocaleDateString();
    }

    /**
     * Generates a random piece of inspiration/task content.
     * @returns {string}
     */
    static getRandomTask() {
        const tasks = [
            "Refactor the gravity engine",
            "Optimize pixel transforms",
            "Design new crumple keyframes",
            "Update the documentation",
            "Fix the layout shift glitch",
            "Implement tactile haptic feedback",
            "Review the performance stats",
            "Add motion blur to falling items",
            "Style the empty state",
            "Test browser compatibility",
            "Analyze the frame rate drops",
            "Clean up the global state",
            "Improve the shadow gradients",
            "Research fluid dynamics",
            "Optimize the garbage collector"
        ];
        return tasks[Math.floor(Math.random() * tasks.length)];
    }

    /**
     * Escapes HTML to prevent XSS.
     * @param {string} str 
     * @returns {string}
     */
    static escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Advanced logger with colors for better debugging.
     */
    static log(message, type = 'info') {
        const colors = {
            info: '#38bdf8',
            warn: '#fbbf24',
            error: '#f87171',
            success: '#34d399'
        };

        console.log(
            `%c[CrumpleDelete] %c${message}`,
            `color: ${colors[type]}; font-weight: bold;`,
            'color: inherit;'
        );
    }

    /**
     * Smoothly scrolls to the top of the list.
     */
    static scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Debounce function for performance optimization.
     */
    static debounce(func, wait) {
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
}

window.Utils = Utils;
