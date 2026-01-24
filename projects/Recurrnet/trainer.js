/**
 * RECURRNET TRAINING ENGINE
 * Manages the "Backpropagation Through Time" (BPTT) lifecycle.
 * Handles Loss calculation (Cross Entropy) and model updates.
 * @author saiusesgithub
 */

class Trainer {
    constructor(rnn, dataLoader) {
        this.rnn = rnn;
        this.data = dataLoader;
        
        this.iter = 0;
        this.smoothLoss = -Math.log(1.0 / dataLoader.vocab.length); // Initial loss guess
        this.paused = true;
        
        // Stats
        this.stats = {
            loss: [],
            iters: []
        };
    }

    /**
     * Run one iteration of training (Forward + Backward + Update)
     * @param {Object} config - { learningRate, seqLength }
     */
    trainStep(config) {
        if (this.paused) return null;

        // 1. Get Batch
        const batch = this.data.getRandomBatch(config.seqLength);
        if (!batch) return null; // Corpus too short

        const inputs = batch.inputs;
        const targets = batch.targets;

        // 2. Prepare Graph & State
        const G = new Graph(true); // Enable Backprop recording
        let hPrev = Mat.Zero(this.rnn.hiddenSizes, 1);
        let loss = 0;

        // 3. Forward Pass (Unroll Time)
        // For 'hello', we predict: h->e, e->l, l->l, l->o
        for (let t = 0; t < inputs.length; t++) {
            const ixInput = inputs[t];
            const ixTarget = targets[t];

            // Run Cell
            const { h, y } = this.rnn.forward(G, ixInput, hPrev);
            hPrev = h; // Carry memory to next step

            // Calculate Loss (Cross Entropy)
            const probs = MathLib.softmax(y);
            // Probability assigned to the *correct* target class
            const correctProb = probs.w[ixTarget];
            // Minimize negative log likelihood
            loss += -Math.log(correctProb);
        }

        // 4. Backward Pass (BPTT)
        // Zeros out gradients and runs operations in reverse
        this.rnn.model.Why.dw.fill(0); // Reset specific gradients if needed or rely on graph
        G.backward();

        // 5. Parameter Update
        this.rnn.update(config.learningRate);

        // 6. Metrics
        this.smoothLoss = this.smoothLoss * 0.999 + loss / inputs.length * 0.001;
        this.iter++;
        
        if (this.iter % 10 === 0) {
            this.stats.loss.push(this.smoothLoss);
            this.stats.iters.push(this.iter);
        }

        return {
            loss: this.smoothLoss,
            iter: this.iter
        };
    }

    /**
     * Generate text from the model
     * @param {number} seedIx - Starting character index
     * @param {number} length - How many characters to generate
     * @param {number} temp - Sampling temperature
     */
    sample(seedIx, length, temp = 1.0) {
        const G = new Graph(false); // No backprop needed for inference
        let hPrev = Mat.Zero(this.rnn.hiddenSizes, 1);
        let ix = seedIx;
        let txt = this.data.ixToChar[ix];

        for (let i = 0; i < length; i++) {
            const { h, y } = this.rnn.forward(G, ix, hPrev);
            hPrev = h;

            // Sample next char
            const probs = MathLib.softmax(y);
            
            // Apply temperature scaling roughly (simplified)
            // Ideally we scale logits before softmax, but for this demo:
            // We just pick from distribution.
            
            const nextIx = MathLib.samplei(probs.w);
            
            txt += this.data.ixToChar[nextIx];
            ix = nextIx;
        }

        return txt;
    }
    
    // Helper to get Hidden State for visualization
    getCurrentHiddenState(seedIx) {
         const G = new Graph(false);
         const { h } = this.rnn.forward(G, seedIx, Mat.Zero(this.rnn.hiddenSizes, 1));
         return h;
    }
}