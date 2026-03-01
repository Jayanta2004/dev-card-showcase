/**
 * ConfettiParticle.js
 * Bursts of color for Happy mood.
 */
import Particle from '../engine/Particle.js';

export default class ConfettiParticle extends Particle {
    constructor(container, options) {
        super(container, options);
        this.element.classList.add('confetti');

        // Start from center-ish or random top
        this.x = 50;
        this.y = 50;

        // Explosive velocity
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2 + 1;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;

        // Gravity
        this.gravity = 0.05;
        this.friction = 0.95;

        // Rotation
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;

        this.maxLife = 150;

        // Styling
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        this.element.style.width = '8px';
        this.element.style.height = '8px';
        this.element.style.backgroundColor = color;
        this.element.style.borderRadius = '0'; // Square
    }

    update() {
        super.update();

        // Physics
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Rotation
        this.rotation += this.rotationSpeed;

        this.element.style.left = `${this.x}%`;
        this.element.style.top = `${this.y}%`;
        this.element.style.transform = `rotate(${this.rotation}deg)`;

        // Fade out
        if (this.life > 100) {
            this.element.style.opacity = 1 - ((this.life - 100) / 50);
        }
    }
}
