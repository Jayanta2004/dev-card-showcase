// Global variables
let currentStressLevel = 5;
let responses = [];
let currentTask = null;
let taskStartTime = null;
let countdownInterval = null;
let resilienceChart = null;
let reactionBox = null;
let reactionTimeout = null;
let reactionStartTime = null;
let reactionClickHandler = null;
let reactionTouchHandler = null;

document.addEventListener('DOMContentLoaded', function() {
    const stressSlider = document.getElementById('stressLevel');
    const stressValue = document.getElementById('stressValue');
    const indicators = document.querySelectorAll('.indicator');
    
    stressSlider.addEventListener('input', function() {
        currentStressLevel = parseInt(this.value);
        stressValue.textContent = currentStressLevel;
        
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
            const levelRange = indicator.dataset.level;
            const [min, max] = levelRange.split('-').map(Number);
            if (currentStressLevel >= min && currentStressLevel <= max) {
                indicator.classList.add('active');
            }
        });
    });

    initializeChart();
    
    loadSessions();
});

function calculateResilienceScore(accuracy, avgResponseTime, stressLevel, taskType) {
    let score = accuracy;
    
    const taskModifiers = {
        'math': 1.2,    
        'memory': 1.1,   
        'reaction': 1.0   
    };
    
    const expectedTimes = {
        'math': 10,       
        'memory': 15,     
        'reaction': 0.5  
    };
    
    const timeRatio = avgResponseTime / expectedTimes[taskType];
    const timePenalty = timeRatio > 1 ? (timeRatio - 1) * 20 : 0;
   
    const stressImpact = Math.pow(stressLevel / 5, 2) * 15;
    
    let finalScore = (score * taskModifiers[taskType]) - timePenalty - stressImpact;
    
    return Math.max(0, Math.min(100, Math.round(finalScore)));
}

function initializeChart() {
    const ctx = document.getElementById('resilienceChart').getContext('2d');
    resilienceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Resilience Score',
                data: [],
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Resilience Score'
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

function startMathTask() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    if (reactionTimeout) {
        clearTimeout(reactionTimeout);
        reactionTimeout = null;
    }
    
    if (reactionBox && reactionClickHandler) {
        reactionBox.removeEventListener('click', reactionClickHandler);
        reactionBox.removeEventListener('touchstart', reactionTouchHandler);
    }
    
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch(operator) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '*': answer = num1 * num2; break;
    }
    
    currentTask = {
        type: 'math',
        answer: answer,
        problem: `${num1} ${operator} ${num2} = ?`
    };
    
    document.getElementById('taskDisplay').innerHTML = `
        <p style="font-size: 24px; font-weight: bold;">${currentTask.problem}</p>
    `;
    document.getElementById('taskInput').style.display = 'flex';
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
    
    taskStartTime = Date.now();
    
    showNotification('Math challenge started! Solve the problem as quickly as you can.', 'info');
}

function startMemoryTask() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    if (reactionTimeout) {
        clearTimeout(reactionTimeout);
        reactionTimeout = null;
    }
    
    if (reactionBox && reactionClickHandler) {
        reactionBox.removeEventListener('click', reactionClickHandler);
        reactionBox.removeEventListener('touchstart', reactionTouchHandler);
    }
    
    const letters = [];
    const letterCount = 5;
    for (let i = 0; i < letterCount; i++) {
        letters.push(String.fromCharCode(65 + Math.floor(Math.random() * 26)));
    }
    const sequence = letters.join('');
    
    currentTask = {
        type: 'memory',
        answer: sequence,
        sequence: sequence
    };
    
    let countdown = 3;
    document.getElementById('taskDisplay').innerHTML = `
        <p style="font-size: 20px;">Remember this sequence:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">${sequence}</p>
        <p style="font-size: 16px; color: #666;">Memorizing in: <span id="countdown">${countdown}</span></p>
    `;
    
    document.getElementById('taskInput').style.display = 'none';
    
    countdownInterval = setInterval(() => {
        countdown--;
        document.getElementById('countdown').textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            
            document.getElementById('taskDisplay').innerHTML = `
                <p style="font-size: 20px;">Enter the sequence you saw:</p>
            `;
            document.getElementById('taskInput').style.display = 'flex';
            document.getElementById('answerInput').value = '';
            document.getElementById('answerInput').focus();
            
            taskStartTime = Date.now();
        }
    }, 1000);
    
    showNotification('Memory test started! Remember the sequence of letters.', 'info');
}

