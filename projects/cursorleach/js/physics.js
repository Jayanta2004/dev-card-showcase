/**
 * Physics Engine
 * Handles physics calculations, velocity tracking, and motion analysis
 */

const Physics = {
    
    /**
     * Initialize physics state
     */
    init() {
        this.velocityHistory = [];
        this.accelerationHistory = [];
        this.maxHistorySize = CONFIG.detachment.historySize;
        this.lastPosition = { x: 0, y: 0 };
        this.lastVelocity = { x: 0, y: 0 };
        this.lastTime = performance.now();
    },
    
    /**
     * Calculate velocity from position change
     * @param {Object} currentPos - Current position {x, y}
     * @param {Object} previousPos - Previous position {x, y}
     * @param {number} deltaTime - Time elapsed in seconds
     * @returns {Object} Velocity {x, y, magnitude}
     */
    calculateVelocity(currentPos, previousPos, deltaTime) {
        if (deltaTime === 0) {
            return { x: 0, y: 0, magnitude: 0 };
        }
        
        const vx = (currentPos.x - previousPos.x) / deltaTime;
        const vy = (currentPos.y - previousPos.y) / deltaTime;
        const magnitude = Math.sqrt(vx * vx + vy * vy);
        
        return { x: vx, y: vy, magnitude };
    },
    
    /**
     * Calculate acceleration from velocity change
     * @param {Object} currentVel - Current velocity {x, y}
     * @param {Object} previousVel - Previous velocity {x, y}
     * @param {number} deltaTime - Time elapsed in seconds
     * @returns {Object} Acceleration {x, y, magnitude}
     */
    calculateAcceleration(currentVel, previousVel, deltaTime) {
        if (deltaTime === 0) {
            return { x: 0, y: 0, magnitude: 0 };
        }
        
        const ax = (currentVel.x - previousVel.x) / deltaTime;
        const ay = (currentVel.y - previousVel.y) / deltaTime;
        const magnitude = Math.sqrt(ax * ax + ay * ay);
        
        return { x: ax, y: ay, magnitude };
    },
    
    /**
     * Calculate jerk (rate of change of acceleration)
     * @returns {number} Jerk magnitude
     */
    calculateJerk() {
        if (this.accelerationHistory.length < 2) {
            return 0;
        }
        
        const recent = this.accelerationHistory[this.accelerationHistory.length - 1];
        const previous = this.accelerationHistory[this.accelerationHistory.length - 2];
        
        const deltaTime = 1 / CONFIG.performance.targetFPS;
        const jerkX = (recent.x - previous.x) / deltaTime;
        const jerkY = (recent.y - previous.y) / deltaTime;
        
        return Math.sqrt(jerkX * jerkX + jerkY * jerkY);
    },
    
    /**
     * Update physics state with new position
     * @param {Object} position - Current position {x, y}
     * @param {number} currentTime - Current timestamp
     * @returns {Object} Physics data
     */
    update(position, currentTime = performance.now()) {
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        
        // Calculate velocity
        const velocity = this.calculateVelocity(
            position,
            this.lastPosition,
            deltaTime
        );
        
        // Calculate acceleration
        const acceleration = this.calculateAcceleration(
            velocity,
            this.lastVelocity,
            deltaTime
        );
        
        // Store in history
        this.velocityHistory.push(velocity);
        this.accelerationHistory.push(acceleration);
        
        // Trim history to max size
        if (this.velocityHistory.length > this.maxHistorySize) {
            this.velocityHistory.shift();
        }
        if (this.accelerationHistory.length > this.maxHistorySize) {
            this.accelerationHistory.shift();
        }
        
        // Calculate jerk
        const jerk = this.calculateJerk();
        
        // Update state
        this.lastPosition = { ...position };
        this.lastVelocity = { ...velocity };
        this.lastTime = currentTime;
        
        return {
            velocity,
            acceleration,
            jerk,
            speed: velocity.magnitude
        };
    },
    
    /**
     * Get average velocity over recent frames
     * @param {number} frames - Number of frames to average
     * @returns {Object} Average velocity {x, y, magnitude}
     */
    getAverageVelocity(frames = 5) {
        if (this.velocityHistory.length === 0) {
            return { x: 0, y: 0, magnitude: 0 };
        }
        
        const count = Math.min(frames, this.velocityHistory.length);
        const recent = this.velocityHistory.slice(-count);
        
        const sum = recent.reduce(
            (acc, vel) => ({
                x: acc.x + vel.x,
                y: acc.y + vel.y
            }),
            { x: 0, y: 0 }
        );
        
        const avg = {
            x: sum.x / count,
            y: sum.y / count
        };
        
        avg.magnitude = Math.sqrt(avg.x * avg.x + avg.y * avg.y);
        
        return avg;
    },
    
    /**
     * Check if motion is erratic (many direction changes)
     * @param {number} threshold - Direction change threshold (0-1)
     * @returns {boolean} True if erratic
     */
    isErraticMotion(threshold = CONFIG.detachment.directionChangeThreshold) {
        if (this.velocityHistory.length < 3) {
            return false;
        }
        
        let directionChanges = 0;
        
        for (let i = 1; i < this.velocityHistory.length; i++) {
            const prev = this.velocityHistory[i - 1];
            const curr = this.velocityHistory[i];
            
            // Normalize vectors
            const prevNorm = Utils.normalize(prev.x, prev.y);
            const currNorm = Utils.normalize(curr.x, curr.y);
            
            // Calculate dot product to measure direction similarity
            const dotProduct = Utils.dotProduct(
                prevNorm.x, prevNorm.y,
                currNorm.x, currNorm.y
            );
            
            // If dot product is below threshold, it's a significant direction change
            if (dotProduct < threshold) {
                directionChanges++;
            }
        }
        
        return directionChanges >= CONFIG.detachment.erraticThreshold;
    },
    
    /**
     * Apply easing function to value
     * @param {number} t - Time value (0-1)
     * @param {string} easingType - Type of easing
     * @returns {number} Eased value
     */
    applyEasing(t, easingType = 'linear') {
        switch (easingType) {
            case 'quadratic':
                return Utils.easeInOutQuad(t);
            case 'cubic':
                return Utils.easeInOutCubic(t);
            case 'elastic':
                return Utils.easeOutElastic(t);
            default:
                return t; // Linear
        }
    },
    
    /**
     * Calculate interpolated position with easing
     * @param {Object} start - Start position {x, y}
     * @param {Object} end - End position {x, y}
     * @param {number} factor - Interpolation factor (0-1)
     * @param {string} easing - Easing type
     * @returns {Object} Interpolated position {x, y}
     */
    interpolatePosition(start, end, factor, easing = 'linear') {
        const easedFactor = this.applyEasing(factor, easing);
        
        return {
            x: Utils.lerp(start.x, end.x, easedFactor),
            y: Utils.lerp(start.y, end.y, easedFactor)
        };
    },
    
    /**
     * Apply arrival behavior (slow down when near target)
     * @param {Object} currentPos - Current position
     * @param {Object} targetPos - Target position
     * @param {number} speed - Current speed
     * @param {number} arrivalRadius - Radius to start slowing down
     * @returns {number} Modified speed
     */
    applyArrival(currentPos, targetPos, speed, arrivalRadius) {
        const distance = Utils.distance(
            currentPos.x, currentPos.y,
            targetPos.x, targetPos.y
        );
        
        if (distance < arrivalRadius) {
            const damping = CONFIG.parasitePhysics.arrivalDamping;
            const factor = distance / arrivalRadius;
            return speed * factor * damping;
        }
        
        return speed;
    },
    
    /**
     * Apply adaptive speed based on distance
     * @param {number} distance - Distance to target
     * @param {number} baseSpeed - Base speed
     * @returns {number} Modified speed
     */
    applyAdaptiveSpeed(distance, baseSpeed) {
        if (!CONFIG.parasitePhysics.adaptiveSpeed) {
            return baseSpeed;
        }
        
        const boostThreshold = CONFIG.parasitePhysics.speedBoostDistance;
        const boostMultiplier = CONFIG.parasitePhysics.speedBoost;
        
        if (distance > boostThreshold) {
            const factor = Math.min(distance / boostThreshold, 2);
            return baseSpeed * factor * boostMultiplier;
        }
        
        return baseSpeed;
    },
    
    /**
     * Add random unpredictability to movement
     * @param {Object} position - Position to perturb {x, y}
     * @param {number} intensity - Perturbation intensity
     * @returns {Object} Perturbed position {x, y}
     */
    addUnpredictability(position, intensity = CONFIG.parasitePhysics.unpredictability) {
        return {
            x: position.x + Utils.random(-intensity, intensity),
            y: position.y + Utils.random(-intensity, intensity)
        };
    },
    
    /**
     * Apply damping to velocity
     * @param {Object} velocity - Velocity to damp {x, y}
     * @param {number} damping - Damping factor (0-1)
     * @returns {Object} Damped velocity {x, y}
     */
    applyDamping(velocity, damping) {
        return {
            x: velocity.x * damping,
            y: velocity.y * damping
        };
    },
    
    /**
     * Calculate spring force for elastic movement
     * @param {Object} currentPos - Current position
     * @param {Object} targetPos - Target position
     * @param {number} stiffness - Spring stiffness
     * @param {number} damping - Spring damping
     * @param {Object} currentVel - Current velocity
     * @returns {Object} Force vector {x, y}
     */
    calculateSpringForce(currentPos, targetPos, stiffness, damping, currentVel) {
        const dx = targetPos.x - currentPos.x;
        const dy = targetPos.y - currentPos.y;
        
        const forceX = dx * stiffness - currentVel.x * damping;
        const forceY = dy * stiffness - currentVel.y * damping;
        
        return { x: forceX, y: forceY };
    },
    
    /**
     * Reset physics state
     */
    reset() {
        this.velocityHistory = [];
        this.accelerationHistory = [];
        this.lastVelocity = { x: 0, y: 0 };
    },
    
    /**
     * Get current speed
     * @returns {number} Current speed magnitude
     */
    getCurrentSpeed() {
        return this.lastVelocity.magnitude || 0;
    },
    
    /**
     * Check if moving rapidly
     * @returns {boolean} True if rapid movement
     */
    isRapidMovement() {
        const avgVel = this.getAverageVelocity();
        return avgVel.magnitude > CONFIG.detachment.velocityThreshold;
    }
    
};

// Initialize physics on load
Physics.init();
