// Digital Plant Care Assistant
// Author: Ayaanshaikh12243
// Features: Plant logging, reminders, health tracking, modals, localStorage, modern UI

// --- GLOBALS ---
let plants = JSON.parse(localStorage.getItem('plants') || '[]');
let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
let healthLogs = JSON.parse(localStorage.getItem('healthLogs') || '{}');

// --- DOM ELEMENTS ---
const addPlantBtn = document.getElementById('addPlantBtn');
const remindersBtn = document.getElementById('remindersBtn');
const healthBtn = document.getElementById('healthBtn');
const plantListSection = document.getElementById('plantListSection');
const remindersSection = document.getElementById('remindersSection');
const healthSection = document.getElementById('healthSection');
const plantList = document.getElementById('plantList');
const remindersUl = document.getElementById('remindersUl');
const healthList = document.getElementById('healthList');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
addPlantBtn.onclick = () => showAddPlantModal();
remindersBtn.onclick = () => showSection('reminders');
healthBtn.onclick = () => showSection('health');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    plantListSection.classList.add('hidden');
    remindersSection.classList.add('hidden');
    healthSection.classList.add('hidden');
    if (section === 'plants') plantListSection.classList.remove('hidden');
    if (section === 'reminders') remindersSection.classList.remove('hidden');
    if (section === 'health') healthSection.classList.remove('hidden');
}

// --- PLANT LIST ---
function renderPlantList() {
    plantList.innerHTML = '';
    plants.forEach((plant, idx) => {
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.innerHTML = `
            <img src="${plant.image}" alt="${plant.name}">
            <span class="plant-title">${plant.name}</span>
            <span class="plant-meta">Type: ${plant.type}</span>
            <span class="plant-meta">Water: Every ${plant.waterFreq} days</span>
            <span class="plant-meta">Fertilize: Every ${plant.fertilizeFreq} days</span>
            <div class="plant-actions">
                <button class="plant-btn" onclick="showPlantDetails(${idx})">Details</button>
                <button class="plant-btn" onclick="logHealth(${idx})">Log Health</button>
            </div>
        `;
        plantList.appendChild(card);
    });
}
window.showPlantDetails = function(idx) {
    const plant = plants[idx];
    modalBody.innerHTML = `
        <h2>${plant.name}</h2>
        <img src="${plant.image}" alt="${plant.name}" style="width:100%;border-radius:8px;max-width:320px;">
        <p><b>Type:</b> ${plant.type}</p>
        <p><b>Water Frequency:</b> Every ${plant.waterFreq} days</p>
        <p><b>Fertilize Frequency:</b> Every ${plant.fertilizeFreq} days</p>
        <p><b>Notes:</b> ${plant.notes}</p>
        <button onclick="editPlant(${idx})">Edit</button>
        <button onclick="deletePlant(${idx})">Delete</button>
    `;
    showModal();
};
window.editPlant = function(idx) {
    showAddPlantModal(plants[idx], idx);
};
window.deletePlant = function(idx) {
    if (confirm('Delete this plant?')) {
        plants.splice(idx, 1);
        localStorage.setItem('plants', JSON.stringify(plants));
        renderPlantList();
        hideModal();
    }
};

