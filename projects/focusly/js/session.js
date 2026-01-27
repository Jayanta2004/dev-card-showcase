/**
 * js/session.js
 * Core Game Loop & Difficulty Logic
 */

class SessionManager {
    constructor() {
        this.timerInterval = null;
        this.loopId = null;
    }

    startSequence() {
        // 1. Update View to Breathing
        window.appState.update('view', 'breathing');
        window.appAudio.init(); // Initialize audio context on user gesture

        // 2. Run Breathing
        window.appUI.runBreathingGuide(() => {
            this.startSession();
        });
    }

    startSession() {
        // Initialize State
        const duration = window.appState.get('config.durationMinutes');
        const mode = window.appState.get('config.mode');

        window.appState.update('session.remainingSeconds', duration * 60);
        window.appState.update('session.focusScore', 100);
        window.appState.update('session.stabilityHistory', []);
        window.appState.update('session.events', []);
        window.appState.update('session.active', true);
        window.appState.update('view', 'session');

        window.appBehavior.start();
        window.appAudio.start(mode);

        this.lastTick = Date.now();
        this.loopId = requestAnimationFrame(() => this.loop());

        // Dedicated Timer Interval (coarse time)
        this.timerInterval = setInterval(() => {
            this.tickSecond();
        }, 1000);
    }

    endSession() {
        window.appState.update('session.active', false);
        window.appBehavior.stop();
        window.appAudio.stop();

        clearInterval(this.timerInterval);
        cancelAnimationFrame(this.loopId);

        // Record Stats
        const finalScore = window.appState.get('session.focusScore');
        window.appStorage.recordSession(finalScore);

        // Show Summary
        window.appUI.renderSummary();
        window.appState.update('view', 'summary');
    }

    tickSecond() {
        const current = window.appState.get('session.remainingSeconds');
        if (current <= 0) {
            this.endSession();
            return;
        }

        window.appState.update('session.remainingSeconds', current - 1);

        // History snapshot every 5s
        if (current % 5 === 0) {
            const hist = window.appState.get('session.stabilityHistory');
            hist.push(window.appState.get('session.focusScore'));
        }
    }

    loop() {
        if (!window.appState.get('session.active')) return;

        const now = Date.now();
        // const dt = now - this.lastTick;
        this.lastTick = now;

        // Continuously check idle
        window.appBehavior.checkIdle();

        // Passive Stability Decay/Regen
        this.calculateStability();

        // Distraction Logic
        this.handleAmbience(); // Check if we need to spawn distraction

        this.loopId = requestAnimationFrame(() => this.loop());
    }

    calculateStability() {
        let score = window.appState.get('session.focusScore');
        const mode = window.appState.get('config.mode');

        // Base regen if nothing bad happens (Flow state)
        // Training mode is harder to gain, easier to lose
        const regenRate = mode === 'training' ? 0.01 : 0.03;

        // Cap regen at 100
        if (score < 100) {
            score += regenRate;
        }

        window.appState.setFocusScore(score);
    }

    adjustFocus(amount, reason = null) {
        let score = window.appState.get('session.focusScore');
        const mode = window.appState.get('config.mode');

        // Multiplier for Training mode
        if (amount < 0 && mode === 'training') {
            amount *= 1.5;
        }

        score += amount;

        if (reason && amount < 0) {
            window.appState.logEvent('penalty', reason);
        }

        window.appState.setFocusScore(score);
    }

    triggerPenaltyvisual() {
        window.appUI.flashGlitch();
        window.appAudio.playGlitch();
    }

    handleAmbience() {
        const score = window.appState.get('session.focusScore');

        // 1. Distractions (Low Score)
        if (score < 70 && Math.random() < 0.005) {
            window.appUI.spawnDistraction();
        }

        // 2. Focus Checks (Randomly, every ~2-5 minutes)
        if (!this.checkTimer) this.checkTimer = Date.now();

        // Testing: More frequent for demo (every 30-50s)
        if (Date.now() - this.checkTimer > (Math.random() * 20000 + 30000)) {
            this.checkTimer = Date.now();
            window.appUI.triggerFocusCheck();
        }
    }
}

window.appSession = new SessionManager();
