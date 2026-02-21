export class FileExplorer {
    constructor(kernel, container) {
        this.kernel = kernel;
        this.container = container;
    }

    init() {
        this.render();
    }

    render() {
        const files = this.kernel.fs.list();

        this.container.innerHTML = `
            <h3>File Explorer</h3>
            <ul>
                ${files.map(f => `<li>${f}</li>`).join("")}
            </ul>
        `;
    }
}