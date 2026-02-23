// mental-resistance-threshold-meter.js

let mentalAssessments = JSON.parse(localStorage.getItem('mentalResistanceAssessments')) || [];
let thresholdTests = JSON.parse(localStorage.getItem('mentalThresholdTests')) || [];
let currentTest = null;
let testTimer = null;
let testStartTime = null;
let currentTestType = 'focus';

const testTypes = {
    focus: {
        name: 'Focus Endurance Test',
        description: 'Maintain focus on a single point for as long as possible. Click the button repeatedly without losing concentration.',
        instructions: 'Click the target button as quickly as possible while maintaining focus. Stop when you feel mental fatigue setting in.',
        duration: 0,
        targetClicks: 100
    },
    memory: {
        name: 'Memory Challenge',
        description: 'Test your working memory capacity with increasingly complex sequences.',
        instructions: 'Memorize the sequence of numbers/colors and recall them in order.',
        sequences: [
            [1, 2, 3],
            [3, 1, 4, 1, 5],
            [2, 7, 1, 8, 2, 8],
            [1, 6, 1, 8, 0, 3, 1],
            [2, 5, 8, 1, 6, 2, 8, 4]
        ]
    },
    problem: {
        name: 'Problem Solving Challenge',
        description: 'Solve logic puzzles under time pressure to test cognitive flexibility.',
        instructions: 'Solve the puzzle as quickly as possible. Select the correct answer from the options.',
        puzzles: [
            {
                question: 'If all bloops are razzes and some razzes are fizzles, then:',
                options: ['All bloops are fizzles', 'Some bloops are not fizzles', 'No bloops are fizzles', 'All fizzles are bloops'],
                correct: 1
            },
            {
                question: 'Complete the pattern: 2, 4, 8, 16, ?',
                options: ['24', '32', '18', '20'],
                correct: 1
            },
            {
                question: 'Which word does not belong: Apple, Banana, Carrot, Orange?',
                options: ['Apple', 'Banana', 'Carrot', 'Orange'],
                correct: 2
            }
        ]
    },
    stress: {
        name: 'Stress Simulation',
        description: 'Handle multiple mental tasks simultaneously to simulate real-world stress.',
        instructions: 'Count backward from 100 by 7s while remembering a sequence of words.',
        words: ['elephant', 'butterfly', 'mountain', 'ocean', 'sunflower', 'thunder', 'rainbow']
    }
};

function logMentalState() {
    const energy = parseInt(document.getElementById('currentEnergy').value);
    const stress = parseInt(document.getElementById('stressLevel').value);
    const focus = parseInt(document.getElementById('focusLevel').value);
    const motivation = parseInt(document.getElementById('motivationLevel').value);
    const fatigue = parseInt(document.getElementById('mentalFatigue').value);
    const notes = document.getElementById('notes').value.trim();

    const assessment = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        energy: energy,
        stress: stress,
        focus: focus,
        motivation: motivation,
        fatigue: fatigue,
        notes: notes,
        resistanceScore: calculateResistanceScore(energy, stress, focus, motivation, fatigue)
    };

    mentalAssessments.push(assessment);

    // Keep only last 50 assessments
    if (mentalAssessments.length > 50) {
        mentalAssessments = mentalAssessments.slice(-50);
    }

    localStorage.setItem('mentalResistanceAssessments', JSON.stringify(mentalAssessments));

    // Reset form
    document.getElementById('currentEnergy').value = '7';
    document.getElementById('stressLevel').value = '3';
    document.getElementById('focusLevel').value = '8';
    document.getElementById('motivationLevel').value = '6';
    document.getElementById('mentalFatigue').value = '4';
    document.getElementById('notes').value = '';
    updateRangeValues();

    updateStats();
    updateChart();
    updateHistory();
}

function calculateResistanceScore(energy, stress, focus, motivation, fatigue) {
    // Higher energy, focus, motivation = better score
    // Lower stress, fatigue = better score
    const positiveScore = (energy + focus + motivation) / 3;
    const negativeScore = (stress + fatigue) / 2;
    const rawScore = positiveScore - (negativeScore - 5.5); // Adjust for scale
    return Math.max(0, Math.min(100, Math.round(rawScore * 10)));
}

