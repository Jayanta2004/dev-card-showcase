/* ===================================
   BATTERY DRAINER - ANIMATIONS MODULE
   Handles all visual animations and emotional states
   =================================== */

/**
 * Animation Controller
 * Manages battery visual animations and transitions
 */
class AnimationController {
    constructor() {
        this.currentEmotion = 'happy';
        this.isAnimating = false;
        this.particleInterval = null;
        this.elements = {};
    }

    /**
     * Initialize and cache DOM elements
     */
    init() {
        this.elements = {
            batterySvg: document.getElementById('batterySvg'),
            batteryFill: document.getElementById('batteryFill'),
            batteryOutline: document.getElementById('batteryOutline'),
            batteryTerminal: document.getElementById('batteryTerminal'),
            batteryShine: document.getElementById('batteryShine'),
            batteryFace: document.getElementById('batteryFace'),
            leftEye: document.getElementById('leftEye'),
            rightEye: document.getElementById('rightEye'),
            leftPupil: document.getElementById('leftPupil'),
            rightPupil: document.getElementById('rightPupil'),
            batteryMouth: document.getElementById('batteryMouth'),
            chargingBolt: document.getElementById('chargingBolt'),
            backgroundGradient: document.getElementById('backgroundGradient'),
            particleContainer: document.getElementById('particleContainer')
        };

        console.log('Animation controller initialized');
    }

    /**
     * Update battery fill level with smooth animation
     */
    updateBatteryLevel(percentage) {
        const fillHeight = (percentage / 100) * 400; // 400px is max height
        const fillY = 460 - fillHeight; // 460px is bottom position

        if (this.elements.batteryFill) {
            this.elements.batteryFill.setAttribute('height', fillHeight);
            this.elements.batteryFill.setAttribute('y', fillY);
        }
    }

    /**
     * Update battery fill color based on level and state
     */
    updateBatteryColor(percentage, isCharging) {
        if (!this.elements.batteryFill) return;

        let gradient = 'url(#highGradient)';

        if (isCharging) {
            gradient = 'url(#chargingGradient)';
        } else if (percentage <= 15) {
            gradient = 'url(#criticalGradient)';
        } else if (percentage <= 30) {
            gradient = 'url(#lowGradient)';
        } else if (percentage <= 50) {
            gradient = 'url(#mediumGradient)';
        } else {
            gradient = 'url(#highGradient)';
        }

        this.elements.batteryFill.setAttribute('fill', gradient);
    }

    /**
     * Update charging indicator
     */
    updateChargingIndicator(isCharging) {
        if (!this.elements.chargingBolt) return;

        if (isCharging) {
            this.elements.chargingBolt.setAttribute('opacity', '1');
        } else {
            this.elements.chargingBolt.setAttribute('opacity', '0');
        }
    }

    /**
     * Update emotional state and face expression
     */
    updateEmotionalState(emotionData) {
        const { emotion } = emotionData;
        
        // Remove all state classes
        this.elements.batterySvg.classList.remove(
            'battery-state-happy',
            'battery-state-content',
            'battery-state-worried',
            'battery-state-sad',
            'battery-state-critical',
            'battery-state-charging'
        );

        // Add current state class
        if (emotion === 'charging') {
            this.elements.batterySvg.classList.add('battery-state-charging');
        } else {
            this.elements.batterySvg.classList.add(`battery-state-${emotion}`);
        }

        // Update face expression
        this.updateFaceExpression(emotion);
        
        // Update background
        this.updateBackground(emotion);
        
        // Manage particles
        if (emotion === 'critical' || emotion === 'sad') {
            this.startParticles();
        } else {
            this.stopParticles();
        }

        this.currentEmotion = emotion;
    }

