/**
 * FireflyParticle.js
 * Glowing, wandering particles for organic moods.
 */
import Particle from '../engine/Particle.js';

export default class FireflyParticle extends Particle {
    constructor(container, options) {
        super(container, options);
        this.element.classList.add('firefly');

        this.x = Math.random() * 100;
        this.y = Math.random() * 100;

        // Random wander parameters
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.2;
        this.turnSpeed = 0.1;

        this.maxLife = 300; // Long lived

        // Styling
        this.element.style.width = '4px';
        this.element.style.height = '4px';
        this.element.style.background = '#ffd700'; // Gold
        this.element.style.borderRadius = '50%';
        this.element.style.boxShadow = '0 0 8px #ffd700';
        this.element.style.opacity = 0;

        // Blink offset
        this.blinkOffset = Math.random() * 100;
        this.blinkSpeed = 0.05 + Math.random() * 0.05;
    }

    update() {
        super.update();

        // Wandering logic (Perlin noise would be better but simple random walk works)
        this.angle += (Math.random() - 0.5) * this.turnSpeed;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Wrap around
        if (this.x < 0) this.x = 100;
        if (this.x > 100) this.x = 0;
        if (this.y < 0) this.y = 100;
        if (this.y > 100) this.y = 0;

        this.element.style.left = `${this.x}%`;
        this.element.style.top = `${this.y}%`;

        // Blinking
        const blinkBase = Math.sin((this.life + this.blinkOffset) * this.blinkSpeed);
        // Map -1..1 to 0..1
        this.element.style.opacity = (blinkBase + 1) / 2;
    }
}
