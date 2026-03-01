document.addEventListener('DOMContentLoaded', function() {
    const latencySlider = document.getElementById('latencySlider');
    const latencyValue = document.getElementById('latencyValue');
    const predictionToggle = document.getElementById('predictionToggle');
    const targets = document.querySelectorAll('.target');
    const resetBtn = document.getElementById('resetBtn');
    const clickCount = document.getElementById('clickCount');
    const avgResponseTime = document.getElementById('avgResponseTime');
    const predictionAccuracy = document.getElementById('predictionAccuracy');
    const effectiveLatency = document.getElementById('effectiveLatency');
    const patternCanvas = document.getElementById('patternCanvas');
    const patternInfo = document.getElementById('patternInfo');

    let latency = 200;
    let predictionEnabled = true;
    let clickSequence = [];
    let responseTimes = [];
    let predictions = [];
    let correctPredictions = 0;
    let canvas = patternCanvas.getContext('2d');

    // Update latency display
    latencySlider.addEventListener('input', function() {
        latency = parseInt(this.value);
        latencyValue.textContent = latency + 'ms';
    });

    // Toggle prediction
    predictionToggle.addEventListener('change', function() {
        predictionEnabled = this.checked;
        clearPredictions();
    });

    // Target click handling
    targets.forEach(target => {
        target.addEventListener('click', function() {
            const startTime = Date.now();
            const targetId = parseInt(this.dataset.id);

            // Simulate latency
            setTimeout(() => {
                handleClick(targetId, startTime);
            }, latency);
        });
    });

    // Reset demo
    resetBtn.addEventListener('click', resetDemo);

    function handleClick(targetId, startTime) {
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);

        // Update click sequence
        clickSequence.push(targetId);

        // Update UI
        updateTarget(targetId);
        updateStats();

        // Make prediction for next click
        if (predictionEnabled && clickSequence.length >= 2) {
            const predictedId = predictNextClick();
            if (predictedId) {
                showPrediction(predictedId);
                predictions.push(predictedId);
            }
        }

        // Draw pattern
        drawPattern();
    }

    function predictNextClick() {
        // Simple prediction: if last two clicks are consecutive, predict next
        if (clickSequence.length >= 2) {
            const last = clickSequence[clickSequence.length - 1];
            const secondLast = clickSequence[clickSequence.length - 2];

            if (last === secondLast + 1) {
                return last + 1;
            } else if (last === secondLast - 1) {
                return last - 1;
            }
        }

        // Alternative: predict based on most common next after last click
        const lastClick = clickSequence[clickSequence.length - 1];
        const nextClicks = {};
        for (let i = 0; i < clickSequence.length - 1; i++) {
            if (clickSequence[i] === lastClick) {
                const next = clickSequence[i + 1];
                nextClicks[next] = (nextClicks[next] || 0) + 1;
            }
        }

        let maxCount = 0;
        let predicted = null;
        for (const [id, count] of Object.entries(nextClicks)) {
            if (count > maxCount) {
                maxCount = count;
                predicted = parseInt(id);
            }
        }

        return predicted;
    }

    function showPrediction(predictedId) {
        const predictedTarget = document.querySelector(`.target[data-id="${predictedId}"]`);
        if (predictedTarget && !predictedTarget.classList.contains('active')) {
            predictedTarget.classList.add('predicted');
            predictedTarget.textContent = '🎯';

            // Remove prediction after a delay
            setTimeout(() => {
                predictedTarget.classList.remove('predicted');
                predictedTarget.textContent = '';
            }, 2000);
        }
    }

    function updateTarget(targetId) {
        const target = document.querySelector(`.target[data-id="${targetId}"]`);
        target.classList.add('active');
        target.textContent = '✓';

        // Check if prediction was correct
        if (predictions.length > 0 && predictions[predictions.length - 1] === targetId) {
            correctPredictions++;
        }
    }

    function updateStats() {
        clickCount.textContent = clickSequence.length;
        avgResponseTime.textContent = responseTimes.length > 0 ?
            Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) + 'ms' : '0ms';
        predictionAccuracy.textContent = predictions.length > 0 ?
            Math.round((correctPredictions / predictions.length) * 100) + '%' : '0%';
        effectiveLatency.textContent = predictionEnabled && predictions.length > 0 ?
            Math.max(0, latency - (correctPredictions / predictions.length) * latency) + 'ms' : latency + 'ms';
    }

    function clearPredictions() {
        document.querySelectorAll('.target.predicted').forEach(target => {
            target.classList.remove('predicted');
            target.textContent = '';
        });
    }

    function resetDemo() {
        clickSequence = [];
        responseTimes = [];
        predictions = [];
        correctPredictions = 0;

        targets.forEach(target => {
            target.classList.remove('active', 'predicted');
            target.textContent = '';
        });

        updateStats();
        canvas.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
        patternInfo.textContent = 'Click targets to build a pattern for analysis.';
    }

    function drawPattern() {
        canvas.clearRect(0, 0, patternCanvas.width, patternCanvas.height);

        if (clickSequence.length === 0) return;

        const width = patternCanvas.width;
        const height = patternCanvas.height;
        const stepX = width / clickSequence.length;

        canvas.strokeStyle = '#007bff';
        canvas.lineWidth = 2;
        canvas.beginPath();

        clickSequence.forEach((id, index) => {
            const x = index * stepX + stepX / 2;
            const y = height - (id / 9) * height;
            if (index === 0) {
                canvas.moveTo(x, y);
            } else {
                canvas.lineTo(x, y);
            }
        });

        canvas.stroke();

        // Draw points
        clickSequence.forEach((id, index) => {
            const x = index * stepX + stepX / 2;
            const y = height - (id / 9) * height;
            canvas.beginPath();
            canvas.arc(x, y, 3, 0, 2 * Math.PI);
            canvas.fillStyle = '#007bff';
            canvas.fill();
        });

        patternInfo.textContent = `Pattern: ${clickSequence.join(' → ')}`;
    }
});