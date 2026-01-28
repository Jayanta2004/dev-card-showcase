// Project Comparison Tool
class ProjectComparison {
    constructor() {
        this.selectedProjects = [];
        this.allProjects = [];
        this.charts = {};
        this.savedComparisons = [];
        this.activeFilters = {
            metrics: ['popularity', 'community', 'difficulty', 'time', 'features', 'tech-stack']
        };

        this.init();
    }

    async init() {
        await this.loadProjects();
        this.setupEventListeners();
        this.loadSavedComparisons();
        this.loadFromURL();
        this.renderProjectsList();
    }

    // Load projects from JSON
    async loadProjects() {
        try {
            const response = await fetch('projects.json');
            if (response.ok) {
                const data = await response.json();
                this.allProjects = data.projects || data || [];
            } else {
                // Fallback with sample data
                this.allProjects = this.getSampleProjects();
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.allProjects = this.getSampleProjects();
        }
    }

    // Sample projects for fallback
    getSampleProjects() {
        return [
            {
                id: 1,
                name: 'React Todo App',
                description: 'A feature-rich todo application built with React',
                stars: 245,
                forks: 89,
                contributors: 12,
                difficulty: 'Intermediate',
                timeEstimate: '20-30 hours',
                techStack: ['React', 'JavaScript', 'CSS', 'LocalStorage'],
                features: ['Add tasks', 'Delete tasks', 'Mark complete', 'Filter tasks', 'Local storage'],
                community: 'High',
                downloads: 1240,
                language: 'JavaScript'
            },
            {
                id: 2,
                name: 'Python Web Scraper',
                description: 'Web scraping tool with BeautifulSoup and Selenium',
                stars: 567,
                forks: 234,
                contributors: 28,
                difficulty: 'Advanced',
                timeEstimate: '40-60 hours',
                techStack: ['Python', 'BeautifulSoup', 'Selenium', 'Pandas'],
                features: ['Web scraping', 'Data parsing', 'Export to CSV', 'Error handling'],
                community: 'Very High',
                downloads: 3420,
                language: 'Python'
            },
            {
                id: 3,
                name: 'Simple Calculator',
                description: 'Basic HTML/CSS/JS calculator application',
                stars: 89,
                forks: 34,
                contributors: 5,
                difficulty: 'Beginner',
                timeEstimate: '2-4 hours',
                techStack: ['HTML', 'CSS', 'JavaScript'],
                features: ['Basic arithmetic', 'Clear button', 'Display history'],
                community: 'Low',
                downloads: 456,
                language: 'JavaScript'
            }
        ];
    }

    // Setup event listeners
    setupEventListeners() {
        // Project search
        document.getElementById('project-search-input').addEventListener('input', (e) => {
            this.filterProjects(e.target.value);
        });

        // Comparison action buttons
        document.getElementById('save-comparison-btn').addEventListener('click', () => this.openSaveModal());
        document.getElementById('share-comparison-btn').addEventListener('click', () => this.openShareModal());
        document.getElementById('export-pdf-btn').addEventListener('click', () => this.exportToPDF());
        document.getElementById('reset-comparison-btn').addEventListener('click', () => this.resetComparison());

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Save modal
        document.getElementById('save-confirm-btn').addEventListener('click', () => this.saveComparison());

        // Share modal
        document.getElementById('copy-link-btn').addEventListener('click', () => this.copyShareLink());

        // Clear saved
        document.getElementById('clear-saved-btn').addEventListener('click', () => this.clearSaved());

        // Filter checkboxes
        document.querySelectorAll('input[name="filter-metrics"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateComparison());
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Render projects list
    renderProjectsList() {
        const projectsList = document.getElementById('projects-list');
        
        if (this.allProjects.length === 0) {
            projectsList.innerHTML = '<p class="empty-state">No projects available</p>';
            return;
        }

        projectsList.innerHTML = this.allProjects.map(project => {
            const isSelected = this.selectedProjects.some(p => p.id === project.id);
            const isDisabled = this.selectedProjects.length >= 3 && !isSelected;
            
            return `
                <button 
                    class="project-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
                    data-project-id="${project.id}"
                >
                    ${project.name}
                </button>
            `;
        }).join('');

        // Add click listeners
        document.querySelectorAll('.project-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const projectId = parseInt(e.target.dataset.projectId);
                this.toggleProjectSelection(projectId);
            });
        });
    }

