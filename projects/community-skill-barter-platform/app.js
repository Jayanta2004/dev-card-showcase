// Community Skill Barter Platform
// Author: EWOC Contributors
// Description: Users offer and request skills/services, trading without money (e.g., guitar lessons for coding help)

const form = document.getElementById('barterForm');
const confirmation = document.getElementById('confirmation');
const barterListDiv = document.getElementById('barterList');

const STORAGE_KEY = 'communitySkillBarters';

function getBarters() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveBarters(barters) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(barters));
}

function renderBarterList() {
    const barters = getBarters();
    if (!barters.length) {
        barterListDiv.innerHTML = '<em>No barters posted yet.</em>';
        return;
    }
    barterListDiv.innerHTML = barters.slice().reverse().map((b, idx) =>
        `<div class="barter-card">
            <div class="meta"><b>${escapeHtml(b.username)}</b> offers <b>${escapeHtml(b.offer)}</b> for <b>${escapeHtml(b.request)}</b></div>
            <div class="barter-actions">
                ${b.accepted ? `<span class="accepted">Barter accepted!</span>` : `<button onclick="acceptBarter(${barters.length-1-idx})">Propose Barter</button>`}
            </div>
        </div>`
    ).join('');
}

window.acceptBarter = function(idx) {
    const barters = getBarters();
    if (barters[idx].accepted) return;
    barters[idx].accepted = true;
    saveBarters(barters);
    renderBarterList();
};

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
    const username = form.username.value.trim();
    const offer = form.offer.value.trim();
    const request = form.request.value.trim();
    if (!username || !offer || !request) return;
    const barters = getBarters();
    barters.push({ username, offer, request, accepted: false });
    saveBarters(barters);
    confirmation.textContent = 'Barter posted!';
    confirmation.classList.remove('hidden');
    form.reset();
    renderBarterList();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderBarterList();
