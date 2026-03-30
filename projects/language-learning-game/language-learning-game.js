// language-learning-game.js
// Interactive Language Learning Game - Vocabulary, Grammar, Leaderboard, Challenges

// --- Data Models ---
let vocabulary = [
    { word: "apple", translation: "सेब", options: ["सेब", "केला", "आम", "नाशपाती"] },
    { word: "book", translation: "किताब", options: ["किताब", "कागज", "कलम", "पेन"] },
    { word: "dog", translation: "कुत्ता", options: ["कुत्ता", "बिल्ली", "घोड़ा", "गाय"] }
];
let grammar = [
    { question: "Select the correct form: He ___ going to school.", answer: "is", options: ["are", "is", "am", "be"] },
    { question: "Choose the plural: Child", answer: "Children", options: ["Childs", "Childes", "Children", "Child"] },
    { question: "Fill in the blank: I ___ a book.", answer: "have", options: ["has", "have", "had", "having"] }
];
let leaderboard = [
    { name: "Alice", score: 120 },
    { name: "Bob", score: 100 },
    { name: "Charlie", score: 80 }
];
let challenges = [
    { id: 1, type: "vocab", prompt: "Translate 'apple' to Hindi", answer: "सेब", completed: false },
    { id: 2, type: "grammar", prompt: "Plural of 'Child'", answer: "Children", completed: false }
];
let currentScore = 0;
let currentQuestion = null;
let currentType = null;

// --- Game Logic ---
function startGame() {
    currentScore = 0;
    nextQuestion();
}
function nextQuestion() {
    const area = document.getElementById('game-area');
    const feedback = document.getElementById('game-feedback');
    feedback.textContent = '';
    if (Math.random() > 0.5) {
        // Vocabulary
        currentType = 'vocab';
        currentQuestion = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        area.innerHTML = `<div>Translate: <strong>${currentQuestion.word}</strong></div>` +
            currentQuestion.options.map(opt => `<button class="game-opt-btn" onclick="answerVocab('${opt}')">${opt}</button>`).join('');
    } else {
        // Grammar
        currentType = 'grammar';
        currentQuestion = grammar[Math.floor(Math.random() * grammar.length)];
        area.innerHTML = `<div>${currentQuestion.question}</div>` +
            currentQuestion.options.map(opt => `<button class="game-opt-btn" onclick="answerGrammar('${opt}')">${opt}</button>`).join('');
    }
}
window.answerVocab = function(opt) {
    const feedback = document.getElementById('game-feedback');
    if (opt === currentQuestion.translation) {
        feedback.textContent = 'Correct!';
        currentScore += 10;
    } else {
        feedback.textContent = 'Incorrect!';
    }
    setTimeout(nextQuestion, 1000);
};
window.answerGrammar = function(opt) {
    const feedback = document.getElementById('game-feedback');
    if (opt === currentQuestion.answer) {
        feedback.textContent = 'Correct!';
        currentScore += 10;
    } else {
        feedback.textContent = 'Incorrect!';
    }
    setTimeout(nextQuestion, 1000);
};

document.getElementById('start-game-btn').onclick = startGame;

// --- Leaderboard Rendering ---
function renderLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.forEach((entry, idx) => {
        const div = document.createElement('div');
        div.className = 'leaderboard-entry';
        div.innerHTML = `#${idx+1} <strong>${entry.name}</strong> - ${entry.score} pts`;
        list.appendChild(div);
    });
}

// --- Daily Challenges ---
function renderChallenges() {
    const list = document.getElementById('challenge-list');
    list.innerHTML = '';
    challenges.forEach(ch => {
        const div = document.createElement('div');
        div.className = 'challenge-card';
        div.innerHTML = `
            <div>${ch.prompt}</div>
            <input type="text" id="challenge-input-${ch.id}" placeholder="Your answer">
            <button onclick="submitChallenge(${ch.id})">Submit</button>
            <span id="challenge-feedback-${ch.id}"></span>
        `;
        if (ch.completed) {
            div.style.background = '#e3f7e6';
            div.querySelector('input').disabled = true;
            div.querySelector('button').disabled = true;
            div.querySelector(`#challenge-feedback-${ch.id}`).textContent = 'Completed!';
        }
        list.appendChild(div);
    });
}
window.submitChallenge = function(id) {
    const ch = challenges.find(c => c.id === id);
    const input = document.getElementById(`challenge-input-${id}`);
    const feedback = document.getElementById(`challenge-feedback-${id}`);
    if (input.value.trim() === ch.answer) {
        feedback.textContent = 'Correct!';
        ch.completed = true;
        leaderboard[0].score += 20;
        renderLeaderboard();
        renderChallenges();
    } else {
        feedback.textContent = 'Try again!';
    }
};
document.getElementById('new-challenge-btn').onclick = function() {
    const types = ['vocab', 'grammar'];
    const type = types[Math.floor(Math.random()*types.length)];
    if (type === 'vocab') {
        const v = vocabulary[Math.floor(Math.random()*vocabulary.length)];
        challenges.push({ id: challenges.length+1, type, prompt: `Translate '${v.word}' to Hindi`, answer: v.translation, completed: false });
    } else {
        const g = grammar[Math.floor(Math.random()*grammar.length)];
        challenges.push({ id: challenges.length+1, type, prompt: g.question, answer: g.answer, completed: false });
    }
    renderChallenges();
};

// --- Initial Render ---
document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard();
    renderChallenges();
});
// --- End of language-learning-game.js ---
