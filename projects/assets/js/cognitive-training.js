let scores = JSON.parse(localStorage.getItem('cognitiveScores')) || {
    memory: [],
    reaction: [],
    math: [],
    words: []
};

const tips = [
    "Stay mentally active with puzzles and learning new skills.",
    "Regular physical exercise improves cognitive function.",
    "Get enough sleep - your brain needs rest to consolidate memories.",
    "Eat a balanced diet rich in antioxidants and omega-3 fatty acids.",
    "Socialize regularly to keep your mind sharp.",
    "Learn a new language or musical instrument.",
    "Practice mindfulness meditation to reduce stress.",
    "Stay hydrated - dehydration affects brain function.",
    "Challenge yourself with new experiences and environments.",
    "Take breaks during intense mental work to maintain focus."
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
            startMemoryGame();
            break;
        case 'reaction':
            startReactionTest();
            break;
        case 'math':
            startMathQuiz();
            break;
        case 'words':
            startWordRecall();
            break;
    }
}

function getExerciseTitle(type) {
    const titles = {
        memory: 'Number Memory Test',
        reaction: 'Reaction Time Test',
        math: 'Math Quiz',
        words: 'Word Recall Test'
    };
    return titles[type] || 'Exercise';
}

function startMemoryGame() {
    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    exerciseData.sequence = generateSequence(4);
    exerciseData.step = 'show';

    content.innerHTML = `
        <div class="number-sequence">${exerciseData.sequence.join(' ')}</div>
        <p>Memorize the sequence</p>
    `;

    controls.innerHTML = '<button onclick="nextMemoryStep()">Ready</button>';

    setTimeout(() => {
        if (exerciseData.step === 'show') {
            content.innerHTML = '<p>Now enter the sequence</p><input type="text" id="memoryInput" placeholder="Enter numbers">';
            controls.innerHTML = '<button onclick="checkMemory()">Submit</button>';
            exerciseData.step = 'input';
        }
    }, 3000);
}

function generateSequence(length) {
    return Array.from({length}, () => Math.floor(Math.random() * 10));
}

function nextMemoryStep() {
    const content = document.getElementById('exerciseContent');
    content.innerHTML = '<p>Now enter the sequence</p><input type="text" id="memoryInput" placeholder="Enter numbers">';
    document.getElementById('exerciseControls').innerHTML = '<button onclick="checkMemory()">Submit</button>';
    exerciseData.step = 'input';
}

function checkMemory() {
    const input = document.getElementById('memoryInput').value.trim();
    const userSequence = input.split(/\s+/).map(n => parseInt(n));
    const correct = arraysEqual(userSequence, exerciseData.sequence);

    const score = correct ? exerciseData.sequence.length : 0;
    scores.memory.push({ score, date: new Date().toISOString() });
    localStorage.setItem('cognitiveScores', JSON.stringify(scores));

    updateStats();

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

function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
}

function startReactionTest() {
    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    content.innerHTML = `
        <div class="reaction-box" id="reactionBox">Wait for green...</div>
        <p>Click as soon as it turns green!</p>
    `;

    controls.innerHTML = '<button onclick="startReactionTest()">Start Test</button>';

    const box = document.getElementById('reactionBox');
    box.className = 'reaction-box';

    setTimeout(() => {
        box.className = 'reaction-box ready';
        box.textContent = 'Wait...';

        const delay = Math.random() * 3000 + 1000; // 1-4 seconds
        setTimeout(() => {
            box.className = 'reaction-box go';
            box.textContent = 'CLICK NOW!';
            exerciseData.startTime = Date.now();

            box.onclick = () => {
                const reactionTime = Date.now() - exerciseData.startTime;
                scores.reaction.push({ score: reactionTime, date: new Date().toISOString() });
                localStorage.setItem('cognitiveScores', JSON.stringify(scores));
                updateStats();

                content.innerHTML = `<h3>Reaction Time: ${reactionTime} ms</h3>`;
                controls.innerHTML = '<button onclick="startReactionTest()">Try Again</button>';
            };
        }, delay);
    }, 1000);
}

function startMathQuiz() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    const correctAnswer = operation === '+' ? num1 + num2 : num1 - num2;

    exerciseData.correctAnswer = correctAnswer;

    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    content.innerHTML = `
        <div class="math-problem">${num1} ${operation} ${num2} = ?</div>
        <input type="number" id="mathAnswer" placeholder="Your answer">
    `;

    controls.innerHTML = '<button onclick="checkMath()">Submit</button>';
}

