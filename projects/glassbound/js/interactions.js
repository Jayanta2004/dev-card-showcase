/**
 * ========================================
 * GLASSBOUND - Interaction System
 * User interactions and stress accumulation
 * ========================================
 */

/**
 * Interaction manager for handling user input
 */
class InteractionManager {
    constructor(glassContainer, zones, onInteraction) {
        this.container = glassContainer;
        this.zones = zones;
        this.onInteraction = onInteraction;
        this.isActive = false;
        this.clickCount = 0;
        this.lastClickTime = 0;
        this.clickComboWindow = 1000; // ms
        this.comboMultiplier = 1.0;
        this.hoverZone = null;
        this.interactionHistory = [];
        
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners for interaction zones
     */
    setupEventListeners() {
        this.zones.forEach(zone => {
            // Click/tap events
            zone.addEventListener('click', (e) => this.handleClick(e, zone));
            zone.addEventListener('touchstart', (e) => this.handleTouch(e, zone));
            
            // Hover events
            zone.addEventListener('mouseenter', () => this.handleHoverEnter(zone));
            zone.addEventListener('mouseleave', () => this.handleHoverLeave(zone));
            
            // Movement tracking
            zone.addEventListener('mousemove', (e) => this.handleMouseMove(e, zone));
        });
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
    }
    
    /**
     * Handle click event
     */
    handleClick(event, zone) {
        if (!this.isActive) return;
        
        event.preventDefault();
        const rect = zone.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.processInteraction(x, y, zone, 'click');
    }
    
    /**
     * Handle touch event
     */
    handleTouch(event, zone) {
        if (!this.isActive) return;
        
        event.preventDefault();
        const touch = event.touches[0];
        const rect = zone.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.processInteraction(x, y, zone, 'touch');
    }
    
    /**
     * Process interaction and calculate intensity
     */
    processInteraction(x, y, zone, type) {
        const now = Date.now();
        const timeSinceLastClick = now - this.lastClickTime;
        
        // Update click combo
        if (timeSinceLastClick < this.clickComboWindow) {
            this.comboMultiplier = Math.min(3.0, this.comboMultiplier + 0.2);
        } else {
            this.comboMultiplier = 1.0;
        }
        
        this.lastClickTime = now;
        this.clickCount++;
        
        // Calculate interaction intensity
        const baseIntensity = 0.3 + Math.random() * 0.4;
        const intensity = baseIntensity * this.comboMultiplier;
        
        // Get global coordinates
        const containerRect = this.container.getBoundingClientRect();
        const zoneRect = zone.getBoundingClientRect();
        const globalX = (zoneRect.left - containerRect.left) + x;
        const globalY = (zoneRect.top - containerRect.top) + y;
        
        // Record interaction
        this.interactionHistory.push({
            x: globalX,
            y: globalY,
            intensity,
            type,
            zone: zone.dataset.zone,
            timestamp: now,
            comboMultiplier: this.comboMultiplier
        });
        
        // Keep history limited
        if (this.interactionHistory.length > 50) {
            this.interactionHistory.shift();
        }
        
        // Trigger callback
        if (this.onInteraction) {
            this.onInteraction({
                x: globalX,
                y: globalY,
                intensity,
                type,
                zone: zone.dataset.zone,
                comboMultiplier: this.comboMultiplier,
                clickCount: this.clickCount
            });
        }
    }
    
    /**
     * Handle hover enter
     */
    handleHoverEnter(zone) {
        if (!this.isActive) return;
        
        this.hoverZone = zone;
        zone.style.cursor = 'pointer';
        
        // Add visual feedback
        zone.style.background = 'rgba(255, 255, 255, 0.03)';
    }
    
    /**
     * Handle hover leave
     */
    handleHoverLeave(zone) {
        this.hoverZone = null;
        zone.style.background = '';
    }
    
    /**
     * Handle mouse move
     */
    handleMouseMove(event, zone) {
        if (!this.isActive) return;
        
        const rect = zone.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        
        // Subtle visual feedback based on position
        const gradient = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255, 255, 255, 0.05), transparent 60%)`;
        zone.style.background = gradient;
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Reset any position-dependent state
        this.hoverZone = null;
    }
    
    /**
     * Activate interaction system
     */
    activate() {
        this.isActive = true;
    }
    
    /**
     * Deactivate interaction system
     */
    deactivate() {
        this.isActive = false;
        this.zones.forEach(zone => {
            zone.style.background = '';
            zone.style.cursor = 'default';
        });
    }
    
    /**
     * Get interaction statistics
     */
    getStats() {
        return {
            clickCount: this.clickCount,
            comboMultiplier: this.comboMultiplier,
            historyLength: this.interactionHistory.length,
            averageIntensity: this.getAverageIntensity(),
            interactionRate: this.getInteractionRate()
        };
    }
    
    /**
     * Calculate average interaction intensity
     */
    getAverageIntensity() {
        if (this.interactionHistory.length === 0) return 0;
        
        const sum = this.interactionHistory.reduce((acc, interaction) => {
            return acc + interaction.intensity;
        }, 0);
        
        return sum / this.interactionHistory.length;
    }
    
    /**
     * Calculate interaction rate (interactions per second)
     */
    getInteractionRate() {
        if (this.interactionHistory.length < 2) return 0;
        
        const recent = this.interactionHistory.slice(-10);
        const timeSpan = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000;
        
        return timeSpan > 0 ? recent.length / timeSpan : 0;
    }
    
    /**
     * Reset interaction state
     */
    reset() {
        this.clickCount = 0;
        this.comboMultiplier = 1.0;
        this.interactionHistory = [];
        this.lastClickTime = 0;
    }
}

/**
 * Tension accumulation system
 */
class TensionSystem {
    constructor(maxTension = 100) {
        this.tension = 0;
        this.maxTension = maxTension;
        this.decayRate = 0.5; // tension lost per second
        this.buildRate = 1.0;
        this.stage = 1;
        this.stageThresholds = [0, 25, 50, 75, 90];
        this.stageNames = ['CONFINED', 'STRESSED', 'FRACTURING', 'CRITICAL', 'BREAKING'];
        this.tensionHistory = [];
        this.peakTension = 0;
    }
    
    /**
     * Add tension from interaction
     */
    addTension(amount, intensity = 1.0) {
        const actualAmount = amount * intensity * this.buildRate;
        this.tension = Math.min(this.maxTension, this.tension + actualAmount);
        
        // Update peak
        if (this.tension > this.peakTension) {
            this.peakTension = this.tension;
        }
        
        // Update stage
        this.updateStage();
        
        // Record in history
        this.tensionHistory.push({
            tension: this.tension,
            timestamp: Date.now()
        });
        
        // Limit history
        if (this.tensionHistory.length > 100) {
            this.tensionHistory.shift();
        }
        
        return this.tension;
    }
    
    /**
     * Update tension (decay over time)
     */
    update(deltaTime) {
        // Decay tension when not at max
        if (this.tension < this.maxTension && this.tension > 0) {
            const decay = (this.decayRate * deltaTime) / 1000;
            this.tension = Math.max(0, this.tension - decay);
            this.updateStage();
        }
    }
    
    /**
     * Update current stage based on tension
     */
    updateStage() {
        const percentage = this.getPercentage();
        let newStage = 1;
        
        for (let i = this.stageThresholds.length - 1; i >= 0; i--) {
            if (percentage >= this.stageThresholds[i]) {
                newStage = i + 1;
                break;
            }
        }
        
        this.stage = newStage;
    }
    
    /**
     * Get tension as percentage
     */
    getPercentage() {
        return (this.tension / this.maxTension) * 100;
    }
    
    /**
     * Get current stage name
     */
    getStageName() {
        return this.stageNames[this.stage - 1] || 'UNKNOWN';
    }
    
    /**
     * Check if tension is at breaking point
     */
    isBreaking() {
        return this.tension >= this.maxTension;
    }
    
    /**
     * Check if tension is critical
     */
    isCritical() {
        return this.getPercentage() >= 90;
    }
    
    /**
     * Get tension rate of change
     */
    getTensionRate() {
        if (this.tensionHistory.length < 2) return 0;
        
        const recent = this.tensionHistory.slice(-5);
        const timeSpan = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000;
        const tensionChange = recent[recent.length - 1].tension - recent[0].tension;
        
        return timeSpan > 0 ? tensionChange / timeSpan : 0;
    }
    
    /**
     * Reset tension
     */
    reset() {
        this.tension = 0;
        this.stage = 1;
        this.tensionHistory = [];
        this.peakTension = 0;
    }
}

/**
 * Stress point visualization system
 */
class StressVisualization {
    constructor(container) {
        this.container = container;
        this.stressPoints = [];
        this.activePoints = new Set();
        this.maxActivePoints = 5;
    }
    
    /**
     * Add a stress point at position
     */
    addStressPoint(x, y, intensity = 1.0) {
        // Find inactive point or create new one
        let point = null;
        
        for (let i = 0; i < this.stressPoints.length; i++) {
            if (!this.activePoints.has(i)) {
                point = this.stressPoints[i];
                point.element.style.left = `${x}px`;
                point.element.style.top = `${y}px`;
                this.activePoints.add(i);
                break;
            }
        }
        
        if (!point && this.stressPoints.length < this.maxActivePoints) {
            // Create new point
            const element = document.createElement('div');
            element.className = 'stress-point';
            this.container.appendChild(element);
            
            point = {
                element,
                x,
                y,
                intensity,
                active: false
            };
            
            this.stressPoints.push(point);
            this.activePoints.add(this.stressPoints.length - 1);
        }
        
        if (point) {
            point.x = x;
            point.y = y;
            point.intensity = intensity;
            this.activatePoint(point);
            
            // Auto-deactivate after delay
            setTimeout(() => this.deactivatePoint(point), 2000);
        }
    }
    
    /**
     * Activate a stress point
     */
    activatePoint(point) {
        point.active = true;
        point.element.classList.add('active');
        
        // Scale based on intensity
        const scale = 1 + (point.intensity - 1) * 0.5;
        point.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    
    /**
     * Deactivate a stress point
     */
    deactivatePoint(point) {
        point.active = false;
        point.element.classList.remove('active');
        
        const index = this.stressPoints.indexOf(point);
        if (index >= 0) {
            this.activePoints.delete(index);
        }
    }
    
    /**
     * Clear all stress points
     */
    clear() {
        this.stressPoints.forEach(point => {
            point.element.remove();
        });
        this.stressPoints = [];
        this.activePoints.clear();
    }
}

/**
 * Gesture detection system
 */
class GestureDetector {
    constructor() {
        this.touches = [];
        this.gestureHistory = [];
        this.swipeThreshold = 50;
        this.tapThreshold = 200; // ms
        this.doubleTapWindow = 300; // ms
        this.lastTapTime = 0;
    }
    
    /**
     * Process touch start
     */
    onTouchStart(event) {
        this.touches = Array.from(event.touches).map(touch => ({
            id: touch.identifier,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            startTime: Date.now()
        }));
    }
    
    /**
     * Process touch move
     */
    onTouchMove(event) {
        Array.from(event.touches).forEach(touch => {
            const trackedTouch = this.touches.find(t => t.id === touch.identifier);
            if (trackedTouch) {
                trackedTouch.currentX = touch.clientX;
                trackedTouch.currentY = touch.clientY;
            }
        });
    }
    
    /**
     * Process touch end
     */
    onTouchEnd(event) {
        const now = Date.now();
        
        this.touches.forEach(touch => {
            const duration = now - touch.startTime;
            const deltaX = touch.currentX - touch.startX;
            const deltaY = touch.currentY - touch.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            let gesture = null;
            
            // Detect gesture type
            if (distance < 10 && duration < this.tapThreshold) {
                // Tap
                gesture = 'tap';
                
                // Check for double tap
                if (now - this.lastTapTime < this.doubleTapWindow) {
                    gesture = 'doubletap';
                }
                this.lastTapTime = now;
            } else if (distance > this.swipeThreshold) {
                // Swipe
                const angle = Math.atan2(deltaY, deltaX);
                gesture = this.getSwipeDirection(angle);
            }
            
            if (gesture) {
                this.gestureHistory.push({
                    type: gesture,
                    position: { x: touch.startX, y: touch.startY },
                    timestamp: now,
                    distance,
                    duration
                });
            }
        });
        
        this.touches = [];
        
        // Limit history
        if (this.gestureHistory.length > 20) {
            this.gestureHistory.shift();
        }
    }
    
    /**
     * Determine swipe direction from angle
     */
    getSwipeDirection(angle) {
        const deg = angle * (180 / Math.PI);
        
        if (deg > -45 && deg <= 45) return 'swipe-right';
        if (deg > 45 && deg <= 135) return 'swipe-down';
        if (deg > 135 || deg <= -135) return 'swipe-left';
        return 'swipe-up';
    }
    
    /**
     * Get recent gestures
     */
    getRecentGestures(count = 5) {
        return this.gestureHistory.slice(-count);
    }
    
    /**
     * Clear gesture history
     */
    clear() {
        this.touches = [];
        this.gestureHistory = [];
    }
}

/**
 * Input feedback system
 */
class FeedbackSystem {
    constructor() {
        this.soundWaveContainer = document.querySelector('.sound-wave-container');
        this.lastFeedbackTime = 0;
        this.feedbackCooldown = 100; // ms
    }
    
    /**
     * Trigger visual feedback
     */
    trigger(intensity = 1.0) {
        const now = Date.now();
        if (now - this.lastFeedbackTime < this.feedbackCooldown) return;
        
        this.lastFeedbackTime = now;
        
        // Sound wave visual
        if (this.soundWaveContainer) {
            this.soundWaveContainer.classList.add('active');
            setTimeout(() => {
                this.soundWaveContainer.classList.remove('active');
            }, 600);
        }
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
            const vibrationDuration = Math.floor(intensity * 30);
            navigator.vibrate(vibrationDuration);
        }
    }
    
    /**
     * Trigger impact feedback
     */
    impact(intensity = 1.0) {
        this.trigger(intensity);
        
        // Additional visual feedback for impact
        document.body.style.transform = `scale(${1 + intensity * 0.005})`;
        setTimeout(() => {
            document.body.style.transform = '';
        }, 100);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        InteractionManager,
        TensionSystem,
        StressVisualization,
        GestureDetector,
        FeedbackSystem
    };
}
