let scores = JSON.parse(localStorage.getItem('neuroplasticityScores')) || {
    memory: [],
    pattern: [],
    reaction: [],
    focus: []
};

let logs = JSON.parse(localStorage.getItem('neuroplasticityLogs')) || [];

const tips = [
    "Practice consistently to strengthen neural pathways.",
    "Combine physical exercise with cognitive training for better results.",
    "Get adequate sleep to consolidate learning and memory.",
    "Try learning a new skill that challenges different brain areas.",
    "Stay socially active to maintain cognitive sharpness.",
    "Incorporate mindfulness meditation into your routine.",
    "Eat a brain-healthy diet rich in omega-3s and antioxidants.",
    "Challenge yourself with increasingly difficult tasks.",
    "Take regular breaks to prevent mental fatigue.",
    "Track your progress to stay motivated."
];

let currentExercise = null;
let exerciseData = {};

function startExercise(type) {
    currentExercise = type;
    document.getElementById('exerciseTitle').textContent = getExerciseTitle(type);
    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    switch (type) {
        case 'memory':
            startMemoryTest();
            break;
        case 'pattern':
            startPatternRecognition();
            break;
        case 'reaction':
            startReactionDrill();
            break;
        case 'focus':
            startFocusTraining();
            break;
    }
}

function getExerciseTitle(type) {
    const titles = {
        memory: 'Memory Test',
        pattern: 'Pattern Recognition',
        reaction: 'Reaction Drill',
        focus: 'Focus Training'
    };
    return titles[type] || 'Exercise';
}

function startMemoryTest() {
    const sequence = generateSequence(5);
    exerciseData.sequence = sequence;
    exerciseData.startTime = Date.now();

    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    content.innerHTML = `
        <div class="number-sequence">${sequence.join(' ')}</div>
        <p>Memorize the sequence</p>
    `;

    controls.innerHTML = '<button onclick="showMemoryInput()">Ready</button>';

    setTimeout(() => {
        content.innerHTML = '<p>Now enter the sequence</p><input type="text" id="memoryInput" placeholder="Enter numbers">';
        controls.innerHTML = '<button onclick="checkMemory()">Submit</button>';
    }, 4000);
}

function generateSequence(length) {
    return Array.from({length}, () => Math.floor(Math.random() * 10));
}

function showMemoryInput() {
    const content = document.getElementById('exerciseContent');
    content.innerHTML = '<p>Now enter the sequence</p><input type="text" id="memoryInput" placeholder="Enter numbers">';
    document.getElementById('exerciseControls').innerHTML = '<button onclick="checkMemory()">Submit</button>';
}

function checkMemory() {
    const input = document.getElementById('memoryInput').value.trim();
    const userSequence = input.split(/\s+/).map(n => parseInt(n));
    const correct = arraysEqual(userSequence, exerciseData.sequence);
    const timeTaken = Date.now() - exerciseData.startTime;
    const score = correct ? exerciseData.sequence.length : 0;

    scores.memory.push({ score, time: timeTaken, date: new Date().toISOString() });
    addLog('Memory Test', score, timeTaken);
    localStorage.setItem('neuroplasticityScores', JSON.stringify(scores));
    localStorage.setItem('neuroplasticityLogs', JSON.stringify(logs));

    updateCharts();

    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    if (correct) {
        content.innerHTML = '<h3>Correct! Well done!</h3>';
        controls.innerHTML = '<button onclick="startExercise(\'memory\')">Try Again</button>';
    } else {
        content.innerHTML = `<h3>Incorrect</h3><p>Correct sequence: ${exerciseData.sequence.join(' ')}</p>`;
        controls.innerHTML = '<button onclick="startExercise(\'memory\')">Try Again</button>';
    }
}

function startPatternRecognition() {
    const pattern = generatePattern();
    exerciseData.pattern = pattern;
    exerciseData.startTime = Date.now();

    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    content.innerHTML = `
        <div class="pattern-grid" id="patternGrid">
            ${pattern.map((active, index) => `<div class="pattern-cell ${active ? 'active' : ''}" data-index="${index}"></div>`).join('')}
        </div>
        <p>Memorize the pattern</p>
    `;

    controls.innerHTML = '<button onclick="showPatternInput()">Ready</button>';

    setTimeout(() => {
        content.innerHTML = `
            <div class="pattern-grid" id="patternGrid">
                ${Array(9).fill().map((_, index) => `<div class="pattern-cell" data-index="${index}" onclick="togglePatternCell(${index})"></div>`).join('')}
            </div>
            <p>Recreate the pattern</p>
        `;
        controls.innerHTML = '<button onclick="checkPattern()">Submit</button>';
    }, 3000);
}

function generatePattern() {
    return Array(9).fill().map(() => Math.random() > 0.6);
}

function togglePatternCell(index) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.classList.toggle('active');
}

function showPatternInput() {
    const content = document.getElementById('exerciseContent');
    content.innerHTML = `
        <div class="pattern-grid" id="patternGrid">
            ${Array(9).fill().map((_, index) => `<div class="pattern-cell" data-index="${index}" onclick="togglePatternCell(${index})"></div>`).join('')}
        </div>
        <p>Recreate the pattern</p>
    `;
    document.getElementById('exerciseControls').innerHTML = '<button onclick="checkPattern()">Submit</button>';
}

