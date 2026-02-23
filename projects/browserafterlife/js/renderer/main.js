
import { ARCHETYPE_RENDERERS } from './archetypes.js';
import { ParticleSystem } from './particles.js';
import { GlitchPass } from './glitch.js';

export class GhostRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = new ParticleSystem(ctx);
        this.glitch = new GlitchPass(ctx);

        // CRT Scanline Pattern
        this.scanlineCanvas = document.createElement('canvas');
        this.scanlineCanvas.width = 100;
        this.scanlineCanvas.height = 100;
        const sCtx = this.scanlineCanvas.getContext('2d');
        sCtx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < 100; i += 2) {
            sCtx.fillRect(0, i, 100, 1);
        }
        this.scanlinePattern = ctx.createPattern(this.scanlineCanvas, 'repeat');
    }

    draw(entities, soul) {
        // Clear background with slight fade for trails? No, strict clear for performance
        // But we can do a "persistence of vision" effect
        // this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        // this.ctx.fillRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Actually clearing is safer for now
        // this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Update Particles
        this.particles.update();
        this.particles.draw();

        entities.forEach(entity => {
            this.drawEntity(entity);

            // Randomly emit particles
            if (Math.random() > 0.9) {
                this.particles.emit(entity.x, entity.y, {
                    color: entity.soul.color,
                    type: Math.random() > 0.5 ? 'ectoplasm' : 'dust',
                    life: 40
                });
            }
        });

        // Overlay CRT effect
        this.ctx.fillStyle = this.scanlinePattern;
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';

        // Glitch Pass
        // Intensity depends on number of entities?
        const intensity = Math.min(0.8, entities.length * 0.05);
        this.glitch.apply(intensity);
    }

    drawEntity(entity) {
        const { soul, t } = entity;
        const renderer = ARCHETYPE_RENDERERS[soul.manifest.archetype] || ARCHETYPE_RENDERERS['Phantom'];
        renderer(this.ctx, entity, t);
    }
}
