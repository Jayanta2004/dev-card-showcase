/**
 * utils.js
 * 
 * Utility functions and classes for the Text Dodge application.
 * Includes a robust Vector2 class for physics calculations and DOM helpers.
 */

// ==========================================
// Math & Vector Logic
// ==========================================

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Add another vector to this one
     * @param {Vector2} v 
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * Subtract another vector from this one
     * @param {Vector2} v 
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * Multiply this vector by a scalar
     * @param {number} n 
     */
    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    /**
     * Divide this vector by a scalar
     * @param {number} n 
     */
    div(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
        }
        return this;
    }

    /**
     * Calculate magnitude (length) of the vector
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Normalize the vector to length 1
     */
    normalize() {
        const m = this.mag();
        if (m !== 0) {
            this.div(m);
        }
        return this;
    }

    /**
     * Set the magnitude of the vector
     * @param {number} len 
     */
    setMag(len) {
        this.normalize();
        this.mult(len);
        return this;
    }

    /**
     * Limit the magnitude of the vector
     * @param {number} max 
     */
    limit(max) {
        if (this.mag() > max) {
            this.normalize();
            this.mult(max);
        }
        return this;
    }

    /**
     * Calculate Euclidean distance to another vector
     * @param {Vector2} v 
     */
    dist(v) {
        const dx = v.x - this.x;
        const dy = v.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Return a copy of this vector
     */
    copy() {
        return new Vector2(this.x, this.y);
    }

    /**
     * Set x and y components
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Static subtraction (returns new Vector)
     * @param {Vector2} v1 
     * @param {Vector2} v2 
     */
    static sub(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
    }

    /**
     * Static addition (returns new Vector)
     * @param {Vector2} v1 
     * @param {Vector2} v2 
     */
    static add(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
    }

    /**
     * Create vector from angle and length
     * @param {number} angle in radians
     * @param {number} length 
     */
    static fromAngle(angle, length = 1) {
        return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
    }
}

// ==========================================
// Easing & Interpolation
// ==========================================

const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOutElastic: x => {
        const c4 = (2 * Math.PI) / 3;
        return x === 0
            ? 0
            : x === 1
                ? 1
                : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    easeInBounce: x => {
        return 1 - Utils.Easing.easeOutBounce(1 - x);
    },
    easeOutBounce: x => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    },
    easeInOutBounce: x => {
        return x < 0.5
            ? (1 - Utils.Easing.easeOutBounce(1 - 2 * x)) / 2
            : (1 + Utils.Easing.easeOutBounce(2 * x - 1)) / 2;
    }
};

/**
 * Linear interpolation
 * @param {number} start 
 * @param {number} end 
 * @param {number} amt 0-1
 */
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

/**
 * Map a value from one range to another
 * @param {number} value 
 * @param {number} start1 
 * @param {number} stop1 
 * @param {number} start2 
 * @param {number} stop2 
 */
function mapRange(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

/**
 * Clamp a number between min and max
 */
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * Split text content of an element into span characters
 * @param {HTMLElement} element 
 * @param {string} className class to apply to each char
 */
function splitTextToChars(element, className = 'char') {
    const text = element.innerText;
    element.innerHTML = '';
    element.setAttribute('aria-label', text); // A11y

    const chars = text.split('');
    chars.forEach(char => {
        const span = document.createElement('span');
        span.className = className;
        span.innerText = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        element.appendChild(span);
    });
}

// ==========================================
// DOM Helpers
// ==========================================

/**
 * Get element center position relative to viewport
 * @param {HTMLElement} el 
 */
function getElementCenter(el) {
    const rect = el.getBoundingClientRect();
    return new Vector2(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
    );
}

/**
 * Generate random ID
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Export essentials
window.Vector2 = Vector2;
window.Utils = {
    lerp,
    mapRange,
    clamp,
    Easing,
    getElementCenter,
    generateId,
    splitTextToChars
};
