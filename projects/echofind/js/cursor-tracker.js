// ============================================
// CURSOR-TRACKER.JS
// Mouse movement tracking and trail rendering
// ============================================

/**
 * CursorTracker Module
 * Handles cursor position tracking and visual trail effects
 */
const CursorTracker = (function () {
    'use strict';

    // Private variables
    let cursorPosition = { x: 0, y: 0 };
    let previousPosition = { x: 0, y: 0 };
    let trailContainer = null;
    let isTracking = false;
    let trailParticles = [];
    let particlePool = [];
    let lastTrailTime = 0;
    let animationFrameId = null;

    // Settings
    const SETTINGS = {
        TRAIL_INTERVAL: 16,        // ms between trail particles (60fps)
        TRAIL_MAX_PARTICLES: 50,   // Maximum active particles
        TRAIL_PARTICLE_LIFETIME: 800, // ms
        PARTICLE_POOL_SIZE: 100,   // Pre-allocated particles
        THROTTLE_DELAY: 8          // ms throttle for mousemove
    };

    // Throttle helper
    let lastMoveTime = 0;

    /**
     * Initialize cursor tracker
     */
    function init() {
        trailContainer = document.getElementById('trail-container');

        if (!trailContainer) {
            console.error('Trail container not found');
            return false;
        }

        // Pre-create particle pool
        createParticlePool();

        // Add event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchstart', handleTouchStart);

        // Start animation loop
        startAnimationLoop();

        isTracking = true;
        return true;
    }

    /**
     * Create pool of reusable particle elements
     */
    function createParticlePool() {
        for (let i = 0; i < SETTINGS.PARTICLE_POOL_SIZE; i++) {
            const particle = document.createElement('div');
            particle.className = 'trail-particle';
            particlePool.push(particle);
        }
    }

    /**
     * Get particle from pool or create new one
     * @returns {HTMLElement} Particle element
     */
    function getParticle() {
        if (particlePool.length > 0) {
            return particlePool.pop();
        }

        const particle = document.createElement('div');
        particle.className = 'trail-particle';
        return particle;
    }

    /**
     * Return particle to pool
     * @param {HTMLElement} particle - Particle element
     */
    function returnParticle(particle) {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }

        particle.className = 'trail-particle';
        particle.style.cssText = '';

        if (particlePool.length < SETTINGS.PARTICLE_POOL_SIZE) {
            particlePool.push(particle);
        }
    }

    /**
     * Handle mouse move event
     * @param {MouseEvent} event - Mouse event
     */
    function handleMouseMove(event) {
        const now = performance.now();

        // Throttle updates
        if (now - lastMoveTime < SETTINGS.THROTTLE_DELAY) {
            return;
        }

        lastMoveTime = now;

        // Update cursor position
        previousPosition.x = cursorPosition.x;
        previousPosition.y = cursorPosition.y;
        cursorPosition.x = event.clientX;
        cursorPosition.y = event.clientY;

        // Create trail particle
        createTrailParticle(cursorPosition.x, cursorPosition.y);
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} event - Touch event
     */
    function handleTouchMove(event) {
        event.preventDefault();

        const touch = event.touches[0];
        if (!touch) return;

        const now = performance.now();

        if (now - lastMoveTime < SETTINGS.THROTTLE_DELAY) {
            return;
        }

        lastMoveTime = now;

        previousPosition.x = cursorPosition.x;
        previousPosition.y = cursorPosition.y;
        cursorPosition.x = touch.clientX;
        cursorPosition.y = touch.clientY;

        createTrailParticle(cursorPosition.x, cursorPosition.y);
    }

    /**
     * Handle touch start event
     * @param {TouchEvent} event - Touch event
     */
    function handleTouchStart(event) {
        const touch = event.touches[0];
        if (!touch) return;

        cursorPosition.x = touch.clientX;
        cursorPosition.y = touch.clientY;
        previousPosition.x = cursorPosition.x;
        previousPosition.y = cursorPosition.y;
    }

    /**
     * Create trail particle at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    function createTrailParticle(x, y) {
        const now = performance.now();

        // Limit particle creation rate
        if (now - lastTrailTime < SETTINGS.TRAIL_INTERVAL) {
            return;
        }

        lastTrailTime = now;

        // Remove oldest particles if at limit
        if (trailParticles.length >= SETTINGS.TRAIL_MAX_PARTICLES) {
            const oldParticle = trailParticles.shift();
            returnParticle(oldParticle.element);
        }

        // Get particle from pool
        const particle = getParticle();

        // Position particle
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        // Add fading animation
        particle.classList.add('fading');

        // Add to container
        trailContainer.appendChild(particle);

        // Track particle
        trailParticles.push({
            element: particle,
            createdAt: now
        });
    }

    /**
     * Update trail particles (cleanup expired ones)
     */
    function updateTrailParticles() {
        const now = performance.now();

        // Remove expired particles
        trailParticles = trailParticles.filter(particle => {
            const age = now - particle.createdAt;

            if (age >= SETTINGS.TRAIL_PARTICLE_LIFETIME) {
                returnParticle(particle.element);
                return false;
            }

            return true;
        });
    }

    /**
     * Animation loop for trail updates
     */
    function animationLoop() {
        updateTrailParticles();
        animationFrameId = requestAnimationFrame(animationLoop);
    }

    /**
     * Start animation loop
     */
    function startAnimationLoop() {
        if (!animationFrameId) {
            animationLoop();
        }
    }

    /**
     * Stop animation loop
     */
    function stopAnimationLoop() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    /**
     * Get current cursor position
     * @returns {Object} {x, y} coordinates
     */
    function getCursorPosition() {
        return { ...cursorPosition };
    }

    /**
     * Get previous cursor position
     * @returns {Object} {x, y} coordinates
     */
    function getPreviousPosition() {
        return { ...previousPosition };
    }

    /**
     * Get cursor velocity
     * @returns {Object} {x, y} velocity components
     */
    function getCursorVelocity() {
        return {
            x: cursorPosition.x - previousPosition.x,
            y: cursorPosition.y - previousPosition.y
        };
    }

    /**
     * Get cursor speed
     * @returns {number} Speed in pixels per frame
     */
    function getCursorSpeed() {
        const velocity = getCursorVelocity();
        return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    }

    /**
     * Clear all trail particles
     */
    function clearTrails() {
        trailParticles.forEach(particle => {
            returnParticle(particle.element);
        });
        trailParticles = [];
    }

    /**
     * Set trail color based on proximity
     * @param {string} proximityZone - Proximity zone name
     */
    function setTrailColor(proximityZone) {
        if (!trailContainer) return;

        // Remove all proximity classes
        trailContainer.classList.remove(
            'proximity-far',
            'proximity-medium',
            'proximity-close',
            'proximity-very-close'
        );

        // Add new proximity class
        trailContainer.classList.add('proximity-' + proximityZone);
    }

    /**
     * Create success trail effect
     */
    function createSuccessTrail() {
        const particleCount = 20;
        const centerX = cursorPosition.x;
        const centerY = cursorPosition.y;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 50 + Math.random() * 50;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            const particle = getParticle();
            particle.classList.add('success');
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';

            trailContainer.appendChild(particle);

            // Remove after animation
            setTimeout(() => {
                returnParticle(particle);
            }, 800);
        }
    }

    /**
     * Enable trail rendering
     */
    function enable() {
        isTracking = true;
        startAnimationLoop();
    }

    /**
     * Disable trail rendering
     */
    function disable() {
        isTracking = false;
        stopAnimationLoop();
        clearTrails();
    }

    /**
     * Check if tracking is enabled
     * @returns {boolean} True if tracking
     */
    function isEnabled() {
        return isTracking;
    }

    /**
     * Update trail settings
     * @param {Object} settings - New settings
     */
    function updateSettings(settings) {
        Object.assign(SETTINGS, settings);
    }

    /**
     * Get current settings
     * @returns {Object} Current settings
     */
    function getSettings() {
        return { ...SETTINGS };
    }

    /**
     * Destroy cursor tracker
     */
    function destroy() {
        disable();

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchstart', handleTouchStart);

        clearTrails();
        particlePool = [];
        trailContainer = null;
    }

    // Public API
    return {
        init: init,
        getCursorPosition: getCursorPosition,
        getPreviousPosition: getPreviousPosition,
        getCursorVelocity: getCursorVelocity,
        getCursorSpeed: getCursorSpeed,
        clearTrails: clearTrails,
        setTrailColor: setTrailColor,
        createSuccessTrail: createSuccessTrail,
        enable: enable,
        disable: disable,
        isEnabled: isEnabled,
        updateSettings: updateSettings,
        getSettings: getSettings,
        destroy: destroy
    };
})();
