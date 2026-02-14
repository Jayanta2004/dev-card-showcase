/**
 * GravityFont - Main Application
 * Initializes the simulation and handles user input.
 */

class GravityFontApp {
    constructor() {
        this.canvas = document.getElementById('physics-canvas');
        this.input = document.getElementById('gravity-input');
        this.resetBtn = document.getElementById('reset-btn');
        this.gravityBtn = document.getElementById('gravity-toggle');
        this.presetDropdown = document.getElementById('preset-dropdown');

        // Engine components
        this.engine = new PhysicsEngine();
        this.parser = new TextParser();
        this.renderer = new Renderer(this.canvas, this.engine);
        this.effects = new EffectsManager(this.renderer.ctx, window.innerWidth, window.innerHeight);
        this.visuals = new VisualParticleSystem(this.renderer.ctx, window.innerWidth, window.innerHeight);
        this.presets = new PresetManager(this);
        this.tutorial = new Tutorial(this);

        // State
        this.glyphs = [];
        this.lastTypeTime = 0;
        this.currentText = "";

        // Loop timing
        this.lastTime = 0;
        this.fps = 0;

        this.init();
    }

    init() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        // Events
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.resetBtn.addEventListener('click', () => this.reset());
        this.gravityBtn.addEventListener('click', () => this.toggleGravity());

        if (this.presetDropdown) {
            this.presetDropdown.addEventListener('change', (e) => {
                this.presets.apply(e.target.value);
            });
        }

        // Mouse Interaction
        window.addEventListener('mousemove', (e) => {
            this.engine.mousePos.set(e.clientX, e.clientY);
        });

        window.addEventListener('mousedown', () => {
            this.engine.isMouseDown = true;
        });

        window.addEventListener('mouseup', () => {
            this.engine.isMouseDown = false;
        });

        // Start loop
        requestAnimationFrame((t) => this.loop(t));

        // Focus input by default
        this.input.focus();

        // Start tutorial after a short delay
        setTimeout(() => this.tutorial.start(), 1000);

        console.log("GravityFont Initialized.");
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.resize(width, height);
        this.engine.resize(width, height);
        if (this.effects) this.effects.resize(width, height);
        if (this.visuals) this.visuals.resize(width, height);
    }

    /**
     * Processes input changes and spawns new glyphs.
     */
    handleInput(e) {
        const value = e.target.value;
        const now = performance.now();

        // Check if a character was added
        if (value.length > this.currentText.length) {
            const char = value[value.length - 1];
            this.spawnGlyph(char);
        } else if (value.length < this.currentText.length) {
            // If text was deleted, clear oldest glyph or all if empty
            if (value === "") {
                this.reset();
            } else {
                // For simplicity, we just keep adding and let them fall. 
                // A more complex implementation could remove specific glyphs.
            }
        }

        this.currentText = value;
    }

    /**
     * Spawns a soft-body glyph at the typing position.
     */
    spawnGlyph(char) {
        if (char === " ") return; // Skip spaces for simulation

        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
        const y = window.innerHeight / 4;
        const groupId = `glyph-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const glyph = new Glyph(char, new Vector(x, y), this.parser, groupId);

        // Add to engine
        glyph.particles.forEach(p => this.engine.addParticle(p));
        glyph.constraints.forEach(c => this.engine.constraints.push(c));

        this.glyphs.push(glyph);
        this.updateStats();
    }

    toggleGravity() {
        this.engine.enableGravity = !this.engine.enableGravity;
        this.gravityBtn.textContent = this.engine.enableGravity ? "Disable Gravity" : "Enable Gravity";
        this.gravityBtn.classList.toggle('active', !this.engine.enableGravity);
    }

    reset() {
        this.engine.clear();
        this.glyphs = [];
        this.input.value = "";
        this.currentText = "";
        this.updateStats();
    }

    updateStats() {
        document.getElementById('particle-count').textContent = this.engine.particles.length;
        document.getElementById('constraint-count').textContent = this.engine.constraints.length;
    }

    loop(currentTime) {
        const dt = (currentTime - this.lastTime) / 16.67; // Normalize to ~60fps
        this.lastTime = currentTime;

        if (dt > 5) { // Prevent huge jumps during tab switching
            requestAnimationFrame((t) => this.loop(t));
            return;
        }

        // Update physics
        this.engine.update(dt);

        // Render
        this.renderer.draw(this.glyphs);

        // Draw visual particles (on top of glyphs, below effects)
        this.visuals.updateAndDraw();

        // Apply post-processing
        this.effects.apply();

        // Update FPS counter every half second
        if (currentTime % 500 < 20) {
            this.fps = Math.round(60 / dt);
            document.getElementById('fps-counter').textContent = this.fps;
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GravityFontApp();
});
