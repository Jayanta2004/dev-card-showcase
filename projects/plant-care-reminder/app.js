// Plant Care Reminder App
// Author: Ayaanshaikh12243
// Description: Track watering, fertilizing, and sunlight needs for houseplants

// --- State Management ---
const state = {
    plants: [], // {id, name, species, image, notes, care: {watering, fertilizing, sunlight}}
    tasks: [], // {id, plantId, type, date, completed}
    view: 'dashboard',
    selectedPlant: null,
    settings: {
        weekStart: 'Sunday',
        theme: 'default',
        taskTypes: [
            { label: 'Watering', value: 'watering', color: '#4caf50' },
            { label: 'Fertilizing', value: 'fertilizing', color: '#ff9800' },
            { label: 'Sunlight', value: 'sunlight', color: '#ffd600' },
        ],
    },
};

// --- Utility Functions ---
function saveState() {
    localStorage.setItem('plantCareState', JSON.stringify(state));
}
function loadState() {
    const saved = localStorage.getItem('plantCareState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.plants = parsed.plants || [];
        state.tasks = parsed.tasks || [];
        state.view = parsed.view || 'dashboard';
        state.selectedPlant = parsed.selectedPlant || null;
        state.settings = parsed.settings || state.settings;
    }
}
function uuid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}
function getToday() {
    return new Date().toISOString().slice(0, 10);
}
function getMonthDays(year, month) {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
}
function getWeekdayNames() {
    return state.settings.weekStart === 'Monday'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}
function getTaskColor(type) {
    const t = state.settings.taskTypes.find(t => t.value === type);
    return t ? t.color : '#4caf50';
}

// --- Navigation ---
function setView(view) {
    state.view = view;
    saveState();
    render();
}
document.getElementById('dashboardBtn').onclick = () => setView('dashboard');
document.getElementById('plantsBtn').onclick = () => setView('plants');
document.getElementById('tasksBtn').onclick = () => setView('tasks');
document.getElementById('calendarBtn').onclick = () => setView('calendar');
document.getElementById('settingsBtn').onclick = () => setView('settings');

// --- Render Functions ---
function render() {
    const main = document.getElementById('mainContent');
    switch (state.view) {
        case 'dashboard':
            main.innerHTML = renderDashboard();
            break;
        case 'plants':
            main.innerHTML = renderPlants();
            break;
        case 'tasks':
            main.innerHTML = renderTasks();
            break;
        case 'calendar':
            main.innerHTML = renderCalendar();
            break;
        case 'settings':
            main.innerHTML = renderSettings();
            break;
    }
    attachEventListeners();
}
// --- Dashboard View ---
function renderDashboard() {
    const totalPlants = state.plants.length;
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.completed).length;
    const upcomingTasks = state.tasks.filter(t => !t.completed && new Date(t.date) >= new Date(getToday())).length;
    return `
        <h2>Dashboard</h2>
        <div class="stats">
            <div class="stat">Total Plants: <strong>${totalPlants}</strong></div>
            <div class="stat">Total Tasks: <strong>${totalTasks}</strong></div>
            <div class="stat">Completed Tasks: <strong>${completedTasks}</strong></div>
            <div class="stat">Upcoming Tasks: <strong>${upcomingTasks}</strong></div>
        </div>
        <div class="plant-list">
            <h3>Plants</h3>
            ${state.plants.map(plant => `<div class="plant-item" data-id="${plant.id}">
                <span style="font-weight:bold;">${plant.name}</span>
                <span>${plant.species || ''}</span>
                <div class="actions">
                    <button class="edit-plant">Edit</button>
                    <button class="delete-plant">Delete</button>
                </div>
            </div>`).join('')}
        </div>
        <div class="task-list">
            <h3>Upcoming Tasks</h3>
            ${state.tasks.filter(t => !t.completed && new Date(t.date) >= new Date(getToday())).slice(0, 5).map(task => {
                const plant = state.plants.find(p => p.id === task.plantId);
                return `<div class="task-item">
                    <span style="color:${getTaskColor(task.type)};font-weight:bold;">${task.type.charAt(0).toUpperCase() + task.type.slice(1)}</span>
                    <span>${plant ? plant.name : 'Unknown Plant'}</span>
                    <span>${task.date}</span>
                </div>`;
            }).join('')}
        </div>`;
}

