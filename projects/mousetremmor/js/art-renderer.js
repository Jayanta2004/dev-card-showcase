/* ============================================
   MOUSE TREMOR ART - ART RENDERER
   Canvas rendering engine with multiple drawing modes
   ============================================ */

(function () {
    'use strict';

    /* ============================================
       ART RENDERER CLASS
       ============================================ */

    class ArtRenderer {
        constructor(canvasElement) {
            this.canvas = canvasElement;
            this.ctx = this.canvas.getContext('2d', { alpha: true });

            // Canvas state
            this.isInitialized = false;
            this.isRendering = false;

            // Drawing settings
            this.strokeColor = '#00d4ff';
            this.strokeOpacity = 0.8;
            this.lineWidth = 2;
            this.drawingMode = 'lines';

            // Drawing state
            this.lastPoint = null;
            this.pathPoints = [];
            this.maxPathLength = 50;

            // Animation
            this.animationFrameId = null;
            this.renderQueue = [];

            // Performance
            this.lastRenderTime = 0;
            this.targetFPS = 60;
            this.frameInterval = 1000 / this.targetFPS;

            // Initialize canvas
            this.initializeCanvas();
        }

        /* ============================================
           INITIALIZATION
           ============================================ */

        initializeCanvas() {
            this.resizeCanvas();
            this.clearCanvas();
            this.isInitialized = true;

            // Handle window resize
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        resizeCanvas() {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // Set display size
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;

            // Scale context for high DPI displays
            this.ctx.scale(dpr, dpr);

            // Store logical dimensions
            this.width = rect.width;
            this.height = rect.height;
        }

        /* ============================================
           DRAWING SETTINGS
           ============================================ */

        setStrokeColor(color) {
            this.strokeColor = color;
        }

        setStrokeOpacity(opacity) {
            this.strokeOpacity = Math.max(0, Math.min(1, opacity));
        }

        setLineWidth(width) {
            this.lineWidth = Math.max(0.5, Math.min(20, width));
        }

        setDrawingMode(mode) {
            const validModes = ['lines', 'spikes', 'shards', 'organic'];
            if (validModes.includes(mode)) {
                this.drawingMode = mode;
                this.resetPath();
            }
        }

        /* ============================================
           RENDERING CONTROL
           ============================================ */

        startRendering() {
            if (this.isRendering) return;
            this.isRendering = true;
            this.renderLoop();
        }

        stopRendering() {
            this.isRendering = false;
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }

        renderLoop() {
            if (!this.isRendering) return;

            const now = performance.now();
            const elapsed = now - this.lastRenderTime;

            if (elapsed >= this.frameInterval) {
                this.processRenderQueue();
                this.lastRenderTime = now - (elapsed % this.frameInterval);
            }

            this.animationFrameId = requestAnimationFrame(() => this.renderLoop());
        }

        processRenderQueue() {
            if (this.renderQueue.length === 0) return;

            // Process all queued render operations
            while (this.renderQueue.length > 0) {
                const operation = this.renderQueue.shift();
                operation();
            }
        }

        /* ============================================
           DRAWING OPERATIONS
           ============================================ */

        drawTremorData(tremorData) {
            if (!tremorData || !this.isInitialized) return;

            const point = {
                x: tremorData.position.x,
                y: tremorData.position.y,
                prevX: tremorData.previousPosition.x,
                prevY: tremorData.previousPosition.y,
                intensity: tremorData.tremorIntensity,
                velocity: tremorData.velocity.magnitude,
                deltaX: tremorData.delta.x,
                deltaY: tremorData.delta.y
            };

            // Queue the drawing operation
            this.renderQueue.push(() => {
                switch (this.drawingMode) {
                    case 'lines':
                        this.drawLinesMode(point);
                        break;
                    case 'spikes':
                        this.drawSpikesMode(point);
                        break;
                    case 'shards':
                        this.drawShardsMode(point);
                        break;
                    case 'organic':
                        this.drawOrganicMode(point);
                        break;
                }
            });
        }

        /* ============================================
           DRAWING MODE: LINES
           Continuous jagged lines following tremors
           ============================================ */

        drawLinesMode(point) {
            this.ctx.save();

            // Set stroke style
            this.ctx.strokeStyle = this.hexToRGBA(this.strokeColor, this.strokeOpacity);
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            // Draw line from previous point to current point
            if (this.lastPoint) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
                this.ctx.lineTo(point.x, point.y);
                this.ctx.stroke();

                // Add tremor variation with perpendicular offset
                const angle = Math.atan2(point.deltaY, point.deltaX);
                const perpAngle = angle + Math.PI / 2;
                const offset = point.intensity * 0.5;

                const offsetX = Math.cos(perpAngle) * offset;
                const offsetY = Math.sin(perpAngle) * offset;

                this.ctx.globalAlpha = this.strokeOpacity * 0.3;
                this.ctx.beginPath();
                this.ctx.moveTo(point.x + offsetX, point.y + offsetY);
                this.ctx.lineTo(point.prevX + offsetX, point.prevY + offsetY);
                this.ctx.stroke();
            }

            this.lastPoint = { x: point.x, y: point.y };
            this.ctx.restore();
        }

        /* ============================================
           DRAWING MODE: SPIKES
           Sharp radiating spikes from movement points
           ============================================ */

        drawSpikesMode(point) {
            this.ctx.save();

            const spikeCount = Math.floor(3 + point.intensity * 0.2);
            const spikeLength = 10 + point.intensity * 2;
            const baseAngle = Math.atan2(point.deltaY, point.deltaX);

            this.ctx.strokeStyle = this.hexToRGBA(this.strokeColor, this.strokeOpacity);
            this.ctx.lineWidth = this.lineWidth * 0.8;
            this.ctx.lineCap = 'round';

            for (let i = 0; i < spikeCount; i++) {
                const angleOffset = (Math.random() - 0.5) * Math.PI;
                const angle = baseAngle + angleOffset;
                const length = spikeLength * (0.5 + Math.random() * 0.5);

                const endX = point.x + Math.cos(angle) * length;
                const endY = point.y + Math.sin(angle) * length;

                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }

            this.ctx.restore();
        }

        /* ============================================
           DRAWING MODE: SHARDS
           Fragmented geometric shapes
           ============================================ */

        drawShardsMode(point) {
            this.ctx.save();

            const shardSize = 8 + point.intensity * 1.5;
            const shardCount = Math.floor(2 + point.intensity * 0.15);

            this.ctx.strokeStyle = this.hexToRGBA(this.strokeColor, this.strokeOpacity);
            this.ctx.fillStyle = this.hexToRGBA(this.strokeColor, this.strokeOpacity * 0.2);
            this.ctx.lineWidth = this.lineWidth * 0.6;
            this.ctx.lineJoin = 'miter';

            for (let i = 0; i < shardCount; i++) {
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 20;
                const centerX = point.x + offsetX;
                const centerY = point.y + offsetY;

                const sides = 3 + Math.floor(Math.random() * 3);
                const rotation = Math.random() * Math.PI * 2;

                this.ctx.beginPath();
                for (let j = 0; j < sides; j++) {
                    const angle = (j / sides) * Math.PI * 2 + rotation;
                    const radius = shardSize * (0.7 + Math.random() * 0.3);
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    if (j === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }

            this.ctx.restore();
        }

        /* ============================================
           DRAWING MODE: ORGANIC
           Flowing natural curves with tremor influence
           ============================================ */

        drawOrganicMode(point) {
            this.ctx.save();

            // Add point to path
            this.pathPoints.push({
                x: point.x,
                y: point.y,
                intensity: point.intensity
            });

            // Limit path length
            if (this.pathPoints.length > this.maxPathLength) {
                this.pathPoints.shift();
            }

            // Need at least 3 points for curves
            if (this.pathPoints.length < 3) {
                this.ctx.restore();
                return;
            }

            // Draw smooth curve through points
            this.ctx.strokeStyle = this.hexToRGBA(this.strokeColor, this.strokeOpacity);
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.beginPath();
            this.ctx.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);

            // Use quadratic curves for smooth flow
            for (let i = 1; i < this.pathPoints.length - 1; i++) {
                const current = this.pathPoints[i];
                const next = this.pathPoints[i + 1];
                const controlX = current.x;
                const controlY = current.y;
                const endX = (current.x + next.x) / 2;
                const endY = (current.y + next.y) / 2;

                this.ctx.quadraticCurveTo(controlX, controlY, endX, endY);
            }

            // Draw to last point
            const lastPoint = this.pathPoints[this.pathPoints.length - 1];
            this.ctx.lineTo(lastPoint.x, lastPoint.y);
            this.ctx.stroke();

            // Add organic tendrils based on tremor intensity
            if (point.intensity > 5) {
                const tendrilCount = Math.floor(point.intensity * 0.1);
                this.ctx.globalAlpha = this.strokeOpacity * 0.4;
                this.ctx.lineWidth = this.lineWidth * 0.5;

                for (let i = 0; i < tendrilCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const length = 15 + Math.random() * 25;
                    const segments = 5;

                    this.ctx.beginPath();
                    this.ctx.moveTo(point.x, point.y);

                    let currentX = point.x;
                    let currentY = point.y;
                    let currentAngle = angle;

                    for (let j = 0; j < segments; j++) {
                        currentAngle += (Math.random() - 0.5) * 0.8;
                        const segmentLength = length / segments;
                        currentX += Math.cos(currentAngle) * segmentLength;
                        currentY += Math.sin(currentAngle) * segmentLength;
                        this.ctx.lineTo(currentX, currentY);
                    }

                    this.ctx.stroke();
                }
            }

            this.ctx.restore();
        }

        /* ============================================
           PATH MANAGEMENT
           ============================================ */

        resetPath() {
            this.lastPoint = null;
            this.pathPoints = [];
        }

        /* ============================================
           CANVAS OPERATIONS
           ============================================ */

        clearCanvas() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.resetPath();
        }

        /* ============================================
           EXPORT
           ============================================ */

        exportToPNG() {
            return new Promise((resolve, reject) => {
                try {
                    this.canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    }, 'image/png');
                } catch (error) {
                    reject(error);
                }
            });
        }

        async downloadPNG(filename = 'tremor-art.png') {
            try {
                const blob = await this.exportToPNG();
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();

                // Clean up
                setTimeout(() => URL.revokeObjectURL(url), 100);

                return true;
            } catch (error) {
                console.error('Export failed:', error);
                return false;
            }
        }

        /* ============================================
           UTILITIES
           ============================================ */

        hexToRGBA(hex, alpha = 1) {
            // Remove # if present
            hex = hex.replace('#', '');

            // Parse hex values
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        /* ============================================
           CLEANUP
           ============================================ */

        destroy() {
            this.stopRendering();
            window.removeEventListener('resize', () => this.resizeCanvas());
            this.clearCanvas();
            this.renderQueue = [];
        }
    }

    /* ============================================
       EXPORT TO GLOBAL SCOPE
       ============================================ */

    window.ArtRenderer = ArtRenderer;

})();
