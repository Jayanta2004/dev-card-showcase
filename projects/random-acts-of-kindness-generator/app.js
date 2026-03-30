// Random Acts of Kindness Generator
// Author: EWOC Contributors
// Description: Suggests daily kindness challenges and lets users log and share their experiences.

const challenges = [
    'Compliment a stranger today.',
    'Write a thank-you note to someone.',
    'Pick up litter in your neighborhood.',
    'Donate unused clothes or items.',
    'Let someone go ahead of you in line.',
    'Send an encouraging message to a friend.',
    'Leave a positive review for a local business.',
    'Help a neighbor with chores.',
    'Pay for someone’s coffee or meal.',
    'Share a book you love with someone.',
    'Plant a tree or flowers.',
    'Call a family member just to say hello.',
    'Share your umbrella with someone in need.',
    'Leave a kind note in a public place.',
    'Offer to babysit for free.',
    'Give up your seat on public transport.',
    'Bring treats to work or school.',
    'Support a local charity.',
    'Smile at five people today.',
    'Teach someone a new skill.'
];

const STORAGE_KEY = 'kindnessStories';

const challengeDiv = document.getElementById('challenge');
const newChallengeBtn = document.getElementById('newChallengeBtn');
const form = document.getElementById('logForm');
const confirmation = document.getElementById('confirmation');
const storiesDiv = document.getElementById('stories');

function getStories() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveStories(stories) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

function randomChallenge() {
    return challenges[Math.floor(Math.random() * challenges.length)];
}

function renderChallenge() {
    challengeDiv.textContent = randomChallenge();
}

function renderStories() {
    const stories = getStories();
    if (!stories.length) {
        storiesDiv.innerHTML = '<em>No stories shared yet.</em>';
        return;
    }
    storiesDiv.innerHTML = stories.slice().reverse().map(s =>
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

newChallengeBtn.addEventListener('click', renderChallenge);

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = form.experience.value.trim();
    if (!text) return;
    const stories = getStories();
    stories.push({
        text,
        date: new Date().toISOString().split('T')[0]
    });
    saveStories(stories);
    confirmation.textContent = 'Kindness experience shared!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderStories();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderChallenge();
renderStories();
