export class Atmosphere {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.w = 0;
        this.h = 0;
        this.mode = 'none'; // none, fire, ice, matrix, void, water, sand

        // Matrix State
        this.matrixCols = [];
        this.fontSize = 16;

        // Starfield State
        this.stars = [];

        // Fire State
        this.fireParticles = [];

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loop();
    }

    resize() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = this.w;
        this.canvas.height = this.h;

        // Reset Matrix
        const columns = Math.ceil(this.w / this.fontSize);
        this.matrixCols = Array(columns).fill(0);

        // Reset Stars
        this.stars = Array(200).fill().map(() => ({
            x: Math.random() * this.w,
            y: Math.random() * this.h,
            z: Math.random() * 2 // depth/speed
        }));
    }

    setMode(mode) {
        this.mode = mode;
        // Optional init logic per mode
        if (mode === 'fire') {
            this.fireParticles = []; // Clear for fresh start
        }
    }

    updateMatrix() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.w, this.h);

        this.ctx.fillStyle = '#0F0';
        this.ctx.font = '16px monospace';

        this.matrixCols.forEach((y, i) => {
            const char = String.fromCharCode(0x30A0 + Math.random() * 96);
            this.ctx.fillText(char, i * this.fontSize, y * this.fontSize);

            if (y * this.fontSize > this.h && Math.random() > 0.975) {
                this.matrixCols[i] = 0;
            }
            this.matrixCols[i]++;
        });
    }

    updateFire() {
        // Clear with slight fade for trail
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.w, this.h);

        // Spawn new fire particles at bottom
        for (let k = 0; k < 5; k++) {
            this.fireParticles.push({
                x: Math.random() * this.w,
                y: this.h + 10,
                vx: (Math.random() - 0.5) * 1,
                vy: -(Math.random() * 3 + 2),
                life: 1.0,
                size: Math.random() * 20 + 10,
                hue: Math.random() * 40 // Red/Orange
            });
        }

        for (let i = this.fireParticles.length - 1; i >= 0; i--) {
            const p = this.fireParticles[i];
            p.x += p.vx + Math.sin(Date.now() * 0.005 + p.y * 0.01);
            p.y += p.vy;
            p.life -= 0.015;
            p.size *= 0.96;

            this.ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            if (p.life <= 0) this.fireParticles.splice(i, 1);
        }
    }

    updateVoid() {
        // Warp speed
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Long trails
        this.ctx.fillRect(0, 0, this.w, this.h);

        this.ctx.fillStyle = 'white';
        const cx = this.w / 2;
        const cy = this.h / 2;

        this.stars.forEach(star => {
            star.z += 0.05; // Move closer

            // Project 3D to 2D
            // Initial simple radial expansion
            const dx = star.x - cx;
            const dy = star.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Move away from center
            const angle = Math.atan2(dy, dx);
            const speed = (dist / 100) * star.z;

            star.x += Math.cos(angle) * speed;
            star.y += Math.sin(angle) * speed;

            const size = Math.max(0.5, speed * 0.5);
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
            this.ctx.fill();

            // Reset if out of bounds
            if (star.x < 0 || star.x > this.w || star.y < 0 || star.y > this.h) {
                star.x = Math.random() * this.w;
                star.y = Math.random() * this.h;
                star.z = Math.random(); // reset speed
            }
        });
    }

    loop() {
        requestAnimationFrame(() => this.loop());

        if (this.mode === 'matrix') {
            this.updateMatrix();
        } else if (this.mode === 'fire') {
            this.updateFire();
        } else if (this.mode === 'void') {
            this.updateVoid();
        } else {
            this.ctx.clearRect(0, 0, this.w, this.h);
        }
    }
}
