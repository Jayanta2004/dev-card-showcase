/**
 * GRAVITYTYPE // UI MANAGER
 * scripts/ui/uimanager.js
 * 
 * Bridges the DOM UI with the Physics World.
 */

class UIManager {
    /**
     * @param {PhysicsWorld} world 
     * @param {Renderer} renderer 
     * @param {Typewriter} typewriter 
     */
    constructor(world, renderer, typewriter) {
        this.world = world;
        this.renderer = renderer;
        this.typewriter = typewriter;

        // Cache DOM Elements
        this.els = {
            gravX: document.getElementById('grav-x'),
            gravY: document.getElementById('grav-y'),
            bounce: document.getElementById('bounce'),
            friction: document.getElementById('friction'),
            wind: document.getElementById('wind'),
            fontSize: document.getElementById('fontsize'),
            fps: document.getElementById('stat-fps'),
            bodies: document.getElementById('stat-bodies'),
            collisions: document.getElementById('stat-collisions'),
            btnSnapshot: document.getElementById('btn-snapshot'),
            btnClear: document.getElementById('btn-clear')
        };

        // Cache Display Elements
        this.disp = {
            gravX: document.getElementById('val-grav-x'),
            gravY: document.getElementById('val-grav-y'),
            bounce: document.getElementById('val-bounce'),
            friction: document.getElementById('val-friction'),
            wind: document.getElementById('val-wind'),
            fontSize: document.getElementById('val-fontsize'),
        };

        this.initListeners();
    }

    initListeners() {
        // Gravity X
        this.els.gravX.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.world.config.gravity.x = val;
            this.disp.gravX.textContent = val.toFixed(2);
        });

        // Gravity Y
        this.els.gravY.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.world.config.gravity.y = val;
            this.disp.gravY.textContent = val.toFixed(2);
        });

        // Restitution (Bounce)
        this.els.bounce.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            // Iterate all existing bodies to update them? 
            // Or just set a global config that new bodies inherit?
            // Let's do both for immediate feedback.
            for (const b of this.world.bodies) {
                b.restitution = val;
            }
            // Logic for new bodies is handled in Typewriter (which spawns them)
            // Ideally Typewriter should allow setting config. 
            // For now, let's assume Typewriter sets defaults, but we can override.
            // Actually, best pattern: Typewriter asks World for default material? 
            // Or we just update existing. New bodies use default in RigidBody.
            // FIX: We need to update prototype or specific config.
            RigidBody.prototype.restitution = val; // Hacky but efficient for "defaults"

            this.disp.bounce.textContent = val.toFixed(2);
        });

        // Friction
        this.els.friction.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.world.config.friction = val;
            this.disp.friction.textContent = val.toFixed(3);
        });

        // Wind
        this.els.wind.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.world.config.wind.x = val;
            this.disp.wind.textContent = val.toFixed(2);
        });

        // Font Size
        this.els.fontSize.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.typewriter.setFontSize(val);
            this.disp.fontSize.textContent = val + 'px';
        });

        // Snapshot
        this.els.btnSnapshot.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `gravity-type-${Date.now()}.png`;
            link.href = this.renderer.canvas.toDataURL();
            link.click();
        });

        // Clear
        this.els.btnClear.addEventListener('click', () => {
            this.world.bodies = [];
            this.typewriter.cursor.set(100, 100);
            this.world.spatial.clear();
        });

        // Panel Toggle
        document.querySelector('.panel-toggle').addEventListener('click', () => {
            const panel = document.getElementById('controls-panel');
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        });
    }

    updateStats(fps) {
        this.els.fps.textContent = Math.round(fps);
        this.els.bodies.textContent = this.world.bodies.length;
        // Approximation of collision complexity
        // Note: Real collision count is in PhysicsWorld if we expose it
        // Check if World has a counter
        // Let's add one if needed, or just show bodies for now.
    }
}
