/**
 * Cursor Tracker
 * Tracks cursor position, movement, and provides smooth cursor visuals
 */

const CursorTracker = {
    
    /**
     * Initialize cursor tracker
     */
    init() {
        this.position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.targetPosition = { ...this.position };
        this.displayPosition = { ...this.position };
        this.smoothingFactor = CONFIG.cursor.smoothing;
        this.isMoving = false;
        this.lastMoveTime = 0;
        this.moveTimeout = null;
        
        // Get DOM elements
        this.cursorElement = document.getElementById('customCursor');
        this.cursorCore = this.cursorElement?.querySelector('.cursor-core');
        this.cursorRing = this.cursorElement?.querySelector('.cursor-ring');
        
        // Hide native cursor if configured
        if (CONFIG.cursor.hideNativeCursor) {
            document.body.classList.add('hide-cursor');
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial position
        this.updateVisualPosition();
    },
    
    /**
     * Setup mouse and touch event listeners
     */
    setupEventListeners() {
        // Mouse events
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseenter', () => this.show());
        document.addEventListener('mouseleave', () => this.hide());
        
        // Touch events for mobile support
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    },
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} e - Mouse event
     */
    handleMouseMove(e) {
        this.targetPosition.x = e.clientX;
        this.targetPosition.y = e.clientY;
        this.isMoving = true;
        this.lastMoveTime = performance.now();
        
        // Clear timeout and set new one
        clearTimeout(this.moveTimeout);
        this.moveTimeout = setTimeout(() => {
            this.isMoving = false;
        }, 100);
    },
    
    /**
     * Handle touch move event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.targetPosition.x = touch.clientX;
            this.targetPosition.y = touch.clientY;
            this.isMoving = true;
            this.lastMoveTime = performance.now();
        }
    },
    
    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.targetPosition.x = touch.clientX;
            this.targetPosition.y = touch.clientY;
            this.isMoving = true;
        }
    },
    
    /**
     * Handle touch end event
     */
    handleTouchEnd() {
        this.isMoving = false;
    },
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Constrain cursor position to new window bounds
        this.targetPosition.x = Utils.clamp(this.targetPosition.x, 0, window.innerWidth);
        this.targetPosition.y = Utils.clamp(this.targetPosition.y, 0, window.innerHeight);
    },
    
    /**
     * Update cursor position with smoothing
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime = 1) {
        // Apply smoothing to cursor position
        this.position.x = Utils.lerp(
            this.position.x,
            this.targetPosition.x,
            this.smoothingFactor
        );
        this.position.y = Utils.lerp(
            this.position.y,
            this.targetPosition.y,
            this.smoothingFactor
        );
        
        // Update display position (may be offset by resistance)
        if (!this.displayOffset) {
            this.displayPosition.x = this.position.x;
            this.displayPosition.y = this.position.y;
        }
        
        // Update visual position
        this.updateVisualPosition();
    },
    
    /**
     * Update cursor visual position in DOM
     */
    updateVisualPosition() {
        if (!this.cursorElement) return;
        
        this.cursorElement.style.transform = 
            `translate(${this.displayPosition.x}px, ${this.displayPosition.y}px)`;
    },
    
    /**
     * Apply offset to display position (for resistance effect)
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     */
    applyDisplayOffset(offsetX, offsetY) {
        this.displayOffset = { x: offsetX, y: offsetY };
        this.displayPosition.x = this.position.x + offsetX;
        this.displayPosition.y = this.position.y + offsetY;
    },
    
    /**
     * Clear display offset
     */
    clearDisplayOffset() {
        this.displayOffset = null;
        this.displayPosition.x = this.position.x;
        this.displayPosition.y = this.position.y;
    },
    
    /**
     * Get current cursor position
     * @returns {Object} Position {x, y}
     */
    getPosition() {
        return { ...this.position };
    },
    
    /**
     * Get target cursor position (raw mouse position)
     * @returns {Object} Position {x, y}
     */
    getTargetPosition() {
        return { ...this.targetPosition };
    },
    
    /**
     * Get display position (visual position)
     * @returns {Object} Position {x, y}
     */
    getDisplayPosition() {
        return { ...this.displayPosition };
    },
    
    /**
     * Check if cursor is moving
     * @returns {boolean} True if moving
     */
    isMovingNow() {
        return this.isMoving;
    },
    
    /**
     * Set cursor state class
     * @param {string} state - State name
     */
    setState(state) {
        if (!this.cursorElement) return;
        
        // Remove all state classes
        this.cursorElement.classList.remove(
            'hovering', 'attached', 'resisting', 'detaching'
        );
        
        // Add new state class
        if (state) {
            this.cursorElement.classList.add(state);
        }
    },
    
    /**
     * Show cursor
     */
    show() {
        if (!this.cursorElement) return;
        this.cursorElement.classList.remove('hidden');
    },
    
    /**
     * Hide cursor
     */
    hide() {
        if (!this.cursorElement) return;
        this.cursorElement.classList.add('hidden');
    },
    
    /**
     * Pulse cursor animation
     */
    pulse() {
        if (!this.cursorCore) return;
        
        this.cursorCore.style.animation = 'none';
        setTimeout(() => {
            this.cursorCore.style.animation = '';
        }, 10);
    },
    
    /**
     * Set cursor size
     * @param {number} size - Core size
     * @param {number} ringSize - Ring size
     */
    setSize(size, ringSize) {
        if (this.cursorCore) {
            this.cursorCore.style.width = `${size}px`;
            this.cursorCore.style.height = `${size}px`;
        }
        if (this.cursorRing) {
            this.cursorRing.style.width = `${ringSize}px`;
            this.cursorRing.style.height = `${ringSize}px`;
        }
    },
    
    /**
     * Reset cursor size to default
     */
    resetSize() {
        this.setSize(CONFIG.cursor.size, CONFIG.cursor.ringSize);
    },
    
    /**
     * Set cursor color
     * @param {string} color - Color value
     */
    setColor(color) {
        if (this.cursorCore) {
            this.cursorCore.style.backgroundColor = color;
        }
    },
    
    /**
     * Reset cursor color to default
     */
    resetColor() {
        this.setColor(CONFIG.cursor.color);
    },
    
    /**
     * Get distance from cursor to point
     * @param {number} x - Point x
     * @param {number} y - Point y
     * @returns {number} Distance
     */
    getDistanceTo(x, y) {
        return Utils.distance(this.position.x, this.position.y, x, y);
    },
    
    /**
     * Get angle from cursor to point
     * @param {number} x - Point x
     * @param {number} y - Point y
     * @returns {number} Angle in radians
     */
    getAngleTo(x, y) {
        return Utils.angle(this.position.x, this.position.y, x, y);
    },
    
    /**
     * Constrain cursor to bounds
     * @param {number} minX - Minimum X
     * @param {number} minY - Minimum Y
     * @param {number} maxX - Maximum X
     * @param {number} maxY - Maximum Y
     */
    constrainToBounds(minX, minY, maxX, maxY) {
        this.position.x = Utils.clamp(this.position.x, minX, maxX);
        this.position.y = Utils.clamp(this.position.y, minY, maxY);
        this.targetPosition.x = Utils.clamp(this.targetPosition.x, minX, maxX);
        this.targetPosition.y = Utils.clamp(this.targetPosition.y, minY, maxY);
    },
    
    /**
     * Reset cursor to center
     */
    resetToCenter() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        this.position.x = centerX;
        this.position.y = centerY;
        this.targetPosition.x = centerX;
        this.targetPosition.y = centerY;
        this.displayPosition.x = centerX;
        this.displayPosition.y = centerY;
        
        this.updateVisualPosition();
    }
    
};
