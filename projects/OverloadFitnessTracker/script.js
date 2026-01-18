// Progressive Overload Fitness Tracker - Main Application

// Application State
const appState = {
    currentSession: null,
    routines: [],
    exercises: [],
    workoutHistory: [],
    personalRecords: {},
    theme: 'light',
    timerInterval: null,
    sessionStartTime: null,
    restTimerInterval: null,
    restTimerInterval: null,
    restTimeRemaining: 0,
    restTimeTotal: 90
};

// DOM Elements
const themeToggle = document.getElementById('toggle-theme');
const currentDateEl = document.getElementById('current-date');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const sessionTimerEl = document.getElementById('session-timer');
const sessionExerciseCountEl = document.getElementById('session-exercise-count');
const startNewSessionBtn = document.getElementById('start-new-session');
const endSessionBtn = document.getElementById('end-session');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const sessionExercisesEl = document.getElementById('session-exercises');
const sessionRoutineSelect = document.getElementById('session-routine');
const createRoutineBtn = document.getElementById('create-routine-btn');
const openRestTimerBtn = document.getElementById('open-rest-timer');
const closeTimerBtn = document.getElementById('close-timer');
const timerStartBtn = document.getElementById('timer-start');
const timerPauseBtn = document.getElementById('timer-pause');
const timerResetBtn = document.getElementById('timer-reset');
const timerMinutesEl = document.getElementById('timer-minutes');
const timerSecondsEl = document.getElementById('timer-seconds');
const presetTimeBtns = document.querySelectorAll('.preset-btn');
const restTimerModal = document.getElementById('rest-timer-modal');
const addExerciseModal = document.getElementById('add-exercise-modal');
const closeExerciseModalBtn = document.getElementById('close-exercise-modal');
const cancelExerciseBtn = document.getElementById('cancel-exercise');
const saveExerciseBtn = document.getElementById('save-exercise');
const exerciseNameInput = document.getElementById('exercise-name');
const exerciseCategorySelect = document.getElementById('exercise-category');
const volumeChartCanvas = document.getElementById('volume-chart');
const timeRangeFilter = document.getElementById('time-range');
const exerciseFilter = document.getElementById('exercise-filter');
const totalWorkoutsEl = document.getElementById('total-workouts');
const totalVolumeEl = document.getElementById('total-volume');
const currentStreakEl = document.getElementById('current-streak');
const personalRecordsEl = document.getElementById('personal-records');
const confettiContainer = document.getElementById('confetti-container');
const routinesContainer = document.querySelector('.routines-container');
const historyList = document.getElementById('history-list');
const historyEmptyState = document.getElementById('history-empty-state');
const historyDateFilter = document.getElementById('history-date');
const historyRoutineFilter = document.getElementById('history-routine');
const createRoutineModal = document.getElementById('create-routine-modal');
const closeRoutineModalBtn = document.getElementById('close-routine-modal');
const cancelRoutineBtn = document.getElementById('cancel-routine');
const saveRoutineBtn = document.getElementById('save-routine');
const routineNameInput = document.getElementById('routine-name');
const routineExercisesList = document.getElementById('routine-exercises-list');

// Chart.js instance
let volumeChart = null;

// Initialize the application
function init() {
    // Set current date
    updateCurrentDate();

    // Load data from localStorage
    loadAppData();

    // Initialize event listeners
    setupEventListeners();

    // Initialize charts
    initCharts();

    // Update footer stats
    updateFooterStats();

    // Start with a new session
    startNewSession();

    // Render initial data
    renderRoutines();
    renderHistory();
}

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
}

// Load application data from localStorage
function loadAppData() {
    // Load theme preference
    const savedTheme = localStorage.getItem('progressiveOverloadTheme');
    if (savedTheme === 'dark') {
        enableDarkTheme();
    }

    // Load routines
    const savedRoutines = localStorage.getItem('progressiveOverloadRoutines');
    if (savedRoutines) {
        appState.routines = JSON.parse(savedRoutines);
    } else {
        // Initialize with sample routines
        initializeSampleData();
    }

    // Load exercises
    const savedExercises = localStorage.getItem('progressiveOverloadExercises');
    if (savedExercises) {
        appState.exercises = JSON.parse(savedExercises);
    }

    // Load workout history
    const savedHistory = localStorage.getItem('progressiveOverloadHistory');
    if (savedHistory) {
        appState.workoutHistory = JSON.parse(savedHistory);
    }

    // Load personal records
    const savedPRs = localStorage.getItem('progressiveOverloadPRs');
    if (savedPRs) {
        appState.personalRecords = JSON.parse(savedPRs);
    }
}

