
/**
 * TypeMorph - Setup & Globals
 * Defined first to ensure dependencies exist.
 */

// 1. Global Configuration
window.CONFIG = {
    stiffness: 0.1,
    damping: 0.85,
    mass: 1,
    radius: 600,
    mode: 'jelly', // 'jelly', 'snap', 'float'
    debug: false,
    text: "TypeMorph" // Track current text if needed
};

// Expose legacy name if controls check it
window.TYPE_MORPH_CONFIG = window.CONFIG;

// 2. Global Mouse State
window.MOUSE = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    vx: 0,
    vy: 0,
    lastX: window.innerWidth / 2,
    lastY: window.innerHeight / 2
};

// 3. Physics Spring Class
class Spring {
    constructor(val) {
        this.current = val;
        this.target = val;
        this.velocity = 0;
    }

    update() {
        const force = (this.target - this.current) * window.CONFIG.stiffness;
        const accel = force / window.CONFIG.mass;
        this.velocity = (this.velocity + accel) * window.CONFIG.damping;
        this.current += this.velocity;
    }
}

// Ensure Spring is global
window.Spring = Spring;

console.log("TypeMorph Setup Loaded");
