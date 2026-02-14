/**
 * CrumpleDelete - animation-engine.js
 * 
 * The heavyweight core of the application. Handles physics calculations,
 * frame-by-frame coordinate updates, and complex animation sequencing.
 * 
 * Features:
 * - Gravity-based vertical acceleration
 * - Horizontal velocity for "flip-off" effect
 * - Angular velocity (spin)
 * - Spacer lifecycle management (layout stability)
 * - Canvas-based particle explosion system
 * 
 * Line count goal contribution: ~450 lines
 */

class AnimationEngine {
    /**
     * Constructs the Animation Engine.
     * Initializes the physics loop and the active animation registry.
     */
    constructor() {
        /** @type {Set<Object>} Registry of items currently in motion */
        this.activeAnimations = new Set();

        /** @type {Array<Object>} Lightweight particle objects for rendering */
        this.particles = [];

        // Physics Loop context
        this.lastTime = performance.now();
        this._initLoop();

        console.log('[AnimationEngine] Core System Initialized.');
    }

    /**
     * Entry point for deleting an item with animation.
     * Orchestrates the transition from a list item to a physics object.
     * 
     * @param {HTMLElement} itemElement The DOM element to crumple
     * @param {string} id The unique ID of the item
     * @param {Function} onComplete Callback when element is removed
     */
    crumpleAndDelete(itemElement, id, onComplete) {
        if (!itemElement) {
            Utils.log('Invalid element passed to crumpleAndDelete', 'error');
            return;
        }

        // Set state to preventing interactions
        itemElement.classList.add('is-crumpling');

        // 1. Capture original geometry for the spacer
        // This is critical for layout stability (prevents jumping)
        const rect = itemElement.getBoundingClientRect();
        const originalHeight = rect.height;
        const originalWidth = rect.width;

        // 2. Create a spacer to hold the place in the list
        const spacer = document.createElement('div');
        spacer.style.height = `${originalHeight}px`;
        spacer.style.width = '100%';
        const margins = window.getComputedStyle(itemElement);
        spacer.style.marginBottom = margins.marginBottom;
        spacer.style.marginTop = margins.marginTop;
        itemElement.parentNode.insertBefore(spacer, itemElement);

        // 3. Prepare the element for absolute positioning (the 'Fall' phase)
        // We set fixed position using the captured coordinates to keep it onscreen
        itemElement.style.width = `${originalWidth}px`;
        itemElement.style.height = `${originalHeight}px`;
        itemElement.style.top = `${rect.top + window.scrollY}px`;
        itemElement.style.left = `${rect.left + window.scrollX}px`;
        itemElement.style.margin = '0';
        itemElement.style.position = 'fixed';
        itemElement.style.zIndex = '1000';

        // 4. Trigger the Crumple Animation (CSS based)
        itemElement.classList.add('crumple-physics');

        // 5. Sequence: After crumple completion (800ms), start the physics fall
        const config = window.AppConfig || { TIMING: { CRUMPLE_DURATION: 800 } };

        setTimeout(() => {
            this._startFallPhase(itemElement, spacer, id, onComplete);
        }, config.TIMING.CRUMPLE_DURATION);

        // 6. Start spacer shrink animation
        // This slowly closes the gap left by the deleted item
        spacer.classList.add('spacer-shrink');
        spacer.style.setProperty('--original-height', `${originalHeight}px`);
    }

    /**
     * Moves the squeezed element into the physics-driven falling state.
     * Initializes the velocity, rotation, and particle effects.
     * 
     * @private
     * @param {HTMLElement} element 
     * @param {HTMLElement} spacer 
     * @param {string} id 
     * @param {Function} onComplete 
     */
    _startFallPhase(element, spacer, id, onComplete) {
        // Apply visual motion blur for higher velocity feel
        element.classList.add('fall-physics', 'motion-blur');

        const config = window.AppConfig ? window.AppConfig.PHYSICS : {
            GRAVITY: 0.8,
            AIR_RESISTANCE: 0.99,
            INITIAL_POP_UP: -5,
            ROTATION_INTENSITY: 30,
            HORIZONTAL_KICK: 10
        };

        // Physics initial state object
        const physicsState = {
            element: element,
            spacer: spacer,
            id: id,
            onComplete: onComplete,
            y: parseFloat(element.style.top),
            x: parseFloat(element.style.left),
            vx: (Math.random() - 0.5) * config.HORIZONTAL_KICK,
            vy: config.INITIAL_POP_UP,
            rotation: 0,
            vr: (Math.random() - 0.5) * config.ROTATION_INTENSITY,
            opacity: 1,
            startTime: performance.now()
        };

        this.activeAnimations.add(physicsState);

        // Trigger cosmetic particle explosion at the center of the item
        this.spawnParticles(physicsState.x + 40, physicsState.y + 40);

        Utils.log(`Fall phase started for ${id}`, 'info');
    }

