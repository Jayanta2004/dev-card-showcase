/**
 * SCROLLSTORY - MAIN APPLICATION
 * 
 * Orchestrates all systems and initializes the scroll-based artwork.
 * This is the entry point that ties everything together.
 */

class ScrollStory {
    constructor() {
        // Core systems
        this.scrollEngine = null;
        this.interpolator = null;
        this.storyState = null;
        
        // UI elements
        this.storyIndicator = null;
        this.progressContainer = null;
        this.debugOverlay = null;
        
        // State
        this.isInitialized = false;
        this.hasScrolled = false;
        this.debugMode = false;
        
        // Performance
        this.rafId = null;
        this.lastUpdateTime = 0;
        this.updateInterval = 16; // ~60fps
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Setup all systems
     */
    setup() {
        // Initialize core systems
        this.scrollEngine = new ScrollEngine();
        this.interpolator = new Interpolator();
        this.storyState = new StoryState(this.scrollEngine, this.interpolator);
        
        // Cache UI elements
        this.cacheElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start render loop
        this.startRenderLoop();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initial state
        this.updateDebugDisplay();
        
        // Mark as initialized
        this.isInitialized = true;
        
        console.log('ScrollStory initialized ✨');
        console.log('Press "D" to toggle debug mode');
        console.log('Press "R" to reset to top');
        console.log('Press numbers 0-8 to jump to chapters');
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.storyIndicator = document.querySelector('.story-indicator');
        this.progressContainer = document.querySelector('.progress-container');
        this.debugOverlay = document.querySelector('.debug-overlay');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen to scroll events
        this.scrollEngine.onScroll((data) => {
            this.handleScroll(data);
        });
        
        // Listen to scroll end events
        this.scrollEngine.onScrollEnd((data) => {
            this.handleScrollEnd(data);
        });
        
        // Listen to chapter changes
        this.storyState.onChapterChangeCallback((data) => {
            this.handleChapterChange(data);
        });
        
        // Window focus/blur for performance
        window.addEventListener('focus', () => {
            this.startRenderLoop();
        });
        
        window.addEventListener('blur', () => {
            // Keep running in background for smooth experience
            // cancelAnimationFrame(this.rafId);
        });
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // D - Toggle debug mode
            if (e.key === 'd' || e.key === 'D') {
                this.toggleDebugMode();
            }
            
            // R - Reset to top
            if (e.key === 'r' || e.key === 'R') {
                this.scrollEngine.smoothScrollTo(0, 1000);
            }
            
            // Numbers 0-8 - Jump to chapters
            const chapterNum = parseInt(e.key);
            if (!isNaN(chapterNum) && chapterNum >= 0 && chapterNum <= 8) {
                this.scrollEngine.scrollToChapter(chapterNum, 9, 1000);
            }
            
            // Arrow keys for smooth scrolling
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const currentPos = this.scrollEngine.getScrollPosition();
                this.scrollEngine.smoothScrollTo(currentPos + 200, 300);
            }
            
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const currentPos = this.scrollEngine.getScrollPosition();
                this.scrollEngine.smoothScrollTo(currentPos - 200, 300);
            }
            
            // Space - Jump to next chapter
            if (e.key === ' ' && !e.shiftKey) {
                e.preventDefault();
                const currentChapter = this.storyState.getCurrentChapterIndex();
                const nextChapter = Math.min(currentChapter + 1, 8);
                this.scrollEngine.scrollToChapter(nextChapter, 9, 800);
            }
            
