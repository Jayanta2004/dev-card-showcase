// Empathy Echo Chamber - Main JavaScript

// Data Storage
let userData = {
    username: 'Anonymous',
    storiesShared: 0,
    echosSent: 0,
    totalReach: 0
};

let stories = [];
let currentFilter = 'all';
let currentCategory = 'all';
let currentTab = 'all';

// Sample Stories (for demonstration)
const sampleStories = [
    {
        id: 1,
        author: 'Sarah M.',
        authorInitials: 'SM',
        title: 'A Stranger\'s Kindness Changed My Day',
        category: 'witnessed',
        content: 'I was having the worst day imaginable. Lost my job, missed my bus, and was sitting on a bench crying. A stranger sat next to me, didn\'t say anything at first, just offered me a tissue. Then she said, "Whatever you\'re going through, you\'re stronger than you think." Those simple words gave me hope when I needed it most.',
        tags: ['kindness', 'stranger', 'hope'],
        echoes: 247,
        comments: 34,
        timestamp: Date.now() - 3600000 * 5,
        echoedBy: []
    },
    {
        id: 2,
        author: 'Michael Chen',
        authorInitials: 'MC',
        title: 'My Daughter Taught Me About Empathy',
        category: 'family',
        content: 'My 6-year-old saw a homeless person and insisted we stop. She gave him her favorite toy and said, "Everyone needs a friend." In that moment, she showed me what true compassion looks like - seeing people, not circumstances.',
        tags: ['family', 'children', 'compassion'],
        echoes: 523,
        comments: 67,
        timestamp: Date.now() - 3600000 * 12,
        echoedBy: []
    },
    {
        id: 3,
        author: 'Dr. Lisa Park',
        authorInitials: 'LP',
        title: 'The Patient Who Reminded Me Why I Became a Doctor',
        category: 'professional',
        content: 'After a 16-hour shift, exhausted and burnt out, an elderly patient held my hand and said, "Thank you for still caring." It reminded me that empathy isn\'t just part of the job - it\'s why we do it.',
        tags: ['healthcare', 'gratitude', 'purpose'],
        echoes: 891,
        comments: 112,
        timestamp: Date.now() - 3600000 * 24,
        echoedBy: []
    },
    {
        id: 4,
        author: 'James Wilson',
        authorInitials: 'JW',
        title: 'Neighbors Rallied When We Lost Everything',
        category: 'community',
        content: 'Our house caught fire. We lost everything. Within 24 hours, our community organized donations, temporary housing, and emotional support. I learned that we\'re never truly alone when we let people in.',
        tags: ['community', 'support', 'resilience'],
        echoes: 634,
        comments: 89,
        timestamp: Date.now() - 3600000 * 36,
        echoedBy: []
    },
    {
        id: 5,
        author: 'Emma Rodriguez',
        authorInitials: 'ER',
        title: 'A Teacher Who Believed in Me',
        category: 'received',
        content: 'I was failing school, dealing with depression. My teacher stayed after class every day for months, not just teaching me curriculum, but teaching me that I mattered. She saved my life by believing in me when I couldn\'t believe in myself.',
        tags: ['education', 'mentorship', 'belief'],
        echoes: 412,
        comments: 56,
        timestamp: Date.now() - 3600000 * 48,
        echoedBy: []
    }
];

// Current Challenge
const challenge = {
    title: 'Gratitude Week',
    description: 'Share a story about someone who showed you empathy when you needed it most.',
    participants: 127,
    goal: 200
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadData();
    setupEventListeners();
    updateStats();
    renderStories();
    renderTopStories();
    updateChallenge();
    initializeNetwork();
}

// Load Data
function loadData() {
    const savedUserData = localStorage.getItem('empathyUserData');
    const savedStories = localStorage.getItem('empathyStories');
    
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
    }
    
    if (savedStories) {
        stories = JSON.parse(savedStories);
    } else {
        stories = [...sampleStories];
        saveData();
    }
}

// Save Data
function saveData() {
    localStorage.setItem('empathyUserData', JSON.stringify(userData));
    localStorage.setItem('empathyStories', JSON.stringify(stories));
}

// Setup Event Listeners
function setupEventListeners() {
    // Story Form
    document.getElementById('storyForm').addEventListener('submit', handleStorySubmit);
    
    // Character Counter
    document.getElementById('storyContent').addEventListener('input', updateCharCount);
    
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;
            renderStories();
        });
    });
    
    // Category Filter
    document.getElementById('categoryFilter').addEventListener('change', function() {
        currentCategory = this.value;
        renderStories();
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', function() {
        renderStories(this.value);
    });
    
    // Modal Close
    document.getElementById('closeStoryModal').addEventListener('click', closeStoryModal);
    document.getElementById('closeSuccessModal').addEventListener('click', closeSuccessModal);
    
    // Click outside modal to close
    document.getElementById('storyModal').addEventListener('click', function(e) {
        if (e.target === this) closeStoryModal();
    });
    document.getElementById('successModal').addEventListener('click', function(e) {
        if (e.target === this) closeSuccessModal();
    });
}

