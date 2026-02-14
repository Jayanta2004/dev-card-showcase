/**
 * RagdollWeb - Interaction System
 * Handles mouse tracking, drag detection, and string cutting logic
 */

// ============================================
// INTERACTION CONSTANTS
// ============================================

const INTERACTION_CONFIG = {
    // String cutting
    CUT_VELOCITY_THRESHOLD: 5,       // Minimum mouse velocity to cut
    CUT_DETECTION_SAMPLES: 5,        // Number of mouse positions to track
    STRING_HIT_TOLERANCE: 10,        // Pixels tolerance for string intersection

    // Visual feedback
    PARTICLE_COUNT: 12,              // Particles spawned on cut
    PARTICLE_LIFETIME: 800,          // Milliseconds
    PARTICLE_SPREAD: 50,             // Pixels

    // Mouse trail
    TRAIL_LENGTH: 10,                // Number of trail points
    TRAIL_FADE_SPEED: 0.9,           // Opacity fade per frame
};

// ============================================
// MOUSE TRACKER CLASS
// ============================================

class MouseTracker {
    constructor() {
        this.currentX = 0;
        this.currentY = 0;
        this.previousX = 0;
        this.previousY = 0;

        // Position history for drag detection
        this.positionHistory = [];
        this.maxHistoryLength = INTERACTION_CONFIG.CUT_DETECTION_SAMPLES;

        // Velocity tracking
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 0;

        // Drag state
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        // Trail visualization
        this.trail = [];
    }

    /**
     * Update mouse position
     */
    update(x, y) {
        this.previousX = this.currentX;
        this.previousY = this.currentY;
        this.currentX = x;
        this.currentY = y;

        // Calculate velocity
        this.velocityX = this.currentX - this.previousX;
        this.velocityY = this.currentY - this.previousY;
        this.speed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);

        // Update position history
        this.positionHistory.push({ x, y, time: performance.now() });
        if (this.positionHistory.length > this.maxHistoryLength) {
            this.positionHistory.shift();
        }

        // Update trail
        this.trail.push({ x, y, opacity: 1 });
        if (this.trail.length > INTERACTION_CONFIG.TRAIL_LENGTH) {
            this.trail.shift();
        }
    }

    /**
     * Start drag gesture
     */
    startDrag(x, y) {
        this.isDragging = true;
        this.dragStartX = x;
        this.dragStartY = y;
    }

    /**
     * End drag gesture
     */
    endDrag() {
        this.isDragging = false;
        this.positionHistory = [];
    }

    /**
     * Get drag path for intersection testing
     */
    getDragPath() {
        if (this.positionHistory.length < 2) return null;

        return {
            start: this.positionHistory[0],
            end: this.positionHistory[this.positionHistory.length - 1],
            points: [...this.positionHistory]
        };
    }

    /**
     * Update trail opacity
     */
    updateTrail() {
        this.trail.forEach(point => {
            point.opacity *= INTERACTION_CONFIG.TRAIL_FADE_SPEED;
        });
        this.trail = this.trail.filter(point => point.opacity > 0.01);
    }

    /**
     * Check if currently performing a cutting gesture
     */
    isCuttingGesture() {
        return this.isDragging && this.speed > INTERACTION_CONFIG.CUT_VELOCITY_THRESHOLD;
    }
}

// ============================================
// STRING CUTTING LOGIC
// ============================================

class StringCutter {
    constructor() {
        this.recentlyCut = new Set();
        this.cutCooldown = 100; // ms between cuts on same element
    }

    /**
     * Check if drag path intersects with a string line
     * Uses line segment intersection algorithm
     */
    checkIntersection(dragPath, stringStart, stringEnd, elementId) {
        if (!dragPath || this.recentlyCut.has(elementId)) return false;

        // Check each segment of the drag path
        for (let i = 0; i < dragPath.points.length - 1; i++) {
            const p1 = dragPath.points[i];
            const p2 = dragPath.points[i + 1];

            if (this.lineSegmentsIntersect(p1, p2, stringStart, stringEnd)) {
                // Mark as recently cut to prevent multiple triggers
                this.recentlyCut.add(elementId);
                setTimeout(() => {
                    this.recentlyCut.delete(elementId);
                }, this.cutCooldown);

                return true;
            }
        }

        return false;
    }

    /**
     * Line segment intersection test
     * Returns true if line segments (p1-p2) and (p3-p4) intersect
     */
    lineSegmentsIntersect(p1, p2, p3, p4) {
        const tolerance = INTERACTION_CONFIG.STRING_HIT_TOLERANCE;

        // Calculate direction vectors
        const d1x = p2.x - p1.x;
        const d1y = p2.y - p1.y;
        const d2x = p4.x - p3.x;
        const d2y = p4.y - p3.y;

        // Calculate denominator
        const denominator = d1x * d2y - d1y * d2x;

        // Lines are parallel if denominator is close to zero
        if (Math.abs(denominator) < 0.0001) {
            return false;
        }

        // Calculate intersection parameters
        const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denominator;
        const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denominator;

        // Check if intersection point is within both line segments (with tolerance)
        return (t >= -0.1 && t <= 1.1 && u >= -0.1 && u <= 1.1);
    }

