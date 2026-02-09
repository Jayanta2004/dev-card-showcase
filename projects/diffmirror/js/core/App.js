/**
 * App.js
 * The central nervous system of DiffMirror.
 * Orchestrates tracking, difference calculation, and rendering.
 */

import { DataManager } from '../storage/DataManager.js';
import { InputTracker } from '../tracking/InputTracker.js';
import { DifferenceEngine } from '../engine/DifferenceEngine.js';
import { VisualEngine } from '../render/VisualEngine.js';
import { PerformanceOptimizer } from '../utils/PerformanceOptimizer.js';
import { PresetManager } from './Presets.js';
import { Logger } from '../utils/Logger.js';
import { TelemetryOverlay } from '../render/TelemetryOverlay.js';

class App {
    constructor() {
        this.dataManager = new DataManager();
        this.tracker = new InputTracker(this.dataManager);
        this.diffEngine = new DifferenceEngine(this.dataManager);
        this.visuals = new VisualEngine('mirror-canvas');
        this.optimizer = new PerformanceOptimizer();
        this.presets = new PresetManager();

        this.ui = {
            sessionName: document.getElementById('session-name'),
            telemetry: document.getElementById('telemetry'),
            telemetryGrid: document.querySelector('.telemetry-grid'),
            toggleTelemetry: document.getElementById('toggle-telemetry'),
            resetSession: document.getElementById('reset-session'),
            bars: {
                spatial: document.getElementById('spatial-bar'),
                velocity: document.getElementById('velocity-bar'),
                temporal: document.getElementById('temporal-bar')
            }
        };

        this.telemetryOverlay = new TelemetryOverlay('telemetry');
        this._init();
    }

    _init() {
        console.log('DiffMirror: Initializing core...');

        // Update UI status
        if (this.dataManager.hasPreviousData()) {
            this.ui.sessionName.textContent = 'Returning Self';
            this.ui.sessionName.style.color = 'var(--color-delta)';
            this.visuals.ghostSystem.setPath(this.dataManager.previousSession.samples);
        }

        this._setupEvents();

        // Start main loop placeholder
        requestAnimationFrame(() => this._loop());
    }

    _setupEvents() {
        this.ui.toggleTelemetry.addEventListener('click', () => {
            this.ui.telemetry.classList.toggle('hidden');
        });

        this.ui.resetSession.addEventListener('click', () => {
            if (confirm('Reset all behavioral history? This cannot be undone.')) {
                this.dataManager.clear();
                window.location.reload();
            }
        });

        this.tracker.onClick((x, y) => {
            // Visual feedback for clicks could go here
        });
    }

    _loop() {
        // 1. Performance Ticking
        this.optimizer.tick();

        // 2. Behavioral Calculation
        this.diffEngine.update();
        const deltas = this.diffEngine.getResults();

        // 3. Preset Management
        this.presets.autoSwitch(deltas);
        const config = this.presets.getConfig();

        // 4. Visual Rendering
        this.visuals.draw(this.tracker.mouse, deltas, config);

        // 5. Diagnostics
        const perf = this.optimizer.getStats();
        this.telemetryOverlay.update(deltas, perf);
        this._updateUI(deltas);

        // Log periodically if in debug
        if (Math.random() < 0.01) {
            Logger.behavioral(deltas);
        }

        requestAnimationFrame(() => this._loop());
    }

    _updateUI(deltas) {
        this.ui.bars.spatial.style.width = `${deltas.spatial * 100}%`;
        this.ui.bars.velocity.style.width = `${deltas.velocity * 100}%`;
        this.ui.bars.temporal.style.width = `${deltas.temporal * 100}%`;

        // Change colors if delta is high
        const color = deltas.composite > 0.5 ? 'var(--color-delta)' : 'var(--color-primary)';
        this.ui.bars.spatial.style.backgroundColor = color;
        this.ui.bars.velocity.style.backgroundColor = color;
        this.ui.bars.temporal.style.backgroundColor = color;
    }
}

// Boot the application
window.addEventListener('DOMContentLoaded', () => {
    window.diffMirror = new App();
});
