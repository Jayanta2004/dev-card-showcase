/**
 * SCROLLSTORY - SCROLL ENGINE
 * 
 * Core scroll position tracking and normalization system.
 * Handles scroll event optimization and position mapping.
 */

class ScrollEngine {
    constructor() {
        this.scrollPosition = 0;
        this.scrollPercent = 0;
        this.maxScroll = 0;
        this.viewportHeight = 0;
        this.documentHeight = 0;
        
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        // Performance tracking
        this.lastFrameTime = performance.now();
        this.fps = 60;
        this.frameCount = 0;
        this.fpsUpdateInterval = 1000;
        this.lastFpsUpdate = performance.now();
        
        // Callbacks
        this.onScrollCallbacks = [];
        this.onScrollEndCallbacks = [];
        
        // Throttle settings
        this.throttleDelay = 16; // ~60fps
        this.lastThrottleTime = 0;
        
        this.init();
    }
    
    /**
     * Initialize the scroll engine
     */
    init() {
        this.updateDimensions();
        this.bindEvents();
        this.startRenderLoop();
        
        // Initial calculation
        this.updateScrollPosition();
    }
    
    /**
     * Update viewport and document dimensions
     */
    updateDimensions() {
        this.viewportHeight = window.innerHeight;
        this.documentHeight = document.documentElement.scrollHeight;
        this.maxScroll = this.documentHeight - this.viewportHeight;
    }
    
