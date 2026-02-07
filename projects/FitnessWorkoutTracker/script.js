// ===== State Management =====
const state = {
  exercises: [],
  workouts: [],
  programs: [],
  logs: [],
  progress: {
    photos: [],
    measurements: []
  },
  achievements: [],
  settings: {
    weightUnit: 'kg',
    restTimerSound: true
  }
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  loadFromLocalStorage();
  renderDashboard();
  showSection('dashboard');
});

function initializeApp() {
  // Initialize exercise database
  if (state.exercises.length === 0) {
    state.exercises = getExerciseDatabase();
  }
  
  // Initialize achievements
  if (state.achievements.length === 0) {
    state.achievements = getAchievementsDatabase();
  }
  
  // Initialize programs
  if (state.programs.length === 0) {
    state.programs = getWorkoutPrograms();
  }
}

// ===== Exercise Database =====
function getExerciseDatabase() {
  return [
    // Chest Exercises
    { id: 1, name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', instructions: 'Lie on bench, lower bar to chest, press up' },
    { id: 2, name: 'Incline Bench Press', muscle: 'Chest', equipment: 'Barbell', instructions: 'Set bench at 30-45 degrees, press bar upward' },
    { id: 3, name: 'Dumbbell Chest Press', muscle: 'Chest', equipment: 'Dumbbells', instructions: 'Press dumbbells from chest level upward' },
    { id: 4, name: 'Push-ups', muscle: 'Chest', equipment: 'Bodyweight', instructions: 'Lower body until chest nearly touches floor, push back up' },
    { id: 5, name: 'Dumbbell Flyes', muscle: 'Chest', equipment: 'Dumbbells', instructions: 'Arc dumbbells outward and back together' },
    { id: 6, name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable', instructions: 'Pull cables together in front of body' },
    { id: 7, name: 'Decline Bench Press', muscle: 'Chest', equipment: 'Barbell', instructions: 'Lie on decline bench, press bar upward' },
    { id: 8, name: 'Chest Dips', muscle: 'Chest', equipment: 'Bodyweight', instructions: 'Lean forward, lower body, press back up' },
    
    // Back Exercises
    { id: 9, name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', instructions: 'Lift bar from floor to standing position, hips back' },
    { id: 10, name: 'Pull-ups', muscle: 'Back', equipment: 'Bodyweight', instructions: 'Pull body up until chin over bar' },
    { id: 11, name: 'Bent Over Row', muscle: 'Back', equipment: 'Barbell', instructions: 'Bend at hips, pull bar to lower chest' },
    { id: 12, name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable', instructions: 'Pull bar down to upper chest' },
    { id: 13, name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable', instructions: 'Pull handle to torso, squeeze shoulder blades' },
    { id: 14, name: 'T-Bar Row', muscle: 'Back', equipment: 'Barbell', instructions: 'Pull bar to chest in rowing motion' },
    { id: 15, name: 'Single Arm Dumbbell Row', muscle: 'Back', equipment: 'Dumbbells', instructions: 'Pull dumbbell to hip, one arm at a time' },
    { id: 16, name: 'Face Pulls', muscle: 'Back', equipment: 'Cable', instructions: 'Pull rope to face, elbows high' },
    
    // Legs Exercises
    { id: 17, name: 'Squat', muscle: 'Legs', equipment: 'Barbell', instructions: 'Lower hips back and down, keep chest up' },
    { id: 18, name: 'Front Squat', muscle: 'Legs', equipment: 'Barbell', instructions: 'Hold bar on front shoulders, squat down' },
    { id: 19, name: 'Leg Press', muscle: 'Legs', equipment: 'Machine', instructions: 'Press platform away with legs' },
    { id: 20, name: 'Romanian Deadlift', muscle: 'Legs', equipment: 'Barbell', instructions: 'Hinge at hips, lower bar along legs' },
    { id: 21, name: 'Lunges', muscle: 'Legs', equipment: 'Bodyweight', instructions: 'Step forward, lower back knee to ground' },
    { id: 22, name: 'Leg Curl', muscle: 'Legs', equipment: 'Machine', instructions: 'Curl heels toward glutes' },
    { id: 23, name: 'Leg Extension', muscle: 'Legs', equipment: 'Machine', instructions: 'Extend legs to straight position' },
    { id: 24, name: 'Bulgarian Split Squat', muscle: 'Legs', equipment: 'Dumbbells', instructions: 'Rear foot elevated, squat with front leg' },
    { id: 25, name: 'Calf Raises', muscle: 'Legs', equipment: 'Machine', instructions: 'Raise up on toes, lower slowly' },
    
    // Shoulders Exercises
    { id: 26, name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', instructions: 'Press bar overhead from shoulders' },
    { id: 27, name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', equipment: 'Dumbbells', instructions: 'Press dumbbells overhead' },
    { id: 28, name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbells', instructions: 'Raise arms to sides to shoulder height' },
    { id: 29, name: 'Front Raises', muscle: 'Shoulders', equipment: 'Dumbbells', instructions: 'Raise dumbbells forward to shoulder height' },
    { id: 30, name: 'Rear Delt Flyes', muscle: 'Shoulders', equipment: 'Dumbbells', instructions: 'Bend over, raise arms to sides' },
    { id: 31, name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Dumbbells', instructions: 'Rotate dumbbells while pressing overhead' },
    { id: 32, name: 'Upright Row', muscle: 'Shoulders', equipment: 'Barbell', instructions: 'Pull bar up along body to chin' },
    
    // Arms Exercises
    { id: 33, name: 'Barbell Curl', muscle: 'Arms', equipment: 'Barbell', instructions: 'Curl bar up to shoulders' },
    { id: 34, name: 'Dumbbell Curl', muscle: 'Arms', equipment: 'Dumbbells', instructions: 'Curl dumbbells up alternating or together' },
    { id: 35, name: 'Hammer Curl', muscle: 'Arms', equipment: 'Dumbbells', instructions: 'Curl dumbbells with neutral grip' },
    { id: 36, name: 'Tricep Dips', muscle: 'Arms', equipment: 'Bodyweight', instructions: 'Lower body by bending elbows, push back up' },
    { id: 37, name: 'Tricep Pushdown', muscle: 'Arms', equipment: 'Cable', instructions: 'Push cable down until arms straight' },
    { id: 38, name: 'Skull Crushers', muscle: 'Arms', equipment: 'Barbell', instructions: 'Lower bar to forehead, extend arms' },
    { id: 39, name: 'Close Grip Bench Press', muscle: 'Arms', equipment: 'Barbell', instructions: 'Bench press with narrow grip' },
    { id: 40, name: 'Cable Curl', muscle: 'Arms', equipment: 'Cable', instructions: 'Curl cable bar to shoulders' },
    
    // Core Exercises
    { id: 41, name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', instructions: 'Hold body in straight line on forearms' },
    { id: 42, name: 'Crunches', muscle: 'Core', equipment: 'Bodyweight', instructions: 'Lift shoulders off ground toward knees' },
    { id: 43, name: 'Russian Twists', muscle: 'Core', equipment: 'Bodyweight', instructions: 'Rotate torso side to side while seated' },
    { id: 44, name: 'Leg Raises', muscle: 'Core', equipment: 'Bodyweight', instructions: 'Raise legs while lying or hanging' },
    { id: 45, name: 'Cable Woodchop', muscle: 'Core', equipment: 'Cable', instructions: 'Rotate torso pulling cable diagonally' },
    { id: 46, name: 'Ab Wheel Rollout', muscle: 'Core', equipment: 'Ab Wheel', instructions: 'Roll wheel forward, return to start' },
    { id: 47, name: 'Mountain Climbers', muscle: 'Core', equipment: 'Bodyweight', instructions: 'Alternate driving knees to chest in plank' },
    { id: 48, name: 'Bicycle Crunches', muscle: 'Core', equipment: 'Bodyweight', instructions: 'Alternate elbow to opposite knee' },
    
    // Cardio Exercises
    { id: 49, name: 'Treadmill Running', muscle: 'Cardio', equipment: 'Machine', instructions: 'Run at steady or interval pace' },
    { id: 50, name: 'Cycling', muscle: 'Cardio', equipment: 'Machine', instructions: 'Pedal at moderate to high intensity' },
    { id: 51, name: 'Rowing Machine', muscle: 'Cardio', equipment: 'Machine', instructions: 'Pull handle while driving with legs' },
    { id: 52, name: 'Jump Rope', muscle: 'Cardio', equipment: 'Jump Rope', instructions: 'Jump continuously over rope' },
    { id: 53, name: 'Burpees', muscle: 'Cardio', equipment: 'Bodyweight', instructions: 'Squat, plank, push-up, jump up' },
    { id: 54, name: 'Box Jumps', muscle: 'Cardio', equipment: 'Box', instructions: 'Jump onto box, step down' },
    { id: 55, name: 'Battle Ropes', muscle: 'Cardio', equipment: 'Battle Ropes', instructions: 'Create waves with ropes' },
    
    // Additional variety
    { id: 56, name: 'Farmers Walk', muscle: 'Full Body', equipment: 'Dumbbells', instructions: 'Walk with heavy weights in hands' },
    { id: 57, name: 'Kettlebell Swing', muscle: 'Full Body', equipment: 'Kettlebell', instructions: 'Swing kettlebell between legs to eye level' },
    { id: 58, name: 'Turkish Get-Up', muscle: 'Full Body', equipment: 'Kettlebell', instructions: 'Stand up from lying position with weight overhead' },
    { id: 59, name: 'Clean and Press', muscle: 'Full Body', equipment: 'Barbell', instructions: 'Clean bar to shoulders, press overhead' },
    { id: 60, name: 'Thruster', muscle: 'Full Body', equipment: 'Barbell', instructions: 'Front squat into overhead press' }
  ];
}

// ===== Achievements Database =====
function getAchievementsDatabase() {
  return [
    { id: 1, name: 'First Workout', description: 'Complete your first workout', icon: '🎯', unlocked: false },
    { id: 2, name: '7 Day Streak', description: 'Work out for 7 consecutive days', icon: '🔥', unlocked: false },
    { id: 3, name: '30 Day Streak', description: 'Work out for 30 consecutive days', icon: '💪', unlocked: false },
    { id: 4, name: 'Century Club', description: 'Complete 100 workouts', icon: '💯', unlocked: false },
    { id: 5, name: 'Heavy Lifter', description: 'Lift 10,000 kg total volume', icon: '🏋️', unlocked: false },
    { id: 6, name: 'Cardio King', description: 'Complete 50 cardio sessions', icon: '👑', unlocked: false },
    { id: 7, name: 'Early Bird', description: 'Complete 20 workouts before 8 AM', icon: '🌅', unlocked: false },
    { id: 8, name: 'Night Owl', description: 'Complete 20 workouts after 8 PM', icon: '🦉', unlocked: false },
    { id: 9, name: 'Progress Tracker', description: 'Log 10 progress photos', icon: '📸', unlocked: false },
    { id: 10, name: 'Goal Crusher', description: 'Complete a 12-week program', icon: '🎖️', unlocked: false },
    { id: 11, name: 'Consistency', description: 'Log workouts for 6 months', icon: '⭐', unlocked: false },
    { id: 12, name: 'Personal Best', description: 'Set 10 new PRs', icon: '🏆', unlocked: false }
  ];
}

// ===== Workout Programs =====
function getWorkoutPrograms() {
  return [
    {
      id: 1,
      name: 'Beginner Strength Program',
      duration: '8 weeks',
      frequency: '3x per week',
      goal: 'Build foundational strength',
      description: 'Perfect for beginners focusing on compound movements',
      workouts: [
        {
          day: 'Day 1',
          exercises: [
            { exerciseId: 1, sets: 3, reps: 8 },
            { exerciseId: 17, sets: 3, reps: 10 },
            { exerciseId: 11, sets: 3, reps: 8 }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Upper/Lower Split',
      duration: '12 weeks',
      frequency: '4x per week',
      goal: 'Muscle hypertrophy',
      description: 'Split routine alternating upper and lower body',
      workouts: []
    },
    {
      id: 3,
      name: 'Push/Pull/Legs',
      duration: '12 weeks',
      frequency: '6x per week',
      goal: 'Advanced muscle building',
      description: 'High volume training split',
      workouts: []
    },
    {
      id: 4,
      name: 'Cardio Blast',
      duration: '6 weeks',
      frequency: '5x per week',
      goal: 'Fat loss & conditioning',
      description: 'High intensity cardio program',
      workouts: []
    }
  ];
}

// ===== Navigation =====
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      showSection(section);
    });
  });
  
  // Dashboard
  document.getElementById('startWorkoutBtn')?.addEventListener('click', () => showSection('log'));
  
  // Exercise Database
  document.getElementById('exerciseSearch')?.addEventListener('input', filterExercises);
  document.getElementById('muscleFilter')?.addEventListener('change', filterExercises);
  document.getElementById('equipmentFilter')?.addEventListener('change', filterExercises);
  
  // Workout Builder
  document.getElementById('addExerciseBtn')?.addEventListener('click', showExerciseSelector);
  document.getElementById('saveWorkoutBtn')?.addEventListener('click', saveWorkout);
  document.getElementById('saveTemplateBtn')?.addEventListener('click', saveAsTemplate);
  
  // Exercise Logger
  document.getElementById('startNewWorkoutBtn')?.addEventListener('click', startNewWorkout);
  document.getElementById('finishWorkoutBtn')?.addEventListener('click', finishWorkout);
  document.getElementById('cancelWorkoutBtn')?.addEventListener('click', cancelWorkout);
  
  // Rest Timer
  document.querySelectorAll('.timer-preset').forEach(btn => {
    btn.addEventListener('click', () => startTimer(parseInt(btn.dataset.seconds)));
  });
  document.getElementById('startCustomTimerBtn')?.addEventListener('click', startCustomTimer);
  document.getElementById('pauseTimerBtn')?.addEventListener('click', pauseTimer);
  document.getElementById('resetTimerBtn')?.addEventListener('click', resetTimer);
  
  // Progress
  document.getElementById('uploadPhotoBtn')?.addEventListener('click', () => {
    document.getElementById('photoInput').click();
  });
  document.getElementById('photoInput')?.addEventListener('change', handlePhotoUpload);
  document.getElementById('saveMeasurementBtn')?.addEventListener('click', saveMeasurement);
  
  // Calendar
  document.getElementById('prevMonthBtn')?.addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonthBtn')?.addEventListener('click', () => changeMonth(1));
  
  // Tools
  document.getElementById('calculate1RMBtn')?.addEventListener('click', calculate1RM);
  document.getElementById('calculateWorkingBtn')?.addEventListener('click', calculateWorkingWeights);
  document.getElementById('calculateCaloriesBtn')?.addEventListener('click', calculateCalories);
  
  // Export
  document.getElementById('exportCSVBtn')?.addEventListener('click', () => exportData('csv'));
  document.getElementById('exportJSONBtn')?.addEventListener('click', () => exportData('json'));
}

function showSection(sectionName) {
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === sectionName) {
      item.classList.add('active');
    }
  });
  
  // Update sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionName + 'Section')?.classList.add('active');
  
  // Render section content
  switch(sectionName) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'exercises':
      renderExercises();
      break;
    case 'builder':
      renderWorkoutBuilder();
      break;
    case 'programs':
      renderPrograms();
      break;
    case 'progress':
      renderProgress();
      break;
    case 'calendar':
      renderCalendar();
      break;
    case 'statistics':
      renderStatistics();
      break;
    case 'achievements':
      renderAchievements();
      break;
  }
}

// ===== Dashboard =====
function renderDashboard() {
  const totalWorkouts = state.logs.length;
  const totalVolume = calculateTotalVolume();
  const currentStreak = calculateStreak();
  const caloriesBurned = estimateCalories();
  
  document.getElementById('totalWorkouts').textContent = totalWorkouts;
  document.getElementById('totalVolume').textContent = totalVolume.toLocaleString() + ' kg';
  document.getElementById('currentStreak').textContent = currentStreak + ' days';
  document.getElementById('caloriesBurned').textContent = caloriesBurned.toLocaleString();
  
  renderRecentWorkouts();
  renderUpcomingWorkouts();
}

function renderRecentWorkouts() {
  const container = document.getElementById('recentWorkouts');
  if (!container) return;
  
  const recent = state.logs.slice(-5).reverse();
  
  if (recent.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">No workouts logged yet. Start your first workout!</p>';
    return;
  }
  
  container.innerHTML = recent.map(log => `
    <div class="exercise-item">
      <div class="exercise-item-header">
        <h4>${log.name || 'Workout'}</h4>
        <span style="color: var(--muted); font-size: 13px;">${formatDate(log.date)}</span>
      </div>
      <p style="font-size: 14px; color: var(--muted);">
        ${log.exercises.length} exercises • ${log.duration || 'N/A'} minutes • ${calculateWorkoutVolume(log)} kg
      </p>
    </div>
  `).join('');
}

function renderUpcomingWorkouts() {
  const container = document.getElementById('upcomingWorkouts');
  if (!container) return;
  
  container.innerHTML = `
    <p style="color: var(--muted); text-align: center;">No scheduled workouts. Create a plan in the Calendar section!</p>
  `;
}

// ===== Exercise Database =====
function renderExercises() {
  filterExercises();
}

function filterExercises() {
  const search = document.getElementById('exerciseSearch')?.value.toLowerCase() || '';
  const muscleFilter = document.getElementById('muscleFilter')?.value || 'all';
  const equipmentFilter = document.getElementById('equipmentFilter')?.value || 'all';
  
  let filtered = state.exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search);
    const matchesMuscle = muscleFilter === 'all' || ex.muscle === muscleFilter;
    const matchesEquipment = equipmentFilter === 'all' || ex.equipment === equipmentFilter;
    return matchesSearch && matchesMuscle && matchesEquipment;
  });
  
  const container = document.getElementById('exercisesList');
  if (!container) return;
  
  container.innerHTML = filtered.map(ex => `
    <div class="exercise-card">
      <h3>${ex.name}</h3>
      <div class="exercise-meta">
        <span class="exercise-tag muscle-tag">${ex.muscle}</span>
        <span class="exercise-tag equipment-tag">${ex.equipment}</span>
      </div>
      <p>${ex.instructions}</p>
      <button class="btn btn-primary" onclick="addExerciseToWorkout(${ex.id})">
        <i class="fas fa-plus"></i> Add to Workout
      </button>
    </div>
  `).join('');
}

// ===== Workout Builder =====
let currentWorkout = {
  name: '',
  exercises: []
};

function renderWorkoutBuilder() {
  renderCurrentWorkout();
  renderTemplates();
}

function renderCurrentWorkout() {
  const container = document.getElementById('workoutExercises');
  if (!container) return;
  
  if (currentWorkout.exercises.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">No exercises added yet. Search exercises or use a template.</p>';
    return;
  }
  
  container.innerHTML = currentWorkout.exercises.map((item, index) => {
    const exercise = state.exercises.find(ex => ex.id === item.exerciseId);
    return `
      <div class="exercise-item">
        <div class="exercise-item-header">
          <h4>${exercise?.name || 'Unknown'}</h4>
          <button class="btn btn-danger" onclick="removeExerciseFromWorkout(${index})" style="padding: 8px 12px;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="set-inputs">
          <input type="number" placeholder="Sets" value="${item.sets || 3}" 
            onchange="updateWorkoutExercise(${index}, 'sets', this.value)">
          <input type="number" placeholder="Reps" value="${item.reps || 10}" 
            onchange="updateWorkoutExercise(${index}, 'reps', this.value)">
          <input type="number" placeholder="Weight (kg)" value="${item.weight || ''}" 
            onchange="updateWorkoutExercise(${index}, 'weight', this.value)">
        </div>
      </div>
    `;
  }).join('');
}

function addExerciseToWorkout(exerciseId) {
  currentWorkout.exercises.push({
    exerciseId: exerciseId,
    sets: 3,
    reps: 10,
    weight: 0
  });
  renderCurrentWorkout();
  showNotification('Exercise added to workout!', 'success');
  showSection('builder');
}

function removeExerciseFromWorkout(index) {
  currentWorkout.exercises.splice(index, 1);
  renderCurrentWorkout();
}

function updateWorkoutExercise(index, field, value) {
  currentWorkout.exercises[index][field] = parseFloat(value) || 0;
}

function saveWorkout() {
  const name = document.getElementById('workoutName')?.value;
  if (!name) {
    showNotification('Please enter a workout name', 'error');
    return;
  }
  
  if (currentWorkout.exercises.length === 0) {
    showNotification('Please add at least one exercise', 'error');
    return;
  }
  
  const workout = {
    id: Date.now(),
    name: name,
    exercises: [...currentWorkout.exercises],
    createdAt: new Date().toISOString()
  };
  
  state.workouts.push(workout);
  saveToLocalStorage();
  
  showNotification('Workout saved successfully!', 'success');
  
  // Reset
  currentWorkout = { name: '', exercises: [] };
  document.getElementById('workoutName').value = '';
  renderCurrentWorkout();
}

function saveAsTemplate() {
  saveWorkout();
  showNotification('Workout saved as template!', 'success');
}

function renderTemplates() {
  const container = document.getElementById('templatesList');
  if (!container) return;
  
  if (state.workouts.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">No templates saved yet.</p>';
    return;
  }
  
  container.innerHTML = state.workouts.map(workout => `
    <div class="exercise-item" style="cursor: pointer;" onclick="loadTemplate(${workout.id})">
      <h4>${workout.name}</h4>
      <p style="font-size: 14px; color: var(--muted);">${workout.exercises.length} exercises</p>
    </div>
  `).join('');
}

function loadTemplate(workoutId) {
  const workout = state.workouts.find(w => w.id === workoutId);
  if (!workout) return;
  
  currentWorkout = {
    name: workout.name,
    exercises: JSON.parse(JSON.stringify(workout.exercises))
  };
  
  document.getElementById('workoutName').value = workout.name;
  renderCurrentWorkout();
  showNotification('Template loaded!', 'success');
}

// ===== Exercise Logger =====
let activeWorkoutLog = null;

function startNewWorkout() {
  activeWorkoutLog = {
    date: new Date().toISOString(),
    startTime: Date.now(),
    exercises: [],
    name: 'Workout ' + (state.logs.length + 1)
  };
  
  renderActiveWorkout();
  showNotification('Workout started! Add exercises to log.', 'success');
}

function renderActiveWorkout() {
  const container = document.getElementById('activeExercises');
  if (!container) return;
  
  if (!activeWorkoutLog || activeWorkoutLog.exercises.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">No exercises logged yet. Add exercises from the database.</p>';
    return;
  }
  
  container.innerHTML = activeWorkoutLog.exercises.map((ex, index) => {
    const exercise = state.exercises.find(e => e.id === ex.exerciseId);
    return `
      <div class="exercise-item">
        <div class="exercise-item-header">
          <h4>${exercise?.name}</h4>
        </div>
        ${ex.sets.map((set, setIndex) => `
          <div style="display: flex; gap: 12px; margin-bottom: 8px; align-items: center;">
            <span style="width: 60px; font-weight: 600;">Set ${setIndex + 1}</span>
            <input type="number" placeholder="Reps" value="${set.reps}" 
              onchange="updateLogSet(${index}, ${setIndex}, 'reps', this.value)" 
              style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--border);">
            <input type="number" placeholder="Weight" value="${set.weight}" 
              onchange="updateLogSet(${index}, ${setIndex}, 'weight', this.value)"
              style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--border);">
            <button class="btn btn-danger" onclick="removeLogSet(${index}, ${setIndex})" 
              style="padding: 8px 12px;">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `).join('')}
        <button class="btn btn-secondary" onclick="addLogSet(${index})" style="margin-top: 12px; width: 100%;">
          <i class="fas fa-plus"></i> Add Set
        </button>
      </div>
    `;
  }).join('');
}

