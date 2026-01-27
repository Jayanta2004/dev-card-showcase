
/**
 * TypeMorph - Particle System
 * HTML5 Canvas overlay for visual sparks and trails.
 */

class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particles-canvas';
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.init();
    }

    init() {
        // Setup Canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none'; // Click through
        this.canvas.style.zIndex = '5'; // Above bg, below text (or above text?) Let's go below text for subtle effect
        this.canvas.style.zIndex = '-1';

        document.body.appendChild(this.canvas);

        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });

        // Trigger resize once
        window.dispatchEvent(new Event('resize'));
    }

    emit(x, y, count = 1, speed = 1) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * speed * 5,
                vy: (Math.random() - 0.5) * speed * 5,
                life: 1.0,
                color: `hsl(${Math.random() * 60 + 330}, 100%, 70%)` // Pinks/Reds
            });
        }
    }

    updateAndDraw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02; // Fade out

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;

        // Draw Mouse Trail Connectors
        if (window.MOUSE) {
            // Optional: Connect mouse to particles? Nah, too messy.
        }
    }
}

window.PARTICLES = new ParticleSystem();
