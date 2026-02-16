// Fitness Island
// Features: Log workouts, each activity adds features (mountains, rivers, animals) to your island, modals, localStorage, modern UI

let workouts = JSON.parse(localStorage.getItem('fiWorkouts') || 'null') || [
    { date: '2026-02-14', type: 'Run', duration: 30, notes: 'Morning jog', feature: '⛰️' },
    { date: '2026-02-15', type: 'Swim', duration: 45, notes: 'Pool laps', feature: '🌊' },
    { date: '2026-02-16', type: 'Yoga', duration: 20, notes: 'Stretching', feature: '🌴' }
];
const featureRewards = [
    { type: 'Run', emoji: '⛰️', label: 'Mountain' },
    { type: 'Swim', emoji: '🌊', label: 'River' },
    { type: 'Yoga', emoji: '🌴', label: 'Palm Tree' },
    { type: 'Bike', emoji: '🚲', label: 'Trail' },
    { type: 'Hike', emoji: '🦅', label: 'Eagle' },
    { type: 'Strength', emoji: '🦍', label: 'Gorilla' },
    { type: 'Dance', emoji: '🦩', label: 'Flamingo' },
    { type: 'Walk', emoji: '🐢', label: 'Tortoise' },
    { type: 'Row', emoji: '🚣', label: 'Boat' },
    { type: 'Other', emoji: '🏝️', label: 'Island' }
];

// --- DOM ELEMENTS ---
const logWorkoutBtn = document.getElementById('logWorkoutBtn');
const islandBtn = document.getElementById('islandBtn');
const aboutBtn = document.getElementById('aboutBtn');
const workoutSection = document.getElementById('workoutSection');
const islandSection = document.getElementById('islandSection');
const aboutSection = document.getElementById('aboutSection');
const workoutList = document.getElementById('workoutList');
const island = document.getElementById('island');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
logWorkoutBtn.onclick = () => showLogWorkoutModal();
islandBtn.onclick = () => showSection('island');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    workoutSection.classList.add('hidden');
    islandSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'workouts') workoutSection.classList.remove('hidden');
    if (section === 'island') islandSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
    if (section === 'workouts') renderWorkoutList();
    if (section === 'island') renderIsland();
}

// --- WORKOUT LIST ---
function renderWorkoutList() {
    workoutList.innerHTML = '';
    if (workouts.length === 0) {
        workoutList.innerHTML = '<p>No workouts yet. Log your first one!</p>';
        return;
    }
    workouts.slice().reverse().forEach((workout, idx) => {
        const card = document.createElement('div');
        card.className = 'workout-card';
        card.innerHTML = `
            <span class="workout-date">${workout.date}</span>
            <span class="workout-meta">${workout.type} - ${workout.duration} min</span>
            <span class="workout-meta">${workout.notes}</span>
            <div class="workout-actions">
                <button onclick="editWorkout(${workouts.length - 1 - idx})">Edit</button>
                <button onclick="deleteWorkout(${workouts.length - 1 - idx})">Delete</button>
            </div>
        `;
        workoutList.appendChild(card);
    });
}
window.editWorkout = function(idx) {
    showLogWorkoutModal(workouts[idx], idx);
};
window.deleteWorkout = function(idx) {
    if (confirm('Delete this workout?')) {
        workouts.splice(idx, 1);
        localStorage.setItem('fiWorkouts', JSON.stringify(workouts));
        renderWorkoutList();
        renderIsland();
        hideModal();
    }
};

// --- LOG/EDIT WORKOUT MODAL ---
function showLogWorkoutModal(workout = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${workout ? 'Edit' : 'Log'} Workout</h2>
        <label>Date: <input id="workoutDate" type="date" value="${workout ? workout.date : ''}" required></label><br><br>
        <label>Type:
            <select id="workoutType">
                <option value="Run" ${workout && workout.type === 'Run' ? 'selected' : ''}>Run</option>
                <option value="Swim" ${workout && workout.type === 'Swim' ? 'selected' : ''}>Swim</option>
                <option value="Yoga" ${workout && workout.type === 'Yoga' ? 'selected' : ''}>Yoga</option>
                <option value="Bike" ${workout && workout.type === 'Bike' ? 'selected' : ''}>Bike</option>
                <option value="Hike" ${workout && workout.type === 'Hike' ? 'selected' : ''}>Hike</option>
                <option value="Strength" ${workout && workout.type === 'Strength' ? 'selected' : ''}>Strength</option>
                <option value="Dance" ${workout && workout.type === 'Dance' ? 'selected' : ''}>Dance</option>
                <option value="Walk" ${workout && workout.type === 'Walk' ? 'selected' : ''}>Walk</option>
                <option value="Row" ${workout && workout.type === 'Row' ? 'selected' : ''}>Row</option>
                <option value="Other" ${workout && workout.type === 'Other' ? 'selected' : ''}>Other</option>
            </select>
        </label><br><br>
        <label>Duration (min): <input id="workoutDuration" type="number" min="1" max="300" value="${workout ? workout.duration : ''}" required></label><br><br>
        <label>Notes:<br><textarea id="workoutNotes" style="width:100%;height:60px;">${workout ? workout.notes : ''}</textarea></label><br><br>
        <button onclick="submitWorkout(${idx !== null ? idx : ''})">${workout ? 'Save' : 'Log'} Workout</button>
    `;
    showModal();
}
window.submitWorkout = function(idx) {
    const date = document.getElementById('workoutDate').value;
    const type = document.getElementById('workoutType').value;
    const duration = parseInt(document.getElementById('workoutDuration').value);
    const notes = document.getElementById('workoutNotes').value.trim();
    if (!date || !type || isNaN(duration)) {
        alert('Please fill all required fields.');
        return;
    }
    // Determine feature
    let feature = featureRewards.find(f => f.type === type)?.emoji || featureRewards.find(f => f.type === 'Other').emoji;
    const workout = { date, type, duration, notes, feature };
    if (idx !== undefined && idx !== null && workouts[idx]) {
        workouts[idx] = workout;
    } else {
        workouts.push(workout);
    }
    localStorage.setItem('fiWorkouts', JSON.stringify(workouts));
    renderWorkoutList();
    renderIsland();
    hideModal();
};

// --- ISLAND ---
function renderIsland() {
    island.innerHTML = '';
    if (workouts.length === 0) {
        island.innerHTML = '<p>No features yet. Log workouts to grow your island!</p>';
        return;
    }
    // Features
    workouts.forEach(workout => {
        const featureDiv = document.createElement('div');
        featureDiv.className = 'feature';
        featureDiv.innerHTML = `
            <div class="feature-emoji">${workout.feature}</div>
            <div class="feature-label">${workout.type}<br><span style="font-size:0.9em;">${workout.date}</span></div>
        `;
        island.appendChild(featureDiv);
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
    renderWorkoutList();
    renderIsland();
    showSection('workouts');
}
init();
