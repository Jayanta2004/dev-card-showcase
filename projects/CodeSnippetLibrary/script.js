// DevSnippet - Personal Developer Knowledge Base

// Application State
const appState = {
    snippets: [],
    filteredSnippets: [],
    tags: [],
    currentSearch: '',
    currentLanguageFilter: 'all',
    currentCategoryFilter: 'all',
    currentSort: 'newest',
    currentView: 'grid',
    theme: 'light',
    selectedTags: []
};

// DOM Elements
const themeToggle = document.getElementById('toggle-theme');
const totalSnippetsEl = document.getElementById('total-snippets');
const totalTagsEl = document.getElementById('total-tags');
const addSnippetBtn = document.getElementById('add-snippet-btn');
const addFirstSnippetBtn = document.getElementById('add-first-snippet');
const newSnippetModal = document.getElementById('new-snippet-modal');
const closeNewSnippetModal = document.getElementById('close-new-snippet-modal');
const cancelNewSnippetBtn = document.getElementById('cancel-new-snippet');
const createSnippetBtn = document.getElementById('save-snippet');
const snippetsContainer = document.getElementById('snippets-container');
const snippetsCountEl = document.getElementById('snippets-count');
const emptyState = document.getElementById('empty-state');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const clearFiltersBtn = document.getElementById('clear-filters');
const clearSearchFiltersBtn = document.getElementById('clear-search-filters');
const filterLanguage = document.getElementById('filter-language');
const filterCategory = document.getElementById('filter-category');
const filterSort = document.getElementById('filter-sort');
const tagsCloud = document.getElementById('tags-cloud');
const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');
const viewSnippetModal = document.getElementById('view-snippet-modal');
const closeViewSnippetModal = document.getElementById('close-view-snippet-modal');
const footerTotalSnippets = document.getElementById('footer-total-snippets');
const footerTotalLanguages = document.getElementById('footer-total-languages');
const footerTotalTags = document.getElementById('footer-total-tags');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Modal Form Elements
const snippetTitleInput = document.getElementById('snippet-title');
const snippetDescriptionInput = document.getElementById('snippet-description');
const snippetLanguageSelect = document.getElementById('snippet-language');
const snippetCodeInput = document.getElementById('snippet-code');
const codeLanguageDisplay = document.getElementById('code-language-display');
const codePreview = document.getElementById('code-preview');
const tagsContainer = document.getElementById('tags-container');
const tagInput = document.getElementById('tag-input');
const suggestedTags = document.querySelectorAll('.tag-suggestion');
const categoryOptions = document.querySelectorAll('.category-option');
const snippetCategoryInput = document.getElementById('snippet-category');

// View Snippet Modal Elements
const viewSnippetTitle = document.getElementById('view-snippet-title');
const viewSnippetDescription = document.getElementById('view-snippet-description');
const viewSnippetLanguage = document.getElementById('view-snippet-language');
const viewSnippetCategory = document.getElementById('view-snippet-category');
const viewSnippetDate = document.getElementById('view-snippet-date');
const viewSnippetTags = document.getElementById('view-snippet-tags');
const viewCodeDisplay = document.getElementById('view-code-display');
const copySnippetCodeBtn = document.getElementById('copy-snippet-code');
const editSnippetBtn = document.getElementById('edit-snippet');

// Initialize the application
function init() {
    // Load data from localStorage
    loadAppData();
    
    // Initialize event listeners
    setupEventListeners();
    
    // Initialize UI
    updateStats();
    renderTagsCloud();
    renderSnippets();
    
    // Setup Prism for syntax highlighting
    setupPrism();
}

// Load application data from localStorage
function loadAppData() {
    // Load theme preference
    const savedTheme = localStorage.getItem('devSnippetTheme');
    if (savedTheme === 'dark') {
        enableDarkTheme();
    }
    
    // Load snippets
    const savedSnippets = localStorage.getItem('devSnippetData');
    if (savedSnippets) {
        appState.snippets = JSON.parse(savedSnippets);
    } else {
        // Initialize with sample snippets
        initializeSampleSnippets();
    }
    
    // Extract tags from snippets
    extractTagsFromSnippets();
    
    // Initialize filtered snippets
    appState.filteredSnippets = [...appState.snippets];
}

