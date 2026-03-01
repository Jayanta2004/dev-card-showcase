// sensory-overload-threshold-profiler.js

let testResults = JSON.parse(localStorage.getItem('sensoryTestResults')) || [];
let currentTest = null;
let testInterval = null;
let intensityLevel = 1;
let maxIntensity = 10;
let testStartTime = null;
let audioContext = null;
let oscillator = null;

function startTest() {
    const stimulusType = document.getElementById('stimulusType').value;
    const testDuration = parseInt(document.getElementById('testDuration').value);

    currentTest = {
        id: Date.now(),
        stimulusType: stimulusType,
        testDuration: testDuration,
        startTime: new Date().toISOString(),
        overloadTime: null,
        overloadIntensity: null,
        completed: false
    };

    testStartTime = Date.now();
    intensityLevel = 1;

    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('testSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';

    document.getElementById('intensityLevel').textContent = intensityLevel;

    if (stimulusType === 'auditory' || stimulusType === 'both') {
        initAudio();
    }

    startStimuli();
    testInterval = setInterval(increaseIntensity, testDuration * 1000 / maxIntensity);
}

function startStimuli() {
    const visualStimuli = document.getElementById('visualStimuli');
    visualStimuli.innerHTML = '';

    if (currentTest.stimulusType === 'visual' || currentTest.stimulusType === 'both') {
        createVisualStimuli();
    }

    if (currentTest.stimulusType === 'auditory' || currentTest.stimulusType === 'both') {
        startAudioStimuli();
    }
}

function createVisualStimuli() {
    const visualStimuli = document.getElementById('visualStimuli');
    const numElements = intensityLevel * 2;

    for (let i = 0; i < numElements; i++) {
        const element = document.createElement('div');
        element.className = 'stimulus-element';
        element.style.width = `${20 + intensityLevel * 5}px`;
        element.style.height = `${20 + intensityLevel * 5}px`;
        element.style.left = `${Math.random() * 80}%`;
        element.style.top = `${Math.random() * 80}%`;
        element.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        element.style.animationDelay = `${Math.random() * 3}s`;
        visualStimuli.appendChild(element);
    }
}

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function startAudioStimuli() {
    if (!audioContext) return;

    if (oscillator) {
        oscillator.stop();
    }

    oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(200 + intensityLevel * 50, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1 + intensityLevel * 0.05, audioContext.currentTime);

    oscillator.start();
}

function increaseIntensity() {
    intensityLevel++;
    document.getElementById('intensityLevel').textContent = intensityLevel;
    document.getElementById('progressFill').style.width = `${(intensityLevel / maxIntensity) * 100}%`;

    if (currentTest.stimulusType === 'visual' || currentTest.stimulusType === 'both') {
        createVisualStimuli();
    }

    if (currentTest.stimulusType === 'auditory' || currentTest.stimulusType === 'both') {
        startAudioStimuli();
    }

    if (intensityLevel >= maxIntensity) {
        endTest(false);
    }
}

function reportOverload() {
    const overloadTime = (Date.now() - testStartTime) / 1000;
    currentTest.overloadTime = overloadTime;
    currentTest.overloadIntensity = intensityLevel;
    currentTest.completed = true;

    endTest(true);
}

function endTest(overloaded) {
    clearInterval(testInterval);

    if (oscillator) {
        oscillator.stop();
        oscillator = null;
    }

    document.getElementById('visualStimuli').innerHTML = '';

    document.getElementById('testSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';

    if (overloaded) {
        document.getElementById('overloadThreshold').textContent = `Level ${currentTest.overloadIntensity}`;
        document.getElementById('timeToOverload').textContent = `${currentTest.overloadTime.toFixed(1)}s`;
    } else {
        document.getElementById('overloadThreshold').textContent = `> Level ${maxIntensity}`;
        document.getElementById('timeToOverload').textContent = `> ${currentTest.testDuration}s`;
    }

    document.getElementById('resultStimulusType').textContent = currentTest.stimulusType;
}

function saveResult() {
    if (currentTest) {
        testResults.push(currentTest);
        localStorage.setItem('sensoryTestResults', JSON.stringify(testResults));
        currentTest = null;
        updateHistory();
        updateChart();
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('setupSection').style.display = 'block';
    }
}

function updateHistory() {
    const historyDiv = document.getElementById('testHistory');
    historyDiv.innerHTML = '';

    testResults.slice(-5).reverse().forEach(result => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <strong>${new Date(result.startTime).toLocaleDateString()}</strong><br>
            Stimulus: ${result.stimulusType}<br>
            Threshold: ${result.overloadIntensity ? `Level ${result.overloadIntensity}` : '> Level 10'}<br>
            Time: ${result.overloadTime ? `${result.overloadTime.toFixed(1)}s` : `> ${result.testDuration}s`}
        `;
        historyDiv.appendChild(item);
    });
}

function updateChart() {
    const ctx = document.getElementById('thresholdChart').getContext('2d');

    const data = testResults.map(result => ({
        x: new Date(result.startTime),
        y: result.overloadIntensity || maxIntensity + 1
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Overload Threshold',
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
                    beginAtZero: true,
                    max: maxIntensity + 2,
                    ticks: {
                        callback: function(value) {
                            return value > maxIntensity ? `> ${maxIntensity}` : `Level ${value}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHistory();
    updateChart();
});