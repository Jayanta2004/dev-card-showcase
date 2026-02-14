export class InputHandler {
    constructor(canvas, simulation) {
        this.canvas = canvas;
        this.simulation = simulation;

        this.mouse = { x: 0, y: 0, isDown: false };
        this.dragStart = { x: 0, y: 0 };

        // Event Listeners
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

        window.addEventListener('keydown', (e) => {
            if (e.key === 's' || e.key === 'S') {
                if (this.simulation.saveLoadSystem) this.simulation.saveLoadSystem.save();
            } else if (e.key === 'l' || e.key === 'L') {
                if (this.simulation.saveLoadSystem) this.simulation.saveLoadSystem.load();
            } else if (e.key === ' ') {
                this.simulation.explode();
            } else if (e.key === 'g' || e.key === 'G') {
                this.simulation.generateLevel();
            }
        });
    }

    onMouseDown(e) {
        this.mouse.isDown = true;
        this.dragStart.x = e.clientX;
        this.dragStart.y = e.clientY;
    }

    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    onMouseUp(e) {
        this.mouse.isDown = false;
    }

    update(particles) {
        // Hover/Select logic
        // Find particle under mouse
        let hovered = null;
        for (const p of particles) {
            const dx = p.pos.x - this.mouse.x;
            const dy = p.pos.y - this.mouse.y;
            if (dx * dx + dy * dy < (p.radius + 10) ** 2) {
                hovered = p;
                break;
            }
        }

        if (hovered && this.mouse.isDown) {
            if (this.simulation.inspector) this.simulation.inspector.inspect(hovered);
        }

        if (this.mouse.isDown) {
            // "Teaching" mechanic: affect particles near mouse
            for (const p of particles) {
                const dx = this.mouse.x - p.pos.x;
                const dy = this.mouse.y - p.pos.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 100) {
                    // Mouse is influencing this particle
                    // 1. Apply physical force (drag it towards mouse)
                    const forceStrength = 0.5;
                    p.vel.x += dx * forceStrength;
                    p.vel.y += dy * forceStrength;

                    // 2. Calculate "Instruction" vector (how user is moving the particle)
                    if (this.simulation.mutationEngine) {
                        this.simulation.mutationEngine.evolveFromInteraction(p, { x: p.vel.x * 0.1, y: p.vel.y * 0.1 });
                    }
                }
            }
        }
    }

    drawDebug(ctx) {
        if (this.mouse.isDown) {
            ctx.beginPath();
            ctx.arc(this.mouse.x, this.mouse.y, 20, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.stroke();
        }
    }
}
