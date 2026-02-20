import { Config } from '../Config.js';

export class CanvasGraph {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.history = [];
        this.maxHistory = 200; // Number of points
        this.maxVal = 100; // Auto-scaling
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    pushValue(val) {
        this.history.push(val);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        if (val > this.maxVal) this.maxVal = val * 1.2;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.history.length < 2) return;

        // Draw Line Chart
        this.ctx.beginPath();
        const step = this.width / (this.maxHistory - 1);

        // Start from right side to show latest
        const startX = this.width - (this.history.length - 1) * step;

        for (let i = 0; i < this.history.length; i++) {
            const val = this.history[i];
            const x = startX + i * step;
            // Map value to height (bottom 20% reserved, top 20% margin)
            // Invert Y because canvas draws down
            const y = this.height - (val / this.maxVal) * (this.height * 0.3) - 20;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = Config.PARTICLE_COLOR_LOW_DENSITY;
        this.ctx.stroke();

        // Fill below line
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(startX, this.height);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(100, 255, 218, 0.1)';
        this.ctx.fill();
    }
}
