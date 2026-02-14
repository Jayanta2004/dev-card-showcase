// ============================================
// HEATMAP.JS
// Visual heat map feedback system
// ============================================

/**
 * HeatMap Module
 * Creates a visual heat map showing proximity to target
 */
const HeatMap = (function () {
    'use strict';

    // Private variables
    let canvas = null;
    let ctx = null;
    let isEnabled = true;
    let targetPosition = { x: 0, y: 0 };
    let animationFrameId = null;
    let gradientCache = new Map();

    // Settings
    const SETTINGS = {
        GRID_SIZE: 40,           // Size of each grid cell
        UPDATE_INTERVAL: 100,    // ms between updates
        GRADIENT_RADIUS: 300,    // Radius of gradient effect
        MAX_ALPHA: 0.4,          // Maximum opacity
        COLOR_HOT: [255, 100, 100],   // RGB for hot (close)
        COLOR_WARM: [255, 200, 100],  // RGB for warm
        COLOR_COOL: [100, 150, 255],  // RGB for cool (far)
    };

    let lastUpdateTime = 0;

    /**
     * Initialize heat map
     */
    function init() {
        canvas = document.getElementById('heatmap-canvas');

        if (!canvas) {
            console.error('Heat map canvas not found');
            return false;
        }

        ctx = canvas.getContext('2d', { alpha: true });

        // Set canvas size
        resizeCanvas();

        // Handle window resize
        window.addEventListener('resize', resizeCanvas);

        // Start rendering
        startRendering();

        return true;
    }

    /**
     * Resize canvas to match window
     */
    function resizeCanvas() {
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Clear gradient cache on resize
        gradientCache.clear();
    }

    /**
     * Set target position
     * @param {Object} position - {x, y} target coordinates
     */
    function setTarget(position) {
        targetPosition = { ...position };
    }

    /**
     * Calculate heat value for a point
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Heat value (0-1)
     */
    function calculateHeat(x, y) {
        const dx = x - targetPosition.x;
        const dy = y - targetPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize distance (0 = at target, 1 = far away)
        const maxDistance = Math.sqrt(
            Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)
        );

        const normalizedDistance = Math.min(distance / maxDistance, 1);

        // Invert so closer = higher heat
        return 1 - normalizedDistance;
    }

    /**
     * Get color for heat value
     * @param {number} heat - Heat value (0-1)
     * @returns {string} RGB color string
     */
    function getHeatColor(heat) {
        let r, g, b;

        if (heat > 0.6) {
            // Hot (red-ish)
            const t = (heat - 0.6) / 0.4;
            r = SETTINGS.COLOR_HOT[0];
            g = SETTINGS.COLOR_HOT[1] + (SETTINGS.COLOR_WARM[1] - SETTINGS.COLOR_HOT[1]) * (1 - t);
            b = SETTINGS.COLOR_HOT[2] + (SETTINGS.COLOR_WARM[2] - SETTINGS.COLOR_HOT[2]) * (1 - t);
        } else if (heat > 0.3) {
            // Warm (orange-ish)
            const t = (heat - 0.3) / 0.3;
            r = SETTINGS.COLOR_WARM[0];
            g = SETTINGS.COLOR_WARM[1];
            b = SETTINGS.COLOR_WARM[2] + (SETTINGS.COLOR_COOL[2] - SETTINGS.COLOR_WARM[2]) * (1 - t);
        } else {
            // Cool (blue-ish)
            const t = heat / 0.3;
            r = SETTINGS.COLOR_COOL[0];
            g = SETTINGS.COLOR_COOL[1];
            b = SETTINGS.COLOR_COOL[2];
        }

        return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`;
    }

    /**
     * Render heat map
     */
    function render() {
        if (!isEnabled || !ctx || !canvas) return;

        const now = performance.now();

        // Throttle updates
        if (now - lastUpdateTime < SETTINGS.UPDATE_INTERVAL) {
            return;
        }

        lastUpdateTime = now;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw heat map grid
        const gridSize = SETTINGS.GRID_SIZE;
        const cols = Math.ceil(canvas.width / gridSize);
        const rows = Math.ceil(canvas.height / gridSize);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * gridSize + gridSize / 2;
                const y = row * gridSize + gridSize / 2;

                const heat = calculateHeat(x, y);
                const color = getHeatColor(heat);
                const alpha = heat * SETTINGS.MAX_ALPHA;

                // Draw gradient circle
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, gridSize);
                gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
                gradient.addColorStop(1, `rgba(${color}, 0)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    col * gridSize,
                    row * gridSize,
                    gridSize,
                    gridSize
                );
            }
        }
    }

    /**
     * Animation loop
     */
    function animationLoop() {
        render();
        animationFrameId = requestAnimationFrame(animationLoop);
    }

    /**
     * Start rendering loop
     */
    function startRendering() {
        if (!animationFrameId) {
            animationLoop();
        }
    }

    /**
     * Stop rendering loop
     */
    function stopRendering() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    /**
     * Enable heat map
     */
    function enable() {
        isEnabled = true;
        if (canvas) {
            canvas.classList.remove('hidden');
        }
        startRendering();
    }

    /**
     * Disable heat map
     */
    function disable() {
        isEnabled = false;
        if (canvas) {
            canvas.classList.add('hidden');
        }
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    /**
     * Toggle heat map
     */
    function toggle() {
        if (isEnabled) {
            disable();
        } else {
            enable();
        }
        return isEnabled;
    }

    /**
     * Check if enabled
     * @returns {boolean} True if enabled
     */
    function getIsEnabled() {
        return isEnabled;
    }

    /**
     * Destroy heat map
     */
    function destroy() {
        stopRendering();
        window.removeEventListener('resize', resizeCanvas);

        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        canvas = null;
        ctx = null;
        gradientCache.clear();
    }

    // Public API
    return {
        init: init,
        setTarget: setTarget,
        enable: enable,
        disable: disable,
        toggle: toggle,
        isEnabled: getIsEnabled,
        destroy: destroy
    };
})();
