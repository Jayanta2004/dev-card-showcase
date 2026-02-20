export class ThemeManager {
    constructor() {
        this.themes = {
            default: {
                '--bg-color': '#050a14',
                '--panel-bg': 'rgba(10, 25, 47, 0.85)',
                '--text-primary': '#ccd6f6',
                '--text-highlight': '#64ffda',
                '--accent-gold': '#ffd700',
            },
            light: {
                '--bg-color': '#f0f4f8',
                '--panel-bg': 'rgba(255, 255, 255, 0.9)',
                '--text-primary': '#102a43',
                '--text-highlight': '#0065ff',
                '--accent-gold': '#d9a404',
            },
            cyberpunk: {
                '--bg-color': '#000b1e',
                '--panel-bg': 'rgba(0, 0, 0, 0.8)',
                '--text-primary': '#ff00ff',
                '--text-highlight': '#00ffff',
                '--accent-gold': '#ffff00',
            }
        };

        this.currentTheme = 'default';
        this.initUI();
    }

    initUI() {
        // Create toggle button
        const btn = document.createElement('button');
        btn.textContent = 'Toggle Theme';
        btn.className = 'btn-primary';
        btn.style.marginTop = '10px';
        btn.onclick = () => this.cycleTheme();

        const panel = document.querySelector('.control-panel');
        if (panel) panel.appendChild(btn);
    }

    applyTheme(name) {
        const theme = this.themes[name];
        if (!theme) return;

        this.currentTheme = name;
        const root = document.documentElement;

        for (const [key, value] of Object.entries(theme)) {
            root.style.setProperty(key, value);
        }
    }

    cycleTheme() {
        const keys = Object.keys(this.themes);
        const idx = keys.indexOf(this.currentTheme);
        const next = keys[(idx + 1) % keys.length];
        this.applyTheme(next);
    }
}
