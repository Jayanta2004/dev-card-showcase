// Virtual Habit Garden
// Features: Log daily habits, each habit is a plant, garden view, modals, localStorage, modern UI

let habits = JSON.parse(localStorage.getItem('vhgHabits') || 'null') || [
    { name: 'Drink Water', streak: 3, lastLogged: '2026-02-15', emoji: '🌱' },
    { name: 'Read 10 Pages', streak: 5, lastLogged: '2026-02-15', emoji: '🌷' },
    { name: 'Morning Walk', streak: 1, lastLogged: '2026-02-14', emoji: '🌻' }
];
const plantStages = [
    { min: 0, emoji: '🌱', label: 'Seedling' },
    { min: 2, emoji: '🌿', label: 'Sprout' },
    { min: 5, emoji: '🌷', label: 'Bud' },
    { min: 10, emoji: '🌻', label: 'Bloom' },
    { min: 20, emoji: '🌳', label: 'Tree' }
];

// --- DOM ELEMENTS ---
const addHabitBtn = document.getElementById('addHabitBtn');
const gardenBtn = document.getElementById('gardenBtn');
const aboutBtn = document.getElementById('aboutBtn');
const habitSection = document.getElementById('habitSection');
const gardenSection = document.getElementById('gardenSection');
const aboutSection = document.getElementById('aboutSection');
const habitList = document.getElementById('habitList');
const garden = document.getElementById('garden');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
addHabitBtn.onclick = () => showAddHabitModal();
gardenBtn.onclick = () => showSection('garden');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    habitSection.classList.add('hidden');
    gardenSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'habits') habitSection.classList.remove('hidden');
    if (section === 'garden') gardenSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
    if (section === 'garden') renderGarden();
    if (section === 'habits') renderHabitList();
}

// --- HABIT LIST ---
function renderHabitList() {
    habitList.innerHTML = '';
    if (habits.length === 0) {
        habitList.innerHTML = '<p>No habits yet. Add your first one!</p>';
        return;
    }
    habits.forEach((habit, idx) => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        card.innerHTML = `
            <span class="habit-title">${habit.name}</span>
            <span class="habit-meta">Streak: ${habit.streak} days</span>
            <span class="habit-meta">Last logged: ${habit.lastLogged}</span>
            <div class="habit-actions">
                <button onclick="logHabit(${idx})">Log Today</button>
                <button onclick="editHabit(${idx})">Edit</button>
                <button onclick="deleteHabit(${idx})">Delete</button>
            </div>
        `;
        habitList.appendChild(card);
    });
}
window.logHabit = function(idx) {
    const today = new Date().toISOString().slice(0, 10);
    if (habits[idx].lastLogged === today) {
        alert('Already logged today!');
        return;
    }
    const last = new Date(habits[idx].lastLogged);
    const diff = (new Date(today) - last) / (1000 * 60 * 60 * 24);
    habits[idx].streak = diff === 1 ? habits[idx].streak + 1 : 1;
    habits[idx].lastLogged = today;
    localStorage.setItem('vhgHabits', JSON.stringify(habits));
    renderHabitList();
    renderGarden();
};
window.editHabit = function(idx) {
    showAddHabitModal(habits[idx], idx);
};
window.deleteHabit = function(idx) {
    if (confirm('Delete this habit?')) {
        habits.splice(idx, 1);
        localStorage.setItem('vhgHabits', JSON.stringify(habits));
        renderHabitList();
        renderGarden();
        hideModal();
    }
};

// --- ADD/EDIT HABIT MODAL ---
function showAddHabitModal(habit = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${habit ? 'Edit' : 'Add'} Habit</h2>
        <input id="habitName" placeholder="Habit Name" value="${habit ? habit.name : ''}" style="width:100%;margin-bottom:8px;">
        <select id="habitEmoji" style="width:100%;margin-bottom:8px;">
            <option value="🌱" ${habit && habit.emoji === '🌱' ? 'selected' : ''}>🌱 Seedling</option>
            <option value="🌿" ${habit && habit.emoji === '🌿' ? 'selected' : ''}>🌿 Sprout</option>
            <option value="🌷" ${habit && habit.emoji === '🌷' ? 'selected' : ''}>🌷 Bud</option>
            <option value="🌻" ${habit && habit.emoji === '🌻' ? 'selected' : ''}>🌻 Bloom</option>
            <option value="🌳" ${habit && habit.emoji === '🌳' ? 'selected' : ''}>🌳 Tree</option>
        </select>
        <button onclick="submitHabit(${idx !== null ? idx : ''})">${habit ? 'Save' : 'Add'} Habit</button>
    `;
    showModal();
}
window.submitHabit = function(idx) {
    const name = document.getElementById('habitName').value.trim();
    const emoji = document.getElementById('habitEmoji').value;
    if (!name) {
        alert('Please enter a habit name.');
        return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const habit = { name, streak: 0, lastLogged: '', emoji };
    if (idx !== undefined && idx !== null && habits[idx]) {
        habits[idx].name = name;
        habits[idx].emoji = emoji;
    } else {
        habits.push(habit);
    }
    localStorage.setItem('vhgHabits', JSON.stringify(habits));
    renderHabitList();
    renderGarden();
    hideModal();
};

// --- GARDEN ---
function renderGarden() {
    garden.innerHTML = '';
    if (habits.length === 0) {
        garden.innerHTML = '<p>No plants yet. Add habits to grow your garden!</p>';
        return;
    }
    habits.forEach(habit => {
        const stage = plantStages.slice().reverse().find(s => habit.streak >= s.min) || plantStages[0];
        const plantDiv = document.createElement('div');
        plantDiv.className = 'plant';
        plantDiv.innerHTML = `
            <div class="plant-emoji">${stage.emoji}</div>
            <div class="plant-label">${habit.name}<br><span style="font-size:0.9em;">${stage.label} (${habit.streak}d)</span></div>
        `;
        garden.appendChild(plantDiv);
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
    renderHabitList();
    renderGarden();
    showSection('habits');
}
init();