// Initialize with sample snippets
function initializeSampleSnippets() {
    const sampleSnippets = [
        {
            id: 'snippet-1',
            title: 'Center Div with Flexbox',
            description: 'Perfectly center a div both vertically and horizontally using Flexbox',
            language: 'css',
            code: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}`,
            tags: ['css', 'flexbox', 'centering', 'frontend'],
            category: 'frontend',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usedCount: 0
        },
        {
            id: 'snippet-2',
            title: 'Array Operations in JavaScript',
            description: 'Common array operations: map, filter, reduce with examples',
            language: 'javascript',
            code: 'const numbers = [1, 2, 3, 4, 5];\n\n// Map: Transform each element\nconst doubled = numbers.map(n => n * 2);\n\n// Filter: Keep elements that pass test\nconst even = numbers.filter(n => n % 2 === 0);\n\n// Reduce: Accumulate values\nconst sum = numbers.reduce((acc, n) => acc + n, 0);\n\nconsole.log({ doubled, even, sum });',
            tags: ['javascript', 'arrays', 'functional', 'frontend'],
            category: 'frontend',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usedCount: 0
        },
        {
            id: 'snippet-3',
            title: 'Git Undo Last Commit',
            description: 'Undo the last commit without losing changes',
            language: 'bash',
            code: '# Undo last commit but keep changes\n$ git reset --soft HEAD~1\n\n# Undo last commit and discard changes\n$ git reset --hard HEAD~1\n\n# Alternative: Create new commit that undoes changes\n$ git revert HEAD',
            tags: ['git', 'version-control', 'tools'],
            category: 'tools',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usedCount: 0
        },
        {
            id: 'snippet-4',
            title: 'Docker Compose for Node.js App',
            description: 'Complete docker-compose.yml for Node.js with MongoDB',
            language: 'yaml',
            code: 'version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n      - MONGO_URI=mongodb://mongo:27017/myapp\n    depends_on:\n      - mongo\n    volumes:\n      - ./app:/usr/src/app\n      - /usr/src/app/node_modules\n\n  mongo:\n    image: mongo:latest\n    ports:\n      - "27017:27017"\n    volumes:\n      - mongo-data:/data/db\n\nvolumes:\n  mongo-data:',
            tags: ['docker', 'nodejs', 'mongodb', 'devops'],
            category: 'devops',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usedCount: 0
        },
        {
            id: 'snippet-5',
            title: 'SQL Common Table Expressions',
            description: 'Using CTEs for complex SQL queries',
            language: 'sql',
            code: '-- Common Table Expression example\nWITH RECURSIVE cte AS (\n  -- Anchor member\n  SELECT 1 AS n\n  UNION ALL\n  -- Recursive member\n  SELECT n + 1 FROM cte WHERE n < 10\n)\nSELECT * FROM cte;\n\n-- CTE for data transformation\nWITH monthly_sales AS (\n  SELECT \n    DATE_TRUNC(\'month\', order_date) AS month,\n    SUM(amount) AS total_sales\n  FROM orders\n  GROUP BY DATE_TRUNC(\'month\', order_date)\n)\nSELECT \n  month,\n  total_sales,\n  LAG(total_sales) OVER (ORDER BY month) AS prev_month_sales\nFROM monthly_sales;',
            tags: ['sql', 'database', 'cte', 'postgresql'],
            category: 'database',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usedCount: 0
        },
        {
            id: 'snippet-6',
            title: 'Python Flask REST API',
            description: 'Basic Flask REST API structure with error handling',
            language: 'python',
            code: 'from flask import Flask, request, jsonify\nfrom flask_sqlalchemy import SQLAlchemy\nfrom flask_marshmallow import Marshmallow\nimport os\n\napp = Flask(__name__)\nbasedir = os.path.abspath(os.path.dirname(__file__))\napp.config[\'SQLALCHEMY_DATABASE_URI\'] = \'sqlite:///\' + os.path.join(basedir, \'db.sqlite\')\napp.config[\'SQLALCHEMY_TRACK_MODIFICATIONS\'] = False\n\ndb = SQLAlchemy(app)\nma = Marshmallow(app)\n\n# Model\nclass Product(db.Model):\n    id = db.Column(db.Integer, primary_key=True)\n    name = db.Column(db.String(100), unique=True)\n    price = db.Column(db.Float)\n\n    def __init__(self, name, price):\n        self.name = name\n        self.price = price\n\n# Schema\nclass ProductSchema(ma.Schema):\n    class Meta:\n        fields = (\'id\', \'name\', \'price\')\n\nproduct_schema = ProductSchema()\nproducts_schema = ProductSchema(many=True)\n\n@app.route(\'/product\', methods=[\'POST\'])\ndef add_product():\n    name = request.json[\'name\']\n    price = request.json[\'price\']\n    \n    new_product = Product(name, price)\n    db.session.add(new_product)\n    db.session.commit()\n    \n    return product_schema.jsonify(new_product)\n\nif __name__ == \'__main__\':\n    app.run(debug=True)',
            tags: ['python', 'flask', 'rest-api', 'backend'],
            category: 'backend',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usedCount: 0
        }
    ];
    
    appState.snippets = sampleSnippets;
    saveAppData();
}

// Extract tags from snippets
function extractTagsFromSnippets() {
    const allTags = new Set();
    
    appState.snippets.forEach(snippet => {
        snippet.tags.forEach(tag => {
            allTags.add(tag.toLowerCase());
        });
    });
    
    appState.tags = Array.from(allTags);
}

// Save application data to localStorage
function saveAppData() {
    localStorage.setItem('devSnippetTheme', appState.theme);
    localStorage.setItem('devSnippetData', JSON.stringify(appState.snippets));
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add snippet buttons
    addSnippetBtn.addEventListener('click', () => openNewSnippetModal());
    addFirstSnippetBtn.addEventListener('click', () => openNewSnippetModal());
    
    // Modal management
    closeNewSnippetModal.addEventListener('click', () => newSnippetModal.style.display = 'none');
    cancelNewSnippetBtn.addEventListener('click', () => newSnippetModal.style.display = 'none');
    createSnippetBtn.addEventListener('click', saveNewSnippet);
    
    closeViewSnippetModal.addEventListener('click', () => viewSnippetModal.style.display = 'none');
    
    // Search and filters
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    clearFiltersBtn.addEventListener('click', clearAllFilters);
    clearSearchFiltersBtn.addEventListener('click', clearAllFilters);
    
    filterLanguage.addEventListener('change', handleFilterChange);
    filterCategory.addEventListener('change', handleFilterChange);
    filterSort.addEventListener('change', handleFilterChange);
    
    // View toggles
    viewGridBtn.addEventListener('click', () => switchView('grid'));
    viewListBtn.addEventListener('click', () => switchView('list'));
    
    // Form interactions
    snippetLanguageSelect.addEventListener('change', updateCodeLanguageDisplay);
    snippetCodeInput.addEventListener('input', updateCodePreview);
    tagInput.addEventListener('keypress', handleTagInput);
    
    // Suggested tags
    suggestedTags.forEach(tag => {
        tag.addEventListener('click', () => addTagToInput(tag.getAttribute('data-tag')));
    });
    
    // Category options
    categoryOptions.forEach(option => {
        option.addEventListener('click', () => {
            categoryOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            snippetCategoryInput.value = option.getAttribute('data-category');
        });
    });
    
    // Code formatting
    document.getElementById('format-code').addEventListener('click', formatCode);
    
    // Copy code button
    copySnippetCodeBtn.addEventListener('click', copySnippetCode);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === newSnippetModal) {
            newSnippetModal.style.display = 'none';
        }
        if (e.target === viewSnippetModal) {
            viewSnippetModal.style.display = 'none';
        }
    });
    
    // Data management
    document.getElementById('import-snippets').addEventListener('click', importSnippets);
    document.getElementById('export-snippets').addEventListener('click', exportSnippets);
    document.getElementById('backup-data').addEventListener('click', exportSnippets);
    document.getElementById('restore-data').addEventListener('click', importSnippets);
    document.getElementById('reset-data').addEventListener('click', resetData);
    
    // Cheatsheets toggle
    document.getElementById('toggle-cheatsheets').addEventListener('click', toggleCheatsheets);
    document.getElementById('view-cheatsheets').addEventListener('click', toggleCheatsheets);
}

// Theme management
function toggleTheme() {
    if (appState.theme === 'light') {
        enableDarkTheme();
    } else {
        enableLightTheme();
    }
    saveAppData();
}

function enableDarkTheme() {
    document.body.classList.add('dark-theme');
    appState.theme = 'dark';
    themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
}

function enableLightTheme() {
    document.body.classList.remove('dark-theme');
    appState.theme = 'light';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
}

// Update statistics
function updateStats() {
    const totalSnippets = appState.snippets.length;
    const totalTags = appState.tags.length;
    
    // Count unique languages
    const languages = new Set(appState.snippets.map(s => s.language));
    const totalLanguages = languages.size;
    
    totalSnippetsEl.textContent = totalSnippets;
    totalTagsEl.textContent = totalTags;
    footerTotalSnippets.textContent = totalSnippets;
    footerTotalLanguages.textContent = totalLanguages;
    footerTotalTags.textContent = totalTags;
}

// Render tags cloud
function renderTagsCloud() {
    // Count tag frequency
    const tagCounts = {};
    appState.snippets.forEach(snippet => {
        snippet.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    
    // Sort tags by frequency
    const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20); // Show top 20 tags
    
    tagsCloud.innerHTML = '';
    
    sortedTags.forEach(([tag, count]) => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-cloud-item';
        if (appState.selectedTags.includes(tag)) {
            tagElement.classList.add('active');
        }
        
        tagElement.innerHTML = `
            <span>${tag}</span>
            <span class="tag-count">${count}</span>
        `;
        
        tagElement.addEventListener('click', () => toggleTagFilter(tag));
        tagsCloud.appendChild(tagElement);
    });
}

function toggleTagFilter(tag) {
    const index = appState.selectedTags.indexOf(tag);
    if (index === -1) {
        appState.selectedTags.push(tag);
    } else {
        appState.selectedTags.splice(index, 1);
    }
    
    renderTagsCloud();
    filterSnippets();
}

// Render snippets
function renderSnippets() {
    const snippetsToRender = appState.filteredSnippets.length > 0 ? appState.filteredSnippets : appState.snippets;
    
    // Show/hide empty states
    if (appState.snippets.length === 0) {
        emptyState.style.display = 'flex';
        noResults.style.display = 'none';
        snippetsContainer.innerHTML = '';
        return;
    }
    
    if (snippetsToRender.length === 0) {
        emptyState.style.display = 'none';
        noResults.style.display = 'flex';
        snippetsContainer.innerHTML = '';
        return;
    }
    
    emptyState.style.display = 'none';
    noResults.style.display = 'none';
    
    // Update count
    snippetsCountEl.textContent = `Snippets (${snippetsToRender.length})`;
    
    // Clear container
    snippetsContainer.innerHTML = '';
    
    // Apply view mode class
    snippetsContainer.className = `snippets-container ${appState.currentView}-view`;
    
    // Render each snippet
    snippetsToRender.forEach(snippet => {
        const snippetElement = createSnippetElement(snippet);
        snippetsContainer.appendChild(snippetElement);
    });
}

function createSnippetElement(snippet) {
    const element = document.createElement('div');
    element.className = `snippet-card ${appState.currentView}-view`;
    element.setAttribute('data-id', snippet.id);
    
    // Format date
    const createdDate = new Date(snippet.createdAt);
    const formattedDate = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: createdDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
    
    // Truncate code for preview
    const codePreview = snippet.code.length > 150 ? snippet.code.substring(0, 150) + '...' : snippet.code;
    
    element.innerHTML = `
        <div class="snippet-header">
            <div class="snippet-title">${snippet.title}</div>
            <div class="snippet-description">${snippet.description || 'No description'}</div>
            <div class="snippet-meta">
                <div class="snippet-language">
                    <i class="fas fa-code"></i>
                    <span>${snippet.language}</span>
                </div>
                <div class="snippet-date">
                    <i class="far fa-calendar"></i>
                    <span>${formattedDate}</span>
                </div>
            </div>
        </div>
        <div class="snippet-body">
            <pre><code class="language-${snippet.language}">${escapeHtml(codePreview)}</code></pre>
        </div>
        <div class="snippet-footer">
            <div class="snippet-tags">
                ${snippet.tags.map(tag => `
                    <span class="snippet-tag" data-tag="${tag}">${tag}</span>
                `).join('')}
            </div>
            <div class="snippet-actions">
                <button class="snippet-action-btn copy" title="Copy code">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="snippet-action-btn view" title="View details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="snippet-action-btn delete" title="Delete snippet">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const copyBtn = element.querySelector('.snippet-action-btn.copy');
    const viewBtn = element.querySelector('.snippet-action-btn.view');
    const deleteBtn = element.querySelector('.snippet-action-btn.delete');
    const tagElements = element.querySelectorAll('.snippet-tag');
    
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(snippet.code);
        showToast('Code copied to clipboard!');
    });
    
    viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewSnippet(snippet.id);
    });
    
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSnippet(snippet.id);
    });
    
    tagElements.forEach(tagEl => {
        tagEl.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTagFilter(tagEl.getAttribute('data-tag'));
        });
    });
    
    // Click on snippet card to view
    element.addEventListener('click', () => {
        viewSnippet(snippet.id);
    });
    
    return element;
}

