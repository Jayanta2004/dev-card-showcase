/**
 * ScreamScroll - Particle System
 * 
 * Generates energy particles based on audio intensity.
 */

class ParticleSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'particle-system';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 40;
        `;
        document.body.appendChild(this.container);

        this.particles = [];
        this.maxParticles = 50;
    }

    emit(x, y, intensity) {
        if (this.particles.length >= this.maxParticles) return;

        const count = Math.floor(intensity * 10);
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            const size = Math.random() * 4 + 2;
            const color = intensity > 0.3 ? 'var(--accent-color)' : 'var(--secondary-color)';

            p.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                box-shadow: 0 0 10px ${color};
                border-radius: 50%;
                opacity: ${intensity};
                transition: transform 1s ease-out, opacity 1s ease-out;
            `;

            this.container.appendChild(p);

            const tx = (Math.random() - 0.5) * 200;
            const ty = (Math.random() - 0.5) * 200;

            requestAnimationFrame(() => {
                p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
                p.style.opacity = '0';
            });

            setTimeout(() => {
                p.remove();
            }, 1000);
        }
    }

    update(amplitude, velocity) {
        if (amplitude > 0.1) {
            // Emit particles at random locations or following some logic
            const x = Math.random() * window.innerWidth;
            const y = velocity > 0 ? window.innerHeight - 50 : 50;
            this.emit(x, y, amplitude);
        }
    }
}

window.ParticleSystem = new ParticleSystem();
