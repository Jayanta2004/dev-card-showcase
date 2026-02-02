const Utils = {
    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    },

    addClass(element, ...classes) {
        if (element) {
            element.classList.add(...classes);
        }
        return element;
    },

    removeClass(element, ...classes) {
        if (element) {
            element.classList.remove(...classes);
        }
        return element;
    },

    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
        return element;
    },

    hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    },

    setAttr(element, attr, value) {
        if (element) {
            element.setAttribute(attr, value);
        }
        return element;
    },

    getAttr(element, attr) {
        return element ? element.getAttribute(attr) : null;
    },

    removeAttr(element, attr) {
        if (element) {
            element.removeAttribute(attr);
        }
        return element;
    },

    on(element, event, handler, options = {}) {
        if (element) {
            element.addEventListener(event, handler, options);
        }
        return () => {
            if (element) {
                element.removeEventListener(event, handler, options);
            }
        };
    },

    debounce(func, wait = 250) {
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

    throttle(func, limit = 100) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    getViewportWidth() {
        return window.innerWidth || document.documentElement.clientWidth;
    },

    getViewportHeight() {
        return window.innerHeight || document.documentElement.clientHeight;
    },

    getScrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop;
    },

    getScrollLeft() {
        return window.pageXOffset || document.documentElement.scrollLeft;
    },

    getElementOffset(element) {
        if (!element) return { top: 0, left: 0 };

        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + this.getScrollTop(),
            left: rect.left + this.getScrollLeft()
        };
    },

    isInViewport(element, threshold = 0) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const viewportHeight = this.getViewportHeight();
        const viewportWidth = this.getViewportWidth();

        return (
            rect.top < viewportHeight - threshold &&
            rect.bottom > threshold &&
            rect.left < viewportWidth - threshold &&
            rect.right > threshold
        );
    },

    getElementCenter(element) {
        if (!element) return { x: 0, y: 0 };

        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    },

    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    getAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    raf(callback) {
        return requestAnimationFrame(callback);
    },

    caf(id) {
        cancelAnimationFrame(id);
    },

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    easeOutQuad(t) {
        return t * (2 - t);
    },

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    formatNumber(num, decimals = 0) {
        return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};

if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
