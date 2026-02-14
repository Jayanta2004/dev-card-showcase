/**
 * Biological Texture Seeding Engine (PRO Edition)
 * 
 * Maps external visual information (Images/Textures) onto the 
 * reaction-diffusion grid. It calculates pixel-level luminance
 * and uses it to "stain" the grid with Substance B concentration.
 * 
 * @class TextureMapper
 */
export class TextureMapper {
    /**
     * @param {Simulation} simulation - Target simulation engine
     */
    constructor(simulation) {
        /** @type {Simulation} */
        this.sim = simulation;

        // Internal processing pipeline (Offscreen Canvas)
        /** @type {HTMLCanvasElement} Offscreen buffer for image resampling */
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = simulation.width;
        this.bufferCanvas.height = simulation.height;

        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.bufferCanvas.getContext('2d', { willReadFrequently: true });
    }

    /**
     * Processes an image file and maps it to the simulation grid.
     * Operates by calculating the Rec. 601 luminance of each pixel
     * and injecting Chemical B based on brightness.
     * 
     * @param {File|string} source - The image file or binary URL
     * @returns {Promise<void>}
     */
    async loadTexture(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            // Allow cross-origin images if loading from URL
            img.crossOrigin = 'Anonymous';

            img.onload = () => {
                // 1. Clear buffer and draw image scaled to grid resolution
                this.ctx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
                this.ctx.drawImage(img, 0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

                // 2. Extract raw RGBA pixel data
                const imageData = this.ctx.getImageData(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
                const pixels = imageData.data;

                // 3. Process each pixel into Chemical B intensity
                for (let i = 0; i < this.sim.gridSize; i++) {
                    const r = pixels[i * 4];
                    const g = pixels[i * 4 + 1];
                    const b = pixels[i * 4 + 2];

                    // CCIR 601 perceived luminance formula: 
                    // Y' = 0.299R' + 0.587G' + 0.114B'
                    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

                    // Binary threshold seeding (Hard-coded to 0.5 mid-point)
                    if (luma > 0.5) {
                        this.sim.gridB[i] = 1.0;
                    } else {
                        this.sim.gridB[i] = 0.0;
                    }
                }

                console.log('Texture Seeding: Organic Map Applied');
                resolve();
            };

            img.onerror = () => reject(new Error('Texture Processing Fault'));

            // Handle both Local Files (Blob) and Remote URLs
            if (source instanceof File || source instanceof Blob) {
                const reader = new FileReader();
                reader.onload = (e) => img.src = e.target.result;
                reader.readAsDataURL(source);
            } else {
                img.src = source;
            }
        });
    }
}