function checkPattern() {
    const userPattern = Array.from(document.querySelectorAll('.pattern-cell')).map(cell => cell.classList.contains('active'));
    const correct = arraysEqual(userPattern, exerciseData.pattern);
    const timeTaken = Date.now() - exerciseData.startTime;
    const score = correct ? 1 : 0;

    scores.pattern.push({ score, time: timeTaken, date: new Date().toISOString() });
    addLog('Pattern Recognition', score, timeTaken);
    localStorage.setItem('neuroplasticityScores', JSON.stringify(scores));
    localStorage.setItem('neuroplasticityLogs', JSON.stringify(logs));

    updateCharts();

    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    if (correct) {
        content.innerHTML = '<h3>Correct! Great pattern recognition!</h3>';
        controls.innerHTML = '<button onclick="startExercise(\'pattern\')">Try Again</button>';
    } else {
        content.innerHTML = '<h3>Incorrect</h3><p>Try again to improve your pattern memory.</p>';
        controls.innerHTML = '<button onclick="startExercise(\'pattern\')">Try Again</button>';
    }
}

function startReactionDrill() {
    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    content.innerHTML = `
        <div class="reaction-box" id="reactionBox">Wait for signal...</div>
        <p>Click as soon as it changes color!</p>
    `;

    controls.innerHTML = '<button onclick="startReactionTest()">Start Drill</button>';
}

function startReactionTest() {
    const box = document.getElementById('reactionBox');
    box.className = 'reaction-box';
    box.textContent = 'Wait...';

    const delay = Math.random() * 3000 + 1000;
    exerciseData.startTime = Date.now() + delay;

    setTimeout(() => {
        box.className = 'reaction-box go';
        box.textContent = 'CLICK NOW!';
        exerciseData.clickTime = Date.now();

        box.onclick = () => {
            const reactionTime = Date.now() - exerciseData.clickTime;
            scores.reaction.push({ score: reactionTime, date: new Date().toISOString() });
            addLog('Reaction Drill', reactionTime, reactionTime);
            localStorage.setItem('neuroplasticityScores', JSON.stringify(scores));
            localStorage.setItem('neuroplasticityLogs', JSON.stringify(logs));

            updateCharts();

            const content = document.getElementById('exerciseContent');
            content.innerHTML = `<h3>Reaction Time: ${reactionTime} ms</h3>`;
            document.getElementById('exerciseControls').innerHTML = '<button onclick="startReactionDrill()">Try Again</button>';
        };
    }, delay);
}

function startFocusTraining() {
    exerciseData.focusTime = 0;
    exerciseData.startTime = Date.now();

    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    content.innerHTML = `
        <div class="focus-timer" id="focusTimer">00:00</div>
        <p>Focus on a single point. Click to start/stop.</p>
    `;

    controls.innerHTML = '<button onclick="toggleFocus()">Start</button>';
}

function toggleFocus() {
    if (exerciseData.focusInterval) {
        clearInterval(exerciseData.focusInterval);
        exerciseData.focusInterval = null;
        const focusDuration = Date.now() - exerciseData.startTime;
        scores.focus.push({ score: focusDuration / 1000, date: new Date().toISOString() });
        addLog('Focus Training', Math.round(focusDuration / 1000), focusDuration);
        localStorage.setItem('neuroplasticityScores', JSON.stringify(scores));
        localStorage.setItem('neuroplasticityLogs', JSON.stringify(logs));

        updateCharts();

        document.getElementById('exerciseControls').innerHTML = '<button onclick="startFocusTraining()">Try Again</button>';
    } else {
        exerciseData.startTime = Date.now();
        exerciseData.focusInterval = setInterval(updateFocusTimer, 1000);
        document.getElementById('exerciseControls').innerHTML = '<button onclick="toggleFocus()">Stop</button>';
    }
}

function updateFocusTimer() {
    const elapsed = Math.floor((Date.now() - exerciseData.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('focusTimer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
}

function addLog(exercise, score, time) {
    const logEntry = {
        exercise,
        score,
        time,
        date: new Date().toISOString()
    };
    logs.unshift(logEntry);
    if (logs.length > 20) logs = logs.slice(0, 20); // Keep only last 20 logs
    updateLogsDisplay();
}

function updateLogsDisplay() {
    const logsContainer = document.getElementById('exerciseLogs');
    logsContainer.innerHTML = logs.map(log => `
        <div class="log-entry">
            <span>${log.exercise}: ${log.score} (${Math.round(log.time / 1000)}s)</span>
            <span>${new Date(log.date).toLocaleString()}</span>
        </div>
    `).join('');
}

function updateCharts() {
    drawWeeklyChart();
    drawTrendsChart();
}

function drawWeeklyChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    const weeklyData = getWeeklyData();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Cognitive Score',
                data: weeklyData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getWeeklyData() {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weeklyScores = [0, 0, 0, 0, 0, 0, 0];

    Object.values(scores).forEach(exerciseScores => {
        exerciseScores.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= weekStart) {
                const dayIndex = entryDate.getDay();
                weeklyScores[dayIndex] += entry.score || 0;
            }
        });
    });

    return weeklyScores;
}

function drawTrendsChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    const trendsData = getTrendsData();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendsData.labels,
            datasets: [{
                label: 'Average Score',
                data: trendsData.scores,
                borderColor: '#764ba2',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getTrendsData() {
    const now = new Date();
    const labels = [];
    const scores = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        labels.push(date.toLocaleDateString());

        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        let weekScore = 0;
        let count = 0;

        Object.values(scores).forEach(exerciseScores => {
            exerciseScores.forEach(entry => {
                const entryDate = new Date(entry.date);
                if (entryDate >= weekStart && entryDate <= weekEnd) {
                    weekScore += entry.score || 0;
                    count++;
                }
            });
        });

        scores.push(count > 0 ? weekScore / count : 0);
    }

    return { labels, scores };
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
updateLogsDisplay();
updateCharts();
getNewTip();