function addExerciseToLog(exerciseId) {
  if (!activeWorkoutLog) {
    startNewWorkout();
  }
  
  activeWorkoutLog.exercises.push({
    exerciseId: exerciseId,
    sets: [{ reps: 0, weight: 0 }]
  });
  
  renderActiveWorkout();
  showNotification('Exercise added to log!', 'success');
  showSection('log');
}

window.addExerciseToLog = addExerciseToLog;

function addLogSet(exerciseIndex) {
  activeWorkoutLog.exercises[exerciseIndex].sets.push({ reps: 0, weight: 0 });
  renderActiveWorkout();
}

function removeLogSet(exerciseIndex, setIndex) {
  activeWorkoutLog.exercises[exerciseIndex].sets.splice(setIndex, 1);
  renderActiveWorkout();
}

function updateLogSet(exerciseIndex, setIndex, field, value) {
  activeWorkoutLog.exercises[exerciseIndex].sets[setIndex][field] = parseFloat(value) || 0;
}

function finishWorkout() {
  if (!activeWorkoutLog) return;
  
  activeWorkoutLog.endTime = Date.now();
  activeWorkoutLog.duration = Math.round((activeWorkoutLog.endTime - activeWorkoutLog.startTime) / 60000);
  
  state.logs.push(activeWorkoutLog);
  saveToLocalStorage();
  checkAchievements();
  
  showNotification('Workout finished! Great job! 💪', 'success');
  
  activeWorkoutLog = null;
  renderActiveWorkout();
  renderDashboard();
}

