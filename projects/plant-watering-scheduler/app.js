// Plant Watering Scheduler
// Add, edit, delete plants, schedule, reminders, care tips, history

const plantForm = document.getElementById('plant-form');
const plantNameEl = document.getElementById('plant-name');
const wateringIntervalEl = document.getElementById('watering-interval');
const lastWateredEl = document.getElementById('last-watered');
const plantListEl = document.getElementById('plant-list');
const editSection = document.getElementById('edit-section');
const editForm = document.getElementById('edit-form');
const editPlantNameEl = document.getElementById('edit-plant-name');
const editWateringIntervalEl = document.getElementById('edit-watering-interval');
const editLastWateredEl = document.getElementById('edit-last-watered');
const cancelEditBtn = document.getElementById('cancel-edit');
const reminderListEl = document.getElementById('reminder-list');
const tipsEl = document.getElementById('tips');
const historyListEl = document.getElementById('history-list');

let plants = [];
let history = [];
let editIdx = null;

const careTips = {
    'Spider Plant': 'Keep soil slightly moist. Water every 5-7 days. Avoid direct sunlight.',
    'Snake Plant': 'Let soil dry between waterings. Water every 10-14 days. Tolerates low light.',
    'Peace Lily': 'Keep soil moist but not soggy. Water every 7 days. Prefers indirect light.',
    'Succulent': 'Allow soil to dry completely. Water every 14-21 days. Needs bright light.',
    'Fern': 'Keep soil moist. Water every 3-5 days. Likes humidity and indirect light.'
};

// Add plant
plantForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = plantNameEl.value.trim();
    const interval = parseInt(wateringIntervalEl.value);
    const lastWatered = lastWateredEl.value;
    if (name && interval && lastWatered) {
        plants.push({ name, interval, lastWatered });
        renderPlants();
        plantNameEl.value = '';
        wateringIntervalEl.value = '';
        lastWateredEl.value = '';
    }
});

// Render plants
function renderPlants() {
    plantListEl.innerHTML = '';
    plants.forEach((plant, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${plant.name} - Water every ${plant.interval} days (Last watered: ${plant.lastWatered})</span>`;
        // Water button
        const waterBtn = document.createElement('button');
        waterBtn.className = 'water-btn';
        waterBtn.textContent = 'Watered Today';
        waterBtn.onclick = () => {
            plant.lastWatered = new Date().toISOString().split('T')[0];
            logHistory(plant, 'Watered');
            renderPlants();
        };
        li.appendChild(waterBtn);
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => {
            editSection.style.display = 'block';
            editPlantNameEl.value = plant.name;
            editWateringIntervalEl.value = plant.interval;
            editLastWateredEl.value = plant.lastWatered;
            editIdx = idx;
        };
        li.appendChild(editBtn);
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            logHistory(plant, 'Deleted');
            plants.splice(idx, 1);
            renderPlants();
        };
        li.appendChild(deleteBtn);
        plantListEl.appendChild(li);
    });
    renderReminders();
    renderTips();
}

// Edit plant
editForm.addEventListener('submit', e => {
    e.preventDefault();
    if (editIdx !== null) {
        plants[editIdx].name = editPlantNameEl.value.trim();
        plants[editIdx].interval = parseInt(editWateringIntervalEl.value);
        plants[editIdx].lastWatered = editLastWateredEl.value;
        logHistory(plants[editIdx], 'Edited');
        renderPlants();
        editSection.style.display = 'none';
        editIdx = null;
    }
});
cancelEditBtn.onclick = () => {
    editSection.style.display = 'none';
    editIdx = null;
};

// Reminders
function renderReminders() {
    reminderListEl.innerHTML = '';
    plants.forEach(plant => {
        const last = new Date(plant.lastWatered);
        const next = new Date(last.getTime() + plant.interval * 24 * 60 * 60 * 1000);
        const today = new Date();
        const overdue = today > next;
        reminderListEl.innerHTML += `<div>${plant.name}: Next watering ${next.toLocaleDateString()}${overdue ? ' <strong>(Overdue!)</strong>' : ''}</div>`;
    });
}

// Care tips
function renderTips() {
    tipsEl.innerHTML = '';
    plants.forEach(plant => {
        if (careTips[plant.name]) {
            tipsEl.innerHTML += `<div><strong>${plant.name}:</strong> ${careTips[plant.name]}</div>`;
        }
    });
}

// History
function logHistory(plant, action) {
    history.unshift(`${action}: "${plant.name}" at ${new Date().toLocaleString()}`);
    renderHistory();
}
function renderHistory() {
    historyListEl.innerHTML = '';
    history.slice(0, 10).forEach(h => {
        const li = document.createElement('li');
        li.textContent = h;
        historyListEl.appendChild(li);
    });
}

renderPlants();
renderHistory();
