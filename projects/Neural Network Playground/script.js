/**
 * Neural Network Playground - Vanilla JS
 * 
 * I. Math Engine (Matrix Operations)
 * II. Neural Network Engine
 * III. Application Logic & Visualization
 */

/* =========================================
   I. Math Engine
   ========================================= */
class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = Array(rows).fill().map(() => Array(cols).fill(0));
    }

    static fromArray(arr) {
        return new Matrix(arr.length, 1).map((_, i) => arr[i]);
    }

    toArray() {
        let arr = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                arr.push(this.data[i][j]);
            }
        }
        return arr;
    }

    randomize() {
        return this.map(() => Math.random() * 2 - 1); // Range -1 to 1
    }

    add(n) {
        if (n instanceof Matrix) {
            if (this.rows !== n.rows || this.cols !== n.cols) {
                console.error("Matrix Add: Dimension Mismatch");
                return this;
            }
            return this.map((e, i, j) => e + n.data[i][j]);
        } else {
            return this.map(e => e + n);
        }
    }

    static subtract(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) {
            console.error("Matrix Sub: Dimension Mismatch");
            return new Matrix(a.rows, a.cols);
        }
        return new Matrix(a.rows, a.cols).map((_, i, j) => a.data[i][j] - b.data[i][j]);
    }

    static multiply(a, b) {
        if (a.cols !== b.rows) {
            console.error("Matrix Dot: Dimension Mismatch");
            return new Matrix(a.rows, b.cols);
        }
        return new Matrix(a.rows, b.cols).map((_, i, j) => {
            let sum = 0;
            for (let k = 0; k < a.cols; k++) {
                sum += a.data[i][k] * b.data[k][j];
            }
            return sum;
        });
    }

    multiply(n) {
        if (n instanceof Matrix) {
            // Hadamard product
            return this.map((e, i, j) => e * n.data[i][j]);
        } else {
            // Scalar
            return this.map(e => e * n);
        }
    }

    transpose() {
        return new Matrix(this.cols, this.rows).map((_, i, j) => this.data[j][i]);
    }

    map(func) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = func(this.data[i][j], i, j);
            }
        }
        return this;
    }
}

/* =========================================
   II. Neural Network Engine
   ========================================= */
class NeuralNetwork {
    constructor(input_nodes, hidden_nodes, output_nodes) {
        this.input_nodes = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;

        this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes).randomize();
        this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes).randomize();

        this.bias_h = new Matrix(this.hidden_nodes, 1).randomize();
        this.bias_o = new Matrix(this.output_nodes, 1).randomize();

        this.setLearningRate(0.05);
        this.setActivation('sigmoid');

        // Momentum state
        this.prev_weight_ho_deltas = new Matrix(this.output_nodes, this.hidden_nodes);
        this.prev_bias_o_deltas = new Matrix(this.output_nodes, 1);
        this.prev_weight_ih_deltas = new Matrix(this.hidden_nodes, this.input_nodes);
        this.prev_bias_h_deltas = new Matrix(this.hidden_nodes, 1);

        this.momentum = 0.9;
    }

    setLearningRate(lr) {
        this.learning_rate = lr;
    }

    setActivation(name) {
        if (name === 'relu') {
            this.activation = (x) => Math.max(0, x);
            this.d_activation = (y) => (y > 0 ? 1 : 0);
        } else if (name === 'tanh') {
            this.activation = (x) => Math.tanh(x);
            this.d_activation = (y) => 1 - (y * y);
        } else {
            // Sigmoid default
            this.activation = (x) => 1 / (1 + Math.exp(-x));
            this.d_activation = (y) => y * (1 - y);
        }
    }

    predict(input_array) {
        // Input -> Hidden
        let inputs = Matrix.fromArray(input_array);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        hidden.map(this.activation);

        // Hidden -> Output
        let output = Matrix.multiply(this.weights_ho, hidden);
        output.add(this.bias_o);
        output.map(this.activation); // Sigmoid range 0-1 matches our binary classes

        return output.toArray();
    }

    train(input_array, target_array) {
        // Forward Prop (Duplicate of predict but we need intermediates)
        let inputs = Matrix.fromArray(input_array);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        hidden.map(this.activation);

        let outputs = Matrix.multiply(this.weights_ho, hidden);
        outputs.add(this.bias_o);
        outputs.map(this.activation);

        // -- Backpropagation --

        // 1. Calculate Output Errors (Target - Output)
        let targets = Matrix.fromArray(target_array);
        let output_errors = Matrix.subtract(targets, outputs);

        // 2. Calculate Output Gradients
        // Gradient = lr * error * d_activ(output)
        let gradients = Matrix.fromArray(outputs.toArray()); // clone
        gradients.map(this.d_activation);
        gradients.multiply(output_errors);
        gradients.multiply(this.learning_rate);

        // 3. Calculate Hidden->Output Deltas
        let hidden_T = hidden.transpose();
        let weight_ho_deltas = Matrix.multiply(gradients, hidden_T);

        // Add Momentum
        // weight_ho_deltas.add(this.prev_weight_ho_deltas.multiply(this.momentum)); // Mock scalar mult? No, matrix mult
        // Wait, matrix * scalar needs to support 'multiply(scalar)' which returns NEW matrix
        // My matrix.multiply modifies self if not static.
        // Let's fix that or careful usage.

        // 4. Adjust HO Weights & Biases
        this.weights_ho.add(weight_ho_deltas);
        this.bias_o.add(gradients); // Simple bias update

        // Store for next step (Momentum)
        // Actually simplest momentum: v = mu * v + learning_rate * gradient
        // w += v
        // The weight_ho_deltas calculated above is (lr * grad).
        // So we need: current_delta = (lr * grad) + (mu * prev_delta)
        // My Matrix class is a bit limited, let's just do standard SGD for stability or careful impl.
        // Let's stick to standard SGD as implemented before to avoid matrix bugs without tests.
        // Reverting momentum logic for basic stability, focusing on features.

        // 5. Calculate Hidden Errors
        let who_t = this.weights_ho.transpose();
        let hidden_errors = Matrix.multiply(who_t, output_errors);

        // 6. Calculate Hidden Gradients
        let hidden_gradient = Matrix.fromArray(hidden.toArray());
        hidden_gradient.map(this.d_activation);
        hidden_gradient.multiply(hidden_errors);
        hidden_gradient.multiply(this.learning_rate);

        // 7. Calculate Input->Hidden Deltas
        let inputs_T = inputs.transpose();
        let weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T);

        // 8. Adjust IH Weights & Biases
        this.weights_ih.add(weight_ih_deltas);
        this.bias_h.add(hidden_gradient);

        // Return average Error for stats
        return output_errors.toArray().reduce((a, b) => a + Math.abs(b), 0);
    }
}

