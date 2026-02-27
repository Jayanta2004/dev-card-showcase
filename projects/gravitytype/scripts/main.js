/**
 * GRAVITYTYPE // MAIN ENTRY POINT
 * scripts/main.js
 * 
 * Bootstraps the application loop.
 */

// Global App State (exposed for debugging)
const App = {
    world: null,
    renderer: null,
    typewriter: null,
    ui: null,
    particles: null
};

window.addEventListener('DOMContentLoaded', () => {

    // 1. Setup Canvas
    const canvas = document.getElementById('world');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 2. Initialize Core Systems
    const particleSys = new ParticleSystem(1000);
    const world = new PhysicsWorld(canvas.width, canvas.height);
    const renderer = new Renderer(canvas, world, particleSys);
    const typewriter = new Typewriter(world, particleSys); // Pass particleSys for explosions
    const input = new InputHandler(typewriter, renderer);
    const ui = new UIManager(world, renderer, typewriter);

    // 3. Expose to App
    App.world = world;
    App.renderer = renderer;
    App.typewriter = typewriter;
    App.ui = ui;
    App.particles = particleSys;

    // 4. Initial Config
    typewriter.setFontSize(32);

    // 5. Game Loop
    let lastTime = 0;
    let frames = 0;
    let lastFpsTime = 0;

    function loop(timestamp) {
        requestAnimationFrame(loop);

        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        // Cap dt to prevent Spirals of Death on tab switch
        const safeDt = Math.min(dt, 0.1);

        // Core Updates
        world.step(safeDt);
        particleSys.update();

        // Render
        renderer.render();

        // Stats Logic
        frames++;
        if (timestamp - lastFpsTime >= 1000) {
            ui.updateStats(frames); // frames per second
            frames = 0;
            lastFpsTime = timestamp;
        }
    }

    requestAnimationFrame(loop);

    console.log("%c GravityType v2.0 Initialized ", "background: #00f3ff; color: #000; font-weight: bold;");
});