// Search and filter handling
function handleSearch() {
    appState.currentSearch = searchInput.value.toLowerCase();
    filterSnippets();
}

function clearSearch() {
    searchInput.value = '';
    appState.currentSearch = '';
    filterSnippets();
}

function handleFilterChange() {
    appState.currentLanguageFilter = filterLanguage.value;
    appState.currentCategoryFilter = filterCategory.value;
    appState.currentSort = filterSort.value;
    filterSnippets();
}

function clearAllFilters() {
    searchInput.value = '';
    filterLanguage.value = 'all';
    filterCategory.value = 'all';
    filterSort.value = 'newest';
    appState.currentSearch = '';
    appState.currentLanguageFilter = 'all';
    appState.currentCategoryFilter = 'all';
    appState.currentSort = 'newest';
    appState.selectedTags = [];
    
    renderTagsCloud();
    filterSnippets();
}

function filterSnippets() {
    let filtered = [...appState.snippets];
    
    // Apply search filter
    if (appState.currentSearch) {
        filtered = filtered.filter(snippet => {
            const searchLower = appState.currentSearch.toLowerCase();
            return snippet.title.toLowerCase().includes(searchLower) ||
                   snippet.description.toLowerCase().includes(searchLower) ||
                   snippet.code.toLowerCase().includes(searchLower) ||
                   snippet.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                   snippet.language.toLowerCase().includes(searchLower);
        });
    }
    
    // Apply language filter
    if (appState.currentLanguageFilter !== 'all') {
        filtered = filtered.filter(snippet => snippet.language === appState.currentLanguageFilter);
    }
    
    // Apply category filter
    if (appState.currentCategoryFilter !== 'all') {
        filtered = filtered.filter(snippet => snippet.category === appState.currentCategoryFilter);
    }
    
    // Apply tag filters
    if (appState.selectedTags.length > 0) {
        filtered = filtered.filter(snippet => {
            return appState.selectedTags.every(tag => snippet.tags.includes(tag));
        });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (appState.currentSort) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'most-used':
                return b.usedCount - a.usedCount;
            default:
                return 0;
        }
    });
    
    appState.filteredSnippets = filtered;
    renderSnippets();
}

