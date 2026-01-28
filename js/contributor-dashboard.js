// ============================================
// CONTRIBUTOR DASHBOARD - JAVASCRIPT
// ============================================

// Sample User Data
const userData = {
    name: 'Alex Johnson',
    username: '@alexjohnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    leaderboardPosition: 23,
    positionChange: 'up',
    stats: {
        pullRequests: 127,
        commits: 1234,
        currentStreak: 47,
        badges: 23,
        prTrend: '+12%',
        commitTrend: '+8%',
        streakTrend: '+5',
        badgesTrend: '+3'
    }
};

// Sample Contribution Data (for heatmap - 365 days)
function generateContributionData() {
    const data = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Random contribution level (0-4)
        const level = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0;
        const count = level * Math.ceil(Math.random() * 5);
        
        data.push({
            date: date.toISOString().split('T')[0],
            level: level,
            count: count
        });
    }
    
    return data;
}

let contributionData = generateContributionData();

// Sample Timeline Data
const timelineData = [
    {
        type: 'pr',
        title: 'Pull Request #245 merged',
        description: 'Feature: Add dark mode toggle to settings',
        repository: 'dev-card-showcase',
        timestamp: '2 hours ago',
        additions: 145,
        deletions: 23
    },
    {
        type: 'commit',
        title: '5 commits to feature-dashboard',
        description: 'Updated contributor dashboard with new stats',
        repository: 'dev-card-showcase',
        timestamp: '5 hours ago',
        commits: 5
    },
    {
        type: 'issue',
        title: 'Issue #1718 assigned',
        description: 'Contributor Dashboard (My Profile)',
        repository: 'dev-card-showcase',
        timestamp: '1 day ago'
    },
    {
        type: 'review',
        title: 'Reviewed Pull Request #243',
        description: 'Code review completed with suggestions',
        repository: 'dev-card-showcase',
        timestamp: '2 days ago'
    },
    {
        type: 'pr',
        title: 'Pull Request #240 opened',
        description: 'Fix: Resolve navigation bug on mobile',
        repository: 'dev-card-showcase',
        timestamp: '3 days ago',
        additions: 45,
        deletions: 12
    }
];

// Sample Active Branches
const activeBranches = [
    {
        name: 'ISSUE-1718-contributor-dashboard',
        status: 'wip',
        commits: 8,
        lastUpdate: '2 hours ago',
        behindMain: 0
    },
    {
        name: 'ISSUE-1716-interactive-gallery',
        status: 'review',
        commits: 12,
        lastUpdate: '1 day ago',
        behindMain: 3
    },
    {
        name: 'feature-analytics-page',
        status: 'wip',
        commits: 5,
        lastUpdate: '3 days ago',
        behindMain: 7
    }
];

// Sample Badges Data
const badgesData = [
    { icon: '🚀', name: 'First PR', description: 'Merged your first pull request', earned: true },
    { icon: '🔥', name: '10 Day Streak', description: 'Contributed for 10 days straight', earned: true },
    { icon: '💯', name: 'Century Club', description: 'Made 100 contributions', earned: true },
    { icon: '⭐', name: 'Top Contributor', description: 'One of the top 10 contributors', earned: true },
    { icon: '🎯', name: 'Bug Hunter', description: 'Fixed 25 bugs', earned: true },
    { icon: '📝', name: 'Documentation Pro', description: 'Updated 50 documentation files', earned: true },
    { icon: '🏆', name: 'Gold Tier', description: 'Reached 1000 contributions', earned: false },
    { icon: '🌟', name: 'Rising Star', description: 'Gained 100 stars on your projects', earned: false },
    { icon: '👥', name: 'Team Player', description: 'Reviewed 100 pull requests', earned: false }
];

// Sample Achievements
const achievementsData = [
    { icon: '🚀', title: 'Next PR Milestone', current: 127, target: 150, unit: 'PRs' },
    { icon: '💻', title: 'Code Master', current: 1234, target: 1500, unit: 'Commits' },
    { icon: '🔥', title: 'Fire Streak', current: 47, target: 60, unit: 'Days' }
];

