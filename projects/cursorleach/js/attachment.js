/**
 * Attachment System
 * Manages attachment detection, strength, and state transitions
 */

const Attachment = {
    
    /**
     * Initialize attachment system
     */
    init() {
        // Attachment state
        this.strength = 0;
        this.isAttached = false;
        this.isTouching = false;
        
        // Touch detection
        this.touchFrames = 0;
        this.requiredTouchFrames = CONFIG.attachment.touchFrames;
        
        // Timing
        this.attachmentStartTime = 0;
        this.lastTouchTime = 0;
        
        // Visual effects
        this.ripples = [];
        this.connectionLine = null;
        
        // Create effect elements
        this.createEffectElements();
    },
    
    /**
     * Create DOM elements for visual effects
     */
    createEffectElements() {
        // Connection line
        this.connectionLine = document.createElement('div');
        this.connectionLine.className = 'connection-line';
        document.querySelector('.app-container').appendChild(this.connectionLine);
    },
    
    /**
     * Update attachment system
     * @param {number} deltaTime - Time delta
     * @returns {Object} Attachment status
     */
    update(deltaTime) {
        const wasTouching = this.isTouching;
        const wasAttached = this.isAttached;
        
        // Check if parasite is touching cursor
        this.isTouching = Parasite.isTouchingCursor();
        
        if (this.isTouching) {
            this.touchFrames++;
            this.lastTouchTime = performance.now();
            
            // Increase attachment strength
            this.strength = Math.min(
                this.strength + CONFIG.attachment.strengthGrowth,
                CONFIG.attachment.maxStrength
            );
            
            // Check if should attach
            if (!this.isAttached && 
                this.touchFrames >= this.requiredTouchFrames &&
                this.strength >= CONFIG.attachment.attachmentStrength) {
                this.attach();
            }
            
            // Update connection line
            this.updateConnectionLine();
            
        } else {
            this.touchFrames = 0;
            
            // Decrease attachment strength
            this.strength = Math.max(
                this.strength - CONFIG.attachment.strengthDecay,
                CONFIG.attachment.minStrength
            );
            
            // Check if should detach
            if (this.isAttached && 
                this.strength <= CONFIG.attachment.detachmentThreshold) {
                this.detach();
            }
            
            // Hide connection line
            this.hideConnectionLine();
        }
        
        // Trigger events on state change
        if (this.isTouching && !wasTouching) {
            this.onTouchStart();
        } else if (!this.isTouching && wasTouching) {
            this.onTouchEnd();
        }
        
        return {
            isTouching: this.isTouching,
            isAttached: this.isAttached,
            strength: this.strength,
            touchFrames: this.touchFrames
        };
    },
    
    /**
     * Attach parasite to cursor
     */
    attach() {
        if (this.isAttached) return;
        
        this.isAttached = true;
        this.attachmentStartTime = performance.now();
        this.strength = CONFIG.attachment.maxStrength;
        
        // Visual feedback
        this.createAttachmentRipple();
        this.showConnectionLine();
        
        // Log if debug enabled
        if (CONFIG.debug.logAttachment) {
            console.log('Parasite attached!');
        }
    },
    
    /**
     * Detach parasite from cursor
     */
    detach() {
        if (!this.isAttached) return;
        
        this.isAttached = false;
        this.strength = 0;
        this.touchFrames = 0;
        
        // Visual feedback
        this.createDetachmentParticles();
        this.hideConnectionLine();
        
        // Respawn parasite if configured
        if (CONFIG.gameplay.respawnOnDetach) {
            setTimeout(() => {
                Parasite.respawn();
            }, 500);
        }
        
        // Log if debug enabled
        if (CONFIG.debug.logDetachment) {
            console.log('Parasite detached!');
        }
    },
    
    /**
     * Force detachment (called by detachment system)
     */
    forceDetach() {
        this.strength = 0;
        this.detach();
    },
    
    /**
     * Called when parasite starts touching cursor
     */
    onTouchStart() {
        // Create haptic pulse effect
        this.createHapticPulse();
        
        // Update cursor state
        CursorTracker.setState('touching');
    },
    
    /**
     * Called when parasite stops touching cursor
     */
    onTouchEnd() {
        // Update cursor state if not attached
        if (!this.isAttached) {
            CursorTracker.setState(null);
        }
    },
    
    /**
     * Create attachment ripple effect
     */
    createAttachmentRipple() {
        const cursorPos = CursorTracker.getPosition();
        
        const ripple = document.createElement('div');
        ripple.className = 'attachment-ripple';
        ripple.style.left = `${cursorPos.x}px`;
        ripple.style.top = `${cursorPos.y}px`;
        ripple.style.transform = 'translate(-50%, -50%)';
        
        document.querySelector('.app-container').appendChild(ripple);
        
        // Remove after animation
        setTimeout(() => {
            ripple.remove();
        }, 800);
    },
    
    /**
     * Create detachment particles
     */
    createDetachmentParticles() {
        if (!CONFIG.effects.enableParticles) return;
        
        const parasitePos = Parasite.getPosition();
        const particleCount = CONFIG.effects.detachmentParticles;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle red';
            
            const size = Utils.random(3, 6);
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${parasitePos.x}px`;
            particle.style.top = `${parasitePos.y}px`;
            
            // Random direction
            const angle = Utils.random(0, Math.PI * 2);
            const distance = Utils.random(30, 80);
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.animation = 'particleBurst 0.6s ease-out forwards';
            
            document.querySelector('.app-container').appendChild(particle);
            
            // Remove after animation
            setTimeout(() => {
                particle.remove();
            }, 600);
        }
    },
    
    /**
     * Create haptic pulse effect
     */
    createHapticPulse() {
        const cursorPos = CursorTracker.getPosition();
        
        const pulse = document.createElement('div');
        pulse.className = 'haptic-pulse';
        pulse.style.left = `${cursorPos.x}px`;
        pulse.style.top = `${cursorPos.y}px`;
        pulse.style.transform = 'translate(-50%, -50%)';
        
        document.querySelector('.app-container').appendChild(pulse);
        
        // Remove after animation
        setTimeout(() => {
            pulse.remove();
        }, 400);
    },
    
    /**
     * Update connection line between cursor and parasite
     */
    updateConnectionLine() {
        if (!this.connectionLine) return;
        
        const cursorPos = CursorTracker.getPosition();
        const parasitePos = Parasite.getPosition();
        
        // Calculate line properties
        const dx = parasitePos.x - cursorPos.x;
        const dy = parasitePos.y - cursorPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Update line
        this.connectionLine.style.left = `${cursorPos.x}px`;
        this.connectionLine.style.top = `${cursorPos.y}px`;
        this.connectionLine.style.width = `${distance}px`;
        this.connectionLine.style.transform = `rotate(${angle}rad)`;
        this.connectionLine.classList.add('active');
    },
    
    /**
     * Show connection line
     */
    showConnectionLine() {
        if (this.connectionLine) {
            this.connectionLine.classList.add('active');
        }
    },
    
    /**
     * Hide connection line
     */
    hideConnectionLine() {
        if (this.connectionLine) {
            this.connectionLine.classList.remove('active');
        }
    },
    
    /**
     * Get attachment strength
     * @returns {number} Strength (0-1)
     */
    getStrength() {
        return this.strength;
    },
    
    /**
     * Get attachment duration
     * @returns {number} Duration in milliseconds
     */
    getAttachmentDuration() {
        if (!this.isAttached) return 0;
        return performance.now() - this.attachmentStartTime;
    },
    
    /**
     * Check if attached
     * @returns {boolean} True if attached
     */
    isCurrentlyAttached() {
        return this.isAttached;
    },
    
    /**
     * Check if touching
     * @returns {boolean} True if touching
     */
    isCurrentlyTouching() {
        return this.isTouching;
    },
    
    /**
     * Decrease strength (used by detachment system)
     * @param {number} amount - Amount to decrease
     */
    decreaseStrength(amount) {
        this.strength = Math.max(
            this.strength - amount,
            CONFIG.attachment.minStrength
        );
    },
    
    /**
     * Reset attachment system
     */
    reset() {
        this.strength = 0;
        this.isAttached = false;
        this.isTouching = false;
        this.touchFrames = 0;
        this.hideConnectionLine();
    }
    
};
