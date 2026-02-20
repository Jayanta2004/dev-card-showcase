/**
 * MoldPage Generation Module
 * 
 * This module contains the mathematical and procedural logic for creating organic,
 * non-repetitive pixel clusters that simulate biological growth.
 * It uses a combination of polar coordinate random distribution and iterative
 * "budding" logic to ensure that no two colonies look identical.
 * 
 * DESIGN PRINCIPLES:
 * - Asymmetry: Growth should not be perfectly circular.
 * - Layering: Overlapping pixels create depth and texture.
 * - Variety: Use multiple color variants and sizes for a "living" look.
 * 
 * @namespace MoldGen
 */
const MoldGen = (() => {

    /**
     * Internal constants for procedural tuning.
     * @private
     */
    const CONFIG = {
        DEFAULT_PIXEL_COUNT: 45,
        MAX_SPREAD: 55,
        BUD_OFFSET_MIN: 3,
        BUD_OFFSET_MAX: 12,
        BRIGHT_VARIANT_CHANCE: 0.15,
        DARK_VARIANT_CHANCE: 0.25,
        MIN_PIXEL_SIZE: 1.5,
        MAX_PIXEL_SIZE: 5.5
    };

    /**
     * Creates a new mold cluster at a specific coordinate.
     * Uses a radial random-walk approach for organic shapes.
     * 
     * @param {HTMLElement} container - The parent element to hold the cluster.
     * @param {number} x - Target X coordinate.
     * @param {number} y - Target Y coordinate.
     * @param {Object} options - Tuning parameters for this specific cluster.
     * @returns {Object} Reference to the element and its pixel collection.
     */
    const createCluster = (container, x, y, options = {}) => {
        const {
            pixelCount = CONFIG.DEFAULT_PIXEL_COUNT,
            spread = CONFIG.MAX_SPREAD,
            density = 0.85,
            intensity = 1.0
        } = options;

        const cluster = document.createElement('div');
        cluster.className = 'mold-cluster';
        cluster.style.left = `${x}px`;
        cluster.style.top = `${y}px`;

        // Intensity affects the overall appearance of the cluster
        if (intensity > 1.2) cluster.classList.add('infected-element');

        container.appendChild(cluster);

        const pixels = [];

        // Iteratative procedural generation
        for (let i = 0; i < pixelCount; i++) {
            // Density check for sparse growth
            if (Math.random() > density) continue;

            const pixel = document.createElement('div');

            // MATH: Organic distribution using Polar Coordinates with Jitter
            // Power function (0.5) creates a higher density towards the center (Gaussian-like)
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.pow(Math.random(), 0.6) * spread;

            const px = Math.cos(angle) * distance;
            const py = Math.sin(angle) * distance;

            pixel.className = 'mold-pixel';

            // Variance Logic
            const rollout = Math.random();
            if (rollout < CONFIG.BRIGHT_VARIANT_CHANCE) {
                pixel.classList.add('variant-bright');
            } else if (rollout < CONFIG.BRIGHT_VARIANT_CHANCE + CONFIG.DARK_VARIANT_CHANCE) {
                pixel.classList.add('variant-dark');
            }

            pixel.style.left = `${px}px`;
            pixel.style.top = `${py}px`;

            // Scale and size variance
            const size = CONFIG.MIN_PIXEL_SIZE + (Math.random() * (CONFIG.MAX_PIXEL_SIZE - CONFIG.MIN_PIXEL_SIZE));
            pixel.style.width = `${size}px`;
            pixel.style.height = `${size}px`;

            // Randomize delay to make appearance feel staggered and organic
            pixel.style.transitionDelay = `${Math.random() * 2}s`;

            cluster.appendChild(pixel);
            pixels.push(pixel);
        }

        return { element: cluster, pixels };
    };

    /**
     * Expands an existing cluster procedurally by "budding" from existing nodes.
     * This simulates the biological process of mitosis and nutrient seeking.
     * 
     * @param {Object} clusterData - The object returned by createCluster.
     * @param {number} growthFactor - Percentage of current size to expand by.
     * @returns {void}
     */
    const expandCluster = (clusterData, growthFactor = 0.2) => {
        const { element, pixels } = clusterData;
        const newPixelsCount = Math.floor(pixels.length * growthFactor);

        for (let i = 0; i < newPixelsCount; i++) {
            // Selection Logic: Find a progenitor pixel
            const sourcePixel = pixels[Math.floor(Math.random() * pixels.length)];
            const sx = parseFloat(sourcePixel.style.left);
            const sy = parseFloat(sourcePixel.style.top);

            const pixel = document.createElement('div');
            pixel.className = 'mold-pixel';

            // Offshoot Logic: New pixel is placed near its parent
            const offset = CONFIG.BUD_OFFSET_MIN + (Math.random() * (CONFIG.BUD_OFFSET_MAX - CONFIG.BUD_OFFSET_MIN));
            const angle = Math.random() * Math.PI * 2;

            pixel.style.left = `${sx + Math.cos(angle) * offset}px`;
            pixel.style.top = `${sy + Math.sin(angle) * offset}px`;
            pixel.style.opacity = '0';

            // Heritage check: match parent variant occasionally
            if (sourcePixel.classList.contains('variant-bright')) pixel.classList.add('variant-bright');
            if (sourcePixel.classList.contains('variant-dark')) pixel.classList.add('variant-dark');

            element.appendChild(pixel);
            pixels.push(pixel);

            // Activation delay varies to simulate "growth time"
            setTimeout(() => {
                pixel.classList.add('active');
            }, 100 + Math.random() * 3000);
        }
    };

    /**
     * Generates a "spreader" background element.
     * These represent the deeper, subterranean root systems (mycelium)
     * that create the blurry, stained look beneath the pixels.
     * 
     * @param {HTMLElement} container - Target container.
     * @param {number} x - Center X.
     * @param {number} y - Center Y.
     * @returns {HTMLElement} The created spreader element.
     */
    const createSpreader = (container, x, y) => {
        const spreader = document.createElement('div');
        spreader.className = 'spreader';

        // Spreaders are significantly larger than individual pixels
        const size = 180 + Math.random() * 250;

        spreader.style.width = `${size}px`;
        spreader.style.height = `${size}px`;
        spreader.style.left = `${x - size / 2}px`;
        spreader.style.top = `${y - size / 2}px`;

        // Randomize rotation for varied shapes if non-circular CSS is applied
        spreader.style.transform = `rotate(${Math.random() * 360}deg)`;

        container.appendChild(spreader);

        // Biological blooming effect
        requestAnimationFrame(() => {
            setTimeout(() => spreader.classList.add('visible'), 200);
        });

        return spreader;
    };

    /**
     * Batch generation for massive infections.
     * 
     * @param {HTMLElement} container - Host container.
     * @param {Array} coordinates - Array of {x, y} objects.
     */
    const generatePlague = (container, coordinates) => {
        console.group('[GEN] Initiating large-scale infection.');
        const clusters = coordinates.map(coord => {
            return createCluster(container, coord.x, coord.y, {
                pixelCount: 20 + Math.random() * 30,
                spread: 30
            });
        });
        console.groupEnd();
        return clusters;
    };

    return {
        createCluster,
        expandCluster,
        createSpreader,
        generatePlague,
        CONFIG
    };
})();

// Bind to window for cross-module accessibility.
window.MoldGen = MoldGen;
