// Gamified Coding Challenge Platform JavaScript
// Handles challenge solving, badge awarding, leaderboard, export/import, accessibility, and sharing

const challengeList = document.getElementById('challenge-list');
const challengeDetails = document.getElementById('challenge-details');
const solutionForm = document.getElementById('solution-form');
const solutionCode = document.getElementById('solution-code');
const solutionFeedback = document.getElementById('solution-feedback');
const badgesList = document.getElementById('badges-list');
const leaderboard = document.getElementById('leaderboard');
const shareBtn = document.getElementById('share-btn');
const shareLink = document.getElementById('share-link');
let challenges = [
    { title: 'FizzBuzz', description: 'Print numbers 1-100. For multiples of 3, print "Fizz"; for multiples of 5, print "Buzz"; for both, print "FizzBuzz".', solution: 'for(let i=1;i<=100;i++){let s="";if(i%3==0)s+="Fizz";if(i%5==0)s+="Buzz";console.log(s||i);}' },
    { title: 'Reverse String', description: 'Write a function to reverse a string.', solution: 'function reverse(s){return s.split("").reverse().join("");}' },
    { title: 'Sum Array', description: 'Write a function to sum all numbers in an array.', solution: 'function sum(arr){return arr.reduce((a,b)=>a+b,0);}' }
];
let badges = [];
let users = [{ name: 'You', score: 0, badges: [] }];
let currentChallenge = null;
let accessibilityEnabled = false;

function renderChallenges() {
    challengeList.innerHTML = '';
    challenges.forEach((challenge, idx) => {
        const div = document.createElement('div');
        div.className = 'challenge-item';
        div.innerHTML = `<strong>${challenge.title}</strong><br>${challenge.description}`;
        div.addEventListener('click', () => showChallenge(idx));
        challengeList.appendChild(div);
    });
}

function showChallenge(idx) {
    currentChallenge = challenges[idx];
    challengeDetails.innerHTML = `<strong>${currentChallenge.title}</strong><br>${currentChallenge.description}`;
    solutionFeedback.innerHTML = '';
    solutionCode.value = '';
}

solutionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentChallenge) return;
    const userSolution = solutionCode.value.trim();
    // Mocked solution check
    let correct = checkSolution(userSolution, currentChallenge.solution);
    if (correct) {
        solutionFeedback.innerHTML = 'Correct! Badge earned.';
        awardBadge(currentChallenge.title);
        updateLeaderboard('You', 10);
    } else {
        solutionFeedback.innerHTML = 'Incorrect. Try again!';
    }
});

function checkSolution(userCode, refCode) {
    // Simple string comparison (mocked)
    return userCode.replace(/\s+/g, '') === refCode.replace(/\s+/g, '');
}

function awardBadge(challengeTitle) {
    if (!badges.includes(challengeTitle)) {
        badges.push(challengeTitle);
        users[0].badges.push(challengeTitle);
        renderBadges();
    }
}

function renderBadges() {
    badgesList.innerHTML = '';
    badges.forEach(badge => {
        const div = document.createElement('div');
        div.className = 'badge';
        div.textContent = badge;
        badgesList.appendChild(div);
    });
}

function updateLeaderboard(userName, points) {
    let user = users.find(u => u.name === userName);
    if (user) {
        user.score += points;
    }
    renderLeaderboard();
}

function renderLeaderboard() {
    leaderboard.innerHTML = '';
    let sorted = users.slice().sort((a, b) => b.score - a.score);
    let html = '<ol>';
    sorted.forEach(user => {
        html += `<li>${user.name}: ${user.score} pts, Badges: ${user.badges.join(', ')}</li>`;
    });
    html += '</ol>';
    leaderboard.innerHTML = html;
}

// Export/import platform data
function exportPlatformData() {
    const dataStr = JSON.stringify({ challenges, badges, users });
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'platform-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importPlatformData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.challenges && imported.badges && imported.users) {
                challenges = imported.challenges;
                badges = imported.badges;
                users = imported.users;
                renderChallenges();
                renderBadges();
                renderLeaderboard();
            }
        } catch (err) {
            alert('Invalid platform data file.');
        }
    };
    reader.readAsText(file);
}

// Accessibility features
function toggleAccessibility() {
    accessibilityEnabled = !accessibilityEnabled;
    document.body.style.fontSize = accessibilityEnabled ? '20px' : '16px';
    document.body.style.background = accessibilityEnabled ? '#fffbe6' : '#f5f7fa';
}

// Sharing platform
shareBtn.addEventListener('click', function() {
    const url = window.location.href;
    shareLink.innerHTML = `<p>Share this link: <a href="${url}">${url}</a></p>`;
});

// UI event bindings
document.addEventListener('DOMContentLoaded', () => {
    renderChallenges();
    renderBadges();
    renderLeaderboard();
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const accessibilityBtn = document.getElementById('accessibility-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportPlatformData);
    if (importInput) importInput.addEventListener('change', e => importPlatformData(e.target.files[0]));
    if (accessibilityBtn) accessibilityBtn.addEventListener('click', toggleAccessibility);
});
