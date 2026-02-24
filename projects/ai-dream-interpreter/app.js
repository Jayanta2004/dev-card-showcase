// AI Dream Interpreter Logic
// Users log dreams and receive AI-generated symbolic interpretations and storylines

const dreamForm = document.getElementById('dream-form');
const dreamInput = document.getElementById('dream-input');
const interpretationDiv = document.getElementById('interpretation');
const dreamLogDiv = document.getElementById('dream-log');

let dreamLog = [];

function interpretDream(text) {
    // Simple keyword-based symbolic interpretation
    const symbols = [
        { keyword: 'water', meaning: 'Emotions, subconscious, renewal.' },
        { keyword: 'flight', meaning: 'Freedom, escape, ambition.' },
        { keyword: 'snake', meaning: 'Transformation, hidden fears, healing.' },
        { keyword: 'forest', meaning: 'Growth, mystery, exploration.' },
        { keyword: 'falling', meaning: 'Loss of control, anxiety, change.' },
        { keyword: 'light', meaning: 'Hope, clarity, enlightenment.' },
        { keyword: 'mirror', meaning: 'Self-reflection, identity, truth.' },
        { keyword: 'door', meaning: 'Opportunity, transition, new beginnings.' },
        { keyword: 'animal', meaning: 'Instincts, nature, primal urges.' },
        { keyword: 'child', meaning: 'Innocence, new start, vulnerability.' }
    ];
    let found = symbols.filter(s => text.toLowerCase().includes(s.keyword));
    let meaning = found.length > 0 ? found.map(s => s.meaning).join(' ') : 'Your dream is unique and open to interpretation.';
    // Generate a creative storyline
    let storyline = `In your dream, ${text.split(' ').slice(0, 10).join(' ')}... This suggests ${meaning}`;
    return { meaning, storyline };
}

function renderDreamLog() {
    dreamLogDiv.innerHTML = '';
    dreamLog.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'dream-entry';
        div.innerHTML = `<strong>Dream:</strong> ${entry.text}<br><strong>Interpretation:</strong> ${entry.storyline}<br><strong>Tags:</strong> ${entry.tags ? entry.tags.join(', ') : ''}`;
        dreamLogDiv.appendChild(div);
    });
    // Render chart
    if (window.advancedDreamInterpreter) {
        window.advancedDreamInterpreter.renderDreamChart(dreamLog);
    }
}

dreamForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = dreamInput.value.trim();
    if (!text) return;
    let result;
    if (window.advancedDreamInterpreter) {
        result = window.advancedDreamInterpreter.enhancedInterpretDream(text);
    } else {
        result = interpretDream(text);
    }
    interpretationDiv.innerHTML = `<strong>Symbolic Meaning:</strong> ${result.meaning}<br><strong>Storyline:</strong> ${result.storyline}<br><strong>Tags:</strong> ${result.tags ? result.tags.join(', ') : ''}`;
    dreamLog.push({ text, storyline: result.storyline, tags: result.tags });
    // Update user profile
    if (window.advancedDreamInterpreter && window.userProfile) {
        window.userProfile.dreamCount = dreamLog.length;
        if (result.tags && result.tags.length > 0) {
            result.tags.forEach(tag => {
                window.userProfile.dreamTags[tag] = (window.userProfile.dreamTags[tag] || 0) + 1;
            });
            // Set favorite symbol
            let fav = Object.keys(window.userProfile.dreamTags).reduce((a, b) => window.userProfile.dreamTags[a] > window.userProfile.dreamTags[b] ? a : b);
            window.userProfile.favoriteSymbol = fav;
        }
        window.advancedDreamInterpreter.renderProfile();
    }
    renderDreamLog();
    dreamInput.value = '';
});

// Export dream log
const exportBtn = document.getElementById('export-log');
if (exportBtn && window.advancedDreamInterpreter) {
    exportBtn.onclick = () => window.advancedDreamInterpreter.exportDreamLog(dreamLog);
}

// Render user profile
window.addEventListener('DOMContentLoaded', () => {
    if (window.advancedDreamInterpreter) {
        window.advancedDreamInterpreter.renderProfile();
    }
});
