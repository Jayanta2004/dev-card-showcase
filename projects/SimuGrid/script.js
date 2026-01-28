/**
 * SIMUGRID MAIN CONTROLLER
 * Coordinates the physics engine, UI input, and Canvas rendering.
 * @author saiusesgithub
 */

class SimuController {
    constructor() {
        this.canvas = document.getElementById('canvas-physics');
        this.ctx = this.canvas.getContext('2d');
        this.world = new PhysicsWorld();
        
        this.isRunning = true;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        // Interaction State
        this.isMouseDown = false;
        this.mousePos = new Vec2();
        this.dragBody = null;
        this.selectedShape = 'box';

        this.init();
    }

    init() {
        this.resize();
        this.createGround();
        this.bindEvents();
        this.loop();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    /**
     * STATIC COLLISION BOUNDARIES
     * Creates heavy, non-movable bodies (invMass = 0) to act as floor and walls.
     */
    createGround() {
        const floor = new RigidBody({
            x: this.canvas.width / 2,
            y: this.canvas.height - 20,
            w: this.canvas.width,
            h: 40,
            mass: 0, // Infinite mass
            type: 'box',
            color: '#2a2a32'
        });
        this.world.add(floor);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        // Shape Selection
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelector('.shape-btn.active').classList.remove('active');
                btn.classList.add('active');
                this.selectedShape = btn.dataset.shape;
            };
        });

        // Mouse Interactions
        this.canvas.onmousedown = (e) => {
            this.isMouseDown = true;
            this.updateMousePos(e);
            
            if (e.button === 0) { // Left Click: Spawn
                this.spawnObject();
            }
        };

        this.canvas.onmousemove = (e) => {
            this.updateMousePos(e);
        };

        window.onmouseup = () => {
            this.isMouseDown = false;
        };

        // UI Controls
        document.getElementById('btn-clear').onclick = () => {
            this.world.bodies = [];
            this.createGround();
        };

        document.getElementById('btn-pause').onclick = (e) => {
            this.isRunning = !this.isRunning;
            e.currentTarget.querySelector('i').className = this.isRunning ? 'ri-pause-line' : 'ri-play-line';
        };

        // Keyboard Shortcuts
        window.onkeydown = (e) => {
            if (e.key.toLowerCase() === 'g') {
                const gy = this.world.gravity.y === 0 ? 0.5 : 0;
                this.world.gravity = new Vec2(0, gy);
            }
        };
    }

    updateMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
    }

    spawnObject() {
        const options = {
            x: this.mousePos.x,
            y: this.mousePos.y,
            mass: 1,
            restitution: parseFloat(document.getElementById('param-bounce').value),
            type: this.selectedShape,
            angle: Math.random() * Math.PI
        };

        if (this.selectedShape === 'box') {
            options.w = 40 + Math.random() * 40;
            options.h = 40 + Math.random() * 40;
        } else {
            options.r = 20 + Math.random() * 20;
        }

        this.world.add(new RigidBody(options));
        document.getElementById('val-bodies').innerText = this.world.bodies.length - 1;
    }

    /**
     * ANIMATION LOOP
     * Updates physics world and renders frames.
     */
    loop(time = 0) {
        const dt = (time - this.lastTime) / 16; // Normalized delta time
        this.lastTime = time;

        if (this.isRunning) {
            // Step physics multiple times for stability (Sub-stepping)
            const subSteps = 4;
            for (let i = 0; i < subSteps; i++) {
                this.world.step(dt / subSteps);
            }
        }

        this.render();
        this.updateStats(time);

        requestAnimationFrame((t) => this.loop(t));
    }

    render() {
        // Clear viewport
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Spatial Grid (Debug Mode)
        if (document.getElementById('dbg-grid').checked) {
            this.drawGrid();
        }

        // Draw Bodies
        this.world.bodies.forEach(body => {
            this.ctx.save();
            this.ctx.translate(body.pos.x, body.pos.y);
            this.ctx.rotate(body.angle);

            this.ctx.fillStyle = body.color;
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;

            if (body.type === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, body.shapeRadius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                // Draw radius line to show rotation
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(body.shapeRadius, 0);
                this.ctx.stroke();
            } else {
                const w = body.vertices[2].x * 2;
                const h = body.vertices[2].y * 2;
                this.ctx.fillRect(-w/2, -h/2, w, h);
                this.ctx.strokeRect(-w/2, -h/2, w, h);
            }

            this.ctx.restore();

            // Draw Velocity Vectors (Debug Mode)
            if (document.getElementById('dbg-vectors').checked && body.invMass !== 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(body.pos.x, body.pos.y);
                this.ctx.lineTo(body.pos.x + body.vel.x * 5, body.pos.y + body.vel.y * 5);
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.stroke();
            }
        });
    }

    drawGrid() {
        const size = this.world.spatialHash.cellSize;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += size) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += size) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    updateStats(time) {
        this.frameCount++;
        if (time - this.fpsLastUpdate > 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsLastUpdate = time;
            document.getElementById('val-fps').innerText = this.fps;
        }
    }
}

// Global FPS Tracker
SimuController.prototype.fpsLastUpdate = 0;

// Bootstrap Simulation
window.onload = () => {
    window.sim = new SimuController();
};