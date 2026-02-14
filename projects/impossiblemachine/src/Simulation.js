import { Particle } from './Particle.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';
import { MutationEngine } from './MutationEngine.js';
import { Ecosystem } from './Ecosystem.js';
import { Environment } from './Environment.js';
import { GraphSystem } from './GraphSystem.js';
import { SaveLoadSystem } from './SaveLoadSystem.js';
import { ParticleInspector } from './ParticleInspector.js';
import { AudioSystem } from './AudioSystem.js';
import { LevelGenerator } from './LevelGenerator.js';

export class Simulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;

        this.particles = [];
        this.physicsEngine = new PhysicsEngine(this.width, this.height);
        this.mutationEngine = new MutationEngine();
        this.ecosystem = new Ecosystem(this.width, this.height);
        this.environment = new Environment(this.width, this.height); // Env
        this.graphSystem = new GraphSystem(this.ctx, 10, this.height - 120, 200, 100); // UI Graph
        this.saveLoadSystem = new SaveLoadSystem(this);
        this.inspector = new ParticleInspector(this.ctx, this.width, this.height);
        this.audioSystem = new AudioSystem();
        this.levelGenerator = new LevelGenerator(this.width, this.height);
        this.renderer = new Renderer(this.ctx, this.width, this.height);
        this.inputHandler = new InputHandler(this.canvas, this);

        this.isRunning = false;
        this.lastTime = 0;

        // Resize listener
        window.addEventListener('resize', () => this.resize());

        this.init();
    }



    init() {
        this.particles = [];
        // Create initial particles
        for (let i = 0; i < 200; i++) { // Increased count
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            this.particles.push(new Particle(x, y));
        }
    }

    reset() {
        this.init();
    }

    explode() {
        // Apply massive random force to all
        for (const p of this.particles) {
            p.vel.x += (Math.random() - 0.5) * 1000;
            p.vel.y += (Math.random() - 0.5) * 1000;
        }
    }

    generateLevel() {
        // Cycle through types
        const types = ['random', 'symmetry', 'chaos'];
        const type = types[Math.floor(Math.random() * types.length)];
        const obs = this.levelGenerator.generate(type);
        this.environment.setObstacles(obs);
    }

    getStats() {
        let normal = 0;
        let anti = 0;
        let preds = 0;
        for (const p of this.particles) {
            if (p.dna.gravity.y < 0) anti++;
            else normal++;
            if (p.type === 'predator') preds++;
        }
        return { normal, anti, preds };
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.physicsEngine.resize(this.width, this.height);
        this.environment.resize(this.width, this.height);
        this.renderer.resize(this.width, this.height);
        // Reposition graph
        this.graphSystem.y = this.height - 120;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
        }
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        this.inputHandler.update(this.particles);
        this.physicsEngine.update(this.particles, deltaTime, this.mutationEngine, this.audioSystem);
        this.environment.applyConstraints(this.particles); // Env interactions
        this.ecosystem.update(this.particles); // Update biology

        // Update Graph (every few frames or just always)
        if (Math.random() < 0.1) { // Throttle update
            this.graphSystem.update(this.getStats());
        }

        // Remove dead particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].energy <= 0) {
                this.particles.splice(i, 1);
                // Respawn occasionally to keep sim alive
                if (Math.random() < 0.05) {
                    this.particles.push(new Particle(Math.random() * this.width, Math.random() * this.height));
                }
            }
        }
    }

    draw() {
        this.renderer.clear();
        this.environment.draw(this.renderer.ctx); // Draw obstacles
        this.renderer.drawParticles(this.particles);
        this.graphSystem.draw(); // UI
        this.inspector.draw(); // Inspector
        this.inputHandler.drawDebug(this.ctx); // Optional: visualize interactions
    }
}