function startReactionTask() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    if (reactionTimeout) {
        clearTimeout(reactionTimeout);
        reactionTimeout = null;
    }
    
    if (reactionBox && reactionClickHandler) {
        reactionBox.removeEventListener('click', reactionClickHandler);
        reactionBox.removeEventListener('touchstart', reactionTouchHandler);
    }
    
    currentTask = {
        type: 'reaction',
        answer: 'reaction',
        state: 'waiting'
    };
    
    const taskDisplay = document.getElementById('taskDisplay');
    taskDisplay.innerHTML = `
        <div id="reactionBox" class="waiting">
            <span>Wait for green...</span>
        </div>
    `;
    
    reactionBox = document.getElementById('reactionBox');
    
    reactionClickHandler = function(e) {
        e.preventDefault(); 
        handleReactionClick();
    };
    
    reactionTouchHandler = function(e) {
        e.preventDefault(); 
        handleReactionClick();
    };
    
    reactionBox.addEventListener('click', reactionClickHandler);
    reactionBox.addEventListener('touchstart', reactionTouchHandler, { passive: false });
    
    document.getElementById('taskInput').style.display = 'none';
    
    const delay = Math.random() * 3000 + 2000;
    
    reactionTimeout = setTimeout(() => {
        if (currentTask && currentTask.type === 'reaction') {
            currentTask.state = 'ready';
            if (reactionBox) {
                reactionBox.className = 'click-now';
                reactionBox.innerHTML = '<span>CLICK NOW!</span>';
                reactionStartTime = Date.now();
            }
        }
    }, delay);
    
    showNotification('Reaction test started! Tap the box when it turns green', 'info');
}

function handleReactionClick() {
    if (!currentTask || currentTask.type !== 'reaction') return;
    
    const now = Date.now();
    
    if (currentTask.state === 'waiting') {
        if (reactionTimeout) {
            clearTimeout(reactionTimeout);
            reactionTimeout = null;
        }
        
        if (reactionBox && reactionClickHandler) {
            reactionBox.removeEventListener('click', reactionClickHandler);
            reactionBox.removeEventListener('touchstart', reactionTouchHandler);
        }
        
        document.getElementById('taskDisplay').innerHTML = `
            <p style="color: #ff4444; font-size: 18px;">Too early! Wait for the green signal.</p>
            <p>Click "Reaction Time" to try again.</p>
        `;
        
        showNotification('Too early! Wait for the green signal', 'error');
        
        currentTask = null;
        reactionStartTime = null;
        return;
    }
    
    if (currentTask.state === 'ready' && reactionStartTime) {
        const responseTime = (now - reactionStartTime) / 1000;
        
        if (reactionBox && reactionClickHandler) {
            reactionBox.removeEventListener('click', reactionClickHandler);
            reactionBox.removeEventListener('touchstart', reactionTouchHandler);
        }
        
        if (reactionTimeout) {
            clearTimeout(reactionTimeout);
            reactionTimeout = null;
        }

        responses.push({
            task: 'reaction',
            stressLevel: currentStressLevel,
            responseTime: responseTime,
            correct: true,
            timestamp: new Date().toISOString()
        });
        
        document.getElementById('taskDisplay').innerHTML = `
            <p style="color: #28a745; font-size: 18px;">Great! Reaction time: ${responseTime.toFixed(3)}s</p>
            <p>Select another task to continue.</p>
        `;
        
        showFeedback(true);
        showNotification(`Reaction time: ${responseTime.toFixed(3)}s`, 'success');
        
        updateResults();
        
        if (responses.length > 0) {
            document.getElementById('saveSessionBtn').disabled = false;
        }
        
        currentTask = null;
        reactionStartTime = null;
    }
}

