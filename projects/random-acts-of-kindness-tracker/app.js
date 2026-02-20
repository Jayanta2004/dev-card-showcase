// Random Acts of Kindness Tracker
// Features: Log acts, unlock badges, inspire others, modals, localStorage, modern UI

let acts = JSON.parse(localStorage.getItem('kindActs') || 'null') || [
    { description: 'Helped a neighbor carry groceries', date: '2026-02-10', shared: true },
    { description: 'Donated books to the library', date: '2026-01-15', shared: false },
    { description: 'Complimented a stranger', date: '2026-02-01', shared: true }
];
let badges = JSON.parse(localStorage.getItem('kindBadges') || 'null') || [];
const badgeDefs = [
    { id: 'first', name: 'First Kindness', icon: '🌱', desc: 'Logged your first act of kindness.' },
    { id: 'five', name: 'Kindness Streak', icon: '🔥', desc: 'Logged 5 kind acts.' },
    { id: 'share', name: 'Inspiration', icon: '💡', desc: 'Shared an act to inspire others.' },
    { id: 'week', name: 'Weekly Kindness', icon: '📅', desc: 'Logged an act every day for a week.' }
];
const inspireQuotes = [
    'No act of kindness, no matter how small, is ever wasted.',
    'Kindness is a language which the deaf can hear and the blind can see.',
    'Carry out a random act of kindness, with no expectation of reward.',
    'The best way to find yourself is to lose yourself in the service of others.',
    'Kindness is spreading sunshine into other people’s lives.'
];

// --- DOM ELEMENTS ---
const logActBtn = document.getElementById('logActBtn');
const badgesBtn = document.getElementById('badgesBtn');
const inspireBtn = document.getElementById('inspireBtn');
const aboutBtn = document.getElementById('aboutBtn');
const actsSection = document.getElementById('actsSection');
const badgesSection = document.getElementById('badgesSection');
const inspireSection = document.getElementById('inspireSection');
const aboutSection = document.getElementById('aboutSection');
const actsList = document.getElementById('actsList');
const badgesList = document.getElementById('badgesList');
const inspireQuote = document.getElementById('inspireQuote');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
logActBtn.onclick = () => showLogActModal();
badgesBtn.onclick = () => showSection('badges');
inspireBtn.onclick = () => showSection('inspire');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    actsSection.classList.add('hidden');
    badgesSection.classList.add('hidden');
    inspireSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'acts') actsSection.classList.remove('hidden');
    if (section === 'badges') badgesSection.classList.remove('hidden');
    if (section === 'inspire') {
        inspireSection.classList.remove('hidden');
        showInspireQuote();
    }
    if (section === 'about') aboutSection.classList.remove('hidden');
}

// --- RENDER ACTS ---
function renderActs() {
    actsList.innerHTML = '';
    if (acts.length === 0) {
        actsList.innerHTML = '<p>No kind acts logged yet. Start spreading kindness!</p>';
        return;
    }
    acts.forEach((act, idx) => {
        const card = document.createElement('div');
        card.className = 'act-card';
        card.innerHTML = `
            <span class="act-date">${act.date}</span>
            <div>${act.description}</div>
            <div class="act-actions">
                <button onclick="editAct(${idx})">Edit</button>
                <button onclick="deleteAct(${idx})">Delete</button>
                <button onclick="shareAct(${idx})">${act.shared ? 'Shared' : 'Share'}</button>
            </div>
        `;
        actsList.appendChild(card);
    });
}
window.editAct = function(idx) {
    showLogActModal(acts[idx], idx);
};
window.deleteAct = function(idx) {
    if (confirm('Delete this act?')) {
        acts.splice(idx, 1);
        localStorage.setItem('kindActs', JSON.stringify(acts));
        renderActs();
        checkBadges();
        hideModal();
    }
};
window.shareAct = function(idx) {
    acts[idx].shared = true;
    localStorage.setItem('kindActs', JSON.stringify(acts));
    checkBadges();
    renderActs();
    alert('Your act has been shared to inspire others!');
};

// --- LOG/EDIT ACT MODAL ---
function showLogActModal(act = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${act ? 'Edit' : 'Log'} Kind Act</h2>
        <textarea id="actDesc" style="width:100%;height:60px;">${act ? act.description : ''}</textarea><br>
        <label>Date: <input id="actDate" type="date" value="${act ? act.date : ''}" required></label><br><br>
        <label><input type="checkbox" id="actShared" ${act && act.shared ? 'checked' : ''}> Share to inspire others</label><br><br>
        <button onclick="submitAct(${idx !== null ? idx : ''})">${act ? 'Save' : 'Log'} Act</button>
    `;
    showModal();
}
window.submitAct = function(idx) {
    const description = document.getElementById('actDesc').value.trim();
    const date = document.getElementById('actDate').value;
    const shared = document.getElementById('actShared').checked;
    if (!description || !date) {
        alert('Please fill all required fields.');
        return;
    }
    const act = { description, date, shared };
    if (idx !== undefined && idx !== null && acts[idx]) {
        acts[idx] = act;
    } else {
        acts.push(act);
    }
    localStorage.setItem('kindActs', JSON.stringify(acts));
    renderActs();
    checkBadges();
    hideModal();
};

// --- BADGES ---
function renderBadges() {
    badgesList.innerHTML = '';
    if (badges.length === 0) {
        badgesList.innerHTML = '<p>No badges unlocked yet. Log and share kind acts to earn badges!</p>';
        return;
    }
    badges.forEach(bid => {
        const badge = badgeDefs.find(b => b.id === bid);
        if (badge) {
            const card = document.createElement('div');
            card.className = 'badge-card';
            card.innerHTML = `<div class="badge-icon">${badge.icon}</div><div><b>${badge.name}</b></div><div>${badge.desc}</div>`;
            badgesList.appendChild(card);
        }
    });
}
function checkBadges() {
    let newBadges = [];
    if (acts.length > 0 && !badges.includes('first')) newBadges.push('first');
    if (acts.length >= 5 && !badges.includes('five')) newBadges.push('five');
    if (acts.some(a => a.shared) && !badges.includes('share')) newBadges.push('share');
    // Weekly badge: 7 acts on 7 consecutive days
    if (!badges.includes('week')) {
        const dates = acts.map(a => a.date).sort();
        let streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1]);
            const curr = new Date(dates[i]);
            if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) streak++;
            else streak = 1;
            if (streak >= 7) {
                newBadges.push('week');
                break;
            }
        }
    }
    if (newBadges.length > 0) {
        badges = [...badges, ...newBadges];
        localStorage.setItem('kindBadges', JSON.stringify(badges));
        renderBadges();
        setTimeout(() => alert('You unlocked new badge(s)!'), 300);
    } else {
        renderBadges();
    }
}

// --- INSPIRE ---
function showInspireQuote() {
    const quote = inspireQuotes[Math.floor(Math.random() * inspireQuotes.length)];
    inspireQuote.innerHTML = `<blockquote>“${quote}”</blockquote>`;
}

// --- MODAL LOGIC ---
function showModal() {
    modal.classList.remove('hidden');
}
function hideModal() {
    modal.classList.add('hidden');
    modalBody.innerHTML = '';
}

// --- INIT ---
function init() {
    renderActs();
    checkBadges();
    showSection('acts');
}
init();
