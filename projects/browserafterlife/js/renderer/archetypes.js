
export const ARCHETYPE_RENDERERS = {
    // 1. Wraith (Aggressive, spikey)
    Wraith: (ctx, entity, t) => {
        const { x, y, soul } = entity;
        ctx.save();
        ctx.translate(x, y);

        ctx.strokeStyle = soul.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = soul.color;

        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const r = 20 + Math.random() * 5;
            const x2 = Math.cos(angle) * r;
            const y2 = Math.sin(angle) * r;
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.stroke();

        // Angry Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(-10, -5); ctx.lineTo(-5, 0); ctx.lineTo(-10, 5);
        ctx.moveTo(10, -5); ctx.lineTo(5, 0); ctx.lineTo(10, 5);
        ctx.fill();

        ctx.restore();
    },

    // 2. Poltergeist (Chaotic, multiple orbs)
    Poltergeist: (ctx, entity, t) => {
        const { x, y, soul } = entity;
        ctx.save();
        ctx.translate(x, y);

        const orbitSpeed = t * 0.1;

        [0, 1, 2].forEach(i => {
            const offset = i * (Math.PI * 2 / 3);
            const ox = Math.cos(orbitSpeed + offset) * 15;
            const oy = Math.sin(orbitSpeed + offset) * 15;

            ctx.fillStyle = soul.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = soul.color;
            ctx.beginPath();
            ctx.arc(ox, oy, 8, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    },

    // 3. Phantom (Fading, classic ghost)
    Phantom: (ctx, entity, t) => {
        const { x, y, soul } = entity;
        ctx.save();
        ctx.translate(x, y);

        // Bobbing
        ctx.translate(0, Math.sin(t * 0.05) * 5);

        ctx.fillStyle = soul.color;
        ctx.globalAlpha = 0.4 + Math.sin(t * 0.1) * 0.2; // Pulse
        ctx.shadowBlur = 20;
        ctx.shadowColor = soul.color;

        ctx.beginPath();
        ctx.arc(0, 0, 15, Math.PI, 0);
        ctx.lineTo(15, 30);
        ctx.lineTo(5, 20);
        ctx.lineTo(-5, 30);
        ctx.lineTo(-15, 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(-5, -5, 2, 0, Math.PI * 2);
        ctx.arc(5, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    // 4. Shade (Dark, smoky)
    Shade: (ctx, entity, t) => {
        const { x, y, soul } = entity;
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = '#111';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#000';

        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();

        // Smoky ring
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 22 + Math.sin(t * 0.2) * 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    },

    // 5. Banshee (Screaming visual)
    Banshee: (ctx, entity, t) => {
        const { x, y, soul } = entity;
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = soul.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = soul.color;

        // Screaming mouth
        const open = 10 + Math.sin(t * 0.5) * 5;

        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(0, 5, 4, open / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
};
