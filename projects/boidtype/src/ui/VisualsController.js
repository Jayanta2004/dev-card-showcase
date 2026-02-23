/**
 * VisualsController - Manages the aesthetic state of the simulation.
 * Handles switching between different rendering styles (dots, lines, mesh),
 * managing glow intensity, motion blur settings, and color palettes.
 * 
 * @class VisualsController
 */
export class VisualsController {
    /**
     * Initializes the visuals controller.
     * @param {Object} renderer - Reference to the main Renderer instance.
     * @param {Object} simulation - Reference to the main Simulation instance.
     */
    constructor(renderer, simulation) {
        /** @type {Object} The rendering engine */
        this.renderer = renderer;

        /** @type {Object} The simulation environment */
        this.simulation = simulation;

        /** @type {string} Current drawing mode: 'points' | 'lines' | 'mesh' | 'triangles' */
        this.mode = 'points';

        /** @type {number} Intensity of the glow effect (0-100) */
        this.glowIntensity = 10;

        /** @type {number} Feedback amount for motion blur (0.0 to 1.0) */
        this.motionBlur = 0.2;

        /** @type {boolean} Toggle for drawing connections between nearby boids */
        this.drawConnections = false;

        /** @type {number} Distance threshold for drawing lines between neighbors */
        this.connectionRadius = 50;

        /** @type {Object} Active color palette */
        this.palette = {
            primary: '#00f2ff',
            secondary: '#7000ff',
            accent: '#ffffff'
        };
    }

    /**
     * Sets the rendering mode and updates related simulation constants.
     * @param {string} mode - The new mode string.
     */
    setMode(mode) {
        this.mode = mode;
        console.log(`VisualsController: Mode switched to ${mode}`);

        // Adjust boid sizes and forces based on mode for aesthetic balance
        if (mode === 'triangles') {
            this.simulation.boids.forEach(b => b.size = 6);
        } else if (mode === 'mesh') {
            this.simulation.boids.forEach(b => b.size = 1);
            this.drawConnections = true;
        } else {
            this.simulation.boids.forEach(b => b.size = 2);
            this.drawConnections = false;
        }
    }

    /**
     * Updates the color palette and propagates to boids.
     * @param {string} primary - Hex primary color.
     * @param {string} secondary - Hex secondary color.
     */
    updatePalette(primary, secondary) {
        this.palette.primary = primary;
        this.palette.secondary = secondary;
        this.simulation.setColor(primary);
        this.renderer.boidColor = primary;

        // Assign random palette colors to boids for variety
        this.simulation.boids.forEach(boid => {
            boid.color = Math.random() > 0.5 ? primary : secondary;
        });
    }

    /**
     * Toggles the connection lines between boids.
     * @param {boolean} enabled 
     */
    setConnections(enabled) {
        this.drawConnections = enabled;
    }

    /**
     * Adjusts the motion blur intensity.
     * @param {number} value - 0.0 (crisp) to 1.0 (long trails).
     */
    setMotionBlur(value) {
        this.motionBlur = Math.max(0.01, Math.min(0.99, value));
    }

    /**
     * Updates the glow effect intensity on the renderer.
     * @param {number} intensity 
     */
    setGlow(intensity) {
        this.glowIntensity = intensity;
    }

    /**
     * Cycles through preset theme configurations.
     */
    cycleTheme() {
        const themes = [
            { p: '#00f2ff', s: '#0066ff' },
            { p: '#ff00ff', s: '#7000ff' },
            { p: '#fbff00', s: '#ff9900' },
            { p: '#00ff40', s: '#008822' },
            { p: '#ffffff', s: '#444444' }
        ];

        const currentThemeIdx = themes.findIndex(t => t.p === this.palette.primary);
        const nextTheme = themes[(currentThemeIdx + 1) % themes.length];
        this.updatePalette(nextTheme.p, nextTheme.s);
    }
}
