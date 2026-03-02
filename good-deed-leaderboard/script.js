// Good Deed Leaderboard - Main JavaScript

// Data Structure
let userData = {
    username: 'You',
    totalPoints: 0,
    totalDeeds: 0,
    currentStreak: 0,
    lastDeedDate: null,
    deeds: [],
    badges: [],
    weeklyProgress: 0
};

// Badges Definition
const BADGES = [
    { id: 'first-deed', name: 'First Step', icon: '🌱', description: 'Log your first deed', requirement: 1, type: 'deeds' },
    { id: 'helper-5', name: 'Kind Soul', icon: '😊', description: 'Complete 5 deeds', requirement: 5, type: 'deeds' },
    { id: 'helper-10', name: 'Kindness Hero', icon: '🦸', description: 'Complete 10 deeds', requirement: 10, type: 'deeds' },
    { id: 'helper-25', name: 'Good Heart', icon: '💝', description: 'Complete 25 deeds', requirement: 25, type: 'deeds' },
    { id: 'helper-50', name: 'Changemaker', icon: '🌟', description: 'Complete 50 deeds', requirement: 50, type: 'deeds' },
    { id: 'helper-100', name: 'Legend', icon: '👑', description: 'Complete 100 deeds', requirement: 100, type: 'deeds' },
    { id: 'points-100', name: 'Century', icon: '💯', description: 'Earn 100 points', requirement: 100, type: 'points' },
    { id: 'points-500', name: 'Power Player', icon: '⚡', description: 'Earn 500 points', requirement: 500, type: 'points' },
    { id: 'points-1000', name: 'Millionaire', icon: '💎', description: 'Earn 1000 points', requirement: 1000, type: 'points' },
    { id: 'streak-3', name: 'Consistent', icon: '🔥', description: '3-day streak', requirement: 3, type: 'streak' },
    { id: 'streak-7', name: 'Dedicated', icon: '💪', description: '7-day streak', requirement: 7, type: 'streak' },
    { id: 'streak-30', name: 'Unstoppable', icon: '🚀', description: '30-day streak', requirement: 30, type: 'streak' },
    { id: 'weekly-challenge', name: 'Challenge Master', icon: '🏆', description: 'Complete weekly challenge', requirement: 1, type: 'challenge' },
    { id: 'environment-lover', name: 'Eco Warrior', icon: '🌍', description: '10 environment deeds', requirement: 10, type: 'category-environment' },
    { id: 'volunteer-star', name: 'Volunteer Star', icon: '⭐', description: '10 volunteer deeds', requirement: 10, type: 'category-volunteer' }
];

// Category Points
const CATEGORY_POINTS = {
    'helping': 10,
    'environment': 15,
    'community': 20,
    'donation': 15,
    'volunteer': 25,
    'kindness': 5
};

// Motivational Quotes
const QUOTES = [
    { text: "No act of kindness, no matter how small, is ever wasted.", author: "Aesop" },
    { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "In a world where you can be anything, be kind.", author: "Anonymous" },
    { text: "Kindness is a language which the deaf can hear and the blind can see.", author: "Mark Twain" },
    { text: "One kind word can change someone's entire day.", author: "Anonymous" },
    { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
    { text: "How wonderful it is that nobody need wait a single moment before starting to improve the world.", author: "Anne Frank" },
    { text: "We rise by lifting others.", author: "Robert Ingersoll" },
    { text: "Carry out a random act of kindness, with no expectation of reward.", author: "Princess Diana" },
    { text: "Kindness is the sunshine in which virtue grows.", author: "Robert Green Ingersoll" }
];

// Sample Leaderboard Data (In a real app, this would come from a backend)
let leaderboardData = [
    { username: 'KindnessKing', points: 1250, deeds: 87, rank: 1 },
    { username: 'GoodVibesOnly', points: 1100, deeds: 76, rank: 2 },
    { username: 'HelpingHand', points: 980, deeds: 68, rank: 3 },
    { username: 'ChangeAgent', points: 850, deeds: 59, rank: 4 },
    { username: 'SunshineSpread', points: 720, deeds: 51, rank: 5 },
    { username: 'CaringCitizen', points: 650, deeds: 45, rank: 6 },
    { username: 'PositivityPro', points: 580, deeds: 40, rank: 7 },
    { username: 'HeartOfGold', points: 520, deeds: 36, rank: 8 }
];

// Weekly Challenge
let weeklyChallenge = {
    title: 'Complete 10 Acts of Kindness',
    description: 'Spread kindness by completing 10 good deeds this week!',
    goal: 10,
    reward: 100,
    endsAt: getNextSunday()
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    initializePage();
    setupEventListeners();
    updateChallengeTimer();
    setInterval(updateChallengeTimer, 60000); // Update every minute
});

