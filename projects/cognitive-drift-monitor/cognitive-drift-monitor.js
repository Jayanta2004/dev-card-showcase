// cognitive-drift-monitor.js

let testResults = JSON.parse(localStorage.getItem('cognitiveTestResults')) || [];
let currentTestType = 'reaction';
let testStartTime = null;
let memorySequence = [];
let userSequence = [];
let mathProblem = null;

function setTestType(type) {
    currentTestType = type;
    document.querySelectorAll('.test-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    // Hide all test contents
    document.querySelectorAll('.test-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show instructions
    document.getElementById('instructions').classList.remove('hidden');
    document.getElementById('testInstructions').textContent = getTestInstructions(type);
}

function getTestInstructions(type) {
    const instructions = {
        reaction: "Click the button as soon as it turns green!",
        memory: "Watch the sequence carefully, then repeat it!",
        math: "Solve the math problem as quickly as possible!"
    };
    return instructions[type] || "Click start to begin the test!";
}

function startTest() {
    document.getElementById('instructions').classList.add('hidden');

    switch (currentTestType) {
        case 'reaction':
            startReactionTest();
            break;
        case 'memory':
            startMemoryTest();
            break;
        case 'math':
            startMathTest();
            break;
    }
}

function startReactionTest() {
    document.getElementById('reactionTest').classList.remove('hidden');
    document.getElementById('reactionResult').textContent = '';

    const target = document.getElementById('reactionTarget');
    target.classList.remove('ready');
    target.style.background = '#FF5722';

    // Random delay between 1-4 seconds
    const delay = 1000 + Math.random() * 3000;
    setTimeout(() => {
        target.classList.add('ready');
        target.style.background = '#4CAF50';
        testStartTime = Date.now();
    }, delay);
}

function recordReaction() {
    if (!testStartTime) return;

    const reactionTime = Date.now() - testStartTime;
    const score = Math.max(0, Math.min(100, 100 - (reactionTime - 200) / 10)); // Optimal around 200ms

    document.getElementById('reactionResult').textContent = `Reaction time: ${reactionTime}ms (Score: ${Math.round(score)})`;

    // Save result
    saveTestResult('reaction', score, { reactionTime });

    // Reset
    testStartTime = null;
    setTimeout(() => {
        document.getElementById('reactionTest').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
    }, 2000);
}

function startMemoryTest() {
    document.getElementById('memoryTest').classList.remove('hidden');
    document.getElementById('memoryInput').classList.add('hidden');
    document.getElementById('memoryResult').textContent = '';

    // Generate sequence (4-8 items)
    const length = 4 + Math.floor(Math.random() * 5);
    memorySequence = [];
    for (let i = 0; i < length; i++) {
        memorySequence.push(Math.floor(Math.random() * 9) + 1);
    }

    // Display sequence
    const sequenceDiv = document.getElementById('memorySequence');
    sequenceDiv.textContent = '';

    let index = 0;
    const showNext = () => {
        if (index < memorySequence.length) {
            sequenceDiv.textContent = memorySequence[index];
            setTimeout(() => {
                sequenceDiv.textContent = '';
                setTimeout(showNext, 500);
            }, 800);
            index++;
        } else {
            // Show input after sequence
            setTimeout(() => {
                showMemoryInput();
            }, 1000);
        }
    };

    showNext();
}

function showMemoryInput() {
    const inputDiv = document.getElementById('inputButtons');
    inputDiv.innerHTML = '';

    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'memory-btn';
        btn.textContent = i;
        btn.onclick = () => addToSequence(i);
        inputDiv.appendChild(btn);
    }

    document.getElementById('memoryInput').classList.remove('hidden');
    userSequence = [];
}

function addToSequence(num) {
    userSequence.push(num);
    if (userSequence.length >= memorySequence.length) {
        checkMemorySequence();
    }
}

function checkMemorySequence() {
    const correct = userSequence.length === memorySequence.length &&
                   userSequence.every((num, index) => num === memorySequence[index]);

    const score = correct ? Math.max(20, 100 - (memorySequence.length - 4) * 10) : 0;

    document.getElementById('memoryResult').textContent =
        correct ? `Correct! Score: ${score}` : `Incorrect. Score: 0`;

    // Save result
    saveTestResult('memory', score, {
        sequenceLength: memorySequence.length,
        correct: correct,
        sequence: memorySequence
    });

    setTimeout(() => {
        document.getElementById('memoryTest').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
    }, 3000);
}

function startMathTest() {
    document.getElementById('mathTest').classList.remove('hidden');
    document.getElementById('mathResult').textContent = '';
    document.getElementById('mathAnswer').value = '';

    // Generate random math problem
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2;

    switch (op) {
        case '+':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            mathProblem = { num1, num2, op, answer: num1 + num2 };
            break;
        case '-':
            num1 = Math.floor(Math.random() * 50) + 25;
            num2 = Math.floor(Math.random() * 25) + 1;
            mathProblem = { num1, num2, op, answer: num1 - num2 };
            break;
        case '*':
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
            mathProblem = { num1, num2, op, answer: num1 * num2 };
            break;
    }

    document.getElementById('mathProblem').textContent = `${num1} ${op} ${num2} = ?`;
    testStartTime = Date.now();
}

function checkMathAnswer() {
    const userAnswer = parseInt(document.getElementById('mathAnswer').value);
    const timeTaken = Date.now() - testStartTime;

    if (isNaN(userAnswer)) {
        document.getElementById('mathResult').textContent = 'Please enter a valid number';
        return;
    }

    const correct = userAnswer === mathProblem.answer;
    const timeBonus = Math.max(0, 100 - timeTaken / 100); // Bonus for speed
    const score = correct ? Math.max(10, timeBonus) : 0;

    document.getElementById('mathResult').textContent =
        correct ? `Correct! Time: ${timeTaken}ms, Score: ${Math.round(score)}` :
                 `Incorrect. The answer was ${mathProblem.answer}. Score: 0`;

    // Save result
    saveTestResult('math', score, {
        problem: `${mathProblem.num1} ${mathProblem.op} ${mathProblem.num2}`,
        correct: correct,
        timeTaken: timeTaken,
        userAnswer: userAnswer
    });

    setTimeout(() => {
        document.getElementById('mathTest').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
    }, 3000);
}

function saveTestResult(testType, score, details) {
    const result = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        testType: testType,
        score: Math.round(score),
        details: details
    };

    testResults.push(result);
    localStorage.setItem('cognitiveTestResults', JSON.stringify(testResults));

    updateStats();
    updateChart();
    updateInsights();
    displayHistory();
}

