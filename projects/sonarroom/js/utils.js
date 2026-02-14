/**
 * SonarRoom - Utility Functions
 * Helper functions for math, timing, and common operations
 */

const Utils = {
    // ============================================
    // Mathematical Utilities
    // ============================================

    /**
     * Linear interpolation between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
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
     * Map a value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    mapRange(value, inMin, inMax, outMin, outMax) {
        const normalized = (value - inMin) / (inMax - inMin);
        return outMin + normalized * (outMax - outMin);
    },

    /**
     * Normalize a value to 0-1 range
     * @param {number} value - Value to normalize
     * @param {number} min - Range minimum
     * @param {number} max - Range maximum
     * @returns {number} Normalized value (0-1)
     */
    normalize(value, min, max) {
        return this.clamp((value - min) / (max - min), 0, 1);
    },

    /**
     * Calculate Euclidean distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Distance in pixels
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Apply exponential easing to a value
     * @param {number} t - Input value (0-1)
     * @param {number} exponent - Exponent for curve
     * @returns {number} Eased value
     */
    exponentialEase(t, exponent = 2) {
        return Math.pow(t, exponent);
    },

    /**
     * Inverse exponential easing (for distance-based effects)
     * @param {number} t - Input value (0-1)
     * @param {number} exponent - Exponent for curve
     * @returns {number} Eased value
     */
    inverseExponentialEase(t, exponent = 2) {
        return 1 - Math.pow(1 - t, exponent);
    },

    /**
     * Smooth step interpolation (ease in-out)
     * @param {number} t - Input value (0-1)
     * @returns {number} Smoothed value
     */
    smoothStep(t) {
        return t * t * (3 - 2 * t);
    },

    /**
     * Smoother step interpolation (more gradual)
     * @param {number} t - Input value (0-1)
     * @returns {number} Smoothed value
     */
    smootherStep(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    },

    // ============================================
    // Random Number Generation
    // ============================================

    /**
     * Generate random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Generate random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Generate random position within bounds
     * @param {number} minX - Minimum X
     * @param {number} maxX - Maximum X
     * @param {number} minY - Minimum Y
     * @param {number} maxY - Maximum Y
     * @returns {Object} {x, y} position
     */
    randomPosition(minX, maxX, minY, maxY) {
        return {
            x: this.random(minX, maxX),
            y: this.random(minY, maxY)
        };
    },

    /**
     * Random boolean with optional probability
     * @param {number} probability - Probability of true (0-1)
     * @returns {boolean} Random boolean
     */
    randomBool(probability = 0.5) {
        return Math.random() < probability;
    },

    // ============================================
    // Timing Utilities
    // ============================================

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} delay - Minimum delay between calls (ms)
     * @returns {Function} Throttled function
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay before execution (ms)
     * @returns {Function} Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Create a simple timer
     * @returns {Object} Timer object with start, stop, elapsed methods
     */
    createTimer() {
        let startTime = null;
        let elapsed = 0;
        let running = false;

        return {
            start() {
                if (!running) {
                    startTime = Date.now() - elapsed;
                    running = true;
                }
            },
            stop() {
                if (running) {
                    elapsed = Date.now() - startTime;
                    running = false;
                }
            },
            reset() {
                startTime = null;
                elapsed = 0;
                running = false;
            },
            getElapsed() {
                if (running) {
                    return Date.now() - startTime;
                }
                return elapsed;
            },
            isRunning() {
                return running;
            }
        };
    },

    // ============================================
    // DOM Utilities
    // ============================================

    /**
     * Get element by ID with error handling
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} Element or null
     */
    getElement(id) {
        const element = document.getElementById(id);
        if (!element && CONFIG.debug.enableLogging) {
            console.warn(`Element not found: ${id}`);
        }
        return element;
    },

    /**
     * Add class to element
     * @param {HTMLElement} element - Target element
     * @param {string} className - Class name to add
     */
    addClass(element, className) {
        if (element && !element.classList.contains(className)) {
            element.classList.add(className);
        }
    },

    /**
     * Remove class from element
     * @param {HTMLElement} element - Target element
     * @param {string} className - Class name to remove
     */
    removeClass(element, className) {
        if (element && element.classList.contains(className)) {
            element.classList.remove(className);
        }
    },

    /**
     * Toggle class on element
     * @param {HTMLElement} element - Target element
     * @param {string} className - Class name to toggle
     */
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },

    /**
     * Set element style
     * @param {HTMLElement} element - Target element
     * @param {Object} styles - Style object
     */
    setStyles(element, styles) {
        if (element) {
            Object.assign(element.style, styles);
        }
    },

    // ============================================
    // Browser Detection & Feature Support
    // ============================================

    /**
     * Check if Web Audio API is supported
     * @returns {boolean} True if supported
     */
    isWebAudioSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    },

    /**
     * Check if user prefers reduced motion
     * @returns {boolean} True if reduced motion preferred
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /**
     * Get viewport dimensions
     * @returns {Object} {width, height}
     */
    getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    },

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    },

    // ============================================
    // Data Formatting
    // ============================================

    /**
     * Format time in seconds to readable string
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Formatted time (e.g., "12.3s")
     */
    formatTime(milliseconds) {
        const seconds = milliseconds / 1000;
        return `${seconds.toFixed(1)}s`;
    },

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Format percentage
     * @param {number} value - Value (0-1)
     * @param {number} decimals - Decimal places
     * @returns {string} Formatted percentage
     */
    formatPercent(value, decimals = 0) {
        return `${(value * 100).toFixed(decimals)}%`;
    },

    // ============================================
    // Color Utilities
    // ============================================

    /**
     * Convert RGB to hex color
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} Hex color
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    /**
     * Interpolate between two colors
     * @param {string} color1 - Start color (hex)
     * @param {string} color2 - End color (hex)
     * @param {number} t - Interpolation factor (0-1)
     * @returns {string} Interpolated color (hex)
     */
    lerpColor(color1, color2, t) {
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);

        const r1 = (c1 >> 16) & 0xff;
        const g1 = (c1 >> 8) & 0xff;
        const b1 = c1 & 0xff;

        const r2 = (c2 >> 16) & 0xff;
        const g2 = (c2 >> 8) & 0xff;
        const b2 = c2 & 0xff;

        const r = Math.round(this.lerp(r1, r2, t));
        const g = Math.round(this.lerp(g1, g2, t));
        const b = Math.round(this.lerp(b1, b2, t));

        return this.rgbToHex(r, g, b);
    },

    // ============================================
    // Performance Monitoring
    // ============================================

    /**
     * Simple FPS counter
     * @returns {Object} FPS counter object
     */
    createFPSCounter() {
        let lastTime = performance.now();
        let frames = 0;
        let fps = 0;

        return {
            update() {
                const now = performance.now();
                frames++;

                if (now >= lastTime + 1000) {
                    fps = Math.round((frames * 1000) / (now - lastTime));
                    frames = 0;
                    lastTime = now;
                }

                return fps;
            },
            getFPS() {
                return fps;
            }
        };
    },

    /**
     * Log performance metric
     * @param {string} label - Metric label
     * @param {Function} func - Function to measure
     */
    measurePerformance(label, func) {
        if (!CONFIG.debug.enableLogging) return func();

        const start = performance.now();
        const result = func();
        const end = performance.now();

        console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    },

    // ============================================
    // Error Handling
    // ============================================

    /**
     * Safe function execution with error handling
     * @param {Function} func - Function to execute
     * @param {*} fallback - Fallback value on error
     * @returns {*} Function result or fallback
     */
    tryCatch(func, fallback = null) {
        try {
            return func();
        } catch (error) {
            if (CONFIG.debug.enableLogging) {
                console.error('Error caught:', error);
            }
            return fallback;
        }
    },

    /**
     * Log message based on log level
     * @param {string} level - Log level (error, warn, info, debug)
     * @param {string} message - Message to log
     * @param {*} data - Additional data
     */
    log(level, message, data = null) {
        if (!CONFIG.debug.enableLogging) return;

        const levels = ['error', 'warn', 'info', 'debug'];
        const configLevel = CONFIG.debug.logLevel;

        if (levels.indexOf(level) <= levels.indexOf(configLevel)) {
            const logFunc = console[level] || console.log;
            logFunc(`[${level.toUpperCase()}] ${message}`, data || '');
        }
    }
};

// ============================================
// Export Utilities
// ============================================

// Freeze utility object to prevent modifications
if (Object.freeze) {
    Object.freeze(Utils);
}
