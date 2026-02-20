class NeuralNetworkVisualizer {
  constructor() {
    this.canvas = document.getElementById('networkCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.layers = [];
    this.weights = [];
    this.biases = [];
    this.activations = [];
    this.selectedConnection = null;
    this.animationStep = 0;
    this.isAnimating = false;
    this.autoRunInterval = null;

    this.setupCanvas();
    this.setupControls();
    this.buildNetwork();
    this.setupEventListeners();
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth - 40;
    this.canvas.height = Math.max(500, container.clientHeight - 40);
  }

  setupControls() {
    this.hiddenLayersSelect = document.getElementById('hiddenLayers');
    this.neuronsPerLayerSelect = document.getElementById('neuronsPerLayer');
    this.activationSelect = document.getElementById('activation');
    this.rebuildBtn = document.getElementById('rebuildBtn');
    this.randomizeBtn = document.getElementById('randomizeBtn');
    this.stepBtn = document.getElementById('stepBtn');
    this.autoBtn = document.getElementById('autoBtn');
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.draw();
    });

    this.rebuildBtn.addEventListener('click', () => this.buildNetwork());
    this.randomizeBtn.addEventListener('click', () => this.randomizeWeights());
    this.stepBtn.addEventListener('click', () => this.stepForward());
    this.autoBtn.addEventListener('click', () => this.toggleAutoRun());

    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
  }

  buildNetwork() {
    const hiddenLayers = parseInt(this.hiddenLayersSelect.value);
    const neuronsPerLayer = parseInt(this.neuronsPerLayerSelect.value);

    this.layers = [2];
    for (let i = 0; i < hiddenLayers; i++) {
      this.layers.push(neuronsPerLayer);
    }
    this.layers.push(1);

    this.weights = [];
    this.biases = [];
    this.activations = [];

    for (let i = 0; i < this.layers.length; i++) {
      this.activations.push(new Array(this.layers[i]).fill(0));
    }

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layerWeights = [];
      for (let j = 0; j < this.layers[i]; j++) {
        const neuronWeights = [];
        for (let k = 0; k < this.layers[i + 1]; k++) {
          neuronWeights.push((Math.random() * 2 - 1).toFixed(2));
        }
        layerWeights.push(neuronWeights);
      }
      this.weights.push(layerWeights);
    }

    for (let i = 1; i < this.layers.length; i++) {
      this.biases.push(new Array(this.layers[i]).fill(0).map(() => (Math.random() * 2 - 1).toFixed(2)));
    }

    this.animationStep = 0;
    this.updateNetworkInfo();
    this.setupInputSliders();
    this.draw();
  }

  randomizeWeights() {
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        for (let k = 0; k < this.weights[i][j].length; k++) {
          this.weights[i][j][k] = (Math.random() * 2 - 1).toFixed(2);
        }
      }
    }

    for (let i = 0; i < this.biases.length; i++) {
      for (let j = 0; j < this.biases[i].length; j++) {
        this.biases[i][j] = (Math.random() * 2 - 1).toFixed(2);
      }
    }

    this.animationStep = 0;
    this.draw();
  }

  setupInputSliders() {
    const container = document.getElementById('inputSliders');
    container.innerHTML = '';

    for (let i = 0; i < this.layers[0]; i++) {
      const group = document.createElement('div');
      group.className = 'slider-group';

      const label = document.createElement('label');
      label.textContent = `Input ${i + 1}:`;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '1';
      slider.step = '0.01';
      slider.value = '0.5';

      slider.addEventListener('input', () => {
        this.activations[0][i] = parseFloat(slider.value);
        this.animationStep = 0;
        this.draw();
      });

      group.appendChild(label);
      group.appendChild(slider);
      container.appendChild(group);

      this.activations[0][i] = 0.5;
    }

    this.draw();
  }

  getActivationFunction(x) {
    const func = this.activationSelect.value;
    switch (func) {
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'relu':
        return Math.max(0, x);
      case 'tanh':
        return Math.tanh(x);
      default:
        return 1 / (1 + Math.exp(-x));
    }
  }

  getActivationDerivative(x) {
    const func = this.activationSelect.value;
    const sigmoid = 1 / (1 + Math.exp(-x));
    switch (func) {
      case 'sigmoid':
        return sigmoid * (1 - sigmoid);
      case 'relu':
        return x > 0 ? 1 : 0;
      case 'tanh':
        return 1 - Math.pow(Math.tanh(x), 2);
      default:
        return sigmoid * (1 - sigmoid);
    }
  }

  stepForward() {
    if (this.animationStep >= this.layers.length - 1) {
      this.animationStep = 0;
    }

    const targetLayer = this.animationStep + 1;

    for (let j = 0; j < this.layers[targetLayer]; j++) {
      let sum = this.biases[targetLayer - 1][j];
      for (let i = 0; i < this.layers[targetLayer - 1]; i++) {
        sum += parseFloat(this.activations[targetLayer - 1][i]) *
                parseFloat(this.weights[targetLayer - 1][i][j]);
      }
      this.activations[targetLayer][j] = this.getActivationFunction(sum);
    }

    this.animationStep++;
    this.updateNetworkInfo();
    this.draw();
  }

  toggleAutoRun() {
    if (this.autoRunInterval) {
      clearInterval(this.autoRunInterval);
      this.autoRunInterval = null;
      this.autoBtn.textContent = 'Auto Run';
    } else {
      this.autoRunInterval = setInterval(() => {
        if (this.animationStep >= this.layers.length - 1) {
          this.animationStep = 0;
        }
        this.stepForward();
      }, 800);
      this.autoBtn.textContent = 'Stop';
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const layerSpacing = this.canvas.width / (this.layers.length + 1);
    const neuronPositions = [];

    for (let i = 0; i < this.layers.length; i++) {
      const x = layerSpacing * (i + 1);
      neuronPositions[i] = [];

      const neuronSpacing = this.canvas.height / (this.layers[i] + 1);

      for (let j = 0; j < this.layers[i]; j++) {
        const y = neuronSpacing * (j + 1);
        neuronPositions[i].push({ x, y });

        const activation = this.activations[i][j];
        const isActivated = i <= this.animationStep;

        for (let prevI = 0; prevI < i; prevI++) {
          for (let prevJ = 0; prevJ < this.layers[prevI]; prevJ++) {
            const prevX = neuronPositions[prevI][prevJ].x;
            const prevY = neuronPositions[prevI][prevJ].y;

            const weight = this.weights[prevI][prevJ][j];
            const isConnectionActive = prevI < this.animationStep;

            this.ctx.beginPath();
            this.ctx.moveTo(prevX, prevY);
            this.ctx.lineTo(x, y);

            if (isConnectionActive) {
              const gradient = this.ctx.createLinearGradient(prevX, prevY, x, y);
              if (weight >= 0) {
                gradient.addColorStop(0, `rgba(0, 217, 255, ${Math.min(1, Math.abs(weight))})`);
                gradient.addColorStop(1, `rgba(0, 255, 136, ${Math.min(1, Math.abs(weight))})`);
              } else {
                gradient.addColorStop(0, `rgba(255, 100, 100, ${Math.min(1, Math.abs(weight))})`);
                gradient.addColorStop(1, `rgba(255, 150, 50, ${Math.min(1, Math.abs(weight))})`);
              }
              this.ctx.strokeStyle = gradient;
              this.ctx.lineWidth = Math.abs(weight) * 3 + 1;
            } else {
              this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
              this.ctx.lineWidth = 1;
            }

            this.ctx.stroke();
          }
        }
      }
    }

    for (let i = 0; i < this.layers.length; i++) {
      for (let j = 0; j < this.layers[i]; j++) {
        const pos = neuronPositions[i][j];
        const activation = this.activations[i][j];
        const isActivated = i <= this.animationStep;

        const radius = 20;

        const gradient = this.ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
        if (isActivated) {
          const intensity = Math.min(1, Math.abs(activation));
          gradient.addColorStop(0, `rgba(0, 217, 255, ${intensity})`);
          gradient.addColorStop(0.5, `rgba(0, 150, 255, ${intensity * 0.8})`);
          gradient.addColorStop(1, `rgba(0, 100, 200, ${intensity * 0.6})`);
        } else {
          gradient.addColorStop(0, 'rgba(100, 100, 100, 0.5)');
          gradient.addColorStop(1, 'rgba(50, 50, 50, 0.3)');
        }

        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        this.ctx.strokeStyle = isActivated ? '#00d9ff' : '#444';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(activation.toFixed(2), pos.x, pos.y);

        if (i === 0) {
          this.ctx.fillStyle = '#aaa';
          this.ctx.font = '10px Arial';
          this.ctx.fillText(`I${j + 1}`, pos.x, pos.y - radius - 5);
        } else if (i === this.layers.length - 1) {
          this.ctx.fillStyle = '#aaa';
          this.ctx.font = '10px Arial';
          this.ctx.fillText(`O`, pos.x, pos.y - radius - 5);
        }
      }
    }

    this.updateValuesDisplay();
  }

  updateValuesDisplay() {
    const inputContainer = document.getElementById('inputValues');
    const outputContainer = document.getElementById('outputValues');

    inputContainer.innerHTML = this.activations[0]
      .map((val, i) => `<span class="value-tag">I${i + 1}: ${val.toFixed(2)}</span>`)
      .join('');

    const lastLayer = this.layers.length - 1;
    outputContainer.innerHTML = this.activations[lastLayer]
      .map((val, i) => `<span class="value-tag">Output: ${val.toFixed(2)}</span>`)
      .join('');
  }

  updateNetworkInfo() {
    document.getElementById('totalLayers').textContent = this.layers.length;

    let totalWeights = 0;
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        totalWeights += this.weights[i][j].length;
      }
    }
    document.getElementById('totalWeights').textContent = totalWeights;
    document.getElementById('currentStep').textContent = this.animationStep;
  }

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const layerSpacing = this.canvas.width / (this.layers.length + 1);

    for (let i = 0; i < this.layers.length - 1; i++) {
      const neuronSpacing = this.canvas.height / (this.layers[i] + 1);

      for (let j = 0; j < this.layers[i]; j++) {
        const neuronX = layerSpacing * (i + 1);
        const neuronY = neuronSpacing * (j + 1);

        const nextLayerSpacing = this.canvas.height / (this.layers[i + 1] + 1);

        for (let k = 0; k < this.layers[i + 1]; k++) {
          const nextX = layerSpacing * (i + 2);
          const nextY = nextLayerSpacing * (k + 1);

          const midX = (neuronX + nextX) / 2;
          const midY = (neuronY + nextY) / 2;

          const distance = Math.sqrt((x - midX) ** 2 + (y - midY) ** 2);

          if (distance < 10) {
            this.showWeightEditor(i, j, k, this.weights[i][j][k]);
            return;
          }
        }
      }
    }
  }

  showWeightEditor(layer, from, to, currentValue) {
    this.selectedConnection = { layer, from, to };
    const editor = document.getElementById('weightEditor');
    const input = document.getElementById('weightInput');
    input.value = currentValue;
    editor.style.display = 'block';

    document.getElementById('applyWeightBtn').onclick = () => {
      const newValue = parseFloat(input.value);
      if (!isNaN(newValue)) {
        this.weights[this.selectedConnection.layer]
                     [this.selectedConnection.from]
                     [this.selectedConnection.to] = newValue.toFixed(2);
        this.draw();
      }
      editor.style.display = 'none';
      this.selectedConnection = null;
    };

    document.getElementById('cancelWeightBtn').onclick = () => {
      editor.style.display = 'none';
      this.selectedConnection = null;
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NeuralNetworkVisualizer();
});