function cancelWorkout() {
  if (confirm('Are you sure you want to cancel this workout?')) {
    activeWorkoutLog = null;
    renderActiveWorkout();
    showNotification('Workout cancelled', 'warning');
  }
}

// ===== Rest Timer =====
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

function startTimer(seconds) {
  timerSeconds = seconds;
  timerRunning = true;
  updateTimerDisplay();
  
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerRunning = false;
      if (state.settings.restTimerSound) {
        playTimerSound();
      }
      showNotification('Rest time complete!', 'success');
    }
  }, 1000);
}

function startCustomTimer() {
  const minutes = parseInt(document.getElementById('customMinutes')?.value) || 0;
  const seconds = parseInt(document.getElementById('customSeconds')?.value) || 0;
  const totalSeconds = (minutes * 60) + seconds;
  
  if (totalSeconds > 0) {
    startTimer(totalSeconds);
  }
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerRunning = false;
  }
}

function resetTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerSeconds = 0;
  timerRunning = false;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const el = document.getElementById('timerDisplay');
  if (el) el.textContent = display;
}

function playTimerSound() {
  // Create beep sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

// ===== Progress Tracking =====
function handlePhotoUpload(event) {
  const files = event.target.files;
  if (!files.length) return;
  
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      state.progress.photos.push({
        id: Date.now() + Math.random(),
        date: new Date().toISOString(),
        dataUrl: e.target.result
      });
      saveToLocalStorage();
      renderProgress();
    };
    reader.readAsDataURL(file);
  });
  
  showNotification('Photo uploaded!', 'success');
}