// --- ADD/EDIT PLANT MODAL ---
function showAddPlantModal(plant = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${plant ? 'Edit' : 'Add'} Plant</h2>
        <input id="plantName" placeholder="Name" value="${plant ? plant.name : ''}" style="width:100%;margin-bottom:8px;">
        <input id="plantType" placeholder="Type (e.g. Succulent)" value="${plant ? plant.type : ''}" style="width:100%;margin-bottom:8px;">
        <input id="plantImage" placeholder="Image URL" value="${plant ? plant.image : ''}" style="width:100%;margin-bottom:8px;">
        <input id="waterFreq" type="number" min="1" placeholder="Water every N days" value="${plant ? plant.waterFreq : 7}" style="width:100%;margin-bottom:8px;">
        <input id="fertilizeFreq" type="number" min="1" placeholder="Fertilize every N days" value="${plant ? plant.fertilizeFreq : 30}" style="width:100%;margin-bottom:8px;">
        <textarea id="plantNotes" placeholder="Notes" style="width:100%;margin-bottom:8px;">${plant ? plant.notes : ''}</textarea>
        <button onclick="submitPlant(${idx !== null ? idx : ''})">${plant ? 'Save' : 'Add'} Plant</button>
    `;
    showModal();
}
window.submitPlant = function(idx) {
    const name = document.getElementById('plantName').value.trim();
    const type = document.getElementById('plantType').value.trim();
    const image = document.getElementById('plantImage').value.trim() || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
    const waterFreq = parseInt(document.getElementById('waterFreq').value) || 7;
    const fertilizeFreq = parseInt(document.getElementById('fertilizeFreq').value) || 30;
    const notes = document.getElementById('plantNotes').value.trim();
    if (!name || !type) {
        alert('Please fill all required fields.');
        return;
    }
    const plant = { name, type, image, waterFreq, fertilizeFreq, notes };
    if (idx !== undefined && idx !== null && plants[idx]) {
        plants[idx] = plant;
    } else {
        plants.push(plant);
    }
    localStorage.setItem('plants', JSON.stringify(plants));
    renderPlantList();
    hideModal();
};

// --- REMINDERS ---
function renderReminders() {
    remindersUl.innerHTML = '';
    const now = new Date();
    plants.forEach((plant, idx) => {
        // Watering
        const lastWatered = reminders.find(r => r.plantIdx === idx && r.type === 'water');
        const nextWater = lastWatered ? new Date(lastWatered.date) : null;
        let nextWaterDue = nextWater ? new Date(nextWater.getTime() + plant.waterFreq * 86400000) : now;
        let waterDue = nextWaterDue <= now;
        // Fertilizing
        const lastFertilized = reminders.find(r => r.plantIdx === idx && r.type === 'fertilize');
        const nextFertilize = lastFertilized ? new Date(lastFertilized.date) : null;
        let nextFertilizeDue = nextFertilize ? new Date(nextFertilize.getTime() + plant.fertilizeFreq * 86400000) : now;
        let fertilizeDue = nextFertilizeDue <= now;
        // Render
        const li = document.createElement('li');
        li.className = 'reminder-item';
        li.innerHTML = `
            <b>${plant.name}</b> - 
            <span>Water: <span style="color:${waterDue?'#e74c3c':'#2e4d2c'}">${waterDue?'Due':'OK'}</span></span> |
            <span>Fertilize: <span style="color:${fertilizeDue?'#e67e22':'#2e4d2c'}">${fertilizeDue?'Due':'OK'}</span></span>
            <button onclick="markWatered(${idx})">Mark Watered</button>
            <button onclick="markFertilized(${idx})">Mark Fertilized</button>
        `;
        remindersUl.appendChild(li);
    });
}
window.markWatered = function(idx) {
    reminders.push({ plantIdx: idx, type: 'water', date: new Date().toISOString() });
    localStorage.setItem('reminders', JSON.stringify(reminders));
    renderReminders();
};
window.markFertilized = function(idx) {
    reminders.push({ plantIdx: idx, type: 'fertilize', date: new Date().toISOString() });
    localStorage.setItem('reminders', JSON.stringify(reminders));
    renderReminders();
};

// --- HEALTH TRACKER ---
function renderHealthList() {
    healthList.innerHTML = '';
    plants.forEach((plant, idx) => {
        const logs = healthLogs[idx] || [];
        const lastLog = logs.length ? logs[logs.length-1] : null;
        const div = document.createElement('div');
        div.className = 'health-card';
        div.innerHTML = `
            <span><b>${plant.name}</b></span>
            <span>Last: ${lastLog ? lastLog.status : 'No logs'}</span>
            <span class="health-status">${lastLog ? lastLog.date : ''}</span>
            <button onclick="logHealth(${idx})">Log</button>
        `;
        healthList.appendChild(div);
    });
}
window.logHealth = function(idx) {
    modalBody.innerHTML = `
        <h2>Log Health for ${plants[idx].name}</h2>
        <select id="healthStatus">
            <option value="Healthy">Healthy</option>
            <option value="Wilting">Wilting</option>
            <option value="Yellow Leaves">Yellow Leaves</option>
            <option value="Pests">Pests</option>
            <option value="Other">Other</option>
        </select>
        <textarea id="healthNotes" placeholder="Notes" style="width:100%;margin-top:8px;"></textarea>
        <button onclick="submitHealthLog(${idx})">Log</button>
    `;
    showModal();
};
window.submitHealthLog = function(idx) {
    const status = document.getElementById('healthStatus').value;
    const notes = document.getElementById('healthNotes').value.trim();
    if (!healthLogs[idx]) healthLogs[idx] = [];
    healthLogs[idx].push({ status, notes, date: new Date().toLocaleString() });
    localStorage.setItem('healthLogs', JSON.stringify(healthLogs));
    renderHealthList();
    hideModal();
};

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
    renderPlantList();
    renderReminders();
    renderHealthList();
    showSection('plants');
}
init();

// --- EXTENSIONS: More Features ---
// 1. Edit/Delete Health Logs
// 2. Plant Image Gallery
// 3. Export/Import Plant Data
// 4. Notification API for Reminders
// 5. Plant Care Tips Modal
// 6. Accessibility Improvements
// 7. Animations and Transitions
// 8. Data Validation and Error Handling
// 9. Statistics Dashboard
// ... (This file can be extended further as needed)
