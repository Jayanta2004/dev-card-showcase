// Secure Plugin Marketplace - JavaScript Implementation
// Author: AI Assistant
// Date: 2026
// Description: A comprehensive secure plugin marketplace with security scanning, reviews, and developer tools

// Global variables
let allPlugins = [];
let filteredPlugins = [];
let currentPage = 1;
let pluginsPerPage = 12;
let currentPlugin = null;
let user = null;

// Plugin data structure
const samplePlugins = [
    {
        id: 1,
        name: "Secure File Encryptor",
        author: "SecurityPro",
        description: "Advanced file encryption with AES-256 and zero-knowledge architecture. Protects your sensitive data with military-grade security.",
        category: "security",
        securityLevel: "critical",
        rating: 4.9,
        downloads: 125000,
        updated: "2026-02-20",
        version: "2.1.0",
        tags: ["encryption", "security", "privacy"],
        screenshots: ["screenshot1.jpg", "screenshot2.jpg"],
        reviews: [
            { author: "TechReviewer", rating: 5, text: "Excellent security features!", date: "2026-02-15" },
            { author: "PrivacyAdvocate", rating: 5, text: "Zero-knowledge design is perfect.", date: "2026-02-10" }
        ],
        features: ["AES-256 encryption", "Zero-knowledge", "Cross-platform", "Auto-backup"],
        requirements: ["Windows 10+", "4GB RAM", "100MB storage"]
    },
    {
        id: 2,
        name: "Code Quality Analyzer",
        author: "DevTools Inc",
        description: "Comprehensive code analysis tool that detects security vulnerabilities, bugs, and code smells in real-time.",
        category: "development",
        securityLevel: "high",
        rating: 4.7,
        downloads: 89000,
        updated: "2026-02-18",
        version: "1.8.2",
        tags: ["code-analysis", "security", "development"],
        screenshots: ["code-analyzer1.jpg"],
        reviews: [
            { author: "SeniorDev", rating: 4, text: "Great for catching security issues early.", date: "2026-02-12" }
        ],
        features: ["Real-time analysis", "Security scanning", "Code metrics", "CI/CD integration"],
        requirements: ["Node.js 14+", "2GB RAM"]
    },
    {
        id: 3,
        name: "Productivity Dashboard",
        author: "WorkSmart",
        description: "All-in-one productivity tool with task management, time tracking, and performance analytics.",
        category: "productivity",
        securityLevel: "medium",
        rating: 4.5,
        downloads: 200000,
        updated: "2026-02-22",
        version: "3.2.1",
        tags: ["productivity", "time-tracking", "analytics"],
        screenshots: ["dashboard1.jpg", "dashboard2.jpg"],
        reviews: [
            { author: "Manager", rating: 5, text: "Boosted our team's productivity significantly.", date: "2026-02-20" },
            { author: "Freelancer", rating: 4, text: "Great features, but could use more customization.", date: "2026-02-18" }
        ],
        features: ["Task management", "Time tracking", "Analytics", "Team collaboration"],
        requirements: ["Modern browser", "Internet connection"]
    },
    {
        id: 4,
        name: "AI Content Generator",
        author: "CreativeAI",
        description: "Generate high-quality content using advanced AI algorithms. Perfect for marketing, blogging, and creative writing.",
        category: "entertainment",
        securityLevel: "low",
        rating: 4.2,
        downloads: 150000,
        updated: "2026-02-19",
        version: "1.5.0",
        tags: ["AI", "content", "writing", "creativity"],
        screenshots: ["ai-generator1.jpg"],
        reviews: [
            { author: "ContentCreator", rating: 4, text: "Saves hours of writing time.", date: "2026-02-14" }
        ],
        features: ["AI writing", "Multiple formats", "SEO optimization", "Plagiarism check"],
        requirements: ["API key required", "Modern browser"]
    },
    {
        id: 5,
        name: "Network Security Monitor",
        author: "NetSecure",
        description: "Real-time network monitoring and intrusion detection system. Protects your network from cyber threats.",
        category: "security",
        securityLevel: "critical",
        rating: 4.8,
        downloads: 75000,
        updated: "2026-02-21",
        version: "2.0.5",
        tags: ["network", "security", "monitoring", "intrusion-detection"],
        screenshots: ["network-monitor1.jpg", "network-monitor2.jpg"],
        reviews: [
            { author: "SysAdmin", rating: 5, text: "Essential for network security.", date: "2026-02-16" },
            { author: "ITManager", rating: 5, text: "Comprehensive monitoring capabilities.", date: "2026-02-13" }
        ],
        features: ["Real-time monitoring", "Intrusion detection", "Traffic analysis", "Alert system"],
        requirements: ["Linux/Windows server", "8GB RAM", "Network access"]
    }
];

