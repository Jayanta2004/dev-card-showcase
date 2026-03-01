/**
 * FanSim | Airflow Visualizer
 * ---------------------------------------------------------
 * Low-impact canvas particle system that simulates air
 * flow density and velocity based on fan speed.
 * ---------------------------------------------------------
 */

class AirflowVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.maxParticles = 80;
        this.isActive = false;
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'airflow-canvas';
        this.ctx = this.canvas.getContext('2d');
        
        // Style the canvas
        Object.assign(this.canvas.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '15'
        });

        const viewport = document.querySelector('.viewport');
        if (viewport) {
            viewport.appendChild(this.canvas);
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.isActive = true;
            this.loop();
        }
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    createParticle() {
        // Spawn particles near the fan hub
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Random offset from center
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 40;

        return {
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist,
            vx: Math.cos(angle) * (1 + FanState.physics.velocity * 5),
            vy: Math.sin(angle) * (1 + FanState.physics.velocity * 5),
            life: 1.0,
            decay: 0.01 + Math.random() * 0.02,
            size: 2 + Math.random() * 4,
            opacity: 0.2 + Math.random() * 0.3
        };
    }

    update() {
        const velocity = FanState.physics.velocity;
        
        // Skip update if fan is off and no particles left
        if (velocity < 0.01 && this.particles.length === 0) return;

        // Spawn new particles based on velocity
        if (velocity > 0.05 && this.particles.length < this.maxParticles * velocity) {
            for (let i = 0; i < 2; i++) {
                this.particles.push(this.createParticle());
            }
        }

        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();

        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = accentColor;
            this.ctx.globalAlpha = p.life * p.opacity;
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1.0;
    }

    loop() {
        if (!this.isActive) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

const airflowVisualizer = new AirflowVisualizer();
