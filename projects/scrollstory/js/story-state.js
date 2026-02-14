/**
 * SCROLLSTORY - STORY STATE MACHINE
 * 
 * Manages story chapters, transitions, and visual state changes.
 * Coordinates between scroll position and visual effects.
 */

class StoryState {
    constructor(scrollEngine, interpolator) {
        this.scrollEngine = scrollEngine;
        this.interpolator = interpolator;
        
        // Chapter configuration
        this.chapters = [
            {
                id: 0,
                name: 'Origin',
                description: 'The beginning of something',
                colors: {
                    primary: '#4a4a4a',
                    secondary: '#2a2a2a',
                    accent: '#1a1a1a',
                    background: '#000000',
                    text: '#666666',
                    scrollbarTrack: '#050505',
                    scrollbarThumb: '#3a3a3a',
                    glowColor: 'rgba(74, 74, 74, 0.3)'
                }
            },
            {
                id: 1,
                name: 'Dawn',
                description: 'First light breaks the darkness',
                colors: {
                    primary: '#ffd4a3',
                    secondary: '#ffb366',
                    accent: '#ff9933',
                    background: '#0a0503',
                    text: '#ffd4a3',
                    scrollbarTrack: '#1a0f08',
                    scrollbarThumb: '#ffd4a3',
                    glowColor: 'rgba(255, 212, 163, 0.4)'
                }
            },
            {
                id: 2,
                name: 'Growth',
                description: 'Life expands and flourishes',
                colors: {
                    primary: '#66ff66',
                    secondary: '#33cc33',
                    accent: '#00aa00',
                    background: '#020a02',
                    text: '#88ff88',
                    scrollbarTrack: '#0a1a0a',
                    scrollbarThumb: '#44dd44',
                    glowColor: 'rgba(102, 255, 102, 0.5)'
                }
            },
            {
                id: 3,
                name: 'Tension',
                description: 'Forces collide and compete',
                colors: {
                    primary: '#ff9933',
                    secondary: '#ff6633',
                    accent: '#ff3300',
                    background: '#0a0402',
                    text: '#ffaa66',
                    scrollbarTrack: '#1a0805',
                    scrollbarThumb: '#ff7733',
                    glowColor: 'rgba(255, 119, 51, 0.6)'
                }
            },
            {
                id: 4,
                name: 'Chaos',
                description: 'Order breaks into fragments',
                colors: {
                    primary: '#ff0044',
                    secondary: '#cc0033',
                    accent: '#990022',
                    background: '#0a0001',
                    text: '#ff3366',
                    scrollbarTrack: '#1a0005',
                    scrollbarThumb: '#ff0044',
                    glowColor: 'rgba(255, 0, 68, 0.8)'
                }
            },
            {
                id: 5,
                name: 'Resolution',
                description: 'Harmony emerges from discord',
                colors: {
                    primary: '#6699ff',
                    secondary: '#3366cc',
                    accent: '#0033aa',
                    background: '#000308',
                    text: '#88aaff',
                    scrollbarTrack: '#050a15',
                    scrollbarThumb: '#5588ee',
                    glowColor: 'rgba(102, 153, 255, 0.6)'
                }
            },
            {
                id: 6,
                name: 'Flow',
                description: 'Movement finds its rhythm',
                colors: {
                    primary: '#00dddd',
                    secondary: '#00aaaa',
                    accent: '#008888',
                    background: '#000a0a',
                    text: '#44ffff',
                    scrollbarTrack: '#001a1a',
                    scrollbarThumb: '#00cccc',
                    glowColor: 'rgba(0, 221, 221, 0.5)'
                }
            },
            {
                id: 7,
                name: 'Transcendence',
                description: 'Beyond the visible spectrum',
                colors: {
                    primary: '#cc66ff',
                    secondary: '#9933cc',
                    accent: '#660099',
                    background: '#050208',
                    text: '#dd88ff',
                    scrollbarTrack: '#0f0515',
                    scrollbarThumb: '#bb55ee',
                    glowColor: 'rgba(204, 102, 255, 0.7)'
                }
            },
            {
                id: 8,
                name: 'Infinity',
                description: 'The end is the beginning',
                colors: {
                    primary: '#ffffff',
                    secondary: '#cccccc',
                    accent: '#999999',
                    background: '#000000',
                    text: '#dddddd',
                    scrollbarTrack: '#0a0a0a',
                    scrollbarThumb: '#aaaaaa',
                    glowColor: 'rgba(255, 255, 255, 0.3)'
                }
            }
        ];
        
        this.currentChapter = 0;
        this.previousChapter = 0;
        this.transitionProgress = 0;
        this.isTransitioning = false;
        
        // Callbacks
        this.onChapterChangeCallbacks = [];
        this.onTransitionCallbacks = [];
        
        // State smoothers
        this.chapterSmoother = new ValueSmoother(0.15);
        
        this.init();
    }
    
