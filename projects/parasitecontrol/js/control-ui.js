// Control UI Module
// Manages the control window interface and user interactions

class ControlUI {
    constructor(messenger, stateManager) {
        this.messenger = messenger;
        this.stateManager = stateManager;
        this.elements = {};
        this.feedbackTimeout = null;

        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.setupConnectionMonitoring();
        this.updateUIFromState();
    }

    cacheElements() {
        this.elements = {
            openDisplayBtn: document.getElementById('openDisplayBtn'),
            connectionStatus: document.getElementById('connectionStatus'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),

            bgColor: document.getElementById('bgColor'),
            bgGradientStart: document.getElementById('bgGradientStart'),
            bgGradientEnd: document.getElementById('bgGradientEnd'),
            applyGradientBtn: document.getElementById('applyGradientBtn'),
            clearGradientBtn: document.getElementById('clearGradientBtn'),

            patternNone: document.getElementById('patternNone'),
            patternDots: document.getElementById('patternDots'),
            patternLines: document.getElementById('patternLines'),
            patternGrid: document.getElementById('patternGrid'),
            patternWaves: document.getElementById('patternWaves'),

            textContent: document.getElementById('textContent'),
            textSize: document.getElementById('textSize'),
            textSizeValue: document.getElementById('textSizeValue'),
            textColor: document.getElementById('textColor'),
            textGlow: document.getElementById('textGlow'),

            positionCenter: document.getElementById('positionCenter'),
            positionTop: document.getElementById('positionTop'),
            positionBottom: document.getElementById('positionBottom'),

            layoutSingle: document.getElementById('layoutSingle'),
            layoutGrid: document.getElementById('layoutGrid'),
            layoutFlex: document.getElementById('layoutFlex'),

            blurAmount: document.getElementById('blurAmount'),
            blurValue: document.getElementById('blurValue'),
            brightness: document.getElementById('brightness'),
            brightnessValue: document.getElementById('brightnessValue'),
            rotateEffect: document.getElementById('rotateEffect'),
            scaleEffect: document.getElementById('scaleEffect'),

            resetBtn: document.getElementById('resetBtn'),
            feedbackToast: document.getElementById('feedbackToast')
        };
    }

