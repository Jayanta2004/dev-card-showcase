/**
 * LiveTypingAura - Particle Class
 * Represents a single glowing particle in the system.
 */

import { CONFIG } from './config.js';

export class Particle {
    constructor(x, y, heat = 0, overrideHue = null) {
        this.x = x;
        this.y = y;

        // Phase 3: Z-Depth (0.0 = Far, 1.0 = Near)
        this.z = Math.pow(Math.random(), 0.8);

        // Random angle for explosion effect
        const angle = Math.random() * Math.PI * 2;

        // Velocity scales with heat AND depth (Parallax)
        const parallaxFactor = CONFIG.DEPTH.FAR_SCALE + (this.z * (CONFIG.DEPTH.PARALLAX_STRENGTH - CONFIG.DEPTH.FAR_SCALE));
        const heatSpeed = (1 + heat * 0.2);

        const speed = (Math.random() * CONFIG.PARTICLE.INITIAL_SPEED) * heatSpeed * parallaxFactor;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.life = 1.0;
        this.baseSize = CONFIG.PARTICLE.MIN_SIZE + Math.random() * (CONFIG.PARTICLE.MAX_SIZE - CONFIG.PARTICLE.MIN_SIZE);
        this.size = this.baseSize;

        // Color Determination: Override takes precedence
        let targetHue = CONFIG.COLORS.BASE_HUE;

        if (overrideHue !== null) {
            targetHue = overrideHue;
        } else {
            // Heat-based Color Map
            for (let tier of CONFIG.HEAT.TIERS) {
                if (heat >= tier.threshold) targetHue = tier.color;
            }
        }

        // Variance
        const hue = targetHue + (Math.random() - 0.5) * CONFIG.COLORS.HUE_VARIANCE;
        const sat = 70 + (heat * 5);
        this.color = `hsl(${hue}, ${Math.min(sat, 100)}%, 60%)`;

        this.active = true;
        this.initialX = x;
    }

    applyForce(forceX, forceY) {
        // Parallax affects how easily it is pushed? 
        // Lighter (near) particles might move more, or heavier?
        // Let's say near particles (larger) have more inertia, but we want visual impact.
        // Let's standardise force for now.
        this.vx += forceX;
        this.vy += forceY;
    }

    update(dt) {
        // Physics integration
        this.x += this.vx;
        this.y += this.vy;

        // Friction
        this.vx *= CONFIG.PARTICLE.FRICTION;
        this.vy *= CONFIG.PARTICLE.FRICTION;

        // Organic Curl / Noise (Simulated wind)
        // using simple sin waves based on position and time (approx via life)
        const timeOffset = (1 - this.life) * 10;
        const noiseX = Math.sin(this.y * 0.05 + timeOffset) * 0.1;
        const noiseY = Math.cos(this.x * 0.05 + timeOffset) * 0.1;

        this.vx += noiseX;
        this.vy += noiseY - CONFIG.PARTICLE.GRAVITY; // Gravity is up usually

        // Life decay
        this.life -= CONFIG.PARTICLE.LIFE_DECAY;

        // Size Pulse + Perspective
        // Near (z=1) -> Multiplier ~1.5
        // Far (z=0) -> Multiplier ~0.5
        const depthScale = CONFIG.DEPTH.FAR_SCALE + (this.z * (CONFIG.DEPTH.NEAR_SCALE - CONFIG.DEPTH.FAR_SCALE));
        const growth = 1 + (1 - this.life) * CONFIG.PARTICLE.GROWTH_RATE; // Grow over time

        this.size = this.baseSize * growth * depthScale;

        // Death condition
        if (this.life <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();

        // Alpha Perspective: Far particles are dimmer (atmospheric interaction)
        const depthAlpha = CONFIG.DEPTH.FAR_ALPHA + (this.z * (CONFIG.DEPTH.NEAR_ALPHA - CONFIG.DEPTH.FAR_ALPHA));
        ctx.globalAlpha = Math.max(0, this.life * depthAlpha);

        ctx.fillStyle = this.color;

        // Optimization: Blur/Glow only for NEAR particles to save perf and enhance depth
        if (this.life > 0.5 && this.z > 0.6) {
            ctx.shadowBlur = CONFIG.COLORS.GLOW_BLUR * this.z;
            ctx.shadowColor = this.color;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Special behavior: collapse inward (for backspace)
    implode(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        this.vx += dx * 0.1;
        this.vy += dy * 0.1;
        this.life -= 0.1; // Die faster
    }
}
