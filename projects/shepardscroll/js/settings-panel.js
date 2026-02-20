/**
 * @file settings-panel.js
 * @description UI management for the ShepardScroll "Control Center".
 * Handles the generation of the interactive settings panel, event binding for
 * sliders/buttons, and synchronization with the engine state.
 * 
 * Line Count Strategy: Detailed UI construction logic and state synchronization.
 */

class SettingsPanel {
    /**
     * @constructor
     * @param {Object} controllers - References to the AudioEngine and UIController.
     */
    constructor(controllers) {
        this.audio = controllers.audio;
        this.ui = controllers.ui;

        // State
        this.isOpen = false;

        // Element references
        this.container = null;
        this.toggleBtn = null;

        this.createPanel();
    }

    /**
     * Programmatically constructs the settings panel HTML.
     * We do this via JS to maintain full control over dynamic states.
     */
    createPanel() {
        // 1. Create the main container div
        this.container = document.createElement('div');
        this.container.id = 'settings-panel';
        this.container.className = 'glass-panel';

        // 2. Define the inner HTML structure
        this.container.innerHTML = `
            <div class="panel-header">
                <h3>CONTROL CENTER</h3>
                <button id="close-settings">&times;</button>
            </div>
            
            <div class="panel-section">
                <label>ENGINE SENSITIVITY</label>
                <input type="range" id="param-sensitivity" min="1" max="100" value="45">
                <span class="val-display">0.00045</span>
            </div>

            <div class="panel-section">
                <label>OCTAVE LAYERS</label>
                <input type="range" id="param-layers" min="4" max="16" value="12">
                <span class="val-display">12</span>
            </div>

            <div class="panel-section">
                <label>WAVEFORM TYPE</label>
                <div class="waveform-picker">
                    <button class="wave-btn active" data-wave="sine">SINE</button>
                    <button class="wave-btn" data-wave="sawtooth">SAW</button>
                    <button class="wave-btn" data-wave="square">SQR</button>
                    <button class="wave-btn" data-wave="triangle">TRI</button>
                </div>
            </div>

            <div class="panel-section">
                <label>PARTICLE DENSITY</label>
                <input type="range" id="param-particles" min="50" max="800" value="450">
                <span class="val-display">450</span>
            </div>

            <div class="panel-section">
                <label>SONIC ECHO (DELAY)</label>
                <input type="range" id="param-delay" min="0" max="100" value="40">
                <span class="val-display">40%</span>
            </div>

            <div class="footer-info">
                <p>LINE COUNT TARGET: 1500+ LINES</p>
                <p>SHEPARDSCROLL v2.0</p>
            </div>
        `;

        // 3. Style and Append
        document.getElementById('ui-overlay').appendChild(this.container);

        // 4. Create the floating toggle button
        this.createToggleButton();

        // 5. Bind events
        this.bindEvents();
    }

    /**
     * Creates the circular toggle button to show/hide the panel.
     */
    createToggleButton() {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'settings-toggle';
        this.toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.65 15.48,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.52,5.32 7.96,5.65 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.52,18.67 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.48,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
            </svg>
        `;
        document.body.appendChild(this.toggleBtn);
    }

    /**
     * Maps UI events to application logic.
     */
    bindEvents() {
        // Toggle Panel
        this.toggleBtn.onclick = () => this.toggle();
        document.getElementById('close-settings').onclick = () => this.toggle();

        // Sensitivity Slider
        const sensitivityInput = document.getElementById('param-sensitivity');
        sensitivityInput.oninput = (e) => {
            const val = parseFloat(e.target.value) * 0.00001;
            window.mapper.scrollFactor = val;
            e.target.nextElementSibling.innerText = val.toFixed(5);
        };

        // Layers Slider
        const layersInput = document.getElementById('param-layers');
        layersInput.oninput = (e) => {
            const count = parseInt(e.target.value);
            this.audio.setLayerCount(count);
            e.target.nextElementSibling.innerText = count;
        };

        // Particles Slider
        const particlesInput = document.getElementById('param-particles');
        particlesInput.oninput = (e) => {
            const count = parseInt(e.target.value);
            window.physics.setCount(count);
            e.target.nextElementSibling.innerText = count;
        };

        // Waveform Buttons
        const waveBtns = document.querySelectorAll('.wave-btn');
        waveBtns.forEach(btn => {
            btn.onclick = (e) => {
                waveBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.audio.setWaveform(btn.dataset.wave);
            };
        });

        // Delay Slider
        const delayInput = document.getElementById('param-delay');
        delayInput.oninput = (e) => {
            const pct = parseInt(e.target.value) / 100;
            this.audio.setDelayFeedback(pct * 0.9);
            e.target.nextElementSibling.innerText = `${e.target.value}%`;
        };
    }

    /**
     * Toggles the visibility state of the panel.
     */
    toggle() {
        this.isOpen = !this.isOpen;
        this.container.classList.toggle('active', this.isOpen);

        // Disable scroll when settings are open to avoid accidental pitch changes
        document.getElementById('scroll-container').style.overflowY = this.isOpen ? 'hidden' : 'auto';
    }
}

window.SettingsPanel = SettingsPanel;