// Initialize with sample data
function initializeSampleData() {
    // Sample exercises
    appState.exercises = [
        { id: 1, name: 'Bench Press', category: 'Chest', notes: 'Barbell flat bench' },
        { id: 2, name: 'Squats', category: 'Legs', notes: 'Barbell back squats' },
        { id: 3, name: 'Deadlift', category: 'Back', notes: 'Conventional deadlift' },
        { id: 4, name: 'Overhead Press', category: 'Shoulders', notes: 'Barbell standing press' },
        { id: 5, name: 'Barbell Rows', category: 'Back', notes: 'Pendlay rows' },
        { id: 6, name: 'Pull-ups', category: 'Back', notes: 'Bodyweight or weighted' },
        { id: 7, name: 'Incline Dumbbell Press', category: 'Chest', notes: '30-45 degree incline' },
        { id: 8, name: 'Romanian Deadlifts', category: 'Legs', notes: 'Focus on hamstrings' }
    ];

    // Sample routines
    appState.routines = [
        {
            id: 1,
            name: 'Push Day',
            exercises: [
                { exerciseId: 1, sets: 3, reps: '8-12' },
                { exerciseId: 4, sets: 3, reps: '8-12' },
                { exerciseId: 7, sets: 3, reps: '10-15' }
            ]
        },
        {
            id: 2,
            name: 'Pull Day',
            exercises: [
                { exerciseId: 3, sets: 3, reps: '5' },
                { exerciseId: 6, sets: 3, reps: '8-12' },
                { exerciseId: 5, sets: 3, reps: '8-12' }
            ]
        },
        {
            id: 3,
            name: 'Leg Day',
            exercises: [
                { exerciseId: 2, sets: 3, reps: '5' },
                { exerciseId: 8, sets: 3, reps: '8-12' }
            ]
        }
    ];

    // Sample workout history
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    appState.workoutHistory = [
        {
            id: 1,
            date: new Date(today.getTime() - (oneDay * 2)).toISOString(),
            routineId: 1,
            duration: 85,
            exercises: [
                {
                    exerciseId: 1,
                    sets: [
                        { reps: 8, weight: 135, unit: 'lbs' },
                        { reps: 8, weight: 155, unit: 'lbs' },
                        { reps: 6, weight: 175, unit: 'lbs' }
                    ]
                },
                {
                    exerciseId: 4,
                    sets: [
                        { reps: 10, weight: 95, unit: 'lbs' },
                        { reps: 10, weight: 95, unit: 'lbs' },
                        { reps: 8, weight: 105, unit: 'lbs' }
                    ]
                }
            ],
            notes: 'Felt strong today. Bench felt good, form was solid.'
        },
        {
            id: 2,
            date: new Date(today.getTime() - (oneDay * 4)).toISOString(),
            routineId: 2,
            duration: 75,
            exercises: [
                {
                    exerciseId: 3,
                    sets: [
                        { reps: 5, weight: 225, unit: 'lbs' },
                        { reps: 5, weight: 275, unit: 'lbs' },
                        { reps: 5, weight: 315, unit: 'lbs' }
                    ]
                }
            ],
            notes: 'Back felt tight. Focused on form over weight.'
        },
        {
            id: 3,
            date: new Date(today.getTime() - (oneDay * 7)).toISOString(),
            routineId: 3,
            duration: 95,
            exercises: [
                {
                    exerciseId: 2,
                    sets: [
                        { reps: 5, weight: 185, unit: 'lbs' },
                        { reps: 5, weight: 225, unit: 'lbs' },
                        { reps: 5, weight: 275, unit: 'lbs' }
                    ]
                }
            ],
            notes: 'PR on squats! Depth was good, no knee pain.'
        }
    ];

    // Sample personal records
    appState.personalRecords = {
        1: { weight: 225, unit: 'lbs', date: new Date(today.getTime() - (oneDay * 2)).toISOString() },
        2: { weight: 315, unit: 'lbs', date: new Date(today.getTime() - (oneDay * 4)).toISOString() },
        3: { weight: 405, unit: 'lbs', date: new Date(today.getTime() - (oneDay * 6)).toISOString() }
    };

    saveAppData();
}

