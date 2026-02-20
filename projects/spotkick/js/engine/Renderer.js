import { Camera } from './Camera.js';
import { CONSTANTS } from '../constants.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.camera = new Camera(this.canvas.width, this.canvas.height);

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.resize(this.canvas.width, this.canvas.height);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render(state) {
        this.clear();

        // 1. Draw Field
        this.drawField();

        // 2. Draw Goal
        this.drawGoal();

        // 3. Draw Goalkeeper
        if (state.keeper) {
            this.drawKeeper(state.keeper);
        }

        // 4. Draw Ball
        if (state.ball) {
            this.drawBall(state.ball);
        }

        // 5. Draw Particles
        if (state.particles) {
            this.drawParticles(state.particles);
        }
    }

    drawField() {
        const ctx = this.ctx;

        // Quad Points
        const p1 = this.camera.project({ x: -30, y: 0, z: -5 });
        const p2 = this.camera.project({ x: 30, y: 0, z: -5 });
        const p3 = this.camera.project({ x: 30, y: 0, z: 50 });
        const p4 = this.camera.project({ x: -30, y: 0, z: 50 });

        if (!p1 || !p2 || !p3 || !p4) return;

        // Grass Gradient
        const grad = ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height * 0.4);
        grad.addColorStop(0, '#1a472a');
        grad.addColorStop(1, '#0d2516');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.fill();

        // Field Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;

        this.drawLine3D({ x: -20, y: 0.02, z: CONSTANTS.FIELD.GOAL_Z }, { x: 20, y: 0.02, z: CONSTANTS.FIELD.GOAL_Z });

        const boxZ = CONSTANTS.FIELD.GOAL_Z - 16.5;
        const boxWidth = 20;
        this.drawLine3D({ x: -boxWidth, y: 0.02, z: CONSTANTS.FIELD.GOAL_Z }, { x: -boxWidth, y: 0.02, z: boxZ });
        this.drawLine3D({ x: boxWidth, y: 0.02, z: CONSTANTS.FIELD.GOAL_Z }, { x: boxWidth, y: 0.02, z: boxZ });
        this.drawLine3D({ x: -boxWidth, y: 0.02, z: boxZ }, { x: boxWidth, y: 0.02, z: boxZ });

        this.drawCircle3D({ x: 0, y: 0.02, z: CONSTANTS.FIELD.BALL_START_Z }, 0.2, '#fff');
    }

    drawGoal() {
        const x = CONSTANTS.FIELD.GOAL_WIDTH / 2;
        const y = CONSTANTS.FIELD.GOAL_HEIGHT;
        const z = CONSTANTS.FIELD.GOAL_Z;

        this.ctx.lineWidth = 6;
        this.ctx.strokeStyle = '#eee';
        this.ctx.lineCap = 'round';

        this.drawLine3D({ x: -x, y: 0, z: z }, { x: -x, y: y, z: z });
        this.drawLine3D({ x: x, y: 0, z: z }, { x: x, y: y, z: z });
        this.drawLine3D({ x: -x, y: y, z: z }, { x: x, y: y, z: z });

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#aaa';
        const depth = 2.0;
        this.drawLine3D({ x: -x, y: 0, z: z + depth }, { x: -x, y: y, z: z });
        this.drawLine3D({ x: x, y: 0, z: z + depth }, { x: x, y: y, z: z });
        this.drawLine3D({ x: -x, y: 0, z: z }, { x: -x, y: 0, z: z + depth });
        this.drawLine3D({ x: x, y: 0, z: z }, { x: x, y: 0, z: z + depth });
        this.drawLine3D({ x: -x, y: 0, z: z + depth }, { x: x, y: 0, z: z + depth });
    }

    drawBall(ball) {
        const proj = this.camera.project(ball.position);
        if (!proj) return;

        const ctx = this.ctx;
        const radius = ball.radius * proj.scale;

        // Shadow
        const shadowPos = this.camera.project({ x: ball.position.x, y: 0, z: ball.position.z });
        if (shadowPos) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(shadowPos.x, shadowPos.y, radius * 1.2, radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ball Body
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-radius * 0.5, -radius * 0.5);
        ctx.lineTo(radius * 0.5, radius * 0.5);
        ctx.stroke();

        ctx.restore();
    }

    drawKeeper(keeper) {
        const proj = this.camera.project(keeper.position);
        if (!proj) return;

        const ctx = this.ctx;
        const height = 1.9;
        const width = 0.6;

        const scaledHeight = height * proj.scale;
        const scaledWidth = width * proj.scale;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(proj.x, proj.y + scaledHeight, scaledWidth, scaledWidth * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e74c3c';

        ctx.save();
        ctx.translate(proj.x, proj.y);

        // Pivot from center of body (proj.y) to feet
        // proj.y corresponds to Keeper Center in world space approximately
        // Actually Camera.project logic: y is center - projected offset.
        // My previous login in drawKeeper assumed proj.y was center.

        ctx.fillRect(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);

        ctx.fillStyle = '#ffccaa';
        ctx.beginPath();
        ctx.arc(0, -scaledHeight / 2 - (scaledWidth * 0.5), scaledWidth * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawParticles(particles) {
        this.ctx.globalCompositeOperation = 'lighter'; // Additive blending for sparks
        for (const p of particles) {
            const proj = this.camera.project(p.position);
            if (proj) {
                const r = p.size * proj.scale;
                this.ctx.fillStyle = p.color; // Should include alpha based on life?
                this.ctx.globalAlpha = p.life;
                this.ctx.beginPath();
                this.ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1.0;
    }

    drawLine3D(start, end) {
        const p1 = this.camera.project(start);
        const p2 = this.camera.project(end);
        if (p1 && p2) {
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
        }
    }

    drawCircle3D(center, radiusWrapper, color) {
        const p = this.camera.project(center);
        if (p) {
            const r = radiusWrapper * p.scale;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}
