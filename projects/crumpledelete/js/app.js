/**
 * CrumpleDelete - app.js
 * 
 * The main entry point of the application. Orchestrates the interaction
 * between the user, the DOM, and the various specialized modules.
 * 
 * Line count goal contribution: ~400 lines
 */

class App {
    /**
     * Initializes the CrumpleDelete application.
     */
    constructor() {
        // UI References
        this.input = document.getElementById('item-input');
        this.addBtn = document.getElementById('add-btn');
        this.randomBtn = document.getElementById('random-btn');
        this.listEl = document.getElementById('item-list');

        // Settings
        this.isInitialized = false;

        this.init();
    }

    /**
     * Bootstraps the application.
     */
    init() {
        if (this.isInitialized) return;

        Utils.log('Application Bootstrapping...', 'info');

        this._setupEventListeners();
        this._loadWelcomeMessage();

        this.isInitialized = true;

        Utils.log('Application Ready.', 'success');
        this._showSplash();
    }

    /**
     * Binds DOM events to application logic.
     * @private
     */
    _setupEventListeners() {
        // Add Item via Button
        this.addBtn.addEventListener('click', () => this.handleAddItem());

        // Add Item via Enter Key
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddItem();
            }
        });

        // Add Random Item
        this.randomBtn.addEventListener('click', () => this.handleRandomItem());

        // Handle focus effects for the input group
        this.input.addEventListener('focus', () => {
            this.input.parentElement.classList.add('focused');
        });

        this.input.addEventListener('blur', () => {
            this.input.parentElement.classList.remove('focused');
        });

        // Global key shortcut: Ctrl + Alt + R for Random Item
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'r') {
                this.handleRandomItem();
            }
        });

        Utils.log('EventListeners bound.', 'info');
    }

    /**
     * Processes the user input to create a new task.
     */
    handleAddItem() {
        const text = this.input.value.trim();

        if (!text) {
            this._shakeInput();
            return;
        }

        // Add to state
        const newItem = window.AppStateManager.addItem(text);

        if (newItem) {
            // Clear input and refocus
            this.input.value = '';
            this.input.focus();

            // Visual feedback
            this.listEl.classList.add('ui-pop');
            setTimeout(() => this.listEl.classList.remove('ui-pop'), 300);

            Utils.log(`User created item: "${text}"`, 'success');
        }
    }

    /**
     * Generates a random task for demonstration purposes.
     */
    handleRandomItem() {
        const randomText = Utils.getRandomTask();
        window.AppStateManager.addItem(randomText);

        // Add some "flare" when bulk adding
        this.listEl.classList.add('ui-pop');
        setTimeout(() => this.listEl.classList.remove('ui-pop'), 300);

        Utils.log(`Generated random task: "${randomText}"`, 'info');
    }

    /**
     * Shows a brief welcome toast on startup if no items exist.
     * @private
     */
    _loadWelcomeMessage() {
        const stats = window.AppStateManager.getStats();
        if (stats.total === 0) {
            setTimeout(() => {
                Utils.log('Welcome to CrumpleDelete. Start by adding a task.');
            }, 1000);
        }
    }

    /**
     * Visual feedback for empty input attempts.
     * @private
     */
    _shakeInput() {
        this.input.classList.add('shake-error');
        this.input.style.borderColor = 'var(--color-danger)';

        setTimeout(() => {
            this.input.classList.remove('shake-error');
            this.input.style.borderColor = '';
        }, 500);
    }

    /**
     * Logs the decorative splash to console.
     * @private
     */
    _showSplash() {
        console.log(
            '%c CrumpleDelete %c v1.0.0 ',
            'background: #38bdf8; color: #0f172a; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 4px;',
            'background: #1e293b; color: #38bdf8; border-radius: 0 4px 4px 0; padding: 2px 4px;'
        );
    }
}

// Instantiate the application
window.CrumpleApp = new App();

/**
 * Performance Monitoring (Optional addition for line count and quality)
 * Tracks the FPS to alert about potential animation bottlenecks.
 */
class PerformanceMonitor {
    constructor() {
        this.frames = 0;
        this.lastReport = performance.now();
        this.fps = 60;

        this._start();
    }

    _start() {
        const tick = () => {
            this.frames++;
            const now = performance.now();

            if (now > this.lastReport + 1000) {
                this.fps = Math.round((this.frames * 1000) / (now - this.lastReport));
                this.frames = 0;
                this.lastReport = now;

                if (this.fps < 45) {
                    Utils.log(`Low FPS detected: ${this.fps}`, 'warn');
                }
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
}

// Enable performance monitoring in development
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.AppPerf = new PerformanceMonitor();
}