    /**
     * Initialize story state
     */
    init() {
        this.updateChapter();
        this.applyChapterStyles();
    }
    
    /**
     * Update current chapter based on scroll position
     */
    updateChapter() {
        const scrollProgress = this.scrollEngine.getScrollProgress();
        const rawChapter = scrollProgress * this.chapters.length;
        const newChapter = Math.min(
            Math.floor(rawChapter), 
            this.chapters.length - 1
        );
        
        // Calculate transition progress within current chapter
        this.transitionProgress = rawChapter - newChapter;
        
        // Check for chapter change
        if (newChapter !== this.currentChapter) {
            this.previousChapter = this.currentChapter;
            this.currentChapter = newChapter;
            this.isTransitioning = true;
            this.onChapterChange();
        }
        
        // Update smoother
        this.chapterSmoother.setTarget(rawChapter);
        this.chapterSmoother.update();
    }
    
    /**
     * Handle chapter change
     */
    onChapterChange() {
        const chapter = this.getCurrentChapterData();
        
        // Update body data attribute
        document.body.setAttribute('data-chapter', this.currentChapter);
        document.body.setAttribute('data-transitioning', 'true');
        
        // Fire callbacks
        this.fireChapterChangeCallbacks(chapter);
        
        // Apply new chapter styles
        this.applyChapterStyles();
        
        // Reset transition flag after animation
        setTimeout(() => {
            document.body.setAttribute('data-transitioning', 'false');
            this.isTransitioning = false;
        }, 1000);
    }
    
    /**
     * Apply chapter-specific styles to CSS custom properties
     */
    applyChapterStyles() {
        const chapter = this.getCurrentChapterData();
        const nextChapter = this.getNextChapterData();
        
        if (!chapter) return;
        
        const root = document.documentElement;
        
        // If transitioning, interpolate colors
        if (nextChapter && this.transitionProgress > 0) {
            const colors = this.interpolateChapterColors(
                chapter.colors, 
                nextChapter.colors, 
                this.transitionProgress
            );
            
            this.applyCSSProperties(colors);
        } else {
            this.applyCSSProperties(chapter.colors);
        }
    }
    
    /**
     * Interpolate between two chapter color sets
     */
    interpolateChapterColors(startColors, endColors, progress) {
        const result = {};
        
        for (const key in startColors) {
            if (startColors[key].startsWith('#') && endColors[key]?.startsWith('#')) {
                result[key] = this.interpolator.lerpColor(
                    startColors[key],
                    endColors[key],
                    progress,
                    'easeInOutCubic'
                );
            } else if (startColors[key].startsWith('rgba')) {
                // Simple blend for rgba - could be improved
                result[key] = progress < 0.5 ? startColors[key] : endColors[key];
            } else {
                result[key] = startColors[key];
            }
        }
        
        return result;
    }
    
