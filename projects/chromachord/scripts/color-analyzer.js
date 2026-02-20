/**
 * CHROMACHORD - COLOR ANALYZER MODULE
 * Handles image processing, color extraction, and analysis
 */

class ColorAnalyzer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.imageData = null;
        this.dominantColor = null;
        this.colorPalette = [];
    }

    /**
     * Initialize the analyzer with a canvas element
     * @param {HTMLCanvasElement} canvas - Canvas element for image processing
     */
    initialize(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    }

    /**
     * Load and analyze an image file
     * @param {File} file - Image file to analyze
     * @returns {Promise<Object>} Analysis results with dominant color and palette
     */
    async analyzeImage(file) {
        try {
            const image = await this.loadImage(file);
            this.drawImageToCanvas(image);
            this.extractImageData();
            
            // Perform color analysis
            const colors = this.extractColors();
            const quantized = this.quantizeColors(colors, 8);
            const clustered = this.clusterColors(quantized);
            
            this.dominantColor = this.findDominantColor(clustered);
            this.colorPalette = this.generatePalette(clustered, 8);
            
            return {
                dominant: this.dominantColor,
                palette: this.colorPalette,
                image: image
            };
        } catch (error) {
            throw new Error(`Image analysis failed: ${error.message}`);
        }
    }

    /**
     * Load image from file
     * @param {File} file - Image file
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Draw image to canvas with proper scaling
     * @param {HTMLImageElement} image - Image to draw
     */
    drawImageToCanvas(image) {
        // Calculate dimensions to maintain aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        let width = image.width;
        let height = image.height;
        
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.drawImage(image, 0, 0, width, height);
    }

    /**
     * Extract pixel data from canvas
     */
    extractImageData() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.imageData = this.ctx.getImageData(0, 0, width, height);
    }

    /**
     * Extract all colors from image data
     * @returns {Array<Object>} Array of color objects with RGB values
     */
    extractColors() {
        const colors = [];
        const data = this.imageData.data;
        const pixelCount = data.length / 4;
        
        // Sample every nth pixel for performance
        const sampleRate = Math.max(1, Math.floor(pixelCount / 10000));
        
        for (let i = 0; i < data.length; i += 4 * sampleRate) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            // Skip very dark or very light pixels (likely shadows/highlights)
            const brightness = (r + g + b) / 3;
            if (brightness < 10 || brightness > 245) continue;
            
            colors.push({ r, g, b, count: 1 });
        }
        
        return colors;
    }

    /**
     * Quantize colors using median cut algorithm
     * @param {Array<Object>} colors - Array of color objects
     * @param {number} depth - Recursion depth (determines number of buckets)
     * @returns {Array<Object>} Quantized colors
     */
    quantizeColors(colors, depth) {
        if (colors.length === 0) return [];
        if (depth === 0) return [this.averageColor(colors)];
        
        // Find the channel with the greatest range
        const ranges = this.getColorRanges(colors);
        const maxRange = Math.max(ranges.r, ranges.g, ranges.b);
        let sortChannel = 'r';
        
        if (maxRange === ranges.g) sortChannel = 'g';
        else if (maxRange === ranges.b) sortChannel = 'b';
        
        // Sort by the channel with greatest range
        colors.sort((a, b) => a[sortChannel] - b[sortChannel]);
        
        // Split at median
        const mid = Math.floor(colors.length / 2);
        const left = colors.slice(0, mid);
        const right = colors.slice(mid);
        
        // Recursively quantize
        return [
            ...this.quantizeColors(left, depth - 1),
            ...this.quantizeColors(right, depth - 1)
        ];
    }

    /**
     * Get color ranges for RGB channels
     * @param {Array<Object>} colors - Array of colors
     * @returns {Object} Ranges for each channel
     */
    getColorRanges(colors) {
        let minR = 255, maxR = 0;
        let minG = 255, maxG = 0;
        let minB = 255, maxB = 0;
        
        for (const color of colors) {
            minR = Math.min(minR, color.r);
            maxR = Math.max(maxR, color.r);
            minG = Math.min(minG, color.g);
            maxG = Math.max(maxG, color.g);
            minB = Math.min(minB, color.b);
            maxB = Math.max(maxB, color.b);
        }
        
        return {
            r: maxR - minR,
            g: maxG - minG,
            b: maxB - minB
        };
    }

    /**
     * Calculate average color from array
     * @param {Array<Object>} colors - Array of colors
     * @returns {Object} Average color
     */
    averageColor(colors) {
        if (colors.length === 0) return { r: 0, g: 0, b: 0, count: 0 };
        
        let totalR = 0, totalG = 0, totalB = 0;
        let totalCount = 0;
        
        for (const color of colors) {
            const count = color.count || 1;
            totalR += color.r * count;
            totalG += color.g * count;
            totalB += color.b * count;
            totalCount += count;
        }
        
        return {
            r: Math.round(totalR / totalCount),
            g: Math.round(totalG / totalCount),
            b: Math.round(totalB / totalCount),
            count: totalCount
        };
    }

    /**
     * Cluster similar colors together
     * @param {Array<Object>} colors - Quantized colors
     * @returns {Array<Object>} Clustered colors
     */
    clusterColors(colors) {
        const clusters = [];
        const threshold = 30; // Color distance threshold
        
        for (const color of colors) {
            let merged = false;
            
            for (const cluster of clusters) {
                const distance = this.colorDistance(color, cluster);
                
                if (distance < threshold) {
                    // Merge into existing cluster
                    const totalCount = cluster.count + color.count;
                    cluster.r = Math.round((cluster.r * cluster.count + color.r * color.count) / totalCount);
                    cluster.g = Math.round((cluster.g * cluster.count + color.g * color.count) / totalCount);
                    cluster.b = Math.round((cluster.b * cluster.count + color.b * color.count) / totalCount);
                    cluster.count = totalCount;
                    merged = true;
                    break;
                }
            }
            
            if (!merged) {
                clusters.push({ ...color });
            }
        }
        
        return clusters;
    }

    /**
     * Calculate Euclidean distance between two colors
     * @param {Object} color1 - First color
     * @param {Object} color2 - Second color
     * @returns {number} Distance value
     */
    colorDistance(color1, color2) {
        const rDiff = color1.r - color2.r;
        const gDiff = color1.g - color2.g;
        const bDiff = color1.b - color2.b;
        
        return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
    }

    /**
     * Find dominant color from clusters
     * @param {Array<Object>} clusters - Color clusters
     * @returns {Object} Dominant color with RGB and HSL values
     */
    findDominantColor(clusters) {
        if (clusters.length === 0) return this.createColorObject(0, 0, 0);
        
        // Sort by count and saturation
        clusters.sort((a, b) => {
            const satA = this.calculateSaturation(a);
            const satB = this.calculateSaturation(b);
            
            // Prefer more saturated colors
            const scoreA = a.count * (1 + satA);
            const scoreB = b.count * (1 + satB);
            
            return scoreB - scoreA;
        });
        
        const dominant = clusters[0];
        return this.createColorObject(dominant.r, dominant.g, dominant.b);
    }

    /**
     * Calculate saturation of a color
     * @param {Object} color - RGB color
     * @returns {number} Saturation value (0-1)
     */
    calculateSaturation(color) {
        const r = color.r / 255;
        const g = color.g / 255;
        const b = color.b / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        
        if (max === 0) return 0;
        
        return (max - min) / max;
    }

    /**
     * Generate color palette from clusters
     * @param {Array<Object>} clusters - Color clusters
     * @param {number} count - Number of colors in palette
     * @returns {Array<Object>} Color palette
     */
    generatePalette(clusters, count) {
        // Sort by count
        clusters.sort((a, b) => b.count - a.count);
        
        // Take top N colors
        const palette = clusters.slice(0, count).map(color => 
            this.createColorObject(color.r, color.g, color.b)
        );
        
        return palette;
    }

    /**
     * Create complete color object with RGB, HSL, and hex values
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {Object} Complete color object
     */
    createColorObject(r, g, b) {
        const hsl = this.rgbToHsl(r, g, b);
        const hex = this.rgbToHex(r, g, b);
        
        return {
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b),
            h: Math.round(hsl.h),
            s: Math.round(hsl.s),
            l: Math.round(hsl.l),
            hex: hex
        };
    }

    /**
     * Convert RGB to HSL
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {Object} HSL values
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // Achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    /**
     * Convert RGB to hexadecimal
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} Hex color code
     */
    rgbToHex(r, g, b) {
        const toHex = (n) => {
            const hex = Math.round(n).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    /**
     * Get formatted color strings for display
     * @param {Object} color - Color object
     * @returns {Object} Formatted strings
     */
    getColorStrings(color) {
        return {
            hex: color.hex.toUpperCase(),
            rgb: `RGB(${color.r}, ${color.g}, ${color.b})`,
            hsl: `HSL(${color.h}°, ${color.s}%, ${color.l}%)`
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorAnalyzer;
}
