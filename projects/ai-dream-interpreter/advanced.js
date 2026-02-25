// Advanced AI Dream Interpreter Features
// User profiles, dream categorization, visualization, export, enhanced logic

// User profile management
const userProfile = {
    name: 'Dreamer',
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    dreamCount: 0,
    favoriteSymbol: '',
    dreamTags: {}
};

function renderProfile() {
    const profileDiv = document.getElementById('profile');
    if (!profileDiv) return;
    profileDiv.innerHTML = `
        <img src="${userProfile.avatar}" alt="avatar" style="width:60px;height:60px;border-radius:50%;">
        <div><strong>${userProfile.name}</strong></div>
        <div>Dreams logged: ${userProfile.dreamCount}</div>
        <div>Favorite symbol: ${userProfile.favoriteSymbol || 'N/A'}</div>
    `;
}

// Dream categorization and tagging
function categorizeDream(text) {
    const categories = [
        { tag: 'Adventure', keywords: ['flight', 'explore', 'forest', 'mountain'] },
        { tag: 'Fear', keywords: ['snake', 'falling', 'dark', 'lost'] },
        { tag: 'Transformation', keywords: ['water', 'mirror', 'door', 'change'] },
        { tag: 'Hope', keywords: ['light', 'child', 'sun', 'new'] },
        { tag: 'Mystery', keywords: ['animal', 'unknown', 'hidden', 'shadow'] }
    ];
    let found = categories.filter(cat => cat.keywords.some(k => text.toLowerCase().includes(k)));
    return found.length > 0 ? found.map(cat => cat.tag) : ['Unique'];
}

// Dream log visualization
function renderDreamChart(log) {
    const chartDiv = document.getElementById('dream-chart');
    if (!chartDiv) return;
    // Count tags
    let tagCounts = {};
    log.forEach(entry => {
        entry.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    // Render simple bar chart
    chartDiv.innerHTML = '<h3>Dream Tag Distribution</h3>';
    Object.keys(tagCounts).forEach(tag => {
        const bar = document.createElement('div');
        bar.style.background = '#4caf50';
        bar.style.height = '24px';
        bar.style.width = `${tagCounts[tag]*40}px`;
        bar.style.margin = '6px 0';
        bar.style.borderRadius = '6px';
        bar.innerHTML = `<span style="color:#fff;padding-left:8px;">${tag} (${tagCounts[tag]})</span>`;
        chartDiv.appendChild(bar);
    });
}

// Export dream log
function exportDreamLog(log) {
    const data = log.map(entry => `Dream: ${entry.text}\nInterpretation: ${entry.storyline}\nTags: ${entry.tags.join(', ')}`).join('\n\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dream_log.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Enhanced interpretation logic
function enhancedInterpretDream(text) {
    // ...existing code...
    const base = interpretDream(text);
    const tags = categorizeDream(text);
    return { ...base, tags };
}

// Integration with main app.js
window.advancedDreamInterpreter = {
    renderProfile,
    categorizeDream,
    renderDreamChart,
    exportDreamLog,
    enhancedInterpretDream
};
