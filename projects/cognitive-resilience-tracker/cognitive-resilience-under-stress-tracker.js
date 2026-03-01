// Global variables
let currentStressLevel = 5;
let currentTask = null;
let taskStartTime = null;
let responses = [];
let sessions = JSON.parse(localStorage.getItem('resilienceSessions')) || [];
let resilienceChart = null; 
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateStressDisplay();
    updateStatistics();
    initializeChart();
    displaySessions();
    
    if (sessions.length > 0) {
        showNotification(`Loaded ${sessions.length} saved session${sessions.length > 1 ? 's' : ''}`, 'info');
    } else {
        showNotification('Welcome to Cognitive Resilience Tracker!', 'info');
    }
});

function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

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
            showNotification(`Stress level set to ${stressValue} (${level})`, 'info');
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
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
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
    showNotification('Math challenge started!', 'info');
}

function startMemoryTask() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    const memorySequence = generateMemorySequence();
    currentTask = {
        type: 'memory',
        sequence: memorySequence,
        answer: memorySequence
    };
    
    const baseTime = 5000; 
    const stressReduction = currentStressLevel * 300; 
    const memorizationTime = Math.max(2000, baseTime - stressReduction); 
    
    document.getElementById('taskDisplay').innerHTML = `
        <p>Memorize this sequence: <strong style="font-size: 24px;">${memorySequence}</strong></p>
        <div class="memory-timer" style="margin-top: 15px;">
            <p style="font-size: 14px; color: #666;">Time remaining: <span id="countdownTimer">${(memorizationTime/1000).toFixed(1)}</span> seconds</p>
            <p style="font-size: 12px; color: #999;">Stress level ${currentStressLevel} - Memorization time adjusted</p>
            <div style="width: 100%; height: 4px; background: #ddd; border-radius: 2px; margin-top: 5px;">
                <div id="countdownProgress" style="width: 100%; height: 100%; background: #4fd1ff; border-radius: 2px; transition: width 0.1s linear;"></div>
            </div>
        </div>
    `;
    
    let timeLeft = memorizationTime / 1000;
    const startTime = Date.now();
    const endTime = startTime + memorizationTime;
    
    countdownInterval = setInterval(() => {
        const now = Date.now();
        timeLeft = Math.max(0, (endTime - now) / 1000);
        
        const timerElement = document.getElementById('countdownTimer');
        const progressElement = document.getElementById('countdownProgress');
        
        if (timerElement && progressElement) {
            timerElement.textContent = timeLeft.toFixed(1);
            const progressPercent = (timeLeft / (memorizationTime/1000)) * 100;
            progressElement.style.width = `${progressPercent}%`;
            
            if (timeLeft < 2) {
                progressElement.style.background = '#ff4444';
            } else if (timeLeft < 4) {
                progressElement.style.background = '#ffaa00';
            }
        }
        
        if (now >= endTime) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            
            document.getElementById('taskDisplay').innerHTML = `
                <p>Enter the sequence you memorized:</p>
            `;
            showTaskInput();
            taskStartTime = Date.now();
        }
    }, 100);
    
    setTimeout(() => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        document.getElementById('taskDisplay').innerHTML = `
            <p>Enter the sequence you memorized:</p>
        `;
        showTaskInput();
        taskStartTime = Date.now();
    }, memorizationTime);
    
    showNotification('Memory test started! Memorize the sequence', 'info');
}

function startReactionTask() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
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

    showNotification('Reaction test started! Wait for the signal', 'info');
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

function showFeedback(isCorrect) {
    const feedbackContainer = document.getElementById('feedbackContainer');
    
    feedbackContainer.innerHTML = '';
    
    const feedbackElement = document.createElement('div');
    feedbackElement.className = `feedback-message ${isCorrect ? 'correct' : 'incorrect'}`;
    
    if (isCorrect) {
        feedbackElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Correct! +${Math.round(10 * (1 + currentStressLevel/10))} resilience</span>
        `;
    } else {
        feedbackElement.innerHTML = `
            <i class="fas fa-times-circle"></i>
            <span>Incorrect. The answer was: ${currentTask.answer}</span>
        `;
    }
    
    feedbackContainer.appendChild(feedbackElement);
    
    setTimeout(() => {
        feedbackElement.classList.add('fade-out');
        setTimeout(() => {
            feedbackContainer.innerHTML = '';
        }, 300);
    }, 1500);
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
    
    if (currentTask.type === 'reaction' && answer.toLowerCase() !== 'ready') {
        showNotification('Please type "ready" to complete the reaction test', 'error');
        return;
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
        case 'reaction':
            isCorrect = answer.toLowerCase() === 'ready';
            break;
    }
    
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
    if (responses.length === 0) {
        showNotification('No responses to save. Complete some tasks first!', 'warning');
        return;
    }
    
    try {
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
        
        showNotification('✅ Session saved successfully!', 'success');
        
        responses = [];
        document.getElementById('saveSessionBtn').disabled = true;
        document.getElementById('accuracyResult').textContent = '0%';
        document.getElementById('responseTimeResult').textContent = '0s';
        document.getElementById('resilienceScore').textContent = '0';
        
        updateStatistics();
        updateChart();
        displaySessions();
        
    } catch (error) {
        console.error('Error saving session:', error);
        if (error.name === 'QuotaExceededError') {
            showNotification('Storage limit reached. Please clear some old sessions.', 'error');
        } else {
            showNotification('Failed to save session. Please try again.', 'error');
        }
    }
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
    const canvas = document.getElementById('resilienceChart');
    if (!canvas) return;
    
    if (resilienceChart) {
        resilienceChart.destroy();
        resilienceChart = null;
    }
    
    const ctx = canvas.getContext('2d');
    resilienceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sessions.map(s => new Date(s.date).toLocaleDateString()),
            datasets: [{
                label: 'Resilience Score',
                data: sessions.map(s => s.resilienceScore),
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Resilience Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Session Date'
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

function updateChart() {
    if (!resilienceChart) {
        initializeChart();
        return;
    }
    
    try {
        resilienceChart.data.labels = sessions.map(s => new Date(s.date).toLocaleDateString());
        resilienceChart.data.datasets[0].data = sessions.map(s => s.resilienceScore);
        
        resilienceChart.update();
    } catch (error) {
        console.error('Error updating chart:', error);
        initializeChart();
    }
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

function clearAllSessions() {
    if (confirm('Are you sure you want to clear all saved sessions?')) {
        sessions = [];
        localStorage.removeItem('resilienceSessions');
        updateStatistics();
        updateChart();
        displaySessions();
        showNotification('All sessions cleared', 'warning');
    }
}

window.addEventListener('beforeunload', function() {
    if (resilienceChart) {
        resilienceChart.destroy();
        resilienceChart = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
});