function checkMath() {
    const answer = parseInt(document.getElementById('mathAnswer').value);
    const correct = answer === exerciseData.correctAnswer;

    scores.math.push({ score: correct ? 1 : 0, date: new Date().toISOString() });
    localStorage.setItem('cognitiveScores', JSON.stringify(scores));
    updateStats();

    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    if (correct) {
        content.innerHTML = '<h3>Correct! Great job!</h3>';
    } else {
        content.innerHTML = `<h3>Incorrect</h3><p>Correct answer: ${exerciseData.correctAnswer}</p>`;
    }

    controls.innerHTML = '<button onclick="startMathQuiz()">Next Problem</button>';
}

function startWordRecall() {
    const words = ['apple', 'house', 'river', 'mountain', 'sun', 'book', 'music', 'garden', 'clock', 'star'];
    const selectedWords = words.sort(() => 0.5 - Math.random()).slice(0, 5);
    exerciseData.words = selectedWords;

    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    content.innerHTML = `
        <div class="words-list">
            ${selectedWords.map(word => `<div class="word-item">${word}</div>`).join('')}
        </div>
        <p>Memorize these words</p>
    `;

    controls.innerHTML = '<button onclick="showWordInput()">Ready to Recall</button>';

    setTimeout(() => {
        if (exerciseData.step === 'show') {
            content.innerHTML = '<p>Enter as many words as you remember:</p><input type="text" id="wordsInput" placeholder="word1, word2, ...">';
            controls.innerHTML = '<button onclick="checkWords()">Submit</button>';
            exerciseData.step = 'input';
        }
    }, 5000);
}

function showWordInput() {
    const content = document.getElementById('exerciseContent');
    content.innerHTML = '<p>Enter as many words as you remember:</p><input type="text" id="wordsInput" placeholder="word1, word2, ...">';
    document.getElementById('exerciseControls').innerHTML = '<button onclick="checkWords()">Submit</button>';
    exerciseData.step = 'input';
}

function checkWords() {
    const input = document.getElementById('wordsInput').value.toLowerCase();
    const userWords = input.split(',').map(w => w.trim()).filter(w => w);
    const correctWords = userWords.filter(word => exerciseData.words.includes(word));
    const score = correctWords.length;

    scores.words.push({ score, date: new Date().toISOString() });
    localStorage.setItem('cognitiveScores', JSON.stringify(scores));
    updateStats();

    const content = document.getElementById('exerciseContent');
    const controls = document.getElementById('exerciseControls');

    content.innerHTML = `
        <h3>You remembered ${score} out of ${exerciseData.words.length} words</h3>
        <p>Words you got: ${correctWords.join(', ')}</p>
        <p>Missed: ${exerciseData.words.filter(w => !correctWords.includes(w)).join(', ')}</p>
    `;

    controls.innerHTML = '<button onclick="startWordRecall()">Try Again</button>';
}

function updateStats() {
    const memoryBest = scores.memory.length ? Math.max(...scores.memory.map(s => s.score)) : 0;
    const reactionBest = scores.reaction.length ? Math.min(...scores.reaction.map(s => s.score)) : 0;
    const mathBest = scores.math.length ? (scores.math.filter(s => s.score === 1).length / scores.math.length * 100).toFixed(1) : 0;
    const wordsBest = scores.words.length ? Math.max(...scores.words.map(s => s.score)) : 0;

    document.getElementById('memoryBest').textContent = memoryBest;
    document.getElementById('reactionBest').textContent = reactionBest ? `${reactionBest} ms` : 'N/A';
    document.getElementById('mathBest').textContent = `${mathBest}%`;
    document.getElementById('wordsBest').textContent = wordsBest;

    drawChart();
}

function drawChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const recentScores = [];
    ['memory', 'reaction', 'math', 'words'].forEach(type => {
        const recent = scores[type].slice(-5);
        recentScores.push(...recent.map(s => ({ type, score: s.score, date: s.date })));
    });

    recentScores.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (recentScores.length === 0) return;

    const chartHeight = 150;
    const chartWidth = 350;
    const barWidth = chartWidth / recentScores.length;

    ctx.fillStyle = '#667eea';
    ctx.strokeStyle = '#764ba2';
    ctx.lineWidth = 2;

    recentScores.forEach((entry, index) => {
        const x = 25 + index * barWidth;
        let height = 0;

        if (entry.type === 'reaction') {
            height = Math.max(0, 100 - (entry.score / 10)); // Lower time is better
        } else {
            height = (entry.score / 10) * chartHeight; // Scale to 0-100
        }

        const y = ctx.canvas.height - height - 30;

        ctx.fillRect(x, y, barWidth - 5, height);

        ctx.fillStyle = '#000';
        ctx.fillText(entry.score, x + 5, y - 5);
        ctx.fillStyle = '#667eea';
    });
}

function getNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('tip').textContent = randomTip;
}

// Initialize
updateStats();
getNewTip();