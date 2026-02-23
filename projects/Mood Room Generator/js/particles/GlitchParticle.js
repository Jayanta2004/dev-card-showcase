/**
 * GlitchParticle.js
 * Erratic, flickering particles for Chaos mood.
 */
import Particle from '../engine/Particle.js';

export default class GlitchParticle extends Particle {
    constructor(container, options) {
        super(container, options);
        this.element.classList.add('glitch');

        this.x = Math.random() * 100;
        this.y = Math.random() * 100;

        this.maxLife = 20; // Short lived

        // Styling
        this.element.style.width = `${Math.random() * 50 + 10}px`;
        this.element.style.height = '2px';
        this.element.style.background = '#00ff00'; // Matrix green or static white
        this.element.style.boxShadow = '0 0 5px #00ff00';
    }

    update() {
        super.update();

        // Jumpy movement
        if (Math.random() > 0.5) {
            this.x = Math.random() * 100;
            this.y = Math.random() * 100;
        }

        this.element.style.left = `${this.x}%`;
        this.element.style.top = `${this.y}%`;

        // Flicker
        this.element.style.opacity = Math.random();
    }
}
