/**
 * Visual Effects Engine
 * Handles particles and micro-interactions
 */
const Visuals = {
    ctx: null,
    width: 0,
    height: 0,
    particles: [],
    animationFrame: null,

    init: () => {
        // Create an overlay canvas for effects
        const canvas = document.createElement('canvas');
        canvas.id = 'fx-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);

        Visuals.ctx = canvas.getContext('2d');
        Visuals.resize();
        window.addEventListener('resize', Visuals.resize);

        Visuals.loop();
    },

    resize: () => {
        const cvs = document.getElementById('fx-canvas');
        if (cvs) {
            cvs.width = window.innerWidth;
            cvs.height = window.innerHeight;
            Visuals.width = cvs.width;
            Visuals.height = cvs.height;
        }
    },

    spawnConfetti: (x, y) => {
        const colors = ['#58A6FF', '#F778BA', '#3FB950', '#D29922', '#F0F6FC'];
        for (let i = 0; i < 30; i++) {
            Visuals.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10 - 5,
                life: 1.0,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 6 + 2
            });
        }
    },

    spawnPulse: (x, y) => {
        Visuals.particles.push({
            type: 'pulse',
            x: x,
            y: y,
            radius: 0,
            life: 1.0,
            color: 'rgba(88, 166, 255, 0.5)'
        });
    },

    loop: () => {
        const { ctx, width, height } = Visuals;
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        for (let i = Visuals.particles.length - 1; i >= 0; i--) {
            const p = Visuals.particles[i];

            p.life -= 0.02;

            if (p.life <= 0) {
                Visuals.particles.splice(i, 1);
                continue;
            }

            if (p.type === 'pulse') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = p.life;
                ctx.stroke();
                ctx.globalAlpha = 1;
                p.radius += 2;
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity

                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        requestAnimationFrame(Visuals.loop);
    }
};

window.Visuals = Visuals;
