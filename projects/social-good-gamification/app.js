// Social Good Gamification Platform
// Author: EWOC Contributors
// Description: Gamify social good activities with points, badges, and leaderboards.

const form = document.getElementById('activityForm');
const confirmation = document.getElementById('confirmation');
const leaderboardDiv = document.getElementById('leaderboard');
const badgesDiv = document.getElementById('badges');
const activityLogDiv = document.getElementById('activityLog');

const STORAGE_KEY = 'socialGoodGamification';
const BADGES = [
    { name: 'First Step', desc: 'Logged your first activity', condition: user => user.activities.length === 1 },
    { name: 'Helper', desc: '5 activities logged', condition: user => user.activities.length >= 5 },
    { name: 'Community Star', desc: '10 activities logged', condition: user => user.activities.length >= 10 },
    { name: 'Eco Warrior', desc: 'Planted 3+ trees', condition: user => user.activities.filter(a => a.activity === 'tree-planting').length >= 3 },
    { name: 'Blood Donor', desc: 'Donated blood', condition: user => user.activities.some(a => a.activity === 'blood-donation') },
    { name: 'Kind Soul', desc: 'Helped the elderly', condition: user => user.activities.some(a => a.activity === 'helping-elderly') },
    { name: 'Clean-Up Champ', desc: '3+ cleanups', condition: user => user.activities.filter(a => a.activity === 'community-cleanup').length >= 3 },
    { name: 'Generous', desc: 'Donated 3+ times', condition: user => user.activities.filter(a => a.activity === 'donation').length >= 3 },
];
const POINTS = {
    'volunteering': 10,
    'donation': 8,
    'community-cleanup': 12,
    'tree-planting': 15,
    'helping-elderly': 10,
    'blood-donation': 20,
    'other': 5
};

function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { users: [] };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function logActivity(username, activity, details) {
    const data = getData();
    let user = data.users.find(u => u.username === username);
    if (!user) {
        user = { username, points: 0, badges: [], activities: [] };
        data.users.push(user);
    }
    const points = POINTS[activity] || 0;
    user.points += points;
    user.activities.push({ activity, details, date: new Date().toISOString().split('T')[0], points });
    // Award badges
    BADGES.forEach(badge => {
        if (!user.badges.includes(badge.name) && badge.condition(user)) {
            user.badges.push(badge.name);
        }
    });
    saveData(data);
    return { points, badges: user.badges };
}

function renderLeaderboard() {
    const data = getData();
    const sorted = [...data.users].sort((a, b) => b.points - a.points);
    leaderboardDiv.innerHTML = sorted.length ? sorted.map((u, i) =>
        `<div class="leaderboard-entry">
            <span><b>#${i+1}</b> ${escapeHtml(u.username)}</span>
            <span>${u.points} pts</span>
        </div>`
    ).join('') : '<em>No activities logged yet.</em>';
}

function renderBadges(username) {
    const data = getData();
    const user = data.users.find(u => u.username === username);
    if (!user || !user.badges.length) {
        badgesDiv.innerHTML = '<em>No badges earned yet.</em>';
        return;
    }
    badgesDiv.innerHTML = user.badges.map(b => `<span class="badge" title="${BADGES.find(bd => bd.name === b).desc}">${b}</span>`).join(' ');
}

function renderActivityLog(username) {
    const data = getData();
    const user = data.users.find(u => u.username === username);
    if (!user || !user.activities.length) {
        activityLogDiv.innerHTML = '<em>No activities logged yet.</em>';
        return;
    }
    activityLogDiv.innerHTML = user.activities.slice().reverse().map(a =>
        `<div class="activity-card">
            <div class="meta">${a.date} | <b>${activityLabel(a.activity)}</b> | +${a.points} pts</div>
            <div>${escapeHtml(a.details)}</div>
        </div>`
    ).join('');
}

function activityLabel(key) {
    switch(key) {
        case 'volunteering': return 'Volunteering';
        case 'donation': return 'Donation';
        case 'community-cleanup': return 'Community Cleanup';
        case 'tree-planting': return 'Tree Planting';
        case 'helping-elderly': return 'Helping Elderly';
        case 'blood-donation': return 'Blood Donation';
        default: return 'Other';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = form.username.value.trim();
    const activity = form.activity.value;
    const details = form.details.value.trim();
    if (!username || !activity) return;
    const { points, badges } = logActivity(username, activity, details);
    confirmation.textContent = `+${points} points! Badges: ${badges.join(', ')}`;
    confirmation.classList.remove('hidden');
    renderLeaderboard();
    renderBadges(username);
    renderActivityLog(username);
    setTimeout(() => confirmation.classList.add('hidden'), 2500);
    form.details.value = '';
});

form.username.addEventListener('change', function() {
    const username = form.username.value.trim();
    if (!username) return;
    renderBadges(username);
    renderActivityLog(username);
});

// Initial load
renderLeaderboard();

