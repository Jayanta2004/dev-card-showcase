class SysMonApp {
    constructor(container, winId) {
        this.container = container;
        this.container.innerHTML = `
            <div class="app-sysmonitor">
                <div class="sys-graph-container" id="cpu-graph-${winId}">
                    <canvas></canvas>
                    <div class="sys-label">CPU USAGE</div>
                </div>
                <div class="sys-graph-container" id="net-graph-${winId}">
                    <canvas></canvas>
                    <div class="sys-label">NET TRAFFIC</div>
                </div>
            </div>
        `;

        this.running = true;
        this.initGraphs(winId);
    }

    initGraphs(id) {
        const cpuCanvas = this.container.querySelector(`#cpu-graph-${id} canvas`);
        const netCanvas = this.container.querySelector(`#net-graph-${id} canvas`);

        this.resizeCanvas(cpuCanvas);
        this.resizeCanvas(netCanvas);

        this.startGraph(cpuCanvas, () => 30 + Math.random() * 40); // Random CPU
        this.startGraph(netCanvas, () => (Math.sin(Date.now() / 500) * 20 + 50) + Math.random() * 20); // Wave NET
    }

    resizeCanvas(canvas) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    startGraph(canvas, valueFn) {
        const ctx = canvas.getContext('2d');
        const data = Array(50).fill(0);

        const loop = () => {
            if (!this.running) return;

            // Update data
            data.shift();
            data.push(valueFn());

            // Clear
            ctx.fillStyle = 'rgba(0, 20, 0, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < canvas.width; i += 20) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
            for (let i = 0; i < canvas.height; i += 20) { ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); }
            ctx.stroke();

            // Draw Line
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const step = canvas.width / (data.length - 1);
            data.forEach((val, i) => {
                const y = canvas.height - (val / 100 * canvas.height);
                if (i === 0) ctx.moveTo(0, y);
                else ctx.lineTo(i * step, y);
            });
            ctx.stroke();

            // Glow under fill
            ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.fill();

            requestAnimationFrame(loop);
        };
        loop();
    }

    onDestroy() {
        this.running = false;
    }
}

window.SysMonApp = SysMonApp;