function updateStats() {
    const today = new Date().toDateString();
    const todayResults = testResults.filter(result =>
        new Date(result.timestamp).toDateString() === today
    );

    // Today's tests
    document.getElementById('todayTests').textContent = todayResults.length;

    // Average score
    if (todayResults.length > 0) {
        const avgScore = todayResults.reduce((sum, result) => sum + result.score, 0) / todayResults.length;
        document.getElementById('avgScore').textContent = Math.round(avgScore);
    } else {
        document.getElementById('avgScore').textContent = '0';
    }

    // Cognitive drift (performance decline throughout day)
    if (todayResults.length >= 3) {
        const sortedResults = todayResults.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const firstHalf = sortedResults.slice(0, Math.floor(sortedResults.length / 2));
        const secondHalf = sortedResults.slice(Math.floor(sortedResults.length / 2));

        const firstAvg = firstHalf.reduce((sum, r) => sum + r.score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, r) => sum + r.score, 0) / secondHalf.length;

        const drift = ((firstAvg - secondAvg) / firstAvg) * 100;
        document.getElementById('driftIndex').textContent = `${Math.round(drift)}%`;
    } else {
        document.getElementById('driftIndex').textContent = '0%';
    }

    // Peak performance time
    if (todayResults.length > 0) {
        const bestResult = todayResults.reduce((best, current) =>
            current.score > best.score ? current : best
        );
        const peakTime = new Date(bestResult.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.getElementById('peakTime').textContent = peakTime;
    } else {
        document.getElementById('peakTime').textContent = '--:--';
    }
}

function updateChart() {
    const today = new Date().toDateString();
    const todayResults = testResults
        .filter(result => new Date(result.timestamp).toDateString() === today)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (todayResults.length === 0) return;

    const labels = todayResults.map(result => new Date(result.timestamp));
    const scores = todayResults.map(result => result.score);

    const ctx = document.getElementById('driftChart').getContext('2d');
    if (window.driftChart) {
        window.driftChart.destroy();
    }

    window.driftChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cognitive Performance',
                data: scores,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'HH:mm'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `Score: ${context.parsed.y} (${context.dataset.data[context.dataIndex].testType})`
                    }
                }
            }
        }
    });
}

