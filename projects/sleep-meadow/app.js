// Sleep Meadow
// Features: Log sleep, track quality, meadow blooms with flowers and wildlife, modals, localStorage, modern UI

let sleepLog = JSON.parse(localStorage.getItem('smSleepLog') || 'null') || [
    { date: '2026-02-14', hours: 7.5, quality: 'Good', notes: 'Felt rested', flower: '🌸', animal: '' },
    { date: '2026-02-15', hours: 6, quality: 'Average', notes: 'Woke up once', flower: '🌼', animal: '' },
    { date: '2026-02-16', hours: 8, quality: 'Excellent', notes: 'Slept through', flower: '🌻', animal: '🦋' }
];
const flowerStages = [
    { min: 0, emoji: '🌱', label: 'Sprout' },
    { min: 6, emoji: '🌼', label: 'Daisy' },
    { min: 7, emoji: '🌸', label: 'Cherry Blossom' },
    { min: 8, emoji: '🌻', label: 'Sunflower' }
];
const animalRewards = [
    { streak: 3, emoji: '🦋', label: 'Butterfly' },
    { streak: 7, emoji: '🐦', label: 'Bird' },
    { streak: 14, emoji: '🐇', label: 'Rabbit' },
    { streak: 21, emoji: '🦌', label: 'Deer' }
];

// --- DOM ELEMENTS ---
const logSleepBtn = document.getElementById('logSleepBtn');
const meadowBtn = document.getElementById('meadowBtn');
const aboutBtn = document.getElementById('aboutBtn');
const sleepSection = document.getElementById('sleepSection');
const meadowSection = document.getElementById('meadowSection');
const aboutSection = document.getElementById('aboutSection');
const sleepList = document.getElementById('sleepList');
const meadow = document.getElementById('meadow');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
logSleepBtn.onclick = () => showLogSleepModal();
meadowBtn.onclick = () => showSection('meadow');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    sleepSection.classList.add('hidden');
    meadowSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'sleep') sleepSection.classList.remove('hidden');
    if (section === 'meadow') meadowSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
    if (section === 'meadow') renderMeadow();
    if (section === 'sleep') renderSleepList();
}

// --- SLEEP LOG ---
function renderSleepList() {
    sleepList.innerHTML = '';
    if (sleepLog.length === 0) {
        sleepList.innerHTML = '<p>No sleep logs yet. Log your first night!</p>';
        return;
    }
    sleepLog.slice().reverse().forEach((entry, idx) => {
        const card = document.createElement('div');
        card.className = 'sleep-card';
        card.innerHTML = `
            <span class="sleep-date">${entry.date}</span>
            <span class="sleep-meta">Hours: ${entry.hours}</span>
            <span class="sleep-meta">Quality: ${entry.quality}</span>
            <span class="sleep-meta">${entry.notes}</span>
            <div class="sleep-actions">
                <button onclick="editSleep(${sleepLog.length - 1 - idx})">Edit</button>
                <button onclick="deleteSleep(${sleepLog.length - 1 - idx})">Delete</button>
            </div>
        `;
        sleepList.appendChild(card);
    });
}
window.editSleep = function(idx) {
    showLogSleepModal(sleepLog[idx], idx);
};
window.deleteSleep = function(idx) {
    if (confirm('Delete this entry?')) {
        sleepLog.splice(idx, 1);
        localStorage.setItem('smSleepLog', JSON.stringify(sleepLog));
        renderSleepList();
        renderMeadow();
        hideModal();
    }
};