// Sample Milestones
const milestonesData = [
    {
        title: '1000 Commit Milestone',
        description: 'Reached 1000 total commits!',
        date: 'Dec 15, 2024'
    },
    {
        title: '150 Pull Requests',
        description: 'Only 23 PRs away from this milestone',
        date: 'Target: Jan 15, 2025'
    },
    {
        title: '60 Day Streak Goal',
        description: 'Keep contributing to reach this goal',
        date: 'Target: Dec 30, 2024'
    }
];

// Sample Goals Data
let goalsData = [
    {
        id: 1,
        title: 'Complete 20 Pull Requests',
        deadline: '2025-01-31',
        current: 12,
        target: 20
    },
    {
        id: 2,
        title: 'Review 50 PRs',
        deadline: '2025-02-15',
        current: 28,
        target: 50
    },
    {
        id: 3,
        title: 'Fix 10 Critical Bugs',
        deadline: '2024-12-31',
        current: 7,
        target: 10
    }
];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    loadThemePreference();
    loadGoalsFromStorage();
});

function initializeDashboard() {
    renderUserProfile();
    renderStats();
    renderContributionHeatmap();
    renderTimeline();
    renderActiveBranches();
    renderBadges();
    renderAchievements();
    renderMilestones();
    renderGoals();
    initializeEventListeners();
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderUserProfile() {
    document.querySelector('.profile-avatar img').src = userData.avatar;
    document.querySelector('.profile-name').textContent = userData.name;
    document.querySelector('.profile-username').textContent = userData.username;
    
    document.querySelector('.position-value').textContent = `#${userData.leaderboardPosition}`;
    
    const changeElement = document.querySelector('.position-change');
    if (userData.positionChange === 'up') {
        changeElement.innerHTML = '<i class="fas fa-arrow-up"></i> +5';
        changeElement.classList.add('up');
    }
}

function renderStats() {
    const stats = userData.stats;
    
    document.querySelectorAll('.stat-value')[0].textContent = stats.pullRequests;
    document.querySelectorAll('.stat-value')[1].textContent = stats.commits;
    document.querySelectorAll('.stat-value')[2].textContent = stats.currentStreak;
    document.querySelectorAll('.stat-value')[3].textContent = stats.badges;
    
    document.querySelectorAll('.stat-trend')[0].textContent = stats.prTrend;
    document.querySelectorAll('.stat-trend')[1].textContent = stats.commitTrend;
    document.querySelectorAll('.stat-trend')[2].textContent = stats.streakTrend;
    document.querySelectorAll('.stat-trend')[3].textContent = stats.badgesTrend;
}

function renderContributionHeatmap() {
    const heatmapGrid = document.getElementById('heatmap-grid');
    heatmapGrid.innerHTML = '';
    
    contributionData.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = `heatmap-day level-${day.level}`;
        dayElement.dataset.date = day.date;
        dayElement.dataset.count = day.count;
        dayElement.title = `${day.date}: ${day.count} contributions`;
        heatmapGrid.appendChild(dayElement);
    });
    
    calculateWeeklySummary();
}

function renderTimeline() {
    const timelineContainer = document.getElementById('timeline-container');
    timelineContainer.innerHTML = '';
    
    timelineData.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        timelineItem.innerHTML = `
            <div class="timeline-icon ${item.type}">
                <i class="fas fa-${getTimelineIcon(item.type)}"></i>
            </div>
            <div class="timeline-content">
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-description">${item.description}</div>
                <div class="timeline-meta">
                    <span><i class="fas fa-book"></i> ${item.repository}</span>
                    <span><i class="far fa-clock"></i> ${item.timestamp}</span>
                    ${item.additions ? `<span><i class="fas fa-plus"></i> ${item.additions}</span>` : ''}
                    ${item.deletions ? `<span><i class="fas fa-minus"></i> ${item.deletions}</span>` : ''}
                </div>
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
}

function getTimelineIcon(type) {
    const icons = {
        pr: 'code-branch',
        commit: 'check-circle',
        issue: 'exclamation-circle',
        review: 'eye'
    };
    return icons[type] || 'circle';
}

function renderActiveBranches() {
    const branchesContainer = document.getElementById('branches-container');
    branchesContainer.innerHTML = '';
    
    activeBranches.forEach(branch => {
        const branchItem = document.createElement('div');
        branchItem.className = 'branch-item';
        
        branchItem.innerHTML = `
            <div class="branch-header">
                <div class="branch-name">
                    <i class="fas fa-code-branch"></i>
                    ${branch.name}
                </div>
                <span class="branch-status ${branch.status}">${branch.status}</span>
            </div>
            <div class="branch-info">
                <span><i class="fas fa-check-circle"></i> ${branch.commits} commits</span>
                <span><i class="far fa-clock"></i> ${branch.lastUpdate}</span>
                ${branch.behindMain > 0 ? `<span><i class="fas fa-arrow-down"></i> ${branch.behindMain} behind main</span>` : ''}
            </div>
        `;
        
        branchesContainer.appendChild(branchItem);
    });
}

function renderBadges() {
    const badgesGrid = document.getElementById('badges-grid');
    badgesGrid.innerHTML = '';
    
    badgesData.forEach(badge => {
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item';
        if (!badge.earned) {
            badgeItem.style.opacity = '0.5';
            badgeItem.style.filter = 'grayscale(1)';
        }
        
        badgeItem.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <span class="badge-name">${badge.name}</span>
            <span class="badge-description">${badge.description}</span>
        `;
        
        badgesGrid.appendChild(badgeItem);
    });
}

