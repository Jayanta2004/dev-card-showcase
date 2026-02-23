// Display UI Module
// Manages the display window rendering and visual updates

class DisplayUI {
    constructor(messenger, stateManager) {
        this.messenger = messenger;
        this.stateManager = stateManager;
        this.elements = {};

        this.init();
    }

    init() {
        this.cacheElements();
        this.setupMessageHandlers();
        this.setupConnectionMonitoring();
        this.announcePresence();
        this.renderFromState();
    }

    cacheElements() {
        this.elements = {
            container: document.getElementById('displayContainer'),
            background: document.getElementById('backgroundLayer'),
            content: document.getElementById('contentLayer'),
            text: document.getElementById('displayText'),
            effect: document.getElementById('effectLayer'),
            statusBadge: document.getElementById('statusBadge'),
            statusText: document.getElementById('statusText')
        };
    }

    setupMessageHandlers() {
        this.messenger.on('parasitecontrol:update', (payload) => {
            this.handleUpdate(payload);
        });

        this.messenger.on('parasitecontrol:fullsync', (payload) => {
            this.handleFullSync(payload);
        });

        this.messenger.on('parasitecontrol:reset', () => {
            this.handleReset();
        });
    }

    setupConnectionMonitoring() {
        this.messenger.onConnectionChange((connected) => {
            this.updateConnectionBadge(connected);
        });
    }

    announcePresence() {
        setTimeout(() => {
            this.messenger.send('parasitecontrol:handshake', { role: 'display' });
        }, 100);
    }

    handleUpdate(payload) {
        this.stateManager.setState(payload);
        this.renderFromState();
    }

    handleFullSync(payload) {
        this.stateManager.state = payload;
        this.renderFromState();
    }

    handleReset() {
        this.stateManager.reset();
        this.renderFromState();
    }

    renderFromState() {
        const state = this.stateManager.getState();

        this.renderBackground(state.background);
        this.renderText(state.text);
        this.renderLayout(state.layout);
        this.renderEffects(state.effects);
    }

    renderBackground(background) {
        const bg = this.elements.background;
        if (!bg) return;

        bg.className = 'background-layer';

        if (background.gradient) {
            bg.style.background = background.gradient;
        } else if (background.color) {
            bg.style.background = background.color;
        }

        if (background.pattern) {
            bg.classList.add(`pattern-${background.pattern}`);
        }
    }

    renderText(text) {
        const textEl = this.elements.text;
        if (!textEl) return;

        textEl.textContent = text.content || '';
        textEl.style.fontSize = `${text.size}px`;
        textEl.style.color = text.color;

        textEl.className = 'display-text';

        if (text.glow) {
            textEl.classList.add('text-glow');
        }

        const content = this.elements.content;
        if (!content) return;

        content.style.alignItems = this.getAlignItems(text.position);
    }

    getAlignItems(position) {
        switch (position) {
            case 'top':
                return 'flex-start';
            case 'bottom':
                return 'flex-end';
            case 'center':
            default:
                return 'center';
        }
    }

    renderLayout(layout) {
        const content = this.elements.content;
        if (!content) return;

        content.innerHTML = '';

        if (layout.mode === 'single') {
            const textEl = document.createElement('div');
            textEl.id = 'displayText';
            textEl.className = 'display-text';
            content.appendChild(textEl);
            this.elements.text = textEl;

            const state = this.stateManager.getState();
            this.renderText(state.text);

        } else if (layout.mode === 'grid') {
            const grid = document.createElement('div');
            grid.className = 'layout-grid';

            for (let i = 0; i < 9; i++) {
                const item = document.createElement('div');
                item.className = 'grid-item';
                item.textContent = i + 1;
                grid.appendChild(item);
            }

            content.appendChild(grid);

        } else if (layout.mode === 'flex') {
            const flex = document.createElement('div');
            flex.className = 'layout-flex';

            for (let i = 0; i < 4; i++) {
                const item = document.createElement('div');
                item.className = 'flex-item';
                item.textContent = `Item ${i + 1}`;
                flex.appendChild(item);
            }

            content.appendChild(flex);
        }
    }

    renderEffects(effects) {
        const effect = this.elements.effect;
        const container = this.elements.container;

        if (!effect || !container) return;

        effect.className = 'effect-layer';
        container.className = 'display-container';

        if (effects.blur > 0) {
            effect.style.backdropFilter = `blur(${effects.blur}px)`;
        } else {
            effect.style.backdropFilter = 'none';
        }

        if (effects.brightness !== 100) {
            container.style.filter = `brightness(${effects.brightness}%)`;
        } else {
            container.style.filter = 'none';
        }

        if (effects.rotation) {
            container.classList.add('rotate-effect');
        }

        if (effects.scale) {
            container.classList.add('scale-pulse');
        }
    }

    updateConnectionBadge(connected) {
        const badge = this.elements.statusBadge;
        const text = this.elements.statusText;

        if (!badge || !text) return;

        badge.className = 'status-badge';

        if (connected) {
            badge.classList.add('controlled');
            text.textContent = 'Controlled';
        } else {
            badge.classList.add('standalone');
            text.textContent = 'Standalone';
        }
    }

    triggerShake() {
        const text = this.elements.text;
        if (!text) return;

        text.classList.add('shake-effect');
        setTimeout(() => {
            text.classList.remove('shake-effect');
        }, 500);
    }
}

if (typeof window !== 'undefined') {
    window.DisplayUI = DisplayUI;
}
