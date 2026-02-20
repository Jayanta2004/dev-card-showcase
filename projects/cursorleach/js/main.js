/**
 * Main Application Controller
 * Orchestrates all systems and manages the game loop
 */

const CursorLeechApp = {
    
    /**
     * Initialize application
     */
    init() {
        console.log('CursorLeech initializing...');
        
        // Application state
        this.isRunning = false;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = 0;
        
        // Canvas for effects
        this.canvas = document.getElementById('effectsCanvas');
        this.ctx = null;
        
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d', { alpha: CONFIG.performance.canvasAlpha });
            this.resizeCanvas();
        }
        
        // Initialize all systems
        this.initializeSystems();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup UI
        this.setupUI();
        
        // Start the application
        this.start();
        
        console.log('CursorLeech initialized successfully!');
    },
    
    /**
     * Initialize all game systems
     */
    initializeSystems() {
        try {
            Physics.init();
            CursorTracker.init();
            Parasite.init();
            Attachment.init();
            Resistance.init();
            StateManager.init();
            
            console.log('All systems initialized');
        } catch (error) {
            console.error('Error initializing systems:', error);
        }
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Visibility change (pause when hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    },
    
    /**
     * Setup UI elements and behaviors
     */
    setupUI() {
        // Fade out instructions after delay
        if (CONFIG.ui.fadeInstructions) {
            setTimeout(() => {
                const instructions = document.querySelector('.instructions');
                if (instructions) {
                    instructions.classList.add('fading');
                    setTimeout(() => {
                        instructions.style.display = 'none';
                    }, 1000);
                }
            }, CONFIG.ui.instructionFadeDelay);
        }
        
        // Hide debug panel initially
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel && !CONFIG.ui.showDebug) {
            debugPanel.classList.add('hidden');
        }
    },
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Resize canvas
        this.resizeCanvas();
        
        // Update cursor bounds
        CursorTracker.constrainToBounds(0, 0, window.innerWidth, window.innerHeight);
    },
    
    /**
     * Resize canvas to window size
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    /**
     * Handle keyboard input
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'd':
                // Toggle debug panel
                this.toggleDebug();
                break;
                
            case 'p':
                // Toggle pause
                if (this.isPaused) {
                    this.resume();
                } else {
                    this.pause();
                }
                break;
                
            case 'r':
                // Reset
                this.reset();
                break;
                
            case 'escape':
                // Force detach (for testing)
                if (Attachment.isCurrentlyAttached()) {
                    Attachment.forceDetach();
                }
                break;
        }
    },
    
    /**
     * Toggle debug panel
     */
    toggleDebug() {
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            debugPanel.classList.toggle('hidden');
        }
    },
    
    /**
     * Start application
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.lastFpsUpdate = this.lastFrameTime;
        
        // Start game loop
        if (CONFIG.performance.useRAF) {
            this.gameLoop();
        } else {
            setInterval(() => this.update(), CONFIG.performance.frameInterval);
        }
        
        console.log('Application started');
    },
    
    /**
     * Pause application
     */
    pause() {
        this.isPaused = true;
        console.log('Application paused');
    },
    
    /**
     * Resume application
     */
    resume() {
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        console.log('Application resumed');
    },
    
    /**
     * Reset application state
     */
    reset() {
        console.log('Resetting application...');
        
        // Reset all systems
        Physics.reset();
        Parasite.respawn();
        Attachment.reset();
        Resistance.reset();
        StateManager.reset();
        
        // Clear canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        console.log('Application reset complete');
    },
    
    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        // Request next frame
        requestAnimationFrame(() => this.gameLoop());
        
        // Update if not paused
        if (!this.isPaused) {
            this.update();
        }
    },
    
    /**
     * Main update function
     */
    update() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Update FPS counter
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
        
        // Update cursor tracker
        CursorTracker.update(this.deltaTime);
        
        // Update physics with cursor position
        const cursorPos = CursorTracker.getPosition();
        const physicsData = Physics.update(cursorPos, currentTime);
        
        // Update attachment system
        const attachmentStatus = Attachment.update(this.deltaTime);
        
        // Update resistance system
        Resistance.update(
            this.deltaTime,
            attachmentStatus.isAttached,
            attachmentStatus.strength
        );
        
        // Get current state
        const currentState = StateManager.getState();
        
        // Update parasite
        Parasite.update(this.deltaTime, currentState);
        
        // Update state manager
        StateManager.update(this.deltaTime);
        
        // Update debug display
        this.updateDebugDisplay(physicsData);
        
        // Render canvas effects
        if (CONFIG.performance.enableCanvas) {
            this.renderCanvas();
        }
    },
    
    /**
     * Update debug display
     * @param {Object} physicsData - Physics data
     */
    updateDebugDisplay(physicsData) {
        const debugPanel = document.getElementById('debugPanel');
        if (!debugPanel || debugPanel.classList.contains('hidden')) return;
        
        const cursorPos = CursorTracker.getPosition();
        const parasitePos = Parasite.getPosition();
        const distance = Parasite.getDistanceToCursor();
        
        // Update debug values
        const debugCursorPos = document.getElementById('debugCursorPos');
        const debugParasitePos = document.getElementById('debugParasitePos');
        const debugDistance = document.getElementById('debugDistance');
        const debugVelocity = document.getElementById('debugVelocity');
        const debugJerk = document.getElementById('debugJerk');
        
        if (debugCursorPos) {
            debugCursorPos.textContent = `${Math.round(cursorPos.x)}, ${Math.round(cursorPos.y)}`;
        }
        if (debugParasitePos) {
            debugParasitePos.textContent = `${Math.round(parasitePos.x)}, ${Math.round(parasitePos.y)}`;
        }
        if (debugDistance) {
            debugDistance.textContent = `${Math.round(distance)}px`;
        }
        if (debugVelocity) {
            debugVelocity.textContent = `${physicsData.speed.toFixed(2)}px/s`;
        }
        if (debugJerk) {
            debugJerk.textContent = `${physicsData.jerk.toFixed(2)}`;
        }
    },
    
    /**
     * Render canvas effects
     */
    renderCanvas() {
        if (!this.ctx) return;
        
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connection line if attached
        if (Attachment.isCurrentlyAttached() || Attachment.isCurrentlyTouching()) {
            this.drawConnectionLine();
        }
        
        // Draw glow trail if enabled
        if (CONFIG.effects.enableTrail) {
            this.drawParasiteTrail();
        }
    },
    
    /**
     * Draw connection line on canvas
     */
    drawConnectionLine() {
        if (!this.ctx) return;
        
        const cursorPos = CursorTracker.getPosition();
        const parasitePos = Parasite.getPosition();
        
        const gradient = this.ctx.createLinearGradient(
            cursorPos.x, cursorPos.y,
            parasitePos.x, parasitePos.y
        );
        
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.8)');
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(255, 0, 0, 0.6)';
        
        this.ctx.beginPath();
        this.ctx.moveTo(cursorPos.x, cursorPos.y);
        this.ctx.lineTo(parasitePos.x, parasitePos.y);
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    },
    
    /**
     * Draw parasite trail effect
     */
    drawParasiteTrail() {
        // Trail effect implementation
        // This could be enhanced with a trail history system
    },
    
    /**
     * Get application statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            fps: this.fps,
            state: StateManager.getState(),
            attachment: Attachment.getStrength(),
            resistance: Resistance.getResistance(),
            distance: Parasite.getDistanceToCursor()
        };
    }
    
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        CursorLeechApp.init();
    });
} else {
    // DOM already loaded
    CursorLeechApp.init();
}

// Expose to window for debugging
window.CursorLeech = CursorLeechApp;
