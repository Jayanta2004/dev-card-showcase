// Mindful Aquarium
// Features: Log meditation/mindfulness sessions, unlock aquatic life, modals, localStorage, modern UI

let sessions = JSON.parse(localStorage.getItem('maSessions') || 'null') || [
    { date: '2026-02-14', duration: 10, type: 'Meditation', notes: 'Calm and focused', aquatic: '🐟' },
    { date: '2026-02-15', duration: 15, type: 'Mindfulness', notes: 'Present moment', aquatic: '🐠' },
    { date: '2026-02-16', duration: 20, type: 'Meditation', notes: 'Deep relaxation', aquatic: '🐬' }
];
const aquaticRewards = [
    { min: 0, emoji: '🐟', label: 'Fish' },
    { min: 5, emoji: '🐠', label: 'Tropical Fish' },
    { min: 10, emoji: '🦑', label: 'Squid' },
    { min: 15, emoji: '🐬', label: 'Dolphin' },
    { min: 20, emoji: '🐢', label: 'Turtle' },
    { min: 30, emoji: '🐳', label: 'Whale' }
];

// --- DOM ELEMENTS ---
const logSessionBtn = document.getElementById('logSessionBtn');
const aquariumBtn = document.getElementById('aquariumBtn');
const aboutBtn = document.getElementById('aboutBtn');
const sessionSection = document.getElementById('sessionSection');
const aquariumSection = document.getElementById('aquariumSection');
const aboutSection = document.getElementById('aboutSection');
const sessionList = document.getElementById('sessionList');
const aquarium = document.getElementById('aquarium');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
logSessionBtn.onclick = () => showLogSessionModal();
aquariumBtn.onclick = () => showSection('aquarium');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    sessionSection.classList.add('hidden');
    aquariumSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'sessions') sessionSection.classList.remove('hidden');
    if (section === 'aquarium') aquariumSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
    if (section === 'sessions') renderSessionList();
    if (section === 'aquarium') renderAquarium();
}

// --- SESSION LIST ---
function renderSessionList() {
    sessionList.innerHTML = '';
    if (sessions.length === 0) {
        sessionList.innerHTML = '<p>No sessions yet. Log your first one!</p>';
        return;
    }
    sessions.slice().reverse().forEach((session, idx) => {
        const card = document.createElement('div');
        card.className = 'session-card';
        card.innerHTML = `
            <span class="session-date">${session.date}</span>
            <span class="session-meta">${session.type} - ${session.duration} min</span>
            <span class="session-meta">${session.notes}</span>
            <div class="session-actions">
                <button onclick="editSession(${sessions.length - 1 - idx})">Edit</button>
                <button onclick="deleteSession(${sessions.length - 1 - idx})">Delete</button>
            </div>
        `;
        sessionList.appendChild(card);
    });
}
window.editSession = function(idx) {
    showLogSessionModal(sessions[idx], idx);
};
window.deleteSession = function(idx) {
    if (confirm('Delete this session?')) {
        sessions.splice(idx, 1);
        localStorage.setItem('maSessions', JSON.stringify(sessions));
        renderSessionList();
        renderAquarium();
        hideModal();
    }
};

// --- LOG/EDIT SESSION MODAL ---
function showLogSessionModal(session = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${session ? 'Edit' : 'Log'} Session</h2>
        <label>Date: <input id="sessionDate" type="date" value="${session ? session.date : ''}" required></label><br><br>
        <label>Duration (min): <input id="sessionDuration" type="number" min="1" max="180" value="${session ? session.duration : ''}" required></label><br><br>
        <label>Type:
            <select id="sessionType">
                <option value="Meditation" ${session && session.type === 'Meditation' ? 'selected' : ''}>Meditation</option>
                <option value="Mindfulness" ${session && session.type === 'Mindfulness' ? 'selected' : ''}>Mindfulness</option>
            </select>
        </label><br><br>
        <label>Notes:<br><textarea id="sessionNotes" style="width:100%;height:60px;">${session ? session.notes : ''}</textarea></label><br><br>
        <button onclick="submitSession(${idx !== null ? idx : ''})">${session ? 'Save' : 'Log'} Session</button>
    `;
    showModal();
}
window.submitSession = function(idx) {
    const date = document.getElementById('sessionDate').value;
    const duration = parseInt(document.getElementById('sessionDuration').value);
    const type = document.getElementById('sessionType').value;
    const notes = document.getElementById('sessionNotes').value.trim();
    if (!date || isNaN(duration) || !type) {
        alert('Please fill all required fields.');
        return;
    }
    // Determine aquatic
    let aquatic = aquaticRewards[0].emoji;
    for (let i = aquaticRewards.length - 1; i >= 0; i--) {
        if (duration >= aquaticRewards[i].min) {
            aquatic = aquaticRewards[i].emoji;
            break;
        }
    }
    const session = { date, duration, type, notes, aquatic };
    if (idx !== undefined && idx !== null && sessions[idx]) {
        sessions[idx] = session;
    } else {
        sessions.push(session);
    }
    localStorage.setItem('maSessions', JSON.stringify(sessions));
    renderSessionList();
    renderAquarium();
    hideModal();
};

// --- AQUARIUM ---
function renderAquarium() {
    aquarium.innerHTML = '';
    if (sessions.length === 0) {
        aquarium.innerHTML = '<p>No aquatic life yet. Log sessions to grow your aquarium!</p>';
        return;
    }
    // Aquatic life
    sessions.forEach(session => {
        const aquaticDiv = document.createElement('div');
        aquaticDiv.className = 'aquatic';
        aquaticDiv.innerHTML = `
            <div class="aquatic-emoji">${session.aquatic}</div>
            <div class="aquatic-label">${session.date}<br><span style="font-size:0.9em;">${session.type}</span></div>
        `;
        aquarium.appendChild(aquaticDiv);
    });
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
    renderSessionList();
    renderAquarium();
    showSection('sessions');
}
init();
