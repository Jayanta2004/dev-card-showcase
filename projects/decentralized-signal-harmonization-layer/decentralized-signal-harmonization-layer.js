document.addEventListener('DOMContentLoaded', function() {
    const signalInput = document.getElementById('signal-input');
    const methodSelect = document.getElementById('harmonization-method');
    const toleranceInput = document.getElementById('tolerance');
    const harmonizeBtn = document.getElementById('harmonize-btn');
    const output = document.getElementById('output');
    const canvas = document.getElementById('signal-canvas');
    const ctx = canvas.getContext('2d');

    harmonizeBtn.addEventListener('click', harmonizeSignals);

    function harmonizeSignals() {
        try {
            const inputData = JSON.parse(signalInput.value);
            const method = methodSelect.value;
            const tolerance = parseFloat(toleranceInput.value);

            if (!inputData.nodes || !Array.isArray(inputData.nodes)) {
                throw new Error('Invalid input format. Expected {nodes: [...]}');
            }

            const harmonizedData = performHarmonization(inputData, method, tolerance);
            displayResults(harmonizedData);
            visualizeSignals(harmonizedData);

        } catch (error) {
            output.textContent = `Error: ${error.message}`;
        }
    }

    function performHarmonization(data, method, tolerance) {
        const nodes = data.nodes;
        const harmonizedNodes = JSON.parse(JSON.stringify(nodes)); // Deep copy

        switch (method) {
            case 'phase-alignment':
                return phaseAlignment(harmonizedNodes, tolerance);
            case 'amplitude-normalization':
                return amplitudeNormalization(harmonizedNodes, tolerance);
            case 'frequency-synchronization':
                return frequencySynchronization(harmonizedNodes, tolerance);
            case 'adaptive-filtering':
                return adaptiveFiltering(harmonizedNodes, tolerance);
            default:
                throw new Error('Unknown harmonization method');
        }
    }

    function phaseAlignment(nodes, tolerance) {
        // Simple phase alignment by shifting signals to start at the same point
        const referenceSignal = nodes[0].signal;
        
        for (let i = 1; i < nodes.length; i++) {
            const signal = nodes[i].signal;
            const shift = findBestShift(referenceSignal, signal, tolerance);
            nodes[i].signal = shiftSignal(signal, shift);
            nodes[i].phaseShift = shift;
        }
        
        return { nodes, method: 'phase-alignment', tolerance };
    }

    function amplitudeNormalization(nodes, tolerance) {
        // Normalize amplitudes to a common scale
        const maxAmplitude = Math.max(...nodes.flatMap(node => 
            node.signal.map(Math.abs)
        ));
        
        for (const node of nodes) {
            node.signal = node.signal.map(val => val / maxAmplitude);
            node.normalizationFactor = maxAmplitude;
        }
        
        return { nodes, method: 'amplitude-normalization', tolerance };
    }

    function frequencySynchronization(nodes, tolerance) {
        // Basic frequency synchronization using autocorrelation
        for (const node of nodes) {
            const dominantFrequency = estimateDominantFrequency(node.signal);
            node.dominantFrequency = dominantFrequency;
            // Apply simple filtering to emphasize dominant frequency
            node.signal = applyBandpassFilter(node.signal, dominantFrequency, tolerance);
        }
        
        return { nodes, method: 'frequency-synchronization', tolerance };
    }

    function adaptiveFiltering(nodes, tolerance) {
        // Adaptive filtering to reduce noise and harmonize signals
        const referenceSignal = averageSignals(nodes.map(n => n.signal));
        
        for (const node of nodes) {
            node.signal = adaptiveFilter(node.signal, referenceSignal, tolerance);
        }
        
        return { nodes, method: 'adaptive-filtering', tolerance };
    }

    function findBestShift(signal1, signal2, tolerance) {
        // Find the shift that minimizes the difference
        let bestShift = 0;
        let minDifference = Infinity;
        
        for (let shift = -signal1.length / 2; shift < signal1.length / 2; shift++) {
            const shifted = shiftSignal(signal2, shift);
            const difference = calculateDifference(signal1, shifted);
            
            if (difference < minDifference) {
                minDifference = difference;
                bestShift = shift;
            }
        }
        
        return bestShift;
    }

    function shiftSignal(signal, shift) {
        if (shift === 0) return [...signal];
        
        const result = new Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            const sourceIndex = i - shift;
            if (sourceIndex >= 0 && sourceIndex < signal.length) {
                result[i] = signal[sourceIndex];
            } else {
                result[i] = 0; // Pad with zeros
            }
        }
        return result;
    }

    function calculateDifference(signal1, signal2) {
        let sum = 0;
        for (let i = 0; i < Math.min(signal1.length, signal2.length); i++) {
            sum += Math.pow(signal1[i] - signal2[i], 2);
        }
        return sum;
    }

    function estimateDominantFrequency(signal) {
        // Simple frequency estimation using zero crossings
        let crossings = 0;
        for (let i = 1; i < signal.length; i++) {
            if ((signal[i-1] >= 0 && signal[i] < 0) || (signal[i-1] < 0 && signal[i] >= 0)) {
                crossings++;
            }
        }
        return crossings / (2 * signal.length); // Rough estimate
    }

    function applyBandpassFilter(signal, centerFreq, bandwidth) {
        // Simple bandpass filter implementation
        const filtered = [];
        for (let i = 0; i < signal.length; i++) {
            // Basic filtering - in a real implementation, use proper DSP
            filtered[i] = signal[i] * (1 - Math.abs(i / signal.length - centerFreq) / bandwidth);
        }
        return filtered;
    }

    function averageSignals(signals) {
        const length = Math.max(...signals.map(s => s.length));
        const average = new Array(length).fill(0);
        
        for (const signal of signals) {
            for (let i = 0; i < signal.length; i++) {
                average[i] += signal[i] / signals.length;
            }
        }
        
        return average;
    }

    function adaptiveFilter(signal, reference, stepSize) {
        // Simple LMS adaptive filter
        const filtered = [...signal];
        const weights = new Array(signal.length).fill(0);
        
        for (let i = 1; i < signal.length; i++) {
            const prediction = weights[i-1] * reference[i-1];
            const error = signal[i] - prediction;
            weights[i] = weights[i-1] + stepSize * error * reference[i-1];
            filtered[i] = prediction;
        }
        
        return filtered;
    }

    function displayResults(data) {
        output.textContent = JSON.stringify(data, null, 2);
    }

    function visualizeSignals(data) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const nodeCount = data.nodes.length;
        
        for (let i = 0; i < nodeCount; i++) {
            const node = data.nodes[i];
            const signal = node.signal;
            const color = colors[i % colors.length];
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const stepX = canvas.width / signal.length;
            const centerY = canvas.height / 2;
            const scaleY = (canvas.height / 2) / Math.max(...signal.map(Math.abs));
            
            for (let j = 0; j < signal.length; j++) {
                const x = j * stepX;
                const y = centerY - signal[j] * scaleY;
                
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Add label
            ctx.fillStyle = color;
            ctx.font = '12px Arial';
            ctx.fillText(node.id, 10, 20 + i * 20);
        }
    }
});