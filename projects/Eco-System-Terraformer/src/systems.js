import { System } from './ecs.js';
import { Position, Velocity, Type, Life, Renderable, Vision } from './components.js';
import { Vector, Random } from './utils.js';

export class MovementSystem extends System {
    update(dt) {
        for (const entity of this.world.entities) {
            const pos = entity.getComponent('Position');
            const vel = entity.getComponent('Velocity');

            if (pos && vel) {
                pos.x += vel.dx * dt;
                pos.y += vel.dy * dt;

                // Bounce off walls
                if (pos.x < 0) { pos.x = 0; vel.dx *= -1; }
                if (pos.x > this.world.width) { pos.x = this.world.width; vel.dx *= -1; }
                if (pos.y < 0) { pos.y = 0; vel.dy *= -1; }
                if (pos.y > this.world.height) { pos.y = this.world.height; vel.dy *= -1; }
            }
        }
    }
}

export class BiologicalSystem extends System {
    update(dt) {
        // Random Grass Growth (Rain effect handled by user, but natural growth too?)
        // Let's rely on reproduction for spread, but maybe random spawns if extinct?
        // Let's implement natural random grass growth:
        if (Math.random() < 0.05) {
            const x = Math.random() * this.world.width;
            const y = Math.random() * this.world.height;
            if (this.world.spawner) this.world.spawner.createGrass(this.world, x, y);
        }

        for (const entity of this.world.entities) {
            const type = entity.getComponent('Type');
            const life = entity.getComponent('Life');
            const pos = entity.getComponent('Position');

            if (!life || !life.alive || !type) continue;

            // Metabolic cost
            life.energy -= life.decayRate * dt;
            if (life.energy <= 0) {
                life.alive = false;
                entity.destroy();
                continue;
            }

            // Behavior based on Type
            if (type.type === 'Grass') {
                // Photosynthesis
                if (life.energy < life.maxEnergy) {
                    life.energy += dt * 10;
                }
            } else {
                this.handleAnimal(entity, type.type, pos, life, dt);
            }
        }
    }

    handleAnimal(entity, typeStr, pos, life, dt) {
        const vel = entity.getComponent('Velocity');
        const vision = entity.getComponent('Vision');

        if (!vel || !vision) return;

        // Hunt / Eat
        const targetType = typeStr === 'Wolf' ? 'Rabbit' : 'Grass';
        const nearby = this.world.query(pos.x, pos.y, vision.range);

        let closest = null;
        let minMsg = Infinity;

        for (const other of nearby) {
            if (other === entity) continue;
            const otherType = other.getComponent('Type');
            if (!otherType || otherType.type !== targetType) continue;

            const otherPos = other.getComponent('Position');
            const d = Vector.dist(pos, otherPos);

            if (d < 15) { // Eat range radius sum
                const energyGain = other.getComponent('Life').energy;
                life.energy += energyGain * 0.8;
                if (life.energy > life.maxEnergy * 1.5) life.energy = life.maxEnergy * 1.5;
                other.destroy();
                return; // Ate, done for this frame
            }

            if (d < minMsg) {
                minMsg = d;
                closest = otherPos;
            }
        }

        // Move towards food
        const speed = typeStr === 'Wolf' ? 60 : 40;

        if (closest) {
            const dir = Vector.normalize(Vector.sub(closest, pos));
            // Steer towards
            vel.dx += (dir.x * speed - vel.dx) * 0.05;
            vel.dy += (dir.y * speed - vel.dy) * 0.05;
        } else {
            // Wander
            if (Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                vel.dx += Math.cos(angle) * 10;
                vel.dy += Math.sin(angle) * 10;
            }

            // Clamp speed
            const currentSpeed = Math.hypot(vel.dx, vel.dy);
            const maxSpeed = speed;
            if (currentSpeed > maxSpeed) {
                const n = Vector.normalize({ x: vel.dx, y: vel.dy });
                vel.dx = n.x * maxSpeed;
                vel.dy = n.y * maxSpeed;
            }
        }
    }
}

export class ReproductionSystem extends System {
    update(dt) {
        for (const entity of this.world.entities) {
            const life = entity.getComponent('Life');
            const type = entity.getComponent('Type');

            if (life && life.alive && life.energy > life.maxEnergy) {
                // Reproduce chance
                if (Math.random() < 0.01) {
                    life.energy *= 0.5; // Cost
                    const pos = entity.getComponent('Position');

                    if (type.type === 'Grass') {
                        // Spread near
                        const offX = Random.float(-30, 30);
                        const offY = Random.float(-30, 30);
                        const x = Math.max(0, Math.min(this.world.width, pos.x + offX));
                        const y = Math.max(0, Math.min(this.world.height, pos.y + offY));

                        if (this.world.spawner) this.world.spawner.createGrass(this.world, x, y);
                    } else {
                        // Animal birth
                        if (this.world.spawner) {
                            if (type.type === 'Rabbit') this.world.spawner.createRabbit(this.world, pos.x, pos.y);
                            if (type.type === 'Wolf') this.world.spawner.createWolf(this.world, pos.x, pos.y);
                        }
                    }
                }
            }
        }
    }
}

export class RenderSystem extends System {
    constructor(world, ctx) {
        super(world);
        this.ctx = ctx;
    }

    update(dt) {
        // Clear logic handled in main loop usually, but here is fine too
        this.ctx.clearRect(0, 0, this.world.width, this.world.height);

        for (const entity of this.world.entities) {
            const pos = entity.getComponent('Position');
            const render = entity.getComponent('Renderable');
            const type = entity.getComponent('Type');

            if (pos && render && type) {
                this.ctx.fillStyle = render.color;

                if (type.type === 'Grass') {
                    // Draw grass as small clusters or squares
                    this.ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, render.size, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Glow effect for animals
                    if (type.type === 'Wolf') {
                        this.ctx.shadowColor = '#ff3b3b';
                        this.ctx.shadowBlur = 10;
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;
                    }
                    if (type.type === 'Rabbit') {
                        this.ctx.shadowColor = '#ffffff';
                        this.ctx.shadowBlur = 5;
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;
                    }
                }
            }
        }
    }
}
