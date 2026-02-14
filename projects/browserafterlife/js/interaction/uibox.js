
export class SpiritBox {
    constructor() {
        this.container = document.querySelector('.spirit-box');
        this.logContainer = document.createElement('div');
        this.logContainer.className = 'spirit-log';
        this.container.appendChild(this.logContainer);

        // EMF Graph Canvas (To be added to DOM)
        this.emfCanvas = document.createElement('canvas');
        this.emfCanvas.width = 280;
        this.emfCanvas.height = 60;
        this.emfCanvas.className = 'emf-graph';
        this.container.appendChild(this.emfCanvas);
        this.emfCtx = this.emfCanvas.getContext('2d');

        this.emfHistory = new Array(50).fill(0);
    }

    log(msg) {
        const line = document.createElement('div');
        const time = new Date().toLocaleTimeString();
        line.innerHTML = `<span class="log-time">[${time}]</span> ${msg}`;
        line.className = 'log-entry';
        this.logContainer.prepend(line);

        if (this.logContainer.children.length > 10) {
            this.logContainer.lastChild.remove();
        }
    }

    update(ghosts) {
        // Calculate EMF (total movement/energy)
        let totalEnergy = 0;
        ghosts.forEach(g => {
            totalEnergy += Math.abs(g.vx) + Math.abs(g.vy);
        });

        const val = Math.min(100, totalEnergy * 10);
        this.emfHistory.push(val);
        this.emfHistory.shift();

        this.drawEMF();
    }

    drawEMF() {
        const ctx = this.emfCtx;
        const w = this.emfCanvas.width;
        const h = this.emfCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = '#224';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < w; i += 20) { ctx.moveTo(i, 0); ctx.lineTo(i, h); }
        ctx.stroke();

        // Data
        ctx.strokeStyle = '#a0ffe0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h - (this.emfHistory[0] / 100) * h);

        for (let i = 1; i < this.emfHistory.length; i++) {
            const x = (i / (this.emfHistory.length - 1)) * w;
            const y = h - (this.emfHistory[i] / 100) * h;
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#a0ffe0';
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}
