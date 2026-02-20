/**
 * js/ui.js
 * DOM Manipulation and Visuals
 */

class UIController {
    constructor() {
        this.els = {
            app: document.getElementById('app'),
            views: document.querySelectorAll('.view'),
            navStats: document.getElementById('streak-display'),
            btnSettings: document.getElementById('btn-settings'),
            modalSettings: document.getElementById('modal-settings'),
            btnCloseSettings: document.getElementById('btn-close-settings'),

            // Setup
            btnsDuration: document.querySelectorAll('.dur-btn'),
            btnsMode: document.querySelectorAll('.mode-option'),
            btnStart: document.getElementById('btn-start'),

            // Hidden layers
            distractionLayer: document.getElementById('distraction-layer'),

            // Session
            scoreDisplay: document.getElementById('session-score'),
            timerDisplay: document.getElementById('session-timer'),
            liveStatus: document.getElementById('live-feedback'),
            focusRing: document.querySelector('.focus-ring-inner'),

            // Breathing
            breathText: document.getElementById('breath-instruction'),
            breathCircle: document.querySelector('.breathing-circle'),

            // Summary
            finalScore: document.getElementById('final-score'),
            sumDuration: document.getElementById('summary-duration'),
            sumInterrupt: document.getElementById('summary-interruptions'),
            sumDrops: document.getElementById('summary-drops'),
            chartArea: document.getElementById('session-chart'),
            btnHome: document.getElementById('btn-home')
        };

        this.initListeners();
        this.bindState();
    }

