import { CONFIG } from '../config.js';

/**
 * @fileoverview Control Panel UI Component.
 * Manages the complex intersection of user input and application state.
 */

export class ControlPanel {
    /**
     * @param {Object} app - Reference to the main App instance.
     */
    constructor(app) {
        this.app = app;

        /** @type {HTMLElement} */
        this.container = document.querySelector('.controls');

        /** @type {Object<string, HTMLElement>} */
        this.elements = {};

        /** @type {string} */
        this.activeTab = 'general';

        this.init();
    }

    /**
     * Initializes the UI elements and attaches listeners.
     */
    init() {
        this.renderTabs();
        this.setupGeneralControls();
        this.setupAudioControls();
        this.setupVisualControls();
        this.setupSymmetryControls();

        this.showTab('general');
    }

    /**
     * Renders the tab navigation at the top of the control panel.
     */
    renderTabs() {
        const nav = document.createElement('nav');
        nav.className = 'ui-tabs';

        const tabs = ['general', 'visuals', 'audio', 'symmetry'];
        tabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
            btn.className = 'tab-btn';
            btn.dataset.tab = tab;
            btn.addEventListener('click', () => this.showTab(tab));
            nav.appendChild(btn);
            this.elements[`tab_${tab}`] = btn;
        });

        this.container.prepend(nav);
    }

    /**
     * Switches visibility between different settings groups.
     * @param {string} tabId 
     */
    showTab(tabId) {
        this.activeTab = tabId;

        // Update button states
        Object.keys(this.elements).forEach(key => {
            if (key.startsWith('tab_')) {
                this.elements[key].classList.toggle('active', key === `tab_${tabId}`);
            }
        });

        // Toggle sections
        const sections = ['general', 'visuals', 'audio', 'symmetry'];
        sections.forEach(s => {
            const el = document.getElementById(`section-${s}`);
            if (el) el.style.display = s === tabId ? 'flex' : 'none';
        });
    }

    /**
     * Binds general system controls (Speed, Clear, Reconstruct).
     */
    setupGeneralControls() {
        const section = this.createSection('general');

        const speedGroup = this.createRangeControl('Speed', 0.01, 0.2, 0.01, CONFIG.ANIMATION.DEFAULT_SPEED, (val) => {
            this.app.renderer.speed = val;
        });

        const clearBtn = document.getElementById('clear-btn');
        const reconstructBtn = document.getElementById('reconstruct-btn');

        section.appendChild(speedGroup);
    }

    /**
     * Binds audio settings (Volume, Toggle, Octave).
     */
    setupAudioControls() {
        const section = this.createSection('audio');

        const volumeGroup = this.createRangeControl('Volume', 0, 1, 0.01, CONFIG.AUDIO.VOLUME, (val) => {
            if (this.app.audio.mainGain) {
                this.app.audio.mainGain.gain.setTargetAtTime(val, this.app.audio.ctx.currentTime, 0.05);
            }
        });

        const toggleGroup = this.createCheckboxControl('Enable Sound', true, (checked) => {
            this.app.audio.isEnabled = checked;
            if (!checked) this.app.audio.stopAll();
        });

        section.appendChild(toggleGroup);
        section.appendChild(volumeGroup);
    }

    /**
     * Binds visual settings (Circles, Particles, Trail).
     */
    setupVisualControls() {
        const section = this.createSection('visuals');

        section.appendChild(this.createCheckboxControl('Show Circles', true, (val) => this.app.renderer.showCircles = val));
        section.appendChild(this.createCheckboxControl('Show Particles', true, (val) => this.app.renderer.showParticles = val));
        section.appendChild(this.createCheckboxControl('Show Radius', true, (val) => this.app.renderer.showRadius = val));

        section.appendChild(this.createRangeControl('Glow Intensity', 0, 30, 1, 10, (val) => {
            // This would update a renderer variable
        }));
    }

    /**
     * Binds symmetry settings (Radial count, Mirror).
     */
    setupSymmetryControls() {
        const section = this.createSection('symmetry');

        section.appendChild(this.createRangeControl('Radial Count', 1, 12, 1, 1, (val) => {
            this.app.sketch.symmetry.radialPoints = parseInt(val);
        }));

        section.appendChild(this.createCheckboxControl('Mirror Mode', false, (val) => {
            this.app.sketch.symmetry.mirrorEnabled = val;
        }));
    }

    /**
     * Factory for creating a settings category section.
     * @param {string} id 
     * @returns {HTMLElement}
     */
    createSection(id) {
        const div = document.createElement('div');
        div.id = `section-${id}`;
        div.className = 'control-section';
        this.container.appendChild(div);
        return div;
    }

    /**
     * Factory for a range input wrapper.
     * @param {string} label 
     * @param {number} min 
     * @param {number} max 
     * @param {number} step 
     * @param {number} value 
     * @param {Function} callback 
     * @returns {HTMLElement}
     */
    createRangeControl(label, min, max, step, value, callback) {
        const group = document.createElement('div');
        group.className = 'control-group';

        const lbl = document.createElement('label');
        lbl.textContent = label;

        const input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;

        input.addEventListener('input', (e) => callback(parseFloat(e.target.value)));

        group.appendChild(lbl);
        group.appendChild(input);
        return group;
    }

    /**
     * Factory for a checkbox input wrapper.
     * @param {string} label 
     * @param {boolean} checked 
     * @param {Function} callback 
     * @returns {HTMLElement}
     */
    createCheckboxControl(label, checked, callback) {
        const group = document.createElement('div');
        group.className = 'control-group row';

        const lbl = document.createElement('label');
        lbl.textContent = label;

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = checked;

        input.addEventListener('change', (e) => callback(e.target.checked));

        group.appendChild(input);
        group.appendChild(lbl);
        return group;
    }
}
