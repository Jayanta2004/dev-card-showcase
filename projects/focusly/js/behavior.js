/**
 * js/behavior.js
 * User Input & Behavior Analysis
 */

class BehaviorEngine {
    constructor() {
        this.lastInputTime = Date.now();
        this.erraticCount = 0;
        this.active = false;

        this.inputThresholds = {
            idle: 15000, // 15s no input
            erratic: 5   // 5 rapid clicks
        };

        this.initListeners();
    }

    start() {
        this.active = true;
        this.lastInputTime = Date.now();
        this.erraticCount = 0;
    }

    stop() {
        this.active = false;
    }

    initListeners() {
        // Debounced input tracker
        const resetIdle = () => {
            if (!this.active) return;
            this.lastInputTime = Date.now();
        };

        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('keydown', resetIdle);

        // Visibility API (Tab Switching)
        document.addEventListener('visibilitychange', () => {
            if (!this.active) return;

            if (document.hidden) {
                this.handleTabSwitch();
            } else {
                window.appState.logEvent('tab_return');
            }
        });

        // Erratic Click Detection
        window.addEventListener('click', (e) => {
            if (!this.active) return;

            resetIdle();
            this.erraticCount++;
            setTimeout(() => {
                if (this.erraticCount > 0) this.erraticCount--;
            }, 1000);

            if (this.erraticCount > this.inputThresholds.erratic) {
                this.handleErraticBehavior();
            }
        });

        // Mouse out of window (Intent to leave)
        document.body.addEventListener('mouseleave', () => {
            if (this.active) window.appState.logEvent('cursor_left_window');
        });
    }

    checkIdle() {
        if (!this.active) return;

        const idleTime = Date.now() - this.lastInputTime;
        if (idleTime > this.inputThresholds.idle) {
            // Penalize for extended idle (zoning out)
            // But be careful - mostly just degrade focus slowly.
            window.appSession.adjustFocus(-0.5); // Slow decay
        }
    }

    handleTabSwitch() {
        window.appState.logEvent('tab_switch');
        // Immediate heavy penalty
        window.appSession.adjustFocus(-15);
        window.appSession.triggerPenaltyvisual();
    }

    handleErraticBehavior() {
        window.appState.logEvent('erratic_input');
        window.appSession.adjustFocus(-5, 'Erratic Behavior detected');
        this.erraticCount = 0;
    }
}

window.appBehavior = new BehaviorEngine();