// Update Character Count
function updateCharCount() {
    const count = this.value.length;
    document.getElementById('charCount').textContent = count;
}

// Handle Story Submission
function handleStorySubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('storyTitle').value.trim();
    const category = document.getElementById('storyCategory').value;
    const content = document.getElementById('storyContent').value.trim();
    const tagsInput = document.getElementById('storyTags').value.trim();
    
    if (!title || !category || !content) {
        alert('Please fill in all required fields');
        return;
    }
    
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const newStory = {
        id: Date.now(),
        author: userData.username,
        authorInitials: getInitials(userData.username),
        title: title,
        category: category,
        content: content,
        tags: tags,
        echoes: 0,
        comments: 0,
        timestamp: Date.now(),
        echoedBy: [],
        isOwn: true
    };
    
    stories.unshift(newStory);
    userData.storiesShared++;
    
    saveData();
    updateStats();
    renderStories();
    renderTopStories();
    
    // Show success modal
    showSuccessModal();
    
    // Reset form
    e.target.reset();
    document.getElementById('charCount').textContent = '0';
}

// Update Stats
function updateStats() {
    document.getElementById('totalStories').textContent = stories.length;
    document.getElementById('totalEchoes').textContent = stories.reduce((sum, s) => sum + s.echoes, 0);
    document.getElementById('activeUsers').textContent = new Set(stories.map(s => s.author)).size;
    
    document.getElementById('userStories').textContent = userData.storiesShared;
    document.getElementById('userEchoes').textContent = userData.echosSent;
    document.getElementById('userReach').textContent = userData.totalReach;
}

