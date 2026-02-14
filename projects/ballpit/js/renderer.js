/**
 * renderer.js
 * High-performance Canvas rendering engine for the BallPit.
 * This module handles the visual representation of the physics state,
 * including advanced effects like radial gradients, glow, and motion trails.
 */

const Renderer = {
    canvas: null,
    ctx: null,

    // Feature toggles for the renderer
    settings: {
        showTrails: true,
        showShadows: true,
        renderObstacles: true,
        motionBlur: 0.2 // 0 to 1, where lower is more blur
    },

    /**
     * Initializes the rendering context and sets up resizing logic.
     * @param {string} canvasId - The ID of the HTML5 Canvas element.
     */
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        // Optimization: Set alpha to false as we fill the whole background every frame.
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        this.resize();
        window.addEventListener('resize', () => this.resize());

        console.info("Renderer Initialized: Canvas scaling @ " + CONFIG.DPI_SCALE + "x");
    },

    /**
     * Resizes the canvas to match the viewport dimensions.
     * Synchronizes the internal state and the spatial grid.
     */
    resize() {
        STATE.screenW = window.innerWidth;
        STATE.screenH = window.innerHeight;

        // High-DPI support
        this.canvas.width = STATE.screenW * CONFIG.DPI_SCALE;
        this.canvas.height = STATE.screenH * CONFIG.DPI_SCALE;

        // Scale context once so we can use standard coordinates in draw calls
        this.ctx.scale(CONFIG.DPI_SCALE, CONFIG.DPI_SCALE);

        // Sync spatial grid update
        if (Physics && Physics.grid) {
            Physics.grid.updateDimensions(STATE.screenW, STATE.screenH);
        }
    },

    /**
     * Clears the canvas for the next frame.
     * Supports a "Motion Blur" effect by not fully clearing the previous frame.
     */
    clear() {
        const { ctx } = this;

        if (this.settings.showTrails) {
            // Semi-transparent fill creates trailing effect
            ctx.fillStyle = `rgba(15, 23, 42, ${this.settings.motionBlur})`;
            ctx.fillRect(0, 0, STATE.screenW, STATE.screenH);
        } else {
            // Solid background clear
            ctx.fillStyle = '#0f172a'; // Consistent with CSS --bg-color
            ctx.fillRect(0, 0, STATE.screenW, STATE.screenH);
        }
    },

    /**
     * Specialized draw call for a single ball.
     * Handles gradients, shadows, and velocity-based heatmap effects.
     * @param {Ball} ball - The ball instance to render.
     */
    drawBall(ball) {
        const { ctx } = this;
        let color = ball.color;

        // ---------------------------------------------------------------------
        // 1. HEATMAP LOGIC
        // Changes ball color and adds glow if it's moving fast.
        // ---------------------------------------------------------------------
        const vx = ball.x - ball.oldX;
        const vy = ball.y - ball.oldY;
        const speed = Math.sqrt(vx * vx + vy * vy);

        if (STATE.showHeatmap && speed > CONFIG.HEATMAP_VELOCITY_THRESHOLD) {
            const intensity = Utils.clamp((speed - CONFIG.HEATMAP_VELOCITY_THRESHOLD) / 15, 0, 1);

            // Interpolate towards white/bright glow
            const r = Math.round(Utils.lerp(ball.rgb.r, 255, intensity));
            const g = Math.round(Utils.lerp(ball.rgb.g, 255, intensity));
            const b = Math.round(Utils.lerp(ball.rgb.b, 255, intensity));
            color = `rgb(${r}, ${g}, ${b})`;

            if (this.settings.showShadows) {
                ctx.shadowBlur = intensity * 20;
                ctx.shadowColor = color;
            }
        }

        // ---------------------------------------------------------------------
        // 2. GRADIENT RENDERING
        // Creates a 3D-like spherical appearance.
        // ---------------------------------------------------------------------
        const shineX = ball.x - ball.radius * 0.35;
        const shineY = ball.y - ball.radius * 0.35;

        const grad = ctx.createRadialGradient(
            shineX, shineY, ball.radius * 0.1,
            ball.x, ball.y, ball.radius
        );

        grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)'); // Highlight
        grad.addColorStop(0.3, color);                     // Main color
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');       // Shadow edge

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Reset Shadow for next draw call
        ctx.shadowBlur = 0;
    },

    /**
     * Renders the visual representation of the Gravity Well force field.
     */
    drawGravityWell() {
        if (!STATE.gravityWellActive) return;

        const { ctx } = this;
        const time = performance.now() * 0.0015;

        ctx.save();
        ctx.setLineDash([5, 10]);
        ctx.lineWidth = 1.5;

        // Multi-ring expanding pulse effect
        for (let i = 0; i < 4; i++) {
            const progress = ((time + i / 4) % 1);
            const radius = progress * CONFIG.GRAVITY_WELL_RADIUS;
            const alpha = (1 - progress) * 0.3;

            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.beginPath();
            ctx.arc(STATE.mouseX, STATE.mouseY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    },

    /**
     * Main rendering step. Called every frame.
     */
    render() {
        this.clear();

        // 1. Draw static obstacles if enabled
        if (this.settings.renderObstacles) {
            for (let i = 0; i < Physics.obstacles.length; i++) {
                Physics.obstacles[i].draw(this.ctx);
            }
        }

        // 2. Draw active effects (Gravity Well)
        this.drawGravityWell();

        // 3. Draw collision particles
        Particles.draw(this.ctx);

        // 4. Draw all balls
        // Note: For extreme optimizations with 1000+ circles, 
        // one might group draw calls by color, but radial gradients 
        // require individual translation.
        for (let i = 0; i < Physics.balls.length; i++) {
            this.drawBall(Physics.balls[i]);
        }
    }
};

/**
 * EXPLANATION OF PERFORMANCE:
 * The renderer uses a few tricks to maintain 60FPS:
 * 1. DPI Scaling: It only scales the coordinate system once per frame resizing.
 * 2. Radial Gradients: While expensive, standard circular arcs are optimized in modern browsers.
 * 3. Conditional Shadowing: Shadows are only applied to "hot" (fast) balls to save GPU cycles.
 */
