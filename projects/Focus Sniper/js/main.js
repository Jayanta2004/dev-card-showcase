// ==================== MAIN APPLICATION ====================

/**
 * Global application controller
 * Handles initialization, error handling, and app-wide utilities
 */

const App = {
    version: '1.0.0',
    isInitialized: false,
    debugMode: false,

    /**
     * Initialize the application
     */
    init() {
        if (this.isInitialized) {
            console.warn('App already initialized');
            return;
        }

        console.log(`%cFocus Sniper v${this.version}`, 'color: #00ff00; font-size: 20px; font-weight: bold;');
        console.log('%cDistraction Interference Shooter', 'color: #00ffff; font-size: 14px;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #00ff00;');

        // Check browser compatibility
        this.checkCompatibility();

        // Setup global error handling
        this.setupErrorHandling();

        // Setup performance monitoring
        this.setupPerformanceMonitoring();

        // Setup visibility change handling
        this.setupVisibilityHandling();

        // Initialize audio on first interaction
        this.setupAudioInit();

        // Load saved settings
        this.loadSettings();

        // Setup accessibility features
        this.setupAccessibility();

        // Mark as initialized
        this.isInitialized = true;

        console.log('%cApp initialized successfully!', 'color: #00ff00;');
    },

    /**
     * Check browser compatibility
     */
    checkCompatibility() {
        const features = {
            'Web Audio API': window.AudioContext || window.webkitAudioContext,
            'localStorage': typeof Storage !== 'undefined',
            'requestAnimationFrame': window.requestAnimationFrame,
            'CSS Grid': CSS.supports('display', 'grid'),
            'CSS Flexbox': CSS.supports('display', 'flex')
        };

        const missing = Object.entries(features)
            .filter(([, supported]) => !supported)
            .map(([feature]) => feature);

        if (missing.length > 0) {
            console.warn('Some features may not be available:', missing);
            this.showCompatibilityWarning(missing);
        } else {
            console.log('%c✓ All features supported', 'color: #00ff00;');
        }
    },

    /**
     * Show compatibility warning
     */
    showCompatibilityWarning(missing) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 170, 0, 0.95);
            color: black;
            padding: 15px 30px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            z-index: 10000;
            max-width: 80%;
            text-align: center;
        `;
        warning.innerHTML = `
            ⚠️ Browser Compatibility Warning<br>
            <small>Some features may not work: ${missing.join(', ')}</small>
        `;

        document.body.appendChild(warning);

        setTimeout(() => {
            warning.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => warning.remove(), 500);
        }, 5000);
    },

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            
            if (this.debugMode) {
                this.showErrorNotification(e.error.message);
            }

            // Prevent game from breaking
            if (Game.state === 'playing') {
                console.log('Attempting to recover from error...');
            }
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    },

    /**
     * Show error notification
     */
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = `Error: ${message}`;

        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
    },

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if (!this.debugMode) return;

        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 60;

        const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            const delta = currentTime - lastTime;

            if (delta >= 1000) {
                fps = Math.round((frameCount * 1000) / delta);
                frameCount = 0;
                lastTime = currentTime;

                if (fps < 30) {
                    console.warn(`Low FPS detected: ${fps}`);
                }
            }

            requestAnimationFrame(updateFPS);
        };

        updateFPS();
    },

    /**
     * Setup visibility change handling
     */
    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden
                if (Game.state === 'playing') {
                    console.log('Page hidden, pausing game...');
                    Game.pauseGame();
                }
            } else {
                // Page is visible
                console.log('Page visible');
            }
        });

        // Also handle window blur/focus
        window.addEventListener('blur', () => {
            if (Game.state === 'playing') {
                Game.pauseGame();
            }
        });
    },

    /**
     * Setup audio initialization on first user interaction
     */
    setupAudioInit() {
        const initAudio = () => {
            if (!AudioManager.context) {
                AudioManager.init();
                console.log('Audio initialized on user interaction');
            }
        };

        // Listen for first click or key press
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });
    },

    /**
     * Load saved settings
     */
    loadSettings() {
        const settings = Utils.loadFromStorage('focusSniper_settings', {
            soundEnabled: true,
            distractionDensity: 5,
            gameMode: 'normal',
            screenShake: true
        });

        // Apply settings
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.checked = settings.soundEnabled;
            AudioManager.setEnabled(settings.soundEnabled);
        }

        const densitySlider = document.getElementById('distractionDensity');
        if (densitySlider) {
            densitySlider.value = settings.distractionDensity;
            DistractionManager.setDensity(settings.distractionDensity);
        }

        const modeSelect = document.getElementById('gameMode');
        if (modeSelect) {
            modeSelect.value = settings.gameMode;
        }

        const shakeToggle = document.getElementById('screenShakeToggle');
        if (shakeToggle) {
            shakeToggle.checked = settings.screenShake;
            Game.screenShakeEnabled = settings.screenShake;
        }

        console.log('Settings loaded:', settings);
    },

    /**
     * Save settings
     */
    saveSettings() {
        const settings = {
            soundEnabled: document.getElementById('soundToggle')?.checked ?? true,
            distractionDensity: parseInt(document.getElementById('distractionDensity')?.value ?? 5),
            gameMode: document.getElementById('gameMode')?.value ?? 'normal',
            screenShake: document.getElementById('screenShakeToggle')?.checked ?? true
        };

        Utils.saveToStorage('focusSniper_settings', settings);
        console.log('Settings saved:', settings);
    },

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add keyboard hints
        document.addEventListener('keydown', (e) => {
            if (e.key === 'h' && e.ctrlKey) {
                e.preventDefault();
                this.showKeyboardHelp();
            }
        });

        // Add focus indicators for keyboard navigation
        document.querySelectorAll('button, input, select').forEach(el => {
            el.addEventListener('focus', function() {
                this.style.outline = '2px solid var(--primary-color)';
                this.style.outlineOffset = '2px';
            });

            el.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    },

    /**
     * Show keyboard help
     */
    showKeyboardHelp() {
        const help = document.createElement('div');
        help.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 15, 0.98);
            border: 2px solid var(--primary-color);
            border-radius: 15px;
            padding: 30px;
            z-index: 10000;
            color: white;
            font-family: 'Courier New', monospace;
            max-width: 500px;
        `;

        help.innerHTML = `
            <h2 style="color: var(--primary-color); margin-bottom: 20px;">⌨️ Keyboard Shortcuts</h2>
            <ul style="list-style: none; padding: 0; line-height: 2;">
                <li><strong>ESC</strong> - Pause/Resume game</li>
                <li><strong>SPACE</strong> - Shoot (when on target)</li>
                <li><strong>CTRL + H</strong> - Show this help</li>
                <li><strong>TAB</strong> - Navigate menu items</li>
            </ul>
            <button id="closeHelpBtn" style="
                margin-top: 20px;
                padding: 10px 20px;
                background: var(--primary-color);
                border: none;
                border-radius: 8px;
                color: black;
                font-weight: bold;
                cursor: pointer;
            ">Close</button>
        `;

        document.body.appendChild(help);

        document.getElementById('closeHelpBtn').addEventListener('click', () => {
            help.remove();
        });

        // Close on ESC
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                help.remove();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    },

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
        console.log('%cDebug mode enabled', 'color: #ffaa00; font-weight: bold;');
        
        // Add debug info display
        const debugInfo = document.createElement('div');
        debugInfo.id = 'debugInfo';
        debugInfo.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            border-radius: 5px;
        `;

        document.body.appendChild(debugInfo);

        // Update debug info
        setInterval(() => {
            if (Game.state === 'playing') {
                debugInfo.innerHTML = `
                    FPS: ${Math.round(1000 / 16.67)}<br>
                    Targets: ${TargetManager.getCount()}<br>
                    Distractions: ${DistractionManager.getCount()}<br>
                    Score: ${StatsManager.score}<br>
                    Focus: ${Math.floor(StatsManager.focus)}%<br>
                    Combo: ${StatsManager.combo}x
                `;
            }
        }, 100);
    }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Save settings before unload
window.addEventListener('beforeunload', () => {
    App.saveSettings();
});

// Expose to console for debugging
window.FocusSniperDebug = {
    enableDebug: () => App.enableDebugMode(),
    getStats: () => StatsManager.getSummary(),
    addScore: (amount) => { StatsManager.score += amount; },
    addTime: (seconds) => { Game.timeRemaining += seconds; },
    spawnTarget: () => TargetManager.spawnTarget(),
    spawnDistraction: (type) => DistractionManager.spawnDistraction(type),
    clearAll: () => {
        TargetManager.clearAll();
        DistractionManager.clearAll();
        ParticleSystem.clear();
    }
};

// Console easter egg
console.log(`
%c╔═══════════════════════════════════════╗
║                                       ║
║        🎯 FOCUS SNIPER 🎯            ║
║   Distraction Interference Shooter    ║
║                                       ║
║     Type FocusSniperDebug in         ║
║     console for debug commands        ║
║                                       ║
╚═══════════════════════════════════════╝
`, 'color: #00ff00; font-family: monospace;');