// --- Plants View ---
function renderPlants() {
    let html = `<h2>Plants</h2>
        <form id="plantForm">
            <input type="text" id="plantName" placeholder="Plant Name" required />
            <input type="text" id="plantSpecies" placeholder="Species (optional)" />
            <input type="url" id="plantImage" placeholder="Image URL (optional)" />
            <textarea id="plantNotes" placeholder="Notes (optional)"></textarea>
            <button type="submit">Add Plant</button>
        </form>
        <div class="plant-list">
            ${state.plants.map(plant => `
                <div class="plant-item" data-id="${plant.id}">
                    <span style="font-weight:bold;">${plant.name}</span>
                    <span>${plant.species || ''}</span>
                    <div class="actions">
                        <button class="edit-plant">Edit</button>
                        <button class="delete-plant">Delete</button>
                        <button class="manage-care">Care</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div id="careManager"></div>`;
    return html;
}

// --- Care Manager ---
function renderCareManager(plantId) {
    const plant = state.plants.find(p => p.id === plantId);
    if (!plant) return '';
    let html = `<h3>Manage Care for ${plant.name}</h3>
        <form id="careForm">
            <label>Watering Frequency (days): <input type="number" id="wateringFreq" min="1" value="${plant.care?.watering || ''}" /></label><br>
            <label>Fertilizing Frequency (days): <input type="number" id="fertilizingFreq" min="1" value="${plant.care?.fertilizing || ''}" /></label><br>
            <label>Sunlight Hours (per day): <input type="number" id="sunlightHours" min="0" max="24" value="${plant.care?.sunlight || ''}" /></label><br>
            <button type="submit">Save Care</button>
        </form>`;
    return html;
}

// --- Tasks View ---
function renderTasks() {
    let html = `<h2>Tasks</h2>
        <form id="taskForm">
            <select id="taskPlant">
                ${state.plants.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
            <select id="taskType">
                ${state.settings.taskTypes.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
            </select>
            <input type="date" id="taskDate" required />
            <button type="submit">Add Task</button>
        </form>
        <div class="task-list">
            ${state.tasks.map(task => {
                const plant = state.plants.find(p => p.id === task.plantId);
                return `<div class="task-item" data-id="${task.id}">
                    <span style="color:${getTaskColor(task.type)};font-weight:bold;">${task.type.charAt(0).toUpperCase() + task.type.slice(1)}</span>
                    <span>${plant ? plant.name : 'Unknown Plant'}</span>
                    <span>${task.date}</span>
                    <span>${task.completed ? '✅' : '❌'}</span>
                    <div class="actions">
                        <button class="toggle-task">${task.completed ? 'Mark Incomplete' : 'Mark Complete'}</button>
                        <button class="delete-task">Delete</button>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    return html;
}

// --- Calendar View ---
function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const days = getMonthDays(year, month);
    const weekDays = getWeekdayNames();
    let html = `<h2>Care Calendar</h2>`;
    html += `<div class="calendar">
        ${weekDays.map(d => `<div class="calendar-day" style="font-weight:bold;">${d}</div>`).join('')}
        ${days.map(day => {
            const dateStr = day.toISOString().slice(0, 10);
            const tasks = state.tasks.filter(t => t.date === dateStr);
            let cell = '';
            tasks.forEach(task => {
                const plant = state.plants.find(p => p.id === task.plantId);
                cell += `<div class="task-dot" data-id="${task.id}" style="background:${getTaskColor(task.type)}" title="${task.type} for ${plant ? plant.name : 'Unknown'}"></div>`;
            });
            return `<div class="calendar-day${dateStr === getToday() ? ' today' : ''}">
                <div class="date-label">${day.getDate()}</div>
                <div class="task-dots">${cell}</div>
            </div>`;
        }).join('')}
    </div>`;
    return html;
}

// --- Settings View ---
function renderSettings() {
    return `<h2>Settings</h2>
        <div class="settings">
            <label>Week Start:
                <select id="weekStart">
                    <option value="Sunday"${state.settings.weekStart==='Sunday'?' selected':''}>Sunday</option>
                    <option value="Monday"${state.settings.weekStart==='Monday'?' selected':''}>Monday</option>
                </select>
            </label>
            <br><br>
            <label>Theme:
                <select id="theme">
                    <option value="default"${state.settings.theme==='default'?' selected':''}>Default</option>
                    <option value="dark"${state.settings.theme==='dark'?' selected':''}>Dark</option>
                </select>
            </label>
        </div>`;
}

// --- Event Listeners ---
function attachEventListeners() {
    // Plant Form
    const plantForm = document.getElementById('plantForm');
    if (plantForm) {
        plantForm.onsubmit = function(e) {
            e.preventDefault();
            const name = document.getElementById('plantName').value.trim();
            const species = document.getElementById('plantSpecies').value.trim();
            const image = document.getElementById('plantImage').value.trim();
            const notes = document.getElementById('plantNotes').value.trim();
            if (name) {
                state.plants.push({ id: uuid(), name, species, image, notes, care: {} });
                saveState();
                render();
            }
        };
        document.querySelectorAll('.edit-plant').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.plant-item').getAttribute('data-id');
                editPlant(id);
            };
        });
        document.querySelectorAll('.delete-plant').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.plant-item').getAttribute('data-id');
                state.plants = state.plants.filter(p => p.id !== id);
                // Remove tasks for this plant
                state.tasks = state.tasks.filter(t => t.plantId !== id);
                saveState();
                render();
            };
        });
        document.querySelectorAll('.manage-care').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.plant-item').getAttribute('data-id');
                state.selectedPlant = id;
                document.getElementById('careManager').innerHTML = renderCareManager(id);
                attachCareManagerListeners(id);
            };
        });
    }
    // Care Form
    const careForm = document.getElementById('careForm');
    if (careForm) {
        careForm.onsubmit = function(e) {
            e.preventDefault();
            const watering = parseInt(document.getElementById('wateringFreq').value, 10);
            const fertilizing = parseInt(document.getElementById('fertilizingFreq').value, 10);
            const sunlight = parseInt(document.getElementById('sunlightHours').value, 10);
            const plant = state.plants.find(p => p.id === state.selectedPlant);
            if (plant) {
                plant.care = { watering, fertilizing, sunlight };
                saveState();
                render();
            }
        };
    }
    // Task Form
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.onsubmit = function(e) {
            e.preventDefault();
            const plantId = document.getElementById('taskPlant').value;
            const type = document.getElementById('taskType').value;
            const date = document.getElementById('taskDate').value;
            if (plantId && type && date) {
                state.tasks.push({ id: uuid(), plantId, type, date, completed: false });
                saveState();
                render();
            }
        };
        document.querySelectorAll('.toggle-task').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.task-item').getAttribute('data-id');
                const task = state.tasks.find(t => t.id === id);
                if (task) {
                    task.completed = !task.completed;
                    saveState();
                    render();
                }
            };
        });
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.onclick = function() {
                const id = this.closest('.task-item').getAttribute('data-id');
                state.tasks = state.tasks.filter(t => t.id !== id);
                saveState();
                render();
            };
        });
    }
    // Settings
    const weekStart = document.getElementById('weekStart');
    if (weekStart) {
        weekStart.onchange = function() {
            state.settings.weekStart = this.value;
            saveState();
            render();
        };
    }
    const theme = document.getElementById('theme');
    if (theme) {
        theme.onchange = function() {
            state.settings.theme = this.value;
            document.body.className = this.value;
            saveState();
        };
    }
}

// --- Edit Plant Modal (Simple Prompt) ---
function editPlant(id) {
    const plant = state.plants.find(p => p.id === id);
    if (!plant) return;
    const name = prompt('Edit plant name:', plant.name);
    const species = prompt('Edit species:', plant.species);
    const image = prompt('Edit image URL:', plant.image);
    const notes = prompt('Edit notes:', plant.notes);
    if (name !== null && name.trim() !== '') {
        plant.name = name.trim();
        plant.species = species || '';
        plant.image = image || '';
        plant.notes = notes || '';
        saveState();
        render();
    }
}

// --- Attach Care Manager Listeners ---
function attachCareManagerListeners(plantId) {
    const careForm = document.getElementById('careForm');
    if (careForm) {
        careForm.onsubmit = function(e) {
            e.preventDefault();
            const watering = parseInt(document.getElementById('wateringFreq').value, 10);
            const fertilizing = parseInt(document.getElementById('fertilizingFreq').value, 10);
            const sunlight = parseInt(document.getElementById('sunlightHours').value, 10);
            const plant = state.plants.find(p => p.id === plantId);
            if (plant) {
                plant.care = { watering, fertilizing, sunlight };
                saveState();
                document.getElementById('careManager').innerHTML = renderCareManager(plantId);
                attachCareManagerListeners(plantId);
            }
        };
    }
}

// --- Initialization ---
loadState();
render();
}
