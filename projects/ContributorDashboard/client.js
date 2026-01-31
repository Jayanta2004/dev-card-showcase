// Contributor Dashboard client logic
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

// Dummy data for demo
const stats = { prs: 12, commits: 134, streak: 7 };
const badges = ['First PR', '100 Commits', 'Streak Master'];
const timeline = [
    { date: '2026-01-29', action: 'Opened PR #1983' },
    { date: '2026-01-28', action: 'Merged PR #1982' },
    { date: '2026-01-27', action: 'Commented on Issue #1929' }
];
const branches = ['ISSUE-1983', 'ISSUE-1982', 'ISSUE-1929'];
const leaderboardPos = 5;
const milestones = ['200 Commits', '10 PRs in a month'];
const goals = [];
const heatmapData = Array(98).fill(0).map(() => Math.floor(Math.random()*5));
const summary = {
    weekly: '5 PRs, 30 commits, 2 badges earned',
    monthly: '18 PRs, 120 commits, 5 badges earned'
};

// Stats
function renderStats() {
    document.getElementById('prCount').textContent = stats.prs;
    document.getElementById('commitCount').textContent = stats.commits;
    document.getElementById('streakCount').textContent = stats.streak;
    document.getElementById('nextAchievement').value = Math.min(stats.commits, 100);
}

// Heatmap
function renderHeatmap() {
    const heatmap = document.getElementById('heatmap');
    heatmap.innerHTML = '';
    heatmapData.forEach(val => {
        const div = document.createElement('div');
        div.style.opacity = 0.2 + val*0.16;
        div.style.background = val ? '#4f8cff' : '#e0e7ef';
        heatmap.appendChild(div);
    });
}

// Badges
function renderBadges() {
    const badgesDiv = document.getElementById('badges');
    badgesDiv.innerHTML = '';
    badges.forEach(b => {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = b;
        badgesDiv.appendChild(span);
    });
}

// Timeline
function renderTimeline() {
    const timelineUl = document.getElementById('timeline');
    timelineUl.innerHTML = '';
    timeline.forEach(item => {
        const li = document.createElement('li');
        li.className = 'timeline-item';
        li.textContent = `${item.date}: ${item.action}`;
        timelineUl.appendChild(li);
    });
}

// Branches
function renderBranches() {
    const branchesUl = document.getElementById('branches');
    branchesUl.innerHTML = '';
    branches.forEach(b => {
        const li = document.createElement('li');
        li.textContent = b;
        branchesUl.appendChild(li);
    });
}

// Leaderboard & Milestones
function renderLeaderboard() {
    document.getElementById('leaderboardPos').textContent = leaderboardPos;
    const milestonesUl = document.getElementById('milestones');
    milestonesUl.innerHTML = '';
    milestones.forEach(m => {
        const li = document.createElement('li');
        li.textContent = m;
        milestonesUl.appendChild(li);
    });
}

// Goals
const goalInput = document.getElementById('goalInput');
const addGoalBtn = document.getElementById('addGoalBtn');
const goalsList = document.getElementById('goalsList');
addGoalBtn.addEventListener('click', () => {
    const goal = goalInput.value.trim();
    if (goal) {
        goals.push(goal);
        renderGoals();
        goalInput.value = '';
    }
});
function renderGoals() {
    goalsList.innerHTML = '';
    goals.forEach((g, i) => {
        const li = document.createElement('li');
        li.textContent = g;
        goalsList.appendChild(li);
    });
}

// Export
const exportCardBtn = document.getElementById('exportCardBtn');
const exportBadgeBtn = document.getElementById('exportBadgeBtn');
exportCardBtn.addEventListener('click', () => {
    alert('Exported as card image!');
});
exportBadgeBtn.addEventListener('click', () => {
    alert('Exported as badge image!');
});

// Summary
function renderSummary() {
    document.getElementById('summary').innerHTML = `<b>Weekly:</b> ${summary.weekly}<br><b>Monthly:</b> ${summary.monthly}`;
}

// Initial render
renderStats();
renderHeatmap();
renderBadges();
renderTimeline();
renderBranches();
renderLeaderboard();
renderGoals();
renderSummary();
