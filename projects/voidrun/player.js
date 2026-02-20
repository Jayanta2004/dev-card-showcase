// player.js

class Player {
    constructor() {
        // Lane-based system - player runs on tunnel surface
        this.numLanes = 8; // 8 lanes around the tunnel
        this.currentLane = 0; // Start at top (0 degrees)
        this.targetLane = 0;
        this.tunnelRadius = 9; // Distance from center
        this.radiusOffset = 0; // For jump effect
        
        this.z = 0;
        this.radius = 0.8;
        this.speed = 0;
        this.baseSpeed = 20;
        this.maxSpeed = 60;
        this.acceleration = 0.5;
        this.laneChangeSpeed = 8; // How fast to move between lanes
        this.lives = 3;
        this.invulnerable = false;
        this.invulnerableTime = 0;
        this.invulnerableDuration = 2000;
        
        // Power-up states
        this.hasShield = false;
        this.shieldTime = 0;
        this.speedBoost = 0;
        this.boostTime = 0;
        this.scoreMultiplier = 1;
        this.multiplierTime = 0;
        
        // Jump mechanic
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = 50;
        
        this.keys = {
            left: false,
            right: false,
            jump: false
        };
        
        this.setupInput();
    }
    
    // Get actual world position from lane
    getPosition() {
        const angle = (this.currentLane / this.numLanes) * Math.PI * 2;
        const r = this.tunnelRadius + this.radiusOffset;
        return {
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r,
            z: this.z,
            angle: angle
        };
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = true;
            }
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                if (!this.isJumping) {
                    this.jump();
                }
            }
            if (e.key === 'Shift') {
                this.keys.boost = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys.right = false;
            }
            if (e.key === 'Shift') {
                this.keys.boost = false;
            }
        });
    }

    update(dt) {
        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerableTime -= dt * 1000;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update power-up timers
        if (this.hasShield) {
            this.shieldTime -= dt;
            if (this.shieldTime <= 0) {
                this.hasShield = false;
            }
        }
        
        if (this.speedBoost > 0) {
            this.boostTime -= dt;
            if (this.boostTime <= 0) {
                this.speedBoost = 0;
            }
        }
        
        if (this.scoreMultiplier > 1) {
            this.multiplierTime -= dt;
            if (this.multiplierTime <= 0) {
                this.scoreMultiplier = 1;
            }
        }

        // Lane-based movement (move around the tunnel)
        if (this.keys.left) {
            this.targetLane -= this.laneChangeSpeed * dt;
        }
        if (this.keys.right) {
            this.targetLane += this.laneChangeSpeed * dt;
        }

        // Smooth lane transition with wrapping using time-based decay
        let diff = this.targetLane - this.currentLane;
        
        // Handle wrapping (shortest path around circle)
        if (diff > this.numLanes / 2) {
            diff -= this.numLanes;
        } else if (diff < -this.numLanes / 2) {
            diff += this.numLanes;
        }
        
        // Frame-rate independent lerp: current = target + (current - target) * exp(-decay * dt)
        // We do it on the difference to handle the wrapping correctly
        const decay = 15; // Tuned for snappy but smooth movement
        const moveAmount = diff * (1 - Math.exp(-decay * dt));
        
        this.currentLane += moveAmount;
        
        // Wrap current lane to stay in bounds
        while (this.currentLane < 0) this.currentLane += this.numLanes;
        while (this.currentLane >= this.numLanes) this.currentLane -= this.numLanes;
        while (this.targetLane < 0) this.targetLane += this.numLanes;
        while (this.targetLane >= this.numLanes) this.targetLane -= this.numLanes;
        
        // Jump physics (moves away from tunnel surface)
        if (this.isJumping) {
            this.jumpVelocity -= this.gravity * dt;
            this.radiusOffset += this.jumpVelocity * dt;
            
            if (this.radiusOffset <= 0) {
                this.radiusOffset = 0;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }

        // Accelerate forward speed with boost
        const targetSpeed = this.keys.boost && this.speedBoost > 0 ? this.maxSpeed * 1.5 : this.maxSpeed;
        this.speed = Math.min(this.speed + this.acceleration * dt, targetSpeed);
    }

    hit() {
        if (this.invulnerable) return false;
        
        // Shield absorbs hit
        if (this.hasShield) {
            this.hasShield = false;
            this.shieldTime = 0;
            return false;
        }
        
        this.lives--;
        if (this.lives > 0) {
            this.invulnerable = true;
            this.invulnerableTime = this.invulnerableDuration;
        }
        return true;
    }

    reset() {
        this.currentLane = 0;
        this.targetLane = 0;
        this.radiusOffset = 0;
        this.z = 0;
        this.speed = this.baseSpeed;
        this.lives = 3;
        this.invulnerable = false;
        this.invulnerableTime = 0;
        this.hasShield = false;
        this.shieldTime = 0;
        this.speedBoost = 0;
        this.boostTime = 0;
        this.scoreMultiplier = 1;
        this.multiplierTime = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
    }
    
    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.jumpVelocity = 20; // Jump away from tunnel surface
        }
    }
    
    applySpeedBoost() {
        this.speedBoost = 1.5;
        this.boostTime = 5;
    }
    
    applyShield() {
        this.hasShield = true;
        this.shieldTime = 10;
    }
    
    applyMultiplier() {
        this.scoreMultiplier = 2;
        this.multiplierTime = 8;
    }

    isDead() {
        return this.lives <= 0;
    }
}