// Security scanning simulation
class SecurityScanner {
    constructor() {
        this.vulnerabilities = {
            critical: ['SQL injection', 'Remote code execution', 'Privilege escalation'],
            high: ['XSS', 'CSRF', 'Directory traversal'],
            medium: ['Information disclosure', 'Weak encryption'],
            low: ['Deprecated functions', 'Code style issues']
        };
    }

    scanPlugin(plugin) {
        // Simulate security scanning
        const issues = [];
        const severityLevels = Object.keys(this.vulnerabilities);

        // Randomly assign some issues for demonstration
        severityLevels.forEach(level => {
            if (Math.random() < 0.3) {
                const vuln = this.vulnerabilities[level][Math.floor(Math.random() * this.vulnerabilities[level].length)];
                issues.push({ severity: level, description: vuln });
            }
        });

        return {
            passed: issues.length === 0,
            issues: issues,
            score: Math.max(0, 100 - issues.length * 10),
            lastScanned: new Date().toISOString()
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadPlugins();
    updateStats();
    initializeSecurityDashboard();
});

// Initialize application components
function initializeApp() {
    console.log('Initializing Secure Plugin Marketplace...');
    // Load user data from localStorage
    const storedUser = localStorage.getItem('marketplaceUser');
    if (storedUser) {
        user = JSON.parse(storedUser);
        updateUserInterface();
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            switchSection(targetId);
        });
    });

    // Search
    document.getElementById('mainSearch').addEventListener('input', debounce(handleSearch, 300));
    document.getElementById('searchBtn').addEventListener('click', handleSearch);

    // Filters
    document.getElementById('applyFilters').addEventListener('click', applyFilters);

    // Load more
    document.getElementById('loadMoreBtn').addEventListener('click', loadMorePlugins);

    // Plugin detail
    document.getElementById('backToBrowse').addEventListener('click', backToBrowse);

    // User actions
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    document.getElementById('signupBtn').addEventListener('click', showSignupModal);

    // Developer actions
    document.getElementById('submitPluginBtn').addEventListener('click', showSubmitPluginModal);
    document.getElementById('guidelinesBtn').addEventListener('click', showGuidelines);
    document.getElementById('toolsBtn').addEventListener('click', showTools);

    // Modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('submitPluginForm').addEventListener('submit', handlePluginSubmission);

    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
}

// Switch between sections
function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(sectionId).style.display = 'block';
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');

    // Special handling for plugin detail
    if (sectionId === 'pluginDetail') {
        document.getElementById('pluginDetail').style.display = 'block';
    }
}

// Load plugins data
function loadPlugins() {
    // In a real app, this would fetch from an API
    allPlugins = samplePlugins.map(plugin => ({
        ...plugin,
        securityScan: new SecurityScanner().scanPlugin(plugin)
    }));

    populateCategories();
    displayPlugins(allPlugins.slice(0, pluginsPerPage));
    updateStats();
}

// Populate category filter
function populateCategories() {
    const categories = [...new Set(allPlugins.map(p => p.category))];
    const categoryFilter = document.getElementById('categoryFilter');

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}

