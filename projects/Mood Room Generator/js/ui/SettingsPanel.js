/**
 * SettingsPanel.js
 * UI Component for tweaking engine parameters live.
 */
import DOMHelper from '../core/DOMHelper.js';

export default class SettingsPanel {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.isOpen = false;

        this.render();
        this.bindEvents();
    }

    render() {
        const overlay = document.querySelector('.ui-overlay');

        // Container
        const container = DOMHelper.createElement('div', 'settings-panel', overlay);

        // Header
        const header = DOMHelper.createElement('div', 'settings-header', container);
        header.innerHTML = `<span><i class="ri-settings-3-line"></i> Settings</span>`;

        // Toggle Button
        this.toggleBtn = DOMHelper.createElement('button', 'settings-toggle', overlay);
        this.toggleBtn.innerHTML = `<i class="ri-settings-3-line"></i>`;

        // Controls
        this.addControl(container, 'Particle Count', 'particle-count', 10, 200, 50);
        this.addControl(container, 'Speed', 'particle-speed', 0.1, 5.0, 1.0);
        this.addControl(container, 'Glow Intensity', 'glow-intensity', 0, 100, 50);

        this.container = container;
        // Initially hidden
        this.container.classList.add('hidden');
    }

    addControl(parent, label, id, min, max, value) {
        const group = DOMHelper.createElement('div', 'control-group', parent);

        const labelEl = DOMHelper.createElement('label', null, group);
        labelEl.innerText = label;
        labelEl.setAttribute('for', id);

        const input = DOMHelper.createElement('input', null, group);
        input.type = 'range';
        input.id = id;
        input.min = min;
        input.max = max;
        input.value = value;
        input.step = (max - min) / 100;

        input.addEventListener('input', (e) => {
            console.log(`[Settings] ${id} changed to ${e.target.value}`);
            // Emit event for engines to pick up
            this.eventBus.emit('settingChange', {
                id: id,
                value: parseFloat(e.target.value)
            });
        });
    }

    bindEvents() {
        this.toggleBtn.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            this.container.classList.toggle('hidden', !this.isOpen);
            this.toggleBtn.classList.toggle('active', this.isOpen);
        });
    }
}