function renderAchievements() {
    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = '';
    
    achievementsData.forEach(achievement => {
        const progress = (achievement.current / achievement.target) * 100;
        
        const achievementItem = document.createElement('div');
        achievementItem.className = 'achievement-item';
        
        achievementItem.innerHTML = `
            <div class="achievement-header">
                <div class="achievement-title">
                    <span style="font-size: 1.5rem;">${achievement.icon}</span>
                    ${achievement.title}
                </div>
                <span class="achievement-progress-text">${achievement.current} / ${achievement.target}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
        
        achievementsList.appendChild(achievementItem);
    });
}

function renderMilestones() {
    const milestonesList = document.getElementById('milestones-list');
    milestonesList.innerHTML = '';
    
    milestonesData.forEach(milestone => {
        const milestoneItem = document.createElement('div');
        milestoneItem.className = 'milestone-item';
        
        milestoneItem.innerHTML = `
            <div class="milestone-title">${milestone.title}</div>
            <div class="milestone-description">${milestone.description}</div>
            <div class="milestone-date"><i class="far fa-calendar"></i> ${milestone.date}</div>
        `;
        
        milestonesList.appendChild(milestoneItem);
    });
}

function renderGoals() {
    const goalsList = document.getElementById('goals-list');
    goalsList.innerHTML = '';
    
    if (goalsData.length === 0) {
        goalsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No goals set. Add your first goal!</p>';
        return;
    }
    
    goalsData.forEach(goal => {
        const progress = (goal.current / goal.target) * 100;
        const daysLeft = calculateDaysLeft(goal.deadline);
        
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        
        goalItem.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goal.title}</div>
                <div class="goal-deadline">
                    <i class="far fa-calendar"></i>
                    ${daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                </div>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="goal-stats">
                <span>Progress: ${goal.current} / ${goal.target}</span>
                <span>${progress.toFixed(0)}%</span>
            </div>
        `;
        
        goalsList.appendChild(goalItem);
    });
}

function calculateDaysLeft(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// ============================================
// CONTRIBUTION SUMMARY (WEEKLY/MONTHLY)
// ============================================

let currentSummaryTab = 'weekly';

function calculateWeeklySummary() {
    const last7Days = contributionData.slice(-7);
    const totalContributions = last7Days.reduce((sum, day) => sum + day.count, 0);
    const avgDaily = (totalContributions / 7).toFixed(1);
    const mostActive = last7Days.reduce((max, day) => day.count > max.count ? day : max, last7Days[0]);
    
    updateSummaryDisplay(totalContributions, avgDaily, mostActive.count);
}

function calculateMonthlySummary() {
    const last30Days = contributionData.slice(-30);
    const totalContributions = last30Days.reduce((sum, day) => sum + day.count, 0);
    const avgDaily = (totalContributions / 30).toFixed(1);
    const mostActive = last30Days.reduce((max, day) => day.count > max.count ? day : max, last30Days[0]);
    
    updateSummaryDisplay(totalContributions, avgDaily, mostActive.count);
}

function updateSummaryDisplay(total, avg, mostActive) {
    document.querySelectorAll('.summary-value')[0].textContent = total;
    document.querySelectorAll('.summary-value')[1].textContent = avg;
    document.querySelectorAll('.summary-value')[2].textContent = mostActive;
}

// ============================================
// THEME CUSTOMIZATION
// ============================================

function loadThemePreference() {
    const savedTheme = localStorage.getItem('dashboardTheme') || 'default';
    applyDashboardTheme(savedTheme);
    
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        }
    });
}