// View switching
function switchView(view) {
    appState.currentView = view;
    
    if (view === 'grid') {
        viewGridBtn.classList.add('active');
        viewListBtn.classList.remove('active');
    } else {
        viewGridBtn.classList.remove('active');
        viewListBtn.classList.add('active');
    }
    
    renderSnippets();
}

// New snippet modal
function openNewSnippetModal(editSnippetId = null) {
    // Reset form
    snippetTitleInput.value = '';
    snippetDescriptionInput.value = '';
    snippetLanguageSelect.value = 'javascript';
    snippetCodeInput.value = '// Enter your code here...';
    tagsContainer.innerHTML = '';
    tagInput.value = '';
    
    // Reset category selection
    categoryOptions.forEach(opt => opt.classList.remove('active'));
    categoryOptions[0].classList.add('active'); // Frontend is default
    snippetCategoryInput.value = 'frontend';
    
    // Update code language display
    updateCodeLanguageDisplay();
    updateCodePreview();
    
    // Show modal
    newSnippetModal.style.display = 'flex';
    
    // Focus on title input
    snippetTitleInput.focus();
}

function updateCodeLanguageDisplay() {
    const language = snippetLanguageSelect.value;
    codeLanguageDisplay.textContent = language;
    
    // Update code preview language class
    const codeElement = codePreview.querySelector('code');
    codeElement.className = `language-${language}`;
    updateCodePreview();
}