// --- LOG/EDIT SLEEP MODAL ---
function showLogSleepModal(entry = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${entry ? 'Edit' : 'Log'} Sleep</h2>
        <label>Date: <input id="sleepDate" type="date" value="${entry ? entry.date : ''}" required></label><br><br>
        <label>Hours Slept: <input id="sleepHours" type="number" min="0" max="24" step="0.1" value="${entry ? entry.hours : ''}" required></label><br><br>
        <label>Quality:
            <select id="sleepQuality">
                <option value="Excellent" ${entry && entry.quality === 'Excellent' ? 'selected' : ''}>Excellent</option>
                <option value="Good" ${entry && entry.quality === 'Good' ? 'selected' : ''}>Good</option>
                <option value="Average" ${entry && entry.quality === 'Average' ? 'selected' : ''}>Average</option>
                <option value="Poor" ${entry && entry.quality === 'Poor' ? 'selected' : ''}>Poor</option>
            </select>
        </label><br><br>
        <label>Notes:<br><textarea id="sleepNotes" style="width:100%;height:60px;">${entry ? entry.notes : ''}</textarea></label><br><br>
        <button onclick="submitSleep(${idx !== null ? idx : ''})">${entry ? 'Save' : 'Log'} Sleep</button>
    `;
    showModal();
}
window.submitSleep = function(idx) {
    const date = document.getElementById('sleepDate').value;
    const hours = parseFloat(document.getElementById('sleepHours').value);
    const quality = document.getElementById('sleepQuality').value;
    const notes = document.getElementById('sleepNotes').value.trim();
    if (!date || isNaN(hours) || !quality) {
        alert('Please fill all required fields.');
        return;
    }
    // Determine flower
    let flower = flowerStages[0].emoji;
    for (let i = flowerStages.length - 1; i >= 0; i--) {
        if (hours >= flowerStages[i].min) {
            flower = flowerStages[i].emoji;
            break;
        }
    }
    // Determine animal
    let animal = '';
    const streak = getSleepStreak();
    for (let i = animalRewards.length - 1; i >= 0; i--) {
        if (streak >= animalRewards[i].streak) {
            animal = animalRewards[i].emoji;
            break;
        }
    }
    const entry = { date, hours, quality, notes, flower, animal };
    if (idx !== undefined && idx !== null && sleepLog[idx]) {
        sleepLog[idx] = entry;
    } else {
        sleepLog.push(entry);
    }
    localStorage.setItem('smSleepLog', JSON.stringify(sleepLog));
    renderSleepList();
    renderMeadow();
    hideModal();
};

// --- MEADOW ---
function renderMeadow() {
    meadow.innerHTML = '';
    if (sleepLog.length === 0) {
        meadow.innerHTML = '<p>No flowers or animals yet. Log your sleep to grow your meadow!</p>';
        return;
    }
    // Flowers
    sleepLog.forEach(entry => {
        const flowerDiv = document.createElement('div');
        flowerDiv.className = 'flower';
        flowerDiv.innerHTML = `
            <div class="flower-emoji">${entry.flower}</div>
            <div class="flower-label">${entry.date}<br><span style="font-size:0.9em;">${entry.quality}</span></div>
        `;
        meadow.appendChild(flowerDiv);
    });
    // Animals (if any)
    const animalSet = new Set();
    sleepLog.forEach(entry => { if (entry.animal) animalSet.add(entry.animal); });
    animalSet.forEach(animal => {
        const animalDiv = document.createElement('div');
        animalDiv.className = 'animal';
        animalDiv.innerHTML = `
            <div class="animal-emoji">${animal}</div>
            <div class="animal-label">Wildlife</div>
        `;
        meadow.appendChild(animalDiv);
    });
}

// --- STREAKS ---
function getSleepStreak() {
    if (sleepLog.length === 0) return 0;
    let streak = 1;
    let prev = new Date(sleepLog[sleepLog.length - 1].date);
    for (let i = sleepLog.length - 2; i >= 0; i--) {
        const curr = new Date(sleepLog[i].date);
        if ((prev - curr) / (1000 * 60 * 60 * 24) === 1) {
            streak++;
            prev = curr;
        } else {
            break;
        }
    }
    return streak;
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
    renderSleepList();
    renderMeadow();
    showSection('sleep');
}
init();
