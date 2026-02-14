/**
 * DifferenceEngine.js
 * The analytical core of DiffMirror.
 * Compares current behavioral samples with historical data using vector path analysis.
 */

import { MathUtils } from '../utils/MathUtils.js';

export class DifferenceEngine {
    constructor(dataManager) {
        this.dataManager = dataManager;

        // Scalar values (0.0 to 1.0) representing the behavioral delta
        this.deltas = {
            spatial: 0,   // Path difference
            velocity: 0,  // Speed consistency difference
            temporal: 0,  // Interaction rhythm difference
            composite: 0  // Combined weighted delta
        };

        // Smoothing factors for real-time calculation
        this.smoothing = 0.05;
        this.targetDeltas = { spatial: 0, velocity: 0, temporal: 0 };
    }

    /**
     * Updates the calculated deltas by comparing current session samples with previous ones.
     */
    update() {
        if (!this.dataManager.hasPreviousData()) {
            this._resetDeltas();
            return;
        }

        const current = this.dataManager.currentSession;
        const previous = this.dataManager.previousSession;

        // Perform comparisons if enough data exists
        if (current.samples.length > 5 && previous.samples.length > 5) {
            this._computeSpatialDelta(current.samples, previous.samples);
            this._computeVelocityDelta(current.samples, previous.samples);
            this._computeTemporalDelta(current.clicks, previous.clicks);
        }

        this._applySmoothing();
        this._updateComposite();
    }

    /**
     * Compares the spatial paths of the mouse.
     * Uses a simplified Dynamic Time Warping or segment-based comparison.
     */
    _computeSpatialDelta(curr, prev) {
        // We compare the average position and the "spread" of movement
        const currAvgX = MathUtils.average(curr.map(s => s.x));
        const currAvgY = MathUtils.average(curr.map(s => s.y));
        const prevAvgX = MathUtils.average(prev.map(s => s.x));
        const prevAvgY = MathUtils.average(prev.map(s => s.y));

        const posDiff = Math.sqrt(Math.pow(currAvgX - prevAvgX, 2) + Math.pow(currAvgY - prevAvgY, 2));

        // Compare path spread (standard deviation)
        const currDevX = MathUtils.standardDeviation(curr.map(s => s.x));
        const prevDevX = MathUtils.standardDeviation(prev.map(s => s.x));
        const spreadDiff = Math.abs(currDevX - prevDevX);

        this.targetDeltas.spatial = MathUtils.clamp(posDiff * 2 + spreadDiff * 3, 0, 1);
    }

    /**
     * Compares the velocity distribution of movements.
     */
    _computeVelocityDelta(curr, prev) {
        const getVels = (samples) => {
            const vels = [];
            for (let i = 1; i < samples.length; i++) {
                const dx = samples[i].x - samples[i - 1].x;
                const dy = samples[i].y - samples[i - 1].y;
                const dt = (samples[i].t - samples[i - 1].t) || 1;
                vels.push(Math.sqrt(dx * dx + dy * dy) / dt);
            }
            return vels;
        };

        const currVels = getVels(curr);
        const prevVels = getVels(prev);

        const currAvgVel = MathUtils.average(currVels);
        const prevAvgVel = MathUtils.average(prevVels);

        const velDiff = Math.abs(currAvgVel - prevAvgVel) * 1000; // Scale because vels are small
        this.targetDeltas.velocity = MathUtils.clamp(velDiff, 0, 1);
    }

    /**
     * Compares interaction rhythm (clicks timestamps).
     */
    _computeTemporalDelta(curr, prev) {
        if (curr.length < 2 || prev.length < 2) {
            this.targetDeltas.temporal = 0.2; // Baseline delta
            return;
        }

        const getIntervals = (clicks) => {
            const ints = [];
            for (let i = 1; i < clicks.length; i++) {
                ints.push(clicks[i].t - clicks[i - 1].t);
            }
            return ints;
        };

        const currInts = getIntervals(curr);
        const prevInts = getIntervals(prev);

        const currAvgInt = MathUtils.average(currInts);
        const prevAvgInt = MathUtils.average(prevInts);

        const intDiff = Math.abs(currAvgInt - prevAvgInt) / 5000; // Scale by 5 seconds
        this.targetDeltas.temporal = MathUtils.clamp(intDiff, 0, 1);
    }

    _applySmoothing() {
        this.deltas.spatial = MathUtils.lerp(this.deltas.spatial, this.targetDeltas.spatial, this.smoothing);
        this.deltas.velocity = MathUtils.lerp(this.deltas.velocity, this.targetDeltas.velocity, this.smoothing);
        this.deltas.temporal = MathUtils.lerp(this.deltas.temporal, this.targetDeltas.temporal, this.smoothing);
    }

    _updateComposite() {
        // Weighted average for the combined effect
        this.deltas.composite = (
            this.deltas.spatial * 0.5 +
            this.deltas.velocity * 0.3 +
            this.deltas.temporal * 0.2
        );
    }

    _resetDeltas() {
        this.targetDeltas = { spatial: 0.1, velocity: 0.1, temporal: 0.1 };
        this._applySmoothing();
    }

    /**
     * Returns the current state of deltas.
     */
    getResults() {
        return { ...this.deltas };
    }
}
