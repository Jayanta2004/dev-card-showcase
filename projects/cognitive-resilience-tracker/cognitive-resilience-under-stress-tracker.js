// cognitive-resilience-under-stress-tracker.js

let sessions = JSON.parse(localStorage.getItem('resilienceSessions')) || [];
let currentSession = null;
let currentTask = null;
let taskStartTime = null;
let taskResults = [];
let stressLevel = 5;

document.getElementById('stressLevel').addEventListener('input', function() {
    stressLevel = parseInt(this.value);
    document.getElementById('stressValue').textContent = stressLevel;
    updateStressIndicators();
});

function updateStressIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });

    let activeIndicator;
    if (stressLevel <= 3) {
        activeIndicator = document.querySelector('[data-level="1-3"]');
    } else if (stressLevel <= 6) {
        activeIndicator = document.querySelector('[data-level="4-6"]');
    } else {
        activeIndicator = document.querySelector('[data-level="7-10"]');
    }
    activeIndicator.classList.add('active');
}

function startMathTask() {
    if (currentSession) return;

    currentSession = {
        id: Date.now(),
        stressLevel: stressLevel,
        taskType: 'math',
        startTime: new Date().toISOString(),
        results: [],
        endTime: null
    };

    taskResults = [];
    generateMathProblem();
    document.getElementById('taskInput').style.display = 'flex';
    document.getElementById('saveSessionBtn').disabled = true;
    disableTaskButtons();
}

function generateMathProblem() {
    const operations = ['+', '-', '*'];
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let problem, answer;
    switch (operation) {
        case '+':
            problem = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
        case '-':
            problem = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
            answer = Math.max(num1, num2) - Math.min(num1, num2);
            break;
        case '*':
            problem = `${num1} * ${num2}`;
            answer = num1 * num2;
            break;
    }

    currentTask = { problem, answer, type: 'math' };
    taskStartTime = new Date();

    document.getElementById('taskDisplay').innerHTML = `<h3>Solve: ${problem} = ?</h3>`;
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
}

function startMemoryTask() {
    if (currentSession) return;

    currentSession = {
        id: Date.now(),
        stressLevel: stressLevel,
        taskType: 'memory',
        startTime: new Date().toISOString(),
        results: [],
        endTime: null
    };

    taskResults = [];
    generateMemorySequence();
    document.getElementById('taskInput').style.display = 'flex';
    document.getElementById('saveSessionBtn').disabled = true;
    disableTaskButtons();
}

function generateMemorySequence() {
    const sequence = [];
    for (let i = 0; i < 5; i++) {
        sequence.push(Math.floor(Math.random() * 9) + 1);
    }

    currentTask = { sequence: sequence.join(' '), answer: sequence.join(''), type: 'memory' };
    taskStartTime = new Date();

    document.getElementById('taskDisplay').innerHTML = `
        <h3>Memorize this sequence:</h3>
        <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">${sequence.join(' ')}</div>
        <p style="color: red;">You have 5 seconds to memorize...</p>
    `;

    setTimeout(() => {
        document.getElementById('taskDisplay').innerHTML = `
            <h3>Enter the sequence:</h3>
            <p>Type the numbers you just saw (without spaces)</p>
        `;
        document.getElementById('answerInput').focus();
    }, 5000);
}

function startReactionTask() {
    if (currentSession) return;

    currentSession = {
        id: Date.now(),
        stressLevel: stressLevel,
        taskType: 'reaction',
        startTime: new Date().toISOString(),
        results: [],
        endTime: null
    };

    taskResults = [];
    startReactionTest();
    document.getElementById('taskInput').style.display = 'none';
    document.getElementById('saveSessionBtn').disabled = true;
    disableTaskButtons();
}

function startReactionTest() {
    let trials = 5;
    let trialCount = 0;
    const results = [];

    function runTrial() {
        if (trialCount >= trials) {
            // Test complete
            taskResults = results;
            updateResults();
            document.getElementById('saveSessionBtn').disabled = false;
            enableTaskButtons();
            return;
        }

        const delay = Math.random() * 3000 + 1000; // 1-4 seconds
        document.getElementById('taskDisplay').innerHTML = `
            <h3>Reaction Time Test</h3>
            <p>Wait for the screen to turn green, then click as fast as you can!</p>
            <div id="reactionBox" style="width: 200px; height: 200px; background: red; margin: 20px auto; border-radius: 10px;"></div>
        `;

        setTimeout(() => {
            const startTime = performance.now();
            const box = document.getElementById('reactionBox');
            box.style.background = 'green';
            box.style.cursor = 'pointer';
            box.onclick = () => {
                const reactionTime = performance.now() - startTime;
                results.push(reactionTime);
                box.style.background = 'gray';
                box.style.cursor = 'default';
                trialCount++;
                setTimeout(runTrial, 1000);
            };
        }, delay);
    }

    runTrial();
}