    initListeners() {
        // Navigation / Setup
        this.els.btnsDuration.forEach(btn => {
            btn.addEventListener('click', () => {
                this.els.btnsDuration.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                window.appState.update('config.durationMinutes', parseInt(btn.dataset.time));
            });
        });

        this.els.btnsMode.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                this.els.btnsMode.forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                window.appState.update('config.mode', target.dataset.mode);
            });
        });

        this.els.btnStart.addEventListener('click', () => {
            const intention = document.getElementById('input-intention').value;
            if (intention) window.appState.update('session.intention', intention);
            window.appSession.startSequence();
        });

        this.els.btnHome.addEventListener('click', () => {
            window.appState.update('view', 'setup');
        });

        // Settings Modal
        this.els.btnSettings.addEventListener('click', () => {
            this.els.modalSettings.classList.add('active');
        });

        this.els.btnCloseSettings.addEventListener('click', () => {
            this.els.modalSettings.classList.remove('active');
        });

        // Toggle Settings
        document.getElementById('setting-sound').addEventListener('change', (e) => {
            const s = window.appState.get('config.settings');
            s.sound = e.target.checked;
            window.appState.update('config.settings', s);
            window.appStorage.save();
        });

        document.getElementById('setting-strict').addEventListener('change', (e) => {
            const s = window.appState.get('config.settings');
            s.strict = e.target.checked;
            window.appState.update('config.settings', s);
            window.appStorage.save();
        });
    }

    bindState() {
        window.appState.subscribe('view', (viewName) => this.switchView(viewName));
        window.appState.subscribe('session.remainingSeconds', (sec) => this.updateTimer(sec));
        window.appState.subscribe('session.focusScore', (score) => this.updateScore(score));
        window.appState.subscribe('user.streak', (streak) => {
            this.els.navStats.innerText = `🔥 ${streak}`;
        });
        window.appState.subscribe('event', (evt) => {
            if (evt.type === 'penalty') this.flashGlitch();
        });
    }

    switchView(viewName) {
        this.els.views.forEach(v => {
            v.classList.remove('active');
            if (v.id === `view-${viewName}`) {
                setTimeout(() => v.classList.add('active'), 50);
            }
        });
    }

    updateTimer(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        this.els.timerDisplay.innerText = `${m}:${s}`;
    }

    updateScore(score) {
        // Visual damping done via CSS transition, just update DOM
        this.els.scoreDisplay.innerText = Math.round(score);

        // Update Ring Color/Scale
        const ring = this.els.focusRing;
        if (score > 80) {
            this.els.app.className = 'app-container state-good';
            this.els.liveStatus.innerText = "Excellent Focus";
            this.els.liveStatus.style.color = "var(--focus-high)";
        } else if (score > 50) {
            this.els.app.className = 'app-container state-warn';
            this.els.liveStatus.innerText = "Focus Drifting...";
            this.els.liveStatus.style.color = "var(--focus-med)";
        } else {
            this.els.app.className = 'app-container state-crit';
            this.els.liveStatus.innerText = "CRITICAL STABILITY";
            this.els.liveStatus.style.color = "var(--focus-low)";
        }

        // Show Intention
        const intention = window.appState.get('session.intention');
        const intEl = document.getElementById('display-intention');
        if (intention && intEl.innerText !== intention) {
            intEl.innerText = intention;
        }

        const scale = 0.8 + (score / 100) * 0.2; // 0.8 to 1.0
        ring.style.transform = `scale(${scale})`;
    }

    flashGlitch() {
        document.body.classList.add('glitch-active');
        setTimeout(() => document.body.classList.remove('glitch-active'), 400);
    }

    // Breathing Animation Sequence
    runBreathingGuide(callback) {
        const c = this.els.breathCircle;
        const t = this.els.breathText;

        // 4-7-8 method (simplified for demo: 4-4-4)
        const cycle = () => {
            c.className = 'breathing-circle inhale';
            t.innerText = 'Inhale';

            setTimeout(() => {
                c.className = 'breathing-circle hold';
                t.innerText = 'Hold';

                setTimeout(() => {
                    c.className = 'breathing-circle exhale';
                    t.innerText = 'Exhale';
                }, 4000); // Hold time
            }, 4000); // Inhale time
        };

        cycle();
        // Just one cycle for demo speed, usually repeat
        setTimeout(callback, 12000 + 1000);
    }

    renderSummary() {
        const sess = window.appState.state.session;
        this.els.finalScore.innerText = Math.round(sess.focusScore);
        this.els.sumDuration.innerText = window.appState.state.config.durationMinutes + 'm';

        const drops = sess.events.filter(e => e.type === 'penalty').length;
        this.els.sumDrops.innerText = drops;
        this.els.sumInterrupt.innerText = sess.events.filter(e => e.type === 'tab_switch').length;

        // Render mini-chart
        this.els.chartArea.innerHTML = '';
        // Sample history (max 30 bars)
        const step = Math.ceil(sess.stabilityHistory.length / 30);
        for (let i = 0; i < sess.stabilityHistory.length; i += step) {
            const val = sess.stabilityHistory[i];
            const bar = document.createElement('div');
            bar.className = 'chart-bar ' + (val > 80 ? 'good' : val > 50 ? 'med' : 'bad');
            bar.style.height = val + '%';
            this.els.chartArea.appendChild(bar);
        }
    }

    spawnDistraction() {
        if (Math.random() > 0.3) return; // Don't always spawn

        const el = document.createElement('div');
        el.className = 'distraction-particle';
        const x = Math.random() * 80 + 10; // 10-90%
        const y = Math.random() * 80 + 10;

        el.style.left = x + '%';
        el.style.top = y + '%';

        this.els.distractionLayer.appendChild(el);

        // Interaction
        el.addEventListener('click', () => {
            el.remove();
            // Bonus for catching distraction? Or just removal.
            // Let's settle on: Distractions fade after 3s, if clicked, small boost.
            window.appSession.adjustFocus(2);
        });

        setTimeout(() => {
            if (el.parentNode) el.remove();
        }, 3000);
    }

    triggerFocusCheck() {
        const check = document.getElementById('focus-check');
        check.classList.remove('hidden');

        // Timeout to fail
        const failTimer = setTimeout(() => {
            check.classList.add('hidden');
            window.appSession.adjustFocus(-5, 'Missed Focus Check');
            window.appAudio.playGlitch();
        }, 4000);

        check.onclick = () => {
            clearTimeout(failTimer);
            check.classList.add('hidden');
            window.appSession.adjustFocus(5); // Bonus
        };
    }
}

window.appUI = new UIController();