function applyDashboardTheme(theme) {
    document.body.setAttribute('data-dashboard-theme', theme);
    localStorage.setItem('dashboardTheme', theme);
}

// ============================================
// GOALS MANAGEMENT
// ============================================

function loadGoalsFromStorage() {
    const savedGoals = localStorage.getItem('contributionGoals');
    if (savedGoals) {
        goalsData = JSON.parse(savedGoals);
        renderGoals();
    }
}

function saveGoalsToStorage() {
    localStorage.setItem('contributionGoals', JSON.stringify(goalsData));
}

function addNewGoal(goalData) {
    const newGoal = {
        id: Date.now(),
        title: goalData.title,
        deadline: goalData.deadline,
        current: goalData.current || 0,
        target: goalData.target
    };
    
    goalsData.push(newGoal);
    saveGoalsToStorage();
    renderGoals();
}

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

function exportStatsAsImage() {
    // In a real implementation, this would use html2canvas or similar library
    alert('Export functionality would generate an image of your stats card here!');
}

function exportStatsAsJSON() {
    const stats = {
        user: userData,
        contributions: contributionData,
        goals: goalsData,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contributor-stats.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

function shareOnTwitter() {
    const text = `🚀 My Dev Stats: ${userData.stats.pullRequests} PRs, ${userData.stats.commits} Commits, ${userData.stats.currentStreak} Day Streak! 🔥`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Dashboard theme customization
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            applyDashboardTheme(option.dataset.theme);
        });
    });
    
    // Summary tabs
    document.querySelectorAll('.summary-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.summary-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentSummaryTab = tab.dataset.tab;
            if (currentSummaryTab === 'weekly') {
                calculateWeeklySummary();
            } else {
                calculateMonthlySummary();
            }
        });
    });
    
    // Add Goal Modal
    document.getElementById('add-goal-btn')?.addEventListener('click', () => {
        openModal('add-goal-modal');
    });
    
    // Export Stats Modal
    document.getElementById('export-stats-btn')?.addEventListener('click', () => {
        openModal('export-stats-modal');
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-btn.btn-outline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal').id);
        });
    });
    
    // Add goal form submission
    document.getElementById('goal-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const goalData = {
            title: document.getElementById('goal-title').value,
            target: parseInt(document.getElementById('goal-target').value),
            deadline: document.getElementById('goal-deadline').value,
            current: 0
        };
        
        addNewGoal(goalData);
        closeModal('add-goal-modal');
        e.target.reset();
    });
    
    // Export buttons
    document.getElementById('export-image-btn')?.addEventListener('click', exportStatsAsImage);
    document.getElementById('export-json-btn')?.addEventListener('click', exportStatsAsJSON);
    document.getElementById('share-twitter-btn')?.addEventListener('click', shareOnTwitter);
    
    // Quick action buttons
    document.getElementById('create-pr-btn')?.addEventListener('click', () => {
        window.open('https://github.com/your-org/dev-card-showcase/compare', '_blank');
    });
    
    document.getElementById('view-issues-btn')?.addEventListener('click', () => {
        window.open('https://github.com/your-org/dev-card-showcase/issues', '_blank');
    });
    
    document.getElementById('fork-project-btn')?.addEventListener('click', () => {
        window.open('https://github.com/your-org/dev-card-showcase/fork', '_blank');
    });
    
    // Year selector for heatmap
    document.getElementById('year-select')?.addEventListener('change', (e) => {
        // In real implementation, this would fetch data for selected year
        console.log('Year changed to:', e.target.value);
    });
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Load dark/light theme on page load
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

console.log('🚀 Contributor Dashboard Initialized!');
