// Global variables
let reactionBox = null;
let reactionTimeout = null;
let reactionStartTime = null;
let reactionClickHandler = null;
let reactionTouchHandler = null;

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