// Adaptive Learning Rate Scheduler - JavaScript Implementation
// Author: AI Assistant
// Date: 2026
// Description: Interactive learning rate scheduler with visualizations and training demos

// Global variables
let currentScheduler = 'step';
let lrChart = null;
let comparisonChart = null;
let lossChart = null;
let trainingLrChart = null;
let isTraining = false;
let trainingData = [];

// Scheduler configurations
const schedulerConfigs = {
    step: {
        title: 'Step Decay Scheduler',
        description: 'Reduces learning rate by a factor at regular intervals. Simple and effective for many applications.',
        formula: 'lr = initial_lr * γ^(floor(step / step_size))',
        advantages: [
            'Simple to implement',
            'Predictable behavior',
            'Works well for many tasks',
            'Easy to tune'
        ],
        disadvantages: [
            'Sudden changes can cause instability',
            'May not adapt to different convergence rates',
            'Fixed schedule may not be optimal'
        ],
        params: [
            { name: 'stepSize', label: 'Step Size:', value: 100, min: 10, max: 1000, type: 'number' },
            { name: 'gamma', label: 'Gamma (γ):', value: 0.1, min: 0.01, max: 1, step: 0.01, type: 'number' }
        ]
    },
    exponential: {
        title: 'Exponential Decay Scheduler',
        description: 'Decays learning rate exponentially over time. Smooth reduction that can help with fine-tuning.',
        formula: 'lr = initial_lr * e^(-decay_rate * step)',
        advantages: [
            'Smooth decay curve',
            'Continuous adaptation',
            'Good for fine-tuning',
            'Mathematically elegant'
        ],
        disadvantages: [
            'May decay too quickly or slowly',
            'Less intuitive than step decay',
            'Can be sensitive to decay rate'
        ],
        params: [
            { name: 'decayRate', label: 'Decay Rate:', value: 0.001, min: 0.0001, max: 0.01, step: 0.0001, type: 'number' }
        ]
    },
    polynomial: {
        title: 'Polynomial Decay Scheduler',
        description: 'Decays learning rate following a polynomial curve. Offers more control over the decay shape.',
        formula: 'lr = initial_lr * (1 - step/total_steps)^power',
        advantages: [
            'Flexible decay curve',
            'Can mimic different behaviors',
            'Good control over final learning rate',
            'Smooth transitions'
        ],
        disadvantages: [
            'More parameters to tune',
            'May be overkill for simple tasks',
            'Power parameter can be tricky'
        ],
        params: [
            { name: 'power', label: 'Power:', value: 2, min: 0.1, max: 5, step: 0.1, type: 'number' }
        ]
    },
    cosine: {
        title: 'Cosine Annealing Scheduler',
        description: 'Uses cosine function to anneal learning rate. Popular in modern deep learning for better convergence.',
        formula: 'lr = min_lr + 0.5 * (initial_lr - min_lr) * (1 + cos(π * step / T_max))',
        advantages: [
            'Proven effectiveness in practice',
            'Smooth annealing process',
            'Good for cyclic training',
            'State-of-the-art performance'
        ],
        disadvantages: [
            'More complex implementation',
            'May require tuning of T_max',
            'Can be computationally intensive'
        ],
        params: [
            { name: 'tMax', label: 'T_max (cycles):', value: 10, min: 1, max: 100, type: 'number' },
            { name: 'minLr', label: 'Minimum LR:', value: 0.0001, min: 0.000001, max: 0.01, step: 0.000001, type: 'number' }
        ]
    },
    cyclic: {
        title: 'Cyclic Learning Rate Scheduler',
        description: 'Cycles learning rate between bounds. Helps escape local minima and find better solutions.',
        formula: 'lr = base_lr + (max_lr - base_lr) * max(0, 1 - |step / step_size - 2 * cycle + 1|)',
        advantages: [
            'Can escape local minima',
            'Adaptive to different phases',
            'Good for difficult optimization',
            'Self-tuning properties'
        ],
        disadvantages: [
            'Complex to implement',
            'May cause instability',
            'Requires careful tuning'
        ],
        params: [
            { name: 'maxLr', label: 'Max LR:', value: 0.1, min: 0.001, max: 1, step: 0.001, type: 'number' },
            { name: 'stepSize', label: 'Step Size:', value: 100, min: 10, max: 1000, type: 'number' }
        ]
    },
    onecycle: {
        title: 'OneCycle Learning Rate Scheduler',
        description: 'Increases LR then decreases following a specific pattern. Designed for fast convergence.',
        formula: 'Complex piecewise function with warmup and cooldown phases',
        advantages: [
            'Fast convergence',
            'State-of-the-art results',
            'Automatic phase detection',
            'Good for large datasets'
        ],
        disadvantages: [
            'Very complex implementation',
            'Many hyperparameters',
            'May not work for all tasks'
        ],
        params: [
            { name: 'maxLr', label: 'Max LR:', value: 0.1, min: 0.001, max: 1, step: 0.001, type: 'number' },
            { name: 'pctStart', label: 'Percent Start:', value: 0.3, min: 0.1, max: 0.9, step: 0.05, type: 'number' }
        ]
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeCharts();
    loadScheduler('step');
});

