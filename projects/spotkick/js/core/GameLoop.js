export class GameLoop {
    constructor(updateFn) {
        this.updateFn = updateFn;
        this.lastTime = 0;
        this.isRunning = false;
        this.frameId = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.frameId = requestAnimationFrame(this.loop.bind(this));
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.frameId);
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap dt to prevent huge jumps if tab inactive
        const safeDt = Math.min(dt, 0.1);

        this.updateFn(safeDt);

        this.frameId = requestAnimationFrame(this.loop.bind(this));
    }
}
