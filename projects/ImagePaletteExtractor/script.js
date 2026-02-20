// Color DNA Extractor - Main Application

class ColorDNAExtractor {
    constructor() {
        // State
        this.state = {
            image: null,
            imageData: null,
            colors: {
                dominant: [],
                accent: []
            },
            selectedColor: null,
            colorMode: 'hex',
            algorithm: 'kmeans',
            paletteSize: 8,
            sensitivity: 2,
            exportFormat: 'css'
        };
        
        // DOM Elements
        this.elements = {};
        
        // Color quantization algorithms
        this.algorithms = {
            kmeans: this.kMeansClustering.bind(this),
            mediancut: this.medianCut.bind(this),
            octree: this.octreeQuantization.bind(this),
            simple: this.simpleDominant.bind(this)
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI
        this.updateUIState();
        
        // Set default color mode
        this.setColorMode('hex');
        
        // Show welcome message
        this.showToast('Ready to extract colors from images!', 'success');
    }
    
    cacheElements() {
        // Upload elements
        this.elements.uploadZone = document.getElementById('uploadZone');
        this.elements.fileInput = document.getElementById('fileInput');
        this.elements.browseBtn = document.getElementById('browseBtn');
        this.elements.clearImageBtn = document.getElementById('clearImageBtn');
        this.elements.previewContainer = document.getElementById('previewContainer');
        this.elements.imagePreview = document.getElementById('imagePreview');
        this.elements.imageCanvas = document.getElementById('imageCanvas');
        
        // Info displays
        this.elements.fileInfo = document.getElementById('fileInfo');
        this.elements.dimensions = document.getElementById('dimensions');
        this.elements.fileSize = document.getElementById('fileSize');
        this.elements.colorCount = document.getElementById('colorCount');
        
        // Controls
        this.elements.paletteSize = document.getElementById('paletteSize');
        this.elements.paletteSizeValue = document.getElementById('paletteSizeValue');
        this.elements.algorithmSelect = document.getElementById('algorithmSelect');
        this.elements.sensitivitySlider = document.getElementById('sensitivitySlider');
        this.elements.sensitivityValue = document.getElementById('sensitivityValue');
        this.elements.extractBtn = document.getElementById('extractBtn');
        
        // Color displays
        this.elements.dominantColors = document.getElementById('dominantColors');
        this.elements.accentColors = document.getElementById('accentColors');
        this.elements.colorDetails = document.getElementById('colorDetails');
        
        // Contrast checker
        this.elements.contrastStatus = document.getElementById('contrastStatus');
        this.elements.lightRatio = document.getElementById('lightRatio');
        this.elements.darkRatio = document.getElementById('darkRatio');
        this.elements.wcagRating = document.getElementById('wcagRating');
        this.elements.contrastHint = document.getElementById('contrastHint');
        
        // Export
        this.elements.exportPreview = document.getElementById('exportPreview');
        this.elements.copyExportBtn = document.getElementById('copyExportBtn');
        
        // Theme and mode
        this.elements.themeToggle = document.getElementById('themeToggle');
        this.elements.colorModeButtons = document.querySelectorAll('.toggle-btn');
        
        // Other buttons
        this.elements.refreshPaletteBtn = document.getElementById('refreshPaletteBtn');
        this.elements.exportBtn = document.getElementById('exportBtn');
        this.elements.formatButtons = document.querySelectorAll('.format-btn');
        
        // Modals
        this.elements.helpBtn = document.getElementById('helpBtn');
        this.elements.helpModal = document.getElementById('helpModal');
        this.elements.closeHelpModal = document.getElementById('closeHelpModal');
    }
    
    setupEventListeners() {
        // File upload
        this.elements.uploadZone.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.browseBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.elements.clearImageBtn.addEventListener('click', () => this.clearImage());
        
        // Drag and drop
        this.elements.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadZone.classList.add('dragover');
        });
        
        this.elements.uploadZone.addEventListener('dragleave', () => {
            this.elements.uploadZone.classList.remove('dragover');
        });
        
