// app.js - Virtual Plant Caretaker
// LocalStorage keys: plants, lastCare
let plants = JSON.parse(localStorage.getItem('plants') || '[]');
let lastCare = JSON.parse(localStorage.getItem('lastCare') || '{}');

const addPlantForm = document.getElementById('add-plant-form');
const plantNameInput = document.getElementById('plant-name');
const plantTypeSelect = document.getElementById('plant-type');
const gardenDiv = document.getElementById('garden');
const enableRemindersBtn = document.getElementById('enable-reminders');
const botanyInfoDiv = document.getElementById('botany-info');

const plantCareInfo = {
    succulent: { water: 7, tip: 'Water once a week. Needs bright, indirect sunlight.' },
    fern: { water: 3, tip: 'Keep soil moist. Likes humidity and indirect light.' },
    cactus: { water: 14, tip: 'Water every 2 weeks. Needs lots of sunlight.' },
    herb: { water: 2, tip: 'Water every 2 days. Needs 4-6 hours of sunlight.' },
    flower: { water: 3, tip: 'Water every 3 days. Needs moderate sunlight.' },
    tree: { water: 7, tip: 'Water once a week. Needs full sun.' }
};

function saveState() {
    localStorage.setItem('plants', JSON.stringify(plants));
    localStorage.setItem('lastCare', JSON.stringify(lastCare));
}

addPlantForm.onsubmit = e => {
    e.preventDefault();
    const name = plantNameInput.value.trim();
    const type = plantTypeSelect.value;
    if (!name) return;
    plants.push({ name, type });
    lastCare[name] = { watered: null };
    saveState();
    renderGarden();
    renderBotanyInfo();
    plantNameInput.value = '';
};

function renderGarden() {
    gardenDiv.innerHTML = '';
    plants.forEach(plant => {
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.innerHTML = `
            <div class="plant-name">${plant.name}</div>
            <div class="plant-type">${plant.type.charAt(0).toUpperCase() + plant.type.slice(1)}</div>
        `;
        const care = lastCare[plant.name] || { watered: null };
        const daysSince = care.watered ? Math.floor((Date.now() - care.watered) / (1000*60*60*24)) : null;
        const info = plantCareInfo[plant.type];
        const status = document.createElement('div');
        status.className = 'care-status';
        if (care.watered) {
            status.textContent = `Last watered: ${daysSince} day(s) ago`;
        } else {
            status.textContent = 'Never watered';
        }
        card.appendChild(status);
        const waterBtn = document.createElement('button');
        waterBtn.className = 'care-btn';
        waterBtn.textContent = 'Water Plant';
        waterBtn.onclick = () => {
            lastCare[plant.name] = { watered: Date.now() };
            saveState();
            renderGarden();
        };
        card.appendChild(waterBtn);
        const removeBtn = document.createElement('button');
        removeBtn.className = 'care-btn';
        removeBtn.textContent = 'Remove Plant';
        removeBtn.onclick = () => {
            plants = plants.filter(p => p.name !== plant.name);
            delete lastCare[plant.name];
            saveState();
            renderGarden();
            renderBotanyInfo();
        };
        card.appendChild(removeBtn);
        const tip = document.createElement('div');
        tip.style.fontSize = '0.95em';
        tip.style.color = '#2563eb';
        tip.textContent = info.tip;
        card.appendChild(tip);
        gardenDiv.appendChild(card);
    });
}

enableRemindersBtn.onclick = () => {
    if (Notification.permission === 'granted') {
        scheduleReminders();
    } else {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') scheduleReminders();
        });
    }
};

function scheduleReminders() {
    setInterval(() => {
        plants.forEach(plant => {
            const care = lastCare[plant.name] || { watered: null };
            const info = plantCareInfo[plant.type];
            const daysSince = care.watered ? Math.floor((Date.now() - care.watered) / (1000*60*60*24)) : null;
            if (!care.watered || daysSince >= info.water) {
                new Notification('Plant Care Reminder', {
                    body: `Time to water your ${plant.name} (${plant.type})!`
                });
            }
        });
    }, 24 * 60 * 60 * 1000); // every 24 hours
    alert('Plant care reminders enabled!');
}

function renderBotanyInfo() {
    if (plants.length === 0) {
        botanyInfoDiv.innerHTML = '<p>Add a plant to see facts and tips!</p>';
        return;
    }
    let html = '';
    plants.forEach(plant => {
        const info = plantCareInfo[plant.type];
        html += `<b>${plant.name} (${plant.type}):</b> ${info.tip}<br>`;
    });
    botanyInfoDiv.innerHTML = html;
}

// Initial render
renderGarden();
renderBotanyInfo();
