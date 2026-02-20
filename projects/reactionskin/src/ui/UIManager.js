/**
 * UI Manager for ReactionSkin PRO
 * 
 * Coordinates the complex multi-panel interface, handles navigation,
 * and synchronizes simulation state with the DOM.
 */
export class UIManager {
    /**
     * @param {Object} app - Reference to the main App class
     */
    constructor(app) {
        this.app = app;

        // --- UI State ---
        this.activePanelId = 'params-panel';

        this.initNavigation();
        this.initPresets();
        this.initControls();
        this.initVisuals();
        this.initExport();
        this.initToasts();
    }

    /**
     * Sidebar navigation and hotkey bindings.
     * @private
     */
    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const panels = document.querySelectorAll('.control-panel');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.dataset.target;

                // Update Nav Buttons
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Update Panels
                panels.forEach(p => p.classList.remove('active'));
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    this.activePanelId = targetId;
                }
            });
        });

        // Global Hotkeys
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                document.getElementById('pause-btn').click();
            }
            if (e.ctrlKey && e.code === 'KeyZ') {
                this.app.history.undo();
                this.showToast('Time Warp: Undo');
            }
            if (e.ctrlKey && e.code === 'KeyY') {
                this.app.history.redo();
                this.showToast('Time Warp: Redo');
            }
            if (e.code === 'KeyS') {
                this.app.export.captureFrame();
                this.showToast('Frame Captured');
            }
        });
    }

    /**
     * Export panel wiring.
     * @private
     */
    initExport() {
        const snapBtn = document.getElementById('snap-btn');
        const recordBtn = document.getElementById('record-btn');

        snapBtn.addEventListener('click', () => {
            this.app.export.captureFrame();
            this.showToast('Frame Snapshotted to Disk');
        });

        recordBtn.addEventListener('click', () => {
            if (!this.app.export.isRecording) {
                this.app.export.startRecording();
                recordBtn.textContent = 'Stop Recording';
                recordBtn.classList.add('danger');
                this.showToast('Recording Stream Initialized');
            } else {
                this.app.export.stopRecording();
                recordBtn.textContent = 'Record Video (Beta)';
                recordBtn.classList.remove('danger');
                this.showToast('Recording Finalized');
            }
        });
    }


    /**
     * Initializes and populates the preset grid.
     * @private
     */
    initPresets() {
        const presets = [
            { id: 'coral', name: 'Organic Coral', f: 0.055, k: 0.062, dA: 1.0, dB: 0.5 },
            { id: 'mitosis', name: 'Cell Mitosis', f: 0.0367, k: 0.0649, dA: 1.0, dB: 0.5 },
            { id: 'bacteria', name: 'Bacterial Growth', f: 0.035, k: 0.060, dA: 1.0, dB: 0.5 },
            { id: 'fingerprint', name: 'Fingerprints', f: 0.0545, k: 0.062, dA: 1.0, dB: 0.5 },
            { id: 'chaos', name: 'Entropic Chaos', f: 0.026, k: 0.051, dA: 1.0, dB: 0.5 },
            { id: 'maze', name: 'Bio-Maze', f: 0.029, k: 0.057, dA: 1.0, dB: 0.5 },
            { id: 'worms', name: 'Worm Holes', f: 0.058, k: 0.063, dA: 1.0, dB: 0.5 },
            { id: 'bubbles', name: 'Pulsing Bubbles', f: 0.014, k: 0.045, dA: 1.0, dB: 0.5 }
        ];

        const container = document.getElementById('preset-container');
        if (!container) return;

        presets.forEach(p => {
            const card = document.createElement('div');
            card.className = 'preset-card';
            if (p.id === 'coral') card.classList.add('active');

            card.innerHTML = `<h4>${p.name}</h4>`;
            card.addEventListener('click', () => {
                document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                this.app.simulation.setParams(p);
                this.updateParamDisplays();
                this.showToast(`Preset: ${p.name} Loaded`);
            });

            container.appendChild(card);
        });
    }

    /**
     * Wiring up main simulation controls.
     * @private
     */
    initControls() {
        // Image Upload Integration
        const imgInput = document.createElement('input');
        imgInput.type = 'file';
        imgInput.accept = 'image/*';
        imgInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.app.textureMapper.loadTexture(file);
                this.showToast('Image Texture Seeded to Biological Grid');
            }
        };

        // Add Upload button to Brush Panel (Dynamic Injection as we didn't have it in HTML)
        const brushPanel = document.getElementById('brush-panel');
        if (brushPanel) {
            const uploadBtn = document.createElement('button');
            uploadBtn.className = 'action-btn';
            uploadBtn.style.marginTop = '1rem';
            uploadBtn.textContent = 'Upload Seed Texture';
            uploadBtn.onclick = () => imgInput.click();
            brushPanel.querySelector('.control-group').appendChild(uploadBtn);
        }

        // --- Reactive Engine Hotkey ---
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyM') {
                this.app.reactive.enable();
                this.showToast('Reactive Environment Engaged');
            }
        });

        // Parameter Sliders
        const sliders = [
            { id: 'feed-rate', key: 'f', target: 'feed-value' },
            { id: 'kill-rate', key: 'k', target: 'kill-value' },
            { id: 'diffusion-a', key: 'dA', target: 'diff-a-value' },
            { id: 'diffusion-b', key: 'dB', target: 'diff-b-value' }
        ];

        sliders.forEach(s => {
            const input = document.getElementById(s.id);
            const display = document.getElementById(s.target);

            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.app.simulation.setParams({ [s.key]: val });
                display.textContent = val.toFixed(4);
            });
        });

        // Brush Sliders
        const brushSize = document.getElementById('brush-size');
        const brushFlow = document.getElementById('brush-flow');

        brushSize.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.app.brush.setSettings({ size: val });
            document.getElementById('brush-size-val').textContent = val;
        });

        brushFlow.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.app.brush.setSettings({ flow: val });
            document.getElementById('brush-flow-val').textContent = val.toFixed(1);
        });

        // Toggle Buttons (Brush Type)
        document.querySelectorAll('[data-brush]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-brush]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.app.brush.setSettings({ type: btn.dataset.brush });
            });
        });

        // Global Actions
        document.getElementById('reset-btn').addEventListener('click', () => this.app.reset());
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.app.simulation.clear();
            this.showToast('Grid Cleared');
        });

        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.addEventListener('click', () => {
            this.app.isPaused = !this.app.isPaused;
            pauseBtn.textContent = this.app.isPaused ? 'Resume' : 'Pause';
            pauseBtn.classList.toggle('primary', this.app.isPaused);
        });
    }

    /**
     * Visuals and Audio wiring.
     * @private
     */
    initVisuals() {
        // Audio Toggle
        const audioBtn = document.getElementById('enable-audio');
        audioBtn.addEventListener('click', async () => {
            await this.app.audio.enable();
            audioBtn.textContent = 'Audio Active';
            audioBtn.disabled = true;
            this.showToast('Neural Sonic Engine Active');
        });

        document.getElementById('master-volume').addEventListener('input', (e) => {
            this.app.audio.setVolume(parseFloat(e.target.value));
        });

        // Post Process Toggles
        const ppToggles = [
            { id: 'bloom-toggle', class: 'effect-bloom' },
            { id: 'noise-toggle', class: 'effect-noise' },
            { id: 'scanline-toggle', class: 'effect-scanlines' }
        ];

        const ppOverlay = document.getElementById('post-process-overlay');

        ppToggles.forEach(t => {
            const checkbox = document.getElementById(t.id);
            checkbox.addEventListener('change', () => {
                ppOverlay.classList.toggle(t.class, checkbox.checked);
            });
        });
    }

    /**
     * Updates all UI sliders to match the current simulation state.
     */
    updateParamDisplays() {
        const sim = this.app.simulation;
        document.getElementById('feed-rate').value = sim.feed;
        document.getElementById('kill-rate').value = sim.kill;
        document.getElementById('diffusion-a').value = sim.dA;
        document.getElementById('diffusion-b').value = sim.dB;

        document.getElementById('feed-value').textContent = sim.feed.toFixed(4);
        document.getElementById('kill-value').textContent = sim.kill.toFixed(4);
        document.getElementById('diff-a-value').textContent = sim.dA.toFixed(2);
        document.getElementById('diff-b-value').textContent = sim.dB.toFixed(2);
    }

    /**
     * Mini Toast Notification System
     * Provides temporary visual feedback for background actions (Save/Undo/etc).
     * 
     * @private
     */
    initToasts() {
        /** @type {HTMLElement} Container for toast elements */
        this.toastContainer = document.getElementById('toast-container');
    }

    /**
     * Spawns a floating notification message.
     * 
     * @param {string} message - The text content to display
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        // Dynamic styling for high-visibility alerts
        Object.assign(toast.style, {
            background: 'rgba(0,0,0,0.85)',
            color: 'var(--accent-color)',
            padding: '0.8rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(0, 242, 255, 0.3)',
            marginBottom: '0.8rem',
            fontSize: 'var(--font-size-sm)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            animation: 'panelSlide 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards'
        });

        this.toastContainer.appendChild(toast);

        // Auto-cleanup after 3.2 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }
}