    /**
     * Apply color properties to CSS custom properties
     */
    applyCSSProperties(colors) {
        const root = document.documentElement;
        
        root.style.setProperty('--primary-color', colors.primary);
        root.style.setProperty('--secondary-color', colors.secondary);
        root.style.setProperty('--accent-color', colors.accent);
        root.style.setProperty('--background-color', colors.background);
        root.style.setProperty('--text-color', colors.text);
        root.style.setProperty('--scrollbar-track-color', colors.scrollbarTrack);
        root.style.setProperty('--scrollbar-thumb-color', colors.scrollbarThumb);
        root.style.setProperty('--scrollbar-glow-color', colors.glowColor);
    }
    
    /**
     * Update story state (called on scroll)
     */
    update() {
        this.updateChapter();
        this.applyChapterStyles();
        this.updateProgressDisplay();
        this.fireTransitionCallbacks();
    }
    
    /**
     * Update progress display elements
     */
    updateProgressDisplay() {
        const chapter = this.getCurrentChapterData();
        const scrollPercent = this.scrollEngine.getScrollPercent();
        
        // Update progress bar
        const root = document.documentElement;
        root.style.setProperty('--scroll-progress', this.scrollEngine.getScrollProgress());
        root.style.setProperty('--scroll-percent', scrollPercent);
        root.style.setProperty('--current-chapter', this.currentChapter);
        root.style.setProperty('--chapter-transition', this.transitionProgress);
        
        // Update text displays
        const currentChapterEl = document.querySelector('.current-chapter');
        const progressPercentEl = document.querySelector('.progress-percent');
        
        if (currentChapterEl && chapter) {
            currentChapterEl.textContent = chapter.name;
        }
        
        if (progressPercentEl) {
            progressPercentEl.textContent = `${Math.round(scrollPercent)}%`;
        }
    }
    
    /**
     * Get current chapter data
     */
    getCurrentChapterData() {
        return this.chapters[this.currentChapter] || null;
    }
    
    /**
     * Get next chapter data
     */
    getNextChapterData() {
        const nextIndex = Math.min(this.currentChapter + 1, this.chapters.length - 1);
        return this.chapters[nextIndex] || null;
    }
    
    /**
     * Get previous chapter data
     */
    getPreviousChapterData() {
        return this.chapters[this.previousChapter] || null;
    }
    
    /**
     * Get chapter by index
     */
    getChapter(index) {
        return this.chapters[index] || null;
    }
    
    /**
     * Get total chapter count
     */
    getChapterCount() {
        return this.chapters.length;
    }
    
    /**
     * Get current chapter index
     */
    getCurrentChapterIndex() {
        return this.currentChapter;
    }
    
    /**
     * Get transition progress
     */
    getTransitionProgress() {
        return this.transitionProgress;
    }
    
    /**
     * Check if transitioning
     */
    getIsTransitioning() {
        return this.isTransitioning;
    }
    
    /**
     * Register chapter change callback
     */
    onChapterChangeCallback(callback) {
        if (typeof callback === 'function') {
            this.onChapterChangeCallbacks.push(callback);
        }
    }
    
    /**
     * Register transition callback
     */
    onTransitionCallback(callback) {
        if (typeof callback === 'function') {
            this.onTransitionCallbacks.push(callback);
        }
    }
    
    /**
     * Fire chapter change callbacks
     */
    fireChapterChangeCallbacks(chapter) {
        this.onChapterChangeCallbacks.forEach(callback => {
            try {
                callback({
                    chapter,
                    index: this.currentChapter,
                    previous: this.previousChapter
                });
            } catch (error) {
                console.error('Error in chapter change callback:', error);
            }
        });
    }
    
    /**
     * Fire transition callbacks
     */
    fireTransitionCallbacks() {
        const data = {
            progress: this.transitionProgress,
            currentChapter: this.currentChapter,
            isTransitioning: this.isTransitioning
        };
        
        this.onTransitionCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in transition callback:', error);
            }
        });
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        const chapter = this.getCurrentChapterData();
        
        return {
            currentChapter: this.currentChapter,
            chapterName: chapter?.name || 'Unknown',
            previousChapter: this.previousChapter,
            transitionProgress: this.transitionProgress.toFixed(2),
            isTransitioning: this.isTransitioning,
            totalChapters: this.chapters.length
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StoryState = StoryState;
}
