// Global variables
let currentStressLevel = 5;
let currentTask = null;
let taskStartTime = null;
let responses = [];
let sessions = JSON.parse(localStorage.getItem('resilienceSessions')) || [];
let chart = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateStressDisplay();
    updateStatistics();
    initializeChart();
    displaySessions();
});

function initializeEventListeners() {
    const stressSlider = document.getElementById('stressLevel');
    stressSlider.addEventListener('input', function(e) {
        currentStressLevel = parseInt(e.target.value);
        updateStressDisplay();
    });

    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            const level = this.getAttribute('data-level');
            let stressValue = 5; // default
            
            if (level === '1-3') stressValue = 2;
            else if (level === '4-6') stressValue = 5;
            else if (level === '7-10') stressValue = 8;
            
            document.getElementById('stressLevel').value = stressValue;
            currentStressLevel = stressValue;
            updateStressDisplay();
        });
    });
}

function updateStressDisplay() {
    document.getElementById('stressValue').textContent = currentStressLevel;

    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
        
        const level = indicator.getAttribute('data-level');
        if ((level === '1-3' && currentStressLevel >= 1 && currentStressLevel <= 3) ||
            (level === '4-6' && currentStressLevel >= 4 && currentStressLevel <= 6) ||
            (level === '7-10' && currentStressLevel >= 7 && currentStressLevel <= 10)) {
            indicator.classList.add('active');
        }
    });
}

function startMathTask() {
    currentTask = {
        type: 'math',
        question: generateMathQuestion(),
        answer: null
    };
    
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operator = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    
    let answer;
    switch(operator) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '*': answer = num1 * num2; break;
    }
    
    currentTask.answer = answer;
    
    document.getElementById('taskDisplay').innerHTML = `
        <p>Solve: ${num1} ${operator} ${num2} = ?</p>
    `;
    
    showTaskInput();
    taskStartTime = Date.now();
}

function startMemoryTask() {
    const memorySequence = generateMemorySequence();
    currentTask = {
        type: 'memory',
        sequence: memorySequence,
        answer: memorySequence
    };
    
    document.getElementById('taskDisplay').innerHTML = `
        <p>Memorize this sequence: <strong>${memorySequence}</strong></p>
        <p class="memory-hint" style="font-size: 14px; color: #666;">The input will appear in 3 seconds...</p>
    `;
    
    setTimeout(() => {
        document.getElementById('taskDisplay').innerHTML = `
            <p>Enter the sequence you memorized:</p>
        `;
        showTaskInput();
        taskStartTime = Date.now();
    }, 3000);
}

function startReactionTask() {
    currentTask = {
        type: 'reaction',
        answer: 'reaction'
    };
    
    document.getElementById('taskDisplay').innerHTML = `
        <p>Wait for the signal...</p>
    `;
    
    setTimeout(() => {
        document.getElementById('taskDisplay').innerHTML = `
            <p style="color: #28a745; font-size: 24px; font-weight: bold;">CLICK NOW!</p>
        `;
        taskStartTime = Date.now();
        showTaskInput();
        document.getElementById('answerInput').placeholder = 'Type "ready" and click Submit';
    }, Math.random() * 3000 + 2000);
}

function generateMathQuestion() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operator = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    return { num1, num2, operator };
}

