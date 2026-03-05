// cognitive-recovery-after-conflict-monitor.js

document.addEventListener('DOMContentLoaded', function() {
    const primaryFavicon = document.getElementById('primary-favicon');
    
    if (primaryFavicon) {
        const img = new Image();
        img.onload = function() {
            console.log('Primary favicon loaded successfully');
        };
        img.onerror = function() {
            console.log('Primary favicon failed to load, trying fallbacks...');
            tryFallbackFavicons();
        };
        img.src = primaryFavicon.href;
    }
});

function tryFallbackFavicons() {
    const fallbacks = [
        document.getElementById('fallback-favicon-ico'),
        document.getElementById('fallback-favicon-png'),
        document.getElementById('emergency-favicon')
    ];
    
    let fallbackIndex = 0;
    
    function tryNextFallback() {
        if (fallbackIndex >= fallbacks.length) {
            console.log('All favicons failed, using emoji fallback');
            createEmojiFavicon();
            return;
        }
        
        const fallback = fallbacks[fallbackIndex];
        if (!fallback) {
            fallbackIndex++;
            tryNextFallback();
            return;
        }
        
        const img = new Image();
        img.onload = function() {
            console.log(`Fallback favicon ${fallbackIndex + 1} loaded`);
            // Remove all existing favicons and add the working one
            removeAllFavicons();
            document.head.appendChild(fallback.cloneNode());
        };
        img.onerror = function() {
            console.log(`Fallback ${fallbackIndex + 1} failed`);
            fallbackIndex++;
            tryNextFallback();
        };
        img.src = fallback.href;
    }
    
    tryNextFallback();
}

function removeAllFavicons() {
    const favicons = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
    favicons.forEach(favicon => favicon.remove());
}

function createEmojiFavicon() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.font = '24px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('🧠', 4, 24);
    
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
}

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
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    
    document.getElementById('testSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';

    resetTestUI();
    nextTestStep();
}

function resetTestUI() {
    const reactionBtn = document.getElementById('reactionBtn');
    if (reactionBtn) {
        reactionBtn.textContent = 'Wait...';
        reactionBtn.className = 'reaction-btn waiting';
        reactionBtn.disabled = true;
    }
    
    document.getElementById('memoryTest').style.display = 'none';
    document.getElementById('memoryInput').style.display = 'none';
    document.getElementById('memoryAnswer').value = '';
    document.getElementById('testStatus').textContent = 'Test in progress...';
    
    reactionStartTime = null;
}

function nextTestStep() {
    testStep++;
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = `${(testStep / 3) * 100}%`;
    }

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

function showMemoryInput() {
}

function checkMemory() {
    const answer = document.getElementById('memoryAnswer').value.trim();
    const correct = testResults.correctNumbers;
    
    const isValid = /^\d{5}$/.test(answer);
    
    if (!isValid) {
        alert('Please enter exactly 5 digits (0-9 only)');
        return; 
    }
    
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
    if (baselineResults && currentTest && currentTest.type === 'post-conflict') {
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
        alert('Baseline results saved successfully!');
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
        alert('Post-conflict results saved successfully!');
    }

    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('testSection').style.display = 'none';
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    
    testStep = 0;
}

function updateHistory() {
    const historyDiv = document.getElementById('recoveryHistory');
    historyDiv.innerHTML = '';

    if (recoveryResults.length === 0) {
        historyDiv.innerHTML = '<p>No recovery data yet. Take a post-conflict test to see history.</p>';
        return;
    }

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

    if (window.recoveryChart instanceof Chart) {
        window.recoveryChart.destroy();
    }

    const data = recoveryResults.map(result => ({
        x: new Date(result.timestamp),
        y: result.reactionTime
    }));

    window.recoveryChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Reaction Time (ms)',
                data: data,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Reaction Time (ms)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
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
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
});