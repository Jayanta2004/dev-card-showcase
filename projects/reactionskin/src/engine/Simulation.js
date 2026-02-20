/**
 * Gray-Scott Reaction Diffusion Simulation Engine (PRO Edition)
 * 
 * This engine simulates the chemical reaction and diffusion of two substances,
 * A and B, which interact to form complex organic patterns.
 * 
 * Equations:
 * dA/dt = DA * Laplacian(A) - A*B^2 + f * (1 - A)
 * dB/dt = DB * Laplacian(B) + A*B^2 - (k + f) * B
 * 
 * @class Simulation
 */
export class Simulation {
    /**
     * @param {number} width - Grid width
     * @param {number} height - Grid height
     */
    constructor(width, height) {
        /** @type {number} */
        this.width = width;
        /** @type {number} */
        this.height = height;

        // --- Model Parameters ---

        /** @type {number} Diffusion rate of substance A */
        this.dA = 1.0;
        /** @type {number} Diffusion rate of substance B */
        this.dB = 0.5;

        /** @type {number} Feed rate (f) - how fast substance A is added */
        this.feed = 0.055;
        /** @type {number} Kill rate (k) - how fast substance B is removed */
        this.kill = 0.062;

        /** @type {number} Time step for integration */
        this.dt = 1.0;

        // --- Grid Data Structures ---

        this.gridSize = width * height;

        /** @type {Float32Array} Concentration of substance A */
        this.gridA = new Float32Array(this.gridSize);
        /** @type {Float32Array} Concentration of substance B */
        this.gridB = new Float32Array(this.gridSize);

        /** @type {Float32Array} Buffer for next state A */
        this.nextA = new Float32Array(this.gridSize);
        /** @type {Float32Array} Buffer for next state B */
        this.nextB = new Float32Array(this.gridSize);

        // --- Performance Telemetry ---
        this.computeTime = 0;

        this.reset();
    }

    /**
     * Initializes the grid with default concentrations.
     * Substance A starts at 1.0 everywhere.
     */
    reset() {
        // Fill A with 1.0, B with 0.0
        for (let i = 0; i < this.gridSize; i++) {
            this.gridA[i] = 1.0;
            this.gridB[i] = 0.0;
        }

        // Add a "seed" of B in the center
        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);
        this.inject(centerX, centerY, 20, 1.0, 'b');
    }

    /**
     * Completely clears the grid (sets B to zero everywhere).
     */
    clear() {
        for (let i = 0; i < this.gridSize; i++) {
            this.gridA[i] = 1.0;
            this.gridB[i] = 0.0;
            this.nextA[i] = 1.0;
            this.nextB[i] = 0.0;
        }
    }

    /**
     * Injects a substance at a specific location.
     * 
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Radius of injection
     * @param {number} amount - Concentration amount (0-1)
     * @param {string} type - 'a' or 'b'
     */
    inject(x, y, radius, amount, type = 'b') {
        const r2 = radius * radius;
        for (let j = y - radius; j < y + radius; j++) {
            for (let i = x - radius; i < x + radius; i++) {
                if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
                    const dx = i - x;
                    const dy = j - y;
                    if (dx * dx + dy * dy < r2) {
                        const idx = j * this.width + i;
                        if (type === 'b') {
                            this.gridB[idx] = Math.max(this.gridB[idx], amount);
                        } else {
                            this.gridA[idx] = Math.max(0, this.gridA[idx] - amount);
                        }
                    }
                }
            }
        }
    }

    /**
     * Advances the simulation by one time step.
     */
    step() {
        const startTime = performance.now();

        const w = this.width;
        const h = this.height;
        const feed = this.feed;
        const kill = this.kill;
        const dA = this.dA;
        const dB = this.dB;
        const dt = this.dt;

        // Iterative update with boundary checks avoided by processing inner grid
        for (let y = 1; y < h - 1; y++) {
            const rowIdx = y * w;
            const prevRow = (y - 1) * w;
            const nextRow = (y + 1) * w;

            for (let x = 1; x < w - 1; x++) {
                const idx = rowIdx + x;

                const a = this.gridA[idx];
                const b = this.gridB[idx];

                // Laplacian approximation (3x3 kernel)
                // Represents the diffusion of chemicals into neighboring cells.
                // Weighting Distribution:
                // [ 0.05, 0.20, 0.05 ]
                // [ 0.20, -1.0, 0.20 ]
                // [ 0.05, 0.20, 0.05 ]
                // The center weight is -1.0 because we subtract the current concentration.
                const lapA = (
                    this.gridA[idx - 1] * 0.2 + this.gridA[idx + 1] * 0.2 +
                    this.gridA[prevRow + x] * 0.2 + this.gridA[nextRow + x] * 0.2 +
                    this.gridA[prevRow + x - 1] * 0.05 + this.gridA[prevRow + x + 1] * 0.05 +
                    this.gridA[nextRow + x - 1] * 0.05 + this.gridA[nextRow + x + 1] * 0.05 -
                    a
                );

                const lapB = (
                    this.gridB[idx - 1] * 0.2 + this.gridB[idx + 1] * 0.2 +
                    this.gridB[prevRow + x] * 0.2 + this.gridB[nextRow + x] * 0.2 +
                    this.gridB[prevRow + x - 1] * 0.05 + this.gridB[prevRow + x + 1] * 0.05 +
                    this.gridB[nextRow + x - 1] * 0.05 + this.gridB[nextRow + x + 1] * 0.05 -
                    b
                );

                // The Gray-Scott Reaction Term: A*B^2
                // Substance A is consumed by B while B is produced.
                const reaction = a * b * b;

                // Euler Integration for the Reaction-Diffusion Partial Differential Equations (PDEs)
                // dA/dt = DA * lapA - reaction + F * (1 - A)
                // dB/dt = DB * lapB + reaction - (K + F) * B
                this.nextA[idx] = a + (dA * lapA - reaction + feed * (1.0 - a)) * dt;
                this.nextB[idx] = b + (dB * lapB + reaction - (kill + feed) * b) * dt;

                // Physical constraint clamping (Concentrations cannot be <0 or >1)
                if (this.nextA[idx] < 0) this.nextA[idx] = 0;
                else if (this.nextA[idx] > 1) this.nextA[idx] = 1;

                if (this.nextB[idx] < 0) this.nextB[idx] = 0;
                else if (this.nextB[idx] > 1) this.nextB[idx] = 1;
            }
        }

        this.swapBuffers();
        this.computeTime = performance.now() - startTime;
    }

    /**
     * Perform the double-buffering swap.
     * @private
     */
    swapBuffers() {
        const tempA = this.gridA;
        const tempB = this.gridB;
        this.gridA = this.nextA;
        this.gridB = this.nextB;
        this.nextA = tempA;
        this.nextB = tempB;
    }

    /**
     * Updates simulation parameters.
     * 
     * @param {Object} params - Parameter set
     * @param {number} [params.f] - New feed rate
     * @param {number} [params.k] - New kill rate
     * @param {number} [params.dA] - New diffusion rate for A
     * @param {number} [params.dB] - New diffusion rate for B
     */
    setParams(params) {
        if (params.f !== undefined) this.feed = params.f;
        if (params.k !== undefined) this.kill = params.k;
        if (params.dA !== undefined) this.dA = params.dA;
        if (params.dB !== undefined) this.dB = params.dB;
    }

    /** @returns {Float32Array} Substance A concentrations */
    getGridA() { return this.gridA; }
    /** @returns {Float32Array} Substance B concentrations */
    getGridB() { return this.gridB; }
}
