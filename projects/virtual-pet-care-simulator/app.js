// Virtual Pet Care Simulator
// Pet logic, actions, health tracking

const pet = {
    name: 'Fluffy',
    health: 100,
    hunger: 0,
    happiness: 100,
};

const healthEl = document.getElementById('pet-health');
const hungerEl = document.getElementById('pet-hunger');
const happinessEl = document.getElementById('pet-happiness');
const logEl = document.getElementById('activity-log');

function updateStatus() {
    healthEl.textContent = pet.health;
    hungerEl.textContent = pet.hunger;
    happinessEl.textContent = pet.happiness;
}

function logActivity(msg) {
    const li = document.createElement('li');
    li.textContent = msg;
    logEl.insertBefore(li, logEl.firstChild);
    if (logEl.children.length > 10) logEl.removeChild(logEl.lastChild);
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Actions

document.getElementById('feed-btn').onclick = () => {
    pet.hunger = clamp(pet.hunger - 20, 0, 100);
    pet.health = clamp(pet.health + 5, 0, 100);
    logActivity('You fed ' + pet.name + '.');
    updateStatus();
};

document.getElementById('play-btn').onclick = () => {
    pet.happiness = clamp(pet.happiness + 15, 0, 100);
    pet.hunger = clamp(pet.hunger + 10, 0, 100);
    logActivity('You played with ' + pet.name + '.');
    updateStatus();
};

document.getElementById('care-btn').onclick = () => {
    pet.health = clamp(pet.health + 10, 0, 100);
    pet.happiness = clamp(pet.happiness + 5, 0, 100);
    logActivity('You cared for ' + pet.name + '.');
    updateStatus();
};

// Pet status decay over time
setInterval(() => {
    pet.hunger = clamp(pet.hunger + 2, 0, 100);
    pet.happiness = clamp(pet.happiness - 1, 0, 100);
    if (pet.hunger > 80) pet.health = clamp(pet.health - 5, 0, 100);
    if (pet.happiness < 20) pet.health = clamp(pet.health - 2, 0, 100);
    updateStatus();
}, 5000);

updateStatus();
