/**
 * TelemetryOverlay.js
 * Advanced diagnostic visualization for Behavioral Deltas.
 * Provides granular insight into how the algorithm "sees" your movements.
 */

export class TelemetryOverlay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this._initElements();
    }

    _initElements() {
        this.nodes = {
            fps: this._createNode('FPS', '60'),
            density: this._createNode('Density', '1.0'),
            composite: this._createNode('Composite Delta', '0.00'),
            state: this._createNode('System State', 'Stable')
        };
    }

    _createNode(label, value) {
        const div = document.createElement('div');
        div.className = 'telemetry-node';
        div.innerHTML = `
            <span class="node-label">${label}:</span>
            <span class="node-value">${value}</span>
        `;
        this.container.appendChild(div);
        return div.querySelector('.node-value');
    }

    /**
     * Updates the diagnostic values.
     * @param {Object} deltas 
     * @param {Object} perfStats 
     */
    update(deltas, perfStats) {
        this.nodes.fps.textContent = perfStats.fps;
        this.nodes.density.textContent = perfStats.density;
        this.nodes.composite.textContent = deltas.composite.toFixed(3);

        let state = 'Harmonious';
        if (deltas.composite > 0.3) state = 'Deviated';
        if (deltas.composite > 0.6) state = 'Divergent';
        if (deltas.composite > 0.8) state = 'Fractured';

        this.nodes.state.textContent = state;
        this.nodes.state.style.color = deltas.composite > 0.5 ? 'var(--color-delta)' : 'var(--color-primary)';
    }
}
