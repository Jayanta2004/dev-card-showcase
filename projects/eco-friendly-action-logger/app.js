// Eco-Friendly Action Logger
// Author: EWOC Contributors
// Description: Help users log and track eco-friendly actions, like recycling or reducing energy use.

const form = document.getElementById('actionForm');
const confirmation = document.getElementById('confirmation');
const actionHistoryDiv = document.getElementById('actionHistory');
const summaryDiv = document.getElementById('summary');

const STORAGE_KEY = 'ecoFriendlyActions';

function getActions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveActions(actions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

function renderHistory() {
    const actions = getActions();
    if (!actions.length) {
        actionHistoryDiv.innerHTML = '<em>No actions logged yet.</em>';
        return;
    }
    actionHistoryDiv.innerHTML = actions.slice().reverse().map(a =>
        `<div class="action-card">
            <div class="meta">${a.date} | <b>${actionLabel(a.type)}</b></div>
            <div>${escapeHtml(a.details)}</div>
        </div>`
    ).join('');
}

function renderSummary() {
    const actions = getActions();
    if (!actions.length) {
        summaryDiv.innerHTML = '<em>No data yet.</em>';
        return;
    }
    const counts = {};
    actions.forEach(a => {
        counts[a.type] = (counts[a.type] || 0) + 1;
    });
    summaryDiv.innerHTML = '<ul class="summary-list">' +
        Object.entries(counts).map(([type, count]) =>
            `<li><b>${actionLabel(type)}</b>: ${count}</li>`
        ).join('') + '</ul>';
}

function actionLabel(key) {
    switch(key) {
        case 'recycling': return 'Recycling';
        case 'reduced-energy': return 'Reduced Energy Use';
        case 'public-transport': return 'Used Public Transport';
        case 'planted-tree': return 'Planted a Tree';
        case 'reused-item': return 'Reused Item';
        case 'eco-purchase': return 'Eco-Friendly Purchase';
        default: return 'Other';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const type = form.actionType.value;
    const details = form.details.value.trim();
    if (!type) return;
    const actions = getActions();
    actions.push({
        type,
        details,
        date: new Date().toISOString().split('T')[0]
    });
    saveActions(actions);
    confirmation.textContent = 'Action logged!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderHistory();
    renderSummary();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderHistory();
renderSummary();
