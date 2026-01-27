import { Vector3 } from '../math/Vector3.js';

class Particle {
    constructor() {
        this.position = new Vector3();
        this.velocity = new Vector3();
        this.color = '#fff';
        this.life = 1.0;
        this.size = 0.1;
        this.active = false;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.poolSize = 200;
        for (let i = 0; i < this.poolSize; i++) {
            this.particles.push(new Particle());
        }
    }

    emit(position, count, type) {
        let spawned = 0;
        for (const p of this.particles) {
            if (!p.active) {
                p.active = true;
                p.position.copy(position);
                p.life = 1.0;

                // Random velocity
                const vx = (Math.random() - 0.5) * 5;
                const vy = (Math.random() * 5) + 2;
                const vz = (Math.random() - 0.5) * 5;
                p.velocity.set(vx, vy, vz);

                if (type === 'GOAL') {
                    p.color = Math.random() > 0.5 ? '#2ecc71' : '#f1c40f'; // Green/Gold
                    p.size = 0.1 + Math.random() * 0.1;
                } else if (type === 'HIT') {
                    p.color = '#fff';
                    p.size = 0.05;
                    p.velocity.multiplyScalar(0.5);
                }

                spawned++;
                if (spawned >= count) break;
            }
        }
    }

    update(dt) {
        for (const p of this.particles) {
            if (p.active) {
                p.life -= dt;
                if (p.life <= 0) {
                    p.active = false;
                    continue;
                }

                // Gravity
                p.velocity.y -= 9.8 * dt;

                // Move
                p.position.add(p.velocity.clone().multiplyScalar(dt));

                // Ground
                if (p.position.y < 0) {
                    p.position.y = 0;
                    p.velocity.y *= -0.5;
                    p.velocity.x *= 0.8;
                    p.velocity.z *= 0.8;
                }
            }
        }
    }

    // Renderer needs access to this
    getActiveParticles() {
        return this.particles.filter(p => p.active);
    }
}