    /**
     * Bind scroll and resize events
     */
    bindEvents() {
        // Passive scroll listener for performance
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Resize handler with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateDimensions();
                this.updateScrollPosition();
            }, 150);
        }, { passive: true });
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        this.isScrolling = true;
        
        // Clear existing timeout
        clearTimeout(this.scrollTimeout);
        
        // Throttle scroll updates
        const now = performance.now();
        if (now - this.lastThrottleTime < this.throttleDelay) {
            return;
        }
        this.lastThrottleTime = now;
        
        // Update scroll position
        this.updateScrollPosition();
        
        // Fire scroll callbacks
        this.fireScrollCallbacks();
        
        // Set scroll end timeout
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            this.fireScrollEndCallbacks();
        }, 150);
    }
    
    /**
     * Update current scroll position and percentage
     */
    updateScrollPosition() {
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        this.scrollPercent = this.maxScroll > 0 
            ? (this.scrollPosition / this.maxScroll) * 100 
            : 0;
        
        // Clamp values
        this.scrollPercent = Math.max(0, Math.min(100, this.scrollPercent));
    }
    
    /**
     * Get normalized scroll progress (0 to 1)
     */
    getScrollProgress() {
        return this.scrollPercent / 100;
    }
    
    /**
     * Get scroll position in pixels
     */
    getScrollPosition() {
        return this.scrollPosition;
    }
    
    /**
     * Get scroll percentage (0 to 100)
     */
    getScrollPercent() {
        return this.scrollPercent;
    }
    
    /**
     * Get viewport height
     */
    getViewportHeight() {
        return this.viewportHeight;
    }
    
    /**
     * Get document height
     */
    getDocumentHeight() {
        return this.documentHeight;
    }
    
    /**
     * Check if currently scrolling
     */
    getIsScrolling() {
        return this.isScrolling;
    }
    
    /**
     * Map scroll position to a specific range
     * @param {number} start - Start of the range (0-1)
     * @param {number} end - End of the range (0-1)
     * @returns {number} - Mapped value (0-1)
     */
    mapToRange(start, end) {
        const progress = this.getScrollProgress();
        
        if (progress <= start) return 0;
        if (progress >= end) return 1;
        
        return (progress - start) / (end - start);
    }
    
    /**
     * Get scroll position for a specific chapter
     * @param {number} chapterIndex - Chapter index (0-based)
     * @param {number} totalChapters - Total number of chapters
     * @returns {object} - { start, end, progress }
     */
    getChapterRange(chapterIndex, totalChapters) {
        const chapterSize = 1 / totalChapters;
        const start = chapterIndex * chapterSize;
        const end = (chapterIndex + 1) * chapterSize;
        const progress = this.mapToRange(start, end);
        
        return { start, end, progress };
    }
    
    /**
     * Get current chapter based on scroll position
     * @param {number} totalChapters - Total number of chapters
     * @returns {number} - Current chapter index
     */
    getCurrentChapter(totalChapters) {
        const progress = this.getScrollProgress();
        const chapterIndex = Math.floor(progress * totalChapters);
        return Math.min(chapterIndex, totalChapters - 1);
    }
    
    /**
     * Get transition progress between two chapters
     * @param {number} fromChapter - Previous chapter index
     * @param {number} toChapter - Next chapter index
     * @param {number} totalChapters - Total number of chapters
     * @returns {number} - Transition progress (0-1)
     */
    getChapterTransition(fromChapter, toChapter, totalChapters) {
        const range = this.getChapterRange(fromChapter, totalChapters);
        return range.progress;
    }
    
    /**
     * Register scroll callback
     * @param {Function} callback - Function to call on scroll
     */
    onScroll(callback) {
        if (typeof callback === 'function') {
            this.onScrollCallbacks.push(callback);
        }
    }
    
    /**
     * Register scroll end callback
     * @param {Function} callback - Function to call when scrolling ends
     */
    onScrollEnd(callback) {
        if (typeof callback === 'function') {
            this.onScrollEndCallbacks.push(callback);
        }
    }
    
    /**
     * Fire all scroll callbacks
     */
    fireScrollCallbacks() {
        const data = {
            position: this.scrollPosition,
            percent: this.scrollPercent,
            progress: this.getScrollProgress(),
            isScrolling: this.isScrolling
        };
        
        this.onScrollCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in scroll callback:', error);
            }
        });
    }
    
    /**
     * Fire all scroll end callbacks
     */
    fireScrollEndCallbacks() {
        const data = {
            position: this.scrollPosition,
            percent: this.scrollPercent,
            progress: this.getScrollProgress()
        };
        
        this.onScrollEndCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in scroll end callback:', error);
            }
        });
    }
    
    /**
     * Start render loop for FPS tracking
     */
    startRenderLoop() {
        const renderFrame = (currentTime) => {
            // Calculate FPS
            this.frameCount++;
            const deltaTime = currentTime - this.lastFpsUpdate;
            
            if (deltaTime >= this.fpsUpdateInterval) {
                this.fps = Math.round((this.frameCount * 1000) / deltaTime);
                this.frameCount = 0;
                this.lastFpsUpdate = currentTime;
            }
            
            this.lastFrameTime = currentTime;
            requestAnimationFrame(renderFrame);
        };
        
        requestAnimationFrame(renderFrame);
    }
    
    /**
     * Get current FPS
     */
    getFPS() {
        return this.fps;
    }
    
    /**
     * Smooth scroll to position
     * @param {number} position - Target scroll position
     * @param {number} duration - Animation duration in ms
     */
    smoothScrollTo(position, duration = 600) {
        const startPosition = this.scrollPosition;
        const distance = position - startPosition;
        const startTime = performance.now();
        
        const easeInOutCubic = (t) => {
            return t < 0.5 
                ? 4 * t * t * t 
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);
            
            const newPosition = startPosition + (distance * easeProgress);
            window.scrollTo(0, newPosition);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
    
    /**
     * Scroll to chapter
     * @param {number} chapterIndex - Chapter index to scroll to
     * @param {number} totalChapters - Total number of chapters
     * @param {number} duration - Animation duration
     */
    scrollToChapter(chapterIndex, totalChapters, duration = 800) {
        const chapterProgress = chapterIndex / totalChapters;
        const targetPosition = chapterProgress * this.maxScroll;
        this.smoothScrollTo(targetPosition, duration);
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            scrollPosition: Math.round(this.scrollPosition),
            scrollPercent: this.scrollPercent.toFixed(2),
            scrollProgress: this.getScrollProgress().toFixed(4),
            viewportHeight: this.viewportHeight,
            documentHeight: this.documentHeight,
            maxScroll: this.maxScroll,
            fps: this.fps,
            isScrolling: this.isScrolling
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ScrollEngine = ScrollEngine;
}