function generateMemorySequence() {
    const length = 5;
    let sequence = '';
    for (let i = 0; i < length; i++) {
        sequence += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    return sequence;
}

function showTaskInput() {
    document.getElementById('taskInput').style.display = 'flex';
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
}

function submitAnswer() {
    if (!currentTask || !taskStartTime) return;
    
    const answer = document.getElementById('answerInput').value.trim();
    const responseTime = (Date.now() - taskStartTime) / 1000;
    
    let isCorrect = false;
    
    switch(currentTask.type) {
        case 'math':
            isCorrect = parseInt(answer) === currentTask.answer;
            break;
        case 'memory':
            isCorrect = answer.toUpperCase() === currentTask.answer;
            break;
        case 'reaction':
            isCorrect = answer.toLowerCase() === 'ready';
            break;
    }
    
    responses.push({
        task: currentTask.type,
        stressLevel: currentStressLevel,
        responseTime: responseTime,
        correct: isCorrect,
        timestamp: new Date().toISOString()
    });
    
    updateResults();
    
    document.getElementById('taskInput').style.display = 'none';
    document.getElementById('taskDisplay').innerHTML = `
        <p>${isCorrect ? '✅ Correct!' : '❌ Incorrect'} (Response time: ${responseTime.toFixed(2)}s)</p>
        <p>Select another task to continue.</p>
    `;
    
    if (responses.length > 0) {
        document.getElementById('saveSessionBtn').disabled = false;
    }
    
    currentTask = null;
    taskStartTime = null;
}

function updateResults() {
    if (responses.length === 0) return;
    
    const correctCount = responses.filter(r => r.correct).length;
    const accuracy = (correctCount / responses.length) * 100;
    document.getElementById('accuracyResult').textContent = `${accuracy.toFixed(1)}%`;
    
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    document.getElementById('responseTimeResult').textContent = `${avgResponseTime.toFixed(2)}s`;
    
    const stressAdjustment = 1 - (currentStressLevel / 20); 
    const resilienceScore = Math.round(accuracy * (1 / avgResponseTime) * stressAdjustment * 10);
    document.getElementById('resilienceScore').textContent = resilienceScore;
}

function saveSession() {
    if (responses.length === 0) return;
    
    const session = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        responses: [...responses],
        averageStress: responses.reduce((sum, r) => sum + r.stressLevel, 0) / responses.length,
        accuracy: parseFloat(document.getElementById('accuracyResult').textContent),
        avgResponseTime: parseFloat(document.getElementById('responseTimeResult').textContent),
        resilienceScore: parseInt(document.getElementById('resilienceScore').textContent)
    };
    
    sessions.push(session);
    localStorage.setItem('resilienceSessions', JSON.stringify(sessions));
    
    responses = [];
    document.getElementById('saveSessionBtn').disabled = true;
    document.getElementById('accuracyResult').textContent = '0%';
    document.getElementById('responseTimeResult').textContent = '0s';
    document.getElementById('resilienceScore').textContent = '0';
    
    updateStatistics();
    updateChart();
    displaySessions();
    
    alert('Session saved successfully!');
}

function updateStatistics() {
    if (sessions.length === 0) return;
    
    const avgResilience = sessions.reduce((sum, s) => sum + s.resilienceScore, 0) / sessions.length;
    const bestScore = Math.max(...sessions.map(s => s.resilienceScore));
    
    document.getElementById('avgResilience').textContent = avgResilience.toFixed(1);
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('totalSessions').textContent = sessions.length;
}

function initializeChart() {
    const ctx = document.getElementById('resilienceChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Resilience Score',
                data: [],
                borderColor: '#4fd1ff',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    updateChart();
}

function updateChart() {
    if (!chart) return;
    
    const labels = sessions.map(s => new Date(s.date).toLocaleDateString());
    const data = sessions.map(s => s.resilienceScore);
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

function displaySessions() {
    const historyDiv = document.getElementById('sessionsHistory');
    historyDiv.innerHTML = '';
    
    if (sessions.length === 0) {
        historyDiv.innerHTML = '<p>No sessions yet. Complete some tasks and save your first session!</p>';
        return;
    }
    
    const recentSessions = sessions.slice(-5).reverse();
    
    recentSessions.forEach(session => {
        const sessionEl = document.createElement('div');
        sessionEl.className = 'session-item';
        sessionEl.innerHTML = `
            <h4>Session: ${session.date}</h4>
            <p><strong>Resilience Score:</strong> ${session.resilienceScore}</p>
            <p><strong>Accuracy:</strong> ${session.accuracy.toFixed(1)}%</p>
            <p><strong>Avg Response Time:</strong> ${session.avgResponseTime.toFixed(2)}s</p>
            <p><strong>Avg Stress Level:</strong> ${session.averageStress.toFixed(1)}</p>
            <p><strong>Tasks Completed:</strong> ${session.responses.length}</p>
        `;
        historyDiv.appendChild(sessionEl);
    });
}