// adaptive-stress-capacity-index.js

let stressAssessments = JSON.parse(localStorage.getItem('stressCapacityAssessments')) || [];
let stressTests = JSON.parse(localStorage.getItem('stressCapacityTests')) || [];
let currentStressTest = null;
let stressTestTimer = null;
let stressTestStartTime = null;
let currentTestType = 'breathing';

const stressTestTypes = {
    breathing: {
        name: 'Breathing Control Test',
        description: 'Test your ability to regulate breathing under mild stress.',
        instructions: 'Follow the breathing circle. Inhale as it expands, exhale as it contracts. Maintain steady rhythm.',
        duration: 120, // 2 minutes
        targetHRV: 10 // target heart rate variability improvement
    },
    cognitive: {
        name: 'Cognitive Stress Challenge',
        description: 'Test cognitive performance under time pressure.',
        instructions: 'Solve the puzzles as quickly and accurately as possible.',
        questions: [
            {
                question: 'What is 17 × 13?',
                options: ['221', '211', '231', '201'],
                correct: 0
            },
            {
                question: 'Complete the sequence: 1, 1, 2, 3, 5, 8, ?',
                options: ['13', '11', '15', '9'],
                correct: 0
            },
            {
                question: 'If all cats are mammals and some mammals are pets, then:',
                options: ['All cats are pets', 'Some cats are not pets', 'No cats are pets', 'All pets are cats'],
                correct: 1
            }
        ]
    },
    physical: {
        name: 'Physical Stress Response',
        description: 'Monitor heart rate response to physical exertion.',
        instructions: 'Record your heart rate before and after a brief exercise period.',
        exerciseDuration: 60 // 1 minute exercise
    },
    recovery: {
        name: 'Recovery Capacity Assessment',
        description: 'Evaluate how quickly you recover from stress.',
        instructions: 'Complete a short stressor then rate your recovery metrics.',
        stressorDuration: 30 // 30 seconds of stressor
    }
};

function logStressAssessment() {
    const baseline = parseInt(document.getElementById('baselineStress').value);
    const acute = parseInt(document.getElementById('acuteResponse').value);
    const recovery = parseInt(document.getElementById('recoveryRate').value);
    const resilience = parseInt(document.getElementById('resilienceScore').value);
    const stressors = document.getElementById('stressors').value.trim();
    const coping = document.getElementById('copingStrategies').value.trim();

    const assessment = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        baselineStress: baseline,
        acuteResponse: acute,
        recoveryRate: recovery,
        resilienceScore: resilience,
        stressors: stressors,
        copingStrategies: coping,
        adaptiveCapacity: calculateAdaptiveCapacity(baseline, acute, recovery, resilience),
        allostaticLoad: calculateAllostaticLoad(baseline, acute, recovery, resilience)
    };

    stressAssessments.push(assessment);

    // Keep only last 50 assessments
    if (stressAssessments.length > 50) {
        stressAssessments = stressAssessments.slice(-50);
    }

    localStorage.setItem('stressCapacityAssessments', JSON.stringify(stressAssessments));

    // Reset form
    document.getElementById('baselineStress').value = '3';
    document.getElementById('acuteResponse').value = '5';
    document.getElementById('recoveryRate').value = '7';
    document.getElementById('resilienceScore').value = '6';
    document.getElementById('stressors').value = '';
    document.getElementById('copingStrategies').value = '';
    updateRangeValues();

    updateStats();
    updateChart();
    updateHistory();
}

function calculateAdaptiveCapacity(baseline, acute, recovery, resilience) {
    // Higher recovery and resilience = better capacity
    // Lower baseline and acute = better capacity
    const positiveScore = (recovery + resilience) / 2;
    const negativeScore = (baseline + acute) / 2;
    const rawScore = positiveScore - (negativeScore - 5.5); // Adjust for scale
    return Math.max(0, Math.min(100, Math.round(rawScore * 10)));
}

function calculateAllostaticLoad(baseline, acute, recovery, resilience) {
    // Higher baseline, acute, and lower recovery/resilience = higher load
    const loadFactors = (baseline + acute + (11 - recovery) + (11 - resilience)) / 4;
    return Math.max(0, Math.min(100, Math.round(loadFactors * 10)));
}