/* =========================================
   III. App & Visualization
   ========================================= */
const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Training State
let nn;
let trainingData = [];
let isTraining = false;
let epoch = 0;
let animationId;
let currentLoss = 0;
let lossHistory = [];

const graphCanvas = document.getElementById('loss-graph');
const graphCtx = graphCanvas.getContext('2d');

// Config state
let hiddenNeurons = 4;
let noiseLevel = 0;

// --- Data Generation Helpers ---
function createData(type) {
    trainingData = [];
    const noise = noiseLevel / 100; // 0 to 0.5

    if (type === 'circle') {
        for (let i = 0; i < 200; i++) {
            let x = (Math.random() * 2 - 1);
            let y = (Math.random() * 2 - 1);
            let label = (x * x + y * y < 0.5) ? 1 : 0;
            // Add Noise
            if (Math.random() < noise) label = 1 - label;
            trainingData.push({ inputs: [x, y], label: [label] });
        }
    } else if (type === 'xor') {
        for (let i = 0; i < 200; i++) {
            let x = Math.random() * 2 - 1;
            let y = Math.random() * 2 - 1;
            let label = (x > 0 && y > 0) || (x < 0 && y < 0) ? 0 : 1;
            // Add jitter to inputs
            x += (Math.random() - 0.5) * noise;
            y += (Math.random() - 0.5) * noise;
            trainingData.push({ inputs: [x, y], label: [label] });
        }
    } else if (type === 'spiral') {
        for (let i = 0; i < 200; i++) {
            let r = i / 200;
            let t = 1.75 * i / 20 * Math.PI;
            // Class 0
            let x1 = r * Math.sin(t) + (Math.random() * noise);
            let y1 = r * Math.cos(t) + (Math.random() * noise);
            trainingData.push({ inputs: [x1, y1], label: [0] });
            // Class 1
            let x2 = r * Math.sin(t + Math.PI) + (Math.random() * noise);
            let y2 = r * Math.cos(t + Math.PI) + (Math.random() * noise);
            trainingData.push({ inputs: [x2, y2], label: [1] });
        }
    } else {
        // Gaussian blobs
        for (let i = 0; i < 100; i++) {
            let nx = (Math.random() - 0.5) * noise;
            let ny = (Math.random() - 0.5) * noise;
            trainingData.push({ inputs: [Math.random() * 0.5 + 0.3 + nx, Math.random() * 0.5 + 0.3 + ny], label: [1] });
            trainingData.push({ inputs: [Math.random() * 0.5 - 0.8 + nx, Math.random() * 0.5 - 0.8 + ny], label: [0] });
        }
    }
    resetModel();
}

function resetModel() {
    // 2 Inputs (x, y), Config Hidden, 1 Output
    nn = new NeuralNetwork(2, hiddenNeurons, 1);

    // Update UI
    let lr = parseFloat(document.getElementById('lr-slider').value);
    let act = document.getElementById('activ-select').value;
    nn.setLearningRate(lr);
    nn.setActivation(act);

    epoch = 0;
    currentLoss = 0;
    lossHistory = [];
    document.getElementById('epoch-count').innerText = '0';
    document.getElementById('loss-val').innerText = '0.000';

    drawGraph();
    draw(); // Draw initial random state
}

