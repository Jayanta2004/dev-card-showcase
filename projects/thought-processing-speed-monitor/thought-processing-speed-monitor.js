// thought-processing-speed-monitor.js

let assessments = JSON.parse(localStorage.getItem('processingAssessments')) || [];
let currentTest = null;
let testStartTime = null;
let testResults = [];
let stimulusTimeout = null;
let responseTimeout = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    loadAssessments();
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
});

function initializeSliders() {
    const sliders = ['mentalClarity', 'decisionSpeed', 'focusDuration', 'cognitiveFatigue'];
    sliders.forEach(slider => {
        const element = document.getElementById(slider);
        const valueElement = document.getElementById(slider.replace('Clarity', 'Value').replace('Speed', 'Value').replace('Duration', 'Value').replace('Fatigue', 'Value'));
        
        element.addEventListener('input', function() {
            valueElement.textContent = this.value;
        });
    });
}

function startTest() {
    currentTest = {
        startTime: new Date(),
        stimuli: [],
        responses: [],
        correctResponses: 0,
        totalResponses: 0
    };
    
    testResults = [];
    
    document.getElementById('testInterface').querySelector('.test-instructions').style.display = 'none';
    document.getElementById('stimulusArea').style.display = 'block';
    document.getElementById('testResults').style.display = 'none';
    
    // Start the test sequence
    runTestSequence();
}

function runTestSequence() {
    const stimuli = ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B']; // 10 stimuli
    let currentStimulusIndex = 0;
    
    function showNextStimulus() {
        if (currentStimulusIndex >= stimuli.length) {
            endTest();
            return;
        }
        
        const stimulus = stimuli[currentStimulusIndex];
        const correctResponse = stimulus === 'A' ? 1 : 2;
        
        document.getElementById('stimulus').textContent = stimulus;
        testStartTime = performance.now();
        
        currentTest.stimuli.push({
            stimulus: stimulus,
            correctResponse: correctResponse,
            presentationTime: testStartTime
        });
        
        // Hide stimulus after random delay (500-1500ms)
        const hideDelay = Math.random() * 1000 + 500;
        stimulusTimeout = setTimeout(() => {
            document.getElementById('stimulus').textContent = '';
            
            // Wait for response (max 2 seconds)
            responseTimeout = setTimeout(() => {
                // No response - mark as incorrect
                recordResponse(0, true); // 0 means no response
                currentStimulusIndex++;
                setTimeout(showNextStimulus, 500); // Brief pause before next
            }, 2000);
        }, hideDelay);
        
        currentStimulusIndex++;
    }
    
    showNextStimulus();
}

function recordResponse(response, timeout = false) {
    if (!currentTest || !testStartTime) return;
    
    const responseTime = performance.now() - testStartTime;
    const currentStimulus = currentTest.stimuli[currentTest.stimuli.length - 1];
    
    if (!timeout) {
        clearTimeout(responseTimeout);
    }
    
    const isCorrect = !timeout && response === currentStimulus.correctResponse;
    
    currentTest.responses.push({
        response: response,
        responseTime: responseTime,
        isCorrect: isCorrect,
        stimulus: currentStimulus.stimulus
    });
    
    if (isCorrect) {
        currentTest.correctResponses++;
    }
    currentTest.totalResponses++;
    
    testResults.push({
        stimulus: currentStimulus.stimulus,
        response: response,
        responseTime: responseTime,
        correct: isCorrect
    });
}

function endTest() {
    clearTimeout(stimulusTimeout);
    clearTimeout(responseTimeout);
    
    // Calculate results
    const validResponses = testResults.filter(r => r.response !== 0);
    const avgReactionTime = validResponses.length > 0 
        ? validResponses.reduce((sum, r) => sum + r.responseTime, 0) / validResponses.length 
        : 0;
    const accuracy = currentTest.totalResponses > 0 
        ? (currentTest.correctResponses / currentTest.totalResponses) * 100 
        : 0;
    
    // Calculate processing speed score (lower time + higher accuracy = higher score)
    const timeScore = Math.max(0, 100 - (avgReactionTime / 10)); // Normalize time score
    const accuracyScore = accuracy;
    const processingScore = Math.round((timeScore + accuracyScore) / 2);
    
    // Display results
    document.getElementById('avgReactionTime').textContent = Math.round(avgReactionTime) + ' ms';
    document.getElementById('accuracy').textContent = Math.round(accuracy) + '%';
    document.getElementById('processingScore').textContent = processingScore;
    
    document.getElementById('stimulusArea').style.display = 'none';
    document.getElementById('testResults').style.display = 'block';
    
    // Store test results for saving
    currentTest.finalResults = {
        avgReactionTime: avgReactionTime,
        accuracy: accuracy,
        processingScore: processingScore
    };
}

function saveTestResults() {
    if (!currentTest || !currentTest.finalResults) return;
    
    const testAssessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: 'test',
        avgReactionTime: currentTest.finalResults.avgReactionTime,
        accuracy: currentTest.finalResults.accuracy,
        processingScore: currentTest.finalResults.processingScore,
        notes: 'Automated processing speed test'
    };
    
    assessments.push(testAssessment);
    
    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }
    
    localStorage.setItem('processingAssessments', JSON.stringify(assessments));
    
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
    
    // Reset test interface
    document.getElementById('testInterface').querySelector('.test-instructions').style.display = 'block';
    document.getElementById('testResults').style.display = 'none';
    document.getElementById('startTestBtn').disabled = false;
    
    currentTest = null;
    alert('Test results saved successfully!');
}