// Initialize application components
function initializeApp() {
    console.log('Initializing Adaptive Learning Rate Scheduler...');
    // Set initial values
    updateSchedulerUI();
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            switchSection(targetId);
        });
    });

    // Scheduler tabs
    document.querySelectorAll('.scheduler-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const scheduler = this.getAttribute('data-scheduler');
            loadScheduler(scheduler);
        });
    });

    // Configuration controls
    document.getElementById('applyConfig').addEventListener('click', applyConfiguration);
    document.getElementById('resetConfig').addEventListener('click', resetConfiguration);

    // Comparison
    document.getElementById('compareBtn').addEventListener('click', compareSchedulers);

    // Training
    document.getElementById('startTraining').addEventListener('click', startTraining);
    document.getElementById('stopTraining').addEventListener('click', stopTraining);
    document.getElementById('resetTraining').addEventListener('click', resetTraining);

    // Advanced features
    document.getElementById('applyCustom').addEventListener('click', applyCustomScheduler);
    document.getElementById('exportPyTorch').addEventListener('click', () => exportScheduler('pytorch'));
    document.getElementById('exportTensorFlow').addEventListener('click', () => exportScheduler('tensorflow'));
    document.getElementById('exportConfig').addEventListener('click', () => exportScheduler('json'));

    // Code tabs
    document.querySelectorAll('.code-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            showCodeExample(lang);
        });
    });
}

