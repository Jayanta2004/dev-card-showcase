// Intergenerational Story Bridge
// Author: EWOC Contributors
// Description: Pairs youth and elders to share and record life stories, preserving local history.

const signupForm = document.getElementById('signupForm');
const storyForm = document.getElementById('storyForm');
const pairSelect = document.getElementById('pair');
const confirmation = document.getElementById('confirmation');
const storiesDiv = document.getElementById('stories');

const STORAGE_KEY = 'storyBridgeData';

function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { users: [], stories: [] };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderPairs() {
    const data = getData();
    const youth = data.users.filter(u => u.role === 'youth');
    const elders = data.users.filter(u => u.role === 'elder');
    pairSelect.innerHTML = '';
    youth.forEach(y => {
        elders.forEach(e => {
            const val = `${y.name} & ${e.name}`;
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            pairSelect.appendChild(opt);
        });
    });
    if (!pairSelect.options.length) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No pairs available yet';
        pairSelect.appendChild(opt);
    }
}

function renderStories() {
    const data = getData();
    if (!data.stories.length) {
        storiesDiv.innerHTML = '<em>No stories shared yet.</em>';
        return;
    }
    storiesDiv.innerHTML = data.stories.slice().reverse().map(s =>
        `<div class="story-card">
            <div class="meta">${escapeHtml(s.pair)} | Shared on ${s.date}</div>
            <div>${escapeHtml(s.story)}</div>
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

signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = signupForm.name.value.trim();
    const role = signupForm.role.value;
    if (!name || !role) return;
    const data = getData();
    if (!data.users.some(u => u.name === name && u.role === role)) {
        data.users.push({ name, role });
        saveData(data);
    }
    confirmation.textContent = 'Signed up!';
    confirmation.classList.remove('hidden');
    signupForm.reset();
    renderPairs();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

storyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const pair = storyForm.pair.value;
    const story = storyForm.story.value.trim();
    if (!pair || !story) return;
    const data = getData();
    data.stories.push({ pair, story, date: new Date().toISOString().split('T')[0] });
    saveData(data);
    confirmation.textContent = 'Story shared!';
    confirmation.classList.remove('hidden');
    storyForm.reset();
    renderStories();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderPairs();
renderStories();