    // Toggle project selection
    toggleProjectSelection(projectId) {
        const project = this.allProjects.find(p => p.id === projectId);
        const index = this.selectedProjects.findIndex(p => p.id === projectId);

        if (index > -1) {
            this.selectedProjects.splice(index, 1);
        } else if (this.selectedProjects.length < 3) {
            this.selectedProjects.push(project);
        } else {
            this.showNotification('Maximum 3 projects can be compared', 'error');
            return;
        }

        this.updateComparison();
        this.renderProjectsList();
    }

    // Update comparison display
    updateComparison() {
        if (this.selectedProjects.length === 0) {
            this.showEmptyState();
            return;
        }

        this.showComparisonUI();
        this.renderProjectCards();
        this.renderOverviewTab();
        this.renderMetricsTab();
        this.renderChartsTab();
        this.renderTechStackTab();
        this.renderFeaturesTab();
        this.renderWinnerBadges();
    }

    // Show empty state
    showEmptyState() {
        document.getElementById('projects-display').innerHTML = `
            <div class="empty-placeholder">
                <p>👉 Select projects from the sidebar to begin comparison</p>
                <p class="placeholder-hint">You can compare up to 3 projects simultaneously</p>
            </div>
        `;
        document.getElementById('comparison-tabs').style.display = 'none';
        document.getElementById('tab-content-area').style.display = 'none';
        document.getElementById('winner-section').style.display = 'none';
    }

    // Show comparison UI
    showComparisonUI() {
        document.getElementById('comparison-tabs').style.display = 'flex';
        document.getElementById('tab-content-area').style.display = 'flex';
    }