function submitAnswer() {
    if (!currentTask || !taskStartTime) return;
    
    const answer = document.getElementById('answerInput').value.trim();
    
    if (currentTask.type === 'math') {
        if (answer === '' || isNaN(answer)) {
            showNotification('Please enter a valid number', 'error');
            return;
        }
    }
    
    if (currentTask.type === 'reaction') {
        return; 
    }
    
    if (currentTask.type === 'memory') {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }
    
    const responseTime = (Date.now() - taskStartTime) / 1000;
    
    let isCorrect = false;
    
    switch(currentTask.type) {
        case 'math':
            isCorrect = parseInt(answer) === currentTask.answer;
            break;
        case 'memory':
            isCorrect = answer.toUpperCase() === currentTask.answer;
            break;
    }
    
    if (currentTask.type !== 'reaction') {
        showFeedback(isCorrect);
        
        if (isCorrect) {
            showNotification('Correct answer! Great job!', 'success');
        } else {
            showNotification('Incorrect answer. Keep trying!', 'error');
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
            <p>Response time: ${responseTime.toFixed(2)}s</p>
            <p>Select another task to continue.</p>
        `;
        
        if (responses.length > 0) {
            document.getElementById('saveSessionBtn').disabled = false;
            showNotification('Complete your session and click Save Session', 'info');
        }
        
        currentTask = null;
        taskStartTime = null;
        
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }
}

function showFeedback(isCorrect) {
    const feedbackContainer = document.getElementById('feedbackContainer');
    const message = isCorrect ? 
        '<i class="fas fa-check-circle"></i> Correct!' : 
        '<i class="fas fa-times-circle"></i> Incorrect. Try again!';
    
    feedbackContainer.innerHTML = `
        <div class="feedback-message ${isCorrect ? 'correct' : 'incorrect'}">
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        const feedback = feedbackContainer.querySelector('.feedback-message');
        if (feedback) {
            feedback.classList.add('fade-out');
            setTimeout(() => {
                feedbackContainer.innerHTML = '';
            }, 300);
        }
    }, 2000);
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function updateResults() {
    if (responses.length === 0) return;
   
    const correctCount = responses.filter(r => r.correct).length;
    const accuracy = (correctCount / responses.length) * 100;
    document.getElementById('accuracyResult').textContent = `${Math.round(accuracy)}%`;
    
    const avgResponseTimes = {};
    const taskTypes = ['math', 'memory', 'reaction'];
    
    taskTypes.forEach(type => {
        const taskResponses = responses.filter(r => r.task === type);
        if (taskResponses.length > 0) {
            const avgTime = taskResponses.reduce((sum, r) => sum + r.responseTime, 0) / taskResponses.length;
            avgResponseTimes[type] = avgTime;
        }
    });
   
    const overallAvgTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    document.getElementById('responseTimeResult').textContent = `${overallAvgTime.toFixed(2)}s`;
  
    const resilienceScores = {};
    taskTypes.forEach(type => {
        const taskResponses = responses.filter(r => r.task === type);
        if (taskResponses.length > 0) {
            const taskCorrectCount = taskResponses.filter(r => r.correct).length;
            const taskAccuracy = (taskCorrectCount / taskResponses.length) * 100;
            const taskAvgTime = taskResponses.reduce((sum, r) => sum + r.responseTime, 0) / taskResponses.length;
            const avgStressLevel = taskResponses.reduce((sum, r) => sum + r.stressLevel, 0) / taskResponses.length;
            
            resilienceScores[type] = calculateResilienceScore(
                taskAccuracy, 
                taskAvgTime, 
                avgStressLevel, 
                type
            );
        }
    });
   
    let totalWeight = 0;
    let weightedScoreSum = 0;
    
    taskTypes.forEach(type => {
        if (resilienceScores[type] !== undefined) {
            const taskResponses = responses.filter(r => r.task === type);
            const weight = taskResponses.length;
            totalWeight += weight;
            weightedScoreSum += resilienceScores[type] * weight;
        }
    });
    
    const overallResilience = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 0;
    document.getElementById('resilienceScore').textContent = overallResilience;
    
    updateStatistics();
    
    updateChart();
}

function updateStatistics() {
    const savedSessions = JSON.parse(localStorage.getItem('resilienceSessions')) || [];
    
    if (savedSessions.length > 0) {
        const avgResilience = savedSessions.reduce((sum, session) => sum + session.resilienceScore, 0) / savedSessions.length;
        document.getElementById('avgResilience').textContent = Math.round(avgResilience);
        
        const bestScore = Math.max(...savedSessions.map(s => s.resilienceScore));
        document.getElementById('bestScore').textContent = bestScore;
        
        document.getElementById('totalSessions').textContent = savedSessions.length;
    }
}

function updateChart() {
    if (!resilienceChart) return;
    
    const savedSessions = JSON.parse(localStorage.getItem('resilienceSessions')) || [];
    
    const labels = savedSessions.map((session, index) => `Session ${index + 1}`);
    const data = savedSessions.map(session => session.resilienceScore);
    
    resilienceChart.data.labels = labels;
    resilienceChart.data.datasets[0].data = data;
    resilienceChart.update();
}

function saveSession() {
    if (responses.length === 0) {
        showNotification('Complete at least one task before saving', 'error');
        return;
    }
    
    const correctCount = responses.filter(r => r.correct).length;
    const accuracy = (correctCount / responses.length) * 100;
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
    
    const taskTypes = ['math', 'memory', 'reaction'];
    const resilienceScores = {};
    
    taskTypes.forEach(type => {
        const taskResponses = responses.filter(r => r.task === type);
        if (taskResponses.length > 0) {
            const taskCorrectCount = taskResponses.filter(r => r.correct).length;
            const taskAccuracy = (taskCorrectCount / taskResponses.length) * 100;
            const taskAvgTime = taskResponses.reduce((sum, r) => sum + r.responseTime, 0) / taskResponses.length;
            const avgStressLevel = taskResponses.reduce((sum, r) => sum + r.stressLevel, 0) / taskResponses.length;
            
            resilienceScores[type] = calculateResilienceScore(
                taskAccuracy, 
                taskAvgTime, 
                avgStressLevel, 
                type
            );
        }
    });
    
    let totalWeight = 0;
    let weightedScoreSum = 0;
    
    taskTypes.forEach(type => {
        if (resilienceScores[type] !== undefined) {
            const taskResponses = responses.filter(r => r.task === type);
            const weight = taskResponses.length;
            totalWeight += weight;
            weightedScoreSum += resilienceScores[type] * weight;
        }
    });
    
    const overallResilience = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 0;
    
    const session = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        responses: [...responses],
        accuracy: Math.round(accuracy),
        avgResponseTime: avgResponseTime.toFixed(2),
        resilienceScore: overallResilience,
        resilienceScoresByTask: resilienceScores
    };
    
    const savedSessions = JSON.parse(localStorage.getItem('resilienceSessions')) || [];
    savedSessions.push(session);
    localStorage.setItem('resilienceSessions', JSON.stringify(savedSessions));
    
    updateStatistics();
    updateChart();
    displaySessionsHistory();
    
    responses = [];
    document.getElementById('accuracyResult').textContent = '0%';
    document.getElementById('responseTimeResult').textContent = '0s';
    document.getElementById('resilienceScore').textContent = '0';
    document.getElementById('saveSessionBtn').disabled = true;
    
    showNotification('Session saved successfully!', 'success');
}