function selectStressTest(testType) {
    currentTestType = testType;

    // Update button states
    document.querySelectorAll('.test-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    loadStressTestContent(testType);
}

function loadStressTestContent(testType) {
    const testData = stressTestTypes[testType];
    const contentDiv = document.getElementById('stressTestContent');

    let html = `
        <div class="stress-test-content">
            <h3>${testData.name}</h3>
            <p>${testData.description}</p>
            <p><strong>Instructions:</strong> ${testData.instructions}</p>
    `;

    switch(testType) {
        case 'breathing':
            html += `
                <div class="breathing-exercise">
                    <div class="breathing-circle" id="breathingCircle">Breathe</div>
                    <div class="breathing-instructions">
                        <p id="breathingInstruction">Inhale slowly...</p>
                        <p>Focus on the expanding and contracting circle</p>
                    </div>
                </div>
            `;
            break;
        case 'cognitive':
            html += `
                <div class="cognitive-challenge">
                    <div id="currentQuestion"></div>
                    <div class="challenge-options" id="challengeOptions"></div>
                    <div id="cognitiveResults" style="margin-top: 20px; display: none;">
                        <p>Correct answers: <span id="correctCount">0</span>/<span id="totalQuestions">0</span></p>
                        <p>Time taken: <span id="cognitiveTime">0</span> seconds</p>
                    </div>
                </div>
            `;
            break;
        case 'physical':
            html += `
                <div class="physical-stress-test">
                    <div class="heart-rate-input">
                        <label>Resting Heart Rate (BPM):</label>
                        <input type="number" id="restingHR" placeholder="70">
                    </div>
                    <p>Perform 1 minute of jumping jacks or similar exercise, then record your heart rate.</p>
                    <div class="heart-rate-input">
                        <label>Post-Exercise Heart Rate (BPM):</label>
                        <input type="number" id="exerciseHR" placeholder="120">
                    </div>
                    <button onclick="calculateHRRecovery()">Calculate Recovery</button>
                    <div id="hrResults" style="margin-top: 20px; display: none;">
                        <p>Heart Rate Recovery: <span id="hrRecovery">0</span>%</p>
                        <p>Recovery Rating: <span id="recoveryRating">-</span></p>
                    </div>
                </div>
            `;
            break;
        case 'recovery':
            html += `
                <div class="recovery-assessment">
                    <p>Perform a 30-second stressor (hold your breath, do mental math, etc.)</p>
                    <p>Then rate your recovery on these metrics:</p>
                    <div class="recovery-metrics">
                        <div class="metric-input">
                            <label>Heart Rate (BPM)</label>
                            <input type="number" id="recoveryHR" placeholder="70">
                        </div>
                        <div class="metric-input">
                            <label>Breathing Rate</label>
                            <input type="number" id="recoveryBreathing" placeholder="12">
                        </div>
                        <div class="metric-input">
                            <label>Stress Level (1-10)</label>
                            <input type="number" id="recoveryStress" min="1" max="10" placeholder="3">
                        </div>
                        <div class="metric-input">
                            <label>Focus Level (1-10)</label>
                            <input type="number" id="recoveryFocus" min="1" max="10" placeholder="8">
                        </div>
                    </div>
                    <button onclick="calculateRecoveryScore()">Calculate Recovery Score</button>
                    <div id="recoveryResults" style="margin-top: 20px; display: none;">
                        <p>Recovery Score: <span id="recoveryScore">0</span>/100</p>
                        <p>Recovery Rating: <span id="recoveryRatingText">-</span></p>
                    </div>
                </div>
            `;
            break;
    }

    html += '</div>';
    contentDiv.innerHTML = html;
}

function startStressTest() {
    if (currentStressTest) return;

    stressTestStartTime = new Date();
    currentStressTest = {
        id: Date.now(),
        type: currentTestType,
        startTime: stressTestStartTime.toISOString(),
        endTime: null,
        duration: 0,
        completed: false,
        score: 0,
        data: {}
    };

    document.getElementById('startStressTestBtn').disabled = true;
    document.getElementById('endStressTestBtn').disabled = false;

    stressTestTimer = setInterval(updateStressTestTimer, 1000);

    // Initialize test-specific variables
    switch(currentTestType) {
        case 'breathing':
            startBreathingExercise();
            break;
        case 'cognitive':
            startCognitiveChallenge();
            break;
        case 'physical':
            // Wait for user input
            break;
        case 'recovery':
            startRecoveryAssessment();
            break;
    }
}

function endStressTest() {
    if (!currentStressTest) return;

    clearInterval(stressTestTimer);
    const endTime = new Date();
    const duration = Math.floor((endTime - stressTestStartTime) / 1000);

    currentStressTest.endTime = endTime.toISOString();
    currentStressTest.duration = duration;
    currentStressTest.completed = true;

    // Calculate score based on test type
    switch(currentTestType) {
        case 'breathing':
            currentStressTest.score = breathingScore;
            break;
        case 'cognitive':
            currentStressTest.score = cognitiveScore;
            break;
        case 'physical':
            currentStressTest.score = hrRecoveryScore;
            break;
        case 'recovery':
            currentStressTest.score = recoveryScore;
            break;
    }

    stressTests.push(currentStressTest);

    // Keep only last 20 tests
    if (stressTests.length > 20) {
        stressTests = stressTests.slice(-20);
    }

    localStorage.setItem('stressCapacityTests', JSON.stringify(stressTests));

    // Reset UI
    document.getElementById('startStressTestBtn').disabled = false;
    document.getElementById('endStressTestBtn').disabled = true;
    document.getElementById('stressTestTimer').textContent = '00:00:00';

    currentStressTest = null;
    stressTestStartTime = null;

    alert(`Test completed! Duration: ${formatDuration(duration)}, Score: ${currentStressTest.score}`);
}

function updateStressTestTimer() {
    if (!stressTestStartTime) return;

    const now = new Date();
    const elapsed = Math.floor((now - stressTestStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    document.getElementById('stressTestTimer').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateRangeValues() {
    document.getElementById('baselineValue').textContent = document.getElementById('baselineStress').value;
    document.getElementById('acuteValue').textContent = document.getElementById('acuteResponse').value;
    document.getElementById('recoveryValue').textContent = document.getElementById('recoveryRate').value;
    document.getElementById('resilienceValue').textContent = document.getElementById('resilienceScore').value;
}

function updateStats() {
    if (stressAssessments.length === 0) {
        document.getElementById('adaptiveIndex').textContent = '0/100';
        document.getElementById('allostaticLoad').textContent = '0/100';
        document.getElementById('recoveryEfficiency').textContent = '0%';
        document.getElementById('resilienceTrend').textContent = '0%';
        return;
    }

    const adaptiveScores = stressAssessments.map(a => a.adaptiveCapacity);
    const loadScores = stressAssessments.map(a => a.allostaticLoad);
    const recoveryRates = stressAssessments.map(a => a.recoveryRate);
    const resilienceScores = stressAssessments.map(a => a.resilienceScore);

    const avgAdaptive = Math.round(adaptiveScores.reduce((a, b) => a + b, 0) / adaptiveScores.length);
    const avgLoad = Math.round(loadScores.reduce((a, b) => a + b, 0) / loadScores.length);
    const avgRecovery = Math.round(recoveryRates.reduce((a, b) => a + b, 0) / recoveryRates.length);

    // Calculate recovery efficiency (how often recovery rate > 7)
    const highRecoveryCount = recoveryRates.filter(r => r > 7).length;
    const recoveryEfficiency = Math.round((highRecoveryCount / recoveryRates.length) * 100);

    // Calculate resilience trend
    let resilienceTrend = 0;
    if (resilienceScores.length >= 5) {
        const recent = resilienceScores.slice(-5);
        const earlier = resilienceScores.slice(-10, -5);
        if (earlier.length > 0) {
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
            resilienceTrend = Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100);
        }
    }

    document.getElementById('adaptiveIndex').textContent = `${avgAdaptive}/100`;
    document.getElementById('allostaticLoad').textContent = `${avgLoad}/100`;
    document.getElementById('recoveryEfficiency').textContent = `${recoveryEfficiency}%`;
    document.getElementById('resilienceTrend').textContent = `${resilienceTrend > 0 ? '+' : ''}${resilienceTrend}%`;
}

function updateChart() {
    const ctx = document.getElementById('stressChart').getContext('2d');

    // Sort assessments by date
    const sortedAssessments = stressAssessments.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedAssessments.map(a => new Date(a.timestamp).toLocaleDateString());
    const adaptiveData = sortedAssessments.map(a => a.adaptiveCapacity);
    const loadData = sortedAssessments.map(a => a.allostaticLoad);
    const recoveryData = sortedAssessments.map(a => a.recoveryRate);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Adaptive Capacity',
                data: adaptiveData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Allostatic Load',
                data: loadData,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Recovery Rate',
                data: recoveryData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Stress Capacity Trends'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Capacity/Load Score'
                    },
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Recovery Rate'
                    },
                    max: 10,
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });
}

