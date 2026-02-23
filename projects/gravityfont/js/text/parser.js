/**
 * GravityFont - Text Parser
 * Samples characters from a canvas to extract point geometry.
 */

class TextParser {
    constructor() {
        this.sampleCanvas = document.createElement('canvas');
        this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });

        // Settings for sampling
        this.fontSize = 80;
        this.fontFamily = "'Inter', sans-serif";
        this.resolution = 6; // Pixels per sample point (higher is faster, lower is more detailed)
    }

    /**
     * Parses a single character into a set of points.
     * @param {string} char 
     * @returns {Array<Vector>} Array of relative coordinates
     */
    parseCharacter(char) {
        // Prepare canvas for this char
        const font = `bold ${this.fontSize}px ${this.fontFamily}`;
        this.sampleCtx.font = font;

        const metrics = this.sampleCtx.measureText(char);
        const width = Math.ceil(metrics.width) || this.fontSize; // Fallback for spaces/empty
        const height = this.fontSize * 1.2;

        this.sampleCanvas.width = width;
        this.sampleCanvas.height = height;

        // Re-set font after resize
        this.sampleCtx.font = font;
        this.sampleCtx.textBaseline = 'middle';
        this.sampleCtx.textAlign = 'center';
        this.sampleCtx.fillStyle = 'white';

        // Draw character
        this.sampleCtx.clearRect(0, 0, width, height);
        this.sampleCtx.fillText(char, width / 2, height / 2);

        // Sample points
        const imageData = this.sampleCtx.getImageData(0, 0, width, height).data;
        const points = [];

        for (let y = 0; y < height; y += this.resolution) {
            for (let x = 0; x < width; x += this.resolution) {
                const index = (y * width + x) * 4;
                const alpha = imageData[index + 3]; // Only need alpha channel

                if (alpha > 128) {
                    // Normalize points relative to center
                    points.push(new Vector(x - width / 2, y - height / 2));
                }
            }
        }

        return points;
    }
}
