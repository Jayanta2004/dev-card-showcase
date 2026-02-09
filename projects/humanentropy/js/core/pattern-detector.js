/**
 * PatternDetector
 * Identifies repeating sequences and biases in user behavior.
 * Uses a simplified Markov Chain to predict next actions.
 */
export class PatternDetector {
    constructor() {
        this.markovChain = {}; // State -> { NextState -> Count }
        this.order = 2; // N-gram size (look at last 2 states to predict next)
        this.totalPredictions = 0;
        this.successfulPredictions = 0;
    }

    /**
     * Updates the model with a new sequence of data.
     * @param {Array} sequence - Array of quantized states (strings/numbers)
     */
    train(sequence) {
        if (sequence.length < this.order + 1) return;

        // Reset chain to adapt to *current* behavior context 
        // (we want local predictability, not lifetime)
        this.markovChain = {};

        for (let i = 0; i < sequence.length - this.order; i++) {
            const state = sequence.slice(i, i + this.order).join('|');
            const next = sequence[i + this.order];

            if (!this.markovChain[state]) {
                this.markovChain[state] = {};
            }
            if (!this.markovChain[state][next]) {
                this.markovChain[state][next] = 0;
            }
            this.markovChain[state][next]++;
        }
    }

    /**
     * Predicts the next state based on current history.
     * @param {Array} currentHistory - Recent states
     * @returns {Object|null} Prediction { state, probability }
     */
    predict(currentHistory) {
        if (currentHistory.length < this.order) return null;

        const currentState = currentHistory.slice(-this.order).join('|');
        const transitions = this.markovChain[currentState];

        if (!transitions) return null;

        let total = 0;
        let bestState = null;
        let maxCount = -1;

        for (const next in transitions) {
            const count = transitions[next];
            total += count;
            if (count > maxCount) {
                maxCount = count;
                bestState = next;
            }
        }

        if (total === 0) return null;

        return {
            state: bestState,
            probability: maxCount / total
        };
    }

    /**
     * Checks if the user is stuck in a loop.
     * @param {Array} sequence 
     * @returns {boolean}
     */
    detectLoop(sequence) {
        if (sequence.length < 6) return false;

        // Simple check for repeating sub-patterns like A-B-A-B
        const recent = sequence.slice(-6);
        const str = recent.join(',');
        // A naive regex for 3 repetitions of length 1 or 2
        // e.g. "L,R,L,R,L,R"

        // Let's iterate various period lengths
        for (let period = 1; period <= 3; period++) {
            let isLoop = true;
            // Check last 2 periods against current
            // [ ... p1 p2 p3 ]
            const last = recent.slice(-period).join('|');
            const prev = recent.slice(-period * 2, -period).join('|');
            const prev2 = recent.slice(-period * 3, -period * 2).join('|');

            if (last === prev && prev === prev2) return true;
        }

        return false;
    }
}