        this.elements.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadZone.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.loadImage(file);
            }
        });
        
        // Controls
        this.elements.paletteSize.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.state.paletteSize = value;
            this.elements.paletteSizeValue.textContent = `${value} colors`;
        });
        
        this.elements.algorithmSelect.addEventListener('change', (e) => {
            this.state.algorithm = e.target.value;
        });
        
        this.elements.sensitivitySlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.state.sensitivity = value;
            const sensitivityLabels = ['Low', 'Medium', 'High'];
            this.elements.sensitivityValue.textContent = sensitivityLabels[value - 1];
        });
        
        this.elements.extractBtn.addEventListener('click', () => this.extractColors());
        
        // Color mode
        this.elements.colorModeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.setColorMode(mode);
            });
        });
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Refresh palette
        this.elements.refreshPaletteBtn.addEventListener('click', () => {
            if (this.state.imageData) {
                this.extractColors();
            }
        });
        
        // Export
        this.elements.exportBtn.addEventListener('click', () => this.exportPalette());
        this.elements.copyExportBtn.addEventListener('click', () => this.copyExport());
        
        // Format buttons
        this.elements.formatButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.format;
                this.setExportFormat(format);
            });
        });
        
        // Help modal
        this.elements.helpBtn.addEventListener('click', () => this.showHelpModal());
        this.elements.closeHelpModal.addEventListener('click', () => this.hideHelpModal());
        this.elements.helpModal.addEventListener('click', (e) => {
            if (e.target === this.elements.helpModal) {
                this.hideHelpModal();
            }
        });
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }
    
    loadImage(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.state.image = img;
                this.displayImage(img, file);
                this.processImageData(img);
                this.elements.extractBtn.disabled = false;
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    displayImage(img, file) {
        // Update preview
        this.elements.imagePreview.src = img.src;
        this.elements.previewContainer.classList.add('active');
        
        // Update file info
        this.elements.fileInfo.textContent = file.name;
        this.elements.dimensions.textContent = `${img.width} × ${img.height} px`;
        this.elements.fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
    }
    
    processImageData(img) {
        const canvas = this.elements.imageCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        this.state.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Calculate unique colors (approximate)
        const colors = this.getUniqueColors(this.state.imageData);
        this.elements.colorCount.textContent = `${colors} unique colors`;
    }
    
    getUniqueColors(imageData) {
        const data = imageData.data;
        const colorSet = new Set();
        
        // Sample pixels for performance
        const sampleRate = 100; // Check every 100th pixel
        for (let i = 0; i < data.length; i += 4 * sampleRate) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const colorKey = (r << 16) | (g << 8) | b;
            colorSet.add(colorKey);
        }
        
        return Math.min(colorSet.size * sampleRate, imageData.width * imageData.height);
    }
    
    clearImage() {
        this.state.image = null;
        this.state.imageData = null;
        this.state.colors = { dominant: [], accent: [] };
        this.state.selectedColor = null;
        
        // Clear preview
        this.elements.imagePreview.src = '';
        this.elements.previewContainer.classList.remove('active');
        this.elements.fileInfo.textContent = 'No file selected';
        this.elements.extractBtn.disabled = true;
        
        // Clear color displays
        this.clearColorDisplays();
        
        this.showToast('Image cleared', 'info');
    }
    
    extractColors() {
        if (!this.state.imageData) return;
        
        this.showToast('Extracting colors...', 'info');
        
        // Get pixel data
        const pixels = this.getPixelsFromImageData(this.state.imageData);
        
        // Apply selected algorithm
        const dominantColors = this.algorithms[this.state.algorithm](pixels, this.state.paletteSize);
        
        // Generate accent colors
        const accentColors = this.generateAccentColors(dominantColors);
        
        // Update state
        this.state.colors = {
            dominant: dominantColors,
            accent: accentColors
        };
        
        // Update UI
        this.updateColorDisplays();
        
        // Select first color
        if (dominantColors.length > 0) {
            this.selectColor(dominantColors[0]);
        }
        
        this.showToast(`Extracted ${dominantColors.length} dominant colors`, 'success');
    }
    
    getPixelsFromImageData(imageData) {
        const data = imageData.data;
        const pixels = [];
        
        // Sample pixels based on sensitivity
        const sampleStep = 4 - this.state.sensitivity; // 1: dense, 2: medium, 3: sparse
        const step = Math.max(1, sampleStep);
        
        for (let i = 0; i < data.length; i += 4 * step) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            pixels.push({ r, g, b });
        }
        
        return pixels;
    }
    
    // K-Means Clustering Algorithm
    kMeansClustering(pixels, k, maxIterations = 10) {
        if (pixels.length === 0) return [];
        
        // Initialize centroids randomly
        let centroids = [];
        for (let i = 0; i < k; i++) {
            const randomIndex = Math.floor(Math.random() * pixels.length);
            centroids.push({ ...pixels[randomIndex] });
        }
        
        for (let iter = 0; iter < maxIterations; iter++) {
            // Assign pixels to nearest centroid
            const clusters = Array(k).fill().map(() => []);
            
            for (const pixel of pixels) {
                let minDist = Infinity;
                let closestCentroid = 0;
                
                for (let i = 0; i < k; i++) {
                    const dist = this.colorDistance(pixel, centroids[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        closestCentroid = i;
                    }
                }
                
                clusters[closestCentroid].push(pixel);
            }
            
            // Update centroids
            let changed = false;
            for (let i = 0; i < k; i++) {
                if (clusters[i].length > 0) {
                    const newCentroid = this.averageColor(clusters[i]);
                    if (this.colorDistance(newCentroid, centroids[i]) > 1) {
                        centroids[i] = newCentroid;
                        changed = true;
                    }
                }
            }
            
            if (!changed) break;
        }
        
        // Convert centroids to colors and sort by frequency/importance
        return centroids.map(color => this.createColorObject(color));
    }
    
    // Median Cut Algorithm
    medianCut(pixels, colors) {
        if (pixels.length === 0) return [];
        
        // Create initial box containing all pixels
        let boxes = [pixels];
        
        // Keep splitting boxes until we have enough colors
        while (boxes.length < colors && boxes.length < pixels.length) {
            // Find box with largest range
            let boxToSplit = 0;
            let maxRange = -1;
            
            for (let i = 0; i < boxes.length; i++) {
                const box = boxes[i];
                if (box.length > 1) {
                    const range = this.getColorRange(box);
                    if (range > maxRange) {
                        maxRange = range;
                        boxToSplit = i;
                    }
                }
            }
            
            if (maxRange === -1) break;
            
            // Split the box
            const box = boxes[boxToSplit];
            const sortedBox = this.sortByLargestRange(box);
            const mid = Math.floor(sortedBox.length / 2);
            
            const box1 = sortedBox.slice(0, mid);
            const box2 = sortedBox.slice(mid);
            
            boxes.splice(boxToSplit, 1, box1, box2);
        }
        
        // Get average color of each box
        const resultColors = boxes.map(box => 
            this.createColorObject(this.averageColor(box))
        );
        
        return resultColors;
    }
    
    // Octree Quantization (simplified)
    octreeQuantization(pixels, maxColors) {
        // Simplified implementation - in production would use full octree
        return this.kMeansClustering(pixels, maxColors);
    }
    
    // Simple Dominant Colors (by frequency)
    simpleDominant(pixels, maxColors) {
        const colorCounts = new Map();
        
        // Group similar colors
        for (const pixel of pixels) {
            // Quantize to reduce color space
            const quantized = {
                r: Math.floor(pixel.r / 32) * 32,
                g: Math.floor(pixel.g / 32) * 32,
                b: Math.floor(pixel.b / 32) * 32
            };
            
            const key = `${quantized.r},${quantized.g},${quantized.b}`;
            colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
        }
        
        // Sort by frequency and take top colors
        const sortedColors = Array.from(colorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxColors);
        
        return sortedColors.map(([key]) => {
            const [r, g, b] = key.split(',').map(Number);
            return this.createColorObject({ r, g, b });
        });
    }
    
    // Helper methods for color algorithms
    colorDistance(c1, c2) {
        const dr = c1.r - c2.r;
        const dg = c1.g - c2.g;
        const db = c1.b - c2.b;
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }
    
    averageColor(pixels) {
        if (pixels.length === 0) return { r: 0, g: 0, b: 0 };
        
        let totalR = 0, totalG = 0, totalB = 0;
        for (const pixel of pixels) {
            totalR += pixel.r;
            totalG += pixel.g;
            totalB += pixel.b;
        }
        
        return {
            r: Math.round(totalR / pixels.length),
            g: Math.round(totalG / pixels.length),
            b: Math.round(totalB / pixels.length)
        };
    }
    
    getColorRange(pixels) {
        let minR = 255, maxR = 0;
        let minG = 255, maxG = 0;
        let minB = 255, maxB = 0;
        
        for (const pixel of pixels) {
            minR = Math.min(minR, pixel.r);
            maxR = Math.max(maxR, pixel.r);
            minG = Math.min(minG, pixel.g);
            maxG = Math.max(maxG, pixel.g);
            minB = Math.min(minB, pixel.b);
            maxB = Math.max(maxB, pixel.b);
        }
        
        const rangeR = maxR - minR;
        const rangeG = maxG - minG;
        const rangeB = maxB - minB;
        
        return Math.max(rangeR, rangeG, rangeB);
    }
    
    sortByLargestRange(pixels) {
        // Find channel with largest range
        const ranges = {
            r: this.getChannelRange(pixels, 'r'),
            g: this.getChannelRange(pixels, 'g'),
            b: this.getChannelRange(pixels, 'b')
        };
        
        const channel = Object.keys(ranges).reduce((a, b) => 
            ranges[a] > ranges[b] ? a : b
        );
        
        // Sort by that channel
        return [...pixels].sort((a, b) => a[channel] - b[channel]);
    }
    
    getChannelRange(pixels, channel) {
        let min = 255, max = 0;
        for (const pixel of pixels) {
            min = Math.min(min, pixel[channel]);
            max = Math.max(max, pixel[channel]);
        }
        return max - min;
    }
    
    createColorObject(rgb) {
        const { r, g, b } = rgb;
        
        // Convert to HSL for additional properties
        const hsl = this.rgbToHsl(r, g, b);
        
        return {
            rgb: { r, g, b },
            hex: this.rgbToHex(r, g, b),
            hsl: hsl,
            luminance: this.calculateLuminance(r, g, b),
            name: this.getColorName(r, g, b)
        };
    }
    
    generateAccentColors(dominantColors) {
        if (dominantColors.length === 0) return [];
        
        const accents = [];
        
        // Generate complementary colors
        for (const color of dominantColors.slice(0, 3)) {
            const hsl = color.hsl;
            const complementaryHue = (hsl.h + 180) % 360;
            
            accents.push(this.createColorObject(
                this.hslToRgb(complementaryHue, hsl.s, hsl.l)
            ));
        }
        
        // Generate analogous colors (neighboring hues)
        for (const color of dominantColors.slice(0, 2)) {
            const hsl = color.hsl;
            const hue1 = (hsl.h + 30) % 360;
            const hue2 = (hsl.h + 330) % 360; // -30 degrees
            
            accents.push(this.createColorObject(
                this.hslToRgb(hue1, hsl.s * 0.8, Math.min(hsl.l * 1.2, 1))
            ));
            
            accents.push(this.createColorObject(
                this.hslToRgb(hue2, hsl.s * 0.8, Math.min(hsl.l * 1.2, 1))
            ));
        }
        
        return accents.slice(0, 6); // Limit to 6 accent colors
    }
    
    updateColorDisplays() {
        // Update dominant colors
        this.elements.dominantColors.innerHTML = this.state.colors.dominant
            .map((color, index) => this.createColorSwatchHTML(color, index, 'dominant'))
            .join('');
        
        // Update accent colors
        this.elements.accentColors.innerHTML = this.state.colors.accent
            .map((color, index) => this.createColorSwatchHTML(color, index, 'accent'))
            .join('');
        
        // Add click events to swatches
        this.addColorSwatchEvents();
    }
    
    clearColorDisplays() {
        this.elements.dominantColors.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-palette"></i>
                <p>Upload an image to extract colors</p>
            </div>
        `;
        
        this.elements.accentColors.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <p>Accent colors will appear here</p>
            </div>
        `;
        
        this.elements.colorDetails.innerHTML = `
            <div class="empty-details">
                <p>Click a color swatch to view details</p>
            </div>
        `;
    }
    
    createColorSwatchHTML(color, index, type) {
        const isSelected = this.state.selectedColor === color;
        const colorCode = this.getFormattedColorCode(color);
        
        return `
            <div class="color-swatch ${isSelected ? 'active' : ''}" 
                 data-index="${index}" 
                 data-type="${type}"
                 style="--color-hex: ${color.hex}">
                <div class="color-block" style="background-color: ${color.hex}"></div>
                <div class="color-info">
                    <div class="color-name">${color.name}</div>
                    <div class="color-code">
                        <span>${colorCode}</span>
                        <i class="fas fa-copy copy-icon" title="Copy to clipboard"></i>
                    </div>
                </div>
            </div>
        `;
    }
    
    addColorSwatchEvents() {
        const swatches = document.querySelectorAll('.color-swatch');
        
        swatches.forEach(swatch => {
            // Select color
            swatch.addEventListener('click', (e) => {
                const index = parseInt(swatch.dataset.index);
                const type = swatch.dataset.type;
                const color = this.state.colors[type][index];
                
                if (color) {
                    this.selectColor(color);
                    
                    // Update active state
                    swatches.forEach(s => s.classList.remove('active'));
                    swatch.classList.add('active');
                }
            });
            
            // Copy color code
            const copyIcon = swatch.querySelector('.copy-icon');
            copyIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(swatch.dataset.index);
                const type = swatch.dataset.type;
                const color = this.state.colors[type][index];
                
                if (color) {
                    this.copyColorToClipboard(color);
                }
            });
        });
    }
    
    selectColor(color) {
        this.state.selectedColor = color;
        
        // Update color details
        this.updateColorDetails(color);
        
        // Update contrast checker
        this.updateContrastChecker(color);
        
        // Update export preview
        this.updateExportPreview();
    }
    
    updateColorDetails(color) {
        const detailsHTML = `
            <div class="color-preview-large" style="background-color: ${color.hex}"></div>
            <div class="detail-item">
                <span class="detail-label">Name</span>
                <span class="detail-value">${color.name}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">HEX</span>
                <span class="detail-value">${color.hex}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">RGB</span>
                <span class="detail-value">rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">HSL</span>
                <span class="detail-value">hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s * 100)}%, ${Math.round(color.hsl.l * 100)}%)</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Luminance</span>
                <span class="detail-value">${color.luminance.toFixed(3)}</span>
            </div>
        `;
        
        this.elements.colorDetails.innerHTML = detailsHTML;
    }
    
    updateContrastChecker(color) {
        const luminance = color.luminance;
        
        // Calculate contrast ratios
        const whiteContrast = (luminance + 0.05) / (1.0 + 0.05);
        const blackContrast = (1.0 + 0.05) / (luminance + 0.05);
        
        const maxContrast = Math.max(whiteContrast, blackContrast);
        const betterContrast = whiteContrast > blackContrast ? 'white' : 'black';
        
        // Update ratios
        this.elements.lightRatio.textContent = whiteContrast.toFixed(2);
        this.elements.darkRatio.textContent = blackContrast.toFixed(2);
        
        // Update WCAG ratings
        const wcagAA = maxContrast >= 4.5 ? 'Pass' : 'Fail';
        const wcagAAA = maxContrast >= 7.0 ? 'Pass' : 'Fail';
        
        this.elements.wcagRating.innerHTML = `
            <div class="rating-item">
                <span class="rating-label">WCAG AA:</span>
                <span class="rating-value ${wcagAA.toLowerCase()}">${wcagAA}</span>
            </div>
            <div class="rating-item">
                <span class="rating-label">WCAG AAA:</span>
                <span class="rating-value ${wcagAAA.toLowerCase()}">${wcagAAA}</span>
            </div>
        `;
        
        // Update status
        let status = 'Inactive';
        let statusClass = '';
        
        if (maxContrast >= 7.0) {
            status = 'Excellent';
            statusClass = 'good';
        } else if (maxContrast >= 4.5) {
            status = 'Good';
            statusClass = 'good';
        } else if (maxContrast >= 3.0) {
            status = 'Poor';
            statusClass = 'warning';
        } else {
            status = 'Very Poor';
            statusClass = 'poor';
        }
        
        this.elements.contrastStatus.textContent = status;
        this.elements.contrastStatus.className = `status-badge ${statusClass}`;
        
        // Update hint
        this.elements.contrastHint.textContent = 
            `Use ${betterContrast} text for best readability (${maxContrast.toFixed(2)}:1 contrast)`;
    }
    
    updateExportPreview() {
        let exportText = '';
        
        switch (this.state.exportFormat) {
            case 'css':
                exportText = this.generateCSSExport();
                break;
            case 'scss':
                exportText = this.generateSCSSExport();
                break;
            case 'json':
                exportText = this.generateJSONExport();
                break;
            case 'tailwind':
                exportText = this.generateTailwindExport();
                break;
        }
        
        this.elements.exportPreview.textContent = exportText;
    }
    
    generateCSSExport() {
        const colors = [...this.state.colors.dominant, ...this.state.colors.accent];
        let css = `/* Color Palette - Generated by Color DNA Extractor */\n:root {\n`;
        
        colors.forEach((color, index) => {
            const name = index < this.state.colors.dominant.length 
                ? `--color-dominant-${index + 1}`
                : `--color-accent-${index - this.state.colors.dominant.length + 1}`;
            
            css += `  ${name}: ${color.hex};\n`;
        });
        
        css += '}\n';
        
        // Add usage examples
        css += '\n/* Usage Example */\n';
        css += '.primary-button {\n';
        css += '  background-color: var(--color-dominant-1);\n';
        css += '  color: white;\n';
        css += '}\n';
        
        return css;
    }
    
    generateSCSSExport() {
        const colors = [...this.state.colors.dominant, ...this.state.colors.accent];
        let scss = `// Color Palette - Generated by Color DNA Extractor\n\n`;
        
        colors.forEach((color, index) => {
            const name = index < this.state.colors.dominant.length 
                ? `$color-dominant-${index + 1}`
                : `$color-accent-${index - this.state.colors.dominant.length + 1}`;
            
            scss += `${name}: ${color.hex};\n`;
        });
        
        scss += '\n// Usage Example\n';
        scss += '.primary-button {\n';
        scss += '  background-color: $color-dominant-1;\n';
        scss += '  color: white;\n';
        scss += '}\n';
        
        return scss;
    }
    
    generateJSONExport() {
        const palette = {
            name: 'Extracted Color Palette',
            image: this.state.image ? 'Loaded' : 'No image',
            dominant: this.state.colors.dominant.map(c => ({
                name: c.name,
                hex: c.hex,
                rgb: c.rgb,
                hsl: c.hsl
            })),
            accent: this.state.colors.accent.map(c => ({
                name: c.name,
                hex: c.hex,
                rgb: c.rgb,
                hsl: c.hsl
            })),
            generated: new Date().toISOString()
        };
        
        return JSON.stringify(palette, null, 2);
    }
    
    generateTailwindExport() {
        const colors = [...this.state.colors.dominant, ...this.state.colors.accent];
        let tailwind = `// Tailwind Color Palette - Add to tailwind.config.js\n\n`;
        tailwind += 'module.exports = {\n';
        tailwind += '  theme: {\n';
        tailwind += '    extend: {\n';
        tailwind += '      colors: {\n';
        tailwind += '        extracted: {\n';
        
        colors.forEach((color, index) => {
            const name = index < this.state.colors.dominant.length 
                ? `dominant-${index + 1}`
                : `accent-${index - this.state.colors.dominant.length + 1}`;
            
            tailwind += `          '${name}': '${color.hex}',\n`;
        });
        
        tailwind += '        }\n';
        tailwind += '      }\n';
        tailwind += '    }\n';
        tailwind += '  }\n';
        tailwind += '}\n';
        
        return tailwind;
    }
    
    exportPalette() {
        this.setExportFormat('css');
        this.updateExportPreview();
        
        // Create download link
        const content = this.elements.exportPreview.textContent;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `color-palette-${Date.now()}.${this.state.exportFormat === 'json' ? 'json' : 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.showToast('Palette exported successfully!', 'success');
    }
    
    copyExport() {
        const content = this.elements.exportPreview.textContent;
        navigator.clipboard.writeText(content).then(() => {
            this.showToast('Exported code copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy to clipboard', 'error');
        });
    }
    
    copyColorToClipboard(color) {
        const code = this.getFormattedColorCode(color);
        navigator.clipboard.writeText(code).then(() => {
            this.showToast(`Copied ${code} to clipboard!`, 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy to clipboard', 'error');
        });
    }
    
    setColorMode(mode) {
        this.state.colorMode = mode;
        
        // Update active button
        this.elements.colorModeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Update color displays if we have colors
        if (this.state.colors.dominant.length > 0) {
            this.updateColorDisplays();
            if (this.state.selectedColor) {
                this.updateColorDetails(this.state.selectedColor);
            }
        }
    }
    
    setExportFormat(format) {
        this.state.exportFormat = format;
        
        // Update active button
        this.elements.formatButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });
        
        // Update export preview
        this.updateExportPreview();
    }
    
    toggleTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        document.body.classList.toggle('dark-theme', !isDark);
        
        // Save preference
        localStorage.setItem('colorDNATheme', !isDark ? 'dark' : 'light');
        
        this.showToast(`Switched to ${!isDark ? 'dark' : 'light'} theme`, 'success');
    }
    
    showHelpModal() {
        this.elements.helpModal.classList.add('active');
    }
    
    hideHelpModal() {
        this.elements.helpModal.classList.remove('active');
    }
    
    // Utility Methods
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: parseFloat(s.toFixed(3)),
            l: parseFloat(l.toFixed(3))
        };
    }
    
    hslToRgb(h, s, l) {
        h /= 360;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    calculateLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    
    getColorName(r, g, b) {
        const hue = this.rgbToHsl(r, g, b).h;
        
        if (hue >= 0 && hue < 15) return 'Red';
        if (hue >= 15 && hue < 45) return 'Orange';
        if (hue >= 45 && hue < 75) return 'Yellow';
        if (hue >= 75 && hue < 165) return 'Green';
        if (hue >= 165 && hue < 195) return 'Cyan';
        if (hue >= 195 && hue < 255) return 'Blue';
        if (hue >= 255 && hue < 285) return 'Purple';
        if (hue >= 285 && hue < 330) return 'Magenta';
        return 'Red';
    }
    
    getFormattedColorCode(color) {
        switch (this.state.colorMode) {
            case 'hex':
                return color.hex;
            case 'rgb':
                return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
            case 'hsl':
                return `hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s * 100)}%, ${Math.round(color.hsl.l * 100)}%)`;
            default:
                return color.hex;
        }
    }
    
    updateUIState() {
        // Check for saved theme
        const savedTheme = localStorage.getItem('colorDNATheme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ColorDNAExtractor();
    
    // Make app available globally for debugging
    window.colorDNA = app;
});