import { MathUtils } from '../utils/math-utils.js';

/**
 * EntropyEngine
 * Calculates the Shannon Entropy of user input streams.
 * Measures how "surprising" the user's behavior is.
 */
export class EntropyEngine {
    constructor() {
        this.windowSize = 50; // Number of events to analyze
        this.binCount = 16; // Number of discrete bins for spatial/timing data
    }

    /**
     * Calculates Shannon Entropy for a dataset.
     * H(X) = -sum(p(x) * log2(p(x)))
     * @param {Array} data - Array of values or objects
     * @param {Function} valueExtractor - Function to extract value from object
     * @returns {number} Entropy in bits
     */
    calculateEntropy(data, valueExtractor = null) {
        if (!data || data.length === 0) return 0;

        const frequencies = {};
        const total = data.length;

        // Count frequencies
        for (let i = 0; i < total; i++) {
            const val = valueExtractor ? valueExtractor(data[i]) : data[i];
            const key = String(val); // Quantize if necessary before this step
            frequencies[key] = (frequencies[key] || 0) + 1;
        }

        // Calculate entropy
        let entropy = 0;
        for (const key in frequencies) {
            const p = frequencies[key] / total;
            entropy -= p * Math.log2(p);
        }

        return entropy;
    }

    /**
     * Analyzes mouse movement entropy.
     * Considers direction (angle) and speed (magnitude) independently.
     * @param {Array} mouseHistory 
     * @returns {Object} { angleEntropy, speedEntropy, totalEntropy }
     */
    analyzeMouseEntropy(mouseHistory) {
        if (mouseHistory.length < 10) return { angleEntropy: 0, speedEntropy: 0, totalEntropy: 0 };

        const recent = mouseHistory.slice(-this.windowSize);

        // 1. Quantize Angles into 8 sectors (45 degrees each)
        const angleExtractor = (pt) => {
            if (!pt.velocity || pt.velocity < 2) return 'STATIC'; // Ignore micro-movements
            // Normalize angle to 0-360
            let deg = MathUtils.radToDeg(pt.angle);
            if (deg < 0) deg += 360;
            return Math.floor(deg / 45); // 0-7
        };

        // 2. Quantize Speed into discrete levels
        // We need a dynamic max speed to normalize, or fixed tiers.
        // Let's use fixed tiers for simplicity of "human" range.
        const speedExtractor = (pt) => {
            const v = pt.velocity;
            if (v < 2) return 0;
            if (v < 10) return 1;
            if (v < 50) return 2;
            if (v < 200) return 3;
            return 4; // Twitch/Flick
        };

        const angleEntropy = this.calculateEntropy(recent, angleExtractor);
        const speedEntropy = this.calculateEntropy(recent, speedExtractor);

        // Max possible entropy for 8 buckets is -log2(1/8) = 3 bits
        // For speed (5 levels) is ~2.32 bits

        return {
            angleEntropy,
            speedEntropy,
            totalEntropy: (angleEntropy + speedEntropy) / 2
        };
    }

    /**
     * Analyzes keystroke entropy.
     * Considers timing intervals and key codes.
     * @param {Array} keyHistory 
     */
    analyzeKeyEntropy(keyHistory) {
        if (keyHistory.length < 5) return 0;

        const recent = keyHistory.slice(-this.windowSize);

        // Quantize intervals (e.g., <100ms, 100-300ms, >300ms)
        const intervalExtractor = (k) => {
            const i = k.interval;
            if (i < 100) return 'FAST';
            if (i < 300) return 'MED';
            return 'SLOW';
        };

        // Key repetition
        const keyExtractor = (k) => k.code;

        const timingEntropy = this.calculateEntropy(recent, intervalExtractor);
        const keyEntropy = this.calculateEntropy(recent, keyExtractor);

        return (timingEntropy + keyEntropy) / 2;
    }

    /**
     * Returns a normalized "Predictability Score" (0.0 to 1.0)
     * 1.0 = Highly Predictable (Low Entropy)
     * 0.0 = Highly Random (Max Entropy)
     * @param {number} currentEntropy 
     * @param {number} maxPossibleEntropy 
     */
    getPredictability(currentEntropy, maxPossibleEntropy) {
        if (maxPossibleEntropy === 0) return 1;
        const normalized = MathUtils.clamp(currentEntropy / maxPossibleEntropy, 0, 1);
        return 1 - normalized;
    }
}