function updateHistory() {
    const history = document.getElementById('stressHistory');
    history.innerHTML = '';

    // Show last 10 assessments
    const recentAssessments = stressAssessments.slice(-10).reverse();

    recentAssessments.forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'stress-entry';

        const date = new Date(assessment.timestamp).toLocaleString();

        item.innerHTML = `
            <h4>${date}</h4>
            <p><strong>Adaptive Capacity:</strong> <span class="capacity">${assessment.adaptiveCapacity}/100</span></p>
            <p><strong>Allostatic Load:</strong> <span class="load">${assessment.allostaticLoad}/100</span></p>
            <p><strong>Recovery Rate:</strong> <span class="recovery">${assessment.recoveryRate}/10</span></p>
            ${assessment.stressors ? `<p><strong>Stressors:</strong> ${assessment.stressors}</p>` : ''}
            ${assessment.copingStrategies ? `<p><strong>Coping:</strong> ${assessment.copingStrategies}</p>` : ''}
        `;

        history.appendChild(item);
    });
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateRangeValues();

    // Add event listeners for range inputs
    ['baselineStress', 'acuteResponse', 'recoveryRate', 'resilienceScore'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateRangeValues);
    });

    loadStressTestContent('breathing');
    updateStats();
    updateChart();
    updateHistory();
});

