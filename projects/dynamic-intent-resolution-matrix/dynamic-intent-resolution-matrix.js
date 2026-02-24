document.addEventListener('DOMContentLoaded', function() {
    const userInputTextarea = document.getElementById('user-input');
    const resolutionMethodSelect = document.getElementById('resolution-method');
    const confidenceThresholdInput = document.getElementById('confidence-threshold');
    const resolveBtn = document.getElementById('resolve-btn');
    const resultsDiv = document.getElementById('results');
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    const historyList = document.getElementById('history-list');

    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetViewBtn = document.getElementById('reset-view');

    let zoom = 1;
    let offsetX = 0;
    let offsetY = 0;
    let intents = [];
    let history = [];

    resolveBtn.addEventListener('click', resolveIntent);
    zoomInBtn.addEventListener('click', () => changeZoom(1.2));
    zoomOutBtn.addEventListener('click', () => changeZoom(0.8));
    resetViewBtn.addEventListener('click', resetView);

    // Initialize with sample intents
    initializeIntents();

    function initializeIntents() {
        intents = [
            { name: 'Information Request', keywords: ['what', 'how', 'when', 'where', 'why', 'tell me', 'explain'] },
            { name: 'Action Request', keywords: ['do', 'make', 'create', 'send', 'delete', 'update', 'execute'] },
            { name: 'Confirmation', keywords: ['yes', 'no', 'confirm', 'agree', 'accept', 'decline'] },
            { name: 'Navigation', keywords: ['go to', 'navigate', 'open', 'show', 'display', 'view'] },
            { name: 'Search', keywords: ['find', 'search', 'look for', 'locate', 'query'] },
            { name: 'Help', keywords: ['help', 'assist', 'support', 'guide', 'tutorial'] },
            { name: 'Settings', keywords: ['settings', 'preferences', 'configure', 'options'] },
            { name: 'Feedback', keywords: ['feedback', 'review', 'rate', 'comment', 'opinion'] }
        ];
        drawMatrix();
    }

    function resolveIntent() {
        const input = userInputTextarea.value.trim();
        if (!input) {
            alert('Please enter some text to resolve intent.');
            return;
        }

        const method = resolutionMethodSelect.value;
        const threshold = parseFloat(confidenceThresholdInput.value);

        resultsDiv.innerHTML = '<div class="loading">Resolving intent...</div>';

        setTimeout(() => {
            const results = performIntentResolution(input, method, threshold);
            displayResults(results);
            addToHistory(input, results);
            drawMatrix(results.scores);
        }, 1500);
    }

    function performIntentResolution(input, method, threshold) {
        const scores = {};

        intents.forEach(intent => {
            let score = 0;
            const words = input.toLowerCase().split(/\s+/);

            intent.keywords.forEach(keyword => {
                words.forEach(word => {
                    if (word.includes(keyword) || keyword.includes(word)) {
                        score += 0.1;
                    }
                });
            });

            // Method-specific adjustments
            switch (method) {
                case 'bayesian':
                    score = applyBayesianScoring(score, intent, words);
                    break;
                case 'fuzzy-logic':
                    score = applyFuzzyLogic(score, intent, words);
                    break;
                case 'neural-network':
                    score = applyNeuralNetwork(score, intent, words);
                    break;
                case 'decision-tree':
                    score = applyDecisionTree(score, intent, words);
                    break;
                case 'reinforcement':
                    score = applyReinforcement(score, intent, words);
                    break;
            }

            scores[intent.name] = Math.min(score, 1);
        });

        const sortedIntents = Object.entries(scores)
            .sort(([,a], [,b]) => b - a)
            .filter(([,score]) => score >= threshold);

        return {
            method: method,
            input: input,
            resolvedIntents: sortedIntents,
            scores: scores,
            threshold: threshold
        };
    }

    function applyBayesianScoring(baseScore, intent, words) {
        // Simple Bayesian-inspired scoring
        const prior = 0.1;
        const likelihood = baseScore;
        return (prior * likelihood) / (prior * likelihood + (1 - prior) * (1 - likelihood));
    }

    function applyFuzzyLogic(baseScore, intent, words) {
        // Fuzzy logic membership function
        if (baseScore < 0.3) return baseScore * 0.5;
        if (baseScore < 0.7) return baseScore * 0.8;
        return Math.min(baseScore * 1.2, 1);
    }

    function applyNeuralNetwork(baseScore, intent, words) {
        // Simulate neural network processing
        const hiddenLayer = Math.tanh(baseScore * 2 - 1);
        return Math.sigmoid(hiddenLayer * 1.5 + 0.2);
    }

    function applyDecisionTree(baseScore, intent, words) {
        // Simple decision tree logic
        if (baseScore > 0.5) return baseScore + 0.1;
        if (words.length > 5) return baseScore * 0.9;
        return baseScore * 0.8;
    }

    function applyReinforcement(baseScore, intent, words) {
        // Simulate reinforcement learning adjustment
        const reward = Math.random() * 0.2 - 0.1;
        return Math.max(0, Math.min(1, baseScore + reward));
    }

    function displayResults(results) {
        if (results.resolvedIntents.length === 0) {
            resultsDiv.innerHTML = '<p>No intents resolved above the confidence threshold.</p>';
            return;
        }

        let html = '';
        results.resolvedIntents.forEach(([intentName, confidence]) => {
            const intent = intents.find(i => i.name === intentName);
            html += `
                <div class="intent-result">
                    <div class="intent-label">${intentName}</div>
                    <div class="intent-confidence">Confidence: ${(confidence * 100).toFixed(1)}%</div>
                    <div class="intent-description">Keywords: ${intent.keywords.join(', ')}</div>
                </div>
            `;
        });

        resultsDiv.innerHTML = html;
    }

    function addToHistory(input, results) {
        const historyItem = {
            timestamp: new Date().toLocaleString(),
            input: input,
            method: results.method,
            topIntent: results.resolvedIntents[0] ? results.resolvedIntents[0][0] : 'None',
            confidence: results.resolvedIntents[0] ? (results.resolvedIntents[0][1] * 100).toFixed(1) + '%' : 'N/A'
        };

        history.unshift(historyItem);
        if (history.length > 10) history.pop();

        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <strong>${item.timestamp}</strong><br>
                Input: "${item.input}"<br>
                Method: ${item.method} | Intent: ${item.topIntent} (${item.confidence})
            </div>
        `).join('');
    }

    function drawMatrix(scores = {}) {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(offsetX, offsetY);
        ctx.scale(zoom, zoom);

        const centerX = canvas.width / 2 / zoom;
        const centerY = canvas.height / 2 / zoom;
        const radius = Math.min(centerX, centerY) - 50;

        intents.forEach((intent, index) => {
            const angle = (index / intents.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const score = scores[intent.name] || 0;
            const nodeSize = 20 + score * 30;

            // Draw connections
            intents.forEach((otherIntent, otherIndex) => {
                if (otherIndex !== index) {
                    const otherAngle = (otherIndex / intents.length) * 2 * Math.PI - Math.PI / 2;
                    const otherX = centerX + Math.cos(otherAngle) * radius;
                    const otherY = centerY + Math.sin(otherAngle) * radius;

                    const connectionStrength = Math.random() * 0.5 + 0.1; // Simplified
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(otherX, otherY);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${connectionStrength * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            // Draw node
            ctx.beginPath();
            ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
            ctx.fillStyle = `hsl(${index * 45}, 70%, ${50 + score * 30}%)`;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(intent.name, x, y + nodeSize + 15);

            // Draw score
            if (score > 0) {
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.fillText((score * 100).toFixed(0) + '%', x, y + 3);
            }
        });

        ctx.restore();
    }

    function changeZoom(factor) {
        zoom *= factor;
        zoom = Math.max(0.5, Math.min(2, zoom));
        drawMatrix();
    }

    function resetView() {
        zoom = 1;
        offsetX = 0;
        offsetY = 0;
        drawMatrix();
    }

    // Mouse interaction for canvas
    let isDragging = false;
    let lastX, lastY;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            offsetX += e.clientX - lastX;
            offsetY += e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            drawMatrix();
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        changeZoom(factor);
    });
});