export class ProcessManager {
    constructor() {
        this.processes = [];
        this.pid = 0;
    }

    createProcess(name) {
        const process = {
            pid: this.pid++,
            name,
            state: "Ready",
            memory: Math.floor(Math.random() * 100) + 20
        };

        this.processes.push(process);
        return process;
    }

    killProcess(pid) {
        this.processes = this.processes.filter(p => p.pid !== pid);
    }

    listProcesses() {
        return this.processes;
    }
}