            // Shift+Space - Jump to previous chapter
            if (e.key === ' ' && e.shiftKey) {
                e.preventDefault();
                const currentChapter = this.storyState.getCurrentChapterIndex();
                const prevChapter = Math.max(currentChapter - 1, 0);
                this.scrollEngine.scrollToChapter(prevChapter, 9, 800);
            }
        });
    }
    
    /**
     * Handle scroll events
     */
    handleScroll(data) {
        // Fade out initial indicator on first scroll
        if (!this.hasScrolled && data.position > 50) {
            this.hasScrolled = true;
            if (this.storyIndicator) {
                this.storyIndicator.classList.add('fade-out');
                setTimeout(() => {
                    this.storyIndicator.style.display = 'none';
                }, 600);
            }
        }
    }
    
    /**
     * Handle scroll end events
     */
    handleScrollEnd(data) {
        // Could add subtle effects when scrolling stops
        // console.log('Scroll ended at', data.percent + '%');
    }
    
    /**
     * Handle chapter changes
     */
    handleChapterChange(data) {
        console.log(`Chapter changed: ${data.previous} → ${data.index} (${data.chapter.name})`);
        
        // Add visual feedback (optional)
        this.flashChapterTransition();
    }
    
    /**
     * Flash effect on chapter transition
     */
    flashChapterTransition() {
        const body = document.body;
        body.style.transition = 'none';
        
        requestAnimationFrame(() => {
            body.style.transition = '';
        });
    }
    
    /**
     * Main render loop
     */
    startRenderLoop() {
        const render = (currentTime) => {
            // Throttle updates
            if (currentTime - this.lastUpdateTime >= this.updateInterval) {
                this.update(currentTime);
                this.lastUpdateTime = currentTime;
            }
            
            this.rafId = requestAnimationFrame(render);
        };
        
        this.rafId = requestAnimationFrame(render);
    }
    
    /**
     * Update all systems
     */
    update(currentTime) {
        // Update story state based on scroll position
        this.storyState.update();
        
        // Update debug display if enabled
        if (this.debugMode) {
            this.updateDebugDisplay();
        }
    }
    
    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        if (this.debugOverlay) {
            this.debugOverlay.style.display = this.debugMode ? 'block' : 'none';
        }
        
        console.log('Debug mode:', this.debugMode ? 'ON' : 'OFF');
    }
    
    /**
     * Update debug display
     */
    updateDebugDisplay() {
        if (!this.debugOverlay || !this.debugMode) return;
        
        const scrollInfo = this.scrollEngine.getDebugInfo();
        const storyInfo = this.storyState.getDebugInfo();
        
        const debugProgress = document.getElementById('debug-progress');
        const debugChapter = document.getElementById('debug-chapter');
        const debugTransition = document.getElementById('debug-transition');
        const debugFps = document.getElementById('debug-fps');
        
        if (debugProgress) {
            debugProgress.textContent = scrollInfo.scrollPercent + '%';
        }
        
        if (debugChapter) {
            debugChapter.textContent = `${storyInfo.currentChapter} (${storyInfo.chapterName})`;
        }
        
        if (debugTransition) {
            debugTransition.textContent = storyInfo.transitionProgress;
        }
        
        if (debugFps) {
            debugFps.textContent = scrollInfo.fps;
        }
    }
    
    /**
     * Get application state
     */
    getState() {
        return {
            initialized: this.isInitialized,
            hasScrolled: this.hasScrolled,
            debugMode: this.debugMode,
            currentChapter: this.storyState?.getCurrentChapterIndex() || 0,
            scrollProgress: this.scrollEngine?.getScrollProgress() || 0
        };
    }
    
    /**
     * Destroy and cleanup
     */
    destroy() {
        // Cancel animation frame
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        // Remove event listeners would go here
        // (in a production app)
        
        console.log('ScrollStory destroyed');
    }
}

/**
 * Auto-initialize when script loads
 */
let scrollStoryApp;

if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        scrollStoryApp = new ScrollStory();
        window.scrollStoryApp = scrollStoryApp; // Expose for debugging
    });
}

/**
 * Utility function to create visual effects
 */
class VisualEffects {
    /**
     * Create particle effect (simulated with DOM)
     */
    static createParticle(x, y, color) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = color;
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.opacity = '1';
        particle.style.transition = 'all 1s ease-out';
        
        document.body.appendChild(particle);
        
        // Animate and remove
        requestAnimationFrame(() => {
            particle.style.transform = `translateY(-100px) scale(0)`;
            particle.style.opacity = '0';
        });
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
    
    /**
     * Create ripple effect
     */
    static createRipple(x, y, color) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = (x - 50) + 'px';
        ripple.style.top = (y - 50) + 'px';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.borderRadius = '50%';
        ripple.style.border = `2px solid ${color}`;
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999';
        ripple.style.opacity = '0.6';
        ripple.style.transition = 'all 0.6s ease-out';
        
        document.body.appendChild(ripple);
        
        requestAnimationFrame(() => {
            ripple.style.transform = 'scale(2)';
            ripple.style.opacity = '0';
        });
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.ScrollStory = ScrollStory;
    window.VisualEffects = VisualEffects;
}