document.getElementById('assessmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const assessment = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: 'manual',
        mentalClarity: parseInt(document.getElementById('mentalClarity').value),
        decisionSpeed: parseInt(document.getElementById('decisionSpeed').value),
        focusDuration: parseInt(document.getElementById('focusDuration').value),
        cognitiveFatigue: parseInt(document.getElementById('cognitiveFatigue').value),
        notes: document.getElementById('notes').value.trim(),
        processingSpeedIndex: calculateProcessingSpeedIndex()
    };
    
    assessments.push(assessment);
    
    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }
    
    localStorage.setItem('processingAssessments', JSON.stringify(assessments));
    
    // Reset form
    document.getElementById('assessmentForm').reset();
    initializeSliders();
    
    updateStats();
    updateChart();
    updateHistory();
    updateCurrentScore();
    
    alert('Assessment logged successfully!');
});

function calculateProcessingSpeedIndex() {
    const clarity = parseInt(document.getElementById('mentalClarity').value);
    const decision = parseInt(document.getElementById('decisionSpeed').value);
    const focus = parseInt(document.getElementById('focusDuration').value);
    const fatigue = parseInt(document.getElementById('cognitiveFatigue').value);
    
    // Invert fatigue (lower fatigue is better)
    const invertedFatigue = 11 - fatigue;
    
    // Calculate weighted average
    const score = Math.round((clarity * 0.25 + decision * 0.25 + focus * 0.25 + invertedFatigue * 0.25) * 10);
    
    return Math.min(100, Math.max(0, score));
}

function updateCurrentScore() {
    if (assessments.length === 0) {
        document.getElementById('processingSpeedIndex').textContent = '0';
        document.getElementById('scoreInterpretation').textContent = 'No assessments logged yet';
        return;
    }
    
    const latest = assessments[assessments.length - 1];
    const score = latest.processingSpeedIndex || latest.processingScore || 0;
    document.getElementById('processingSpeedIndex').textContent = score;
    
    let interpretation = '';
    if (score >= 80) {
        interpretation = 'Excellent processing speed - Sharp and focused!';
        document.getElementById('processingSpeedIndex').style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (score >= 60) {
        interpretation = 'Good processing speed - Performing well';
        document.getElementById('processingSpeedIndex').style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
    } else if (score >= 40) {
        interpretation = 'Moderate processing speed - Room for improvement';
        document.getElementById('processingSpeedIndex').style.background = 'linear-gradient(135deg, #FF5722, #D84315)';
    } else {
        interpretation = 'Low processing speed - Consider cognitive exercises';
        document.getElementById('processingSpeedIndex').style.background = 'linear-gradient(135deg, #F44336, #C62828)';
    }
    
    document.getElementById('scoreInterpretation').textContent = interpretation;
}

function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgIndex').textContent = '0';
        document.getElementById('bestScore').textContent = '0';
        document.getElementById('totalAssessments').textContent = '0';
        document.getElementById('improvementRate').textContent = '0%';
        return;
    }
    
    const scores = assessments.map(a => a.processingSpeedIndex || a.processingScore || 0);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    
    // Calculate improvement rate
    let improvementRate = 0;
    if (assessments.length >= 10) {
        const firstTenPercent = Math.ceil(assessments.length * 0.1);
        const lastTenPercent = Math.ceil(assessments.length * 0.1);
        
        const earlyScores = assessments.slice(0, firstTenPercent).map(a => a.processingSpeedIndex || a.processingScore || 0);
        const recentScores = assessments.slice(-lastTenPercent).map(a => a.processingSpeedIndex || a.processingScore || 0);
        
        const earlyAvg = earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length;
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        
        if (earlyAvg > 0) {
            improvementRate = Math.round(((recentAvg - earlyAvg) / earlyAvg) * 100);
        }
    }
    
    document.getElementById('avgIndex').textContent = avg;
    document.getElementById('bestScore').textContent = best;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('improvementRate').textContent = improvementRate > 0 ? `+${improvementRate}%` : `${improvementRate}%`;
}

function updateChart() {
    const ctx = document.getElementById('processingChart').getContext('2d');
    
    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const data = sortedAssessments.map(a => a.processingSpeedIndex || a.processingScore || 0);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Processing Speed Index',
                data: data,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Thought Processing Speed Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Processing Speed Index'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

function updateHistory() {
    const history = document.getElementById('assessmentsHistory');
    history.innerHTML = '';
    
    // Show last 10 assessments
    const recentAssessments = assessments.slice(-10).reverse();
    
    recentAssessments.forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'session-entry';
        
        const date = new Date(assessment.date).toLocaleString();
        const score = assessment.processingSpeedIndex || assessment.processingScore || 0;
        
        item.innerHTML = `
            <h4>${date} ${assessment.type === 'test' ? '(Test)' : '(Manual)'}</h4>
            <p><strong>Processing Speed Index:</strong> <span class="duration">${score}/100</span></p>
            ${assessment.type === 'test' ? 
                `<p><strong>Reaction Time:</strong> ${Math.round(assessment.avgReactionTime)}ms | <strong>Accuracy:</strong> ${Math.round(assessment.accuracy)}%</p>` :
                `<p><strong>Clarity:</strong> ${assessment.mentalClarity}/10 | <strong>Decision Speed:</strong> ${assessment.decisionSpeed}/10 | <strong>Focus:</strong> ${assessment.focusDuration}/10 | <strong>Fatigue:</strong> ${assessment.cognitiveFatigue}/10</p>`
            }
            ${assessment.notes ? '<p><strong>Notes:</strong> ' + assessment.notes + '</p>' : ''}
        `;
        
        history.appendChild(item);
    });
}

function loadAssessments() {
    // Assessments are loaded from localStorage at the top
}