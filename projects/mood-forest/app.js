// Mood Forest
// Features: Log daily mood, each mood grows a unique tree or flower, modals, localStorage, modern UI

let moods = JSON.parse(localStorage.getItem('mfMoods') || 'null') || [
    { date: '2026-02-14', mood: 'Happy', notes: 'Great day!', plant: '🌳' },
    { date: '2026-02-15', mood: 'Calm', notes: 'Relaxed and peaceful', plant: '🌲' },
    { date: '2026-02-16', mood: 'Excited', notes: 'Looking forward to new things', plant: '🌸' }
];
const moodPlants = {
    'Happy': { emoji: '🌳', label: 'Oak Tree' },
    'Sad': { emoji: '🌧️', label: 'Rain Cloud' },
    'Calm': { emoji: '🌲', label: 'Pine Tree' },
    'Excited': { emoji: '🌸', label: 'Cherry Blossom' },
    'Angry': { emoji: '🌵', label: 'Cactus' },
    'Tired': { emoji: '🌱', label: 'Sprout' },
    'Anxious': { emoji: '🍂', label: 'Fallen Leaf' },
    'Grateful': { emoji: '🌻', label: 'Sunflower' },
    'Motivated': { emoji: '🌼', label: 'Daisy' },
    'Other': { emoji: '🍀', label: 'Clover' }
};

// --- DOM ELEMENTS ---
const logMoodBtn = document.getElementById('logMoodBtn');
const forestBtn = document.getElementById('forestBtn');
const aboutBtn = document.getElementById('aboutBtn');
const moodSection = document.getElementById('moodSection');
const forestSection = document.getElementById('forestSection');
const aboutSection = document.getElementById('aboutSection');
const moodList = document.getElementById('moodList');
const forest = document.getElementById('forest');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
logMoodBtn.onclick = () => showLogMoodModal();
forestBtn.onclick = () => showSection('forest');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    moodSection.classList.add('hidden');
    forestSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'moods') moodSection.classList.remove('hidden');
    if (section === 'forest') forestSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
    if (section === 'moods') renderMoodList();
    if (section === 'forest') renderForest();
}

// --- MOOD LIST ---
function renderMoodList() {
    moodList.innerHTML = '';
    if (moods.length === 0) {
        moodList.innerHTML = '<p>No moods logged yet. Log your first one!</p>';
        return;
    }
    moods.slice().reverse().forEach((mood, idx) => {
        const card = document.createElement('div');
        card.className = 'mood-card';
        card.innerHTML = `
            <span class="mood-date">${mood.date}</span>
            <span class="mood-meta">${mood.mood}</span>
            <span class="mood-meta">${mood.notes}</span>
            <div class="mood-actions">
                <button onclick="editMood(${moods.length - 1 - idx})">Edit</button>
                <button onclick="deleteMood(${moods.length - 1 - idx})">Delete</button>
            </div>
        `;
        moodList.appendChild(card);
    });
}
window.editMood = function(idx) {
    showLogMoodModal(moods[idx], idx);
};
window.deleteMood = function(idx) {
    if (confirm('Delete this mood?')) {
        moods.splice(idx, 1);
        localStorage.setItem('mfMoods', JSON.stringify(moods));
        renderMoodList();
        renderForest();
        hideModal();
    }
};

// --- LOG/EDIT MOOD MODAL ---
function showLogMoodModal(mood = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${mood ? 'Edit' : 'Log'} Mood</h2>
        <label>Date: <input id="moodDate" type="date" value="${mood ? mood.date : ''}" required></label><br><br>
        <label>Mood:
            <select id="moodType">
                ${Object.keys(moodPlants).map(m => `<option value="${m}" ${mood && mood.mood === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
        </label><br><br>
        <label>Notes:<br><textarea id="moodNotes" style="width:100%;height:60px;">${mood ? mood.notes : ''}</textarea></label><br><br>
        <button onclick="submitMood(${idx !== null ? idx : ''})">${mood ? 'Save' : 'Log'} Mood</button>
    `;
    showModal();
}
window.submitMood = function(idx) {
    const date = document.getElementById('moodDate').value;
    const mood = document.getElementById('moodType').value;
    const notes = document.getElementById('moodNotes').value.trim();
    const plant = moodPlants[mood]?.emoji || moodPlants['Other'].emoji;
    if (!date || !mood) {
        alert('Please fill all required fields.');
        return;
    }
    const entry = { date, mood, notes, plant };
    if (idx !== undefined && idx !== null && moods[idx]) {
        moods[idx] = entry;
    } else {
        moods.push(entry);
    }
    localStorage.setItem('mfMoods', JSON.stringify(moods));
    renderMoodList();
    renderForest();
    hideModal();
};

// --- FOREST ---
function renderForest() {
    forest.innerHTML = '';
    if (moods.length === 0) {
        forest.innerHTML = '<p>No trees or flowers yet. Log your mood to grow your forest!</p>';
        return;
    }
    moods.forEach(mood => {
        const plantDiv = document.createElement('div');
        plantDiv.className = ['Happy','Calm','Excited','Grateful','Motivated'].includes(mood.mood) ? 'tree' : 'flower';
        plantDiv.innerHTML = `
            <div class="${plantDiv.className}-emoji">${mood.plant}</div>
            <div class="${plantDiv.className}-label">${mood.date}<br><span style="font-size:0.9em;">${mood.mood}</span></div>
        `;
        forest.appendChild(plantDiv);
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
    renderMoodList();
    renderForest();
    showSection('moods');
}
init();
