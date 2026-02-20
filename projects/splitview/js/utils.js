// Utility functions for the SplitView application

const Utils = {
    /**
     * Format time in MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    /**
     * Calculate distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Distance in pixels
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Map a value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    /**
     * Debounce a function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
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
     * Throttle a function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Generate a random ID
     * @returns {string} Random ID
     */
    generateId() {
        return `splitview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Check if browser supports required features
     * @returns {Object} Support status
     */
    checkBrowserSupport() {
        return {
            popup: typeof window.open === 'function',
            canvas: !!document.createElement('canvas').getContext,
            localStorage: typeof Storage !== 'undefined',
            postMessage: typeof window.postMessage === 'function'
        };
    },

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type (info, success, warning, error)
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');

        toastIcon.textContent = CONFIG.TOAST.types[type] || CONFIG.TOAST.types.info;
        toastMessage.textContent = message;

        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, CONFIG.TOAST.duration);
    },

    /**
     * Load image from file or URL
     * @param {File|string} source - Image file or URL
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));

            if (source instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(source);
            } else {
                img.src = source;
            }
        });
    },

    /**
     * Generate sample image on canvas
     * @param {string} type - Sample type (landscape, abstract, geometric)
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {HTMLCanvasElement} Generated canvas
     */
    generateSampleImage(type, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const sample = CONFIG.SAMPLES[type];

        if (sample.type === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            sample.colors.forEach((color, i) => {
                gradient.addColorStop(i / (sample.colors.length - 1), color);
            });
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (sample.type === 'radial') {
            const gradient = ctx.createRadialGradient(
                width * 0.3, height * 0.3, 0,
                width * 0.5, height * 0.5, width * 0.7
            );
            sample.colors.forEach((color, i) => {
                gradient.addColorStop(i / (sample.colors.length - 1), color);
            });
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (sample.type === 'pattern') {
            const stripeWidth = 40;
            for (let i = 0; i < width + height; i += stripeWidth * 2) {
                ctx.fillStyle = sample.colors[0];
                ctx.fillRect(i - height, 0, stripeWidth, height);
                ctx.fillRect(0, i - width, width, stripeWidth);

                ctx.fillStyle = sample.colors[1];
                ctx.fillRect(i - height + stripeWidth, 0, stripeWidth, height);
                ctx.fillRect(0, i - width + stripeWidth, width, stripeWidth);
            }
        }

        return canvas;
    },

    /**
     * Calculate optimal image dimensions
     * @param {number} width - Original width
     * @param {number} height - Original height
     * @returns {Object} Optimal dimensions
     */
    calculateOptimalDimensions(width, height) {
        const maxWidth = CONFIG.IMAGE.maxWidth;
        const maxHeight = CONFIG.IMAGE.maxHeight;

        let newWidth = width;
        let newHeight = height;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            newWidth = Math.floor(width * ratio);
            newHeight = Math.floor(height * ratio);
        }

        // Ensure even dimensions for clean splitting
        newWidth = Math.floor(newWidth / 2) * 2;
        newHeight = Math.floor(newHeight / 2) * 2;

        return { width: newWidth, height: newHeight };
    },

    /**
     * Get screen center position
     * @returns {Object} Center coordinates
     */
    getScreenCenter() {
        return {
            x: (window.screen.width - CONFIG.WINDOW.width) / 2,
            y: (window.screen.height - CONFIG.WINDOW.height) / 2
        };
    },

    /**
     * Calculate window positions for quadrants
     * @param {number} pieceWidth - Width of each piece
     * @param {number} pieceHeight - Height of each piece
     * @returns {Array} Array of position objects
     */
    calculateWindowPositions(pieceWidth, pieceHeight) {
        const center = this.getScreenCenter();
        const spacing = 20; // Gap between windows

        return [
            { x: center.x - pieceWidth - spacing / 2, y: center.y - pieceHeight - spacing / 2 }, // top-left
            { x: center.x + spacing / 2, y: center.y - pieceHeight - spacing / 2 }, // top-right
            { x: center.x - pieceWidth - spacing / 2, y: center.y + spacing / 2 }, // bottom-left
            { x: center.x + spacing / 2, y: center.y + spacing / 2 }  // bottom-right
        ];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
