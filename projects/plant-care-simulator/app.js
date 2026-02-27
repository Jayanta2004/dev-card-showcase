// Virtual Plant Care Simulator - app.js
// Core logic for plant CRUD, growth, reminders, and facts

const addPlantBtn = document.getElementById('add-plant-btn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const plantForm = document.getElementById('plant-form');
const plantList = document.getElementById('plant-list');
const plantNameInput = document.getElementById('plant-name');
const plantTypeInput = document.getElementById('plant-type');
const plantDetailSection = document.getElementById('plant-detail-section');
const plantDetail = document.getElementById('plant-detail');
const backToListBtn = document.getElementById('back-to-list');

const plantFacts = {
  'Cactus': 'Cacti store water in their stems and thrive in dry environments.',
  'Fern': 'Ferns love humidity and indirect sunlight.',
  'Succulent': 'Succulents need well-draining soil and infrequent watering.',
  'Orchid': 'Orchids prefer bright, indirect light and high humidity.',
  'Bonsai': 'Bonsai trees require regular pruning and careful watering.',
  'Aloe Vera': 'Aloe Vera is known for its medicinal properties and easy care.'
};

let plants = [];
let editingPlantIdx = null;

function savePlants() {
  localStorage.setItem('plants', JSON.stringify(plants));
}

function loadPlants() {
  const data = localStorage.getItem('plants');
  if (data) {
    plants = JSON.parse(data);
  } else {
    // Load sample data
    fetch('plants.json')
      .then(res => res.json())
      .then(sample => {
        plants = sample;
        savePlants();
        renderPlantList();
      });
  }
}

function renderPlantList() {
  plantList.innerHTML = '';
  if (plants.length === 0) {
    plantList.innerHTML = '<li>No plants yet. Add one!</li>';
    return;
  }
  plants.forEach((plant, idx) => {
    const li = document.createElement('li');
    li.className = 'plant-item';
    li.innerHTML = `
      <span>${plant.name} (${plant.type})</span>
      <div class="growth-bar"><div class="growth" style="width:${plant.growth}%"></div></div>
    `;
    li.addEventListener('click', () => showPlantDetail(idx));
    plantList.appendChild(li);
  });
}

function showPlantDetail(idx) {
  const plant = plants[idx];
  plantDetailSection.classList.remove('hidden');
  document.getElementById('plant-list-section').classList.add('hidden');
  plantDetail.innerHTML = `
    <h3>${plant.name} (${plant.type})</h3>
    <div class="growth-bar"><div class="growth" style="width:${plant.growth}%"></div></div>
    <div>Growth: <b>${plant.growth}%</b></div>
    <div>Last watered: <b>${formatDate(plant.lastWatered)}</b></div>
    <div class="plant-fact">${plantFacts[plant.type] || ''}</div>
    <div class="reminder">${getWaterReminder(plant)}</div>
    <div class="actions">
      <button id="water-btn">Water</button>
      <button id="delete-btn">Delete</button>
      <button id="edit-btn">Edit</button>
    </div>
  `;
  document.getElementById('water-btn').addEventListener('click', () => waterPlant(idx));
  document.getElementById('delete-btn').addEventListener('click', () => deletePlant(idx));
  document.getElementById('edit-btn').addEventListener('click', () => openEditPlant(idx));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function getWaterReminder(plant) {
  const now = new Date();
  const last = new Date(plant.lastWatered);
  const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  if (diff >= 2) return 'Needs watering!';
  if (diff === 1) return 'Water soon.';
  return 'All good!';
}

function waterPlant(idx) {
  plants[idx].lastWatered = new Date().toISOString();
  plants[idx].growth = Math.min(100, plants[idx].growth + 10);
  savePlants();
  showPlantDetail(idx);
  renderPlantList();
}

function deletePlant(idx) {
  if (confirm('Delete this plant?')) {
    plants.splice(idx, 1);
    savePlants();
    renderPlantList();
    plantDetailSection.classList.add('hidden');
    document.getElementById('plant-list-section').classList.remove('hidden');
  }
}

function openAddPlant() {
  editingPlantIdx = null;
  plantForm.reset();
  plantTypeInput.value = '';
  modal.classList.remove('hidden');
}

function openEditPlant(idx) {
  editingPlantIdx = idx;
  const plant = plants[idx];
  plantNameInput.value = plant.name;
  plantTypeInput.value = plant.type;
  modal.classList.remove('hidden');
}

function closeModalFunc() {
  modal.classList.add('hidden');
}

plantForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = plantNameInput.value.trim();
  const type = plantTypeInput.value;
  if (name && type) {
    if (editingPlantIdx !== null) {
      plants[editingPlantIdx].name = name;
      plants[editingPlantIdx].type = type;
    } else {
      plants.push({ name, type, growth: 0, lastWatered: new Date().toISOString() });
    }
    savePlants();
    renderPlantList();
    closeModalFunc();
  }
});

addPlantBtn.addEventListener('click', openAddPlant);
closeModal.addEventListener('click', closeModalFunc);
window.addEventListener('click', e => {
  if (e.target === modal) closeModalFunc();
});
backToListBtn.addEventListener('click', () => {
  plantDetailSection.classList.add('hidden');
  document.getElementById('plant-list-section').classList.remove('hidden');
});

// Initial load
loadPlants();
renderPlantList();