function submitAnswer() {
    if (!currentTask) return;

    const userAnswer = document.getElementById('answerInput').value.trim();
    const responseTime = (new Date() - taskStartTime) / 1000;

    let correct = false;
    if (currentTask.type === 'math') {
        correct = parseInt(userAnswer) === currentTask.answer;
    } else if (currentTask.type === 'memory') {
        correct = userAnswer === currentTask.answer;
    }

    taskResults.push({
        correct,
        responseTime,
        task: currentTask
    });

    if (taskResults.length < 5) {
        // Generate next problem
        if (currentTask.type === 'math') {
            generateMathProblem();
        } else if (currentTask.type === 'memory') {
            generateMemorySequence();
        }
    } else {
        // Task complete
        updateResults();
        document.getElementById('taskInput').style.display = 'none';
        document.getElementById('saveSessionBtn').disabled = false;
        enableTaskButtons();
    }
}

function updateResults() {
    if (!currentSession || taskResults.length === 0) return;

    const correctAnswers = taskResults.filter(r => r.correct).length;
    const accuracy = Math.round((correctAnswers / taskResults.length) * 100);
    const avgResponseTime = taskResults.reduce((sum, r) => sum + r.responseTime, 0) / taskResults.length;

    // Calculate resilience score (higher is better)
    // Factors: accuracy, response time, stress level
    const baseScore = accuracy;
    const timeBonus = Math.max(0, 10 - avgResponseTime); // Bonus for faster responses
    const stressPenalty = stressLevel * 2; // Penalty for higher stress
    const resilienceScore = Math.round(baseScore + timeBonus - stressPenalty);

    document.getElementById('accuracyResult').textContent = `${accuracy}%`;
    document.getElementById('responseTimeResult').textContent = `${avgResponseTime.toFixed(1)}s`;
    document.getElementById('resilienceScore').textContent = resilienceScore;

    currentSession.results = taskResults;
    currentSession.accuracy = accuracy;
    currentSession.avgResponseTime = avgResponseTime;
    currentSession.resilienceScore = resilienceScore;
}

function saveSession() {
    if (!currentSession) return;

    currentSession.endTime = new Date().toISOString();
    sessions.push(currentSession);
    localStorage.setItem('resilienceSessions', JSON.stringify(sessions));

    updateStats();
    updateChart();
    updateHistory();

    currentSession = null;
    document.getElementById('taskDisplay').innerHTML = '<p>Session saved! Select a task to begin a new session.</p>';
    document.getElementById('saveSessionBtn').disabled = true;
}

function disableTaskButtons() {
    document.getElementById('mathTaskBtn').disabled = true;
    document.getElementById('memoryTaskBtn').disabled = true;
    document.getElementById('reactionTaskBtn').disabled = true;
}

function enableTaskButtons() {
    document.getElementById('mathTaskBtn').disabled = false;
    document.getElementById('memoryTaskBtn').disabled = false;
    document.getElementById('reactionTaskBtn').disabled = false;
}

function updateStats() {
    if (sessions.length === 0) return;

    const avgResilience = sessions.reduce((sum, s) => sum + s.resilienceScore, 0) / sessions.length;
    const bestScore = Math.max(...sessions.map(s => s.resilienceScore));

    document.getElementById('avgResilience').textContent = Math.round(avgResilience);
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('totalSessions').textContent = sessions.length;
}

function updateChart() {
    const ctx = document.getElementById('resilienceChart').getContext('2d');

    const labels = sessions.map(s => new Date(s.startTime).toLocaleDateString());
    const scores = sessions.map(s => s.resilienceScore);
    const stressLevels = sessions.map(s => s.stressLevel);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Resilience Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                yAxisID: 'y'
            }, {
                label: 'Stress Level',
                data: stressLevels,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Resilience Score'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Stress Level'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function updateHistory() {
    const historyDiv = document.getElementById('sessionsHistory');
    historyDiv.innerHTML = '';

    const recentSessions = sessions.slice(-5).reverse();

    recentSessions.forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';
        sessionDiv.innerHTML = `
            <h4>${new Date(session.startTime).toLocaleString()}</h4>
            <p><strong>Task:</strong> ${session.taskType}</p>
            <p><strong>Stress Level:</strong> ${session.stressLevel}/10</p>
            <p><strong>Accuracy:</strong> ${session.accuracy}%</p>
            <p><strong>Resilience Score:</strong> ${session.resilienceScore}</p>
        `;
        historyDiv.appendChild(sessionDiv);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStressIndicators();
    updateStats();
    updateChart();
    updateHistory();
});