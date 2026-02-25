// app.js - Fitness Challenge Hub
// LocalStorage keys: username, challenges, logs
let username = localStorage.getItem('username') || '';
let challenges = JSON.parse(localStorage.getItem('challenges') || '[]');
let logs = JSON.parse(localStorage.getItem('logs') || '[]');

const usernameInput = document.getElementById('username');
const setUsernameBtn = document.getElementById('set-username');
const createChallengeForm = document.getElementById('create-challenge-form');
const challengeNameInput = document.getElementById('challenge-name');
const challengeTypeSelect = document.getElementById('challenge-type');
const challengeGoalInput = document.getElementById('challenge-goal');
const challengeList = document.getElementById('challenge-list');
const logForm = document.getElementById('log-form');
const logChallengeSelect = document.getElementById('log-challenge');
const logAmountInput = document.getElementById('log-amount');
const logHistory = document.getElementById('log-history');
const leaderboardsDiv = document.getElementById('leaderboards');
const userStatsDiv = document.getElementById('user-stats');

function saveState() {
    localStorage.setItem('username', username);
    localStorage.setItem('challenges', JSON.stringify(challenges));
    localStorage.setItem('logs', JSON.stringify(logs));
}

setUsernameBtn.onclick = () => {
    username = usernameInput.value.trim();
    saveState();
    renderUserStats();
    renderLeaderboards();
};

createChallengeForm.onsubmit = e => {
    e.preventDefault();
    const name = challengeNameInput.value.trim();
    const type = challengeTypeSelect.value;
    const goal = parseInt(challengeGoalInput.value);
    if (!name || !type || !goal) return;
    if (!challenges.find(c => c.name === name)) {
        challenges.push({ name, type, goal });
        saveState();
        renderChallenges();
        renderLogChallengeSelect();
        renderLeaderboards();
    }
    challengeNameInput.value = '';
    challengeGoalInput.value = '';
};

function renderChallenges() {
    challengeList.innerHTML = '';
    challenges.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.name} (${c.type}, Goal: ${c.goal})`;
        challengeList.appendChild(li);
    });
}

function renderLogChallengeSelect() {
    logChallengeSelect.innerHTML = '';
    challenges.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = c.name;
        logChallengeSelect.appendChild(opt);
    });
}

logForm.onsubmit = e => {
    e.preventDefault();
    const challenge = logChallengeSelect.value;
    const amount = parseFloat(logAmountInput.value);
    if (!challenge || !amount || !username) return;
    logs.push({ username, challenge, amount, date: new Date().toISOString() });
    saveState();
    renderLogHistory();
    renderLeaderboards();
    renderUserStats();
    logAmountInput.value = '';
};

function renderLogHistory() {
    logHistory.innerHTML = '';
    logs.filter(l => l.username === username).slice(-10).reverse().forEach(l => {
        const li = document.createElement('li');
        li.textContent = `${l.challenge}: ${l.amount} (${new Date(l.date).toLocaleString()})`;
        logHistory.appendChild(li);
    });
}

function renderLeaderboards() {
    leaderboardsDiv.innerHTML = '';
    challenges.forEach(c => {
        const div = document.createElement('div');
        div.className = 'leaderboard';
        div.innerHTML = `<div class="leaderboard-title">${c.name} (${c.type})</div>`;
        const ul = document.createElement('ul');
        ul.className = 'leaderboard-list';
        // Aggregate totals per user
        const userTotals = {};
        logs.filter(l => l.challenge === c.name).forEach(l => {
            if (!userTotals[l.username]) userTotals[l.username] = 0;
            userTotals[l.username] += l.amount;
        });
        const sorted = Object.entries(userTotals).sort((a,b) => b[1]-a[1]);
        sorted.forEach(([user, total], i) => {
            const li = document.createElement('li');
            li.textContent = `${i+1}. ${user}: ${total} / ${c.goal}`;
            ul.appendChild(li);
        });
        div.appendChild(ul);
        leaderboardsDiv.appendChild(div);
    });
}

function renderUserStats() {
    if (!username) {
        userStatsDiv.innerHTML = '<p>Set your name to track stats.</p>';
        return;
    }
    let html = '';
    challenges.forEach(c => {
        const total = logs.filter(l => l.username === username && l.challenge === c.name).reduce((sum, l) => sum + l.amount, 0);
        html += `<b>${c.name}:</b> ${total} / ${c.goal} (${c.type})<br>`;
    });
    userStatsDiv.innerHTML = html || '<p>No stats yet.</p>';
}

// Initial render
usernameInput.value = username;
renderChallenges();
renderLogChallengeSelect();
renderLogHistory();
renderLeaderboards();
renderUserStats();
