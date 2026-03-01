/**
 * Lazy Loading Snail - A humorous loading indicator
 * Makes waiting periods less boring with animated snail graphics
 */

class SnailLoader {
    constructor() {
        this.loader = document.getElementById('snailLoader');
        this.textElement = document.getElementById('snailText');
        this.isVisible = false;
        this.messageIndex = 0;
        this.messageInterval = null;
        
        // Humorous loading messages
        this.messages = [
            "🐌 Taking it slow and steady...",
            "🐌 Almost there... maybe...",
            "🐌 Loading at snail pace...",
            "🐌 Patience, young grasshopper...",
            "🐌 Rome wasn't built in a day...",
            "🐌 Good things come to those who wait...",
            "🐌 Slow and steady wins the race...",
            "🐌 Loading... please don't rush me...",
            "🐌 I'm going as fast as I can!",
            "🐌 Quality takes time...",
            "🐌 Still loading... grab a coffee? ☕",
            "🐌 Loading with love and care...",
            "🐌 Perfection requires patience...",
            "🐌 Almost done... probably..."
        ];
    }

    /**
     * Show the snail loader with optional custom message
     * @param {string} customMessage - Optional custom loading message
     */
    show(customMessage = null) {
        if (this.isVisible) return;
        
        this.isVisible = true;
        
        // Set initial message
        if (customMessage) {
            this.textElement.textContent = customMessage;
        } else {
            this.messageIndex = 0;
            this.textElement.textContent = this.messages[this.messageIndex];
        }
        
        // Show the loader
        this.loader.classList.add('visible');
        
        // Start cycling through messages every 3 seconds
        if (!customMessage) {
            this.startMessageCycle();
        }
        
        // Add backdrop blur to body
        document.body.style.overflow = 'hidden';
        
        // Trigger entrance animation
        this.loader.style.animation = 'snailFadeIn 0.5s ease-in-out';
    }

    /**
     * Hide the snail loader
     */
    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.stopMessageCycle();
        
        // Fade out animation
        this.loader.style.animation = 'snailFadeOut 0.3s ease-in-out';
        
        setTimeout(() => {
            this.loader.classList.remove('visible');
            document.body.style.overflow = '';
        }, 300);
    }

    /**
     * Start cycling through humorous messages
     */
    startMessageCycle() {
        this.messageInterval = setInterval(() => {
            if (!this.isVisible) return;
            
            this.messageIndex = (this.messageIndex + 1) % this.messages.length;
            this.textElement.textContent = this.messages[this.messageIndex];
            
            // Add a little animation to the text change
            this.textElement.style.animation = 'none';
            this.textElement.offsetHeight; // Trigger reflow
            this.textElement.style.animation = 'snailTextFade 2s ease-in-out infinite';
        }, 3000);
    }

    /**
     * Stop cycling through messages
     */
    stopMessageCycle() {
        if (this.messageInterval) {
            clearInterval(this.messageInterval);
            this.messageInterval = null;
        }
    }

    /**
     * Check if loader is currently visible
     * @returns {boolean}
     */
    isLoading() {
        return this.isVisible;
    }

    /**
     * Show loader for a specific duration
     * @param {number} duration - Duration in milliseconds
     * @param {string} message - Optional custom message
     */
    showForDuration(duration = 3000, message = null) {
        this.show(message);
        setTimeout(() => {
            this.hide();
        }, duration);
    }
}

// Create global instance
const snailLoader = new SnailLoader();

// Add fade out keyframe if not already present
if (!document.querySelector('style[data-snail-loader]')) {
    const style = document.createElement('style');
    style.setAttribute('data-snail-loader', 'true');
    style.textContent = `
        @keyframes snailFadeOut {
            from {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
}

// Utility functions for easy integration
window.showSnailLoader = (message) => snailLoader.show(message);
window.hideSnailLoader = () => snailLoader.hide();
window.snailLoaderForDuration = (duration, message) => snailLoader.showForDuration(duration, message);

// Auto-integration with common async operations
// Monkey patch fetch to automatically show snail loader
const originalFetch = window.fetch;
let activeRequests = 0;

window.fetch = function(...args) {
    // Don't show loader for very fast requests or if already loading
    const showLoader = !snailLoader.isLoading();
    
    if (showLoader) {
        activeRequests++;
        if (activeRequests === 1) {
            // Small delay to prevent flash for very fast requests
            setTimeout(() => {
                if (activeRequests > 0) {
                    snailLoader.show("🐌 Fetching data...");
                }
            }, 200);
        }
    }
    
    const promise = originalFetch.apply(this, args);
    
    promise.finally(() => {
        activeRequests--;
        if (activeRequests <= 0) {
            activeRequests = 0;
            setTimeout(() => {
                if (activeRequests === 0) {
                    snailLoader.hide();
                }
            }, 300); // Small delay to show completion
        }
    });
    
    return promise;
};

// Integration with XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(...args) {
    this._startTime = Date.now();
    return originalOpen.apply(this, args);
};

XMLHttpRequest.prototype.send = function(...args) {
    if (!snailLoader.isLoading()) {
        setTimeout(() => {
            if (this.readyState !== 4 && !snailLoader.isLoading()) {
                snailLoader.show("🐌 Loading content...");
            }
        }, 200);
    }
    
    this.addEventListener('loadend', () => {
        setTimeout(() => {
            snailLoader.hide();
        }, 300);
    });
    
    return originalSend.apply(this, args);
};

// Demo functionality for testing
window.demoSnailLoader = () => {
    console.log('🐌 Snail Loader Demo Started');
    snailLoader.show();
    
    setTimeout(() => {
        snailLoader.hide();
        console.log('🐌 Snail Loader Demo Completed');
    }, 5000);
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnailLoader;
}