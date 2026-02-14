/**
 * ChartEngine
 * Lightweight, zero-dependency graphing library for canvas.
 * Optimized for scientific data visualization.
 */
export class ChartEngine {
    constructor() {
        this.ctxCache = new Map();
    }

    /**
     * Helper to get or setup context.
     * @param {HTMLCanvasElement} canvas 
     */
    getContext(canvas) {
        if (!canvas) return null;
        if (!this.ctxCache.has(canvas)) {
            const ctx = canvas.getContext('2d');
            this.ctxCache.set(canvas, ctx);
        }
        return this.ctxCache.get(canvas);
    }

    /**
     * Clears the canvas.
     * @param {HTMLCanvasElement} canvas 
     */
    clear(canvas) {
        const ctx = this.getContext(canvas);
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Draws a line chart for time-series data.
     * @param {HTMLCanvasElement} canvas 
     * @param {number[]} data - Array of values (0-1 range expected)
     * @param {string} color - Hex or rgba string
     */
    drawLineChart(canvas, data, color = '#00f0ff') {
        const ctx = this.getContext(canvas);
        if (!ctx || data.length < 2) return;

        const w = canvas.width;
        const h = canvas.height;
        const padding = 10;
        const step = (w - padding * 2) / (data.length - 1);

        this.clear(canvas);

        // Draw grid lines
        ctx.strokeStyle = '#2a2d35';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        data.forEach((val, i) => {
            // Invert Y because canvas 0 is top
            const x = padding + i * step;
            const y = h - padding - (val * (h - padding * 2));

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        // Draw fill gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.1;
        ctx.lineTo(w - padding, h);
        ctx.lineTo(padding, h);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    /**
     * Draws a polar area chart / radar chart for directional bias.
     * @param {HTMLCanvasElement} canvas 
     * @param {number[]} buckets - Array of 8 values (0-1)
     * @param {string} color 
     */
    drawPolarChart(canvas, buckets, color = '#ff0055') {
        const ctx = this.getContext(canvas);
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy) - 10;

        this.clear(canvas);

        // Draw guides
        ctx.strokeStyle = '#2a2d35';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        }
        ctx.stroke();

        // Draw rings
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Data Shape
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;

        ctx.beginPath();
        buckets.forEach((val, i) => {
            const angle = (Math.PI * 2 / 8) * i;
            // Map value to radius (min 10% to prevent collapse)
            const r = (val * 0.9 + 0.1) * radius;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    /**
     * Draws an arc progress bar (ring).
     * @param {HTMLCanvasElement} canvas 
     * @param {number} percentage - 0 to 1
     * @param {string} color 
     */
    drawRing(canvas, percentage, color = '#ccff00') {
        const ctx = this.getContext(canvas);
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy) - 10;
        const start = -Math.PI / 2; // Top
        const end = start + (Math.PI * 2 * percentage);

        this.clear(canvas);

        // Background Ring
        ctx.strokeStyle = '#2a2d35';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Foreground Ring
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, start, end);
        ctx.stroke();

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}