// Switch between sections
function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(sectionId).style.display = 'block';
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Load scheduler configuration
function loadScheduler(schedulerType) {
    currentScheduler = schedulerType;

    // Update active tab
    document.querySelectorAll('.scheduler-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-scheduler="${schedulerType}"]`).classList.add('active');

    // Update UI
    updateSchedulerUI();

    // Generate and display schedule
    generateSchedule();
}

// Update scheduler UI elements
function updateSchedulerUI() {
    const config = schedulerConfigs[currentScheduler];

    document.getElementById('schedulerTitle').textContent = config.title;
    document.getElementById('schedulerDescription').innerHTML = `<p>${config.description}</p>`;
    document.getElementById('schedulerFormula').textContent = config.formula;

    // Update advantages and disadvantages
    const advantagesList = document.getElementById('advantagesList');
    const disadvantagesList = document.getElementById('disadvantagesList');

    advantagesList.innerHTML = config.advantages.map(adv => `<li>${adv}</li>`).join('');
    disadvantagesList.innerHTML = config.disadvantages.map(dis => `<li>${dis}</li>`).join('');

    // Update parameters
    const paramsContainer = document.getElementById('schedulerParams');
    paramsContainer.innerHTML = '';

    config.params.forEach(param => {
        const paramDiv = document.createElement('div');
        paramDiv.className = 'control-group';
        paramDiv.innerHTML = `
            <label for="${param.name}">${param.label}</label>
            <input type="${param.type}" id="${param.name}" value="${param.value}"
                   min="${param.min}" max="${param.max}" step="${param.step || 1}">
        `;
        paramsContainer.appendChild(paramDiv);
    });
}

// Apply configuration and regenerate schedule
function applyConfiguration() {
    generateSchedule();
}

// Reset configuration to defaults
function resetConfiguration() {
    const config = schedulerConfigs[currentScheduler];
    config.params.forEach(param => {
        document.getElementById(param.name).value = param.value;
    });
    generateSchedule();
}

// Generate learning rate schedule
function generateSchedule() {
    const initialLr = parseFloat(document.getElementById('initialLr').value);
    const totalSteps = parseInt(document.getElementById('totalSteps').value);

    let schedule = [];

    switch (currentScheduler) {
        case 'step':
            schedule = generateStepSchedule(initialLr, totalSteps);
            break;
        case 'exponential':
            schedule = generateExponentialSchedule(initialLr, totalSteps);
            break;
        case 'polynomial':
            schedule = generatePolynomialSchedule(initialLr, totalSteps);
            break;
        case 'cosine':
            schedule = generateCosineSchedule(initialLr, totalSteps);
            break;
        case 'cyclic':
            schedule = generateCyclicSchedule(initialLr, totalSteps);
            break;
        case 'onecycle':
            schedule = generateOneCycleSchedule(initialLr, totalSteps);
            break;
    }

    updateChart(schedule);
}

// Generate step decay schedule
function generateStepSchedule(initialLr, totalSteps) {
    const stepSize = parseInt(document.getElementById('stepSize').value);
    const gamma = parseFloat(document.getElementById('gamma').value);

    const schedule = [];
    for (let step = 0; step < totalSteps; step++) {
        const lr = initialLr * Math.pow(gamma, Math.floor(step / stepSize));
        schedule.push({ step, lr });
    }
    return schedule;
}

// Generate exponential decay schedule
function generateExponentialSchedule(initialLr, totalSteps) {
    const decayRate = parseFloat(document.getElementById('decayRate').value);

    const schedule = [];
    for (let step = 0; step < totalSteps; step++) {
        const lr = initialLr * Math.exp(-decayRate * step);
        schedule.push({ step, lr });
    }
    return schedule;
}

// Generate polynomial decay schedule
function generatePolynomialSchedule(initialLr, totalSteps) {
    const power = parseFloat(document.getElementById('power').value);

    const schedule = [];
    for (let step = 0; step < totalSteps; step++) {
        const lr = initialLr * Math.pow(1 - step / totalSteps, power);
        schedule.push({ step, lr });
    }
    return schedule;
}

// Generate cosine annealing schedule
function generateCosineSchedule(initialLr, totalSteps) {
    const tMax = parseFloat(document.getElementById('tMax').value);
    const minLr = parseFloat(document.getElementById('minLr').value);

    const schedule = [];
    for (let step = 0; step < totalSteps; step++) {
        const cycle = Math.floor(1 + step / (2 * tMax / totalSteps));
        const x = Math.abs(step / (tMax / totalSteps) - 2 * cycle + 1);
        const lr = minLr + 0.5 * (initialLr - minLr) * (1 + Math.cos(Math.PI * x));
        schedule.push({ step, lr });
    }
    return schedule;
}

// Generate cyclic schedule
function generateCyclicSchedule(initialLr, totalSteps) {
    const maxLr = parseFloat(document.getElementById('maxLr').value);
    const stepSize = parseInt(document.getElementById('stepSize').value);

    const schedule = [];
    for (let step = 0; step < totalSteps; step++) {
        const cycle = Math.floor(step / (2 * stepSize));
        const x = Math.abs(step / stepSize - 2 * cycle - 1);
        const lr = initialLr + (maxLr - initialLr) * Math.max(0, 1 - x);
        schedule.push({ step, lr });
    }
    return schedule;
}

// Generate OneCycle schedule
function generateOneCycleSchedule(initialLr, totalSteps) {
    const maxLr = parseFloat(document.getElementById('maxLr').value);
    const pctStart = parseFloat(document.getElementById('pctStart').value);

    const schedule = [];
    const startSteps = Math.floor(totalSteps * pctStart);

    for (let step = 0; step < totalSteps; step++) {
        let lr;
        if (step < startSteps) {
            // Increasing phase
            lr = initialLr + (maxLr - initialLr) * (step / startSteps);
        } else {
            // Decreasing phase
            const remainingSteps = totalSteps - startSteps;
            const currentStep = step - startSteps;
            lr = maxLr - (maxLr - initialLr) * (currentStep / remainingSteps);
        }
        schedule.push({ step, lr });
    }
    return schedule;
}

// Update chart with new schedule
function updateChart(schedule) {
    if (lrChart) {
        lrChart.destroy();
    }

    const ctx = document.getElementById('lrChart').getContext('2d');
    lrChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: schedule.map(point => point.step),
            datasets: [{
                label: 'Learning Rate',
                data: schedule.map(point => point.lr),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Training Step'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Learning Rate'
                    },
                    type: 'logarithmic'
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${schedulerConfigs[currentScheduler].title} Schedule`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Initialize charts
function initializeCharts() {
    // Comparison chart will be created when needed
    // Training charts will be created when training starts
}

// Compare schedulers
function compareSchedulers() {
    const selectedSchedulers = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
        .map(checkbox => checkbox.value);

    if (selectedSchedulers.length === 0) {
        alert('Please select at least one scheduler to compare.');
        return;
    }

    const initialLr = 0.1;
    const totalSteps = 1000;

    const datasets = selectedSchedulers.map(scheduler => {
        let schedule = [];
        switch (scheduler) {
            case 'step':
                schedule = generateStepSchedule(initialLr, totalSteps);
                break;
            case 'exponential':
                schedule = generateExponentialSchedule(initialLr, totalSteps);
                break;
            case 'polynomial':
                schedule = generatePolynomialSchedule(initialLr, totalSteps);
                break;
            case 'cosine':
                schedule = generateCosineSchedule(initialLr, totalSteps);
                break;
            case 'cyclic':
                schedule = generateCyclicSchedule(initialLr, totalSteps);
                break;
            case 'onecycle':
                schedule = generateOneCycleSchedule(initialLr, totalSteps);
                break;
        }

        return {
            label: schedulerConfigs[scheduler].title,
            data: schedule.map(point => point.lr),
            borderWidth: 2,
            tension: 0.1,
            hidden: false
        };
    });

    if (comparisonChart) {
        comparisonChart.destroy();
    }

    const ctx = document.getElementById('comparisonChart').getContext('2d');
    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: totalSteps}, (_, i) => i),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Training Step'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Learning Rate'
                    },
                    type: 'logarithmic'
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Learning Rate Scheduler Comparison',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });

    // Update comparison table
    updateComparisonTable(selectedSchedulers);
}

// Update comparison table
function updateComparisonTable(schedulers) {
    const tableBody = document.getElementById('schedulerTableBody');
    tableBody.innerHTML = '';

    schedulers.forEach(scheduler => {
        const config = schedulerConfigs[scheduler];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${config.title}</td>
            <td>High convergence speed, good generalization</td>
            <td>★★★★☆</td>
            <td>★★★★☆</td>
            <td>★★★☆☆</td>
        `;
        tableBody.appendChild(row);
    });
}