// Display plugins in grid
function displayPlugins(plugins) {
    const pluginList = document.getElementById('pluginList');
    pluginList.innerHTML = '';

    plugins.forEach(plugin => {
        const pluginCard = createPluginCard(plugin);
        pluginList.appendChild(pluginCard);
    });

    // Update load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (plugins.length >= currentPage * pluginsPerPage) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Create plugin card element
function createPluginCard(plugin) {
    const card = document.createElement('div');
    card.className = 'plugin-card';
    card.onclick = () => showPluginDetail(plugin);

    card.innerHTML = `
        <div class="plugin-header">
            <div class="plugin-icon">
                <i class="fas fa-${getPluginIcon(plugin.category)}"></i>
            </div>
            <div class="plugin-info">
                <h4>${plugin.name}</h4>
                <div class="plugin-author">by ${plugin.author}</div>
            </div>
        </div>
        <div class="plugin-description">${plugin.description.substring(0, 100)}...</div>
        <div class="plugin-meta">
            <div class="plugin-rating">
                <div class="stars">${generateStars(plugin.rating)}</div>
                <span>${plugin.rating}</span>
            </div>
            <div class="downloads">${plugin.downloads.toLocaleString()} downloads</div>
        </div>
        <span class="security-badge security-${plugin.securityLevel}">${plugin.securityLevel} security</span>
    `;

    return card;
}

// Get icon for plugin category
function getPluginIcon(category) {
    const icons = {
        security: 'shield-alt',
        development: 'code',
        productivity: 'tasks',
        entertainment: 'gamepad'
    };
    return icons[category] || 'puzzle-piece';
}

// Generate star rating display
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

// Show plugin detail view
function showPluginDetail(plugin) {
    currentPlugin = plugin;
    const detailSection = document.getElementById('pluginDetailContent');

    detailSection.innerHTML = `
        <div class="plugin-detail-header">
            <div class="plugin-detail-icon">
                <i class="fas fa-${getPluginIcon(plugin.category)}"></i>
            </div>
            <div class="plugin-detail-info">
                <h2>${plugin.name}</h2>
                <div class="plugin-author">by ${plugin.author} • v${plugin.version}</div>
            </div>
        </div>
        <div class="plugin-detail-meta">
            <div><strong>Rating:</strong> ${generateStars(plugin.rating)} ${plugin.rating}</div>
            <div><strong>Downloads:</strong> ${plugin.downloads.toLocaleString()}</div>
            <div><strong>Updated:</strong> ${new Date(plugin.updated).toLocaleDateString()}</div>
            <div><strong>Security:</strong> <span class="security-badge security-${plugin.securityLevel}">${plugin.securityLevel}</span></div>
        </div>
        <div class="plugin-detail-description">${plugin.description}</div>
        <div class="plugin-actions">
            <button class="btn-primary" onclick="downloadPlugin(${plugin.id})">Download</button>
            <button class="btn-secondary" onclick="addToFavorites(${plugin.id})">Add to Favorites</button>
            <button class="btn-secondary" onclick="reportPlugin(${plugin.id})">Report Issue</button>
        </div>
        <div class="plugin-features">
            <h3>Features</h3>
            <ul>
                ${plugin.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>
        <div class="plugin-requirements">
            <h3>Requirements</h3>
            <ul>
                ${plugin.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
        </div>
        ${plugin.screenshots.length > 0 ? `
        <div class="plugin-screenshots">
            <h3>Screenshots</h3>
            <div class="screenshot-grid">
                ${plugin.screenshots.map(screenshot => `<img src="${screenshot}" alt="Screenshot" class="screenshot">`).join('')}
            </div>
        </div>
        ` : ''}
        <div class="reviews-section">
            <h3>Reviews (${plugin.reviews.length})</h3>
            ${plugin.reviews.map(review => `
                <div class="review">
                    <div class="review-header">
                        <span class="review-author">${review.author}</span>
                        <span class="review-rating">${generateStars(review.rating)}</span>
                    </div>
                    <div class="review-text">${review.text}</div>
                    <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
                </div>
            `).join('')}
        </div>
    `;

    switchSection('pluginDetail');
}

// Back to browse view
function backToBrowse() {
    switchSection('browse');
}

// Handle search
function handleSearch() {
    const query = document.getElementById('mainSearch').value.toLowerCase();
    const filtered = allPlugins.filter(plugin =>
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(query))
    );
    filteredPlugins = filtered;
    currentPage = 1;
    displayPlugins(filteredPlugins.slice(0, pluginsPerPage));
}

// Apply filters
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const security = document.getElementById('securityFilter').value;
    const sortBy = document.getElementById('sortFilter').value;

    let filtered = allPlugins;

    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }

    if (security) {
        filtered = filtered.filter(p => p.securityLevel === security);
    }

    // Sort
    filtered.sort((a, b) => {
        switch (sortBy) {
            case 'downloads':
                return b.downloads - a.downloads;
            case 'rating':
                return b.rating - a.rating;
            case 'updated':
                return new Date(b.updated) - new Date(a.updated);
            default:
                return 0;
        }
    });

    filteredPlugins = filtered;
    currentPage = 1;
    displayPlugins(filteredPlugins.slice(0, pluginsPerPage));
}

// Load more plugins
function loadMorePlugins() {
    currentPage++;
    const start = (currentPage - 1) * pluginsPerPage;
    const end = currentPage * pluginsPerPage;
    const morePlugins = filteredPlugins.slice(start, end);

    morePlugins.forEach(plugin => {
        const pluginCard = createPluginCard(plugin);
        document.getElementById('pluginList').appendChild(pluginCard);
    });

    if (end >= filteredPlugins.length) {
        document.getElementById('loadMoreBtn').style.display = 'none';
    }
}

