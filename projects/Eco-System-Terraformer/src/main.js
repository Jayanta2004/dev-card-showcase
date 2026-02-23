import { World } from './ecs.js';
import { MovementSystem, BiologicalSystem, ReproductionSystem, RenderSystem } from './systems.js';
import { EntityFactory } from './entities.js';
import { PopulationGraph } from './graph.js';
import { Vector } from './utils.js';

// Setup Canvas
const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const graphCanvas = document.getElementById('graphCanvas');

// Resize
function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    graphCanvas.width = graphCanvas.parentElement.clientWidth;
    graphCanvas.height = graphCanvas.parentElement.clientHeight;
}
window.addEventListener('resize', resize);
resize();

// Init World
const world = new World(canvas.width, canvas.height);
world.spawner = EntityFactory; // Bind factory to world for reproduction system

// Init Systems
const movementSystem = new MovementSystem(world);
const biologicalSystem = new BiologicalSystem(world);
const reproductionSystem = new ReproductionSystem(world);
// Render system needs specific context
const renderSystem = new RenderSystem(world, ctx);

world.addSystem(movementSystem);
world.addSystem(biologicalSystem);
world.addSystem(reproductionSystem);
// Render system is run explicitly in loop to separate logic/render rate if needed, 
// or added to world systems. Let's add it to world for simplicity.
// world.addSystem(renderSystem); 
// Actually, render should be last.

// Init Graph
const graph = new PopulationGraph(graphCanvas);

// Initial Population
for (let i = 0; i < 50; i++) {
    EntityFactory.createGrass(world, Math.random() * canvas.width, Math.random() * canvas.height);
}
for (let i = 0; i < 20; i++) {
    EntityFactory.createRabbit(world, Math.random() * canvas.width, Math.random() * canvas.height);
}
for (let i = 0; i < 5; i++) {
    EntityFactory.createWolf(world, Math.random() * canvas.width, Math.random() * canvas.height);
}

// Stats UI
const statGrass = document.getElementById('count-grass');
const statRabbit = document.getElementById('count-rabbit');
const statWolf = document.getElementById('count-wolf');

// God Tools Interaction
let activeTool = 'grass';
const tools = document.querySelectorAll('.tool-btn');
tools.forEach(btn => {
    btn.addEventListener('click', () => {
        tools.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTool = btn.dataset.tool;
    });
});

canvas.addEventListener('mousedown', (e) => {
    handleInput(e);
});
canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) handleInput(e); // Drag to paint
});

function handleInput(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'grass') {
        // Plant cluster
        for (let i = 0; i < 5; i++) {
            EntityFactory.createGrass(world, x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
        }
    } else if (activeTool === 'rabbit') {
        EntityFactory.createRabbit(world, x, y);
    } else if (activeTool === 'wolf') {
        EntityFactory.createWolf(world, x, y);
    } else if (activeTool === 'plague') {
        // Kill nearby
        const targets = world.query(x, y, 50);
        targets.forEach(e => e.destroy());
    }
}

// Control Buttons
let isPaused = false;
document.getElementById('pauseBtn').addEventListener('click', () => {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '▶️' : '⏸️';
});
document.getElementById('resetBtn').addEventListener('click', () => {
    world.entities = [];
    world.systems.forEach(s => { /* reset internal state if needed */ });
    graph.data = { grass: [], rabbit: [], wolf: [] };
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});


// Loop
let lastTime = 0;
let graphTimer = 0;

function loop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!isPaused && dt < 0.1) { // Prevent huge jump if tab hidden
        // Update Logic
        world.update(dt);

        // Update Graph (every 0.5s)
        graphTimer += dt;
        if (graphTimer > 0.1) {
            graph.push(world.stats);
            graph.draw();

            // Update UI text
            statGrass.innerText = world.stats.grass;
            statRabbit.innerText = world.stats.rabbit;
            statWolf.innerText = world.stats.wolf;

            graphTimer = 0;
        }
    }

    // Render always (interpolated?)
    renderSystem.update(dt);

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