// Save application data to localStorage
function saveAppData() {
    localStorage.setItem('progressiveOverloadTheme', appState.theme);
    localStorage.setItem('progressiveOverloadRoutines', JSON.stringify(appState.routines));
    localStorage.setItem('progressiveOverloadExercises', JSON.stringify(appState.exercises));
    localStorage.setItem('progressiveOverloadHistory', JSON.stringify(appState.workoutHistory));
    localStorage.setItem('progressiveOverloadPRs', JSON.stringify(appState.personalRecords));
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Navigation tabs
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Session controls
    startNewSessionBtn.addEventListener('click', startNewSession);
    endSessionBtn.addEventListener('click', endCurrentSession);
    addExerciseBtn.addEventListener('click', openAddExerciseModal);
    sessionRoutineSelect.addEventListener('change', handleRoutineChange);

    // Rest timer
    openRestTimerBtn.addEventListener('click', openRestTimer);
    closeTimerBtn.addEventListener('click', closeRestTimer);
    timerStartBtn.addEventListener('click', startRestTimer);
    timerPauseBtn.addEventListener('click', pauseRestTimer);
    timerResetBtn.addEventListener('click', resetRestTimer);

    presetTimeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const seconds = parseInt(btn.getAttribute('data-seconds'));
            setRestTimer(seconds);
        });
    });

    // Add exercise modal
    closeExerciseModalBtn.addEventListener('click', closeAddExerciseModal);
    cancelExerciseBtn.addEventListener('click', closeAddExerciseModal);
    saveExerciseBtn.addEventListener('click', saveNewExercise);

    // Chart filters
    timeRangeFilter.addEventListener('change', updateCharts);
    exerciseFilter.addEventListener('change', updateCharts);

    // History filters
    historyDateFilter.addEventListener('change', renderHistory);
    historyRoutineFilter.addEventListener('change', renderHistory);

    // Routine interactions (delegation)
    routinesContainer.addEventListener('click', handleRoutineClick);
    createRoutineBtn.addEventListener('click', openCreateRoutineModal);

    // Create Routine Modal
    closeRoutineModalBtn.addEventListener('click', closeCreateRoutineModal);
    cancelRoutineBtn.addEventListener('click', closeCreateRoutineModal);
    saveRoutineBtn.addEventListener('click', saveNewRoutine);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === restTimerModal) {
            closeRestTimer();
        }
        if (e.target === addExerciseModal) {
            closeAddExerciseModal();
        }
        if (e.target === createRoutineModal) {
            closeCreateRoutineModal();
        }
    });
}

// Theme management
function toggleTheme() {
    if (appState.theme === 'light') {
        enableDarkTheme();
    } else {
        enableLightTheme();
    }
    saveAppData();
}

function enableDarkTheme() {
    document.body.classList.add('dark-theme');
    appState.theme = 'dark';
    themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
}

function enableLightTheme() {
    document.body.classList.remove('dark-theme');
    appState.theme = 'light';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
}

// Tab navigation
function switchTab(tabId) {
    // Update active nav item
    navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Show active tab content
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
            // Refresh chart when progress tab is shown
            if (tabId === 'progress') {
                updateCharts();
            }
        } else {
            content.classList.remove('active');
        }
    });
}

