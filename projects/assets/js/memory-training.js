let sessions = JSON.parse(localStorage.getItem('memoryData')) || [];

const tips = [
    "Practice regularly - consistency is key for memory improvement.",
    "Get enough sleep - memory consolidation happens during rest.",
    "Stay physically active - exercise boosts brain function.",
    "Eat a brain-healthy diet rich in antioxidants and omega-3s.",
    "Challenge yourself with new learning experiences.",
    "Use mnemonic devices to remember information better.",
    "Reduce stress through meditation or relaxation techniques.",
    "Stay socially active - social interaction stimulates the brain.",
    "Learn a new skill or language to create new neural pathways.",
    "Stay mentally curious and engaged with puzzles and games."
];

let currentSequence = [];
let gameInProgress = false;

function startExercise() {
    if (gameInProgress) return;
    
    gameInProgress = true;
    currentSequence = [];
    
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('result').classList.add('hidden');
    
    // Generate sequence
    const length = Math.floor(Math.random() * 5) + 3; // 3-7 numbers
    for (let i = 0; i < length; i++) {
        currentSequence.push(Math.floor(Math.random() * 9) + 1);
    }
    
    // Show sequence
    showSequence(0);
}

function showSequence(index) {
    if (index >= currentSequence.length) {
        // Sequence shown, now get input
        setTimeout(() => {
            document.getElementById('sequenceDisplay').classList.add('hidden');
            document.getElementById('inputArea').classList.remove('hidden');
            document.getElementById('userInput').focus();
        }, 1000);
        return;
    }
    
    document.getElementById('sequenceDisplay').textContent = currentSequence[index];
    document.getElementById('sequenceDisplay').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('sequenceDisplay').classList.add('hidden');
        setTimeout(() => showSequence(index + 1), 500);
    }, 1000);
}

function checkAnswer() {
    const userAnswer = document.getElementById('userInput').value.trim();
    const userSequence = userAnswer.split(' ').map(n => parseInt(n));
    
    let correct = true;
    let score = 0;
    
    for (let i = 0; i < Math.min(userSequence.length, currentSequence.length); i++) {
        if (userSequence[i] === currentSequence[i]) {
            score++;
        } else {
            correct = false;
            break;
        }
    }
    
    if (correct && userSequence.length === currentSequence.length) {
        score = currentSequence.length * 10; // Perfect score
    }
    
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = `Score: ${score}/${currentSequence.length * 10} (${Math.round(score/currentSequence.length * 10)}%)`;
    resultDiv.classList.remove('hidden');
    
    // Auto-log the session
    document.getElementById('exerciseType').value = 'sequence';
    document.getElementById('score').value = score;
    document.getElementById('difficulty').value = currentSequence.length <= 4 ? 'easy' : currentSequence.length <= 6 ? 'medium' : 'hard';
    document.getElementById('sessionDate').value = new Date().toISOString().split('T')[0];
    
    // Reset game
    gameInProgress = false;
    document.getElementById('inputArea').classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('instructions').classList.remove('hidden');
    document.getElementById('userInput').value = '';
}

function logSession() {
    const exerciseType = document.getElementById('exerciseType').value;
    const score = parseInt(document.getElementById('score').value);
    const difficulty = document.getElementById('difficulty').value;
    const date = document.getElementById('sessionDate').value;

    if (!score || !date) {
        alert('Please fill in score and date');
        return;
    }

    const session = { exerciseType, score, difficulty, date };

    sessions.push(session);
    localStorage.setItem('memoryData', JSON.stringify(sessions));

    updateStats();
    updateHistory();
    drawChart();

    // Clear inputs
    document.getElementById('exerciseType').value = 'sequence';
    document.getElementById('score').value = '';
    document.getElementById('difficulty').value = 'easy';
    document.getElementById('sessionDate').value = '';
}

function updateStats() {
    if (sessions.length === 0) return;
    
    const totalScore = sessions.reduce((sum, session) => sum + session.score, 0);
    const avgScore = totalScore / sessions.length;
    const bestScore = Math.max(...sessions.map(session => session.score));
    
    // Calculate improvement rate (comparing first half to second half)
    const midPoint = Math.floor(sessions.length / 2);
    const firstHalf = sessions.slice(0, midPoint);
    const secondHalf = sessions.slice(midPoint);
    
    let improvementRate = 0;
    if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, s) => sum + s.score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, s) => sum + s.score, 0) / secondHalf.length;
        improvementRate = ((secondAvg - firstAvg) / firstAvg * 100);
    }

    document.getElementById('avgScore').textContent = avgScore.toFixed(1);
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('sessionCount').textContent = sessions.length;
    document.getElementById('improvementRate').textContent = improvementRate.toFixed(1);
}

function drawChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (sessions.length === 0) return;

    const recentSessions = sessions.slice(-10); // Last 10 sessions
    const scores = recentSessions.map(session => session.score);

    const chartWidth = 350;
    const chartHeight = 150;
    const padding = 20;

    // Draw axes
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, chartHeight + padding);
    ctx.lineTo(chartWidth + padding, chartHeight + padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    const maxScore = Math.max(...scores, 100);
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(chartWidth + padding, y);
        ctx.stroke();
        if (i % 2 === 0) {
            ctx.fillStyle = '#666';
            ctx.fillText(Math.round(maxScore - (maxScore / 5) * i), 5, y + 3);
        }
    }

    // Draw line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    scores.forEach((score, index) => {
        const x = padding + (chartWidth / (recentSessions.length - 1 || 1)) * index;
        const y = padding + chartHeight - (score / maxScore) * chartHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#764ba2';
    scores.forEach((score, index) => {
        const x = padding + (chartWidth / (recentSessions.length - 1 || 1)) * index;
        const y = padding + chartHeight - (score / maxScore) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    recentSessions.forEach((session, index) => {
        if (index % 2 === 0) {
            const x = padding + (chartWidth / (recentSessions.length - 1 || 1)) * index;
            ctx.fillText(session.date.slice(-5), x - 10, chartHeight + padding + 15);
        }
    });
}

function updateHistory() {
    const historyEl = document.getElementById('sessionHistory');
    historyEl.innerHTML = '';

    sessions.slice(-5).reverse().forEach(session => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${session.date}: ${session.exerciseType} (${session.difficulty})</span>
            <span>Score: ${session.score}</span>
        `;
        historyEl.appendChild(li);
    });
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
updateStats();
updateHistory();
drawChart();
getNewTip();