// Render Stories
function renderStories(searchQuery = '') {
    const feed = document.getElementById('storiesFeed');
    
    let filteredStories = stories.filter(story => {
        // Tab filter
        if (currentTab === 'mystories' && !story.isOwn) return false;
        if (currentTab === 'trending' && story.echoes < 100) return false;
        if (currentTab === 'recent') {
            const hoursDiff = (Date.now() - story.timestamp) / 3600000;
            if (hoursDiff > 24) return false;
        }
        
        // Category filter
        if (currentCategory !== 'all' && story.category !== currentCategory) return false;
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return story.title.toLowerCase().includes(query) ||
                   story.content.toLowerCase().includes(query) ||
                   story.tags.some(tag => tag.toLowerCase().includes(query));
        }
        
        return true;
    });
    
    // Sort based on tab
    if (currentTab === 'trending') {
        filteredStories.sort((a, b) => b.echoes - a.echoes);
    } else if (currentTab === 'recent') {
        filteredStories.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    if (filteredStories.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken"></i>
                <h3>No stories found</h3>
                <p>Be the first to share an empathy story!</p>
            </div>
        `;
        return;
    }
    
    feed.innerHTML = filteredStories.map(story => createStoryCard(story)).join('');
    
    // Add click listeners
    document.querySelectorAll('.story-card').forEach((card, index) => {
        card.addEventListener('click', () => showStoryModal(filteredStories[index]));
    });
    
    // Add echo button listeners
    document.querySelectorAll('.echo-action-btn').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleEcho(filteredStories[index].id);
        });
    });
}

// Create Story Card HTML
function createStoryCard(story) {
    const isEchoed = story.echoedBy.includes(userData.username);
    const timeAgo = getTimeAgo(story.timestamp);
    
    return `
        <article class="story-card" data-story-id="${story.id}">
            <div class="story-header">
                <div class="story-author">
                    <div class="author-avatar">${story.authorInitials}</div>
                    <div class="author-info">
                        <h4>${escapeHtml(story.author)}</h4>
                        <span>${timeAgo}</span>
                    </div>
                </div>
                <span class="story-category">${getCategoryName(story.category)}</span>
            </div>
            <h3 class="story-title">${escapeHtml(story.title)}</h3>
            <p class="story-preview">${escapeHtml(story.content)}</p>
            ${story.tags.length > 0 ? `
                <div class="story-tags">
                    ${story.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="story-footer">
                <div class="story-actions">
                    <button class="action-btn echo-action-btn ${isEchoed ? 'active' : ''}" data-story-id="${story.id}">
                        <i class="fas fa-broadcast-tower"></i>
                        <span>${isEchoed ? 'Echoed' : 'Echo'}</span>
                    </button>
                    <button class="action-btn">
                        <i class="far fa-comment"></i>
                        <span>${story.comments}</span>
                    </button>
                </div>
                <div class="echo-count">
                    <i class="fas fa-broadcast-tower"></i>
                    <strong>${story.echoes}</strong> echoes
                </div>
            </div>
        </article>
    `;
}

// Show Story Modal
function showStoryModal(story) {
    const modal = document.getElementById('storyModal');
    const content = document.getElementById('storyModalContent');
    const isEchoed = story.echoedBy.includes(userData.username);
    
    content.innerHTML = `
        <div class="story-modal-header">
            <div class="story-author" style="margin-bottom: 15px;">
                <div class="author-avatar">${story.authorInitials}</div>
                <div class="author-info">
                    <h4>${escapeHtml(story.author)}</h4>
                    <span>${getTimeAgo(story.timestamp)}</span>
                </div>
            </div>
            <span class="story-category">${getCategoryName(story.category)}</span>
            <h2 class="story-modal-title">${escapeHtml(story.title)}</h2>
            <div class="story-modal-meta">
                <span><i class="fas fa-broadcast-tower"></i> ${story.echoes} echoes</span>
                <span><i class="far fa-comment"></i> ${story.comments} comments</span>
            </div>
        </div>
        <div class="story-modal-content">
            ${escapeHtml(story.content)}
        </div>
        ${story.tags.length > 0 ? `
            <div class="story-tags" style="margin-bottom: 20px;">
                ${story.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
            </div>
        ` : ''}
        <div class="story-modal-footer">
            <button class="echo-btn ${isEchoed ? 'active' : ''}" onclick="toggleEcho(${story.id})">
                <i class="fas fa-broadcast-tower"></i>
                ${isEchoed ? 'Echoed' : 'Echo This Story'}
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close Modals
function closeStoryModal() {
    document.getElementById('storyModal').classList.remove('active');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
}

function showSuccessModal() {
    document.getElementById('successModal').classList.add('active');
}

// Toggle Echo
function toggleEcho(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    const echoIndex = story.echoedBy.indexOf(userData.username);
    
    if (echoIndex > -1) {
        // Remove echo
        story.echoedBy.splice(echoIndex, 1);
        story.echoes--;
        userData.echosSent--;
        userData.totalReach -= 10;
    } else {
        // Add echo
        story.echoedBy.push(userData.username);
        story.echoes++;
        userData.echosSent++;
        userData.totalReach += 10;
    }
    
    saveData();
    updateStats();
    renderStories();
    renderTopStories();
    
    // Update modal if open
    const modal = document.getElementById('storyModal');
    if (modal.classList.contains('active')) {
        showStoryModal(story);
    }
}

// Render Top Stories
function renderTopStories() {
    const topStories = [...stories]
        .sort((a, b) => b.echoes - a.echoes)
        .slice(0, 5);
    
    const container = document.getElementById('topStories');
    
    if (topStories.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No stories yet</p>';
        return;
    }
    
    container.innerHTML = topStories.map((story, index) => `
        <div class="top-story-item" onclick="showStoryModal(stories.find(s => s.id === ${story.id}))">
            <span class="top-story-rank">${index + 1}</span>
            <div>
                <div class="top-story-title">${escapeHtml(story.title)}</div>
                <div class="top-story-echoes">
                    <i class="fas fa-broadcast-tower"></i> ${story.echoes} echoes
                </div>
            </div>
        </div>
    `).join('');
}

// Update Challenge
function updateChallenge() {
    document.getElementById('challengeTitle').textContent = challenge.title;
    document.getElementById('challengeDescription').textContent = challenge.description;
    document.getElementById('challengeParticipants').textContent = challenge.participants;
    
    const progress = (challenge.participants / challenge.goal) * 100;
    document.getElementById('challengeProgressBar').style.width = `${Math.min(progress, 100)}%`;
}

// Initialize Network Visualization
function initializeNetwork() {
    const canvas = document.getElementById('echoNetwork');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const nodes = [];
    const numNodes = 20;
    
    // Create nodes
    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 3 + 2
        });
    }
    
    function animate() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw nodes
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off walls
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
            
            // Draw node
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(124, 58, 237, 0.6)';
            ctx.fill();
        });
        
        // Draw connections
        nodes.forEach((node1, i) => {
            nodes.slice(i + 1).forEach(node2 => {
                const dx = node1.x - node2.x;
                const dy = node1.y - node2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(node1.x, node1.y);
                    ctx.lineTo(node2.x, node2.y);
                    ctx.strokeStyle = `rgba(124, 58, 237, ${0.2 * (1 - distance / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Helper Functions
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getCategoryName(category) {
    const names = {
        personal: 'Personal Experience',
        witnessed: 'Witnessed Act',
        received: 'Received Support',
        community: 'Community Story',
        professional: 'Professional Care',
        family: 'Family Moment'
    };
    return names[category] || category;
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible
window.showStoryModal = showStoryModal;
window.toggleEcho = toggleEcho;
window.stories = stories;

console.log('💜 Empathy Echo Chamber loaded successfully!');