    attachEventListeners() {
        if (this.elements.openDisplayBtn) {
            this.elements.openDisplayBtn.addEventListener('click', () => this.openDisplay());
        }

        if (this.elements.bgColor) {
            this.elements.bgColor.addEventListener('input', (e) => this.updateBackground({ color: e.target.value }));
        }

        if (this.elements.applyGradientBtn) {
            this.elements.applyGradientBtn.addEventListener('click', () => this.applyGradient());
        }

        if (this.elements.clearGradientBtn) {
            this.elements.clearGradientBtn.addEventListener('click', () => this.clearGradient());
        }

        const patternButtons = [
            { el: this.elements.patternNone, value: null },
            { el: this.elements.patternDots, value: 'dots' },
            { el: this.elements.patternLines, value: 'lines' },
            { el: this.elements.patternGrid, value: 'grid' },
            { el: this.elements.patternWaves, value: 'waves' }
        ];

        patternButtons.forEach(({ el, value }) => {
            if (el) {
                el.addEventListener('click', () => this.updateBackground({ pattern: value }));
            }
        });

        if (this.elements.textContent) {
            this.elements.textContent.addEventListener('input', (e) => this.updateText({ content: e.target.value }));
        }

        if (this.elements.textSize) {
            this.elements.textSize.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                this.updateText({ size });
                if (this.elements.textSizeValue) {
                    this.elements.textSizeValue.textContent = size;
                }
            });
        }

        if (this.elements.textColor) {
            this.elements.textColor.addEventListener('input', (e) => this.updateText({ color: e.target.value }));
        }

        if (this.elements.textGlow) {
            this.elements.textGlow.addEventListener('change', (e) => this.updateText({ glow: e.target.checked }));
        }

        const positionButtons = [
            { el: this.elements.positionCenter, value: 'center' },
            { el: this.elements.positionTop, value: 'top' },
            { el: this.elements.positionBottom, value: 'bottom' }
        ];

        positionButtons.forEach(({ el, value }) => {
            if (el) {
                el.addEventListener('click', () => this.updateText({ position: value }));
            }
        });

        const layoutButtons = [
            { el: this.elements.layoutSingle, value: 'single' },
            { el: this.elements.layoutGrid, value: 'grid' },
            { el: this.elements.layoutFlex, value: 'flex' }
        ];

        layoutButtons.forEach(({ el, value }) => {
            if (el) {
                el.addEventListener('click', () => this.updateLayout({ mode: value }));
            }
        });

        if (this.elements.blurAmount) {
            this.elements.blurAmount.addEventListener('input', (e) => {
                const blur = parseInt(e.target.value);
                this.updateEffects({ blur });
                if (this.elements.blurValue) {
                    this.elements.blurValue.textContent = blur;
                }
            });
        }

        if (this.elements.brightness) {
            this.elements.brightness.addEventListener('input', (e) => {
                const brightness = parseInt(e.target.value);
                this.updateEffects({ brightness });
                if (this.elements.brightnessValue) {
                    this.elements.brightnessValue.textContent = brightness;
                }
            });
        }

        if (this.elements.rotateEffect) {
            this.elements.rotateEffect.addEventListener('change', (e) => this.updateEffects({ rotation: e.target.checked }));
        }

        if (this.elements.scaleEffect) {
            this.elements.scaleEffect.addEventListener('change', (e) => this.updateEffects({ scale: e.target.checked }));
        }

        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.reset());
        }
    }

    setupConnectionMonitoring() {
        this.messenger.onConnectionChange((connected) => {
            this.updateConnectionStatus(connected);
        });
    }

    updateConnectionStatus(connected) {
        const status = this.elements.connectionStatus;
        const indicator = this.elements.statusIndicator;
        const text = this.elements.statusText;

        if (!status || !indicator || !text) return;

        status.className = 'connection-status';
        indicator.className = 'status-indicator';

        if (connected) {
            status.classList.add('connected');
            indicator.classList.add('status-connected');
            text.textContent = 'Display Connected';
        } else {
            status.classList.add('disconnected');
            indicator.classList.add('status-disconnected');
            text.textContent = 'Display Disconnected';
        }
    }

    openDisplay() {
        const displayWindow = this.messenger.openWindow(
            'display.html',
            'ParasiteControl_Display',
            'width=800,height=600'
        );

        if (displayWindow) {
            this.showFeedback('Display window opened');

            setTimeout(() => {
                const state = this.stateManager.getState();
                this.messenger.send('parasitecontrol:fullsync', state);
            }, 1000);
        } else {
            this.showFeedback('Failed to open display window');
        }
    }

    updateBackground(updates) {
        this.stateManager.setState({ background: updates });
        this.messenger.send('parasitecontrol:update', { background: updates });
        this.showFeedback('Background updated');
        this.updateUIFromState();
    }

    applyGradient() {
        const start = this.elements.bgGradientStart?.value || '#667eea';
        const end = this.elements.bgGradientEnd?.value || '#764ba2';

        const gradient = `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
        this.updateBackground({ gradient, color: null });
    }

    clearGradient() {
        this.updateBackground({ gradient: null });
    }

    updateText(updates) {
        this.stateManager.setState({ text: updates });
        this.messenger.send('parasitecontrol:update', { text: updates });
        this.showFeedback('Text updated');
        this.updateUIFromState();
    }

    updateLayout(updates) {
        this.stateManager.setState({ layout: updates });
        this.messenger.send('parasitecontrol:update', { layout: updates });
        this.showFeedback('Layout updated');
        this.updateUIFromState();
    }

    updateEffects(updates) {
        this.stateManager.setState({ effects: updates });
        this.messenger.send('parasitecontrol:update', { effects: updates });
        this.showFeedback('Effects updated');
        this.updateUIFromState();
    }

    reset() {
        this.stateManager.reset();
        this.messenger.send('parasitecontrol:reset', {});
        this.showFeedback('Reset to defaults');
        this.updateUIFromState();
    }

    updateUIFromState() {
        const state = this.stateManager.getState();

        if (this.elements.bgColor) {
            this.elements.bgColor.value = state.background.color || '#1a1a2e';
        }

        if (this.elements.textContent) {
            this.elements.textContent.value = state.text.content || '';
        }

        if (this.elements.textSize) {
            this.elements.textSize.value = state.text.size || 64;
            if (this.elements.textSizeValue) {
                this.elements.textSizeValue.textContent = state.text.size || 64;
            }
        }

        if (this.elements.textColor) {
            this.elements.textColor.value = state.text.color || '#ffffff';
        }

        if (this.elements.textGlow) {
            this.elements.textGlow.checked = state.text.glow || false;
        }

        if (this.elements.blurAmount) {
            this.elements.blurAmount.value = state.effects.blur || 0;
            if (this.elements.blurValue) {
                this.elements.blurValue.textContent = state.effects.blur || 0;
            }
        }

        if (this.elements.brightness) {
            this.elements.brightness.value = state.effects.brightness || 100;
            if (this.elements.brightnessValue) {
                this.elements.brightnessValue.textContent = state.effects.brightness || 100;
            }
        }

        if (this.elements.rotateEffect) {
            this.elements.rotateEffect.checked = state.effects.rotation || false;
        }

        if (this.elements.scaleEffect) {
            this.elements.scaleEffect.checked = state.effects.scale || false;
        }

        this.updateActiveButtons(state);
    }

    updateActiveButtons(state) {
        const patternMap = {
            null: this.elements.patternNone,
            'dots': this.elements.patternDots,
            'lines': this.elements.patternLines,
            'grid': this.elements.patternGrid,
            'waves': this.elements.patternWaves
        };

        Object.values(patternMap).forEach(el => el?.classList.remove('active'));
        patternMap[state.background.pattern]?.classList.add('active');

        const positionMap = {
            'center': this.elements.positionCenter,
            'top': this.elements.positionTop,
            'bottom': this.elements.positionBottom
        };

        Object.values(positionMap).forEach(el => el?.classList.remove('active'));
        positionMap[state.text.position]?.classList.add('active');

        const layoutMap = {
            'single': this.elements.layoutSingle,
            'grid': this.elements.layoutGrid,
            'flex': this.elements.layoutFlex
        };

        Object.values(layoutMap).forEach(el => el?.classList.remove('active'));
        layoutMap[state.layout.mode]?.classList.add('active');
    }

    showFeedback(message) {
        const toast = this.elements.feedbackToast;
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');

        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
        }

        this.feedbackTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
}

if (typeof window !== 'undefined') {
    window.ControlUI = ControlUI;
}
