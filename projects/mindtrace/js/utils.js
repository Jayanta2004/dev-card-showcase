const Utils = {
    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    formatDuration: function(ms) {
        if (ms < 1000) {
            return `${ms}ms`;
        }
        return `${(ms / 1000).toFixed(1)}s`;
    },

    getElementSelector: function(element) {
        if (!element) return '';
        if (element.id) {
            return `#${element.id}`;
        }
        if (element.className) {
            const classes = element.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                return `.${classes[0]}`;
            }
        }
        const dataAction = element.getAttribute('data-action');
        if (dataAction) {
            return `[data-action="${dataAction}"]`;
        }
        const dataCard = element.getAttribute('data-card');
        if (dataCard) {
            return `[data-card="${dataCard}"]`;
        }
        return element.tagName.toLowerCase();
    },

    getElementDescription: function(element) {
        if (!element) return 'Unknown';
        const selector = this.getElementSelector(element);
        const text = element.textContent?.trim().substring(0, 20);
        if (text && text.length > 0) {
            return `${selector} ("${text}")`;
        }
        return selector;
    },

    getInteractionType: function(event) {
        const types = {
            'click': 'Click',
            'mouseenter': 'Hover',
            'mouseleave': 'Leave',
            'keydown': 'KeyPress',
            'keyup': 'KeyRelease',
            'input': 'Input',
            'change': 'Change',
            'focus': 'Focus',
            'blur': 'Blur'
        };
        return types[event.type] || event.type;
    },

    debounce: function(func, wait) {
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

    calculateDistance: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    getRelativeTimestamp: function(timestamp, baseTime) {
        const diff = timestamp - baseTime;
        if (diff < 1000) {
            return 'Just now';
        }
        if (diff < 60000) {
            return `${Math.floor(diff / 1000)}s ago`;
        }
        return `${Math.floor(diff / 60000)}m ago`;
    },

    animateValue: function(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * progress;
            element.textContent = Math.round(current) + suffix;
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    },

    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    calculateConfidence: function(score, maxScore) {
        if (maxScore === 0) return 0;
        return Math.round((score / maxScore) * 100);
    }
};