function updateCodePreview() {
    const code = snippetCodeInput.value;
    const language = snippetLanguageSelect.value;
    
    const codeElement = codePreview.querySelector('code');
    codeElement.textContent = code;
    codeElement.className = `language-${language}`;
    
    // Re-highlight with Prism
    Prism.highlightElement(codeElement);
}

function handleTagInput(e) {
    if (e.key === 'Enter' && tagInput.value.trim()) {
        addTag(tagInput.value.trim());
        tagInput.value = '';
        e.preventDefault();
    }
}

function addTag(tag) {
    const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
    
    // Check if tag already exists
    if (tagsContainer.querySelector(`[data-tag="${normalizedTag}"]`)) {
        return;
    }
    
    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.setAttribute('data-tag', normalizedTag);
    tagElement.innerHTML = `
        <span>${normalizedTag}</span>
        <button type="button" class="tag-remove">&times;</button>
    `;
    
    tagElement.querySelector('.tag-remove').addEventListener('click', () => {
        tagElement.remove();
    });
    
    tagsContainer.appendChild(tagElement);
}

function addTagToInput(tag) {
    if (!tagsContainer.querySelector(`[data-tag="${tag}"]`)) {
        addTag(tag);
    }
}

function formatCode() {
    const language = snippetLanguageSelect.value;
    let code = snippetCodeInput.value;
    
    // Simple formatting based on language
    switch (language) {
        case 'javascript':
        case 'typescript':
            // Basic JS formatting
            code = code
                .replace(/\s*{\s*/g, ' {\n  ')
                .replace(/;\s*/g, ';\n')
                .replace(/}\s*/g, '\n}\n')
                .replace(/\n\s*\n/g, '\n');
            break;
        case 'python':
            // Python is already formatted by indentation
            break;
        case 'css':
            // Basic CSS formatting
            code = code
                .replace(/\s*{\s*/g, ' {\n  ')
                .replace(/;\s*/g, ';\n')
                .replace(/}\s*/g, '\n}\n')
                .replace(/\n\s*\n/g, '\n');
            break;
    }
    
    snippetCodeInput.value = code;
    updateCodePreview();
}

