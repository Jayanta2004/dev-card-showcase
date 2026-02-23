/**
 * RainParticle.js
 * Straight falling particles for Sad/Calm moods.
 */
import Particle from '../engine/Particle.js';

export default class RainParticle extends Particle {
    constructor(container, options) {
        super(container, options);
        this.element.classList.add('rain');

        // Randomize speed
        this.speed = Math.random() * 0.5 + 0.5; // % per frame

        // Reset to top
        this.y = -5;
        this.x = Math.random() * 100;

        this.maxLife = 200; // Ensure they reach bottom

        // Styling
        this.element.style.width = '2px';
        this.element.style.height = `${Math.random() * 15 + 10}px`;
        this.element.style.background = options.color || 'rgba(170, 200, 255, 0.4)';
        this.element.style.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        super.update();
        this.y += this.speed;
        this.element.style.top = `${this.y}%`;
    }
}
