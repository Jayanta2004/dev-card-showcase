export class GraphSystem {
    constructor(ctx, x, y, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.dataHistory = {
            normal: [],
            anti: [],
            predators: []
        };

        this.maxDataPoints = 100;
    }

    update(stats) {
        // Shift if full
        if (this.dataHistory.normal.length > this.maxDataPoints) {
            this.dataHistory.normal.shift();
            this.dataHistory.anti.shift();
            this.dataHistory.predators.shift();
        }

        this.dataHistory.normal.push(stats.normal);
        this.dataHistory.anti.push(stats.anti);
        this.dataHistory.predators.push(stats.preds);
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);

        const maxVal = Math.max(
            ...this.dataHistory.normal,
            ...this.dataHistory.anti,
            ...this.dataHistory.predators,
            150 // Minimum max scale
        );

        this.plotLine(this.dataHistory.normal, '#0f0'); // Green
        this.plotLine(this.dataHistory.anti, '#0ff'); // Cyan
        this.plotLine(this.dataHistory.predators, '#f00'); // Red

        // Labels
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('Populations', this.x + 5, this.y + 15);
    }

    plotLine(data, color) {
        if (data.length < 2) return;

        const maxVal = Math.max(
            ...this.dataHistory.normal,
            ...this.dataHistory.anti,
            ...this.dataHistory.predators,
            150
        );

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;

        const step = this.width / this.maxDataPoints;

        // Start point
        let val = data[0];
        let py = this.y + this.height - (val / maxVal * this.height);
        this.ctx.moveTo(this.x, py);

        for (let i = 1; i < data.length; i++) {
            val = data[i];
            py = this.y + this.height - (val / maxVal * this.height);
            this.ctx.lineTo(this.x + i * step, py);
        }

        this.ctx.stroke();
    }
}