    // Render project cards
    renderProjectCards() {
        const display = document.getElementById('projects-display');
        
        display.innerHTML = this.selectedProjects.map((project, index) => `
            <div class="project-card winner-${index}">
                <button class="project-remove-btn" onclick="comparison.toggleProjectSelection(${project.id})">×</button>
                <div class="project-header">
                    <div class="project-name">${project.name}</div>
                    <div class="project-description">${project.description || 'No description'}</div>
                </div>
                <div class="project-stats">
                    <div class="stat">
                        <div class="stat-label">Stars</div>
                        <div class="stat-value">${project.stars || 0}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Forks</div>
                        <div class="stat-value">${project.forks || 0}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Contributors</div>
                        <div class="stat-value">${project.contributors || 0}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Downloads</div>
                        <div class="stat-value">${project.downloads || 0}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render overview tab
    renderOverviewTab() {
        const grid = document.getElementById('overview-grid');
        
        grid.innerHTML = this.selectedProjects.map((project, index) => `
            <div class="overview-card">
                <h4>${project.name}</h4>
                <div class="overview-item">
                    <span class="overview-label">Language</span>
                    <span class="overview-value">${project.language || 'N/A'}</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Difficulty</span>
                    <span class="overview-value">${project.difficulty || 'N/A'}</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Time Estimate</span>
                    <span class="overview-value">${project.timeEstimate || 'N/A'}</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Stars</span>
                    <span class="overview-value">${project.stars || 0}</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Community</span>
                    <span class="overview-value">${project.community || 'N/A'}</span>
                </div>
                <div class="overview-item">
                    <span class="overview-label">Contributors</span>
                    <span class="overview-value">${project.contributors || 0}</span>
                </div>
            </div>
        `).join('');
    }

    // Render metrics tab
    renderMetricsTab() {
        const metrics = ['Stars', 'Forks', 'Contributors', 'Downloads'];
        let html = `
            <thead>
                <tr>
                    <th>Metric</th>
                    ${this.selectedProjects.map(p => `<th>${p.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
        `;

        metrics.forEach(metric => {
            const key = metric.toLowerCase();
            html += `<tr><td class="metric-name">${metric}</td>`;
            
            this.selectedProjects.forEach(project => {
                const value = project[key] || 0;
                const maxValue = Math.max(...this.selectedProjects.map(p => p[key] || 0));
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                
                html += `
                    <td>
                        <div class="metric-bar">
                            <div class="metric-bar-fill" style="width: ${percentage}%"></div>
                            <span class="metric-value">${value}</span>
                        </div>
                    </td>
                `;
            });
            html += '</tr>';
        });

        html += '</tbody>';
        document.getElementById('metrics-table').innerHTML = html;
    }

    // Render charts
    renderChartsTab() {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};

        // Popularity Chart
        this.createChart('popularity-chart', {
            type: 'bar',
            labels: this.selectedProjects.map(p => p.name),
            datasets: [
                {
                    label: 'Stars',
                    data: this.selectedProjects.map(p => p.stars || 0),
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1
                },
                {
                    label: 'Forks',
                    data: this.selectedProjects.map(p => p.forks || 0),
                    backgroundColor: '#0ea5e9',
                    borderColor: '#0284c7',
                    borderWidth: 1
                }
            ]
        });

        // Community Chart
        this.createChart('community-chart', {
            type: 'bar',
            labels: this.selectedProjects.map(p => p.name),
            datasets: [
                {
                    label: 'Contributors',
                    data: this.selectedProjects.map(p => p.contributors || 0),
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1
                },
                {
                    label: 'Downloads',
                    data: this.selectedProjects.map(p => (p.downloads || 0) / 100), // Scale down for visibility
                    backgroundColor: '#8b5cf6',
                    borderColor: '#7c3aed',
                    borderWidth: 1
                }
            ]
        });

        // Radar Chart - Multi-Metric
        const radarData = this.getRadarData();
        this.createChart('radar-chart', {
            type: 'radar',
            labels: radarData.labels,
            datasets: this.selectedProjects.map((project, index) => ({
                label: project.name,
                data: radarData.data[index],
                borderColor: ['#3b82f6', '#10b981', '#f59e0b'][index],
                backgroundColor: ['rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(245, 158, 11, 0.1)'][index],
                pointBackgroundColor: ['#3b82f6', '#10b981', '#f59e0b'][index]
            }))
        });

        // Difficulty Chart
        const difficultyMap = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        this.createChart('difficulty-chart', {
            type: 'line',
            labels: this.selectedProjects.map(p => p.name),
            datasets: [
                {
                    label: 'Learning Difficulty (1=Easy, 3=Hard)',
                    data: this.selectedProjects.map(p => difficultyMap[p.difficulty] || 2),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointBackgroundColor: '#f59e0b'
                }
            ]
        });
    }

    // Create chart
    createChart(canvasId, config) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#cbd5e1'
                    }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: '#334155' }
                }
            }
        };

        this.charts[canvasId] = new Chart(ctx, {
            type: config.type,
            data: {
                labels: config.labels,
                datasets: config.datasets
            },
            options: defaultOptions
        });
    }

    // Get radar chart data
    getRadarData() {
        const labels = ['Popularity', 'Community', 'Documentation', 'Performance', 'Ease of Use'];
        const data = this.selectedProjects.map(project => [
            Math.min(project.stars / 100, 10),
            this.getCommunityScore(project),
            7,
            8,
            this.getEaseOfUseScore(project)
        ]);

        return { labels, data };
    }

    // Get community score
    getCommunityScore(project) {
        const scoreMap = { 'Very High': 10, 'High': 8, 'Medium': 6, 'Low': 3 };
        return scoreMap[project.community] || 5;
    }

    // Get ease of use score
    getEaseOfUseScore(project) {
        const scoreMap = { 'Beginner': 9, 'Intermediate': 6, 'Advanced': 3 };
        return scoreMap[project.difficulty] || 5;
    }

    // Render tech stack tab
    renderTechStackTab() {
        const container = document.getElementById('tech-stack-comparison');

        container.innerHTML = this.selectedProjects.map(project => {
            const techStack = project.techStack || [];
            
            return `
                <div class="tech-stack-card">
                    <h4>${project.name}</h4>
                    ${techStack.map(tech => `
                        <div class="tech-item">
                            <span class="tech-badge">${tech}</span>
                            <span class="tech-compatibility compatibility-good">✓</span>
                        </div>
                    `).join('')}
                    ${techStack.length === 0 ? '<p class="empty-state">No tech stack info</p>' : ''}
                </div>
            `;
        }).join('');
    }

    // Render features tab
    renderFeaturesTab() {
        const container = document.getElementById('features-comparison');

        container.innerHTML = this.selectedProjects.map(project => {
            const features = project.features || [];
            
            return `
                <div class="features-card">
                    <h4>${project.name}</h4>
                    ${features.map(feature => `
                        <div class="feature-item">
                            <input type="checkbox" class="feature-checkbox" checked disabled>
                            <span class="feature-name">${feature}</span>
                            <span class="feature-icon">✓</span>
                        </div>
                    `).join('')}
                    ${features.length === 0 ? '<p class="empty-state">No features listed</p>' : ''}
                </div>
            `;
        }).join('');
    }

    // Render winner badges
    renderWinnerBadges() {
        const winners = this.calculateWinners();
        const badgesHtml = Object.entries(winners).map(([category, winner]) => `
            <div class="winner-badge">
                <div class="winner-badge-icon">🏆</div>
                <div class="winner-badge-title">${category}</div>
                <div class="winner-badge-project">${winner.name}</div>
            </div>
        `).join('');

        document.getElementById('winner-badges').innerHTML = badgesHtml;
        document.getElementById('winner-section').style.display = 'block';
    }

    // Calculate winners
    calculateWinners() {
        if (this.selectedProjects.length === 0) return {};

        return {
            'Most Popular': this.selectedProjects.reduce((a, b) => (a.stars || 0) > (b.stars || 0) ? a : b),
            'Most Active Community': this.selectedProjects.reduce((a, b) => (a.contributors || 0) > (b.contributors || 0) ? a : b),
            'Beginner Friendly': this.selectedProjects.reduce((a, b) => {
                const aScore = a.difficulty === 'Beginner' ? 10 : a.difficulty === 'Intermediate' ? 5 : 0;
                const bScore = b.difficulty === 'Beginner' ? 10 : b.difficulty === 'Intermediate' ? 5 : 0;
                return aScore > bScore ? a : b;
            }),
            'Most Downloaded': this.selectedProjects.reduce((a, b) => (a.downloads || 0) > (b.downloads || 0) ? a : b)
        };
    }

    // Switch tab
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Redraw charts if switching to charts tab
        if (tabName === 'charts') {
            setTimeout(() => {
                Object.values(this.charts).forEach(chart => {
                    if (chart) chart.resize();
                });
            }, 100);
        }
    }

    // Filter projects
    filterProjects(searchTerm) {
        const filtered = this.allProjects.filter(project =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        const projectsList = document.getElementById('projects-list');
        projectsList.innerHTML = filtered.map(project => {
            const isSelected = this.selectedProjects.some(p => p.id === project.id);
            const isDisabled = this.selectedProjects.length >= 3 && !isSelected;
            
            return `
                <button 
                    class="project-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
                    data-project-id="${project.id}"
                >
                    ${project.name}
                </button>
            `;
        }).join('');

        // Re-attach listeners
        document.querySelectorAll('.project-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const projectId = parseInt(e.target.dataset.projectId);
                this.toggleProjectSelection(projectId);
            });
        });
    }

    // Open save modal
    openSaveModal() {
        if (this.selectedProjects.length === 0) {
            this.showNotification('Please select at least one project', 'error');
            return;
        }
        document.getElementById('save-modal').classList.add('active');
    }

    // Save comparison
    saveComparison() {
        const name = document.getElementById('comparison-name').value.trim();
        const notes = document.getElementById('comparison-notes').value.trim();

        if (!name) {
            this.showNotification('Please enter a comparison name', 'error');
            return;
        }

        const comparison = {
            id: Date.now(),
            name,
            notes,
            projects: this.selectedProjects.map(p => p.id),
            timestamp: new Date().toLocaleString()
        };

        this.savedComparisons.push(comparison);
        localStorage.setItem('savedComparisons', JSON.stringify(this.savedComparisons));

        document.getElementById('save-modal').classList.remove('active');
        document.getElementById('comparison-name').value = '';
        document.getElementById('comparison-notes').value = '';

        this.renderSavedComparisons();
        this.showNotification('Comparison saved successfully!', 'success');
    }

    // Open share modal
    openShareModal() {
        if (this.selectedProjects.length === 0) {
            this.showNotification('Please select at least one project', 'error');
            return;
        }

        const projectIds = this.selectedProjects.map(p => p.id).join(',');
        const url = `${window.location.origin}${window.location.pathname}?projects=${projectIds}`;
        
        document.getElementById('share-link').value = url;
        document.getElementById('share-modal').classList.add('active');
    }

    // Copy share link
    copyShareLink() {
        const link = document.getElementById('share-link');
        link.select();
        document.execCommand('copy');
        this.showNotification('Link copied to clipboard!', 'success');
    }

    // Export to PDF
    exportToPDF() {
        if (this.selectedProjects.length === 0) {
            this.showNotification('Please select at least one project', 'error');
            return;
        }

        const element = document.querySelector('.comparison-content');
        const opt = {
            margin: 10,
            filename: `comparison-${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        html2pdf().set(opt).from(element).save();
        this.showNotification('PDF exported successfully!', 'success');
    }

    // Reset comparison
    resetComparison() {
        if (confirm('Reset all selections?')) {
            this.selectedProjects = [];
            this.updateComparison();
            this.renderProjectsList();
            this.showNotification('Comparison reset', 'success');
        }
    }

    // Load saved comparisons
    loadSavedComparisons() {
        const saved = localStorage.getItem('savedComparisons');
        if (saved) {
            this.savedComparisons = JSON.parse(saved);
        }
        this.renderSavedComparisons();
    }

    // Render saved comparisons
    renderSavedComparisons() {
        const savedList = document.getElementById('saved-list');

        if (this.savedComparisons.length === 0) {
            savedList.innerHTML = '<p class="empty-state">No saved comparisons</p>';
            return;
        }

        savedList.innerHTML = this.savedComparisons.map(comparison => `
            <div class="saved-item">
                <span onclick="comparison.loadSavedComparison(${comparison.id})" style="cursor: pointer; flex: 1;">
                    ${comparison.name}
                </span>
                <button class="saved-item-delete" onclick="comparison.deleteSavedComparison(${comparison.id})">×</button>
            </div>
        `).join('');
    }

    // Load saved comparison
    loadSavedComparison(id) {
        const saved = this.savedComparisons.find(c => c.id === id);
        if (saved) {
            this.selectedProjects = this.allProjects.filter(p => saved.projects.includes(p.id));
            this.updateComparison();
            this.renderProjectsList();
            this.showNotification(`Loaded: ${saved.name}`, 'success');
        }
    }

    // Delete saved comparison
    deleteSavedComparison(id) {
        if (confirm('Delete this saved comparison?')) {
            this.savedComparisons = this.savedComparisons.filter(c => c.id !== id);
            localStorage.setItem('savedComparisons', JSON.stringify(this.savedComparisons));
            this.renderSavedComparisons();
            this.showNotification('Comparison deleted', 'success');
        }
    }

    // Clear saved
    clearSaved() {
        if (confirm('Clear all saved comparisons?')) {
            this.savedComparisons = [];
            localStorage.setItem('savedComparisons', JSON.stringify(this.savedComparisons));
            this.renderSavedComparisons();
            this.showNotification('All saved comparisons cleared', 'success');
        }
    }

    // Load from URL
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const projectIds = params.get('projects');
        
        if (projectIds) {
            const ids = projectIds.split(',').map(Number);
            this.selectedProjects = this.allProjects.filter(p => ids.includes(p.id));
            this.updateComparison();
            this.renderProjectsList();
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize when DOM is ready
let comparison;
document.addEventListener('DOMContentLoaded', () => {
    comparison = new ProjectComparison();
});