function saveMeasurement() {
  const weight = document.getElementById('measurementWeight')?.value;
  const bodyFat = document.getElementById('measurementBodyFat')?.value;
  const chest = document.getElementById('measurementChest')?.value;
  const waist = document.getElementById('measurementWaist')?.value;
  const arms = document.getElementById('measurementArms')?.value;
  const legs = document.getElementById('measurementLegs')?.value;
  
  if (!weight) {
    showNotification('Please enter at least your weight', 'error');
    return;
  }
  
  state.progress.measurements.push({
    date: new Date().toISOString(),
    weight: parseFloat(weight),
    bodyFat: bodyFat ? parseFloat(bodyFat) : null,
    chest: chest ? parseFloat(chest) : null,
    waist: waist ? parseFloat(waist) : null,
    arms: arms ? parseFloat(arms) : null,
    legs: legs ? parseFloat(legs) : null
  });
  
  saveToLocalStorage();
  renderProgress();
  showNotification('Measurement saved!', 'success');
  
  // Clear inputs
  document.getElementById('measurementWeight').value = '';
  document.getElementById('measurementBodyFat').value = '';
  document.getElementById('measurementChest').value = '';
  document.getElementById('measurementWaist').value = '';
  document.getElementById('measurementArms').value = '';
  document.getElementById('measurementLegs').value = '';
}

