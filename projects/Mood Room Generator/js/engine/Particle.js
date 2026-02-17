/**
 * Particle.js
 * Abstract base class for individual particles.
 */
import DOMHelper from '../core/DOMHelper.js';

export default class Particle {
    constructor(container, options = {}) {
        this.element = DOMHelper.createElement('div', ['particle'], container);
        this.life = 0;
        this.maxLife = 100; // Frames or time units
        this.options = options;

        // Initial randomization
        this.x = Math.random() * 100; // %
        this.y = Math.random() * 100; // %
        this.element.style.left = `${this.x}%`;
        this.element.style.top = `${this.y}%`;
    }

    update() {
        this.life++;
        // Override in subclass for movement/visuals
    }

    isDead() {
        return this.life >= this.maxLife;
    }

    destroy() {
        this.element.remove();
    }
}
