const COMPARISON_KEY = 'dev_card_comparison';
const MAX_COMPARE = 3;

function loadComparison() {
    try {
        const stored = localStorage.getItem(COMPARISON_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
}

function saveComparison(projects) {
    try {
        localStorage.setItem(COMPARISON_KEY, JSON.stringify(projects));
    } catch (error) {
        console.error('Error saving comparison:', error);
    }
}

function getComparison() {
    return loadComparison();
}

function addToComparison(project) {
    const comparison = loadComparison();
    
    if (comparison.length >= MAX_COMPARE) {
        alert(`You can compare maximum ${MAX_COMPARE} projects at a time.`);
        return false;
    }
    
    if (comparison.some(p => (p.id || p.title) === (project.id || project.title))) {
        alert('This project is already in your comparison list.');
        return false;
    }
    
    comparison.push(project);
    saveComparison(comparison);
    updateComparisonUI();
    return true;
}

function removeFromComparison(projectId) {
    let comparison = loadComparison();
    comparison = comparison.filter(p => (p.id || p.title) !== projectId);
    saveComparison(comparison);
    updateComparisonUI();
}

function clearComparison() {
    saveComparison([]);
    updateComparisonUI();
}

function updateComparisonUI() {
    const comparison = loadComparison();
    const count = comparison.length;
    
    const badge = document.getElementById('compareBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function renderComparisonModal() {
    const comparison = getComparison();
    
    if (comparison.length === 0) {
        alert('No projects selected for comparison. Check the compare checkbox on project cards.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <span class="modal-close" onclick="this.closest('.comparison-modal').remove()">&times;</span>
            <h2>Compare Projects</h2>
            <div class="comparison-grid" style="display: grid; grid-template-columns: repeat(${comparison.length}, 1fr); gap: 16px; margin-top: 20px;">
                ${comparison.map(project => `
                    <div class="compare-card" style="background: var(--bg-card); padding: 16px; border-radius: 12px;">
                        <h3 style="margin: 0 0 10px;">${project.title}</h3>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">${project.description?.substring(0, 100)}...</p>
                        <div class="compare-tags" style="margin-top: 10px;">
                            ${(project.tags || []).slice(0, 5).map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                        </div>
                        <button onclick="removeFromComparison('${project.id || project.title}')" 
                                style="margin-top: 10px; padding: 6px 12px; background: #ff6b6b; border: none; border-radius: 6px; color: white; cursor: pointer;">
                            Remove
                        </button>
                    </div>
                `).join('')}
            </div>
            <button onclick="clearComparison()" style="margin-top: 20px; padding: 10px 20px; background: var(--primary-color); border: none; border-radius: 8px; color: white; cursor: pointer;">
                Clear All
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function renderCompareCheckbox(projectId) {
    return `
        <label class="compare-checkbox" title="Add to compare">
            <input type="checkbox" onchange="handleCompareChange(event, '${projectId}')">
        </label>
    `;
}

function handleCompareChange(event, projectId) {
    const isChecked = event.target.checked;
    const project = getProjectById(projectId);
    
    if (isChecked && project) {
        addToComparison(project);
    } else {
        removeFromComparison(projectId);
    }
}
