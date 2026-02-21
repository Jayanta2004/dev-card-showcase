export class SystemMonitor {
    constructor(kernel, container) {
        this.kernel = kernel;
        this.container = container;
    }

    init() {
        this.render();
        setInterval(() => this.render(), 1000);
    }

    render() {
        const processes = this.kernel.pm.listProcesses();
        const cpuUsage = processes.length * 10;
        const memoryUsage = processes.reduce((sum, p) => sum + p.memory, 0);

        this.container.innerHTML = `
            <h3>System Monitor</h3>
            <p>CPU Usage: ${cpuUsage}%</p>
            <p>Memory Usage: ${memoryUsage} MB</p>
            <h4>Processes</h4>
            <pre>${JSON.stringify(processes, null, 2)}</pre>
        `;
    }
}