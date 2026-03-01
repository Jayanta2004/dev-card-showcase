// Image processing module for splitting images into quadrants

const ImageProcessor = {
    currentImage: null,
    processedCanvas: null,
    quadrants: [],

    /**
     * Initialize the image processor
     */
    init() {
        this.quadrants = [];
        this.currentImage = null;
        this.processedCanvas = null;
    },

    /**
     * Load and process an image
     * @param {File|string} source - Image file or URL
     * @returns {Promise<Object>} Processed image data
     */
    async loadImage(source) {
        try {
            const img = await Utils.loadImage(source);
            this.currentImage = img;
            return this.processImage(img);
        } catch (error) {
            console.error('Error loading image:', error);
            throw error;
        }
    },

    /**
     * Process image and prepare for splitting
     * @param {HTMLImageElement} img - Image to process
     * @returns {Object} Processed image data
     */
    processImage(img) {
        const dimensions = Utils.calculateOptimalDimensions(img.width, img.height);

        // Create canvas with optimal dimensions
        const canvas = document.createElement('canvas');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

        this.processedCanvas = canvas;

        return {
            canvas: canvas,
            width: dimensions.width,
            height: dimensions.height,
            pieceWidth: dimensions.width / 2,
            pieceHeight: dimensions.height / 2
        };
    },

    /**
     * Generate sample image
     * @param {string} type - Sample type (landscape, abstract, geometric)
     * @returns {Object} Processed image data
     */
    generateSample(type) {
        const canvas = Utils.generateSampleImage(type, 800, 800);
        this.processedCanvas = canvas;

        return {
            canvas: canvas,
            width: 800,
            height: 800,
            pieceWidth: 400,
            pieceHeight: 400
        };
    },

    /**
     * Split image into four quadrants
     * @returns {Array} Array of quadrant canvases
     */
    splitIntoQuadrants() {
        if (!this.processedCanvas) {
            throw new Error('No image to split');
        }

        const width = this.processedCanvas.width;
        const height = this.processedCanvas.height;
        const pieceWidth = width / 2;
        const pieceHeight = height / 2;

        this.quadrants = [];

        CONFIG.QUADRANTS.forEach((quadrant) => {
            const canvas = document.createElement('canvas');
            canvas.width = pieceWidth;
            canvas.height = pieceHeight;

            const ctx = canvas.getContext('2d');

            // Extract quadrant from main canvas
            const sx = quadrant.x * width;
            const sy = quadrant.y * height;

            ctx.drawImage(
                this.processedCanvas,
                sx, sy, pieceWidth, pieceHeight,
                0, 0, pieceWidth, pieceHeight
            );

            this.quadrants.push({
                id: quadrant.id,
                name: quadrant.name,
                canvas: canvas,
                dataUrl: canvas.toDataURL('image/png', CONFIG.IMAGE.quality),
                width: pieceWidth,
                height: pieceHeight,
                sourceX: sx,
                sourceY: sy
            });
        });

        return this.quadrants;
    },

    /**
     * Get quadrant by ID
     * @param {number} id - Quadrant ID
     * @returns {Object} Quadrant data
     */
    getQuadrant(id) {
        return this.quadrants.find(q => q.id === id);
    },

    /**
     * Draw preview on canvas
     * @param {HTMLCanvasElement} canvas - Target canvas
     */
    drawPreview(canvas) {
        if (!this.processedCanvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = this.processedCanvas.width;
        canvas.height = this.processedCanvas.height;

        ctx.drawImage(this.processedCanvas, 0, 0);
    },

    /**
     * Get image data for export
     * @returns {string} Data URL
     */
    getImageDataUrl() {
        if (!this.processedCanvas) return null;
        return this.processedCanvas.toDataURL('image/png', CONFIG.IMAGE.quality);
    },

    /**
     * Clear current image
     */
    clear() {
        this.currentImage = null;
        this.processedCanvas = null;
        this.quadrants = [];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageProcessor;
}
