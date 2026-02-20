/**
 * SequenceEngine - Manages a queue of words and automates the transition
 * between different typographic states in the simulation. This creates
 * a narrative or thematic flow for the living typography.
 * 
 * @class SequenceEngine
 */
export class SequenceEngine {
    /**
     * Initializes the sequence engine.
     * @param {Object} simulation - Reference to the main Simulation instance.
     */
    constructor(simulation) {
        /** @type {Object} The simulation being controlled */
        this.simulation = simulation;

        /** @type {string[]} List of words in the current sequence */
        this.words = [];

        /** @type {number} Index of the current active word */
        this.currentIndex = 0;

        /** @type {number} Duration for each word in milliseconds */
        this.interval = 5000;

        /** @type {number|null} Native interval ID for the update loop */
        this.timer = null;

        /** @type {boolean} Toggle for automatic sequence progression */
        this.isActive = false;

        /** @type {Function|null} Callback for when a word changes */
        this.onWordChange = null;
    }

    /**
     * Starts the automatic sequence progression.
     * @param {string[]} [words] - Optional new set of words to sequence.
     * @param {number} [interval=5000] - Time to stay on each word.
     */
    start(words = null, interval = 5000) {
        if (words) this.words = words;
        this.interval = interval;
        this.isActive = true;

        if (this.timer) clearInterval(this.timer);

        this.timer = setInterval(() => {
            if (this.isActive && this.words.length > 0) {
                this.next();
            }
        }, this.interval);

        console.log("SequenceEngine: Progression started.");
    }

    /**
     * Stops the automatic progression.
     */
    stop() {
        this.isActive = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        console.log("SequenceEngine: Progression stopped.");
    }

    /**
     * Morphs the simulation to the next word in the sequence.
     */
    next() {
        if (this.words.length === 0) return;

        this.currentIndex = (this.currentIndex + 1) % this.words.length;
        const word = this.words[this.currentIndex];

        this.simulation.updateTargets(word);

        if (this.onWordChange) {
            this.onWordChange(word);
        }
    }

    /**
     * Morphs the simulation to the previous word in the sequence.
     */
    previous() {
        if (this.words.length === 0) return;

        this.currentIndex = (this.currentIndex - 1 + this.words.length) % this.words.length;
        const word = this.words[this.currentIndex];

        this.simulation.updateTargets(word);

        if (this.onWordChange) {
            this.onWordChange(word);
        }
    }

    /**
     * Adds a word to the sequence queue.
     * @param {string} word 
     */
    addWord(word) {
        this.words.push(word.toUpperCase());
    }

    /**
     * Clears the current sequence queue.
     */
    clear() {
        this.words = [];
        this.currentIndex = 0;
    }

    /**
     * Updates the interval speed on the fly.
     * @param {number} ms 
     */
    setInterval(ms) {
        this.interval = ms;
        if (this.isActive) {
            this.start();
        }
    }
}