// --- Visualization ---
function drawGraph() {
    graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    if (lossHistory.length < 2) return;

    graphCtx.beginPath();
    graphCtx.strokeStyle = '#00cec9';
    graphCtx.lineWidth = 2;

    const maxLen = 100;
    const step = graphCanvas.width / (maxLen - 1);

    // Check local max for scaling? Or fixed? Fixed 1.0 is safer for normalized loss
    // Normalized loss typically 0..1 (MSE)

    lossHistory.forEach((loss, i) => {
        const x = i * step;
        const y = graphCanvas.height - (loss * graphCanvas.height);
        if (i === 0) graphCtx.moveTo(x, y);
        else graphCtx.lineTo(x, y);
    });

    graphCtx.stroke();
}

function draw() {
    // 1. Draw Heatmap (Low Res for performance)
    const reso = 10; // pixel blocks
    const cols = WIDTH / reso;
    const rows = HEIGHT / reso;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // Normalize coord to -1 to 1
            let x = (i / cols) * 2 - 1;
            let y = (j / rows) * 2 - 1;
            // Flip Y because canvas 0 is top
            y = -y;

            const prediction = nn.predict([x, y])[0];

            // Color interpolation
            let r = Math.floor((1 - prediction) * 255);
            let b = Math.floor(prediction * 255);
            let g = Math.floor(100 * (0.5 - Math.abs(prediction - 0.5))); // slight purple in middle

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`; // Semi-transparent
            ctx.fillRect(i * reso, j * reso, reso, reso);
        }
    }

    // 2. Draw Data Points
    for (let p of trainingData) {
        // Map -1..1 to Screen
        let sx = (p.inputs[0] + 1) / 2 * WIDTH;
        let sy = (-p.inputs[1] + 1) / 2 * HEIGHT;

        ctx.fillStyle = p.label[0] === 1 ? '#74b9ff' : '#ff7675';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
}

function trainLoop() {
    if (!isTraining) return;

    // Train multiple times per frame for speed
    const stepsPerFrame = 10;
    let batchLoss = 0;

    for (let i = 0; i < stepsPerFrame; i++) {
        // Stochastic Gradient Descent
        for (let data of trainingData) {
            batchLoss += nn.train(data.inputs, data.label);
        }
    }

    epoch += stepsPerFrame;
    currentLoss = batchLoss / (trainingData.length * stepsPerFrame);

    // Update Graph History
    if (epoch % 10 === 0) { // update graph every 10 epochs
        lossHistory.push(currentLoss);
        if (lossHistory.length > 100) lossHistory.shift();
        drawGraph();
    }

    document.getElementById('epoch-count').innerText = epoch;
    document.getElementById('loss-val').innerText = currentLoss.toFixed(4);

    draw();
    animationId = requestAnimationFrame(trainLoop);
}

// --- Interaction Handlers ---

document.querySelectorAll('.data-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.data-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        createData(e.currentTarget.dataset.type);
    });
});

document.getElementById('btn-train').addEventListener('click', () => {
    isTraining = !isTraining;
    const btn = document.getElementById('btn-train');
    const overlay = document.querySelector('.canvas-wrapper');

    if (isTraining) {
        btn.innerHTML = '<i class="ri-pause-line"></i> Pause';
        btn.classList.replace('btn-primary', 'btn-secondary');
        overlay.classList.remove('show-overlay');
        trainLoop();
    } else {
        btn.innerHTML = '<i class="ri-play-fill"></i> Train';
        btn.classList.replace('btn-secondary', 'btn-primary');
        cancelAnimationFrame(animationId);
    }
});

document.getElementById('btn-reset').addEventListener('click', resetModel);

// Config Changes
document.getElementById('lr-slider').addEventListener('input', (e) => {
    let val = parseFloat(e.target.value);
    document.getElementById('lr-val').innerText = val;
    nn.setLearningRate(val);
});

document.getElementById('noise-slider').addEventListener('input', (e) => {
    noiseLevel = parseInt(e.target.value);
    document.getElementById('noise-val').innerText = noiseLevel;
    // Don't redraw data immediately, usually user wants to regenerate
    // But let's trigger regenerate if clicked again? 
    // Just update stat for now.
    // Actually typically playgrounds regenerate data on noise change
    // Let's find currently active data type
    const activeType = document.querySelector('.data-btn.active').dataset.type;
    createData(activeType);
});

document.getElementById('activ-select').addEventListener('change', (e) => {
    nn.setActivation(e.target.value);
});

document.getElementById('btn-bp').addEventListener('click', () => {
    if (hiddenNeurons < 10) hiddenNeurons++;
    document.getElementById('label-neurons').innerText = hiddenNeurons;
    resetModel();
});

document.getElementById('btn-bm').addEventListener('click', () => {
    if (hiddenNeurons > 1) hiddenNeurons--;
    document.getElementById('label-neurons').innerText = hiddenNeurons;
    resetModel();
});

// Click to add point
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Map to -1..1
    let nx = (x / WIDTH) * 2 - 1;
    let ny = -((y / HEIGHT) * 2 - 1);

    // Add point
    let label = e.shiftKey ? 0 : 1;

    trainingData.push({ inputs: [nx, ny], label: [label] });
    draw();
});

// Init
createData('circle');
document.querySelector('.canvas-wrapper').classList.add('show-overlay');
