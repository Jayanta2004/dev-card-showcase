// Gamified Learning Platform JS

document.addEventListener('DOMContentLoaded', function() {
    renderChallenges();
    renderQuizzes();
    renderMiniGames();
    renderBadges();
    renderProgress();
});

function startLearning() {
    document.getElementById('challenges').scrollIntoView({ behavior: 'smooth' });
}

// Example data
const challenges = [
    { title: 'FizzBuzz', desc: 'Write a program that prints numbers 1-100. For multiples of 3 print Fizz, for 5 print Buzz, for both print FizzBuzz.', completed: false },
    { title: 'Palindrome Checker', desc: 'Check if a given string is a palindrome.', completed: true },
    { title: 'Array Sum', desc: 'Calculate the sum of all elements in an array.', completed: false }
];

const quizzes = [
    { title: 'JavaScript Basics', desc: 'Test your JS fundamentals.', completed: true },
    { title: 'HTML & CSS', desc: 'Quiz on web basics.', completed: false }
];

const minigames = [
    { title: 'Code Typer', desc: 'Type code snippets as fast as you can!', completed: false },
    { title: 'Bug Hunt', desc: 'Find bugs in code snippets.', completed: false }
];

const badges = [
    { name: 'First Challenge', icon: 'fa-flag-checkered', earned: true },
    { name: 'Quiz Master', icon: 'fa-brain', earned: false },
    { name: 'Game Starter', icon: 'fa-gamepad', earned: true }
];

function renderChallenges() {
    const container = document.getElementById('challenge-list');
    container.innerHTML = '';
    challenges.forEach((c, i) => {
        const card = document.createElement('div');
        card.className = 'glp-card';
        card.innerHTML = `
            <div class="glp-card-title">${c.title}</div>
            <div class="glp-card-desc">${c.desc}</div>
            <button class="glp-card-action" onclick="completeChallenge(${i})" ${c.completed ? 'disabled' : ''}>${c.completed ? 'Completed' : 'Start'}</button>
        `;
        container.appendChild(card);
    });
}

function renderQuizzes() {
    const container = document.getElementById('quiz-list');
    container.innerHTML = '';
    quizzes.forEach((q, i) => {
        const card = document.createElement('div');
        card.className = 'glp-card';
        card.innerHTML = `
            <div class="glp-card-title">${q.title}</div>
            <div class="glp-card-desc">${q.desc}</div>
            <button class="glp-card-action" onclick="completeQuiz(${i})" ${q.completed ? 'disabled' : ''}>${q.completed ? 'Completed' : 'Start'}</button>
        `;
        container.appendChild(card);
    });
}

function renderMiniGames() {
    const container = document.getElementById('minigame-list');
    container.innerHTML = '';
    minigames.forEach((g, i) => {
        const card = document.createElement('div');
        card.className = 'glp-card';
        card.innerHTML = `
            <div class="glp-card-title">${g.title}</div>
            <div class="glp-card-desc">${g.desc}</div>
            <button class="glp-card-action" onclick="completeMiniGame(${i})" ${g.completed ? 'disabled' : ''}>${g.completed ? 'Completed' : 'Play'}</button>
        `;
        container.appendChild(card);
    });
}

function renderBadges() {
    const container = document.getElementById('badge-list');
    container.innerHTML = '';
    badges.forEach(b => {
        const badge = document.createElement('div');
        badge.className = 'glp-badge';
        badge.innerHTML = `<i class="fa ${b.icon}"></i> ${b.name} ${b.earned ? '✅' : ''}`;
        container.appendChild(badge);
    });
}

function renderProgress() {
    const total = challenges.length + quizzes.length + minigames.length;
    const completed = challenges.filter(c => c.completed).length + quizzes.filter(q => q.completed).length + minigames.filter(g => g.completed).length;
    const percent = Math.round((completed / total) * 100);
    document.getElementById('progress-tracker').innerHTML = `
        <strong>${completed}</strong> of <strong>${total}</strong> activities completed
        <div style="background:#333;border-radius:8px;margin-top:10px;height:18px;width:100%;overflow:hidden;">
            <div style="background:#00e6d0;height:100%;width:${percent}%;transition:width 0.4s;"></div>
        </div>
        <div style="margin-top:8px;">Progress: <strong>${percent}%</strong></div>
    `;
}

function completeChallenge(i) {
    challenges[i].completed = true;
    renderChallenges();
    renderProgress();
}
function completeQuiz(i) {
    quizzes[i].completed = true;
    renderQuizzes();
    renderProgress();
}
function completeMiniGame(i) {
    minigames[i].completed = true;
    renderMiniGames();
    renderProgress();
}