function saveNewSnippet() {
    const title = snippetTitleInput.value.trim();
    const description = snippetDescriptionInput.value.trim();
    const language = snippetLanguageSelect.value;
    const code = snippetCodeInput.value.trim();
    const category = snippetCategoryInput.value;
    
    // Get tags from container
    const tagElements = tagsContainer.querySelectorAll('.tag');
    const tags = Array.from(tagElements).map(tag => tag.getAttribute('data-tag'));
    
    // Validation
    if (!title) {
        showToast('Please enter a title');
        snippetTitleInput.focus();
        return;
    }
    
    if (!code) {
        showToast('Please enter some code');
        snippetCodeInput.focus();
        return;
    }
    
    // Create new snippet
    const newSnippet = {
        id: 'snippet-' + Date.now(),
        title: title,
        description: description,
        language: language,
        code: code,
        tags: tags,
        category: category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usedCount: 0
    };
    
    // Add to snippets
    appState.snippets.unshift(newSnippet);
    
    // Update tags and save
    extractTagsFromSnippets();
    saveAppData();
    
    // Update UI
    updateStats();
    renderTagsCloud();
    filterSnippets();
    
    // Close modal and show success message
    newSnippetModal.style.display = 'none';
    showToast('Snippet saved successfully!');
}

// View snippet
function viewSnippet(snippetId) {
    const snippet = appState.snippets.find(s => s.id === snippetId);
    if (!snippet) return;
    
    // Increment used count
    snippet.usedCount = (snippet.usedCount || 0) + 1;
    saveAppData();
    
    // Format date
    const createdDate = new Date(snippet.createdAt);
    const formattedDate = createdDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update modal content
    viewSnippetTitle.textContent = snippet.title;
    
    if (snippet.description) {
        viewSnippetDescription.textContent = snippet.description;
        viewSnippetDescription.style.display = 'block';
    } else {
        viewSnippetDescription.style.display = 'none';
    }
    
    viewSnippetLanguage.innerHTML = `
        <i class="fas fa-code"></i>
        <span>${snippet.language}</span>
    `;
    
    viewSnippetCategory.innerHTML = `
        <i class="fas fa-folder"></i>
        <span>${snippet.category}</span>
    `;
    
    viewSnippetDate.innerHTML = `
        <i class="fas fa-calendar"></i>
        <span>${formattedDate}</span>
    `;
    
    // Update tags
    viewSnippetTags.innerHTML = '';
    snippet.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'snippet-tag';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => {
            toggleTagFilter(tag);
            viewSnippetModal.style.display = 'none';
        });
        viewSnippetTags.appendChild(tagElement);
    });
    
    // Update code display
    viewCodeDisplay.innerHTML = `
        <div class="code-display-header">
            <div class="code-display-language">${snippet.language}</div>
        </div>
        <div class="code-display-content">
            <pre><code class="language-${snippet.language}">${escapeHtml(snippet.code)}</code></pre>
        </div>
    `;
    
    // Re-highlight code with Prism
    const codeElement = viewCodeDisplay.querySelector('code');
    Prism.highlightElement(codeElement);
    
    // Update edit button
    editSnippetBtn.onclick = () => {
        // In a real implementation, this would open edit mode
        viewSnippetModal.style.display = 'none';
        showToast('Edit feature coming soon!');
    };
    
    // Update copy button
    copySnippetCodeBtn.onclick = () => {
        copyToClipboard(snippet.code);
        showToast('Code copied to clipboard!');
    };
    
    // Show modal
    viewSnippetModal.style.display = 'flex';
}

