document.addEventListener('DOMContentLoaded', function() {
    console.log('Projects page loaded');
    loadProjects();
    setupEventListeners();
});

let projectsData = [];
let currentView = 'grid'; // 'grid' or 'list'

async function loadProjects() {
    try {
        // Fetch projects from the JSON file
        const response = await fetch('./projects.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        projectsData = await response.json();
        console.log(`Loaded ${projectsData.length} projects`);
        
        displayProjects(projectsData);
        populateContributorFilter(projectsData);
        
        // Remove loading indicator
        const loadingEl = document.querySelector('.loading');
        if (loadingEl) loadingEl.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading projects:', error);
        
        // Show error message in container
        const container = document.getElementById('projectsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff6b6b;">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <p style="margin-top: 20px; font-size: 1.1rem;">Error loading projects: ${error.message}</p>
                    <p style="margin-top: 10px; color: var(--text-secondary);">Please check if projects.json exists in the correct location.</p>
                </div>
            `;
        }
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = '<div class="no-projects" style="grid-column: 1/-1; text-align: center; padding: 40px;">No projects found matching your criteria</div>';
        return;
    }
    
    let html = '';
    projects.forEach((project, index) => {
        // Generate a unique ID if not present
        const projectId = project.id || `project-${index}`;
        
        // Convert tags array to technologies array for compatibility
        const technologies = project.tags || project.technologies || [];
        
        html += `
            <div class="project-card ${currentView}" data-id="${projectId}" data-index="${index}">
                <div class="project-header">
                    <h3>${project.title}</h3>
                    <span class="contributor-badge">${project.author?.name || project.contributor || 'Anonymous'}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${technologies.slice(0, 5).map(tech => 
                        `<span class="tech-tag ${tech.toLowerCase().replace(/\s+/g, '-')}">${tech}</span>`
                    ).join('')}
                    ${technologies.length > 5 ? `<span class="tech-tag">+${technologies.length - 5}</span>` : ''}
                </div>
                <div class="project-links">
                    ${project.links?.live ? 
                        `<a href="${project.links.live}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                            <i class="fas fa-external-link-alt"></i> Live
                        </a>` : ''}
                    ${project.author?.github ? 
                        `<a href="${project.author.github}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                            <i class="fab fa-github"></i> GitHub
                        </a>` : ''}
                    ${project.links?.code || project.githubUrl ? 
                        `<a href="${project.links?.code || project.githubUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                            <i class="fab fa-github"></i> Code
                        </a>` : ''}
                    ${project.previewUrl ? 
                        `<a href="${project.previewUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                            <i class="fas fa-eye"></i> Preview
                        </a>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add click handlers for project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't open modal if clicking on links
            if (e.target.tagName === 'A' || e.target.closest('a')) return;
            
            const index = this.dataset.index;
            if (index !== undefined) {
                const project = projectsData[index];
                if (project) {
                    showProjectModal(project);
                }
            }
        });
    });
}

function showProjectModal(project) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    const technologies = project.tags || project.technologies || [];
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: var(--bg-primary);
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        ">
            <button class="modal-close" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-secondary);
                padding: 5px;
                line-height: 1;
            ">&times;</button>
            
            <h2 style="margin-bottom: 15px; color: var(--text-primary);">${project.title}</h2>
            
            <p style="margin-bottom: 20px; line-height: 1.6; color: var(--text-secondary);">${project.description}</p>
            
            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-primary);">Technologies:</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                    ${technologies.map(tech => 
                        `<span style="
                            background: var(--bg-secondary);
                            padding: 5px 12px;
                            border-radius: 20px;
                            font-size: 0.9rem;
                            color: var(--text-secondary);
                            border: 1px solid var(--border-color);
                        ">${tech}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <strong style="color: var(--text-primary);">Contributor:</strong>
                <div style="margin-top: 5px;">
                    <span style="color: var(--text-secondary);">${project.author?.name || project.contributor || 'Anonymous'}</span>
                    ${project.author?.github ? 
                        `<a href="${project.author.github}" target="_blank" style="margin-left: 10px; color: var(--accent-color);">
                            <i class="fab fa-github"></i> GitHub
                        </a>` : ''}
                </div>
            </div>
            
            <div class="modal-links" style="display: flex; gap: 15px; margin-top: 25px;">
                ${project.links?.live ? 
                    `<a href="${project.links.live}" target="_blank" class="btn-primary" style="
                        background: var(--accent-color);
                        color: white;
                        padding: 10px 20px;
                        border-radius: 8px;
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    "><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                ${project.author?.github ? 
                    `<a href="${project.author.github}" target="_blank" class="btn-secondary" style="
                        background: var(--bg-secondary);
                        color: var(--text-primary);
                        padding: 10px 20px;
                        border-radius: 8px;
                        text-decoration: none;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        border: 1px solid var(--border-color);
                    "><i class="fab fa-github"></i> Profile</a>` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal functionality
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Close on Escape key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function populateContributorFilter(projects) {
    const select = document.getElementById('contributorFilter');
    if (!select) return;
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Get unique contributors
    const contributors = [...new Set(projects.map(p => 
        p.author?.name || p.contributor || 'Anonymous'
    ))];
    
    contributors.sort().forEach(contributor => {
        const option = document.createElement('option');
        option.value = contributor;
        option.textContent = contributor;
        select.appendChild(option);
    });
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterProjects);
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProjects();
        });
    });
    
    // Contributor filter
    const contributorFilter = document.getElementById('contributorFilter');
    if (contributorFilter) {
        contributorFilter.addEventListener('change', filterProjects);
    }
    
    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', filterProjects);
    }
    
    // View toggle
    const viewToggle = document.getElementById('viewToggleBtn');
    if (viewToggle) {
        viewToggle.addEventListener('click', toggleView);
    }
}

