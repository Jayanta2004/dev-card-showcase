/**
 * FloatingOrb.js
 * Slowly drifting orbs for Calm/Focus moods.
 */
import Particle from '../engine/Particle.js';

export default class FloatingOrb extends Particle {
    constructor(container, options) {
        super(container, options);
        this.element.classList.add('orb');

        // Random starting pos (full screen)
        this.x = Math.random() * 100;
        this.y = Math.random() * 100;

        // Drift vector
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;

        this.maxLife = 400; // Live longer

        // Styling
        const size = Math.random() * 30 + 10;
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.style.background = options.color || 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)';
        this.element.style.boxShadow = `0 0 ${size}px ${options.glowColor || 'rgba(255,255,255,0.2)'}`;
        this.element.style.opacity = 0;

        this.fadeIn = true;
    }

    update() {
        super.update();
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges (optional, or wrap)
        if (this.x < 0 || this.x > 100) this.vx *= -1;
        if (this.y < 0 || this.y > 100) this.vy *= -1;

        this.element.style.left = `${this.x}%`;
        this.element.style.top = `${this.y}%`;

        // Fade logic
        const currentOp = parseFloat(this.element.style.opacity);
        if (this.fadeIn) {
            this.element.style.opacity = currentOp + 0.01;
            if (currentOp >= 0.6) this.fadeIn = false;
        } else {
            // Fade out near death
            if (this.life > this.maxLife - 50) {
                this.element.style.opacity = currentOp - 0.01;
            }
        }
    }
}