// Load User Data from LocalStorage
function loadUserData() {
    const savedData = localStorage.getItem('goodDeedUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
        // Check and update streak
        updateStreak();
    }
}

// Save User Data to LocalStorage
function saveUserData() {
    localStorage.setItem('goodDeedUserData', JSON.stringify(userData));
}

// Initialize Page Content
function initializePage() {
    updateUserStats();
    renderRecentDeeds();
    renderBadges();
    renderLeaderboard('weekly');
    updateWeeklyChallenge();
    displayRandomQuote();
}

// Setup Event Listeners
function setupEventListeners() {
    // Deed Form Submission
    document.getElementById('deedForm').addEventListener('submit', handleDeedSubmission);
    
    // Leaderboard Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderLeaderboard(this.dataset.filter);
        });
    });
    
    // Modal Close
    document.getElementById('closeModal').addEventListener('click', closeCelebrationModal);
    document.getElementById('continueBtn').addEventListener('click', closeCelebrationModal);
}

// Handle Deed Submission
function handleDeedSubmission(e) {
    e.preventDefault();
    
    const title = document.getElementById('deedTitle').value;
    const category = document.getElementById('deedCategory').value;
    const description = document.getElementById('deedDescription').value;
    
    if (!title || !category) {
        alert('Please fill in all required fields!');
        return;
    }
    
    const points = CATEGORY_POINTS[category];
    
    const deed = {
        id: Date.now(),
        title: title,
        category: category,
        description: description,
        points: points,
        date: new Date().toISOString(),
        dateFormatted: formatDate(new Date())
    };
    
    // Add deed to user data
    userData.deeds.unshift(deed);
    userData.totalDeeds++;
    userData.totalPoints += points;
    userData.weeklyProgress++;
    userData.lastDeedDate = new Date().toISOString();
    
    // Update streak
    updateStreak();
    
    // Check for new badges
    const newBadges = checkBadges();
    
    // Save data
    saveUserData();
    
    // Update UI
    updateUserStats();
    renderRecentDeeds();
    renderBadges();
    updateWeeklyChallenge();
    updateLeaderboardWithUser();
    
    // Show celebration modal
    showCelebrationModal(points, newBadges);
    
    // Reset form
    e.target.reset();
}

// Update User Stats Display
function updateUserStats() {
    document.getElementById('totalPoints').textContent = userData.totalPoints;
    document.getElementById('totalDeeds').textContent = userData.totalDeeds;
    document.getElementById('badgeCount').textContent = userData.badges.length;
    document.getElementById('currentStreak').textContent = userData.currentStreak;
    
    // Update username
    document.getElementById('username').textContent = `Welcome, ${userData.username}!`;
    
    // Calculate and update rank
    const userRank = calculateUserRank();
    document.getElementById('userRank').textContent = `#${userRank}`;
}

