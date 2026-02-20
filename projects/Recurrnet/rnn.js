/**
 * RECURRNET MODEL
 * Implements a vanilla RNN architecture with Adagrad optimization.
 * Manages weights, forward passes, and parameter updates.
 * @author saiusesgithub
 */

class RNN {
    constructor(inputSize, hiddenSizes, outputSize) {
        // Hyperparameters
        this.inputSize = inputSize;   // Vocab size
        this.hiddenSizes = hiddenSizes;
        this.outputSize = outputSize; // Vocab size

        // Model Parameters
        this.model = {};
        
        // Xavier Initialization Scale
        const scale = 1.0 / Math.sqrt(hiddenSizes);

        // 1. Input Embedding (One-hot -> Hidden)
        this.model['Wxh'] = Mat.Random(hiddenSizes, inputSize, scale);
        
        // 2. Recurrent Connections (Hidden -> Hidden)
        this.model['Whh'] = Mat.Random(hiddenSizes, hiddenSizes, scale);
        
        // 3. Output Projection (Hidden -> Output)
        this.model['Why'] = Mat.Random(outputSize, hiddenSizes, scale);
        
        // 4. Biases
        this.model['bh'] = Mat.Zero(hiddenSizes, 1);
        this.model['by'] = Mat.Zero(outputSize, 1);

        // Optimizer Memory (Adagrad Cache)
        this.solverStats = {};
        for (let k in this.model) {
            this.solverStats[k] = Mat.Zero(this.model[k].n, this.model[k].d);
        }
    }

    /**
     * Forward Pass for a single time step
     * @param {Graph} g - The computational graph to record ops
     * @param {number} ix - Input character index
     * @param {Mat} prevH - Previous hidden state
     * @returns {Object} { h: newHidden, y: outputLogits }
     */
    forward(g, ix, prevH) {
        // 1. Embedding Lookup: Wxh[ix]
        // Effectively: input_vector * Wxh
        const x = g.rowPluck(this.model['Wxh'], ix);

        // 2. Hidden State Update
        // h = tanh( Wxh*x + Whh*h_prev + bias )
        const h0 = g.mul(this.model['Whh'], prevH);
        const h1 = g.add(h0, x);
        const h2 = g.add(h1, this.model['bh']);
        const h = g.tanh(h2);

        // 3. Output Logic
        // y = Why*h + bias
        const y0 = g.mul(this.model['Why'], h);
        const y = g.add(y0, this.model['by']);

        return { h, y };
    }

    /**
     * Perform Parameter Update using Adagrad
     * @param {number} lr - Learning Rate
     */
    update(lr) {
        for (let k in this.model) {
            const m = this.model[k];
            const s = this.solverStats[k];
            
            for (let i = 0; i < m.w.length; i++) {
                // Gradient Clipping
                let grad = m.dw[i];
                if (grad > 5.0) grad = 5.0;
                if (grad < -5.0) grad = -5.0;

                // Adagrad: Accumulate gradient squares
                s.w[i] += grad * grad;
                
                // Update Weight: w -= lr * grad / sqrt(sum_squares + epsilon)
                m.w[i] -= lr * grad / Math.sqrt(s.w[i] + 1e-8);
                
                // Reset Gradient for next batch
                m.dw[i] = 0;
            }
        }
    }
}