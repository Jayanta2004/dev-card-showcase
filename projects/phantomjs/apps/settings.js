class SettingsApp {
    constructor(container, winId) {
        this.container = container;
        this.container.innerHTML = `
            <div class="app-settings">
                <h3>SYSTEM THEME</h3>
                <div class="theme-options">
                    <button class="theme-btn" data-color="#0f0">MATRIX GREEN</button>
                    <button class="theme-btn" data-color="#ff9900">AMBER RETRO</button>
                    <button class="theme-btn" data-color="#00daff">CYBER BLUE</button>
                    <button class="theme-btn" data-color="#ff0055">RED ALERT</button>
                </div>
                <h3>AUDIO</h3>
                <label><input type="checkbox" checked> SYSTEM SOUNDS</label>
            </div>
        `;

        this.container.querySelectorAll('.theme-btn').forEach(btn => {
            btn.onclick = () => this.setTheme(btn.dataset.color);
        });
    }

    setTheme(color) {
        document.documentElement.style.setProperty('--term-green', color);
        document.documentElement.style.setProperty('--term-glow', color);
        document.documentElement.style.setProperty('--border-color', color);
    }
}

window.SettingsApp = SettingsApp;