// Render Recent Deeds
function renderRecentDeeds() {
    const container = document.getElementById('myDeedsList');
    
    if (userData.deeds.length === 0) {
        container.innerHTML = '<p class="empty-state">No deeds logged yet. Start spreading kindness!</p>';
        return;
    }
    
    const recentDeeds = userData.deeds.slice(0, 10);
    container.innerHTML = recentDeeds.map(deed => `
        <div class="deed-item">
            <div class="deed-header">
                <span class="deed-title">${escapeHtml(deed.title)}</span>
                <span class="deed-points">+${deed.points} pts</span>
            </div>
            <span class="deed-category category-${deed.category}">${capitalizeFirst(deed.category)}</span>
            ${deed.description ? `<p class="deed-description">${escapeHtml(deed.description)}</p>` : ''}
            <p class="deed-date">${deed.dateFormatted}</p>
        </div>
    `).join('');
}

// Render Badges
function renderBadges() {
    const container = document.getElementById('badgesGrid');
    
    container.innerHTML = BADGES.map(badge => {
        const isUnlocked = userData.badges.includes(badge.id);
        return `
            <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}" title="${badge.description}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-description">${badge.description}</div>
            </div>
        `;
    }).join('');
}

// Check and Award Badges
function checkBadges() {
    const newBadges = [];
    
    BADGES.forEach(badge => {
        // Skip if already unlocked
        if (userData.badges.includes(badge.id)) return;
        
        let shouldUnlock = false;
        
        switch(badge.type) {
            case 'deeds':
                shouldUnlock = userData.totalDeeds >= badge.requirement;
                break;
            case 'points':
                shouldUnlock = userData.totalPoints >= badge.requirement;
                break;
            case 'streak':
                shouldUnlock = userData.currentStreak >= badge.requirement;
                break;
            case 'challenge':
                shouldUnlock = userData.weeklyProgress >= weeklyChallenge.goal;
                break;
            default:
                if (badge.type.startsWith('category-')) {
                    const category = badge.type.replace('category-', '');
                    const categoryDeeds = userData.deeds.filter(d => d.category === category).length;
                    shouldUnlock = categoryDeeds >= badge.requirement;
                }
        }
        
        if (shouldUnlock) {
            userData.badges.push(badge.id);
            newBadges.push(badge);
        }
    });
    
    return newBadges;
}

// Render Leaderboard
function renderLeaderboard(filter) {
    const container = document.getElementById('leaderboardList');
    
    // Sort leaderboard data
    let sortedData = [...leaderboardData].sort((a, b) => b.points - a.points);
    
    // Update ranks
    sortedData.forEach((user, index) => {
        user.rank = index + 1;
    });
    
    // Take top 10
    sortedData = sortedData.slice(0, 10);
    
    container.innerHTML = sortedData.map(user => {
        let rankClass = 'rank-other';
        if (user.rank === 1) rankClass = 'rank-1';
        else if (user.rank === 2) rankClass = 'rank-2';
        else if (user.rank === 3) rankClass = 'rank-3';
        
        return `
            <div class="leaderboard-item">
                <div class="rank-badge ${rankClass}">
                    ${user.rank === 1 ? '👑' : user.rank}
                </div>
                <div class="leaderboard-user">
                    <div class="leaderboard-name">${escapeHtml(user.username)}</div>
                    <div class="leaderboard-deeds">${user.deeds} good deeds</div>
                </div>
                <div class="leaderboard-points">${user.points}</div>
            </div>
        `;
    }).join('');
}

// Update Leaderboard with User
function updateLeaderboardWithUser() {
    // Find if user already exists in leaderboard
    const userIndex = leaderboardData.findIndex(u => u.username === userData.username);
    
    if (userIndex >= 0) {
        leaderboardData[userIndex].points = userData.totalPoints;
        leaderboardData[userIndex].deeds = userData.totalDeeds;
    } else {
        leaderboardData.push({
            username: userData.username,
            points: userData.totalPoints,
            deeds: userData.totalDeeds
        });
    }
    
    // Re-render current filter
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    renderLeaderboard(activeFilter);
}

