
/**
 * TypeMorph - Character Entity
 * Represents a single letter and its physics state.
 */

class MorphChar {
    constructor(element) {
        this.el = element;
        this.rect = this.el.getBoundingClientRect();

        // Static center (will need update if text changes)
        this.originX = this.rect.left + this.rect.width / 2;
        this.originY = this.rect.top + this.rect.height / 2;

        // Physics State Properties
        this.weight = new Spring(100);
        this.width = new Spring(100);
        this.slant = new Spring(0);
        this.grade = new Spring(0);

        this.scale = new Spring(1);
        this.x = new Spring(0);
        this.y = new Spring(0);

        this.colorMix = new Spring(0);
    }

    // Called when layout changes (e.g. typing)
    refreshLayout() {
        this.rect = this.el.getBoundingClientRect();
        this.originX = this.rect.left + this.rect.width / 2;
        this.originY = this.rect.top + this.rect.height / 2;
    }

    update(time, index, audioLevel, wave) {
        // We receive proximity & wave from main loop

        const dx = window.MOUSE.x - this.originX;
        const dy = window.MOUSE.y - this.originY;
        const dist = Math.hypot(dx, dy);

        // 1. Proximity Calculation
        let localProx = Math.max(0, 1 - dist / window.CONFIG.radius);
        localProx = Math.pow(localProx, 3);

        // 2. Base Targets
        let targetWeight = 300 + (wave * 50);
        let targetWidth = 100 + (wave * 10);
        let targetSlant = 0;
        let targetScale = 1;
        let targetX = 0;
        let targetY = 0;

        // 3. Audio/Voice Influence (Global)
        if (audioLevel > 0.01) {
            // Audio makes text pump
            targetWeight += audioLevel * 500;
            targetWidth += audioLevel * 40;
            targetScale += audioLevel * 0.4;

            // Subtle random jitter on heavy bass
            if (audioLevel > 0.5) {
                targetX += (Math.random() - 0.5) * 5;
                targetY += (Math.random() - 0.5) * 5;
            }
        }

        // 4. Mode Logic
        if (window.CONFIG.mode === 'jelly') {
            targetWeight += 600 * localProx;
            targetWidth += 50 * localProx;
            targetScale += 0.5 * localProx;
            targetSlant = -10 * localProx;

            // Repulsion
            const repulsion = 50 * localProx;
            const angle = Math.atan2(dy, dx);
            targetX = Math.cos(angle) * -repulsion;
            targetY = Math.sin(angle) * -repulsion;

            // Mouse Drag/Skew
            targetX += window.MOUSE.vx * 0.05 * localProx;
            targetY += window.MOUSE.vy * 0.05 * localProx;

        } else if (window.CONFIG.mode === 'snap') {
            if (localProx > 0.6) {
                targetWeight = 900;
                targetWidth = 150;
                targetScale = 1.3;
                targetX = (Math.random() - 0.5) * 5;
            }
        } else if (window.CONFIG.mode === 'float') {
            // Orbit
            const orbitRadius = 120 + (index * 15);
            const orbitSpeed = time * 0.4 + (index * 0.1);

            const absX = window.MOUSE.x + Math.cos(orbitSpeed) * orbitRadius;
            const absY = window.MOUSE.y + Math.sin(orbitSpeed) * orbitRadius;

            targetX = absX - this.originX;
            targetY = absY - this.originY;

            targetScale = 0.8;
            targetWeight = 200;

            // Particles
            if (Math.random() < 0.02) window.PARTICLES.emit(absX, absY, 1, 0.5);
        }

        // 5. Apply to Springs
        this.weight.target = Math.min(1000, targetWeight); // Clamp
        this.width.target = Math.min(151, targetWidth);
        this.scale.target = targetScale;
        this.slant.target = targetSlant;
        this.x.target = targetX;
        this.y.target = targetY;
        this.colorMix.target = localProx * 100;

        // 6. Step Physics
        this.weight.update();
        this.width.update();
        this.slant.update();
        this.scale.update();
        this.x.update();
        this.y.update();
        this.colorMix.update();

        // 7. Particle Triggers
        if (Math.abs(this.x.velocity) > 2) {
            if (Math.random() > 0.85) {
                window.PARTICLES.emit(this.originX + this.x.current, this.originY + this.y.current, 1, 1);
            }
        }

        return localProx;
    }

    render() {
        this.el.style.fontVariationSettings = `
            'wght' ${this.weight.current.toFixed(1)},
            'wdth' ${this.width.current.toFixed(1)},
            'slnt' ${this.slant.current.toFixed(1)}
        `;

        this.el.style.transform = `
            translate(${this.x.current}px, ${this.y.current}px)
            scale(${this.scale.current})
        `;

        // Color
        const mix = this.colorMix.current / 100;
        // Use CSS variables if possible, but for performance we hardcode or query
        // Let's rely on currentColor being influenced by CSS, or override

        // Dynamic Accent interpolation
        // We can read the CSS var --accent-color-rgb ?? Too slow.
        // Let's simple lerp for now, but Themes might want meaningful control.
        // Best approach: Use opacity or HSL

        // HSL shift?
        // Base: Hue 0 (Red) or White
        // Let's stick to the White -> Red shift for now
        const r = 255;
        const g = 255 - (200 * mix);
        const b = 255 - (150 * mix);
        this.el.style.color = `rgb(${r},${g},${b})`;
    }
}

// Explicit Export
window.MorphChar = MorphChar;
console.log('MorphChar Loaded');