function renderProgress() {
  renderProgressPhotos();
  renderMeasurementChart();
}

function renderProgressPhotos() {
  const container = document.getElementById('progressPhotos');
  if (!container) return;
  
  if (state.progress.photos.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">No progress photos yet.</p>';
    return;
  }
  
  container.innerHTML = state.progress.photos.slice().reverse().map(photo => `
    <div class="photo-item">
      <img src="${photo.dataUrl}" alt="Progress photo">
      <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px;">
        ${formatDate(photo.date)}
      </div>
    </div>
  `).join('');
}

function renderMeasurementChart() {
  if (state.progress.measurements.length === 0) return;
  
  const ctx = document.getElementById('measurementChart');
  if (!ctx) return;
  
  const dates = state.progress.measurements.map(m => formatDate(m.date));
  const weights = state.progress.measurements.map(m => m.weight);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Weight (kg)',
        data: weights,
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

// ===== Calendar =====
let currentCalendarDate = new Date();

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  document.getElementById('currentMonth').textContent = 
    new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const container = document.getElementById('calendarDays');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Add day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.fontWeight = '700';
    header.style.padding = '12px';
    header.style.color = 'var(--muted)';
    header.textContent = day;
    container.appendChild(header);
  });
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    container.appendChild(document.createElement('div'));
  }
  
  // Add day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasWorkout = state.logs.some(log => log.date.startsWith(dateStr));
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    if (hasWorkout) dayCell.classList.add('has-workout');
    if (isToday) dayCell.classList.add('today');
    
    dayCell.innerHTML = `<div class="calendar-day-number">${day}</div>`;
    container.appendChild(dayCell);
  }
}