// Delete snippet
function deleteSnippet(snippetId) {
    if (!confirm('Are you sure you want to delete this snippet?')) {
        return;
    }
    
    const index = appState.snippets.findIndex(s => s.id === snippetId);
    if (index !== -1) {
        appState.snippets.splice(index, 1);
        
        // Update tags and save
        extractTagsFromSnippets();
        saveAppData();
        
        // Update UI
        updateStats();
        renderTagsCloud();
        filterSnippets();
        
        showToast('Snippet deleted');
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function copySnippetCode() {
    const codeElement = viewCodeDisplay.querySelector('code');
    if (codeElement) {
        copyToClipboard(codeElement.textContent);
        showToast('Code copied to clipboard!');
    }
}

// Data management
function exportSnippets() {
    const data = {
        snippets: appState.snippets,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devsnippet-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully');
}

function importSnippets() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (!data.snippets || !Array.isArray(data.snippets)) {
                    throw new Error('Invalid backup file format');
                }
                
                if (confirm('This will replace all current snippets. Are you sure?')) {
                    appState.snippets = data.snippets;
                    extractTagsFromSnippets();
                    
                    saveAppData();
                    updateStats();
                    renderTagsCloud();
                    filterSnippets();
                    
                    showToast('Data imported successfully');
                }
            } catch (error) {
                console.error('Import error:', error);
                showToast('Error importing data: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetData() {
    if (confirm('This will permanently delete all snippets and restore sample data. Are you sure?')) {
        initializeSampleSnippets();
        extractTagsFromSnippets();
        
        saveAppData();
        updateStats();
        renderTagsCloud();
        filterSnippets();
        
        showToast('Reset to sample data');
    }
}

// Cheatsheets
function toggleCheatsheets() {
    const container = document.getElementById('cheatsheets-container');
    const toggleBtn = document.getElementById('toggle-cheatsheets');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide';
        // Scroll to the cheatsheets section
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        container.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show';
    }
}

// Setup Prism
function setupPrism() {
    // Additional language support
    Prism.languages.insertBefore('javascript', 'keyword', {
        'property': /\b\w+(?=\s*:)/
    });
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);