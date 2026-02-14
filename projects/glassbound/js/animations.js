/**
 * ========================================
 * GLASSBOUND - Animation Engine
 * Visual effects and transitions
 * ========================================
 */

/**
 * Animation controller for smooth transitions
 */
class AnimationController {
    constructor() {
        this.animations = new Map();
        this.rafId = null;
        this.isRunning = false;
        this.lastTime = 0;
    }
    
    /**
     * Start animation loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }
    
    /**
     * Stop animation loop
     */
    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
    
    /**
     * Main animation loop
     */
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update all active animations
        this.animations.forEach((animation, id) => {
            if (animation.active) {
                animation.update(deltaTime);
                
                // Remove completed animations
                if (animation.isComplete()) {
                    this.animations.delete(id);
                }
            }
        });
        
        this.rafId = requestAnimationFrame(() => this.loop());
    }
    
    /**
     * Register new animation
     */
    register(id, animation) {
        this.animations.set(id, animation);
    }
    
    /**
     * Remove animation
     */
    remove(id) {
        this.animations.delete(id);
    }
    
    /**
     * Clear all animations
     */
    clear() {
        this.animations.clear();
    }
}

/**
 * Easing functions for smooth animations
 */
class Easing {
    static linear(t) {
        return t;
    }
    
    static easeInQuad(t) {
        return t * t;
    }
    
    static easeOutQuad(t) {
        return t * (2 - t);
    }
    
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    static easeInCubic(t) {
        return t * t * t;
    }
    
    static easeOutCubic(t) {
        return (--t) * t * t + 1;
    }
    
    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    static easeInQuart(t) {
        return t * t * t * t;
    }
    
    static easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }
    
    static easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    }
    
    static easeInElastic(t) {
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3);
    }
    
    static easeOutElastic(t) {
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
    }
    
    static easeInBounce(t) {
        return 1 - Easing.easeOutBounce(1 - t);
    }
    
    static easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
}

/**
 * Property animator for smooth value transitions
 */
class PropertyAnimator {
    constructor(target, property, from, to, duration, easing = Easing.easeOutQuad, onComplete = null) {
        this.target = target;
        this.property = property;
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.easing = easing;
        this.onComplete = onComplete;
        this.elapsed = 0;
        this.active = true;
    }
    
    /**
     * Update animation
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.elapsed += deltaTime;
        const t = Math.min(1, this.elapsed / this.duration);
        const easedT = this.easing(t);
        
        // Interpolate value
        const value = this.from + (this.to - this.from) * easedT;
        
        // Apply to target
        if (typeof this.target[this.property] === 'number') {
            this.target[this.property] = value;
        } else if (this.target instanceof HTMLElement) {
            this.target.style[this.property] = value;
        }
        
        // Check if complete
        if (t >= 1) {
            this.active = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }
    
    /**
     * Check if animation is complete
     */
    isComplete() {
        return !this.active;
    }
}

/**
 * Glass shake effect
 */
class GlassShake {
    constructor(element, intensity = 1.0, duration = 400) {
        this.element = element;
        this.intensity = intensity;
        this.duration = duration;
        this.elapsed = 0;
        this.active = true;
        this.originalTransform = element.style.transform || '';
    }
    
    /**
     * Update shake animation
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.elapsed += deltaTime;
        const t = this.elapsed / this.duration;
        
        if (t >= 1) {
            this.element.style.transform = this.originalTransform;
            this.active = false;
            return;
        }
        
        // Calculate shake with decay
        const decay = 1 - Easing.easeOutQuad(t);
        const frequency = 20;
        const offsetX = Math.sin(t * frequency) * this.intensity * 3 * decay;
        const offsetY = Math.cos(t * frequency * 1.3) * this.intensity * 2 * decay;
        const rotation = Math.sin(t * frequency * 0.7) * this.intensity * 0.5 * decay;
        
        this.element.style.transform = 
            `${this.originalTransform} translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
    }
    
    /**
     * Check if animation is complete
     */
    isComplete() {
        return !this.active;
    }
}

