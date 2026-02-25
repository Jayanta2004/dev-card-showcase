document.addEventListener('DOMContentLoaded', function() {
    const networkConfigTextarea = document.getElementById('network-config');
    const stabilizationMethodSelect = document.getElementById('stabilization-method');
    const epochsInput = document.getElementById('epochs');
    const stabilizeBtn = document.getElementById('stabilize-btn');
    const resultsDiv = document.getElementById('results');
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');

    stabilizeBtn.addEventListener('click', runStabilization);

    // Initialize with default network
    initializeDefaultNetwork();

    function initializeDefaultNetwork() {
        const defaultConfig = {
            layers: [784, 256, 128, 64, 10],
            activation: 'relu',
            learningRate: 0.001,
            dropout: 0.2
        };
        networkConfigTextarea.value = JSON.stringify(defaultConfig, null, 2);
        drawNetwork(defaultConfig);
    }

    function runStabilization() {
        try {
            const config = JSON.parse(networkConfigTextarea.value);
            const method = stabilizationMethodSelect.value;
            const epochs = parseInt(epochsInput.value);

            resultsDiv.innerHTML = '<div class="loading">Running neural stabilization...</div>';

            // Simulate stabilization process
            setTimeout(() => {
                const results = simulateStabilization(config, method, epochs);
                displayResults(results);
                drawNetwork(config, results);
            }, 2000);

        } catch (error) {
            resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    function simulateStabilization(config, method, epochs) {
        // Simulate neural network stabilization metrics
        const baseStability = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
        const baseConvergence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
        const baseGeneralization = Math.random() * 0.2 + 0.8; // 0.8 to 1.0

        // Method-specific adjustments
        const methodMultipliers = {
            'gradient-clipping': { stability: 1.1, convergence: 0.95, generalization: 1.0 },
            'batch-normalization': { stability: 1.15, convergence: 1.1, generalization: 1.05 },
            'layer-normalization': { stability: 1.12, convergence: 1.08, generalization: 1.03 },
            'dropout': { stability: 1.05, convergence: 0.9, generalization: 1.2 },
            'weight-decay': { stability: 1.08, convergence: 1.05, generalization: 1.1 }
        };

        const multipliers = methodMultipliers[method];

        return {
            method: method,
            epochs: epochs,
            stabilityScore: Math.min(baseStability * multipliers.stability, 1.0),
            convergenceSpeed: baseConvergence * multipliers.convergence,
            generalizationError: (1 - baseGeneralization) * (1 / multipliers.generalization),
            trainingAccuracy: Math.random() * 0.2 + 0.8,
            validationAccuracy: Math.random() * 0.25 + 0.75,
            finalLoss: Math.random() * 0.1 + 0.05,
            gradientNorm: Math.random() * 0.5 + 0.1,
            weightVariance: Math.random() * 0.3 + 0.1,
            layerActivations: config.layers.map(() => Math.random() * 0.4 + 0.3)
        };
    }

    function displayResults(results) {
        const formatPercent = (value) => (value * 100).toFixed(1) + '%';
        const formatDecimal = (value) => value.toFixed(4);

        resultsDiv.innerHTML = `
            <div class="metric">
                <span class="metric-label">Stabilization Method:</span>
                <span class="metric-value">${results.method.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Training Epochs:</span>
                <span class="metric-value">${results.epochs}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Stability Score:</span>
                <span class="metric-value">${formatPercent(results.stabilityScore)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Convergence Speed:</span>
                <span class="metric-value">${formatPercent(results.convergenceSpeed)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Generalization Error:</span>
                <span class="metric-value">${formatPercent(results.generalizationError)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Training Accuracy:</span>
                <span class="metric-value">${formatPercent(results.trainingAccuracy)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Validation Accuracy:</span>
                <span class="metric-value">${formatPercent(results.validationAccuracy)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Final Loss:</span>
                <span class="metric-value">${formatDecimal(results.finalLoss)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Gradient Norm:</span>
                <span class="metric-value">${formatDecimal(results.gradientNorm)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Weight Variance:</span>
                <span class="metric-value">${formatDecimal(results.weightVariance)}</span>
            </div>
        `;
    }

    function drawNetwork(config, results = null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const layers = config.layers;
        const layerSpacing = canvas.width / (layers.length + 1);
        const maxNodes = Math.max(...layers);
        const nodeRadius = Math.min(15, canvas.height / (maxNodes * 2));

        // Draw connections
        for (let i = 0; i < layers.length - 1; i++) {
            const x1 = layerSpacing * (i + 1);
            const x2 = layerSpacing * (i + 2);
            const nodes1 = layers[i];
            const nodes2 = layers[i + 1];

            for (let j = 0; j < nodes1; j++) {
                for (let k = 0; k < nodes2; k++) {
                    const y1 = (canvas.height / (nodes1 + 1)) * (j + 1);
                    const y2 = (canvas.height / (nodes2 + 1)) * (k + 1);

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = results ? getConnectionColor(results, i) : 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        layers.forEach((nodeCount, layerIndex) => {
            const x = layerSpacing * (layerIndex + 1);

            for (let i = 0; i < nodeCount; i++) {
                const y = (canvas.height / (nodeCount + 1)) * (i + 1);

                ctx.beginPath();
                ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
                ctx.fillStyle = results ? getNodeColor(results, layerIndex) : '#3498db';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Add activation value if results available
                if (results && results.layerActivations) {
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(results.layerActivations[layerIndex].toFixed(2), x, y + 3);
                }
            }
        });
    }

    function getConnectionColor(results, layerIndex) {
        const stability = results.stabilityScore;
        const alpha = Math.min(stability * 0.8 + 0.2, 1);
        return `rgba(46, 204, 113, ${alpha})`;
    }

    function getNodeColor(results, layerIndex) {
        const activation = results.layerActivations[layerIndex];
        const intensity = Math.min(activation * 255, 255);
        return `rgb(${Math.floor(intensity)}, ${Math.floor(100 + intensity * 0.5)}, ${Math.floor(150 + intensity * 0.3)})`;
    }

    // Update visualization when config changes
    networkConfigTextarea.addEventListener('input', function() {
        try {
            const config = JSON.parse(this.value);
            drawNetwork(config);
        } catch (e) {
            // Invalid JSON, skip update
        }
    });
});