/**
 * RECURRNET DATA PROVIDER
 * Handles text tokenization, vocabulary mapping, and batch generation.
 * Converts raw text corpus into integer tensors for the RNN.
 * @author saiusesgithub
 */

class TextLoader {
    constructor() {
        this.rawText = "";
        this.vocab = [];
        this.charToIx = {};
        this.ixToChar = {};
        this.indices = [];
        
        this.epochPointer = 0;
    }

    /**
     * Initialize dataset from raw string
     */
    load(text) {
        console.log(`[Data] Loading corpus length: ${text.length}`);
        this.rawText = text;

        // 1. Build Vocabulary (Unique Characters)
        const uniqueChars = new Set(text.split(''));
        this.vocab = Array.from(uniqueChars).sort();
        
        // 2. Build Mappings
        this.charToIx = {};
        this.ixToChar = {};
        
        this.vocab.forEach((char, ix) => {
            this.charToIx[char] = ix;
            this.ixToChar[ix] = char;
        });

        // 3. Convert Corpus to Integers
        this.indices = [];
        for (let i = 0; i < text.length; i++) {
            this.indices.push(this.charToIx[text[i]]);
        }

        console.log(`[Data] Vocab Size: ${this.vocab.length}`);
        
        // Return stats for UI
        return {
            length: this.indices.length,
            vocabSize: this.vocab.length
        };
    }

    /**
     * Get a random batch for training
     * @param {number} seqLength - Size of the time window (e.g., 25 chars)
     * @returns {Object} { inputs: [], targets: [] }
     */
    getRandomBatch(seqLength) {
        // Pick a random starting point
        // Ensure we have enough room for seqLength + 1 (for target)
        const maxIndex = this.indices.length - seqLength - 1;
        if (maxIndex <= 0) return null;

        const p = Math.floor(Math.random() * maxIndex);
        
        const inputs = this.indices.slice(p, p + seqLength);
        
        // Targets are Inputs shifted by 1 to the right
        // If input is "hell", target is "ello"
        const targets = this.indices.slice(p + 1, p + seqLength + 1);

        return { inputs, targets };
    }

    /**
     * Convert integer index to one-hot vector (optional helper)
     * Note: In this project, we use Embedding Lookup (rowPluck) instead of explicit One-Hot
     */
    
    /**
     * Decode integer array back to string
     */
    decode(indices) {
        return indices.map(ix => this.ixToChar[ix]).join('');
    }

    /**
     * Decode probability distribution to a character
     * @param {Mat} probs - Softmax output
     * @param {number} temperature - Randomness (0.1 = conservative, 1.0 = diverse)
     */
    sample(probs, temperature = 1.0) {
        // Apply Temperature
        // log(p) / temp -> exp
        // Simplified: Scale the weights before Softmax usually, 
        // but here we just sample from the distribution provided using weighted random.
        
        // If we want accurate temperature, we need the raw logits, not softmax output.
        // For simplicity in this engine, we use a weighted random sample on the probs directly.
        
        return MathLib.samplei(probs.w);
    }
}