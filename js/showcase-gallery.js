// Sample Project Data
const projectsData = [
    {
        id: 1,
        title: "Modern Portfolio Website",
        description: "A fully responsive portfolio website built with React and modern CSS animations. Features dark mode, smooth scrolling, interactive elements, and optimized performance.",
        contributor: "John Doe",
        contributorInitials: "JD",
        category: "web",
        technologies: ["react", "javascript", "css", "html"],
        difficulty: "intermediate",
        image: "https://via.placeholder.com/600x300/667eea/ffffff?text=Portfolio+Website",
        screenshots: [
            "https://via.placeholder.com/800x400/667eea/ffffff?text=Screenshot+1",
            "https://via.placeholder.com/800x400/764ba2/ffffff?text=Screenshot+2",
            "https://via.placeholder.com/800x400/f093fb/ffffff?text=Screenshot+3"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 234,
        views: 1289,
        date: "2026-01-15",
        trending: true,
        features: [
            "Responsive Design",
            "Dark/Light Mode",
            "Smooth Animations",
            "SEO Optimized",
            "Performance Optimized",
            "Cross-browser Compatible"
        ]
    },
    {
        id: 2,
        title: "AI-Powered Chatbot",
        description: "An intelligent chatbot using natural language processing to provide helpful responses. Built with Python and modern ML frameworks for accurate understanding.",
        contributor: "Alex Johnson",
        contributorInitials: "AJ",
        category: "ai",
        technologies: ["python", "tensorflow", "nlp", "flask"],
        difficulty: "advanced",
        image: "https://via.placeholder.com/600x300/f093fb/ffffff?text=AI+Chatbot",
        screenshots: [
            "https://via.placeholder.com/800x400/f093fb/ffffff?text=Chat+Interface",
            "https://via.placeholder.com/800x400/4facfe/ffffff?text=Admin+Panel"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 489,
        views: 3421,
        date: "2026-01-20",
        trending: true,
        features: [
            "Natural Language Understanding",
            "Context-Aware Responses",
            "Multi-language Support",
            "Learning Capability",
            "API Integration"
        ]
    },
    {
        id: 3,
        title: "Weather Forecast App",
        description: "A beautiful weather application with 7-day forecasts, location-based weather updates, and stunning weather animations.",
        contributor: "Sarah Wilson",
        contributorInitials: "SW",
        category: "mobile",
        technologies: ["react-native", "javascript", "api", "mobile"],
        difficulty: "beginner",
        image: "https://via.placeholder.com/600x300/4facfe/ffffff?text=Weather+App",
        screenshots: [
            "https://via.placeholder.com/800x400/4facfe/ffffff?text=Home+Screen",
            "https://via.placeholder.com/800x400/00f2fe/ffffff?text=Forecast+View"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 321,
        views: 2145,
        date: "2026-01-18",
        trending: false,
        features: [
            "Real-time Weather Data",
            "7-Day Forecast",
            "Location Services",
            "Weather Animations",
            "Hourly Updates"
        ]
    },
    {
        id: 4,
        title: "Task Management System",
        description: "A full-stack collaborative task manager with real-time updates, team features, notifications, and advanced project tracking capabilities.",
        contributor: "Emma Davis",
        contributorInitials: "ED",
        category: "web",
        technologies: ["nodejs", "mongodb", "react", "socketio"],
        difficulty: "advanced",
        image: "https://via.placeholder.com/600x300/f6d365/ffffff?text=Task+Manager",
        screenshots: [
            "https://via.placeholder.com/800x400/f6d365/ffffff?text=Dashboard",
            "https://via.placeholder.com/800x400/fda085/ffffff?text=Task+Board"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 567,
        views: 4231,
        date: "2026-01-12",
        trending: true,
        features: [
            "Real-time Collaboration",
            "Team Management",
            "Task Prioritization",
            "Progress Tracking",
            "Notification System",
            "File Attachments"
        ]
    },
    {
        id: 5,
        title: "E-Commerce Platform",
        description: "A complete e-commerce solution with shopping cart, payment integration, inventory management, and admin dashboard.",
        contributor: "Mike Chen",
        contributorInitials: "MC",
        category: "web",
        technologies: ["vue", "node js", "stripe", "mysql"],
        difficulty: "advanced",
        image: "https://via.placeholder.com/600x300/43e97b/ffffff?text=E-Commerce",
        screenshots: [
            "https://via.placeholder.com/800x400/43e97b/ffffff?text=Store+Front",
            "https://via.placeholder.com/800x400/38f9d7/ffffff?text=Checkout"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 712,
        views: 5892,
        date: "2026-01-08",
        trending: true,
        features: [
            "Product Catalog",
            "Shopping Cart",
            "Payment Integration",
            "Order Management",
            "Admin Dashboard",
            "User Reviews"
        ]
    },
    {
        id: 6,
        title: "CSS Animation Library",
        description: "A comprehensive collection of smooth CSS animations and transitions for modern web interfaces. Includes hover effects, loading animations, and more.",
        contributor: "Lisa Park",
        contributorInitials: "LP",
        category: "design",
        technologies: ["css", "html", "javascript"],
        difficulty: "beginner",
        image: "https://via.placeholder.com/600x300/fa709a/ffffff?text=CSS+Animations",
        screenshots: [
            "https://via.placeholder.com/800x400/fa709a/ffffff?text=Animations+Demo"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 445,
        views: 3124,
        date: "2026-01-22",
        trending: false,
        features: [
            "60+ Animations",
            "Easy Integration",
            "Lightweight",
            "Cross-browser Support",
            "Customizable"
        ]
    },
    {
        id: 7,
        title: "Social Media Dashboard",
        description: "Analytics dashboard for social media metrics with beautiful visualizations, real-time data, and comprehensive reporting features.",
        contributor: "Tom Rodriguez",
        contributorInitials: "TR",
        category: "web",
        technologies: ["react", "d3", "api", "typescript"],
        difficulty: "intermediate",
        image: "https://via.placeholder.com/600x300/f857a6/ffffff?text=Dashboard",
        screenshots: [
            "https://via.placeholder.com/800x400/f857a6/ffffff?text=Analytics+View"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 398,
        views: 2876,
        date: "2026-01-25",
        trending: true,
        features: [
            "Real-time Analytics",
            "Data Visualization",
            "Multiple Platforms",
            "Export Reports",
            "Custom Metrics"
        ]
    },
    {
        id: 8,
        title: "2D Platform Game",
        description: "An exciting 2D platform game built with Phaser.js featuring multiple levels, power-ups, enemies, and smooth physics.",
        contributor: "Kevin Lee",
        contributorInitials: "KL",
        category: "game",
        technologies: ["javascript", "phaser", "html5"],
        difficulty: "intermediate",
        image: "https://via.placeholder.com/600x300/764ba2/ffffff?text=Platform+Game",
        screenshots: [
            "https://via.placeholder.com/800x400/764ba2/ffffff?text=Gameplay"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 521,
        views: 3945,
        date: "2026-01-10",
        trending: false,
        features: [
            "Multiple Levels",
            "Power-ups System",
            "Enemy AI",
            "Score Tracking",
            "Sound Effects"
        ]
    },
    {
        id: 9,
        title: "Blog CMS Platform",
        description: "A full-featured content management system for bloggers with markdown support, SEO tools, and analytics integration.",
        contributor: "Rachel Green",
        contributorInitials: "RG",
        category: "web",
        technologies: ["nextjs", "prisma", "postgresql", "typescript"],
        difficulty: "advanced",
        image: "https://via.placeholder.com/600x300/8E2DE2/ffffff?text=Blog+CMS",
        screenshots: [
            "https://via.placeholder.com/800x400/8E2DE2/ffffff?text=Editor+View"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 634,
        views: 4567,
        date: "2026-01-05",
        trending: true,
        features: [
            "Markdown Editor",
            "SEO Optimization",
            "Analytics Integration",
            "Multi-author Support",
            "Media Management",
            "Comment System"
        ]
    },
    {
        id: 10,
        title: "Fitness Tracker App",
        description: "Mobile fitness tracking application with workout plans, progress tracking, calorie counter, and social features.",
        contributor: "David Brown",
        contributorInitials: "DB",
        category: "mobile",
        technologies: ["flutter", "firebase", "dart"],
        difficulty: "intermediate",
        image: "https://via.placeholder.com/600x300/FF6B6B/ffffff?text=Fitness+Tracker",
        screenshots: [
            "https://via.placeholder.com/800x400/FF6B6B/ffffff?text=Workout+View"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 412,
        views: 2934,
        date: "2026-01-16",
        trending: false,
        features: [
            "Workout Tracking",
            "Calorie Counter",
            "Progress Charts",
            "Social Features",
            "Custom Plans"
        ]
    },
    {
        id: 11,
        title: "Music Streaming UI",
        description: "Beautiful music streaming interface with playlist management, search functionality, and audio visualization effects.",
        contributor: "Nina Patel",
        contributorInitials: "NP",
        category: "design",
        technologies: ["react", "css", "howler", "javascript"],
        difficulty: "beginner",
        image: "https://via.placeholder.com/600x300/4ECDC4/ffffff?text=Music+Player",
        screenshots: [
            "https://via.placeholder.com/800x400/4ECDC4/ffffff?text=Player+Interface"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 378,
        views: 2456,
        date: "2026-01-23",
        trending: false,
        features: [
            "Audio Visualization",
            "Playlist Management",
            "Search Function",
            "Favorites System",
            "Queue Management"
        ]
    },
    {
        id: 12,
        title: "Recipe Finder App",
        description: "Discover and save recipes with ingredient search, nutritional information, cooking instructions, and meal planning features.",
        contributor: "Chris Taylor",
        contributorInitials: "CT",
        category: "web",
        technologies: ["vue", "api", "javascript", "tailwind"],
        difficulty: "beginner",
        image: "https://via.placeholder.com/600x300/95E1D3/ffffff?text=Recipe+Finder",
        screenshots: [
            "https://via.placeholder.com/800x400/95E1D3/ffffff?text=Recipe+Search"
        ],
        liveDemo: "#",
        sourceCode: "#",
        favorites: 289,
        views: 1987,
        date: "2026-01-26",
        trending: true,
        features: [
            "Recipe Search",
            "Nutrition Info",
            "Save Favorites",
            "Meal Planning",
            "Shopping List"
        ]
    }
];

// State Management
let currentView = 'grid';
let currentSort = 'newest';
let activeFilters = {
    categories: [],
    technologies: [],
    difficulties: []
};
let searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('projectFavorites') || '[]');
let currentPage = 1;
let projectsPerPage = 9;
let filteredProjects = [...projectsData];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initializeFilters();
    renderProjects();
    updateStats();
    initializeEventListeners();
    initHamburgerMenu();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.querySelector('#themeToggle i');
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

document.getElementById('themeToggle').addEventListener('click', function() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = this.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
});

// Hamburger Menu
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
}

// Initialize Filters
function initializeFilters() {
    // Categories
    const categories = ['all', 'web', 'mobile', 'game', 'ai', 'design'];
    const categoryContainer = document.getElementById('categoryFilters');
    
    const categoryIcons = {
        all: 'fa-th',
        web: 'fa-globe',
        mobile: 'fa-mobile-alt',
        game: 'fa-gamepad',
        ai: 'fa-brain',
        design: 'fa-palette'
    };
    
    categoryContainer.innerHTML = categories.map(cat => `
        <button class="filter-chip ${cat === 'all' ? 'active' : ''}" data-category="${cat}">
            <i class="fas ${categoryIcons[cat]}"></i> ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
    `).join('');
    
    // Technologies
    const technologies = ['react', 'javascript', 'python', 'nodejs', 'vue', 'flutter', 'typescript', 'css'];
    const techContainer = document.getElementById('technologyFilters');
    
    const techIcons = {
        react: 'fa-react',
        javascript: 'fa-js',
        python: 'fa-python',
        nodejs: 'fa-node-js',
        vue: 'fa-vuejs',
        flutter: 'fa-mobile',
        typescript: 'fa-code',
        css: 'fa-css3-alt'
    };
    
    techContainer.innerHTML = technologies.map(tech => `
        <button class="filter-chip" data-technology="${tech}">
            <i class="fab ${techIcons[tech] || 'fa-code'}"></i> ${tech.charAt(0).toUpperCase() + tech.slice(1)}
        </button>
    `).join('');
}

// Event Listeners
function initializeEventListeners() {
    // Search
    const searchBox = document.getElementById('searchBox');
    const clearSearch = document.getElementById('clearSearch');
    
    searchBox.addEventListener('input', function(e) {
        searchQuery = e.target.value.toLowerCase();
        clearSearch.classList.toggle('visible', searchQuery.length > 0);
        currentPage = 1;
        filterAndRenderProjects();
    });
    
    clearSearch.addEventListener('click', function() {
        searchBox.value = '';
        searchQuery = '';
        this.classList.remove('visible');
        currentPage = 1;
        filterAndRenderProjects();
    });
    
    // Category Filters
    document.getElementById('categoryFilters').addEventListener('click', function(e) {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        
        const category = chip.dataset.category;
        
        if (category === 'all') {
            // Clear all category filters
            activeFilters.categories = [];
            this.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        } else {
            // Remove 'all' filter
            this.querySelector('[data-category="all"]').classList.remove('active');
            chip.classList.toggle('active');
            
            if (chip.classList.contains('active')) {
                activeFilters.categories.push(category);
            } else {
                activeFilters.categories = activeFilters.categories.filter(c => c !== category);
            }
            
            // If no categories selected, activate 'all'
            if (activeFilters.categories.length === 0) {
                this.querySelector('[data-category="all"]').classList.add('active');
            }
        }
        
        currentPage = 1;
        filterAndRenderProjects();
    });
    
    // Technology Filters
    document.getElementById('technologyFilters').addEventListener('click', function(e) {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        
        const tech = chip.dataset.technology;
        chip.classList.toggle('active');
        
        if (chip.classList.contains('active')) {
            activeFilters.technologies.push(tech);
        } else {
            activeFilters.technologies = activeFilters.technologies.filter(t => t !== tech);
        }
        
        currentPage = 1;
        filterAndRenderProjects();
    });
    
    // Difficulty Filters
    document.getElementById('difficultyFilters').addEventListener('click', function(e) {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        
        const difficulty = chip.dataset.difficulty;
        chip.classList.toggle('active');
        
        if (chip.classList.contains('active')) {
            activeFilters.difficulties.push(difficulty);
        } else {
            activeFilters.difficulties = activeFilters.difficulties.filter(d => d !== difficulty);
        }
        
        currentPage = 1;
        filterAndRenderProjects();
    });
    
    // Clear Filters
    document.getElementById('clearFilters').addEventListener('click', function() {
        activeFilters = { categories: [], technologies: [], difficulties: [] };
        document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
        document.querySelector('[data-category="all"]').classList.add('active');
        currentPage = 1;
        filterAndRenderProjects();
    });
    
    // Sort
    document.getElementById('sortSelect').addEventListener('change', function(e) {
        currentSort = e.target.value;
        currentPage = 1;
        filterAndRenderProjects();
    });
    
    // View Toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            renderProjects();
        });
    });
    
    // Load More
    document.getElementById('loadMoreBtn').addEventListener('click', function() {
        loadMoreProjects();
    });
}

// Filter and Render
function filterAndRenderProjects() {
    filteredProjects = projectsData.filter(project => {
        // Search filter
        if (searchQuery) {
            const searchLower = searchQuery;
            const matchesSearch = 
                project.title.toLowerCase().includes(searchLower) ||
                project.description.toLowerCase().includes(searchLower) ||
                project.contributor.toLowerCase().includes(searchLower) ||
                project.technologies.some(tech => tech.toLowerCase().includes(searchLower));
            
            if (!matchesSearch) return false;
        }
        
        // Category filter
        if (activeFilters.categories.length > 0) {
            if (!activeFilters.categories.includes(project.category)) return false;
        }
        
        // Technology filter
        if (activeFilters.technologies.length > 0) {
            const hasMatchingTech = activeFilters.technologies.some(tech => 
                project.technologies.includes(tech)
            );
            if (!hasMatchingTech) return false;
        }
        
        // Difficulty filter
        if (activeFilters.difficulties.length > 0) {
            if (!activeFilters.difficulties.includes(project.difficulty)) return false;
        }
        
        return true;
    });
    
    // Sort
    sortProjects();
    
    // Update UI
    updateActiveFiltersCount();
    updateSearchResultsCount();
    renderProjects();
}

// Sort Projects
function sortProjects() {
    switch (currentSort) {
        case 'newest':
            filteredProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredProjects.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'popular':
            filteredProjects.sort((a, b) => b.views - a.views);
            break;
        case 'trending':
            filteredProjects.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
            break;
        case 'favorites':
            filteredProjects.sort((a, b) => b.favorites - a.favorites);
            break;
        case 'alphabetical':
            filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'reverse-alphabetical':
            filteredProjects.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
}

// Render Projects
function renderProjects() {
    const grid = document.getElementById('galleryGrid');
    const noResults = document.getElementById('noResults');
    
    if (filteredProjects.length === 0) {
        grid.innerHTML = '';
        noResults.classList.add('visible');
        document.getElementById('loadMoreContainer').style.display = 'none';
        return;
    }
    
    noResults.classList.remove('visible');
    
    // Apply view class
    grid.className = `gallery-grid ${currentView}`;
    
    // Paginate
    const startIndex = 0;
    const endIndex = currentPage * projectsPerPage;
    const projectsToShow = filteredProjects.slice(startIndex, endIndex);
    
    grid.innerHTML = projectsToShow.map((project, index) => {
        const isFavorited = favorites.includes(project.id);
        const listViewClass = currentView === 'list' ? 'list-view' : '';
        
        return `
            <div class="project-card ${listViewClass}" style="animation-delay: ${index * 0.1}s" data-project-id="${project.id}">
                <div class="project-image">
                    <button class="favorite-badge ${isFavorited ? 'active' : ''}" onclick="toggleFavorite(${project.id}, event)">
                        <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <div class="difficulty-badge ${project.difficulty}">${project.difficulty}</div>
                    <img src="${project.image}" alt="${project.title}">
                    <div class="project-overlay">
                        <button class="overlay-btn" onclick="showProjectModal(${project.id})">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="overlay-btn" onclick="window.open('${project.liveDemo}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> Live Demo
                        </button>
                    </div>
                </div>
                <div class="project-content">
                    <div class="project-header">
                        <h3 class="project-title">${project.title}</h3>
                    </div>
                    <div class="project-contributor">
                        <div class="contributor-avatar">${project.contributorInitials}</div>
                        <span>${project.contributor}</span>
                    </div>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech-tags">
                        ${project.technologies.slice(0, 4).map(tech => 
                            `<span class="tech-tag">${tech}</span>`
                        ).join('')}
                    </div>
                    <div class="project-footer">
                        <div class="project-stats">
                            <div class="stat-item">
                                <i class="fas fa-eye"></i>
                                <span>${formatNumber(project.views)}</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-heart"></i>
                                <span>${formatNumber(project.favorites)}</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-calendar"></i>
                                <span>${formatDate(project.date)}</span>
                            </div>
                        </div>
                        <div class="project-actions">
                            <button class="action-btn" onclick="window.open('${project.sourceCode}', '_blank')" title="View Source">
                                <i class="fab fa-github"></i>
                            </button>
                            <button class="action-btn" onclick="window.open('${project.liveDemo}', '_blank')" title="Live Demo">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Show/Hide Load More button
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (endIndex >= filteredProjects.length) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'block';
    }
}

// Load More Projects
function loadMoreProjects() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    loadMoreBtn.style.display = 'none';
    loadingSpinner.classList.add('active');
    
    setTimeout(() => {
        currentPage++;
        renderProjects();
        loadingSpinner.classList.remove('active');
        loadMoreBtn.style.display = 'inline-flex';
    }, 500);
}

// Favorite Toggle
function toggleFavorite(projectId, event) {
    event.stopPropagation();
    
    if (favorites.includes(projectId)) {
        favorites = favorites.filter(id => id !== projectId);
    } else {
        favorites.push(projectId);
    }
    
    localStorage.setItem('projectFavorites', JSON.stringify(favorites));
    renderProjects();
    updateStats();
}

// Show Project Modal
function showProjectModal(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('projectModal');
    const isFavorited = favorites.includes(projectId);
    
    // Update modal content
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalAuthor').innerHTML = `
        <div class="contributor-avatar">${project.contributorInitials}</div>
        <span>by ${project.contributor}</span>
    `;
    
    // Favorite button
    const favBtn = document.getElementById('modalFavoriteBtn');
    favBtn.className = `favorite-btn-large ${isFavorited ? 'active' : ''}`;
    favBtn.innerHTML = `<i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>`;
    favBtn.onclick = () => {
        toggleFavorite(projectId, new Event('click'));
        favBtn.classList.toggle('active');
        favBtn.innerHTML = `<i class="${favBtn.classList.contains('active') ? 'fas' : 'far'} fa-heart"></i>`;
    };
    
    // Screenshots
    const mainScreenshot = document.getElementById('mainScreenshot');
    mainScreenshot.innerHTML = `<img src="${project.screenshots[0]}" alt="${project.title}">`;
    
    const thumbnails = document.getElementById('screenshotThumbnails');
    if (project.screenshots.length > 1) {
        thumbnails.innerHTML = project.screenshots.map((screenshot, index) => `
            <div class="screenshot-thumb ${index === 0 ? 'active' : ''}" onclick="changeScreenshot('${screenshot}', this)">
                <img src="${screenshot}" alt="Screenshot ${index + 1}">
            </div>
        `).join('');
    } else {
        thumbnails.innerHTML = '';
    }
    
    // Description
    document.getElementById('modalDescription').textContent = project.description;
    
    // Meta data
    document.getElementById('modalDate').textContent = formatDate(project.date);
    document.getElementById('modalDifficulty').textContent = project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1);
    document.getElementById('modalViews').textContent = formatNumber(project.views);
    document.getElementById('modalFavorites').textContent = formatNumber(project.favorites);
    
    // Tech stack
    document.getElementById('modalTechStack').innerHTML = project.technologies.map(tech => 
        `<span class="tech-badge">${tech}</span>`
    ).join('');
    
    // Features
    document.getElementById('modalFeatures').innerHTML = project.features.map(feature => 
        `<li>${feature}</li>`
    ).join('');
    
    // Action buttons
    document.getElementById('modalLiveDemo').onclick = () => window.open(project.liveDemo, '_blank');
    document.getElementById('modalViewSource').onclick = () => window.open(project.sourceCode, '_blank');
    
    // Show modal
    modal.classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('projectModal').classList.remove('active');
}

// Change Screenshot
function changeScreenshot(src, element) {
    document.getElementById('mainScreenshot').innerHTML = `<img src="${src}" alt="Screenshot">`;
    document.querySelectorAll('.screenshot-thumb').forEach(thumb => thumb.classList.remove('active'));
    element.classList.add('active');
}

// Share Project
function shareProject() {
    const project = projectsData.find(p => p.id === currentProjectId);
    if (!project) return;
    
    if (navigator.share) {
        navigator.share({
            title: project.title,
            text: project.description,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// Update Stats
function updateStats() {
    document.getElementById('totalProjects').textContent = projectsData.length;
    document.getElementById('totalContributors').textContent = new Set(projectsData.map(p => p.contributor)).size;
    document.getElementById('totalFavorites').textContent = favorites.length;
}

// Update Active Filters Count
function updateActiveFiltersCount() {
    const count = activeFilters.categories.length + activeFilters.technologies.length + activeFilters.difficulties.length;
    const element = document.getElementById('activeFiltersCount');
    
    if (count > 0) {
        element.textContent = `${count} filter${count > 1 ? 's' : ''} active`;
        element.style.display = 'inline';
    } else {
        element.style.display = 'none';
    }
}

// Update Search Results Count
function updateSearchResultsCount() {
    const element = document.getElementById('searchResultsCount');
    
    if (searchQuery) {
        element.textContent = `${filteredProjects.length} result${filteredProjects.length !== 1 ? 's' : ''}`;
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('projectModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Infinite Scroll (optional - can be enabled)
let infiniteScrollEnabled = false;

if (infiniteScrollEnabled) {
    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn.style.display !== 'none' && currentPage * projectsPerPage < filteredProjects.length) {
                loadMoreProjects();
            }
        }
    });
}