function changeMonth(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderCalendar();
}

// ===== Statistics =====
function renderStatistics() {
  const totalWorkouts = state.logs.length;
  const totalVolume = calculateTotalVolume();
  const avgDuration = calculateAverageDuration();
  const totalExercises = calculateTotalExercises();
  
  document.getElementById('statTotalWorkouts').textContent = totalWorkouts;
  document.getElementById('statTotalVolume').textContent = totalVolume.toLocaleString() + ' kg';
  document.getElementById('statAvgDuration').textContent = avgDuration + ' min';
  document.getElementById('statTotalExercises').textContent = totalExercises;
  
  renderVolumeChart();
  renderWorkoutFrequencyChart();
}

function renderVolumeChart() {
  const ctx = document.getElementById('volumeChart');
  if (!ctx) return;
  
  // Get last 30 days of data
  const last30Days = state.logs.slice(-30);
  const dates = last30Days.map(log => formatDate(log.date));
  const volumes = last30Days.map(log => calculateWorkoutVolume(log));
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Volume (kg)',
        data: volumes,
        backgroundColor: 'rgba(255, 107, 107, 0.7)',
        borderColor: '#ff6b6b',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function renderWorkoutFrequencyChart() {
  const ctx = document.getElementById('frequencyChart');
  if (!ctx) return;
  
  // Count workouts by day of week
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  state.logs.forEach(log => {
    const day = new Date(log.date).getDay();
    dayCounts[day]++;
  });
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      datasets: [{
        label: 'Workouts',
        data: dayCounts,
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
        borderColor: '#4ecdc4',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true
    }
  });
}