    /**
     * Get intersection point between two line segments
     */
    getIntersectionPoint(p1, p2, p3, p4) {
        const d1x = p2.x - p1.x;
        const d1y = p2.y - p1.y;
        const d2x = p4.x - p3.x;
        const d2y = p4.y - p3.y;

        const denominator = d1x * d2y - d1y * d2x;
        if (Math.abs(denominator) < 0.0001) return null;

        const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denominator;

        return {
            x: p1.x + t * d1x,
            y: p1.y + t * d1y
        };
    }
}

// ============================================
// PARTICLE SYSTEM
// ============================================

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
    }

    /**
     * Create particle burst at cut location
     */
    createBurst(x, y, color = 'default') {
        const colors = ['default', 'pink', 'purple'];
        const particleColor = colors.includes(color) ? color : 'default';

        for (let i = 0; i < INTERACTION_CONFIG.PARTICLE_COUNT; i++) {
            const angle = (Math.PI * 2 * i) / INTERACTION_CONFIG.PARTICLE_COUNT;
            const speed = Math.random() * INTERACTION_CONFIG.PARTICLE_SPREAD + 20;

            const particle = document.createElement('div');
            particle.className = `particle ${particleColor}`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            // Set CSS custom properties for animation
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            particle.style.setProperty('--particle-x', `${vx}px`);
            particle.style.setProperty('--particle-y', `${vy}px`);

            this.container.appendChild(particle);
            this.particles.push(particle);

            // Remove after animation
            setTimeout(() => {
                particle.remove();
                this.particles = this.particles.filter(p => p !== particle);
            }, INTERACTION_CONFIG.PARTICLE_LIFETIME);
        }
    }

    /**
     * Create impact wave effect
     */
    createImpactWave(x, y) {
        const wave = document.createElement('div');
        wave.className = 'impact-wave';
        wave.style.left = `${x - 25}px`;
        wave.style.top = `${y - 25}px`;

        this.container.appendChild(wave);

        setTimeout(() => {
            wave.remove();
        }, 600);
    }

    /**
     * Clean up all particles
     */
    cleanup() {
        this.particles.forEach(particle => particle.remove());
        this.particles = [];
    }
}

// ============================================
// INTERACTION MANAGER
// ============================================

class InteractionManager {
    constructor(particleContainer) {
        this.mouseTracker = new MouseTracker();
        this.stringCutter = new StringCutter();
        this.particleSystem = new ParticleSystem(particleContainer);

        // Callbacks
        this.onStringCut = null;

        // State
        this.isEnabled = true;
    }

    /**
     * Handle mouse move event
     */
    handleMouseMove(event) {
        if (!this.isEnabled) return;

        const x = event.clientX;
        const y = event.clientY;

        this.mouseTracker.update(x, y);
        this.mouseTracker.updateTrail();
    }

    /**
     * Handle mouse down event
     */
    handleMouseDown(event) {
        if (!this.isEnabled) return;

        const x = event.clientX;
        const y = event.clientY;

        this.mouseTracker.startDrag(x, y);
    }

    /**
     * Handle mouse up event
     */
    handleMouseUp(event) {
        if (!this.isEnabled) return;

        this.mouseTracker.endDrag();
    }

    /**
     * Check for string cuts
     */
    checkStringCuts(strings) {
        if (!this.mouseTracker.isCuttingGesture()) return;

        const dragPath = this.mouseTracker.getDragPath();
        if (!dragPath) return;

        // Check each string for intersection
        for (const [id, stringData] of strings) {
            const intersects = this.stringCutter.checkIntersection(
                dragPath,
                stringData.start,
                stringData.end,
                id
            );

            if (intersects) {
                // Get intersection point for visual effects
                const intersectionPoint = this.stringCutter.getIntersectionPoint(
                    dragPath.start,
                    dragPath.end,
                    stringData.start,
                    stringData.end
                );

                if (intersectionPoint) {
                    // Create visual effects
                    this.particleSystem.createBurst(
                        intersectionPoint.x,
                        intersectionPoint.y,
                        'pink'
                    );
                }

                // Trigger callback
                if (this.onStringCut) {
                    this.onStringCut(id, intersectionPoint);
                }
            }
        }
    }

    /**
     * Get current mouse position
     */
    getMousePosition() {
        return {
            x: this.mouseTracker.currentX,
            y: this.mouseTracker.currentY,
            velocity: this.mouseTracker.speed
        };
    }

    /**
     * Get mouse trail for rendering
     */
    getMouseTrail() {
        return this.mouseTracker.trail;
    }

    /**
     * Enable/disable interaction
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.InteractionManager = InteractionManager;
    window.INTERACTION_CONFIG = INTERACTION_CONFIG;
}
