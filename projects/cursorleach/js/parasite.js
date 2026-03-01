/**
 * Parasite Controller
 * Manages parasite behavior, movement, and AI
 */

const Parasite = {
    
    /**
     * Initialize parasite
     */
    init() {
        // Position and movement
        this.position = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.speed = 0;
        
        // State
        this.isActive = false;
        this.isVisible = true;
        
        // DOM elements
        this.element = document.getElementById('parasite');
        this.core = this.element?.querySelector('.parasite-core');
        this.glow = this.element?.querySelector('.parasite-glow');
        this.pulse = this.element?.querySelector('.parasite-pulse');
        
        // Timing
        this.spawnDelay = CONFIG.gameplay.initialDelay;
        this.spawnTime = 0;
        this.lastUpdateTime = performance.now();
        
        // Movement parameters
        this.interpolationSpeed = CONFIG.parasitePhysics.interpolationSpeed;
        this.maxSpeed = CONFIG.parasitePhysics.maxSpeed;
        this.acceleration = CONFIG.parasitePhysics.acceleration;
        this.deceleration = CONFIG.parasitePhysics.deceleration;
        
        // Vibration (when attached)
        this.vibrationOffset = { x: 0, y: 0 };
        this.vibrationTime = 0;
        
        // Initialize at spawn position
        this.respawn();
    },
    
    /**
     * Spawn or respawn parasite
     */
    respawn() {
        // Get cursor position
        const cursorPos = CursorTracker.getPosition();
        
        // Spawn at distance from cursor
        const angle = Utils.random(0, Math.PI * 2);
        const distance = CONFIG.gameplay.spawnDistance;
        
        this.position.x = cursorPos.x + Math.cos(angle) * distance;
        this.position.y = cursorPos.y + Math.sin(angle) * distance;
        
        // Constrain to screen bounds
        this.position.x = Utils.clamp(this.position.x, 50, window.innerWidth - 50);
        this.position.y = Utils.clamp(this.position.y, 50, window.innerHeight - 50);
        
        // Reset velocity
        this.velocity = { x: 0, y: 0 };
        this.speed = 0;
        
        // Set spawn time
        this.spawnTime = performance.now();
        this.isActive = false;
        
        // Update visual position
        this.updateVisualPosition();
    },
    
    /**
     * Update parasite logic
     * @param {number} deltaTime - Time elapsed since last update (ms)
     * @param {string} state - Current game state
     */
    update(deltaTime, state) {
        const currentTime = performance.now();
        
        // Check if spawn delay has passed
        if (!this.isActive && currentTime - this.spawnTime >= this.spawnDelay) {
            this.isActive = true;
        }
        
        // Only update movement if active
        if (this.isActive) {
            // Update based on state
            switch (state) {
                case CONFIG.states.FREE:
                case CONFIG.states.APPROACHING:
                    this.updateChaseMovement(deltaTime);
                    break;
                    
                case CONFIG.states.TOUCHING:
                    this.updateTouchingMovement(deltaTime);
                    break;
                    
                case CONFIG.states.ATTACHED:
                    this.updateAttachedMovement(deltaTime);
                    break;
                    
                case CONFIG.states.DETACHING:
                    this.updateDetachingMovement(deltaTime);
                    break;
            }
        }
        
        // Update visual position
        this.updateVisualPosition();
        
        this.lastUpdateTime = currentTime;
    },
    
    /**
     * Update chase movement (following cursor)
     * @param {number} deltaTime - Time delta
     */
    updateChaseMovement(deltaTime) {
        // Get target (cursor position)
        const cursorPos = CursorTracker.getPosition();
        this.targetPosition = { ...cursorPos };
        
        // Calculate direction to target
        const dx = this.targetPosition.x - this.position.x;
        const dy = this.targetPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const dirX = distance > 0 ? dx / distance : 0;
        const dirY = distance > 0 ? dy / distance : 0;
        
        // Apply adaptive speed based on distance
        let targetSpeed = this.maxSpeed;
        targetSpeed = Physics.applyAdaptiveSpeed(distance, targetSpeed);
        
        // Apply arrival behavior (slow down near target)
        targetSpeed = Physics.applyArrival(
            this.position,
            this.targetPosition,
            targetSpeed,
            CONFIG.parasitePhysics.arrivalRadius
        );
        
        // Update velocity with acceleration
        this.velocity.x += dirX * this.acceleration;
        this.velocity.y += dirY * this.acceleration;
        
        // Limit velocity to max speed
        const currentSpeed = Math.sqrt(
            this.velocity.x * this.velocity.x + 
            this.velocity.y * this.velocity.y
        );
        
        if (currentSpeed > targetSpeed) {
            this.velocity.x = (this.velocity.x / currentSpeed) * targetSpeed;
            this.velocity.y = (this.velocity.y / currentSpeed) * targetSpeed;
        }
        
        // Apply deceleration
        this.velocity.x *= this.deceleration;
        this.velocity.y *= this.deceleration;
        
        // Apply smoothing with interpolation
        const smoothingFactor = CONFIG.parasitePhysics.smoothingFactor;
        
        // Calculate new position with easing
        const newPos = Physics.interpolatePosition(
            this.position,
            {
                x: this.position.x + this.velocity.x,
                y: this.position.y + this.velocity.y
            },
            smoothingFactor,
            CONFIG.parasitePhysics.easing
        );
        
        // Add unpredictability
        if (CONFIG.parasitePhysics.unpredictability > 0) {
            const perturbation = CONFIG.parasitePhysics.unpredictability * 10;
            newPos.x += Utils.random(-perturbation, perturbation);
            newPos.y += Utils.random(-perturbation, perturbation);
        }
        
        // Update position
        this.position = newPos;
        
        // Store speed
        this.speed = currentSpeed;
    },
    
    /**
     * Update movement when touching cursor
     * @param {number} deltaTime - Time delta
     */
    updateTouchingMovement(deltaTime) {
        // Continue following but with reduced intensity
        const cursorPos = CursorTracker.getPosition();
        
        // Interpolate directly to cursor position
        this.position.x = Utils.lerp(
            this.position.x,
            cursorPos.x,
            this.interpolationSpeed * 1.5
        );
        this.position.y = Utils.lerp(
            this.position.y,
            cursorPos.y,
            this.interpolationSpeed * 1.5
        );
    },
    
    /**
     * Update movement when attached
     * @param {number} deltaTime - Time delta
     */
    updateAttachedMovement(deltaTime) {
        // Stick to cursor with vibration
        const cursorPos = CursorTracker.getPosition();
        
        // Calculate vibration offset
        this.vibrationTime += deltaTime;
        const vibrationFreq = CONFIG.attachment.vibrationFrequency;
        const vibrationIntensity = CONFIG.attachment.vibrationIntensity;
        
        this.vibrationOffset.x = Math.sin(this.vibrationTime * vibrationFreq * 10) * vibrationIntensity;
        this.vibrationOffset.y = Math.cos(this.vibrationTime * vibrationFreq * 15) * vibrationIntensity;
        
        // Set position to cursor + vibration
        this.position.x = cursorPos.x + this.vibrationOffset.x;
        this.position.y = cursorPos.y + this.vibrationOffset.y;
        
        // Reset velocity
        this.velocity = { x: 0, y: 0 };
        this.speed = 0;
    },
    
    /**
     * Update movement when detaching
     * @param {number} deltaTime - Time delta
     */
    updateDetachingMovement(deltaTime) {
        // Add shake/struggle effect
        const shakeIntensity = 5;
        this.position.x += Utils.random(-shakeIntensity, shakeIntensity);
        this.position.y += Utils.random(-shakeIntensity, shakeIntensity);
        
        // Try to maintain attachment
        const cursorPos = CursorTracker.getPosition();
        this.position.x = Utils.lerp(this.position.x, cursorPos.x, 0.3);
        this.position.y = Utils.lerp(this.position.y, cursorPos.y, 0.3);
    },
    
    /**
     * Update visual position in DOM
     */
    updateVisualPosition() {
        if (!this.element) return;
        
        this.element.style.transform = 
            `translate(${this.position.x}px, ${this.position.y}px)`;
    },
    
    /**
     * Get current parasite position
     * @returns {Object} Position {x, y}
     */
    getPosition() {
        return { ...this.position };
    },
    
    /**
     * Get distance to cursor
     * @returns {number} Distance
     */
    getDistanceToCursor() {
        const cursorPos = CursorTracker.getPosition();
        return Utils.distance(
            this.position.x, this.position.y,
            cursorPos.x, cursorPos.y
        );
    },
    
    /**
     * Check if parasite is touching cursor
     * @returns {boolean} True if touching
     */
    isTouchingCursor() {
        const distance = this.getDistanceToCursor();
        return distance <= CONFIG.attachment.detectionRadius;
    },
    
    /**
     * Set parasite state class
     * @param {string} state - State name
     */
    setState(state) {
        if (!this.element) return;
        
        // Remove all state classes
        this.element.classList.remove(
            'approaching', 'touching', 'attached', 'detaching'
        );
        
        // Add new state class
        if (state && state !== CONFIG.states.FREE) {
            this.element.classList.add(state);
        }
    },
    
    /**
     * Show parasite
     */
    show() {
        if (!this.element) return;
        this.element.classList.remove('hidden');
        this.isVisible = true;
    },
    
    /**
     * Hide parasite
     */
    hide() {
        if (!this.element) return;
        this.element.classList.add('hidden');
        this.isVisible = false;
    },
    
    /**
     * Set parasite size
     * @param {number} size - Size in pixels
     */
    setSize(size) {
        if (this.core) {
            this.core.style.width = `${size}px`;
            this.core.style.height = `${size}px`;
        }
    },
    
    /**
     * Reset parasite size to default
     */
    resetSize() {
        this.setSize(CONFIG.parasite.size);
    },
    
    /**
     * Pulse animation
     */
    pulse() {
        if (!this.glow) return;
        
        this.glow.style.animation = 'none';
        setTimeout(() => {
            this.glow.style.animation = '';
        }, 10);
    },
    
    /**
     * Get current speed
     * @returns {number} Speed
     */
    getSpeed() {
        return this.speed;
    },
    
    /**
     * Set position directly
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.updateVisualPosition();
    },
    
    /**
     * Reset vibration
     */
    resetVibration() {
        this.vibrationOffset = { x: 0, y: 0 };
        this.vibrationTime = 0;
    },
    
    /**
     * Enable/disable parasite
     * @param {boolean} active - Active state
     */
    setActive(active) {
        this.isActive = active;
        if (active) {
            this.show();
        } else {
            this.hide();
        }
    }
    
};
