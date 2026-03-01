// cognitive-recovery-after-conflict-monitor.js

let baselineResults = JSON.parse(localStorage.getItem('cognitiveBaseline')) || null;
let recoveryResults = JSON.parse(localStorage.getItem('cognitiveRecoveryResults')) || [];
let currentTest = null;
let reactionStartTime = null;
let testStep = 0;
let testResults = {};

function startBaselineTest() {
    currentTest = { type: 'baseline' };
    startTest();
}

function startConflictTest() {
    const intensity = document.getElementById('conflictIntensity').value;
    currentTest = { type: 'post-conflict', intensity: parseInt(intensity), timestamp: new Date().toISOString() };
    startTest();
}

function startTest() {
    testStep = 0;
    testResults = {};
    document.getElementById('baselineSection').style.display = 'none';
    document.getElementById('conflictSection').style.display = 'none';
    document.getElementById('testSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    nextTestStep();
}

function nextTestStep() {
    testStep++;
    document.getElementById('testProgress').style.width = `${(testStep / 3) * 100}%`;

    if (testStep === 1) {
        startReactionTest();
    } else if (testStep === 2) {
        startMemoryTest();
    } else if (testStep === 3) {
        showResults();
    }
}

function startReactionTest() {
    document.getElementById('reactionTest').style.display = 'block';
    document.getElementById('memoryTest').style.display = 'none';
    document.getElementById('memoryInput').style.display = 'none';
    document.getElementById('testStatus').textContent = 'Reaction Time Test';

    const btn = document.getElementById('reactionBtn');
    btn.textContent = 'Wait...';
    btn.className = 'reaction-btn waiting';
    btn.disabled = true;

    setTimeout(() => {
        btn.textContent = 'Click Now!';
        btn.className = 'reaction-btn ready';
        btn.disabled = false;
        reactionStartTime = Date.now();
    }, Math.random() * 3000 + 1000); // Random delay between 1-4 seconds
}

function recordReaction() {
    if (!reactionStartTime) return;
    const reactionTime = Date.now() - reactionStartTime;
    testResults.reactionTime = reactionTime;
    nextTestStep();
}

function startMemoryTest() {
    document.getElementById('reactionTest').style.display = 'none';
    document.getElementById('memoryTest').style.display = 'block';
    document.getElementById('testStatus').textContent = 'Memory Test';

    // Generate random 5-digit number
    const numbers = Math.floor(Math.random() * 90000) + 10000;
    document.getElementById('memoryNumbers').textContent = numbers.toString();
    testResults.correctNumbers = numbers.toString();

    setTimeout(() => {
        document.getElementById('memoryNumbers').textContent = '???';
        document.getElementById('memoryInput').style.display = 'block';
    }, 5000); // Show for 5 seconds
}

function checkMemory() {
    const answer = document.getElementById('memoryAnswer').value;
    const correct = testResults.correctNumbers;
    let score = 0;
    for (let i = 0; i < correct.length; i++) {
        if (answer[i] === correct[i]) score++;
    }
    testResults.memoryScore = score;
    nextTestStep();
}

function showResults() {
    document.getElementById('testSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';

    document.getElementById('reactionTimeResult').textContent = `${testResults.reactionTime}ms`;

    const memoryPercentage = (testResults.memoryScore / 5) * 100;
    document.getElementById('memoryScoreResult').textContent = `${testResults.memoryScore}/5 (${memoryPercentage.toFixed(0)}%)`;

    let recoveryStatus = 'N/A';
    if (baselineResults) {
        const reactionDiff = testResults.reactionTime - baselineResults.reactionTime;
        const memoryDiff = testResults.memoryScore - baselineResults.memoryScore;

        if (currentTest.type === 'post-conflict') {
            if (reactionDiff < 50 && memoryDiff >= 0) {
                recoveryStatus = 'Recovered';
            } else if (reactionDiff < 100 || memoryDiff >= -1) {
                recoveryStatus = 'Recovering';
            } else {
                recoveryStatus = 'Impaired';
            }
        }
    }
    document.getElementById('recoveryStatus').textContent = recoveryStatus;
}

function saveResult() {
    if (currentTest.type === 'baseline') {
        baselineResults = testResults;
        localStorage.setItem('cognitiveBaseline', JSON.stringify(baselineResults));
    } else if (currentTest.type === 'post-conflict') {
        const result = {
            ...currentTest,
            ...testResults,
            baselineReactionTime: baselineResults ? baselineResults.reactionTime : null,
            baselineMemoryScore: baselineResults ? baselineResults.memoryScore : null
        };
        recoveryResults.push(result);
        localStorage.setItem('cognitiveRecoveryResults', JSON.stringify(recoveryResults));
        updateHistory();
        updateChart();
    }

    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('baselineSection').style.display = 'block';
    document.getElementById('conflictSection').style.display = 'block';
}

function updateHistory() {
    const historyDiv = document.getElementById('recoveryHistory');
    historyDiv.innerHTML = '';

    recoveryResults.slice(-5).reverse().forEach(result => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const date = new Date(result.timestamp).toLocaleDateString();
        item.innerHTML = `
            <strong>${date}</strong> - Intensity: ${result.intensity}/10<br>
            Reaction: ${result.reactionTime}ms (Baseline: ${result.baselineReactionTime || 'N/A'}ms)<br>
            Memory: ${result.memoryScore}/5 (Baseline: ${result.baselineMemoryScore || 'N/A'}/5)
        `;
        historyDiv.appendChild(item);
    });
}

function updateChart() {
    const ctx = document.getElementById('recoveryChart').getContext('2d');

    const data = recoveryResults.map(result => ({
        x: new Date(result.timestamp),
        y: result.reactionTime
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Reaction Time (ms)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Update intensity value display
document.getElementById('conflictIntensity').addEventListener('input', function() {
    document.getElementById('intensityValue').textContent = this.value;
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHistory();
    updateChart();
});