// AI-Powered Dream Interpreter (Demo: Keyword-based Analysis)
// Author: EWOC Contributors
// Description: Users log dreams, and the app uses AI to analyze and suggest possible meanings or themes.

const form = document.getElementById('dreamForm');
const confirmation = document.getElementById('confirmation');
const dreamLogDiv = document.getElementById('dreamLog');

const STORAGE_KEY = 'dreamInterpreterLog';

function getDreams() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveDreams(dreams) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams));
}

function analyzeDream(text) {
    // Simple keyword-based mock analysis
    const themes = [];
    const lower = text.toLowerCase();
    if (/fall|falling/.test(lower)) themes.push('Feeling out of control or anxious');
    if (/flying/.test(lower)) themes.push('Desire for freedom or escape');
    if (/teeth/.test(lower)) themes.push('Concerns about appearance or communication');
    if (/chased|running/.test(lower)) themes.push('Avoidance or fear of confrontation');
    if (/water|ocean|sea|river/.test(lower)) themes.push('Emotional state or subconscious thoughts');
    if (/school|exam|test/.test(lower)) themes.push('Stress about performance or learning');
    if (/death|dying/.test(lower)) themes.push('Transition, change, or fear of loss');
    if (/baby|child/.test(lower)) themes.push('New beginnings or vulnerability');
    if (/snake/.test(lower)) themes.push('Hidden fears or transformation');
    if (/house|home/.test(lower)) themes.push('Self-identity or security');
    if (themes.length === 0) themes.push('Unique or personal symbolism; consider your feelings in the dream.');
    return themes.join('; ');
}

function renderDreamLog() {
    const dreams = getDreams();
    if (!dreams.length) {
        dreamLogDiv.innerHTML = '<em>No dreams logged yet.</em>';
        return;
    }
    dreamLogDiv.innerHTML = dreams.slice().reverse().map(d =>
        `<div class="dream-card">
            <div class="meta">${d.date}</div>
            <div>${escapeHtml(d.text)}</div>
            <div class="interpretation">AI Interpretation: ${escapeHtml(d.analysis)}</div>
        </div>`
    ).join('');
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
    const text = form.dreamText.value.trim();
    if (!text) return;
    const analysis = analyzeDream(text);
    const dreams = getDreams();
    dreams.push({
        text,
        analysis,
        date: new Date().toISOString().split('T')[0]
    });
    saveDreams(dreams);
    confirmation.textContent = 'Dream analyzed and saved!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderDreamLog();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderDreamLog();