function displaySessionsHistory() {
    const savedSessions = JSON.parse(localStorage.getItem('resilienceSessions')) || [];
    const historyContainer = document.getElementById('sessionsHistory');
    
    if (savedSessions.length === 0) {
        historyContainer.innerHTML = '<p>No sessions saved yet.</p>';
        return;
    }
    
    const recentSessions = savedSessions.slice(-5).reverse();
    
    historyContainer.innerHTML = recentSessions.map(session => {
        const date = new Date(session.timestamp).toLocaleString();
        return `
            <div class="session-item">
                <h4>Session on ${date}</h4>
                <p><strong>Resilience Score:</strong> ${session.resilienceScore}</p>
                <p><strong>Accuracy:</strong> ${session.accuracy}%</p>
                <p><strong>Avg Response Time:</strong> ${session.avgResponseTime}s</p>
                <p><strong>Tasks Completed:</strong> ${session.responses.length}</p>
                ${session.resilienceScoresByTask ? `
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                        <p style="font-weight: bold; margin-bottom: 5px;">Scores by Task Type:</p>
                        ${Object.entries(session.resilienceScoresByTask).map(([task, score]) => `
                            <p style="margin-left: 10px; font-size: 13px;">${task.charAt(0).toUpperCase() + task.slice(1)}: ${score}</p>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function loadSessions() {
    displaySessionsHistory();
    updateStatistics();
    updateChart();
}

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (resilienceChart) {
        resilienceChart.destroy();
        resilienceChart = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    if (reactionTimeout) {
        clearTimeout(reactionTimeout);
        reactionTimeout = null;
    }
    if (reactionBox && reactionClickHandler) {
        reactionBox.removeEventListener('click', reactionClickHandler);
        reactionBox.removeEventListener('touchstart', reactionTouchHandler);
    }
});