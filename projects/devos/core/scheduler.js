export class Scheduler {
    constructor(processManager) {
        this.pm = processManager;
        this.currentIndex = 0;
        this.timeSlice = 2000;
        this.interval = null;
    }

    start() {
        this.interval = setInterval(() => {
            this.schedule();
        }, this.timeSlice);
    }

    schedule() {
        const processes = this.pm.processes;
        if (processes.length === 0) return;

        processes.forEach(p => {
            if (p.state === "Running") {
                p.state = "Ready";
            }
        });

        const process = processes[this.currentIndex % processes.length];
        process.state = "Running";

        this.currentIndex++;
    }

    stop() {
        clearInterval(this.interval);
    }
}