    /**
     * Update face expression based on emotion
     */
    updateFaceExpression(emotion) {
        switch(emotion) {
            case 'charging':
            case 'happy':
                this.setHappyFace();
                break;
            case 'content':
                this.setContentFace();
                break;
            case 'worried':
                this.setWorriedFace();
                break;
            case 'sad':
                this.setSadFace();
                break;
            case 'critical':
                this.setCriticalFace();
                break;
        }
    }

    /**
     * Set happy face expression
     */
    setHappyFace() {
        // Eyes open and normal
        this.elements.leftEye.setAttribute('r', '15');
        this.elements.rightEye.setAttribute('r', '15');
        
        // Happy smile
        this.elements.batteryMouth.setAttribute('d', 'M 120 280 Q 150 310 180 280');
        this.elements.batteryMouth.setAttribute('stroke', '#1f2937');
        this.elements.batteryMouth.setAttribute('stroke-width', '6');
    }

    /**
     * Set content face expression
     */
    setContentFace() {
        this.elements.leftEye.setAttribute('r', '15');
        this.elements.rightEye.setAttribute('r', '15');
        
        // Slight smile
        this.elements.batteryMouth.setAttribute('d', 'M 120 290 Q 150 305 180 290');
        this.elements.batteryMouth.setAttribute('stroke', '#1f2937');
        this.elements.batteryMouth.setAttribute('stroke-width', '5');
    }

    /**
     * Set worried face expression
     */
    setWorriedFace() {
        // Eyes slightly smaller (concerned)
        this.elements.leftEye.setAttribute('r', '14');
        this.elements.rightEye.setAttribute('r', '14');
        
        // Wavy worried mouth
        this.elements.batteryMouth.setAttribute('d', 'M 120 300 Q 140 295 150 300 Q 160 305 180 300');
        this.elements.batteryMouth.setAttribute('stroke', '#4b5563');
        this.elements.batteryMouth.setAttribute('stroke-width', '5');
    }

    /**
     * Set sad face expression
     */
    setSadFace() {
        // Droopy eyes
        this.elements.leftEye.setAttribute('r', '13');
        this.elements.rightEye.setAttribute('r', '13');
        
        // Sad frown
        this.elements.batteryMouth.setAttribute('d', 'M 120 310 Q 150 290 180 310');
        this.elements.batteryMouth.setAttribute('stroke', '#6b7280');
        this.elements.batteryMouth.setAttribute('stroke-width', '6');
    }

    /**
     * Set critical face expression
     */
    setCriticalFace() {
        // Wide eyes (shocked)
        this.elements.leftEye.setAttribute('r', '16');
        this.elements.rightEye.setAttribute('r', '16');
        
        // Open mouth (shocked)
        this.elements.batteryMouth.setAttribute('d', 'M 135 295 Q 135 320 150 325 Q 165 320 165 295 Q 150 300 135 295 Z');
        this.elements.batteryMouth.setAttribute('stroke', '#991b1b');
        this.elements.batteryMouth.setAttribute('stroke-width', '4');
        this.elements.batteryMouth.setAttribute('fill', '#991b1b');
    }

    /**
     * Update background gradient based on emotion
     */
    updateBackground(emotion) {
        if (!this.elements.backgroundGradient) return;

        this.elements.backgroundGradient.classList.remove('charging', 'low-battery');

        if (emotion === 'charging') {
            this.elements.backgroundGradient.classList.add('charging');
        } else if (emotion === 'critical' || emotion === 'sad') {
            this.elements.backgroundGradient.classList.add('low-battery');
        }
    }

    /**
     * Start particle system for low battery
     */
    startParticles() {
        if (this.particleInterval) return; // Already running

        this.particleInterval = setInterval(() => {
            this.createParticle();
        }, 200);
    }

    /**
     * Stop particle system
     */
    stopParticles() {
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
            this.particleInterval = null;
        }