// Test-specific functions (simplified implementations)
let breathingCycle = 0;
let breathingScore = 0;

function startBreathingExercise() {
    const circle = document.getElementById('breathingCircle');
    const instruction = document.getElementById('breathingInstruction');

    function breathingCycleFunc() {
        if (!currentStressTest) return;

        breathingCycle++;
        if (breathingCycle % 2 === 1) {
            // Inhale
            circle.style.transform = 'scale(1.5)';
            instruction.textContent = 'Inhale slowly...';
            setTimeout(() => {
                circle.style.transform = 'scale(1)';
                instruction.textContent = 'Hold...';
            }, 4000);
        } else {
            // Exhale
            instruction.textContent = 'Exhale slowly...';
        }

        breathingScore = Math.min(100, breathingCycle * 10); // Simple scoring
    }

    breathingCycleFunc();
    const breathingInterval = setInterval(breathingCycleFunc, 8000); // 8 second cycles

    // Clean up interval when test ends
    const originalEndTest = window.endStressTest;
    window.endStressTest = function() {
        clearInterval(breathingInterval);
        originalEndTest();
    };
}

let currentQuestionIndex = 0;
let correctAnswers = 0;
let cognitiveStartTime = 0;
let cognitiveScore = 0;

function startCognitiveChallenge() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    cognitiveStartTime = Date.now();
    loadCognitiveQuestion(currentQuestionIndex);
}