/**
 * Impact ripple effect
 */
class ImpactRipple {
    constructor(container, x, y, intensity = 1.0) {
        this.container = container;
        this.x = x;
        this.y = y;
        this.intensity = intensity;
        this.duration = 800;
        this.elapsed = 0;
        this.active = true;
        this.ripples = [];
        
        // Create ripple elements
        for (let i = 0; i < 3; i++) {
            const ripple = document.createElement('div');
            ripple.className = 'crack-ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.width = '0px';
            ripple.style.height = '0px';
            container.appendChild(ripple);
            
            this.ripples.push({
                element: ripple,
                delay: i * 150,
                started: false
            });
        }
    }
    
    /**
     * Update ripple animation
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.elapsed += deltaTime;
        
        this.ripples.forEach(ripple => {
            if (this.elapsed >= ripple.delay && !ripple.started) {
                ripple.started = true;
                ripple.element.classList.add('active');
            }
        });
        
        if (this.elapsed >= this.duration) {
            this.cleanup();
            this.active = false;
        }
    }
    
    /**
     * Clean up ripple elements
     */
    cleanup() {
        this.ripples.forEach(ripple => {
            ripple.element.remove();
        });
    }
    
    /**
     * Check if animation is complete
     */
    isComplete() {
        return !this.active;
    }
}

/**
 * Screen flash effect
 */
class ScreenFlash {
    constructor(color = 'rgba(255, 255, 255, 0.8)', duration = 500) {
        this.duration = duration;
        this.elapsed = 0;
        this.active = true;
        
        // Create flash element
        this.element = document.createElement('div');
        this.element.style.position = 'fixed';
        this.element.style.top = '0';
        this.element.style.left = '0';
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.element.style.background = color;
        this.element.style.pointerEvents = 'none';
        this.element.style.zIndex = '9999';
        this.element.style.opacity = '0';
        document.body.appendChild(this.element);
    }
    
    /**
     * Update flash animation
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.elapsed += deltaTime;
        const t = this.elapsed / this.duration;
        
        if (t >= 1) {
            this.cleanup();
            this.active = false;
            return;
        }
        
        // Flash intensity curve
        let opacity;
        if (t < 0.2) {
            opacity = Easing.easeOutQuad(t / 0.2);
        } else {
            opacity = 1 - Easing.easeInQuad((t - 0.2) / 0.8);
        }
        
        this.element.style.opacity = opacity;
    }
    
    /**
     * Clean up flash element
     */
    cleanup() {
        this.element.remove();
    }
    
    /**
     * Check if animation is complete
     */
    isComplete() {
        return !this.active;
    }
}

/**
 * Glass blur transition
 */
class GlassBlur {
    constructor(elements, fromBlur = 0, toBlur = 20, duration = 1000) {
        this.elements = Array.isArray(elements) ? elements : [elements];
        this.fromBlur = fromBlur;
        this.toBlur = toBlur;
        this.duration = duration;
        this.elapsed = 0;
        this.active = true;
    }
    
    /**
     * Update blur animation
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.elapsed += deltaTime;
        const t = Math.min(1, this.elapsed / this.duration);
        const easedT = Easing.easeInOutCubic(t);
        
        const blur = this.fromBlur + (this.toBlur - this.fromBlur) * easedT;
        
        this.elements.forEach(element => {
            element.style.filter = `blur(${blur}px)`;
        });
        
        if (t >= 1) {
            this.active = false;
        }
    }
    
    /**
     * Check if animation is complete
     */
    isComplete() {
        return !this.active;
    }
}

/**
 * Particle burst animation
 */
class ParticleBurst {
    constructor(container, x, y, count = 20, intensity = 1.0) {
        this.container = container;
        this.x = x;
        this.y = y;
        this.count = count;
        this.intensity = intensity;
        this.duration = 1500;
        this.elapsed = 0;
        this.active = true;
        this.particles = [];
        
        this.createParticles();
    }
    
