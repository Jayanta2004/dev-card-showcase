/**
 * Resistance System
 * Applies cursor resistance and lag when parasite is attached
 */

const Resistance = {
    
    /**
     * Initialize resistance system
     */
    init() {
        // Resistance state
        this.currentResistance = 0;
        this.targetResistance = 0;
        this.isActive = false;
        
        // Cursor lag
        this.laggedPosition = { x: 0, y: 0 };
        this.lagVelocity = { x: 0, y: 0 };
        
        // Visual offset
        this.visualOffset = { x: 0, y: 0 };
        
        // Smoothing
        this.smoothingIterations = CONFIG.resistance.smoothingIterations;
        
        // Initialize lagged position to cursor position
        const cursorPos = CursorTracker.getPosition();
        this.laggedPosition = { ...cursorPos };
    },
    
    /**
     * Update resistance system
     * @param {number} deltaTime - Time delta
     * @param {boolean} isAttached - Whether parasite is attached
     * @param {number} attachmentStrength - Attachment strength (0-1)
     */
    update(deltaTime, isAttached, attachmentStrength) {
        if (!CONFIG.resistance.enabled) {
            this.isActive = false;
            this.currentResistance = 0;
            CursorTracker.clearDisplayOffset();
            return;
        }
        
        // Update resistance level based on attachment
        if (isAttached) {
            this.isActive = true;
            
            // Increase resistance
            this.targetResistance = Utils.lerp(
                CONFIG.resistance.baseResistance,
                CONFIG.resistance.maxResistance,
                attachmentStrength
            );
            
            this.currentResistance = Math.min(
                this.currentResistance + CONFIG.resistance.resistanceGrowth,
                this.targetResistance
            );
            
        } else {
            // Decrease resistance
            this.currentResistance = Math.max(
                this.currentResistance - CONFIG.resistance.resistanceDecay,
                0
            );
            
            if (this.currentResistance <= 0.01) {
                this.isActive = false;
                this.currentResistance = 0;
            }
        }
        
        // Apply resistance effects
        if (this.isActive || this.currentResistance > 0) {
            this.applyResistance(deltaTime);
        } else {
            CursorTracker.clearDisplayOffset();
        }
    },
    
    /**
     * Apply resistance to cursor movement
     * @param {number} deltaTime - Time delta
     */
    applyResistance(deltaTime) {
        // Get actual cursor position
        const actualPos = CursorTracker.getTargetPosition();
        
        // Calculate desired movement
        const desiredDx = actualPos.x - this.laggedPosition.x;
        const desiredDy = actualPos.y - this.laggedPosition.y;
        
        // Apply resistance (reduce movement)
        const resistanceFactor = 1 - this.currentResistance;
        const inertiaFactor = CONFIG.resistance.inertiaFactor;
        
        // Update lag velocity with resistance
        this.lagVelocity.x = Utils.lerp(
            this.lagVelocity.x,
            desiredDx * resistanceFactor,
            inertiaFactor
        );
        this.lagVelocity.y = Utils.lerp(
            this.lagVelocity.y,
            desiredDy * resistanceFactor,
            inertiaFactor
        );
        
        // Apply damping to velocity
        const dampingFactor = CONFIG.resistance.dampingFactor;
        this.lagVelocity.x *= dampingFactor;
        this.lagVelocity.y *= dampingFactor;
        
        // Update lagged position
        this.laggedPosition.x += this.lagVelocity.x;
        this.laggedPosition.y += this.lagVelocity.y;
        
        // Apply smoothing iterations
        for (let i = 0; i < this.smoothingIterations; i++) {
            this.laggedPosition.x = Utils.lerp(
                this.laggedPosition.x,
                actualPos.x,
                0.1 * resistanceFactor
            );
            this.laggedPosition.y = Utils.lerp(
                this.laggedPosition.y,
                actualPos.y,
                0.1 * resistanceFactor
            );
        }
        
        // Calculate visual offset (difference between actual and lagged)
        this.visualOffset.x = this.laggedPosition.x - actualPos.x;
        this.visualOffset.y = this.laggedPosition.y - actualPos.y;
        
        // Limit offset to max
        const offsetMagnitude = Math.sqrt(
            this.visualOffset.x * this.visualOffset.x +
            this.visualOffset.y * this.visualOffset.y
        );
        
        if (offsetMagnitude > CONFIG.resistance.cursorOffsetMax) {
            const scale = CONFIG.resistance.cursorOffsetMax / offsetMagnitude;
            this.visualOffset.x *= scale;
            this.visualOffset.y *= scale;
        }
        
        // Apply offset to cursor display
        if (CONFIG.resistance.visualFeedback) {
            CursorTracker.applyDisplayOffset(
                this.visualOffset.x,
                this.visualOffset.y
            );
        }
        
        // Apply elastic return
        const elasticity = CONFIG.resistance.elasticity;
        this.laggedPosition.x = Utils.lerp(
            this.laggedPosition.x,
            actualPos.x,
            elasticity
        );
        this.laggedPosition.y = Utils.lerp(
            this.laggedPosition.y,
            actualPos.y,
            elasticity
        );
    },
    
    /**
     * Get effective cursor position (with resistance applied)
     * @returns {Object} Position {x, y}
     */
    getEffectivePosition() {
        if (this.isActive) {
            return { ...this.laggedPosition };
        }
        return CursorTracker.getPosition();
    },
    
    /**
     * Get current resistance level
     * @returns {number} Resistance (0-1)
     */
    getResistance() {
        return this.currentResistance;
    },
    
    /**
     * Check if resistance is active
     * @returns {boolean} True if active
     */
    isResistanceActive() {
        return this.isActive;
    },
    
    /**
     * Get visual offset
     * @returns {Object} Offset {x, y}
     */
    getVisualOffset() {
        return { ...this.visualOffset };
    },
    
    /**
     * Apply instant resistance (for effects)
     * @param {number} amount - Amount to add (0-1)
     */
    applyInstantResistance(amount) {
        this.currentResistance = Utils.clamp(
            this.currentResistance + amount,
            0,
            CONFIG.resistance.maxResistance
        );
    },
    
    /**
     * Reduce resistance (for detachment attempts)
     * @param {number} amount - Amount to reduce
     */
    reduceResistance(amount) {
        this.currentResistance = Math.max(
            this.currentResistance - amount,
            0
        );
    },
    
    /**
     * Reset resistance system
     */
    reset() {
        this.currentResistance = 0;
        this.targetResistance = 0;
        this.isActive = false;
        this.lagVelocity = { x: 0, y: 0 };
        this.visualOffset = { x: 0, y: 0 };
        
        const cursorPos = CursorTracker.getPosition();
        this.laggedPosition = { ...cursorPos };
        
        CursorTracker.clearDisplayOffset();
    },
    
    /**
     * Get resistance percentage for display
     * @returns {string} Percentage string
     */
    getResistancePercentage() {
        return Utils.toPercentage(this.currentResistance, 0);
    }
    
};
