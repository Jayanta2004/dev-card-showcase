/**
 * LiquidInput - Physics Engine Module
 * 
 * Handles all physics simulations including gravity, collision detection,
 * bounce physics, friction, and boundary constraints.
 * 
 * Provides realistic motion for spilled particles.
 */

const Physics = (function () {
    'use strict';

    // ========================================================================
    // Private Variables
    // ========================================================================

    let spatialGrid = new Map();
    let gridCellSize = CONFIG.performance.spatialGridSize;

    // ========================================================================
    // Gravity Application
    // ========================================================================

    /**
     * Apply gravitational force to a particle
     * @param {Object} particle - Particle object
     * @param {number} deltaTime - Time elapsed since last frame (seconds)
     */
    function applyGravity(particle, deltaTime) {
        if (!particle || particle.state === 'calm') return;

        // Apply downward acceleration
        particle.velocityY += CONFIG.physics.gravity * deltaTime;

        // Cap maximum velocity
        if (particle.velocityY > CONFIG.physics.maxVelocity) {
            particle.velocityY = CONFIG.physics.maxVelocity;
        }
    }

    // ========================================================================
    // Friction and Air Resistance
    // ========================================================================

    /**
     * Apply friction and air resistance to a particle
     * @param {Object} particle - Particle object
     */
    function applyFriction(particle) {
        if (!particle) return;

        // Air resistance
        particle.velocityX *= CONFIG.physics.airResistance;
        particle.velocityY *= CONFIG.physics.airResistance;

        // Ground friction (when particle is on or near ground)
        if (particle.onGround) {
            particle.velocityX *= CONFIG.physics.groundFriction;
        }

        // Stop particle if velocity is below threshold
        if (Math.abs(particle.velocityX) < CONFIG.physics.minVelocity) {
            particle.velocityX = 0;
        }
        if (Math.abs(particle.velocityY) < CONFIG.physics.minVelocity && particle.onGround) {
            particle.velocityY = 0;
        }
    }

    // ========================================================================
    // Boundary Collision Detection
    // ========================================================================

    /**
     * Check and resolve collision with boundaries
     * @param {Object} particle - Particle object
     * @param {Object} boundaries - Boundary constraints
     */
    function constrainToBounds(particle, boundaries) {
        if (!particle || !boundaries) return;

        const margin = CONFIG.boundaries.margin;
        const radius = particle.size / 2;

        particle.onGround = false;

        // Left boundary
        if (particle.x - radius < boundaries.left + margin) {
            particle.x = boundaries.left + margin + radius;
            particle.velocityX = Math.abs(particle.velocityX) * CONFIG.physics.wallBounceDamping;
        }

        // Right boundary
        if (particle.x + radius > boundaries.right - margin) {
            particle.x = boundaries.right - margin - radius;
            particle.velocityX = -Math.abs(particle.velocityX) * CONFIG.physics.wallBounceDamping;
        }

        // Top boundary
        if (particle.y - radius < boundaries.top + margin) {
            particle.y = boundaries.top + margin + radius;
            particle.velocityY = Math.abs(particle.velocityY) * CONFIG.physics.wallBounceDamping;
        }

        // Bottom boundary (ground)
        if (particle.y + radius > boundaries.bottom - margin) {
            particle.y = boundaries.bottom - margin - radius;
            particle.velocityY = -Math.abs(particle.velocityY) * CONFIG.physics.bounce;
            particle.onGround = true;

            // Stop bouncing if velocity is too low
            if (Math.abs(particle.velocityY) < CONFIG.physics.minVelocity * 2) {
                particle.velocityY = 0;
            }
        }
    }

    // ========================================================================
    // Spatial Partitioning (Optimization)
    // ========================================================================

    /**
     * Get grid cell key for a position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {string} Grid cell key
     */
    function getGridKey(x, y) {
        const cellX = Math.floor(x / gridCellSize);
        const cellY = Math.floor(y / gridCellSize);
        return `${cellX},${cellY}`;
    }

    /**
     * Build spatial grid from particles
     * @param {Array} particles - Array of particle objects
     */
    function buildSpatialGrid(particles) {
        spatialGrid.clear();

        particles.forEach((particle, index) => {
            const key = getGridKey(particle.x, particle.y);
            if (!spatialGrid.has(key)) {
                spatialGrid.set(key, []);
            }
            spatialGrid.get(key).push(index);
        });
    }

    /**
     * Get nearby particles using spatial grid
     * @param {Object} particle - Particle object
     * @param {Array} allParticles - Array of all particles
     * @returns {Array} Array of nearby particle indices
     */
    function getNearbyParticles(particle, allParticles) {
        const nearby = [];
        const cellX = Math.floor(particle.x / gridCellSize);
        const cellY = Math.floor(particle.y / gridCellSize);

        // Check current cell and 8 neighboring cells
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cellX + dx},${cellY + dy}`;
                if (spatialGrid.has(key)) {
                    nearby.push(...spatialGrid.get(key));
                }
            }
        }

        return nearby;
    }

    // ========================================================================
    // Particle-to-Particle Collision Detection
    // ========================================================================

    /**
     * Check if two particles are colliding
     * @param {Object} p1 - First particle
     * @param {Object} p2 - Second particle
     * @returns {boolean} True if colliding
     */
    function areColliding(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (p1.size + p2.size) / 2 * CONFIG.particles.collisionRadiusMultiplier;

        return distance < minDistance;
    }

    /**
     * Resolve collision between two particles
     * @param {Object} p1 - First particle
     * @param {Object} p2 - Second particle
     */
    function resolveCollision(p1, p2) {
        // Calculate collision vector
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return; // Prevent division by zero

        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;

        // Calculate relative velocity
        const dvx = p2.velocityX - p1.velocityX;
        const dvy = p2.velocityY - p1.velocityY;

        // Calculate relative velocity along collision normal
        const dotProduct = dvx * nx + dvy * ny;

        // Don't resolve if particles are moving apart
        if (dotProduct > 0) return;

        // Apply collision impulse
        const impulse = dotProduct * CONFIG.physics.collisionDamping;

        p1.velocityX -= impulse * nx;
        p1.velocityY -= impulse * ny;
        p2.velocityX += impulse * nx;
        p2.velocityY += impulse * ny;

        // Separate overlapping particles
        const overlap = (p1.size + p2.size) / 2 - distance;
        if (overlap > 0) {
            const separationX = nx * overlap * 0.5;
            const separationY = ny * overlap * 0.5;

            p1.x -= separationX;
            p1.y -= separationY;
            p2.x += separationX;
            p2.y += separationY;
        }
    }

    /**
     * Detect and resolve all particle collisions
     * @param {Array} particles - Array of particle objects
     */
    function detectCollisions(particles) {
        if (!CONFIG.performance.useSpatialPartitioning) {
            // Brute force collision detection (O(n²))
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    if (areColliding(particles[i], particles[j])) {
                        resolveCollision(particles[i], particles[j]);
                    }
                }
            }
        } else {
            // Optimized collision detection using spatial partitioning
            buildSpatialGrid(particles);

            for (let i = 0; i < particles.length; i++) {
                const nearbyIndices = getNearbyParticles(particles[i], particles);

                for (const j of nearbyIndices) {
                    if (i < j && areColliding(particles[i], particles[j])) {
                        resolveCollision(particles[i], particles[j]);
                    }
                }
            }
        }
    }

    // ========================================================================
    // Update Particle Position
    // ========================================================================

    /**
     * Update particle position based on velocity
     * @param {Object} particle - Particle object
     * @param {number} deltaTime - Time elapsed since last frame (seconds)
     */
    function updatePosition(particle, deltaTime) {
        if (!particle) return;

        particle.x += particle.velocityX * deltaTime;
        particle.y += particle.velocityY * deltaTime;
    }

    // ========================================================================
    // Liquid Physics (Calm State)
    // ========================================================================

    /**
     * Apply liquid motion physics to particle
     * @param {Object} particle - Particle object
     * @param {number} time - Current time in seconds
     * @param {number} index - Particle index
     */
    function applyLiquidMotion(particle, time, index) {
        if (!CONFIG.liquid.enabled || particle.state !== 'calm') return;

        // Gentle bobbing motion
        const bobOffset = Math.sin(time * Math.PI * 2 * CONFIG.liquid.bobFrequency + index)
            * CONFIG.liquid.bobAmplitude;

        // Horizontal drift
        const driftOffset = Math.sin(time * CONFIG.liquid.driftSpeed * 0.01 + index * 0.5)
            * CONFIG.liquid.swirlRadius;

        // Apply liquid motion offsets
        particle.liquidOffsetX = driftOffset;
        particle.liquidOffsetY = bobOffset;

        // Apply viscosity to velocity
        particle.velocityX *= CONFIG.liquid.viscosity;
        particle.velocityY *= CONFIG.liquid.viscosity;
    }

    /**
     * Apply alignment force to keep particles in line
     * @param {Object} particle - Particle object
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {number} deltaTime - Time elapsed since last frame (seconds)
     */
    function applyAlignment(particle, targetX, targetY, deltaTime) {
        if (particle.state !== 'calm') return;

        const dx = targetX - particle.x;
        const dy = targetY - particle.y;

        const force = CONFIG.liquid.alignmentForce * deltaTime;

        particle.velocityX += dx * force;
        particle.velocityY += dy * force;
    }

    // ========================================================================
    // Burst Physics
    // ========================================================================

    /**
     * Apply explosive force to particle during burst
     * @param {Object} particle - Particle object
     * @param {number} centerX - Explosion center X
     * @param {number} centerY - Explosion center Y
     */
    function applyExplosiveForce(particle, centerX, centerY) {
        // Calculate direction from center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        // Normalize direction
        const nx = dx / distance;
        const ny = dy / distance;

        // Calculate force magnitude with randomness
        const forceMagnitude = CONFIG.burst.explosionForce *
            (1 + (Math.random() - 0.5) * CONFIG.burst.explosionRandomness);

        // Apply force
        particle.velocityX = nx * forceMagnitude;
        particle.velocityY = ny * forceMagnitude;

        // Add random rotation
        particle.rotation = Math.random() * 360;
        particle.rotationSpeed = (Math.random() - 0.5) * CONFIG.burst.rotationSpeed;
    }

    /**
     * Update particle rotation
     * @param {Object} particle - Particle object
     * @param {number} deltaTime - Time elapsed since last frame (seconds)
     */
    function updateRotation(particle, deltaTime) {
        if (particle.rotationSpeed) {
            particle.rotation += particle.rotationSpeed * deltaTime;

            // Dampen rotation over time
            particle.rotationSpeed *= 0.98;

            // Stop rotation if too slow
            if (Math.abs(particle.rotationSpeed) < 1) {
                particle.rotationSpeed = 0;
            }
        }
    }

    // ========================================================================
    // Public API
    // ========================================================================

    return {
        /**
         * Update physics for a single particle
         * @param {Object} particle - Particle object
         * @param {number} deltaTime - Time elapsed since last frame (seconds)
         * @param {Object} boundaries - Boundary constraints
         * @param {number} time - Current time in seconds
         * @param {number} index - Particle index
         */
        updateParticle(particle, deltaTime, boundaries, time, index) {
            if (particle.state === 'calm') {
                applyLiquidMotion(particle, time, index);
            } else {
                applyGravity(particle, deltaTime);
                applyFriction(particle);
            }

            updatePosition(particle, deltaTime);
            updateRotation(particle, deltaTime);
            constrainToBounds(particle, boundaries);
        },

        /**
         * Update physics for all particles
         * @param {Array} particles - Array of particle objects
         * @param {number} deltaTime - Time elapsed since last frame (seconds)
         * @param {Object} boundaries - Boundary constraints
         * @param {number} time - Current time in seconds
         */
        updateAll(particles, deltaTime, boundaries, time) {
            // Update individual particle physics
            particles.forEach((particle, index) => {
                this.updateParticle(particle, deltaTime, boundaries, time, index);
            });

            // Detect and resolve collisions
            detectCollisions(particles);
        },

        /**
         * Apply explosive force to all particles
         * @param {Array} particles - Array of particle objects
         * @param {number} centerX - Explosion center X
         * @param {number} centerY - Explosion center Y
         */
        explode(particles, centerX, centerY) {
            particles.forEach(particle => {
                applyExplosiveForce(particle, centerX, centerY);
                particle.state = 'burst';
            });
        },

        /**
         * Apply alignment force to particle
         * @param {Object} particle - Particle object
         * @param {number} targetX - Target X position
         * @param {number} targetY - Target Y position
         * @param {number} deltaTime - Time elapsed since last frame (seconds)
         */
        align(particle, targetX, targetY, deltaTime) {
            applyAlignment(particle, targetX, targetY, deltaTime);
        },

        /**
         * Reset spatial grid
         */
        resetSpatialGrid() {
            spatialGrid.clear();
        }
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Physics;
}