function filterProjects() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const activeTech = document.querySelector('.filter-btn.active')?.dataset.tech || 'all';
    const selectedContributor = document.getElementById('contributorFilter')?.value || '';
    const sortOrder = document.getElementById('sortSelect')?.value || 'az';
    
    let filtered = projectsData.filter(project => {
        // Get searchable fields
        const title = project.title?.toLowerCase() || '';
        const description = project.description?.toLowerCase() || '';
        const contributor = (project.author?.name || project.contributor || 'Anonymous').toLowerCase();
        const technologies = project.tags || project.technologies || [];
        
        // Search filter
        const matchesSearch = 
            title.includes(searchTerm) ||
            description.includes(searchTerm) ||
            contributor.includes(searchTerm) ||
            technologies.some(tech => tech.toLowerCase().includes(searchTerm));
        
        // Tech filter
        const matchesTech = activeTech === 'all' || 
            technologies.some(tech => tech.toLowerCase() === activeTech.toLowerCase());
        
        // Contributor filter
        const matchesContributor = !selectedContributor || 
            (project.author?.name || project.contributor || 'Anonymous') === selectedContributor;
        
        return matchesSearch && matchesTech && matchesContributor;
    });
    
    // Sort
    filtered.sort((a, b) => {
        const titleA = a.title || '';
        const titleB = b.title || '';
        
        if (sortOrder === 'az') {
            return titleA.localeCompare(titleB);
        } else {
            return titleB.localeCompare(titleA);
        }
    });
    
    displayProjects(filtered);
}

function toggleView() {
    const container = document.getElementById('projectsContainer');
    const toggleBtn = document.getElementById('viewToggleBtn');
    
    if (currentView === 'grid') {
        currentView = 'list';
        container.classList.add('list-view');
        toggleBtn.innerHTML = '<i class="fa-solid fa-list"></i>';
    } else {
        currentView = 'grid';
        container.classList.remove('list-view');
        toggleBtn.innerHTML = '<i class="fa-solid fa-table-cells-large"></i>';
    }
}

// Scroll to top function (called from HTML)
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // '?' key for shortcuts
    if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        const overlay = document.getElementById('keyboardShortcutsOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        const overlay = document.getElementById('keyboardShortcutsOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Also close any open project modals
        const modal = document.querySelector('.project-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }
});

// Close shortcuts
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('keyboard-shortcuts-overlay') || 
        e.target.classList.contains('close-shortcuts')) {
        const overlay = document.getElementById('keyboardShortcutsOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
});

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .project-modal {
        animation: fadeIn 0.3s ease;
    }
    
    .project-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
    }
    
    .project-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    .project-card.list-view {
        display: flex;
        flex-direction: column;
    }
    
    .contributor-badge {
        background: var(--accent-color);
        color: white;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .tech-tag {
        background: var(--bg-secondary);
        color: var(--text-secondary);
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        border: 1px solid var(--border-color);
    }
    
    .tech-tag.html { background: #e34c26; color: white; }
    .tech-tag.css { background: #264de4; color: white; }
    .tech-tag.javascript { background: #f0db4f; color: black; }
    
    .project-links {
        display: flex;
        gap: 15px;
        margin-top: 15px;
    }
    
    .project-links a {
        color: var(--text-secondary);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.9rem;
        transition: color 0.2s ease;
    }
    
    .project-links a:hover {
        color: var(--accent-color);
    }
    
    .error-message {
        background: rgba(255, 107, 107, 0.1);
        border-radius: 10px;
        padding: 30px;
    }
`;
document.head.appendChild(style);