        // Clear existing particles
        if (this.elements.particleContainer) {
            this.elements.particleContainer.innerHTML = '';
        }
    }

    /**
     * Create a single particle
     */
    createParticle() {
        if (!this.elements.particleContainer) return;

        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random starting position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random drift direction
        const driftX = (Math.random() - 0.5) * 100;
        particle.style.setProperty('--drift-x', `${driftX}px`);
        
        // Random animation duration
        const duration = Math.random() * 3 + 2;
        particle.style.animation = `float-up ${duration}s ease-out forwards, particle-pulse ${duration/2}s ease-in-out infinite`;
        
        this.elements.particleContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }

    /**
     * Animate battery drain
     */
    animateDrain(fromPercent, toPercent, duration = 1000) {
        this.isAnimating = true;
        const startTime = Date.now();
        const startHeight = (fromPercent / 100) * 400;
        const endHeight = (toPercent / 100) * 400;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);
            
            const currentHeight = startHeight + (endHeight - startHeight) * eased;
            const currentPercent = (currentHeight / 400) * 100;
            
            this.updateBatteryLevel(currentPercent);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Pulse animation for critical alerts
     */
    pulseElement(element, duration = 500) {
        if (!element) return;

        element.style.animation = 'none';
        // Force reflow
        element.offsetHeight;
        element.style.animation = `pulse-critical ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    /**
     * Shake animation for warnings
     */
    shakeElement(element, duration = 500) {
        if (!element) return;

        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = `shake ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    /**
     * Clean up and stop all animations
     */
    destroy() {
        this.stopParticles();
        this.isAnimating = false;
    }
}

/**
 * Transition Manager
 * Handles smooth transitions between states
 */
class TransitionManager {
    constructor() {
        this.transitions = new Map();
        this.activeTransition = null;
    }

    /**
     * Register a transition
     */
    register(name, fromState, toState, callback, duration = 500) {
        this.transitions.set(name, {
            fromState,
            toState,
            callback,
            duration
        });
    }

    /**
     * Execute a transition
     */
    execute(name, ...args) {
        const transition = this.transitions.get(name);
        
        if (!transition) {
            console.warn(`Transition '${name}' not found`);
            return;
        }

        // Cancel active transition if any
        if (this.activeTransition) {
            clearTimeout(this.activeTransition);
        }

        // Execute callback
        transition.callback(...args);
        
        // Set timeout for transition duration
        this.activeTransition = setTimeout(() => {
            this.activeTransition = null;
        }, transition.duration);
    }

    /**
     * Clear all transitions
     */
    clear() {
        if (this.activeTransition) {
            clearTimeout(this.activeTransition);
            this.activeTransition = null;
        }
        this.transitions.clear();
    }
}

/**
 * Visual Effects Manager
 * Handles special visual effects
 */
class EffectsManager {
    constructor() {
        this.effects = [];
    }

    /**
     * Create screen shake effect
     */
    screenShake(intensity = 10, duration = 500) {
        const body = document.body;
        const startTime = Date.now();

        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const currentIntensity = intensity * (1 - progress);
                const x = (Math.random() - 0.5) * currentIntensity;
                const y = (Math.random() - 0.5) * currentIntensity;
                
                body.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                body.style.transform = '';
            }
        };

        shake();
    }

    /**
     * Create flash effect
     */
    flash(color = '#ffffff', duration = 200) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = color;
        overlay.style.opacity = '0.5';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10000';
        overlay.style.transition = `opacity ${duration}ms ease-out`;

        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, duration);
        }, 50);
    }

    /**
     * Create ripple effect
     */
    ripple(x, y, color = '#3b82f6') {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.borderRadius = '50%';
        ripple.style.border = `2px solid ${color}`;
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999';
        ripple.style.transition = 'all 1s ease-out';

        document.body.appendChild(ripple);

        setTimeout(() => {
            ripple.style.width = '300px';
            ripple.style.height = '300px';
            ripple.style.opacity = '0';
        }, 50);

        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 1050);
    }
}

// Export for use in other modules
window.AnimationController = AnimationController;
window.TransitionManager = TransitionManager;
window.EffectsManager = EffectsManager;