// Training simulation
async function startTraining() {
    if (isTraining) return;

    isTraining = true;
    document.getElementById('startTraining').disabled = true;
    document.getElementById('stopTraining').disabled = false;

    const modelType = document.getElementById('modelType').value;
    const dataset = document.getElementById('dataset').value;
    const optimizer = document.getElementById('optimizer').value;
    const scheduler = document.getElementById('selectedScheduler').value;

    // Reset training data
    trainingData = [];
    updateTrainingCharts();

    // Simulate training
    const totalEpochs = 50;
    for (let epoch = 0; epoch < totalEpochs; epoch++) {
        if (!isTraining) break;

        // Simulate training step
        const loss = simulateTrainingStep(epoch, scheduler);
        const lr = getCurrentLearningRate(epoch, scheduler);

        trainingData.push({ epoch, loss, lr });

        // Update UI
        updateTrainingLog(`Epoch ${epoch + 1}/${totalEpochs}: Loss = ${loss.toFixed(4)}, LR = ${lr.toFixed(6)}`);
        updateTrainingCharts();

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    isTraining = false;
    document.getElementById('startTraining').disabled = false;
    document.getElementById('stopTraining').disabled = true;
    updateTrainingLog('Training completed!');
}

function stopTraining() {
    isTraining = false;
    document.getElementById('startTraining').disabled = false;
    document.getElementById('stopTraining').disabled = true;
    updateTrainingLog('Training stopped by user.');
}

function resetTraining() {
    trainingData = [];
    updateTrainingCharts();
    document.getElementById('trainingLog').innerHTML = '';
    document.getElementById('startTraining').disabled = false;
    document.getElementById('stopTraining').disabled = true;
}

// Simulate training step
function simulateTrainingStep(epoch, scheduler) {
    // Simple loss simulation
    const baseLoss = 2.0;
    const decay = scheduler === 'constant' ? 0.02 : 0.05;
    const noise = (Math.random() - 0.5) * 0.1;

    return Math.max(0.01, baseLoss * Math.exp(-decay * epoch) + noise);
}

// Get current learning rate for training
function getCurrentLearningRate(epoch, scheduler) {
    const initialLr = 0.1;
    const totalSteps = 50;

    switch (scheduler) {
        case 'constant':
            return initialLr;
        case 'step':
            return initialLr * Math.pow(0.1, Math.floor(epoch / 10));
        case 'exponential':
            return initialLr * Math.exp(-0.001 * epoch * 20);
        case 'cosine':
            return 0.0001 + 0.5 * (initialLr - 0.0001) * (1 + Math.cos(Math.PI * epoch / totalSteps));
        default:
            return initialLr;
    }
}

// Update training charts
function updateTrainingCharts() {
    // Loss chart
    if (lossChart) {
        lossChart.destroy();
    }
    const lossCtx = document.getElementById('lossChart').getContext('2d');
    lossChart = new Chart(lossCtx, {
        type: 'line',
        data: {
            labels: trainingData.map(d => d.epoch),
            datasets: [{
                label: 'Training Loss',
                data: trainingData.map(d => d.loss),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Epoch' } },
                y: { title: { display: true, text: 'Loss' } }
            }
        }
    });

    // Learning rate chart
    if (trainingLrChart) {
        trainingLrChart.destroy();
    }
    const lrCtx = document.getElementById('trainingLrChart').getContext('2d');
    trainingLrChart = new Chart(lrCtx, {
        type: 'line',
        data: {
            labels: trainingData.map(d => d.epoch),
            datasets: [{
                label: 'Learning Rate',
                data: trainingData.map(d => d.lr),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Epoch' } },
                y: {
                    title: { display: true, text: 'Learning Rate' },
                    type: 'logarithmic'
                }
            }
        }
    });
}

// Update training log
function updateTrainingLog(message) {
    const logContainer = document.getElementById('trainingLog');
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Apply custom scheduler
function applyCustomScheduler() {
    const formula = document.getElementById('customFormula').value;
    // This would require a more complex implementation
    alert('Custom scheduler feature would require advanced expression parsing. This is a placeholder for future implementation.');
}

// Export scheduler configuration
function exportScheduler(format) {
    const config = {
        scheduler: currentScheduler,
        initialLr: parseFloat(document.getElementById('initialLr').value),
        totalSteps: parseInt(document.getElementById('totalSteps').value),
        params: {}
    };

    // Add scheduler-specific parameters
    const schedulerConfig = schedulerConfigs[currentScheduler];
    schedulerConfig.params.forEach(param => {
        config.params[param.name] = parseFloat(document.getElementById(param.name).value);
    });

    let exportData;
    let filename;
    let mimeType;

    switch (format) {
        case 'pytorch':
            exportData = generatePyTorchCode(config);
            filename = 'scheduler_pytorch.py';
            mimeType = 'text/plain';
            break;
        case 'tensorflow':
            exportData = generateTensorFlowCode(config);
            filename = 'scheduler_tensorflow.py';
            mimeType = 'text/plain';
            break;
        case 'json':
            exportData = JSON.stringify(config, null, 2);
            filename = 'scheduler_config.json';
            mimeType = 'application/json';
            break;
    }

    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Generate PyTorch code
function generatePyTorchCode(config) {
    let code = `import torch.optim.lr_scheduler as lr_scheduler\n\n`;

    switch (config.scheduler) {
        case 'step':
            code += `# Step decay scheduler\n`;
            code += `scheduler = lr_scheduler.StepLR(optimizer, step_size=${config.params.stepSize}, gamma=${config.params.gamma})\n`;
            break;
        case 'exponential':
            code += `# Exponential decay scheduler\n`;
            code += `scheduler = lr_scheduler.ExponentialLR(optimizer, gamma=${Math.exp(-config.params.decayRate * 100)})\n`;
            break;
        case 'cosine':
            code += `# Cosine annealing scheduler\n`;
            code += `scheduler = lr_scheduler.CosineAnnealingLR(optimizer, T_max=${config.params.tMax})\n`;
            break;
    }

    return code;
}

// Generate TensorFlow code
function generateTensorFlowCode(config) {
    let code = `import tensorflow as tf\n\n`;

    switch (config.scheduler) {
        case 'exponential':
            code += `# Exponential decay scheduler\n`;
            code += `lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(\n`;
            code += `    initial_learning_rate=${config.initialLr},\n`;
            code += `    decay_steps=100,\n`;
            code += `    decay_rate=${Math.exp(-config.params.decayRate * 100)}\n`;
            code += `)\n`;
            break;
    }

    return code;
}

// Show code examples
function showCodeExample(language) {
    document.querySelectorAll('.code-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-lang="${language}"]`).classList.add('active');

    const codeDisplay = document.getElementById('codeExample');

    switch (language) {
        case 'python':
            codeDisplay.textContent = `# Python example with PyTorch
import torch.optim.lr_scheduler as lr_scheduler

# Step decay scheduler
scheduler = lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.1)

# Cosine annealing scheduler
scheduler = lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)

# Training loop
for epoch in range(num_epochs):
    # Training code here
    optimizer.step()
    scheduler.step()`;
            break;
        case 'javascript':
            codeDisplay.textContent = `// JavaScript example with TensorFlow.js
import * as tf from '@tensorflow/tfjs';

// Exponential decay schedule
const lrSchedule = tf.callbacks.learningRateScheduler(epoch => {
  return initialLearningRate * Math.exp(-decayRate * epoch);
});

// Compile model with schedule
model.compile({
  optimizer: tf.train.adam(lrSchedule),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});`;
            break;
        case 'cpp':
            codeDisplay.textContent = `// C++ example (simplified)
#include <cmath>

// Exponential decay function
double exponentialDecay(double initialLr, double decayRate, int step) {
    return initialLr * std::exp(-decayRate * step);
}

// Usage in training loop
for (int epoch = 0; epoch < numEpochs; ++epoch) {
    double currentLr = exponentialDecay(0.1, 0.001, epoch);
    // Update optimizer with currentLr
}`;
            break;
    }
}

// Performance monitoring
const perfData = {
    renderTimes: [],
    calculationTimes: []
};

function measurePerformance(action, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    perfData[action + 'Times'].push(duration);
    console.log(`${action} took ${duration.toFixed(2)}ms`);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Initialize with default scheduler
loadScheduler('step');

// Show Python code by default
showCodeExample('python');

console.log('Adaptive Learning Rate Scheduler loaded successfully!');