// Calculate User Rank
function calculateUserRank() {
    const sortedData = [...leaderboardData].sort((a, b) => b.points - a.points);
    const userIndex = sortedData.findIndex(u => u.username === userData.username);
    return userIndex >= 0 ? userIndex + 1 : sortedData.length + 1;
}

// Update Weekly Challenge
function updateWeeklyChallenge() {
    document.getElementById('challengeTitle').textContent = weeklyChallenge.title;
    document.getElementById('challengeDescription').textContent = weeklyChallenge.description;
    document.getElementById('challengeGoal').textContent = weeklyChallenge.goal;
    document.getElementById('challengeProgress').textContent = Math.min(userData.weeklyProgress, weeklyChallenge.goal);
    
    const progressPercent = Math.min((userData.weeklyProgress / weeklyChallenge.goal) * 100, 100);
    document.getElementById('challengeProgressBar').style.width = progressPercent + '%';
    
    // Check if challenge completed
    if (userData.weeklyProgress >= weeklyChallenge.goal) {
        checkBadges(); // Check for challenge badge
    }
}

// Update Challenge Timer
function updateChallengeTimer() {
    const now = new Date();
    const end = new Date(weeklyChallenge.endsAt);
    const diff = end - now;
    
    if (diff <= 0) {
        // Reset weekly challenge
        userData.weeklyProgress = 0;
        weeklyChallenge.endsAt = getNextSunday();
        saveUserData();
        document.getElementById('challengeTimer').innerHTML = '<i class="far fa-clock"></i> 7 days left';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    let timeText = '';
    if (days > 0) {
        timeText = `${days} day${days > 1 ? 's' : ''} left`;
    } else {
        timeText = `${hours} hour${hours > 1 ? 's' : ''} left`;
    }
    
    document.getElementById('challengeTimer').innerHTML = `<i class="far fa-clock"></i> ${timeText}`;
}

// Update Streak
function updateStreak() {
    if (!userData.lastDeedDate) {
        userData.currentStreak = 1;
        return;
    }
    
    const lastDeed = new Date(userData.lastDeedDate);
    const today = new Date();
    const daysDiff = Math.floor((today - lastDeed) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
        // Same day, streak continues
        return;
    } else if (daysDiff === 1) {
        // Consecutive day
        userData.currentStreak++;
    } else {
        // Streak broken
        userData.currentStreak = 1;
    }
}

// Show Celebration Modal
function showCelebrationModal(points, newBadges) {
    const modal = document.getElementById('celebrationModal');
    const title = document.getElementById('celebrationTitle');
    const message = document.getElementById('celebrationMessage');
    const badgeUnlock = document.getElementById('badgeUnlock');
    
    title.textContent = 'Good Deed Logged! 🎉';
    message.textContent = `You earned ${points} points!`;
    
    if (newBadges.length > 0) {
        badgeUnlock.innerHTML = newBadges.map(badge => `
            <div class="badge-unlock-item">
                <div style="font-size: 2rem;">${badge.icon}</div>
                <p><strong>New Badge!</strong></p>
                <p>${badge.name}</p>
            </div>
        `).join('');
    } else {
        badgeUnlock.innerHTML = '';
    }
    
    modal.classList.add('active');
}

// Close Celebration Modal
function closeCelebrationModal() {
    document.getElementById('celebrationModal').classList.remove('active');
}

// Display Random Quote
function displayRandomQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.getElementById('motivationalQuote').textContent = quote.text;
    document.querySelector('.quote-author').textContent = `- ${quote.author}`;
}

// Helper Functions
function getNextSunday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    const nextSunday = new Date(today.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
    nextSunday.setHours(23, 59, 59, 999);
    return nextSunday.toISOString();
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
        }
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export user data (for debugging/backup)
function exportData() {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'good-deed-data.json';
    link.click();
}

// Console helper
console.log('🌟 Good Deed Leaderboard loaded! Type exportData() to backup your data.');