function loadCognitiveQuestion(index) {
    const questions = stressTestTypes.cognitive.questions;
    if (index >= questions.length) {
        completeCognitiveChallenge();
        return;
    }

    const question = questions[index];
    document.getElementById('currentQuestion').innerHTML = `<div class="challenge-question">${question.question}</div>`;

    const optionsDiv = document.getElementById('challengeOptions');
    optionsDiv.innerHTML = '';

    question.options.forEach((option, i) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'challenge-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectCognitiveAnswer(i, question.correct);
        optionsDiv.appendChild(optionDiv);
    });
}

function selectCognitiveAnswer(selected, correct) {
    if (selected === correct) {
        correctAnswers++;
    }
    currentQuestionIndex++;
    loadCognitiveQuestion(currentQuestionIndex);
}

function completeCognitiveChallenge() {
    const timeTaken = Math.floor((Date.now() - cognitiveStartTime) / 1000);
    cognitiveScore = Math.round((correctAnswers / stressTestTypes.cognitive.questions.length) * 100);

    document.getElementById('cognitiveResults').style.display = 'block';
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('totalQuestions').textContent = stressTestTypes.cognitive.questions.length;
    document.getElementById('cognitiveTime').textContent = timeTaken;
}

let hrRecoveryScore = 0;

function calculateHRRecovery() {
    const restingHR = parseInt(document.getElementById('restingHR').value);
    const exerciseHR = parseInt(document.getElementById('exerciseHR').value);

    if (!restingHR || !exerciseHR) {
        alert('Please enter both heart rate values.');
        return;
    }

    // Simplified HR recovery calculation (actual recovery would be measured over time)
    const recovery = Math.max(0, Math.min(100, ((exerciseHR - restingHR) / restingHR) * 100));
    hrRecoveryScore = Math.round(100 - recovery); // Invert so higher is better

    document.getElementById('hrResults').style.display = 'block';
    document.getElementById('hrRecovery').textContent = hrRecoveryScore;

    let rating = 'Poor';
    if (hrRecoveryScore > 80) rating = 'Excellent';
    else if (hrRecoveryScore > 60) rating = 'Good';
    else if (hrRecoveryScore > 40) rating = 'Fair';

    document.getElementById('recoveryRating').textContent = rating;
}

let recoveryScore = 0;

function calculateRecoveryScore() {
    const hr = parseInt(document.getElementById('recoveryHR').value) || 70;
    const breathing = parseInt(document.getElementById('recoveryBreathing').value) || 12;
    const stress = parseInt(document.getElementById('recoveryStress').value) || 5;
    const focus = parseInt(document.getElementById('recoveryFocus').value) || 8;

    // Calculate recovery score based on how close metrics are to baseline
    const hrScore = Math.max(0, 100 - Math.abs(hr - 70)); // Assuming 70 BPM baseline
    const breathingScore = Math.max(0, 100 - Math.abs(breathing - 12) * 10); // Assuming 12 breaths/min baseline
    const stressScore = (11 - stress) * 10; // Lower stress = higher score
    const focusScore = focus * 10; // Higher focus = higher score

    recoveryScore = Math.round((hrScore + breathingScore + stressScore + focusScore) / 4);

    document.getElementById('recoveryResults').style.display = 'block';
    document.getElementById('recoveryScore').textContent = recoveryScore;

    let rating = 'Poor';
    if (recoveryScore > 80) rating = 'Excellent';
    else if (recoveryScore > 60) rating = 'Good';
    else if (recoveryScore > 40) rating = 'Fair';

    document.getElementById('recoveryRatingText').textContent = rating;
}

function startRecoveryAssessment() {
    // Start 30-second stressor countdown
    let countdown = 30;
    const countdownDisplay = document.createElement('div');
    countdownDisplay.style.fontSize = '48px';
    countdownDisplay.style.textAlign = 'center';
    countdownDisplay.style.margin = '20px 0';

    document.querySelector('.recovery-assessment').insertBefore(countdownDisplay, document.querySelector('.recovery-metrics'));

    const countdownInterval = setInterval(() => {
        countdownDisplay.textContent = `Stressor: ${countdown} seconds remaining`;
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            countdownDisplay.textContent = 'Stressor complete! Now rate your recovery metrics below.';
        }
    }, 1000);
}