function selectTest(testType) {
    currentTestType = testType;

    // Update button states
    document.querySelectorAll('.test-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    loadTestContent(testType);
}

function loadTestContent(testType) {
    const testData = testTypes[testType];
    const contentDiv = document.getElementById('testContent');

    let html = `
        <div class="test-content">
            <h3>${testData.name}</h3>
            <p>${testData.description}</p>
            <p><strong>Instructions:</strong> ${testData.instructions}</p>
    `;

    switch(testType) {
        case 'focus':
            html += `
                <div id="focusTarget" class="focus-target" onclick="focusClick()">
                    <div class="target-circle">CLICK ME</div>
                </div>
                <div class="click-counter">Clicks: <span id="clickCount">0</span></div>
            `;
            break;
        case 'memory':
            html += `
                <div id="memoryTest">
                    <button onclick="startMemoryTest()">Start Memory Test</button>
                    <div id="sequenceDisplay" style="display: none;"></div>
                    <div id="recallInput" style="display: none;">
                        <input type="text" id="memoryInput" placeholder="Enter the sequence">
                        <button onclick="checkMemory()">Submit</button>
                    </div>
                </div>
            `;
            break;
        case 'problem':
            html += `
                <div id="problemTest">
                    <div id="currentProblem"></div>
                    <div class="problem-options" id="problemOptions"></div>
                </div>
            `;
            break;
        case 'stress':
            html += `
                <div id="stressTest">
                    <div id="stressWords"></div>
                    <div id="countingTask">
                        <p>Count backward from 100 by 7s:</p>
                        <div id="countingDisplay">100</div>
                        <button onclick="nextCount()">Next</button>
                    </div>
                    <div id="stressRecall" style="display: none;">
                        <p>Recall the words in order:</p>
                        <input type="text" id="stressInput" placeholder="Enter words separated by commas">
                        <button onclick="checkStressRecall()">Submit</button>
                    </div>
                </div>
            `;
            break;
    }

    html += '</div>';
    contentDiv.innerHTML = html;
}

function startThresholdTest() {
    if (currentTest) return;

    testStartTime = new Date();
    currentTest = {
        id: Date.now(),
        type: currentTestType,
        startTime: testStartTime.toISOString(),
        endTime: null,
        duration: 0,
        completed: false,
        score: 0
    };

    document.getElementById('startTestBtn').disabled = true;
    document.getElementById('endTestBtn').disabled = false;

    testTimer = setInterval(updateTestTimer, 1000);

    // Initialize test-specific variables
    switch(currentTestType) {
        case 'focus':
            focusClicks = 0;
            document.getElementById('clickCount').textContent = '0';
            break;
        case 'memory':
            currentMemoryLevel = 0;
            break;
        case 'problem':
            currentProblemIndex = 0;
            loadProblem(currentProblemIndex);
            break;
        case 'stress':
            stressCount = 100;
            stressWordsShown = [];
            showStressWords();
            break;
    }
}

function endThresholdTest() {
    if (!currentTest) return;

    clearInterval(testTimer);
    const endTime = new Date();
    const duration = Math.floor((endTime - testStartTime) / 1000);

    currentTest.endTime = endTime.toISOString();
    currentTest.duration = duration;
    currentTest.completed = true;

    // Calculate score based on test type
    switch(currentTestType) {
        case 'focus':
            currentTest.score = focusClicks;
            break;
        case 'memory':
            currentTest.score = currentMemoryLevel;
            break;
        case 'problem':
            currentTest.score = correctAnswers;
            break;
        case 'stress':
            currentTest.score = stressCorrectWords;
            break;
    }

    thresholdTests.push(currentTest);

    // Keep only last 20 tests
    if (thresholdTests.length > 20) {
        thresholdTests = thresholdTests.slice(-20);
    }

    localStorage.setItem('mentalThresholdTests', JSON.stringify(thresholdTests));

    // Reset UI
    document.getElementById('startTestBtn').disabled = false;
    document.getElementById('endTestBtn').disabled = true;
    document.getElementById('testTimer').textContent = '00:00:00';

    currentTest = null;
    testStartTime = null;

    alert(`Test completed! Duration: ${formatDuration(duration)}, Score: ${currentTest.score}`);
}

function updateTestTimer() {
    if (!testStartTime) return;

    const now = new Date();
    const elapsed = Math.floor((now - testStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    document.getElementById('testTimer').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateRangeValues() {
    document.getElementById('energyValue').textContent = document.getElementById('currentEnergy').value;
    document.getElementById('stressValue').textContent = document.getElementById('stressLevel').value;
    document.getElementById('focusValue').textContent = document.getElementById('focusLevel').value;
    document.getElementById('motivationValue').textContent = document.getElementById('motivationLevel').value;
    document.getElementById('fatigueValue').textContent = document.getElementById('mentalFatigue').value;
}

function updateStats() {
    if (mentalAssessments.length === 0) {
        document.getElementById('avgResistance').textContent = '0/100';
        document.getElementById('avgFatigue').textContent = '0/10';
        document.getElementById('recoveryRate').textContent = '0%';
        document.getElementById('peakDays').textContent = '0';
        return;
    }

    const resistanceScores = mentalAssessments.map(a => a.resistanceScore);
    const fatigueLevels = mentalAssessments.map(a => a.fatigue);
    const avgResistance = Math.round(resistanceScores.reduce((a, b) => a + b, 0) / resistanceScores.length);
    const avgFatigue = Math.round(fatigueLevels.reduce((a, b) => a + b, 0) / fatigueLevels.length);

    // Calculate recovery rate (how often fatigue decreases)
    let recoveryCount = 0;
    for (let i = 1; i < mentalAssessments.length; i++) {
        if (mentalAssessments[i].fatigue < mentalAssessments[i-1].fatigue) {
            recoveryCount++;
        }
    }
    const recoveryRate = mentalAssessments.length > 1 ?
        Math.round((recoveryCount / (mentalAssessments.length - 1)) * 100) : 0;

    // Count peak performance days (resistance score > 80)
    const peakDays = resistanceScores.filter(score => score > 80).length;

    document.getElementById('avgResistance').textContent = `${avgResistance}/100`;
    document.getElementById('avgFatigue').textContent = `${avgFatigue}/10`;
    document.getElementById('recoveryRate').textContent = `${recoveryRate}%`;
    document.getElementById('peakDays').textContent = peakDays;
}

function updateChart() {
    const ctx = document.getElementById('mentalChart').getContext('2d');

    // Sort assessments by date
    const sortedAssessments = mentalAssessments.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const labels = sortedAssessments.map(a => new Date(a.timestamp).toLocaleDateString());
    const resistanceData = sortedAssessments.map(a => a.resistanceScore);
    const fatigueData = sortedAssessments.map(a => a.fatigue);
    const stressData = sortedAssessments.map(a => a.stress);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Resistance Score',
                data: resistanceData,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Fatigue Level',
                data: fatigueData,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }, {
                label: 'Stress Level',
                data: stressData,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Mental Resistance Trends'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Resistance Score'
                    },
                    max: 100
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Fatigue/Stress Level'
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
    const history = document.getElementById('mentalHistory');
    history.innerHTML = '';

    // Show last 10 assessments
    const recentAssessments = mentalAssessments.slice(-10).reverse();

    recentAssessments.forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'mental-entry';

        const date = new Date(assessment.timestamp).toLocaleString();

        item.innerHTML = `
            <h4>${date}</h4>
            <p><strong>Resistance Score:</strong> <span class="energy">${assessment.resistanceScore}/100</span></p>
            <p><strong>Energy:</strong> ${assessment.energy}/10 | <strong>Stress:</strong> <span class="stress">${assessment.stress}/10</span> | <strong>Fatigue:</strong> <span class="fatigue">${assessment.fatigue}/10</span></p>
            ${assessment.notes ? `<p><strong>Notes:</strong> ${assessment.notes}</p>` : ''}
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
    ['currentEnergy', 'stressLevel', 'focusLevel', 'motivationLevel', 'mentalFatigue'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateRangeValues);
    });

    loadTestContent('focus');
    updateStats();
    updateChart();
    updateHistory();
});

// Test-specific functions (simplified implementations)
let focusClicks = 0;
function focusClick() {
    if (!currentTest) return;
    focusClicks++;
    document.getElementById('clickCount').textContent = focusClicks;
}

let currentMemoryLevel = 0;
function startMemoryTest() {
    // Simplified memory test
    alert('Memory test would show a sequence here. For demo, clicking increases level.');
    currentMemoryLevel++;
}

function checkMemory() {
    // Simplified check
    alert('Memory check completed.');
}

let currentProblemIndex = 0;
let correctAnswers = 0;
function loadProblem(index) {
    const puzzle = testTypes.problem.puzzles[index];
    if (!puzzle) return;

    document.getElementById('currentProblem').innerHTML = `<p>${puzzle.question}</p>`;
    const optionsDiv = document.getElementById('problemOptions');
    optionsDiv.innerHTML = '';

    puzzle.options.forEach((option, i) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'problem-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectAnswer(i, puzzle.correct);
        optionsDiv.appendChild(optionDiv);
    });
}

function selectAnswer(selected, correct) {
    if (selected === correct) {
        correctAnswers++;
        alert('Correct!');
    } else {
        alert('Incorrect.');
    }

    currentProblemIndex++;
    if (currentProblemIndex < testTypes.problem.puzzles.length) {
        loadProblem(currentProblemIndex);
    } else {
        alert('Problem solving test completed!');
    }
}

let stressCount = 100;
let stressWordsShown = [];
let stressCorrectWords = 0;

function showStressWords() {
    const wordsDiv = document.getElementById('stressWords');
    const words = testTypes.stress.words.slice(0, 5);
    stressWordsShown = words;
    wordsDiv.innerHTML = `<p>Memorize: ${words.join(', ')}</p>`;
    setTimeout(() => {
        wordsDiv.innerHTML = '<p>Now count backward from 100 by 7s</p>';
    }, 5000);
}

function nextCount() {
    stressCount -= 7;
    document.getElementById('countingDisplay').textContent = stressCount;
    if (stressCount <= 0) {
        document.getElementById('stressRecall').style.display = 'block';
        document.getElementById('countingTask').style.display = 'none';
    }
}

function checkStressRecall() {
    const input = document.getElementById('stressInput').value.toLowerCase();
    const recalled = input.split(',').map(w => w.trim());
    stressCorrectWords = recalled.filter(word => stressWordsShown.includes(word)).length;
    alert(`Stress test completed! Correct words recalled: ${stressCorrectWords}/${stressWordsShown.length}`);
}