// ===== Programs =====
function renderPrograms() {
  const container = document.getElementById('programsList');
  if (!container) return;
  
  container.innerHTML = state.programs.map(program => `
    <div class="program-card">
      <div class="program-header">
        <h3>${program.name}</h3>
        <p>${program.description}</p>
      </div>
      <div class="program-body">
        <div class="program-details">
          <div class="program-detail-item">
            <i class="fas fa-clock"></i>
            <span>${program.duration}</span>
          </div>
          <div class="program-detail-item">
            <i class="fas fa-calendar-check"></i>
            <span>${program.frequency}</span>
          </div>
          <div class="program-detail-item">
            <i class="fas fa-bullseye"></i>
            <span>${program.goal}</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="startProgram(${program.id})">
          <i class="fas fa-play"></i> Start Program
        </button>
      </div>
    </div>
  `).join('');
}

function startProgram(programId) {
  showNotification('Program started! Check your calendar for scheduled workouts.', 'success');
}

// ===== Achievements =====
function renderAchievements() {
  const container = document.getElementById('achievementsList');
  if (!container) return;
  
  container.innerHTML = state.achievements.map(achievement => `
    <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
      <div class="achievement-icon">${achievement.icon}</div>
      <h3>${achievement.name}</h3>
      <p>${achievement.description}</p>
      ${achievement.unlocked ? '<span style="color: var(--success); font-weight: 700;">✓ UNLOCKED</span>' : ''}
    </div>
  `).join('');
}

function checkAchievements() {
  // First Workout
  if (state.logs.length === 1 && !state.achievements[0].unlocked) {
    unlockAchievement(1);
  }
  
  // Century Club
  if (state.logs.length >= 100 && !state.achievements[3].unlocked) {
    unlockAchievement(4);
  }
  
  // Heavy Lifter
  if (calculateTotalVolume() >= 10000 && !state.achievements[4].unlocked) {
    unlockAchievement(5);
  }
  
  // Progress Tracker
  if (state.progress.photos.length >= 10 && !state.achievements[8].unlocked) {
    unlockAchievement(9);
  }
}

function unlockAchievement(achievementId) {
  const achievement = state.achievements.find(a => a.id === achievementId);
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    saveToLocalStorage();
    showNotification(`🎉 Achievement Unlocked: ${achievement.name}!`, 'success');
  }
}

// ===== Tools =====
function calculate1RM() {
  const weight = parseFloat(document.getElementById('oneRMWeight')?.value);
  const reps = parseFloat(document.getElementById('oneRMReps')?.value);
  
  if (!weight || !reps) {
    showNotification('Please enter both weight and reps', 'error');
    return;
  }
  
  // Epley Formula
  const oneRM = weight * (1 + reps / 30);
  
  document.getElementById('oneRMResult').innerHTML = `
    <h3 style="margin-bottom: 12px; color: var(--text);">Estimated 1RM</h3>
    <p style="font-size: 36px; font-weight: 800; color: var(--primary);">${oneRM.toFixed(1)} kg</p>
  `;
}

