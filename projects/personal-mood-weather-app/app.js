// Personal Mood Weather App
// Author: Ayaanshaikh12243
// Features: Mood logging, mood weather visualization, modals, localStorage, modern UI, sample data

// --- GLOBALS ---
const sampleData = [
    { date: '2026-02-10', mood: 'Happy', emoji: '😄', notes: 'Had a great day with friends.' },
    { date: '2026-02-11', mood: 'Cloudy', emoji: '😐', notes: 'Felt a bit off, but nothing bad.' },
    { date: '2026-02-12', mood: 'Rainy', emoji: '😢', notes: 'Was sad about some news.' },
    { date: '2026-02-13', mood: 'Sunny', emoji: '😊', notes: 'Productive and positive.' },
    { date: '2026-02-14', mood: 'Stormy', emoji: '😠', notes: 'Had an argument, felt angry.' },
    { date: '2026-02-15', mood: 'Windy', emoji: '😶‍🌫️', notes: 'Felt scattered, hard to focus.' },
    { date: '2026-02-16', mood: 'Sunny', emoji: '😊', notes: 'Feeling good and hopeful.' }
];
let moods = JSON.parse(localStorage.getItem('moodWeatherData') || 'null') || sampleData;

// --- DOM ELEMENTS ---
const addMoodBtn = document.getElementById('addMoodBtn');
const historyBtn = document.getElementById('historyBtn');
const aboutBtn = document.getElementById('aboutBtn');
const moodTodaySection = document.getElementById('moodTodaySection');
const historySection = document.getElementById('historySection');
const aboutSection = document.getElementById('aboutSection');
const moodToday = document.getElementById('moodToday');
const moodHistory = document.getElementById('moodHistory');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
addMoodBtn.onclick = () => showAddMoodModal();
historyBtn.onclick = () => showSection('history');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    moodTodaySection.classList.add('hidden');
    historySection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'today') moodTodaySection.classList.remove('hidden');
    if (section === 'history') historySection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
}

// --- MOOD TODAY ---
function renderMoodToday() {
    moodToday.innerHTML = '';
    const today = new Date().toISOString().slice(0, 10);
    const entry = moods.find(m => m.date === today);
    if (entry) {
        moodToday.appendChild(createMoodCard(entry));
    } else {
        moodToday.innerHTML = '<p>No mood logged for today.</p>';
    }
}
function createMoodCard(entry) {
    const card = document.createElement('div');
    card.className = 'mood-card';
    card.innerHTML = `
        <span class="mood-emoji">${entry.emoji}</span>
        <span class="mood-title">${entry.mood}</span>
        <span class="mood-meta">${entry.notes}</span>
        <span class="mood-meta">${entry.date}</span>
        <button onclick="editMood('${entry.date}')">Edit</button>
        <button onclick="deleteMood('${entry.date}')">Delete</button>
    `;
    return card;
}
window.editMood = function(date) {
    const entry = moods.find(m => m.date === date);
    showAddMoodModal(entry);
};
window.deleteMood = function(date) {
    if (confirm('Delete this mood entry?')) {
        moods = moods.filter(m => m.date !== date);
        localStorage.setItem('moodWeatherData', JSON.stringify(moods));
        renderMoodToday();
        renderMoodHistory();
        hideModal();
    }
};

// --- ADD/EDIT MOOD MODAL ---
function showAddMoodModal(entry = null) {
    modalBody.innerHTML = `
        <h2>${entry ? 'Edit' : 'Log'} Mood</h2>
        <input id="moodDate" type="date" value="${entry ? entry.date : new Date().toISOString().slice(0,10)}" style="width:100%;margin-bottom:8px;">
        <select id="moodType" style="width:100%;margin-bottom:8px;">
            <option value="Sunny">Sunny 😊</option>
            <option value="Cloudy">Cloudy 😐</option>
            <option value="Rainy">Rainy 😢</option>
            <option value="Stormy">Stormy 😠</option>
            <option value="Windy">Windy 😶‍🌫️</option>
            <option value="Happy">Happy 😄</option>
        </select>
        <input id="moodEmoji" placeholder="Emoji (e.g. 😊)" value="${entry ? entry.emoji : ''}" style="width:100%;margin-bottom:8px;">
        <textarea id="moodNotes" placeholder="Notes" style="width:100%;margin-bottom:8px;">${entry ? entry.notes : ''}</textarea>
        <button onclick="submitMood('${entry ? entry.date : ''}')">${entry ? 'Save' : 'Log'} Mood</button>
    `;
    showModal();
    if (entry) {
        document.getElementById('moodType').value = entry.mood;
    }
}
window.submitMood = function(oldDate) {
    const date = document.getElementById('moodDate').value;
    const mood = document.getElementById('moodType').value;
    const emoji = document.getElementById('moodEmoji').value.trim() || '😊';
    const notes = document.getElementById('moodNotes').value.trim();
    if (!date || !mood || !emoji) {
        alert('Please fill all required fields.');
        return;
    }
    const entry = { date, mood, emoji, notes };
    moods = moods.filter(m => m.date !== oldDate && m.date !== date);
    moods.push(entry);
    moods.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem('moodWeatherData', JSON.stringify(moods));
    renderMoodToday();
    renderMoodHistory();
    hideModal();
};

// --- MOOD HISTORY ---
function renderMoodHistory() {
    moodHistory.innerHTML = '';
    moods.forEach(entry => {
        const row = document.createElement('div');
        row.className = 'mood-history-row';
        row.innerHTML = `
            <span class="mood-history-date">${entry.date}</span>
            <span class="mood-history-emoji">${entry.emoji}</span>
            <span class="mood-history-notes">${entry.mood} - ${entry.notes}</span>
            <button onclick="editMood('${entry.date}')">Edit</button>
            <button onclick="deleteMood('${entry.date}')">Delete</button>
        `;
        moodHistory.appendChild(row);
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
    renderMoodToday();
    renderMoodHistory();
    showSection('today');
}
init();

// --- EXTENSIONS: More Features ---
// 1. Mood weather chart visualization
// 2. Export/import mood data
// 3. Mood streaks and stats
// 4. Accessibility improvements
// 5. Animations and UI transitions
// 6. Data validation and error handling
// 7. Statistics dashboard
// ... (This file can be extended further as needed)