function updateInsights() {
    const today = new Date().toDateString();
    const todayResults = testResults.filter(result =>
        new Date(result.timestamp).toDateString() === today
    );

    if (todayResults.length < 3) {
        document.getElementById('performancePattern').textContent = 'Need more tests to analyze patterns';
        document.getElementById('optimalTimes').textContent = 'Need more data';
        document.getElementById('testTypeInsights').textContent = 'Need more tests';
        return;
    }

    // Performance pattern
    const sortedResults = todayResults.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const firstThird = sortedResults.slice(0, Math.floor(sortedResults.length / 3));
    const lastThird = sortedResults.slice(-Math.floor(sortedResults.length / 3));

    const morningAvg = firstThird.reduce((sum, r) => sum + r.score, 0) / firstThird.length;
    const eveningAvg = lastThird.reduce((sum, r) => sum + r.score, 0) / lastThird.length;

    let pattern = 'Stable performance throughout the day';
    if (morningAvg > eveningAvg + 10) {
        pattern = 'Performance declines as day progresses';
    } else if (eveningAvg > morningAvg + 10) {
        pattern = 'Performance improves as day progresses';
    }

    document.getElementById('performancePattern').textContent = pattern;

    // Optimal times
    const bestResult = todayResults.reduce((best, current) =>
        current.score > best.score ? current : best
    );
    const bestTime = new Date(bestResult.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('optimalTimes').textContent = `Peak performance at ${bestTime}`;

    // Test type insights
    const testTypeAvg = {};
    const testTypeCount = {};
    todayResults.forEach(result => {
        if (!testTypeAvg[result.testType]) {
            testTypeAvg[result.testType] = 0;
            testTypeCount[result.testType] = 0;
        }
        testTypeAvg[result.testType] += result.score;
        testTypeCount[result.testType]++;
    });

    let bestTest = 'None';
    let bestAvg = 0;
    Object.keys(testTypeAvg).forEach(type => {
        const avg = testTypeAvg[type] / testTypeCount[type];
        if (avg > bestAvg) {
            bestAvg = avg;
            bestTest = type;
        }
    });

    document.getElementById('testTypeInsights').textContent =
        `Best performance in ${bestTest} tests (${Math.round(bestAvg)} avg score)`;
}

function displayHistory(filter = 'today') {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    let filteredResults = testResults;

    if (filter === 'today') {
        const today = new Date().toDateString();
        filteredResults = testResults.filter(result =>
            new Date(result.timestamp).toDateString() === today
        );
    } else if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredResults = testResults.filter(result =>
            new Date(result.timestamp) >= oneWeekAgo
        );
    }

    // Sort by most recent first
    filteredResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const historyDiv = document.getElementById('testHistory');
    historyDiv.innerHTML = '';

    if (filteredResults.length === 0) {
        historyDiv.innerHTML = '<p style="text-align center; color: #666;">No tests found</p>';
        return;
    }

    filteredResults.forEach(result => {
        const entry = document.createElement('div');
        entry.className = 'test-entry';

        const date = new Date(result.timestamp).toLocaleDateString();
        const time = new Date(result.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const scoreClass = result.score >= 80 ? 'excellent' :
                          result.score >= 60 ? 'good' :
                          result.score >= 40 ? 'fair' : 'poor';

        entry.innerHTML = `
            <h4>
                ${result.testType.charAt(0).toUpperCase() + result.testType.slice(1)} Test - ${date} ${time}
                <span class="score-badge ${scoreClass}">Score: ${result.score}</span>
                <button class="delete-btn" onclick="deleteTest(${result.id})">×</button>
            </h4>
            <p><strong>Details:</strong> ${getTestDetails(result)}</p>
        `;

        historyDiv.appendChild(entry);
    });
}

function getTestDetails(result) {
    switch (result.testType) {
        case 'reaction':
            return `Reaction time: ${result.details.reactionTime}ms`;
        case 'memory':
            return `Sequence length: ${result.details.sequenceLength}, Correct: ${result.details.correct}`;
        case 'math':
            return `Problem: ${result.details.problem}, Time: ${result.details.timeTaken}ms, Correct: ${result.details.correct}`;
        default:
            return 'Test completed';
    }
}

function filterHistory(filter) {
    displayHistory(filter);
}

function deleteTest(id) {
    if (confirm('Are you sure you want to delete this test result?')) {
        testResults = testResults.filter(result => result.id !== id);
        localStorage.setItem('cognitiveTestResults', JSON.stringify(testResults));
        updateStats();
        updateChart();
        updateInsights();
        displayHistory();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateInsights();
    displayHistory();
});