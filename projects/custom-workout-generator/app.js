// Custom Workout Generator App
// Author: Ayaanshaikh12243
// Description: Build and randomize workout routines based on user goals

// --- State Management ---
const state = {
    workouts: [], // {id, name, goal, exercises: [{name, sets, reps, type}]}
    view: 'dashboard',
    settings: {
        theme: 'default',
        goals: [
            { label: 'Strength', value: 'strength' },
            { label: 'Endurance', value: 'endurance' },
            { label: 'Flexibility', value: 'flexibility' },
            { label: 'Weight Loss', value: 'weightloss' },
            { label: 'General Fitness', value: 'general' },
        ],
        exercisePool: [
            { name: 'Push-ups', type: 'strength', sets: 3, reps: 12 },
            { name: 'Squats', type: 'strength', sets: 3, reps: 15 },
            { name: 'Plank', type: 'endurance', sets: 3, reps: 60 },
            { name: 'Jumping Jacks', type: 'endurance', sets: 3, reps: 30 },
            { name: 'Lunges', type: 'strength', sets: 3, reps: 12 },
            { name: 'Burpees', type: 'weightloss', sets: 3, reps: 10 },
            { name: 'Mountain Climbers', type: 'weightloss', sets: 3, reps: 20 },
            { name: 'Yoga Stretch', type: 'flexibility', sets: 2, reps: 60 },
            { name: 'High Knees', type: 'endurance', sets: 3, reps: 30 },
            { name: 'Sit-ups', type: 'strength', sets: 3, reps: 15 },
            { name: 'Bicycle Crunches', type: 'weightloss', sets: 3, reps: 20 },
            { name: 'Hamstring Stretch', type: 'flexibility', sets: 2, reps: 60 },
            { name: 'Side Plank', type: 'endurance', sets: 2, reps: 45 },
            { name: 'Tricep Dips', type: 'strength', sets: 3, reps: 12 },
            { name: 'Wall Sit', type: 'endurance', sets: 2, reps: 60 },
        ],
    },
    selectedWorkout: null,
};

// --- Utility Functions ---
function saveState() {
    localStorage.setItem('workoutGenState', JSON.stringify(state));
}
function loadState() {
    const saved = localStorage.getItem('workoutGenState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.workouts = parsed.workouts || [];
        state.view = parsed.view || 'dashboard';
        state.settings = parsed.settings || state.settings;
        state.selectedWorkout = parsed.selectedWorkout || null;
    }
}
function uuid() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// --- Navigation ---
function setView(view) {
    state.view = view;
    saveState();
    render();
}
document.getElementById('dashboardBtn').onclick = () => setView('dashboard');
document.getElementById('generatorBtn').onclick = () => setView('generator');
document.getElementById('workoutsBtn').onclick = () => setView('workouts');
document.getElementById('settingsBtn').onclick = () => setView('settings');

// --- Render Functions ---
function render() {
    const main = document.getElementById('mainContent');
    switch (state.view) {
        case 'dashboard':
            main.innerHTML = renderDashboard();
            break;
        case 'generator':
            main.innerHTML = renderGenerator();
            break;
        case 'workouts':
            main.innerHTML = renderWorkouts();
            break;
        case 'settings':
            main.innerHTML = renderSettings();
            break;
    }
    attachEventListeners();
}
// ... (continued for 500+ lines, including generator logic, workout CRUD, stats, and settings)
