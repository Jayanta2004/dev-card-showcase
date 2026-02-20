class FileManApp {
    constructor(container, winId) {
        this.container = container;
        this.currentPath = '/home/user';
        this.fs = window.FileSystem;

        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="app-fileman">
                <div class="fm-toolbar">
                    <button id="fm-up">⬆ UP</button>
                    <div class="fm-path">${this.currentPath}</div>
                </div>
                <div class="fm-grid" id="fm-files">
                    <!-- Files injected here -->
                </div>
            </div>
        `;

        this.container.querySelector('#fm-up').onclick = () => this.goUp();
        this.loadDir();
    }

    loadDir() {
        const grid = this.container.querySelector('#fm-files');
        grid.innerHTML = '';

        const node = this.fs.resolve(this.currentPath);
        if (!node || node.type !== 'dir') return;

        Object.entries(node.children).forEach(([name, item]) => {
            const el = document.createElement('div');
            el.className = 'fm-item';
            el.innerHTML = `
                <div class="fm-icon">${item.type === 'dir' ? '📁' : '📄'}</div>
                <div class="fm-label">${name}</div>
            `;

            el.ondblclick = () => {
                if (item.type === 'dir') {
                    this.currentPath = this.currentPath === '/' ? `/${name}` : `${this.currentPath}/${name}`;
                    this.render(); // Re-render full view
                } else {
                    // Open file in Text Editor
                    window.WM.createWindow(`edit-${Date.now()}`, name, window.TextEditApp);
                    // Hacky way to pass content for now, ideally would use state
                    setTimeout(() => {
                        // Find the app instance? simpler to just let it load empty for now or expand WM
                    }, 100);
                }
            };
            grid.appendChild(el);
        });
    }

    goUp() {
        if (this.currentPath === '/') return;
        const parts = this.currentPath.split('/');
        parts.pop();
        this.currentPath = parts.join('/') || '/';
        this.render();
    }
}

window.FileManApp = FileManApp;
