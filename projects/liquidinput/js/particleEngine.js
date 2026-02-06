/**
 * LiquidInput - Particle Engine Module
 * 
 * Core particle system with canvas rendering, particle lifecycle management,
 * object pooling, and visual state handling.
 * 
 * Renders characters as particles with liquid motion and burst effects.
 */

const ParticleEngine = (function () {
    'use strict';

    // ========================================================================
    // Private Variables
    // ========================================================================

    let canvas = null;
    let ctx = null;
    let particles = [];
    let particlePool = [];
    let nextParticleId = 0;
    let lastFrameTime = 0;
    let currentTime = 0;

    // ========================================================================
    // Particle Class
    // ========================================================================

    class Particle {
        constructor(char, x, y, state = 'calm') {
            this.id = nextParticleId++;
            this.char = char;
            this.x = x;
            this.y = y;
            this.velocityX = 0;
            this.velocityY = 0;
            this.state = state;
            this.size = CONFIG.particles.defaultSize;
            this.color = CONFIG.colors.calm;
            this.alpha = 1;
            this.rotation = 0;
            this.rotationSpeed = 0;
            this.onGround = false;
            this.liquidOffsetX = 0;
            this.liquidOffsetY = 0;
            this.spawnTime = currentTime;
            this.lifetime = CONFIG.particles.calmLifetime;
            this.isFading = false;
        }

        /**
         * Reset particle to default state (for object pooling)
         */
        reset(char, x, y, state = 'calm') {
            this.char = char;
            this.x = x;
            this.y = y;
            this.velocityX = 0;
            this.velocityY = 0;
            this.state = state;
            this.size = CONFIG.particles.defaultSize;
            this.color = CONFIG.colors.calm;
            this.alpha = 1;
            this.rotation = 0;
            this.rotationSpeed = 0;
            this.onGround = false;
            this.liquidOffsetX = 0;
            this.liquidOffsetY = 0;
            this.spawnTime = currentTime;
            this.lifetime = CONFIG.particles.calmLifetime;
            this.isFading = false;
        }

        /**
         * Update particle color based on state
         * @param {number} pressure - Current pressure level
         */
        updateColor(pressure) {
            if (this.state === 'calm') {
                this.color = CONFIG.getColorForPressure(pressure);
            } else if (this.state === 'burst' || this.state === 'spilled') {
                this.color = CONFIG.colors.spilled;
            }
        }

        /**
         * Check if particle should be removed
         * @returns {boolean} True if particle should be removed
         */
        shouldRemove() {
            // Remove if faded out
            if (this.alpha <= 0) return true;

            // Remove if lifetime exceeded
            if (this.lifetime > 0 && currentTime - this.spawnTime > this.lifetime) {
                return true;
            }

            // Remove if off-screen and settled
            if (CONFIG.performance.cullOffscreen && this.state === 'spilled') {
                const margin = CONFIG.performance.cullMargin;
                const bounds = CONFIG.boundaries.viewport;

                if (this.x < bounds.left - margin ||
                    this.x > bounds.right + margin ||
                    this.y < bounds.top - margin ||
                    this.y > bounds.bottom + margin) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Start fade out animation
         */
        startFadeOut() {
            this.isFading = true;
        }

        /**
         * Update fade out
         * @param {number} deltaTime - Time elapsed since last frame (seconds)
         */
        updateFadeOut(deltaTime) {
            if (this.isFading) {
                this.alpha -= deltaTime / CONFIG.particles.fadeOutDuration;
                if (this.alpha < 0) this.alpha = 0;
            }
        }
    }

    // ========================================================================
    // Object Pooling
    // ========================================================================

    /**
     * Initialize particle pool
     */
    function initializePool() {
        particlePool = [];
        for (let i = 0; i < CONFIG.particles.poolSize; i++) {
            particlePool.push(new Particle('', 0, 0));
        }
    }

    /**
     * Get particle from pool or create new one
     * @param {string} char - Character to display
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} state - Particle state
     * @returns {Particle} Particle object
     */
    function getParticleFromPool(char, x, y, state = 'calm') {
        let particle;

        if (CONFIG.performance.useObjectPooling && particlePool.length > 0) {
            particle = particlePool.pop();
            particle.reset(char, x, y, state);
        } else {
            particle = new Particle(char, x, y, state);
        }

        return particle;
    }

    /**
     * Return particle to pool
     * @param {Particle} particle - Particle to return
     */
    function returnParticleToPool(particle) {
        if (CONFIG.performance.useObjectPooling && particlePool.length < CONFIG.particles.poolSize) {
            particlePool.push(particle);
        }
    }

    // ========================================================================
    // Particle Creation
    // ========================================================================

    /**
     * Create a new particle
     * @param {string} char - Character to display
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} state - Particle state
     * @returns {Particle} Created particle
     */
    function createParticle(char, x, y, state = 'calm') {
        // Check particle limit
        if (particles.length >= CONFIG.particles.maxParticles) {
            // Remove oldest particle
            const removed = particles.shift();
            returnParticleToPool(removed);
        }

        // Add random spawn offset
        const offsetX = (Math.random() - 0.5) * CONFIG.particles.spawnOffset.x;
        const offsetY = (Math.random() - 0.5) * CONFIG.particles.spawnOffset.y;

        const particle = getParticleFromPool(char, x + offsetX, y + offsetY, state);

        // Add size variation
        const sizeVar = CONFIG.particles.sizeVariation;
        particle.size = sizeVar.min + Math.random() * (sizeVar.max - sizeVar.min);

        particles.push(particle);
        return particle;
    }

    // ========================================================================
    // Canvas Rendering
    // ========================================================================

    /**
     * Initialize canvas
     * @param {HTMLCanvasElement} canvasElement - Canvas element
     */
    function initCanvas(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');

        // Set canvas size to match container
        resizeCanvas();

        // Configure canvas rendering
        if (CONFIG.canvas.antialiasing) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }

        ctx.textBaseline = CONFIG.canvas.textBaseline;
        ctx.textAlign = CONFIG.canvas.textAlign;
    }

    /**
     * Resize canvas to match container
     */
    function resizeCanvas() {
        if (!canvas) return;

        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();

        canvas.width = rect.width;
        canvas.height = rect.height;

        // Update boundaries
        CONFIG.updateBoundaries(container);
    }

    /**
     * Clear canvas
     */
    function clearCanvas() {
        if (!ctx) return;

        if (CONFIG.canvas.clearAlpha < 1) {
            // Partial clear for trail effect
            ctx.fillStyle = `rgba(15, 23, 42, ${CONFIG.canvas.clearAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            // Full clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    /**
     * Render a single particle
     * @param {Particle} particle - Particle to render
     */
    function renderParticle(particle) {
        if (!ctx || particle.alpha <= 0) return;

        ctx.save();

        // Apply transformations
        const renderX = particle.x + particle.liquidOffsetX;
        const renderY = particle.y + particle.liquidOffsetY;

        ctx.translate(renderX, renderY);

        if (particle.rotation !== 0) {
            ctx.rotate(particle.rotation * Math.PI / 180);
        }

        // Set font
        ctx.font = `${CONFIG.canvas.fontWeight} ${particle.size}px ${CONFIG.canvas.fontFamily}`;

        // Set color and alpha
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;

        // Apply shadow/glow effect
        if (CONFIG.canvas.enableShadows) {
            ctx.shadowBlur = CONFIG.canvas.shadowBlur;
            ctx.shadowColor = particle.color;
        }

        // Render character
        ctx.fillText(particle.char, 0, 0);

        // Debug: render bounding box
        if (CONFIG.debug.showBoundingBoxes) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            const radius = particle.size / 2;
            ctx.strokeRect(-radius, -radius, particle.size, particle.size);
        }

        // Debug: render velocity vector
        if (CONFIG.debug.showVelocityVectors) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(particle.velocityX * 0.1, particle.velocityY * 0.1);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Render all particles
     */
    function renderParticles() {
        clearCanvas();

        particles.forEach(particle => {
            renderParticle(particle);
        });
    }

    // ========================================================================
    // Particle Updates
    // ========================================================================

    /**
     * Update all particles
     * @param {number} deltaTime - Time elapsed since last frame (seconds)
     * @param {number} pressure - Current pressure level
     */
    function updateParticles(deltaTime, pressure) {
        const boundaries = CONFIG.boundaries.container;

        // Update each particle
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];

            // Update color based on pressure
            particle.updateColor(pressure);

            // Update physics
            Physics.updateParticle(particle, deltaTime, boundaries, currentTime, i);

            // Update fade out
            particle.updateFadeOut(deltaTime);

            // Remove if needed
            if (particle.shouldRemove()) {
                const removed = particles.splice(i, 1)[0];
                returnParticleToPool(removed);
            }
        }
    }

    // ========================================================================
    // Animation Loop
    // ========================================================================

    /**
     * Main animation loop
     * @param {number} timestamp - Current timestamp
     * @param {number} pressure - Current pressure level
     */
    function animate(timestamp, pressure) {
        // Calculate delta time
        const deltaTime = lastFrameTime === 0 ? 0 : (timestamp - lastFrameTime) / 1000;
        lastFrameTime = timestamp;
        currentTime = timestamp / 1000;

        // Cap delta time to prevent large jumps
        const cappedDeltaTime = Math.min(deltaTime, 0.1);

        // Update and render
        updateParticles(cappedDeltaTime, pressure);
        renderParticles();
    }

    // ========================================================================
    // Particle State Management
    // ========================================================================

    /**
     * Set all particles to a specific state
     * @param {string} state - New state
     */
    function setAllParticlesState(state) {
        particles.forEach(particle => {
            particle.state = state;

            if (state === 'spilled') {
                particle.lifetime = CONFIG.particles.spilledLifetime;
            }
        });
    }

    /**
     * Get particle at index for alignment
     * @param {number} index - Particle index
     * @returns {Particle|null} Particle or null
     */
    function getParticleAt(index) {
        return particles[index] || null;
    }

    /**
     * Calculate target position for particle in calm state
     * @param {number} index - Particle index
     * @param {number} totalParticles - Total number of particles
     * @returns {Object} Target position {x, y}
     */
    function calculateCalmPosition(index, totalParticles) {
        const bounds = CONFIG.boundaries.container;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;

        // Calculate horizontal position
        const spacing = CONFIG.liquid.particleSpacing;
        const totalWidth = (totalParticles - 1) * spacing;
        const startX = centerX - totalWidth / 2;

        return {
            x: startX + index * spacing,
            y: centerY
        };
    }

    // ========================================================================
    // Public API
    // ========================================================================

    return {
        /**
         * Initialize the particle engine
         * @param {HTMLCanvasElement} canvasElement - Canvas element
         */
        init(canvasElement) {
            initCanvas(canvasElement);
            initializePool();
            lastFrameTime = 0;
            currentTime = 0;
        },

        /**
         * Create a new particle
         * @param {string} char - Character to display
         * @param {number} x - X position
         * @param {number} y - Y position
         * @param {string} state - Particle state
         * @returns {Particle} Created particle
         */
        createParticle,

        /**
         * Animate particles
         * @param {number} timestamp - Current timestamp
         * @param {number} pressure - Current pressure level
         */
        animate,

        /**
         * Resize canvas
         */
        resize() {
            resizeCanvas();
        },

        /**
         * Get all particles
         * @returns {Array} Array of particles
         */
        getParticles() {
            return particles;
        },

        /**
         * Get particle count
         * @returns {number} Number of particles
         */
        getParticleCount() {
            return particles.length;
        },

        /**
         * Clear all particles
         */
        clearAll() {
            particles.forEach(particle => returnParticleToPool(particle));
            particles = [];
        },

        /**
         * Set all particles to a state
         * @param {string} state - New state
         */
        setAllParticlesState,

        /**
         * Get particle at index
         * @param {number} index - Particle index
         * @returns {Particle|null} Particle or null
         */
        getParticleAt,

        /**
         * Calculate calm position for particle
         * @param {number} index - Particle index
         * @param {number} totalParticles - Total number of particles
         * @returns {Object} Target position {x, y}
         */
        calculateCalmPosition,

        /**
         * Apply alignment to all calm particles
         * @param {number} deltaTime - Time elapsed since last frame (seconds)
         */
        applyAlignment(deltaTime) {
            const calmParticles = particles.filter(p => p.state === 'calm');

            calmParticles.forEach((particle, index) => {
                const target = this.calculateCalmPosition(index, calmParticles.length);
                Physics.align(particle, target.x, target.y, deltaTime);
            });
        }
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleEngine;
}
