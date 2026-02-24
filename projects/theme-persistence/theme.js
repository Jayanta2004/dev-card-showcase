// Theme Persistence Module
// Handles light/dark theme switching and persistence across sessions

class ThemeManager {
    constructor() {
        this.themeKey = 'devCardShowcaseTheme';
        this.defaultTheme = 'dark';
        this.init();
    }

    init() {
        // Apply saved theme immediately
        this.applyTheme(this.getSavedTheme());

        // Initialize toggle button when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.initToggleButton();
        });

        // Also listen for navbar load event
        document.addEventListener('navbarLoaded', () => {
            this.initToggleButton();
        });
    }

    getSavedTheme() {
        return localStorage.getItem(this.themeKey) || this.defaultTheme;
    }

    saveTheme(theme) {
        localStorage.setItem(this.themeKey, theme);
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || this.defaultTheme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);
        this.updateButtonIcon(newTheme);
        return newTheme;
    }

    updateButtonIcon(theme) {
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.textContent = theme === 'light' ? '🌞' : '🌙';
            btn.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
        }
    }

    initToggleButton() {
        const btn = document.getElementById('themeToggle');
        if (!btn || btn.hasAttribute('data-theme-initialized')) return;

        // Mark as initialized
        btn.setAttribute('data-theme-initialized', 'true');

        // Set initial button icon
        this.updateButtonIcon(this.getSavedTheme());

        // Add click handler
        btn.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Add keyboard support
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for potential use in other modules
window.ThemeManager = ThemeManager;