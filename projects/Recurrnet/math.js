/**
 * RECURRNET MATH KERNEL
 * A specialized linear algebra library for Neural Networks.
 * Stores values (w) and gradients (dw) for Backpropagation.
 * @author saiusesgithub
 */

class Mat {
    constructor(n, d) {
        this.n = n; // Rows
        this.d = d; // Cols
        this.w = new Float64Array(n * d); // Weights
        this.dw = new Float64Array(n * d); // Gradients
    }

    get(row, col) {
        return this.w[this.d * row + col];
    }

    set(row, col, v) {
        this.w[this.d * row + col] = v;
    }

    // Initialize with Gaussian distribution (Xavier/Glorot init logic handled in RNN)
    static Random(n, d, scale = 0.08) {
        const m = new Mat(n, d);
        for (let i = 0; i < n * d; i++) {
            m.w[i] = Math.random() * 2 * scale - scale;
        }
        return m;
    }

    static Zero(n, d) {
        return new Mat(n, d);
    }

    /**
     * SERIALIZATION
     * Save/Load models to JSON
     */
    toJSON() {
        return {
            n: this.n,
            d: this.d,
            w: Array.from(this.w)
        };
    }

    static fromJSON(json) {
        const m = new Mat(json.n, json.d);
        m.w.set(json.w);
        return m;
    }
}

/**
 * UTILITY FUNCTIONS
 * Core math operations for the network.
 */
const MathLib = {
    
    // Softmax Probability Distribution
    softmax: (m) => {
        const out = new Mat(m.n, m.d);
        let maxVal = -Infinity;
        
        // Find Max for numerical stability
        for(let i=0; i<m.w.length; i++) {
            if(m.w[i] > maxVal) maxVal = m.w[i];
        }

        // Exponentiate
        let sum = 0;
        for(let i=0; i<m.w.length; i++) {
            out.w[i] = Math.exp(m.w[i] - maxVal);
            sum += out.w[i];
        }

        // Normalize
        for(let i=0; i<m.w.length; i++) {
            out.w[i] /= sum;
        }
        return out;
    },

    // Sample index from probability array
    samplei: (w) => {
        const r = Math.random();
        let x = 0;
        let i = 0;
        while (true) {
            x += w[i];
            if (x > r) return i;
            i++;
            if (i >= w.length) return w.length - 1; // Fallback
        }
    },

    // ArgMax (Best prediction)
    maxi: (w) => {
        let maxVal = w[0];
        let maxIx = 0;
        for (let i = 1; i < w.length; i++) {
            if (w[i] > maxVal) {
                maxVal = w[i];
                maxIx = i;
            }
        }
        return maxIx;
    },

    // Gradient Clipping (Prevents Exploding Gradients)
    clipGrads: (mat, clipVal) => {
        for(let i=0; i<mat.dw.length; i++) {
            if(mat.dw[i] > clipVal) mat.dw[i] = clipVal;
            if(mat.dw[i] < -clipVal) mat.dw[i] = -clipVal;
        }
    }
};

/**
 * COMPUTATIONAL GRAPH
 * Records operations to perform Backpropagation automatically.
 * This is a simplified "Autograd" engine.
 */
class Graph {
    constructor(needsBackprop = true) {
        this.needsBackprop = needsBackprop;
        // List of functions to run backward
        this.backprop = []; 
    }

    backward() {
        for (let i = this.backprop.length - 1; i >= 0; i--) {
            this.backprop[i]();
        }
    }

    // --- OPERATIONS ---

    /**
     * Row Pluck: Extracts a single row from a matrix as a column vector.
     * Used for Embedding lookup (One-hot -> Dense).
     */
    rowPluck(m, ix) {
        const d = m.d;
        const out = new Mat(d, 1);
        for (let i = 0; i < d; i++) {
            out.w[i] = m.w[d * ix + i];
        }

        if (this.needsBackprop) {
            this.backprop.push(() => {
                for (let i = 0; i < d; i++) {
                    m.dw[d * ix + i] += out.dw[i];
                }
            });
        }
        return out;
    }

    /**
     * Matrix Multiply: out = m1 * m2
     */
    mul(m1, m2) {
        if (m1.d !== m2.n) throw new Error("MatMul dimensions mismatch");
        
        const n = m1.n;
        const d = m2.d;
        const out = new Mat(n, d);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < d; j++) {
                let dot = 0;
                for (let k = 0; k < m1.d; k++) {
                    dot += m1.w[m1.d * i + k] * m2.w[m2.d * k + j];
                }
                out.w[d * i + j] = dot;
            }
        }

        if (this.needsBackprop) {
            this.backprop.push(() => {
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < d; j++) {
                        const b = out.dw[d * i + j];
                        for (let k = 0; k < m1.d; k++) {
                            m1.dw[m1.d * i + k] += m2.w[m2.d * k + j] * b;
                            m2.dw[m2.d * k + j] += m1.w[m1.d * i + k] * b;
                        }
                    }
                }
            });
        }
        return out;
    }

    /**
     * Element-wise Addition
     */
    add(m1, m2) {
        const out = new Mat(m1.n, m1.d);
        for (let i = 0; i < m1.w.length; i++) {
            out.w[i] = m1.w[i] + m2.w[i];
        }

        if (this.needsBackprop) {
            this.backprop.push(() => {
                for (let i = 0; i < m1.w.length; i++) {
                    m1.dw[i] += out.dw[i];
                    m2.dw[i] += out.dw[i];
                }
            });
        }
        return out;
    }

    /**
     * Hyperbolic Tangent (Tanh) Nonlinearity
     */
    tanh(m) {
        const out = new Mat(m.n, m.d);
        for (let i = 0; i < m.w.length; i++) {
            out.w[i] = Math.tanh(m.w[i]);
        }

        if (this.needsBackprop) {
            this.backprop.push(() => {
                for (let i = 0; i < m.w.length; i++) {
                    // grad = (1 - out^2) * chain_grad
                    const y = out.w[i];
                    m.dw[i] += (1 - y * y) * out.dw[i];
                }
            });
        }
        return out;
    }
}