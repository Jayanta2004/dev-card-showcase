import { ChartEngine } from './chart-engine.js';
import { TimeUtils } from '../utils/time-utils.js';

/**
 * UIRenderer
 * Manages all DOM updates and coordinates chart rendering.
 */
export class UIRenderer {
    constructor() {
        this.chartEngine = new ChartEngine();

        // DOM Elements
        this.els = {
            clock: document.getElementById('clock'),
            statusSystem: document.getElementById('system-status'),
            statusInput: document.getElementById('input-source'),
            entropyScore: document.getElementById('entropy-score'),
            entropyRing: document.getElementById('entropy-ring'),
            predictabilityBar: document.getElementById('predictability-bar'),
            predictabilityVal: document.getElementById('predictability-val'),
            coordX: document.getElementById('coord-x'),
            coordY: document.getElementById('coord-y'),
            directionChart: document.getElementById('direction-chart'),
            timingChart: document.getElementById('timing-chart'),
            eventLog: document.getElementById('event-log'),
            seqLen: document.getElementById('seq-len'),
            complexityScore: document.getElementById('complexity-score'),
            instruction: document.getElementById('instruction-overlay')
        };

        this.charts = {
            direction: new Array(8).fill(0), // 8 octants
            timing: new Array(50).fill(0).map(() => Math.random() * 0.2) // dummy history
        };
    }

    /**
     * Updates the clock.
     */
    updateClock() {
        if (this.els.clock) {
            this.els.clock.textContent = TimeUtils.formatTime(new Date());
        }
    }

    /**
     * Log a message to the console panel.
     * @param {string} msg 
     * @param {string} type - 'system', 'info', 'warn', 'alert'
     */
    log(msg, type = 'info') {
        if (!this.els.eventLog) return;

        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        div.textContent = `[${TimeUtils.formatTime(new Date())}] ${msg}`;

        this.els.eventLog.prepend(div);

        // Keep log clean
        if (this.els.eventLog.children.length > 20) {
            this.els.eventLog.lastElementChild.remove();
        }
    }

    /**
     * Updates status indicators.
     * @param {boolean} isInputActive 
     */
    updateStatus(isInputActive) {
        if (isInputActive) {
            this.els.statusInput.classList.add('active');
            this.els.statusInput.textContent = 'INPUT: DETECTING';
            this.els.instruction.style.opacity = '0';
        } else {
            this.els.statusInput.classList.remove('active');
            this.els.statusInput.textContent = 'INPUT: IDLE';
        }
    }

    /**
     * Updates numeric displays and charts.
     * @param {Object} state - The analysis state
     */
    render(state) {
        // Coords
        if (state.lastPos) {
            this.els.coordX.textContent = `X: ${state.lastPos.x.toString().padStart(4, '0')}`;
            this.els.coordY.textContent = `Y: ${state.lastPos.y.toString().padStart(4, '0')}`;
        }

        // Entropy / Predictability
        // state.entropy is in bits (e.g. 0-4)
        // state.predictability is 0-1

        this.els.entropyScore.textContent = state.entropy.toFixed(2);

        // Ring
        // Map 4 bits to full circle roughly
        const ringVal = Math.min(state.entropy / 4, 1.0);
        this.chartEngine.drawRing(this.els.entropyRing, ringVal, '#00f0ff');

        // Linear Bar
        const predPct = Math.floor(state.predictability * 100);
        this.els.predictabilityBar.style.width = `${predPct}%`;
        this.els.predictabilityVal.textContent = `${predPct}%`;

        // Color shift based on predictability
        if (predPct > 80) {
            this.els.predictabilityBar.style.backgroundColor = '#ff0055'; // High Pred (Bad random)
        } else if (predPct > 40) {
            this.els.predictabilityBar.style.backgroundColor = '#ccff00'; // Med
        } else {
            this.els.predictabilityBar.style.backgroundColor = '#00f0ff'; // Low Pred (Good random)
        }

        // Update Charts
        if (state.directionBuckets) {
            this.chartEngine.drawPolarChart(this.els.directionChart, state.directionBuckets);
        }

        if (state.timingHistory) {
            this.chartEngine.drawLineChart(this.els.timingChart, state.timingHistory, '#00ff9d');
        }

        this.els.seqLen.textContent = state.sequenceLength || 0;
        this.els.complexityScore.textContent = state.complexity || 'NULL';
    }
}