function calculateWorkingWeights() {
  const oneRM = parseFloat(document.getElementById('workingOneRM')?.value);
  
  if (!oneRM) {
    showNotification('Please enter your 1RM', 'error');
    return;
  }
  
  const percentages = [95, 90, 85, 80, 75, 70, 65, 60];
  
  document.getElementById('workingWeightsResult').innerHTML = `
    <h3 style="margin-bottom: 16px; color: var(--text);">Working Weights</h3>
    ${percentages.map(pct => `
      <div class="weight-percentage">
        <span style="font-weight: 700;">${pct}%</span>
        <span style="font-weight: 700; color: var(--primary);">${(oneRM * pct / 100).toFixed(1)} kg</span>
      </div>
    `).join('')}
  `;
}

function calculateCalories() {
  const weight = parseFloat(document.getElementById('caloriesWeight')?.value);
  const duration = parseFloat(document.getElementById('caloriesDuration')?.value);
  const intensity = document.getElementById('caloriesIntensity')?.value;
  
  if (!weight || !duration) {
    showNotification('Please enter weight and duration', 'error');
    return;
  }
  
  const mets = { light: 3, moderate: 5, intense: 8 };
  const met = mets[intensity] || 5;
  
  const calories = (met * weight * duration) / 60;
  
  document.getElementById('caloriesResult').innerHTML = `
    <h3 style="margin-bottom: 12px; color: var(--text);">Estimated Calories Burned</h3>
    <p style="font-size: 36px; font-weight: 800; color: var(--primary);">${Math.round(calories)} kcal</p>
  `;
}

// ===== Utility Functions =====
function calculateTotalVolume() {
  return state.logs.reduce((total, log) => total + calculateWorkoutVolume(log), 0);
}

function calculateWorkoutVolume(log) {
  return log.exercises.reduce((volume, ex) => {
    return volume + ex.sets.reduce((setVolume, set) => {
      return setVolume + (set.reps * set.weight);
    }, 0);
  }, 0);
}

function calculateStreak() {
  if (state.logs.length === 0) return 0;
  
  const sortedLogs = state.logs.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let log of sortedLogs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === streak) {
      streak++;
    } else if (dayDiff > streak) {
      break;
    }
  }
  
  return streak;
}

function estimateCalories() {
  return state.logs.reduce((total, log) => {
    const duration = log.duration || 45;
    return total + Math.round(duration * 8); // Rough estimate
  }, 0);
}

function calculateAverageDuration() {
  if (state.logs.length === 0) return 0;
  const total = state.logs.reduce((sum, log) => sum + (log.duration || 0), 0);
  return Math.round(total / state.logs.length);
}

function calculateTotalExercises() {
  return state.logs.reduce((total, log) => total + log.exercises.length, 0);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== Export Data =====
function exportData(format) {
  if (format === 'csv') {
    exportCSV();
  } else if (format === 'json') {
    exportJSON();
  }
}

function exportCSV() {
  let csv = 'Date,Workout,Exercise,Sets,Reps,Weight,Volume\n';
  
  state.logs.forEach(log => {
    log.exercises.forEach(ex => {
      const exercise = state.exercises.find(e => e.id === ex.exerciseId);
      ex.sets.forEach(set => {
        csv += `${formatDate(log.date)},${log.name},${exercise?.name || 'Unknown'},1,${set.reps},${set.weight},${set.reps * set.weight}\n`;
      });
    });
  });
  
  downloadFile(csv, 'fitness-data.csv', 'text/csv');
  showNotification('Data exported as CSV!', 'success');
}

function exportJSON() {
  const data = JSON.stringify(state, null, 2);
  downloadFile(data, 'fitness-data.json', 'application/json');
  showNotification('Data exported as JSON!', 'success');
}

function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===== Local Storage =====
function saveToLocalStorage() {
  try {
    localStorage.setItem('fitnessTrackerData', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem('fitnessTrackerData');
    if (data) {
      const loaded = JSON.parse(data);
      Object.assign(state, loaded);
      
      // Ensure databases exist
      if (!state.exercises.length) state.exercises = getExerciseDatabase();
      if (!state.achievements.length) state.achievements = getAchievementsDatabase();
      if (!state.programs.length) state.programs = getWorkoutPrograms();
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
}

// ===== Notifications =====
function showNotification(message, type = 'info') {
  const container = document.getElementById('notifications');
  if (!container) return;
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.4s reverse';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// ===== Global Functions =====
window.addExerciseToWorkout = addExerciseToWorkout;
window.removeExerciseFromWorkout = removeExerciseFromWorkout;
window.updateWorkoutExercise = updateWorkoutExercise;
window.loadTemplate = loadTemplate;
window.addLogSet = addLogSet;
window.removeLogSet = removeLogSet;
window.updateLogSet = updateLogSet;
window.startProgram = startProgram;