// Update statistics
function updateStats() {
    const totalPlugins = allPlugins.length;
    const securePlugins = allPlugins.filter(p => p.securityScan.passed).length;
    const activeUsers = Math.floor(Math.random() * 100000) + 500000; // Simulated

    document.getElementById('totalPlugins').textContent = totalPlugins.toLocaleString();
    document.getElementById('securePlugins').textContent = securePlugins.toLocaleString();
    document.getElementById('activeUsers').textContent = activeUsers.toLocaleString();
}

// Initialize security dashboard
function initializeSecurityDashboard() {
    const dashboard = document.getElementById('securityDashboard');
    const totalScans = allPlugins.length;
    const passedScans = allPlugins.filter(p => p.securityScan.passed).length;
    const failedScans = totalScans - passedScans;
    const avgScore = allPlugins.reduce((sum, p) => sum + p.securityScan.score, 0) / totalScans;

    dashboard.innerHTML = `
        <div class="security-stats">
            <div class="security-stat">
                <span class="number">${totalScans}</span>
                <span class="label">Total Scans</span>
            </div>
            <div class="security-stat">
                <span class="number">${passedScans}</span>
                <span class="label">Passed</span>
            </div>
            <div class="security-stat">
                <span class="number">${failedScans}</span>
                <span class="label">Failed</span>
            </div>
            <div class="security-stat">
                <span class="number">${avgScore.toFixed(1)}%</span>
                <span class="label">Avg Score</span>
            </div>
        </div>
        <h4>Security Overview</h4>
        <p>Our automated security scanning system checks all plugins for vulnerabilities, malware, and security best practices. Plugins are scanned daily and re-evaluated with each update.</p>
    `;
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function showSubmitPluginModal() {
    if (!user) {
        alert('Please login to submit a plugin.');
        showLoginModal();
        return;
    }
    document.getElementById('submitPluginModal').style.display = 'block';
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Form handlers
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    // Simulate login
    user = { email, name: email.split('@')[0] };
    localStorage.setItem('marketplaceUser', JSON.stringify(user));
    updateUserInterface();
    closeModals();
    alert('Login successful!');
}

function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    // Simulate signup
    user = { email, name: username };
    localStorage.setItem('marketplaceUser', JSON.stringify(user));
    updateUserInterface();
    closeModals();
    alert('Account created successfully!');
}

function handlePluginSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Simulate plugin submission
    alert('Plugin submitted for review! You will be notified once it\'s approved.');
    closeModals();
    e.target.reset();
}

function updateUserInterface() {
    if (user) {
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('signupBtn').textContent = `Hi, ${user.name}`;
    }
}

// Developer tools
function showGuidelines() {
    alert('Security Guidelines:\n\n1. Use secure coding practices\n2. Implement proper input validation\n3. Use HTTPS for all communications\n4. Regularly update dependencies\n5. Implement proper error handling\n\nFull guidelines available at: https://secure-plugins.org/guidelines');
}

function showTools() {
    alert('Developer Tools:\n\n• Security Scanner SDK\n• Code Analysis Tools\n• Testing Frameworks\n• CI/CD Templates\n• Documentation Generator\n\nDownload from: https://secure-plugins.org/tools');
}

// Plugin actions
function downloadPlugin(id) {
    const plugin = allPlugins.find(p => p.id === id);
    if (plugin) {
        plugin.downloads++;
        alert(`Downloading ${plugin.name}...`);
        updateStats();
    }
}

function addToFavorites(id) {
    if (!user) {
        alert('Please login to add favorites.');
        showLoginModal();
        return;
    }
    alert('Added to favorites!');
}

function reportPlugin(id) {
    const reason = prompt('Please describe the issue:');
    if (reason) {
        alert('Report submitted. Thank you for helping keep the marketplace secure!');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize featured plugins
function initializeFeaturedPlugins() {
    const featuredContainer = document.getElementById('featuredPlugins');
    const featured = allPlugins.slice(0, 3); // Show first 3 as featured

    featured.forEach(plugin => {
        const pluginCard = createPluginCard(plugin);
        featuredContainer.appendChild(pluginCard);
    });
}

// Call featured plugins init
initializeFeaturedPlugins();

// Performance monitoring
const perfData = {
    loadTimes: [],
    searchTimes: []
};

function measurePerformance(action, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    perfData[action + 'Times'].push(duration);
    console.log(`${action} took ${duration.toFixed(2)}ms`);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    // In a real app, send to error reporting service
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModals();
    }
});

// Export for testing
window.Marketplace = {
    allPlugins,
    filteredPlugins,
    user,
    SecurityScanner
};

console.log('Secure Plugin Marketplace loaded successfully!');