    /**
     * Create particle elements
     */
    createParticles() {
        for (let i = 0; i < this.count; i++) {
            const angle = (Math.PI * 2 * i) / this.count + (Math.random() - 0.5) * 0.5;
            const speed = (2 + Math.random() * 6) * this.intensity;
            
            const particle = document.createElement('div');
            particle.className = 'crack-dust';
            particle.style.left = `${this.x}px`;
            particle.style.top = `${this.y}px`;
            this.container.appendChild(particle);
            
            this.particles.push({
                element: particle,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                x: this.x,
                y: this.y,
                size: 2 + Math.random() * 4,
                rotation: Math.random() * Math.PI * 2
            });
        }
    }
    
    /**
     * Update particle animation
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.elapsed += deltaTime;
        const t = this.elapsed / this.duration;
        
        if (t >= 1) {
            this.cleanup();
            this.active = false;
            return;
        }
        
        const dt = deltaTime / 16.67; // Normalize to 60fps
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vy += 0.3 * dt; // Gravity
            particle.rotation += 0.1 * dt;
            
            // Update element
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            particle.element.style.transform = `rotate(${particle.rotation}rad)`;
            particle.element.style.opacity = 1 - t;
        });
    }
    
    /**
     * Clean up particle elements
     */
    cleanup() {
        this.particles.forEach(particle => {
            particle.element.remove();
        });
    }
    
    /**
     * Check if animation is complete
     */
    isComplete() {
        return !this.active;
    }
}

/**
 * Tension meter pulse effect
 */
class TensionPulse {
    constructor(element, intensity = 1.0) {
        this.element = element;
        this.intensity = intensity;
        this.duration = 600;
        this.elapsed = 0;
        this.active = true;
        this.originalBoxShadow = element.style.boxShadow || '';
    }
    
    /**
     * Update pulse animation
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.elapsed += deltaTime;
        const t = this.elapsed / this.duration;
        
        if (t >= 1) {
            this.element.style.boxShadow = this.originalBoxShadow;
            this.active = false;
            return;
        }
        
        // Pulse intensity
        const pulse = Math.sin(t * Math.PI * 4) * (1 - t);
        const glowSize = 10 + pulse * 20 * this.intensity;
        const glowOpacity = 0.5 + pulse * 0.5;
        
        this.element.style.boxShadow = 
            `0 0 ${glowSize}px rgba(255, 100, 100, ${glowOpacity})`;
    }
    
    /**
     * Check if animation is complete
     */
    isComplete() {
        return !this.active;
    }
}

/**
 * Color transition effect
 */
class ColorTransition {
    constructor(element, property, fromColor, toColor, duration = 1000) {
        this.element = element;
        this.property = property;
        this.from = this.parseColor(fromColor);
        this.to = this.parseColor(toColor);
        this.duration = duration;
        this.elapsed = 0;
        this.active = true;
    }
    
    /**
     * Parse color string to RGBA values
     */
    parseColor(color) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        return { r: data[0], g: data[1], b: data[2], a: data[3] / 255 };
    }
    
    /**
     * Interpolate between colors
     */
    interpolateColor(from, to, t) {
        return {
            r: Math.round(from.r + (to.r - from.r) * t),
            g: Math.round(from.g + (to.g - from.g) * t),
            b: Math.round(from.b + (to.b - from.b) * t),
            a: from.a + (to.a - from.a) * t
        };
    }
    
    /**
     * Update color transition
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.elapsed += deltaTime;
        const t = Math.min(1, this.elapsed / this.duration);
        const easedT = Easing.easeInOutQuad(t);
        
        const color = this.interpolateColor(this.from, this.to, easedT);
        const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        
        if (this.property in this.element.style) {
            this.element.style[this.property] = colorString;
        }
        
        if (t >= 1) {
            this.active = false;
        }
    }
    
    /**
     * Check if animation is complete
     */
    isComplete() {
        return !this.active;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationController,
        Easing,
        PropertyAnimator,
        GlassShake,
        ImpactRipple,
        ScreenFlash,
        GlassBlur,
        ParticleBurst,
        TensionPulse,
        ColorTransition
    };
}
