/**
 * RECURRNET VISUALIZATION MODULE
 * Handles Canvas rendering for Loss Graphs and Neural Heatmaps.
 * @author saiusesgithub
 */

class LossGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        this.maxPoints = 200;
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
    }

    update(lossVal) {
        this.data.push(lossVal);
        if (this.data.length > this.maxPoints) {
            this.data.shift();
        }
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const pad = 20;

        // Clear
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, w, h);

        if (this.data.length < 2) return;

        // Auto-Scale
        let maxVal = Math.max(...this.data);
        let minVal = Math.min(...this.data);
        if (maxVal === minVal) maxVal += 0.1;

        const xScale = (w - pad * 2) / (this.maxPoints - 1);
        const yScale = (h - pad * 2) / (maxVal - minVal);

        // Draw Grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Horizon line at bottom
        ctx.moveTo(pad, h - pad); ctx.lineTo(w - pad, h - pad);
        // Vertical line left
        ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad);
        ctx.stroke();

        // Draw Line
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.data.length; i++) {
            const x = pad + i * xScale;
            // Invert Y because canvas 0 is top
            const y = (h - pad) - ((this.data[i] - minVal) * yScale);
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Text
        ctx.fillStyle = '#aaa';
        ctx.font = '10px monospace';
        ctx.fillText(maxVal.toFixed(2), 0, pad);
        ctx.fillText(minVal.toFixed(2), 0, h - 5);
    }
}

class Heatmap {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }

    resize() {
        // Square aspect ratio usually better for heatmaps
        this.size = Math.min(this.canvas.parentElement.clientWidth, 250);
        this.canvas.width = this.size;
        this.canvas.height = this.size;
    }

    /**
     * Draw the Hidden State Vector
     * @param {Mat} h - Hidden state matrix (n x 1)
     */
    draw(h) {
        const ctx = this.ctx;
        const size = this.size;
        
        // Calculate Grid Dimension (sqrt of neurons)
        // e.g., 100 neurons -> 10x10 grid
        const cols = Math.ceil(Math.sqrt(h.w.length));
        const rows = Math.ceil(h.w.length / cols);
        
        const cellW = size / cols;
        const cellH = size / rows;

        ctx.clearRect(0, 0, size, size);

        for (let i = 0; i < h.w.length; i++) {
            const val = h.w[i]; // Value is typically -1 to 1 (tanh)
            
            // Map -1..1 to Color
            // -1 = Red, 0 = Black, 1 = Green/Blue
            let r=0, g=0, b=0;
            
            if (val > 0) {
                // Positive: Green/Cyan
                g = Math.floor(val * 255);
                b = Math.floor(val * 100);
            } else {
                // Negative: Red/Orange
                r = Math.floor(Math.abs(val) * 255);
                g = Math.floor(Math.abs(val) * 50);
            }

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            
            const x = (i % cols) * cellW;
            const y = Math.floor(i / cols) * cellH;
            
            ctx.fillRect(x, y, cellW - 1, cellH - 1); // -1 for grid gap
        }
    }
}