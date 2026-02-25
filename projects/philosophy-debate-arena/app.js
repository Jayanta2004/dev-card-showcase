// Philosophy Debate Arena Logic
// Users debate philosophical questions with AI and community scoring

const questions = [
    'Is free will an illusion?',
    'Can happiness be measured?',
    'Is morality objective or subjective?',
    'Does consciousness arise from matter?',
    'Is it better to be loved or feared?',
    'Can machines be conscious?',
    'Is truth absolute or relative?',
    'Does life have inherent meaning?'
];

const questionSection = document.getElementById('question-section');
const debateForm = document.getElementById('debate-form');
const argumentInput = document.getElementById('argument-input');
const debateLogDiv = document.getElementById('debate-log');
const scoreSection = document.getElementById('score-section');

let currentQuestion = questions[Math.floor(Math.random() * questions.length)];
let debateLog = [];
let scores = [];

function renderQuestion() {
    questionSection.innerHTML = `<strong>Debate Question:</strong> ${currentQuestion}`;
}

function renderDebateLog() {
    debateLogDiv.innerHTML = '';
    debateLog.forEach((entry, idx) => {
        const div = document.createElement('div');
        div.className = 'argument-entry';
        div.innerHTML = `<strong>Argument:</strong> ${entry.argument}<br><strong>Score:</strong> ${entry.score}`;
        debateLogDiv.appendChild(div);
    });
    renderScores();
}

debateForm.addEventListener('submit', e => {
    e.preventDefault();
    const argument = argumentInput.value.trim();
    if (!argument) return;
    // AI scoring: simple keyword-based
    let score = 0;
    if (argument.toLowerCase().includes('logic')) score += 2;
    if (argument.toLowerCase().includes('emotion')) score += 2;
    if (argument.toLowerCase().includes('evidence')) score += 2;
    if (argument.length > 100) score += 2;
    score += Math.floor(Math.random() * 3); // Community randomness
    debateLog.push({ argument, score });
    renderDebateLog();
    argumentInput.value = '';
});

function renderScores() {
    scoreSection.innerHTML = '';
    let total = debateLog.reduce((sum, entry) => sum + entry.score, 0);
    let avg = debateLog.length ? (total / debateLog.length).toFixed(2) : 0;
    scoreSection.innerHTML = `<strong>Average Score:</strong> ${avg}<br><strong>Total Arguments:</strong> ${debateLog.length}`;
}

renderQuestion();
renderDebateLog();
