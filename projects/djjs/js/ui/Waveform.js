export class Waveform {
    constructor(canvasId, deckColor) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.color = deckColor;
        this.buffer = null;
        this.data = null;

        // Resize observer to handle responsiveness
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw(); // Redraw if data exists
    }

    load(buffer) {
        this.buffer = buffer;
        // Optimize: Downsample for rendering
        this.data = this.processBuffer(buffer);
        this.draw();
    }

    processBuffer(buffer) {
        const rawData = buffer.getChannelData(0); // Left channel
        const samples = 10000; // Resolution
        const step = Math.ceil(rawData.length / samples);
        const data = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            let min = 1.0;
            let max = -1.0;
            // Get max/min in chunk (RMS like)
            for (let j = 0; j < step; j++) {
                const val = rawData[(i * step) + j];
                if (val < min) min = val;
                if (val > max) max = val;
            }
            data[i] = Math.max(Math.abs(min), Math.abs(max));
        }
        return data;
    }

    draw(playheadPos = 0) {
        if (!this.data) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = this.color;

        // Draw whole waveform (Simple view for now, scrub view logic can be added)
        const barWidth = width / this.data.length;

        ctx.beginPath();
        for (let i = 0; i < this.data.length; i++) {
            const x = i * (width / this.data.length);
            const y = this.data[i] * height * 0.8; // Scale
            // draw symmetric
            ctx.moveTo(x, centerY - y / 2);
            ctx.lineTo(x, centerY + y / 2);
        }
        ctx.stroke(); // or fill if using rects

        // Optimize: Use Rects for solid look
        // Just clear and redraw minimal needed if strictly optimizing
    }

    // Animate method called by main loop
    update(positionPercent) {
        // We can just move a container or redraw
        // For this MVP, we might just move the playhead div, but if we want scrolling waveform:
        // We would offset the draw here.
    }
}
