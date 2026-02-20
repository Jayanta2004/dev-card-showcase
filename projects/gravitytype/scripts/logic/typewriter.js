/**
 * GRAVITYTYPE // TYPEWRITER LOGIC
 * scripts/logic/typewriter.js
 * 
 * Manages the cursor, text flow, and body spawning.
 */

class Typewriter {
    constructor(world, particleSystem) {
        this.world = world;
        this.particles = particleSystem;

        this.cursor = new Vector2(100, 100);
        this.startX = 100;
        this.lineHeight = 40;
        this.charSpacing = 24;

        this.fontScale = 32;
    }

    /**
     * Updates font metrics from UI.
     * @param {number} size 
     */
    setFontSize(size) {
        this.fontScale = size;
        this.lineHeight = size * 1.5;
        this.charSpacing = size * 0.7; // Monospace approx
    }

    /**
     * Spawns a character at current cursor and advances.
     * @param {string} char 
     */
    type(char) {
        const x = this.cursor.x;
        const y = this.cursor.y;

        // Random neon color
        const color = MathUtils.randNeon();

        const body = new RigidBody(x, y, char, this.fontScale, color);

        // Add subtle initial jitter/rotation forces
        body.oldPos.x -= (Math.random() - 0.5) * 2;
        body.oldPos.y -= (Math.random() - 0.5) * 2;

        this.world.addBody(body);

        // Advance cursor
        this.cursor.x += this.charSpacing;

        // Auto-wrap
        if (this.cursor.x > window.innerWidth - 100) {
            this.returnCarriage();
        }
    }

    /**
     * Move cursor to next line.
     */
    returnCarriage() {
        this.cursor.x = this.startX;
        this.cursor.y += this.lineHeight;

        // Reset to top if off screen
        if (this.cursor.y > window.innerHeight - 100) {
            this.cursor.y = 100;
        }
    }

    /**
     * Finds and destroys the last created body or body nearest cursor.
     */
    backspace() {
        // Simple strategy: Pop the last added body
        if (this.world.bodies.length > 0) {
            // Find body closest to cursor (more intuitive) or just last?
            // "Typewriter" usually deletes last typed.
            const target = this.world.bodies[this.world.bodies.length - 1]; // Last added

            // Explode
            this.particles.explode(target.pos.x, target.pos.y, target.color);

            this.world.removeBody(target);

            // Retreat cursor if possible
            if (this.cursor.x > this.startX) {
                this.cursor.x -= this.charSpacing;
            }
        }
    }
}
