/**
 * RagdollWeb - Physics Engine
 * Handles pendulum physics, falling motion, gravity, and collision detection
 */

// ============================================
// PHYSICS CONSTANTS
// ============================================

const PHYSICS_CONFIG = {
    // Gravity and forces
    GRAVITY: 0.5,                    // Pixels per frame squared
    DAMPING: 0.98,                   // Energy loss per frame (0-1)
    AIR_RESISTANCE: 0.99,            // Air resistance for falling objects
    
    // Pendulum physics
    PENDULUM_GRAVITY: 0.4,           // Angular acceleration factor
    PENDULUM_DAMPING: 0.995,         // Angular velocity damping
    MAX_ANGLE: Math.PI / 6,          // Maximum swing angle (30 degrees)
    
    // Collision and bounce
    BOUNCE_ELASTICITY: 0.6,          // Energy retained on bounce (0-1)
    MIN_BOUNCE_VELOCITY: 0.5,        // Minimum velocity to trigger bounce
    FRICTION: 0.85,                  // Horizontal friction on landing
    COLLISION_THRESHOLD: 5,          // Pixels from footer to trigger collision
    
    // Performance
    FPS_TARGET: 60,
    DELTA_TIME: 1000 / 60,           // Target frame time in ms
    
    // Mouse interaction
    MOUSE_INFLUENCE_RADIUS: 100,     // Pixels
    MOUSE_FORCE_MULTIPLIER: 0.001,   // Force applied by mouse movement
};

// ============================================
// PENDULUM PHYSICS CLASS
// ============================================

class PendulumPhysics {
    constructor(element, stringLength, anchorX, anchorY) {
        this.element = element;
        this.stringLength = stringLength;
        this.anchorX = anchorX;
        this.anchorY = anchorY;
        
        // Angular physics properties
        this.angle = 0;                      // Current angle in radians
        this.angularVelocity = 0;            // Angular velocity
        this.angularAcceleration = 0;        // Angular acceleration
        
        // Initial random swing
        this.angle = (Math.random() - 0.5) * 0.2;
        this.angularVelocity = (Math.random() - 0.5) * 0.02;
        
        // State
        this.isActive = true;
        this.isCut = false;
    }
    
    /**
     * Update pendulum physics for one frame
     */
    update(mouseX, mouseY, mouseVelocity) {
        if (!this.isActive || this.isCut) return;
        
        // Calculate angular acceleration based on gravity
        // F = -g * sin(θ) / L
        this.angularAcceleration = 
            (-PHYSICS_CONFIG.PENDULUM_GRAVITY * Math.sin(this.angle)) / this.stringLength;
        
        // Apply mouse influence if nearby
        const elementX = this.anchorX + this.stringLength * Math.sin(this.angle);
        const elementY = this.anchorY + this.stringLength * Math.cos(this.angle);
        const distanceToMouse = Math.sqrt(
            Math.pow(mouseX - elementX, 2) + 
            Math.pow(mouseY - elementY, 2)
        );
        
        if (distanceToMouse < PHYSICS_CONFIG.MOUSE_INFLUENCE_RADIUS) {
            const influence = 1 - (distanceToMouse / PHYSICS_CONFIG.MOUSE_INFLUENCE_RADIUS);
            const mouseForce = mouseVelocity * PHYSICS_CONFIG.MOUSE_FORCE_MULTIPLIER * influence;
            this.angularVelocity += mouseForce;
        }
        
        // Update angular velocity
        this.angularVelocity += this.angularAcceleration;
        this.angularVelocity *= PHYSICS_CONFIG.PENDULUM_DAMPING;
        
        // Update angle
        this.angle += this.angularVelocity;
        
        // Constrain angle to prevent unrealistic swings
        this.angle = Math.max(-PHYSICS_CONFIG.MAX_ANGLE, 
                             Math.min(PHYSICS_CONFIG.MAX_ANGLE, this.angle));
    }
    
    /**
     * Get current position of the element
     */
    getPosition() {
        const x = this.anchorX + this.stringLength * Math.sin(this.angle);
        const y = this.anchorY + this.stringLength * Math.cos(this.angle);
        return { x, y, angle: this.angle };
    }
    
    /**
     * Cut the string and transition to falling physics
     */
    cut() {
        this.isCut = true;
        this.isActive = false;
        return {
            velocity: {
                x: this.angularVelocity * this.stringLength * Math.cos(this.angle),
                y: this.angularVelocity * this.stringLength * Math.sin(this.angle)
            },
            position: this.getPosition()
        };
    }
}

// ============================================
// FALLING PHYSICS CLASS
// ============================================

class FallingPhysics {
    constructor(element, initialX, initialY, initialVelocityX = 0, initialVelocityY = 0) {
        this.element = element;
        this.x = initialX;
        this.y = initialY;
        this.velocityX = initialVelocityX;
        this.velocityY = initialVelocityY;
        
        // Rotation for visual effect
        this.rotation = 0;
        this.rotationVelocity = (Math.random() - 0.5) * 0.3;
        
        // State
        this.isActive = true;
        this.isBouncing = false;
        this.hasLanded = false;
        this.bounceCount = 0;
        this.maxBounces = 3;
    }
    