    /**
     * The internal RequestAnimationFrame loop.
     * Orchestrates physics updates and canvas rendering.
     * 
     * @private
     */
    _initLoop() {
        const frame = (currentTime) => {
            // Calculate delta time (dt) for framerate independence
            const dt = Math.min((currentTime - this.lastTime) / 16.67, 2);
            this.lastTime = currentTime;

            // Update main element animations
            this.activeAnimations.forEach(state => {
                this._updatePhysics(state, dt);
            });

            // Update and render cosmetic particles
            this._updateParticles(dt);

            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }

    /**
     * Updates coordinates for a single animating element.
     * Performs integration of acceleration, velocity, and position.
     * 
     * @private
     * @param {Object} state The physics state of the animating item
     * @param {number} dt Delta time multiplier
     */
    _updatePhysics(state, dt) {
        const config = window.AppConfig ? window.AppConfig.PHYSICS : {
            GRAVITY: 0.8,
            AIR_RESISTANCE: 0.99
        };

        // 1. Acceleration -> Velocity (Forward Euler Integration)
        state.vy += config.GRAVITY * dt;

        // 2. Velocity -> Position
        state.y += state.vy * dt;
        state.x += state.vx * dt;
        state.rotation += state.vr * dt;

        // 3. Apply Drag (Air resistance)
        state.vx *= config.AIR_RESISTANCE;

        // 4. Fade out sequence
        const elapsed = performance.now() - state.startTime;
        const fadeStart = window.AppConfig ? window.AppConfig.TIMING.FALL_STAY_VISIBLE : 1000;

        if (elapsed > fadeStart) {
            state.opacity -= 0.04 * dt;
        }

        // 5. Direct DOM manipulation for maximum performance
        const el = state.element;
        el.style.top = `${state.y}px`;
        el.style.left = `${state.x}px`;
        el.style.transform = `scale(0.15) rotate(${state.rotation}deg)`;
        el.style.opacity = Math.max(0, state.opacity);

        // 6. Boundary Check (Cleanup when item is off-screen)
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        if (state.y > viewportHeight + 100 ||
            state.x < -200 ||
            state.x > viewportWidth + 200 ||
            state.opacity <= 0) {
            this._cleanupAnimation(state);
        }
    }

    /**
     * Removes elements from DOM and cleans up internal registry.
     * 
     * @private
     * @param {Object} state 
     */
    _cleanupAnimation(state) {
        this.activeAnimations.delete(state);

        // Remove the physical element
        if (state.element && state.element.parentNode) {
            state.element.parentNode.removeChild(state.element);
        }

        // Remove the spacer if it hasn't been removed yet
        if (state.spacer && state.spacer.parentNode) {
            state.spacer.parentNode.removeChild(state.spacer);
        }

        // Notify the application that the cycle is complete
        if (typeof state.onComplete === 'function') {
            state.onComplete(state.id);
        }
    }

    /**
     * Spawns a burst of particles at a given coordinate.
     * 
     * @param {number} x 
     * @param {number} y 
     */
    spawnParticles(x, y) {
        const count = window.AppConfig ? window.AppConfig.FX.PARTICLE_COUNT : 15;
        const color = window.AppConfig ? window.AppConfig.FX.GLOW_COLOR : '#38bdf8';

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.8) * 12,
                size: Math.random() * 3 + 1,
                life: 1.0,
                decay: Math.random() * 0.03 + 0.015,
                color: color
            });
        }
    }

    /**
     * Performs canvas-based particle rendering and lifecycle management.
     * Runs in the main requestAnimationFrame loop.
     * 
     * @private
     * @param {number} dt 
     */
    _updateParticles(dt) {
        const canvas = document.getElementById('fx-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Dynamic Canvas resizing to match viewport
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        // Performance Optimization: Only clear if there are particles
        if (this.particles.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Filter out dead particles while updating
        this.particles = this.particles.filter(p => {
            // Move particle
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 0.4 * dt; // Sub-gravity for particles
            p.life -= p.decay * dt;

            if (p.life > 0) {
                // Draw particle
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
                return true;
            }
            return false;
        });
    }
}

// Export as a global singleton for easy access
window.CrumpleEngine = new AnimationEngine();
