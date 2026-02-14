/**
 * Renderer - A high-performance canvas rendering engine for the BoidType simulation.
 * Manages the drawing loop, post-processing effects like motion blur and bloom,
 * and different visual representation modes for autonomous agents.
 * 
 * @class Renderer
 */
export class Renderer {
    /**
     * Initializes the renderer and its graphics context.
     * @param {string} canvasId - The ID of the HTML5 canvas element.
     */
    constructor(canvasId) {
        /** @type {HTMLCanvasElement} The drawing surface */
        this.canvas = document.getElementById(canvasId);

        /** @type {CanvasRenderingContext2D} The 2D graphics context */
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        /** @type {string} Current primary fill color for boids */
        this.boidColor = '#00f2ff';

        /** @type {number} Overall opacity for rendering */
        this.globalAlpha = 1.0;

        this.resize();
    }

    /**
     * Synchronizes canvas dimensions with the browser viewport.
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Clears the frame with a cumulative alpha for motion blur effects.
     * @param {number} [opacity=0.2] - The opacity of the clearing rectangle.
     */
    clear(opacity = 0.2) {
        this.ctx.globalAlpha = 1.0;
        this.ctx.fillStyle = `rgba(5, 5, 5, ${opacity})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * The main draw call for the simulation.
     * Handles clearing, background effects, and agent rendering.
     * 
     * @param {Object} simulation - The simulation instance to render.
     * @param {Object} visuals - The visuals configuration to apply.
     */
    render(simulation, visuals) {
        // Post-processing setup
        this.clear(visuals.motionBlur);

        this.ctx.shadowBlur = visuals.glowIntensity;
        this.ctx.shadowColor = this.boidColor;

        // Optional: Draw background network/mesh
        if (visuals.drawConnections) {
            this.drawConnections(simulation, visuals.connectionRadius);
        }

        // Render agents based on active mode
        for (let boid of simulation.boids) {
            this.ctx.fillStyle = boid.color || this.boidColor;
            this.ctx.shadowColor = boid.color || this.boidColor;

            switch (visuals.mode) {
                case 'triangles':
                    this.drawTriangle(boid);
                    break;
                case 'triangles_filled':
                    this.drawTriangle(boid, true);
                    break;
                case 'lines':
                    this.drawLineAgent(boid);
                    break;
                default:
                    this.drawPoint(boid);
                    break;
            }
        }

        // Reset state
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Draws a simple circular agent.
     * @param {Object} boid - The agent to draw.
     */
    drawPoint(boid) {
        this.ctx.beginPath();
        this.ctx.arc(boid.position.x, boid.position.y, boid.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Draws an oriented triangle representing the agent's velocity vector.
     * @param {Object} boid - The agent to draw.
     * @param {boolean} [filled=false] - Whether to fill the triangle.
     */
    drawTriangle(boid, filled = false) {
        const theta = boid.velocity.heading() + Math.PI / 2;
        const r = boid.size;

        this.ctx.save();
        this.ctx.translate(boid.position.x, boid.position.y);
        this.ctx.rotate(theta);

        this.ctx.beginPath();
        this.ctx.moveTo(0, -r * 2);
        this.ctx.lineTo(-r, r * 2);
        this.ctx.lineTo(r, r * 2);
        this.ctx.closePath();

        if (filled) this.ctx.fill();
        else {
            this.ctx.strokeStyle = boid.color;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    /**
     * Draws a line showing the direction and speed of the agent.
     * @param {Object} boid 
     */
    drawLineAgent(boid) {
        this.ctx.beginPath();
        this.ctx.moveTo(boid.position.x, boid.position.y);
        this.ctx.lineTo(
            boid.position.x - boid.velocity.x * 2,
            boid.position.y - boid.velocity.y * 2
        );
        this.ctx.strokeStyle = boid.color;
        this.ctx.lineWidth = boid.size;
        this.ctx.stroke();
    }

    /**
     * Sub-engine to draw connections between nearby agents (Mesh mode).
     * @param {Object} simulation 
     * @param {number} radius 
     */
    drawConnections(simulation, radius) {
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeStyle = this.boidColor;
        this.ctx.globalAlpha = 0.2;

        const radiusSq = radius * radius;

        // optimization: use spatial grid for drawing connections
        for (let boid of simulation.boids) {
            const nearby = simulation.grid.getNearby(boid, radius);
            for (let other of nearby) {
                if (boid === other) continue;
                const dSq = boid.position.distSq(other.position);
                if (dSq < radiusSq) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(boid.position.x, boid.position.y);
                    this.ctx.lineTo(other.position.x, other.position.y);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Changes the master boid color.
     * @param {string} color 
     */
    setBoidColor(color) {
        this.boidColor = color;
    }
}
