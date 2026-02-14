/**
 * Blink Detector Module
 * Handles frame analysis and blink event triggering.
 */

class BlinkDetector {
    /**
     * Initializes the blink detection engine with default parameters.
     * We use a combination of rolling averages and thresholding to detect
     * rapid changes in local luminance.
     */
    constructor() {
        // Buffer to store the pixel data of the previous frame for comparison
        this.prevBuffer = null;

        // Luminance values for comparison
        this.prevBrightness = 0;
        this.currentBrightness = 0;

        // Rolling history of brightness values to establish a baseline
        this.history = [];
        this.historyLength = 15; // Number of frames to track for baseline calculation

        // Sensitivity threshold: higher value means harder to trigger
        this.threshold = 15;

        // Coordinates for the eye regions within the video stream
        this.eyeRegions = [];

        // Flag to ensure regions are mapped before analysis starts
        this.isCalibrated = false;

        // Global frame counter for debouncing and initialization delays
        this.frameCount = 0;

        // Threshold for ignoring large scale frame-wide pixel changes (motion)
        this.movementThreshold = 3000;

        // --- Phase 2: Feature Extensions ---
        this.ambientBrightness = 0;
        this.lastBlinkTime = 0;
        this.comboCount = 0;
        this.comboThreshold = 600; // ms between blinks for a combo

        // Heatmap Grid (8x6)
        this.heatmapGrid = [];
        this.gridCols = 16;
        this.gridRows = 12;
        this.initHeatmap();
    }

    /**
     * Initialize heatmap grid base
     */
    initHeatmap() {
        this.heatmapGrid = new Array(this.gridCols * this.gridRows).fill(0);
    }

    /**
     * Define the eye regions based on camera dimensions
     */
    setupRegions(width, height) {
        // We look at two rectangles centered around the alignment guides
        const eyeWidth = Math.floor(width * 0.15);
        const eyeHeight = Math.floor(height * 0.1);

        this.eyeRegions = [
            {
                x: Math.floor(width * 0.25) - Math.floor(eyeWidth / 2),
                y: Math.floor(height * 0.5) - Math.floor(eyeHeight / 2),
                w: eyeWidth,
                h: eyeHeight
            },
            {
                x: Math.floor(width * 0.75) - Math.floor(eyeWidth / 2),
                y: Math.floor(height * 0.5) - Math.floor(eyeHeight / 2),
                w: eyeWidth,
                h: eyeHeight
            }
        ];
        this.isCalibrated = true;
    }

    /**
     * Analyze a frame and return blink probability or event
     */
    analyze(video, ctx) {
        if (!this.isCalibrated) return null;

        const { width, height } = video;

        // Draw regions for debug/ui if needed
        // this.drawDebug(ctx);

        let totalBrightness = 0;
        let pixelCount = 0;

        // Process only eye regions
        this.eyeRegions.forEach(region => {
            const imageData = ctx.getImageData(region.x, region.y, region.w, region.h);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                // Luminance formula
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
                totalBrightness += brightness;
                pixelCount++;
            }
        });

        const avgBrightness = totalBrightness / pixelCount;
        const diff = this.prevBrightness - avgBrightness;

        this.history.push(avgBrightness);
        if (this.history.length > this.historyLength) this.history.shift();

        // Detection Logic:
        // A blink is a rapid drop in brightness followed by a rapid rise.
        // We look for a significant drop compared to the recent average.

        const recentAvg = this.history.reduce((a, b) => a + b, 0) / this.history.length;
        const drop = recentAvg - avgBrightness;

        this.prevBrightness = avgBrightness;
        this.frameCount++;

        // --- Phase 2: Ambient Light Calculation ---
        // We use a broader sample for ambient (every 10th pixel of the whole frame for speed)
        const fullFrame = ctx.getImageData(0, 0, width, height).data;
        let ambientSum = 0;
        for (let i = 0; i < fullFrame.length; i += 40) {
            ambientSum += (fullFrame[i] * 0.299 + fullFrame[i + 1] * 0.587 + fullFrame[i + 2] * 0.114);
        }
        this.ambientBrightness = ambientSum / (fullFrame.length / 40);

        // --- Phase 2: Heatmap Logic ---
        this.updateHeatmap(fullFrame, width, height);

        // Visual feedback data
        const confidence = Math.min(Math.max(drop / this.threshold, 0), 1);

        // Actual Detection (Debounced)
        let detected = false;
        let isCombo = false;

        if (drop > this.threshold && this.frameCount > 30) {
            const now = performance.now();
            if (now - this.lastBlinkTime < this.comboThreshold) {
                this.comboCount++;
                isCombo = true;
            } else {
                this.comboCount = 1;
            }

            detected = true;
            this.lastBlinkTime = now;
            // Clear history to prevent multi-trigger
            this.history = this.history.map(v => avgBrightness);
        }

        return {
            detected,
            isCombo,
            comboCount: this.comboCount,
            confidence: confidence * 100,
            brightness: avgBrightness,
            ambient: this.ambientBrightness,
            diff: drop,
            heatmap: this.heatmapGrid
        };
    }

    /**
     * Update the low-res heatmap based on pixel variance
     */
    updateHeatmap(data, width, height) {
        const cellW = width / this.gridCols;
        const cellH = height / this.gridRows;

        // Decay existing heatmap
        for (let i = 0; i < this.heatmapGrid.length; i++) {
            this.heatmapGrid[i] *= 0.8;
        }

        // We use a simplified variance check: just some random samples in each cell
        // to see if they changed significantly. For this UI effect, we can also
        // just map "intensity" areas.
        for (let y = 0; y < this.gridRows; y++) {
            for (let x = 0; x < this.gridCols; x++) {
                const idx = y * this.gridCols + x;
                const pixelIdx = (Math.floor(y * cellH + cellH / 2) * width + Math.floor(x * cellW + cellW / 2)) * 4;

                // Simple difference from a few frames ago would be better, 
                // but let's just use current brightness spikes in these cells
                const val = (data[pixelIdx] + data[pixelIdx + 1] + data[pixelIdx + 2]) / 3;
                if (Math.abs(val - this.prevBrightness) > 20) {
                    this.heatmapGrid[idx] = 1.0;
                }
            }
        }
    }

    drawDebug(ctx) {
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.5)';
        ctx.lineWidth = 1;
        this.eyeRegions.forEach(region => {
            ctx.strokeRect(region.x, region.y, region.w, region.h);
        });
    }
}

// Export
window.BlinkDetector = BlinkDetector;