// Session management
function startNewSession() {
    // Clear any existing timer
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
    }

    // Create new session
    appState.currentSession = {
        id: Date.now(),
        startTime: new Date(),
        exercises: [],
        routineId: null
    };

    appState.sessionStartTime = Date.now();

    // Update UI
    updateSessionUI();

    // Start session timer
    appState.timerInterval = setInterval(updateSessionTimer, 1000);

    // Clear session exercises display
    sessionExercisesEl.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-dumbbell"></i>
            <h4>No exercises added yet</h4>
            <p>Start by adding your first exercise or select a routine</p>
        </div>
    `;

    // Reset exercise count
    sessionExerciseCountEl.textContent = '0';
}

function endCurrentSession() {
    if (!appState.currentSession || appState.currentSession.exercises.length === 0) {
        alert('No active session or no exercises logged. Session not saved.');
        return;
    }

    if (confirm('End current workout session and save to history?')) {
        // Calculate duration
        const endTime = Date.now();
        const durationMinutes = Math.floor((endTime - appState.sessionStartTime) / 1000 / 60);

        // Create workout history entry
        const workoutEntry = {
            id: appState.currentSession.id,
            date: new Date().toISOString(),
            routineId: appState.currentSession.routineId,
            duration: durationMinutes,
            exercises: appState.currentSession.exercises,
            notes: prompt('Add any notes about this workout (optional):', '') || ''
        };

        // Add to history
        appState.workoutHistory.unshift(workoutEntry);

        // Check for personal records
        checkForPersonalRecords(workoutEntry);

        // Clear current session
        appState.currentSession = null;

        // Clear timer
        if (appState.timerInterval) {
            clearInterval(appState.timerInterval);
            appState.timerInterval = null;
        }

        // Update UI
        updateSessionUI();
        updateFooterStats();
        updateCharts();

        // Save data
        saveAppData();

        // Show confirmation
        alert('Workout saved to history!');

        // Switch to history tab
        switchTab('history');
    }
}

function updateSessionUI() {
    if (appState.currentSession) {
        sessionTimerEl.textContent = '00:00:00';
        sessionExerciseCountEl.textContent = appState.currentSession.exercises.length.toString();
        endSessionBtn.disabled = false;
    } else {
        sessionTimerEl.textContent = '00:00:00';
        sessionExerciseCountEl.textContent = '0';
        endSessionBtn.disabled = true;
    }
}

function updateSessionTimer() {
    if (!appState.sessionStartTime) return;

    const elapsed = Date.now() - appState.sessionStartTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    sessionTimerEl.textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Exercise management
function openAddExerciseModal() {
    addExerciseModal.style.display = 'flex';
    exerciseNameInput.value = '';
    exerciseCategorySelect.selectedIndex = 0;
    exerciseNameInput.focus();
}

function closeAddExerciseModal() {
    addExerciseModal.style.display = 'none';
}

function saveNewExercise() {
    const name = exerciseNameInput.value.trim();
    const category = exerciseCategorySelect.value;

    if (!name) {
        alert('Please enter an exercise name');
        return;
    }

    // Create new exercise
    const newExercise = {
        id: Date.now(),
        name: name,
        category: category,
        notes: document.getElementById('exercise-notes').value.trim()
    };

    appState.exercises.push(newExercise);

    // Add to current session
    addExerciseToSession(newExercise.id);

    // Save data
    saveAppData();

    // Close modal
    closeAddExerciseModal();
}

function addExerciseToSession(exerciseId) {
    if (!appState.currentSession) {
        startNewSession();
    }

    // Find exercise
    const exercise = appState.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    // Check if exercise already in session
    const existingIndex = appState.currentSession.exercises.findIndex(e => e.exerciseId === exerciseId);

    if (existingIndex >= 0) {
        // Exercise already exists, just highlight it
        highlightExerciseInSession(existingIndex);
        return;
    }

    // Add new exercise to session
    const sessionExercise = {
        exerciseId: exerciseId,
        sets: [
            { reps: '', weight: '', unit: 'lbs' }
        ]
    };

    appState.currentSession.exercises.push(sessionExercise);

    // Update UI
    renderSessionExercises();

    // Update exercise count
    sessionExerciseCountEl.textContent = appState.currentSession.exercises.length.toString();
}

function highlightExerciseInSession(index) {
    const exerciseElements = sessionExercisesEl.querySelectorAll('.exercise-card');
    if (exerciseElements[index]) {
        exerciseElements[index].classList.add('highlight');
        setTimeout(() => {
            exerciseElements[index].classList.remove('highlight');
        }, 1000);
    }
}

function renderSessionExercises() {
    if (!appState.currentSession || appState.currentSession.exercises.length === 0) {
        sessionExercisesEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-dumbbell"></i>
                <h4>No exercises added yet</h4>
                <p>Start by adding your first exercise or select a routine</p>
            </div>
        `;
        return;
    }

    let html = '';

    appState.currentSession.exercises.forEach((sessionExercise, exerciseIndex) => {
        const exercise = appState.exercises.find(e => e.id === sessionExercise.exerciseId);
        if (!exercise) return;

        html += `
            <div class="exercise-card" data-exercise-id="${exercise.id}">
                <div class="exercise-header">
                    <div class="exercise-title">${exercise.name}</div>
                    <div class="exercise-actions">
                        <button class="icon-btn add-set-btn" data-exercise-index="${exerciseIndex}" title="Add Set">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="icon-btn remove-exercise-btn" data-exercise-index="${exerciseIndex}" title="Remove Exercise">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="exercise-sets">
        `;

        sessionExercise.sets.forEach((set, setIndex) => {
            const isPR = checkIfSetIsPR(exercise.id, set.weight);

            html += `
                <div class="set-row">
                    <span class="set-number">Set ${setIndex + 1}</span>
                    <input type="number" class="set-input reps-input" 
                           placeholder="Reps" min="1" max="100"
                           data-exercise-index="${exerciseIndex}" 
                           data-set-index="${setIndex}"
                           value="${set.reps || ''}">
                    <span>×</span>
                    <input type="number" class="set-input weight-input" 
                           placeholder="Weight" min="1" max="1000" step="2.5"
                           data-exercise-index="${exerciseIndex}" 
                           data-set-index="${setIndex}"
                           value="${set.weight || ''}">
                    <select class="set-input unit-select"
                            data-exercise-index="${exerciseIndex}" 
                            data-set-index="${setIndex}">
                        <option value="lbs" ${set.unit === 'lbs' ? 'selected' : ''}>lbs</option>
                        <option value="kg" ${set.unit === 'kg' ? 'selected' : ''}>kg</option>
                    </select>
                    ${isPR ? '<span class="pr-badge"><i class="fas fa-trophy"></i> PR!</span>' : ''}
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    sessionExercisesEl.innerHTML = html;

    // Add event listeners for the new elements
    addSessionExerciseEventListeners();
}

function addSessionExerciseEventListeners() {
    // Add set buttons
    document.querySelectorAll('.add-set-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const exerciseIndex = parseInt(e.currentTarget.getAttribute('data-exercise-index'));
            addSetToExercise(exerciseIndex);
        });
    });

    // Remove exercise buttons
    document.querySelectorAll('.remove-exercise-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const exerciseIndex = parseInt(e.currentTarget.getAttribute('data-exercise-index'));
            removeExerciseFromSession(exerciseIndex);
        });
    });

    // Set input changes
    document.querySelectorAll('.reps-input, .weight-input, .unit-select').forEach(input => {
        input.addEventListener('change', handleSetInputChange);
        input.addEventListener('input', handleSetInputChange);
    });
}

function addSetToExercise(exerciseIndex) {
    if (!appState.currentSession || !appState.currentSession.exercises[exerciseIndex]) return;

    appState.currentSession.exercises[exerciseIndex].sets.push({
        reps: '',
        weight: '',
        unit: 'lbs'
    });

    renderSessionExercises();
}

function removeExerciseFromSession(exerciseIndex) {
    if (!appState.currentSession) return;

    if (confirm('Remove this exercise from the session?')) {
        appState.currentSession.exercises.splice(exerciseIndex, 1);
        renderSessionExercises();
        sessionExerciseCountEl.textContent = appState.currentSession.exercises.length.toString();
    }
}

function handleSetInputChange(e) {
    if (!appState.currentSession) return;

    const exerciseIndex = parseInt(e.target.getAttribute('data-exercise-index'));
    const setIndex = parseInt(e.target.getAttribute('data-set-index'));
    const field = e.target.classList.contains('reps-input') ? 'reps' :
        e.target.classList.contains('weight-input') ? 'weight' : 'unit';

    if (appState.currentSession.exercises[exerciseIndex] &&
        appState.currentSession.exercises[exerciseIndex].sets[setIndex]) {

        appState.currentSession.exercises[exerciseIndex].sets[setIndex][field] = e.target.value;

        // Check for PR if weight was entered
        if (field === 'weight' && e.target.value) {
            const exerciseId = appState.currentSession.exercises[exerciseIndex].exerciseId;
            const weight = parseFloat(e.target.value);

            if (checkIfSetIsPR(exerciseId, weight)) {
                showPRConfetti();
                // Update PR badge if needed
                renderSessionExercises();
            }
        }
    }
}

function checkIfSetIsPR(exerciseId, weight) {
    if (!weight) return false;

    const currentPR = appState.personalRecords[exerciseId];
    if (!currentPR) {
        // First time logging this exercise - it's automatically a PR
        return true;
    }

    return parseFloat(weight) > currentPR.weight;
}

// Routine management
function handleRoutineChange() {
    const routineId = sessionRoutineSelect.value;
    if (!routineId) return;

    // Find the routine
    const routine = appState.routines.find(r => r.id.toString() === routineId);
    if (!routine) return;

    // Set routine on current session
    if (appState.currentSession) {
        appState.currentSession.routineId = routine.id;
    }

    // Add all exercises from routine to session
    routine.exercises.forEach(routineExercise => {
        addExerciseToSession(routineExercise.exerciseId);
    });
}

// Rest timer functionality
function openRestTimer() {
    restTimerModal.style.display = 'flex';
    setRestTimer(90); // Default to 1:30
}

function closeRestTimer() {
    restTimerModal.style.display = 'none';
    pauseRestTimer();
}

function setRestTimer(seconds) {
    appState.restTimeRemaining = seconds;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(appState.restTimeRemaining / 60);
    const seconds = appState.restTimeRemaining % 60;

    timerMinutesEl.textContent = minutes.toString().padStart(2, '0');
    timerSecondsEl.textContent = seconds.toString().padStart(2, '0');

    // Update progress circle
    const progressCircle = document.querySelector('.timer-progress');
    const circumference = 2 * Math.PI * 90; // Radius of circle
    const offset = circumference - (appState.restTimeRemaining / 180) * circumference;
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function startRestTimer() {
    if (appState.restTimerInterval) {
        clearInterval(appState.restTimerInterval);
    }

    timerStartBtn.disabled = true;
    timerPauseBtn.disabled = false;

    appState.restTimerInterval = setInterval(() => {
        if (appState.restTimeRemaining <= 0) {
            clearInterval(appState.restTimerInterval);
            appState.restTimerInterval = null;
            timerStartBtn.disabled = false;
            timerPauseBtn.disabled = true;

            // Play sound notification
            playTimerCompleteSound();
            return;
        }

        appState.restTimeRemaining--;
        updateTimerDisplay();
    }, 1000);
}

function pauseRestTimer() {
    if (appState.restTimerInterval) {
        clearInterval(appState.restTimerInterval);
        appState.restTimerInterval = null;
        timerStartBtn.disabled = false;
        timerPauseBtn.disabled = true;
    }
}

function resetRestTimer() {
    pauseRestTimer();
    setRestTimer(90); // Reset to 1:30
}

function playTimerCompleteSound() {
    // Create audio context for timer completion sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);

        // Visual notification
        document.querySelector('.timer-circle').classList.add('pulse');
        setTimeout(() => {
            document.querySelector('.timer-circle').classList.remove('pulse');
        }, 1000);
    } catch (e) {
        console.log('Audio not supported:', e);
    }
}

// Chart.js initialization
function initCharts() {
    const ctx = volumeChartCanvas.getContext('2d');

    volumeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Training Volume',
                data: [],
                borderColor: '#4a6fa5',
                backgroundColor: 'rgba(74, 111, 165, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Volume (lbs)'
                    }
                }
            }
        }
    });

    updateCharts();
}

function updateCharts() {
    if (!volumeChart) return;

    const timeRange = parseInt(timeRangeFilter.value);
    const exerciseFilterValue = exerciseFilter.value;

    // Filter workout history based on time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);

    const filteredHistory = appState.workoutHistory.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= cutoffDate;
    });

    // Calculate volume for each workout
    const labels = [];
    const volumes = [];

    filteredHistory.forEach(workout => {
        let workoutVolume = 0;

        workout.exercises.forEach(sessionExercise => {
            // Skip if exercise filter is set and doesn't match
            if (exerciseFilterValue !== 'all') {
                const exercise = appState.exercises.find(e => e.id === sessionExercise.exerciseId);
                if (!exercise || exercise.name.toLowerCase().includes(exerciseFilterValue)) {
                    return;
                }
            }

            // Calculate volume for this exercise in the workout
            sessionExercise.sets.forEach(set => {
                if (set.reps && set.weight) {
                    workoutVolume += parseInt(set.reps) * parseFloat(set.weight);
                }
            });
        });

        if (workoutVolume > 0) {
            const workoutDate = new Date(workout.date);
            labels.push(workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            volumes.push(workoutVolume);
        }
    });

    // Update chart
    volumeChart.data.labels = labels;
    volumeChart.data.datasets[0].data = volumes;
    volumeChart.update();
}

// Personal records
function checkForPersonalRecords(workoutEntry) {
    workoutEntry.exercises.forEach(sessionExercise => {
        const exerciseId = sessionExercise.exerciseId;

        // Find the heaviest weight for this exercise in the workout
        let maxWeight = 0;
        sessionExercise.sets.forEach(set => {
            if (set.weight && parseFloat(set.weight) > maxWeight) {
                maxWeight = parseFloat(set.weight);
            }
        });

        if (maxWeight > 0) {
            const currentPR = appState.personalRecords[exerciseId];

            if (!currentPR || maxWeight > currentPR.weight) {
                // New personal record!
                appState.personalRecords[exerciseId] = {
                    weight: maxWeight,
                    unit: sessionExercise.sets[0]?.unit || 'lbs',
                    date: workoutEntry.date
                };

                // Celebrate!
                showPRConfetti();

                // Update UI
                updatePersonalRecordsDisplay();
            }
        }
    });
}

function updatePersonalRecordsDisplay() {
    // This would update the PR display in the progress tab
    // Implementation depends on your specific UI requirements
}

// Confetti animation for PR celebration
function showPRConfetti() {
    // Clear any existing confetti
    confettiContainer.innerHTML = '';

    // Create confetti particles
    const colors = ['#4a6fa5', '#e76f51', '#2a9d8f', '#e9c46a', '#e63946'];

    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Random properties
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const animationDelay = Math.random() * 2;

        confetti.style.backgroundColor = color;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.left = `${left}%`;
        confetti.style.animationDuration = `${animationDuration}s`;
        confetti.style.animationDelay = `${animationDelay}s`;

        confettiContainer.appendChild(confetti);
    }

    // Remove confetti after animation completes
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 5000);
}

// Update footer statistics
function updateFooterStats() {
    // Total workouts
    totalWorkoutsEl.textContent = appState.workoutHistory.length;

    // Total volume
    let totalVolume = 0;
    appState.workoutHistory.forEach(workout => {
        workout.exercises.forEach(sessionExercise => {
            sessionExercise.sets.forEach(set => {
                if (set.reps && set.weight) {
                    totalVolume += parseInt(set.reps) * parseFloat(set.weight);
                }
            });
        });
    });
    totalVolumeEl.textContent = totalVolume.toLocaleString();

    // Current streak (simplified - counts consecutive days with workouts)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);

        const hasWorkout = appState.workoutHistory.some(workout => {
            const workoutDate = new Date(workout.date);
            workoutDate.setHours(0, 0, 0, 0);
            return workoutDate.getTime() === checkDate.getTime();
        });

        if (hasWorkout) {
            streak++;
        } else if (i === 0) {
            // Today doesn't count if no workout yet
            continue;
        } else {
            break;
        }
    }

    currentStreakEl.textContent = streak;

    // Personal records count
    personalRecordsEl.textContent = Object.keys(appState.personalRecords).length;
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Routine Rendering and Management
function renderRoutines() {
    // Clear existing routines (except empty state if we had one inside, but we cleared it in HTML)
    // We need to keep the empty state element hidden or shown specificially.
    // Let's re-select to be safe or rebuild.

    const isEmpty = appState.routines.length === 0;

    let html = '';

    if (isEmpty) {
        html = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h4>No routines found</h4>
                <p>Create your first workout routine to get started</p>
            </div>`;
    } else {
        appState.routines.forEach(routine => {
            const exerciseCount = routine.exercises.length;
            // Calculate pseudo-stats or placeholder stats
            const avgVolume = Math.floor(Math.random() * 50) + 100; // Placeholder
            const sessionsCompleted = Math.floor(Math.random() * 20); // Placeholder

            let exercisesHtml = '';
            routine.exercises.slice(0, 3).forEach(ex => {
                const exerciseDef = appState.exercises.find(e => e.id === ex.exerciseId);
                if (exerciseDef) {
                    exercisesHtml += `
                        <div class="exercise-item">
                            <span class="exercise-name">${exerciseDef.name}</span>
                            <span class="exercise-sets">${ex.sets} x ${ex.reps}</span>
                        </div>
                    `;
                }
            });

            html += `
                <div class="routine-card" data-id="${routine.id}">
                    <div class="routine-header">
                        <h3>${routine.name}</h3>
                        <div class="routine-actions">
                            <button class="icon-btn start-routine-btn" data-id="${routine.id}" title="Start Session">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="icon-btn edit-routine-btn" data-id="${routine.id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="icon-btn duplicate-routine-btn" data-id="${routine.id}" title="Duplicate">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    <div class="routine-stats">
                        <div class="stat">
                            <span class="stat-value">${exerciseCount}</span>
                            <span class="stat-label">Exercises</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${avgVolume}</span>
                            <span class="stat-label">Avg. Volume</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${sessionsCompleted}</span>
                            <span class="stat-label">Sessions</span>
                        </div>
                    </div>
                    <div class="routine-exercises">
                        ${exercisesHtml}
                    </div>
                </div>
            `;
        });
    }

    routinesContainer.innerHTML = html;
}

function handleRoutineClick(e) {
    const startBtn = e.target.closest('.start-routine-btn');
    if (startBtn) {
        const routineId = startBtn.dataset.id;
        startSessionFromRoutine(routineId);
        return;
    }

    // Implement edit/duplicate if needed
    if (e.target.closest('.edit-routine-btn')) {
        alert('Edit functionality coming soon!');
    }
    if (e.target.closest('.duplicate-routine-btn')) {
        alert('Duplicate functionality coming soon!');
    }
}

function startSessionFromRoutine(routineId) {
    const routine = appState.routines.find(r => r.id == routineId);
    if (!routine) return;

    // Switch to live session tab
    switchTab('live-session');

    // Set current routine in dropdown
    sessionRoutineSelect.value = routineId;

    // Trigger change event to load exercises
    // We can manually call handleRoutineChange since we updated the select value
    handleRoutineChange();
}

// History Rendering
function renderHistory() {
    let filteredHistory = [...appState.workoutHistory];

    // Apply Date Filter
    const dateValue = historyDateFilter.value;
    if (dateValue) {
        const filterDate = new Date(dateValue).toDateString();
        filteredHistory = filteredHistory.filter(workout =>
            new Date(workout.date).toDateString() === filterDate
        );
    }

    // Apply Routine Filter
    const routineValue = historyRoutineFilter.value;
    if (routineValue && routineValue !== 'all') {
        const isRoutineName = ['push', 'pull', 'legs'].includes(routineValue.toLowerCase());
        // Logic depends on how routineValue maps to routineId or name. 
        // In the HTML select, values are "push", "pull", "legs" (lowercase names mostly)
        // In appState, routine keys might not match directly.
        // Let's assume for now we filter by routine ID if possible or name looseness.

        // Actually, the select uses values: 'push', 'pull', 'legs'.
        // Our routines have IDs naturally.
        // We'll try to match loosely by name for this demo since names are "Push Day", etc.

        // Improved: match routine ID if possible, else name.
        // Sample routines have IDs 1, 2, 3.

        filteredHistory = filteredHistory.filter(workout => {
            const routine = appState.routines.find(r => r.id === workout.routineId);
            if (!routine) return false;
            return routine.name.toLowerCase().includes(routineValue);
        });
    }

    // Sort by date descending
    filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredHistory.length === 0) {
        historyList.innerHTML = '';
        historyEmptyState.style.display = 'flex';
        return;
    } else {
        historyEmptyState.style.display = 'none';
    }

    let html = '';

    filteredHistory.forEach(workout => {
        const dateObj = new Date(workout.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const hours = Math.floor(workout.duration / 60);
        const mins = workout.duration % 60;
        const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        const routineName = getRoutineName(workout.routineId);

        let exercisesHtml = '';
        workout.exercises.forEach(exSession => {
            const exDef = appState.exercises.find(e => e.id === exSession.exerciseId);
            if (!exDef) return;

            // Calculate total volume for this exercise
            let vol = 0;
            let setsStr = '';
            exSession.sets.forEach((set, idx) => {
                vol += (set.reps * set.weight);
                setsStr += `
                    <div class="set-item">
                        <span class="set-number">Set ${idx + 1}:</span>
                        <span class="set-details">${set.reps} × ${set.weight} ${set.unit}</span>
                    </div>
                `;
            });

            exercisesHtml += `
                <div class="history-exercise">
                    <div class="exercise-summary">
                        <span class="exercise-name">${exDef.name}</span>
                        <span class="exercise-volume">${vol.toLocaleString()} lbs</span>
                    </div>
                    <div class="exercise-sets">
                        ${setsStr}
                    </div>
                </div>
            `;
        });

        // Routine Tag Class
        let tagClass = 'routine-tag';
        if (routineName.toLowerCase().includes('push')) tagClass += ' push-tag';
        else if (routineName.toLowerCase().includes('pull')) tagClass += ' pull-tag';
        else if (routineName.toLowerCase().includes('leg')) tagClass += ' legs-tag';

        html += `
            <div class="history-card">
                <div class="history-card-header">
                    <div class="history-date">
                        <span class="history-day">${dateStr}</span>
                        <span class="history-duration">${durationStr}</span>
                    </div>
                    <div class="history-routine">
                        <span class="${tagClass}">${routineName}</span>
                    </div>
                </div>
                <div class="history-exercises">
                    ${exercisesHtml}
                </div>
                <div class="history-notes">
                    <p><strong>Notes:</strong> ${workout.notes || 'No notes.'}</p>
                </div>
            </div>
        `;
    });

    historyList.innerHTML = html;
}

function getRoutineName(id) {
    const r = appState.routines.find(rt => rt.id === id);
    return r ? r.name : 'Custom Workout';
}

// Create Routine Logic
function openCreateRoutineModal() {
    createRoutineModal.style.display = 'flex';
    routineNameInput.value = '';

    // Populate exercises list
    let html = '';
    if (appState.exercises.length === 0) {
        html = '<p style="text-align: center; color: var(--text-secondary);">No exercises available. Add exercises first.</p>';
    } else {
        appState.exercises.forEach(ex => {
            html += `
                <div class="exercise-checkbox-item">
                    <input type="checkbox" id="ex-check-${ex.id}" value="${ex.id}" class="exercise-checkbox">
                    <label for="ex-check-${ex.id}">${ex.name} <span style="font-size: 0.8em; color: var(--text-secondary);">(${ex.category})</span></label>
                </div>
            `;
        });
    }
    routineExercisesList.innerHTML = html;
    routineNameInput.focus();
}

function closeCreateRoutineModal() {
    createRoutineModal.style.display = 'none';
}

function saveNewRoutine() {
    const name = routineNameInput.value.trim();
    if (!name) {
        alert('Please enter a routine name');
        return;
    }

    const selectedCheckboxes = document.querySelectorAll('.exercise-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert('Please select at least one exercise');
        return;
    }

    const selectedExercises = Array.from(selectedCheckboxes).map(cb => {
        return {
            exerciseId: parseInt(cb.value),
            sets: 3, // Default
            reps: '8-12' // Default
        };
    });

    // Create new routine
    const newRoutine = {
        id: Date.now(),
        name: name,
        exercises: selectedExercises
    };

    appState.routines.push(newRoutine);
    saveAppData();

    renderRoutines();

    // Update session routine select dropdown
    // Logic to refresh that dropdown isn't extracted yet, let's do quick refresh
    // Ideally we should have a `renderRoutineSelect` function. 
    // For now we can re-add it or just let next reload handle it used.
    // Actually, `renderSessionUI` or similar might not update the select *options*.
    // Let's quickly update the select options if we can or just leave it for reload/next render.
    // Better to update it:
    const option = document.createElement('option');
    option.value = newRoutine.id;
    option.textContent = newRoutine.name;
    sessionRoutineSelect.appendChild(option);

    closeCreateRoutineModal();
    alert('Routine created successfully!');
}