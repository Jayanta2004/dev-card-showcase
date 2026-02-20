import { lerp, random, hslToRgba, easeOutQuart, map } from './utils.js';

export class VisualEngine {
    constructor() {
        this.canvas = document.getElementById('chromawave-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = window.devicePixelRatio || 1;

        // State
        this.particles = [];
        this.theme = 'neon'; // Default
        this.frameCount = 0;
        this.intensity = 1.0;

        // FX State
        this.isKaleidoscope = false;
        this.kaleidoscopeSegments = 8;
        this.strobeActive = false;
        this.strobeDecay = 0;

        // Theme Colors (hsl)
        this.themes = {
            neon: { h: [180, 300], s: 100, l: 50, bg: 'rgba(5, 5, 16, 0.2)' },
            pastel: { h: [330, 40], s: 70, l: 75, bg: 'rgba(255, 240, 245, 0.2)' },
            natural: { h: [90, 160], s: 60, l: 40, bg: 'rgba(20, 30, 20, 0.2)' },
            monochrome: { h: [0, 0], s: 0, l: 100, bg: 'rgba(0, 0, 0, 0.2)' }
        };

        this.initParticles(150); // Initial pool
        this.resize();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;

        this.ctx.scale(this.dpr, this.dpr);
    }

    initParticles(count) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: random(0, this.width),
                y: random(0, this.height),
                vx: random(-1, 1),
                vy: random(-1, 1),
                size: random(2, 5),
                life: random(0.5, 1),
                baseHue: random(0, 30) // Offset
            });
        }
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.theme = themeName;
            // Optionally reset particles or effects here
        }
    }

    setIntensity(val) {
        this.intensity = val;
    }

    setKaleidoscope(enabled) {
        this.isKaleidoscope = enabled;
    }

    triggerBurst(type) {
        // Create a visual shockwave
        const count = 20;
        const config = this.themes[this.theme];
        const hue = config.h[type === 'bass' ? 0 : 1];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: this.width / 2, // Centered for kaleidoscope logic
                y: this.height / 2,
                vx: random(-5, 5),
                vy: random(-5, 5),
                size: random(5, 10),
                life: 1.0,
                baseHue: 0,
                isBurst: true, // Special flag
                color: hslToRgba(hue, 100, 70, 1)
            });
        }

        // Strobe on kick
        if (type === 'bass') {
            this.strobeDecay = 1.0;
        }
    }

    render(audio) {
        this.frameCount++;

        const config = this.themes[this.theme];
        const bassNorm = (audio.bass / 255) * this.intensity;   // 0-1
        const midNorm = (audio.mid / 255) * this.intensity;     // 0-1
        const trebleNorm = (audio.treble / 255) * this.intensity; // 0-1

        // 1. Clear with Fade for Trail Effect
        // If Strobe is active, flash white
        if (this.strobeDecay > 0.01) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.strobeDecay * 0.1})`; // Subtle flash
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.strobeDecay *= 0.9;
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = config.bg;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // --- KALEIDOSCOPE TRANSFORM ---
        // We draw everything into a "slice" if kaleidoscope is on

        if (this.isKaleidoscope) {
            this.ctx.save();
            this.ctx.translate(this.width / 2, this.height / 2);
            // We just draw once normally, but we'll use a loop of rotations for the output
            // Actually, efficient kaleidoscope in canvas:
            // 1. Draw scene to offscreen buffer? OR
            // 2. Just rotate the context N times and draw key elements.
            // Option 2 is exciting but heavy. Let's do a simplified approach:
            // Rotate the entire particle system drawing N times.

            // To keep 60fps, let's just mirror 4 times (Quad)
            for (let i = 0; i < 4; i++) {
                this.ctx.rotate(Math.PI / 2);
                this.drawScene(audio, bassNorm, midNorm, trebleNorm, config, true);
            }
            this.ctx.restore();
        } else {
            this.drawScene(audio, bassNorm, midNorm, trebleNorm, config, false);
        }
    }

    drawScene(audio, bassNorm, midNorm, trebleNorm, config, isMirrored) {
        const centerX = isMirrored ? 0 : this.width / 2;
        const centerY = isMirrored ? 0 : this.height / 2;

        // 2. Draw Center Pulse (Bass)
        const maxRadius = Math.min(this.width, this.height) * (isMirrored ? 0.2 : 0.4);
        const radius = maxRadius * (0.2 + bassNorm * 0.8);

        // Blend colors based on theme range
        const hue1 = config.h[0];
        const hue2 = config.h[1];
        const dynamicHue = lerp(hue1, hue2, bassNorm);

        const gradient = this.ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius);
        gradient.addColorStop(0, hslToRgba(dynamicHue, config.s, config.l + 30, 0.8 * bassNorm));
        gradient.addColorStop(1, hslToRgba(dynamicHue + 40, config.s, config.l, 0));

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // 3. Draw Waveform Ring (Treble)
        if (audio.raw && audio.raw.length > 0) {
            this.ctx.beginPath();
            const sliceAngle = (Math.PI * 2) / 100; // Sample fewer points for performance

            for (let i = 0; i < 100; i++) {
                const sampleIdx = Math.floor(map(i, 0, 100, 0, audio.raw.length / 2));
                const amplitude = audio.raw[sampleIdx] / 255;
                const r = radius + (amplitude * 100 * trebleNorm);

                const angle = i * sliceAngle + (this.frameCount * 0.01); // Slowly rotate
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;

                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.strokeStyle = hslToRgba(hue2, config.s, config.l, 0.6 + trebleNorm * 0.4);
            this.ctx.lineWidth = 2 + trebleNorm * 5;
            this.ctx.stroke();
        }

        // 4. Update & Draw Particles (Mid/Treble reactive)
        // Note: For kaleidoscope, we need to map particle positions to local space relative to center
        // This is tricky without resetting particles.
        // Simplification: In kaleidoscope mode, we only draw particles that are relatively close to center to avoid clipping/mess.

        this.particles.forEach(p => {
            // Move logic stays same (global coordinates)
            p.x += p.vx * (1 + midNorm * 5);
            p.y += p.vy * (1 + midNorm * 5);

            // Wrap edges
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            // Size pulse
            const size = p.isBurst ? p.size : p.size * (1 + trebleNorm * 2);

            // Burst update
            if (p.isBurst) {
                p.life -= 0.05;
                if (p.life <= 0) p.x = -100;
            }

            // Draw
            // For Mirrored mode, coordinate transform:
            // We need to draw the particle relative to the rotation center (0,0 in canvas context)
            // But p.x/p.y are 0..width/height.
            // Let's map p.x/p.y to -width/2 .. width/2

            let drawX = p.x;
            let drawY = p.y;

            if (isMirrored) {
                drawX = p.x - this.width / 2;
                drawY = p.y - this.height / 2;
            }

            // Optimization: Skip off-screen particles in mirrored mode (though rotation brings them back)
            // Just draw all

            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY, size, 0, Math.PI * 2);

            if (p.isBurst) {
                this.ctx.fillStyle = p.color || '#fff';
                this.ctx.globalAlpha = p.life;
                this.ctx.fill();
                this.ctx.globalAlpha = 1.0;
            } else {
                this.ctx.fillStyle = hslToRgba(p.baseHue + hue1, config.s, 80, 0.5 + midNorm * 0.5);
                this.ctx.fill();
            }
        });
    }
}