    /**
     * Update falling physics for one frame
     */
    update(footerY) {
        if (!this.isActive || this.hasLanded) return;
        
        // Apply gravity
        this.velocityY += PHYSICS_CONFIG.GRAVITY;
        
        // Apply air resistance
        this.velocityX *= PHYSICS_CONFIG.AIR_RESISTANCE;
        this.velocityY *= PHYSICS_CONFIG.AIR_RESISTANCE;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update rotation
        this.rotation += this.rotationVelocity;
        this.rotationVelocity *= 0.98;
        
        // Check for collision with footer
        const elementHeight = this.element.offsetHeight || 50;
        if (this.y + elementHeight >= footerY - PHYSICS_CONFIG.COLLISION_THRESHOLD) {
            this.handleCollision(footerY, elementHeight);
        }
    }
    
    /**
     * Handle collision with footer
     */
    handleCollision(footerY, elementHeight) {
        // Position at footer
        this.y = footerY - elementHeight;
        
        // Check if velocity is high enough to bounce
        if (Math.abs(this.velocityY) > PHYSICS_CONFIG.MIN_BOUNCE_VELOCITY && 
            this.bounceCount < this.maxBounces) {
            // Bounce
            this.velocityY = -this.velocityY * PHYSICS_CONFIG.BOUNCE_ELASTICITY;
            this.velocityX *= PHYSICS_CONFIG.FRICTION;
            this.bounceCount++;
            this.isBouncing = true;
            
            // Trigger bounce animation
            this.element.classList.add('state-bouncing');
            setTimeout(() => {
                this.element.classList.remove('state-bouncing');
            }, 1000);
        } else {
            // Land permanently
            this.land();
        }
    }
    
    /**
     * Land the element permanently
     */
    land() {
        this.hasLanded = true;
        this.isActive = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.rotationVelocity = 0;
        
        // Trigger landing animation
        this.element.classList.remove('state-falling', 'state-bouncing');
        this.element.classList.add('state-landed');
    }
    
    /**
     * Get current position
     */
    getPosition() {
        return { 
            x: this.x, 
            y: this.y, 
            rotation: this.rotation,
            hasLanded: this.hasLanded
        };
    }
}

// ============================================
// PHYSICS MANAGER
// ============================================

class PhysicsManager {
    constructor() {
        this.pendulums = new Map();
        this.fallingObjects = new Map();
        this.lastFrameTime = performance.now();
        this.deltaTime = 0;
        this.fps = 60;
        
        // Mouse tracking for physics interaction
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseVelocity = 0;
    }
    
    /**
     * Add a pendulum to the physics simulation
     */
    addPendulum(id, element, stringLength, anchorX, anchorY) {
        const pendulum = new PendulumPhysics(element, stringLength, anchorX, anchorY);
        this.pendulums.set(id, pendulum);
        return pendulum;
    }
    
    /**
     * Cut a pendulum and convert to falling physics
     */
    cutPendulum(id) {
        const pendulum = this.pendulums.get(id);
        if (!pendulum || pendulum.isCut) return null;
        
        const cutData = pendulum.cut();
        this.pendulums.delete(id);
        
        // Create falling physics
        const fallingPhysics = new FallingPhysics(
            pendulum.element,
            cutData.position.x,
            cutData.position.y,
            cutData.velocity.x,
            cutData.velocity.y
        );
        this.fallingObjects.set(id, fallingPhysics);
        
        return cutData;
    }
    
    /**
     * Update mouse position for physics calculations
     */
    updateMouse(x, y) {
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        this.mouseX = x;
        this.mouseY = y;
        
        // Calculate mouse velocity
        const dx = this.mouseX - this.lastMouseX;
        const dy = this.mouseY - this.lastMouseY;
        this.mouseVelocity = Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Update all physics simulations
     */
    update(footerY) {
        // Calculate delta time
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Calculate FPS
        this.fps = Math.round(1000 / this.deltaTime);
        
        // Update all pendulums
        for (const [id, pendulum] of this.pendulums) {
            pendulum.update(this.mouseX, this.mouseY, this.mouseVelocity);
        }
        
        // Update all falling objects
        for (const [id, fallingObject] of this.fallingObjects) {
            fallingObject.update(footerY);
            
            // Remove if landed
            if (fallingObject.hasLanded) {
                this.fallingObjects.delete(id);
            }
        }
    }
    
    /**
     * Get position data for a specific element
     */
    getPosition(id) {
        if (this.pendulums.has(id)) {
            return this.pendulums.get(id).getPosition();
        }
        if (this.fallingObjects.has(id)) {
            return this.fallingObjects.get(id).getPosition();
        }
        return null;
    }
    
    /**
     * Check if an element is still hanging
     */
    isHanging(id) {
        return this.pendulums.has(id);
    }
    
    /**
     * Get statistics
     */
    getStats() {
        return {
            fps: this.fps,
            activeElements: this.pendulums.size + this.fallingObjects.size,
            hangingElements: this.pendulums.size,
            fallingElements: this.fallingObjects.size
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PhysicsManager = PhysicsManager;
    window.PHYSICS_CONFIG = PHYSICS_CONFIG;
}
