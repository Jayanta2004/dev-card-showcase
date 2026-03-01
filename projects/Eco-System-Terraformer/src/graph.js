export class PopulationGraph {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = {
            grass: [],
            rabbit: [],
            wolf: []
        };
        this.maxPoints = 200;
        this.maxVal = 100;

        // Resize observer? Or just hardcode for now.
        this.width = canvas.width;
        this.height = canvas.height;
    }

    push(stats) {
        this.data.grass.push(stats.grass);
        this.data.rabbit.push(stats.rabbit);
        this.data.wolf.push(stats.wolf);

        if (this.data.grass.length > this.maxPoints) {
            this.data.grass.shift();
            this.data.rabbit.shift();
            this.data.wolf.shift();
        }

        // Updating maxVal for scaling
        const currentMax = Math.max(
            ...this.data.grass,
            ...this.data.rabbit,
            ...this.data.wolf
        );
        this.maxVal = Math.max(this.maxVal, currentMax * 1.2);
        // Slowly shrink maxVal if current is low
        if (currentMax < this.maxVal * 0.5) this.maxVal *= 0.99;
    }

    draw() {
        const { ctx, width, height, data, maxVal } = this;
        ctx.clearRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const y = (height / 5) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        this.drawSeries(data.grass, '#1eff7f');
        this.drawSeries(data.rabbit, '#f0f0f0');
        this.drawSeries(data.wolf, '#ff3b3b');
    }

    drawSeries(points, color) {
        const { ctx, width, height, maxVal, maxPoints } = this;
        if (points.length < 2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const stepX = width / (maxPoints - 1);

        points.forEach((val, i) => {
            const x = i * stepX;
            const y = height - (val / maxVal) * height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        // Fill under curve
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fillStyle = color + '22'; // low opacity hex
        ctx.fill();
    }
}
