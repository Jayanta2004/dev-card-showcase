// Empathy Story Exchange
// Author: EWOC Contributors
// Description: Users anonymously share and read real-life stories to foster empathy and understanding.

const form = document.getElementById('storyForm');
const confirmation = document.getElementById('confirmation');
const storyFeedDiv = document.getElementById('storyFeed');

const STORAGE_KEY = 'empathyStories';

function getStories() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveStories(stories) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

function renderStories() {
    const stories = getStories();
    if (!stories.length) {
        storyFeedDiv.innerHTML = '<em>No stories shared yet.</em>';
        return;
    }
    // Shuffle for variety
    const shuffled = stories.slice().sort(() => Math.random() - 0.5);
    storyFeedDiv.innerHTML = shuffled.map(s =>
        `<div class="story-card">
            <div class="meta">Shared on ${s.date}</div>
            <div>${escapeHtml(s.text)}</div>
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
    const text = form.storyText.value.trim();
    if (!text) return;
    const stories = getStories();
    stories.push({
        text,
        date: new Date().toISOString().split('T')[0]
    });
    saveStories(stories);
    confirmation.textContent = 'Story shared!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderStories();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderStories();
