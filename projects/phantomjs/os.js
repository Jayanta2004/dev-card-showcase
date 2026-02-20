class OS {
    constructor() {
        this.bootScreen = document.getElementById('boot-screen');
        this.desktop = document.getElementById('desktop');
        this.clock = document.getElementById('clock');
        this.init();
    }

    async init() {
        await this.runBoot();
        this.startDesktop();
    }

    async runBoot() {
        const log = document.getElementById('boot-log');
        const lines = [
            "KERNEL: OK",
            "Verifying File System Structure...",
            "Loading Window Manager Service...",
            "Starting Graphical Subsystem...",
            "Initializing Neural Interfaces...",
            "ACCESS GRANTED"
        ];

        for (const line of lines) {
            const el = document.createElement('div');
            el.textContent = `> ${line}`;
            log.appendChild(el);
            await new Promise(r => setTimeout(r, 400));
        }
        await new Promise(r => setTimeout(r, 800));

        // Hide boot screen
        this.bootScreen.style.opacity = '0';
        setTimeout(() => this.bootScreen.remove(), 500);
    }

    startDesktop() {
        this.desktop.style.display = 'block';

        // Setup Clock
        setInterval(() => {
            const now = new Date();
            this.clock.textContent = now.toLocaleTimeString();
        }, 1000);

        // Setup Desktop Icons
        this.addIcon('Terminal', 'terminal', window.TerminalApp);
        this.addIcon('System Monitor', 'activity', window.SysMonApp);
        this.addIcon('Files', 'folder', window.FileManApp);
        this.addIcon('Text Edit', 'edit', window.TextEditApp);
        this.addIcon('Settings', 'settings', window.SettingsApp);

        // Open default terminal
        setTimeout(() => {
            window.WM.createWindow('term-1', 'TERMINAL', window.TerminalApp);
        }, 500);
    }

    addIcon(label, iconName, appClass) {
        const container = document.getElementById('desktop-icons');
        const el = document.createElement('div');
        el.className = 'desktop-icon';
        el.innerHTML = `
            <div class="icon-img">[${iconName.toUpperCase().substring(0, 1)}]</div>
            <div class="icon-label">${label}</div>
        `;
        el.ondblclick = () => {
            window.WM.createWindow(`app-${Date.now()}`, label.toUpperCase(), appClass);
        };
        container.appendChild(el);
    }
}

// Global Boot
window.onload = () => {
    window.OS = new OS();
};
