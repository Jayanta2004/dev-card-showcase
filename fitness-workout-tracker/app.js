// Fitness & Workout Tracker
// UI navigation
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
navBtns.forEach(btn => {
    btn.onclick = () => {
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(btn.dataset.section).classList.add('active');
    };
});

// Exercise Database (sample, expand as needed)
const exercises = [
    { name: 'Push-Up', muscle: 'chest', equipment: 'bodyweight', instructions: 'Keep your body straight, lower to the ground, push back up.' },
    { name: 'Squat', muscle: 'legs', equipment: 'bodyweight', instructions: 'Stand with feet shoulder-width, lower hips, return up.' },
    { name: 'Deadlift', muscle: 'back', equipment: 'barbell', instructions: 'Lift barbell from ground, keep back straight.' },
    { name: 'Bicep Curl', muscle: 'arms', equipment: 'dumbbell', instructions: 'Curl dumbbell up, lower slowly.' },
    { name: 'Plank', muscle: 'core', equipment: 'bodyweight', instructions: 'Hold body straight, elbows under shoulders.' },
    { name: 'Shoulder Press', muscle: 'shoulders', equipment: 'dumbbell', instructions: 'Press dumbbells overhead, lower slowly.' }
    // ...add more
];

function renderExerciseList(filter = 'all', search = '') {
    const list = document.getElementById('exercise-list');
    list.innerHTML = '';
    exercises.filter(ex => (filter === 'all' || ex.muscle === filter) && ex.name.toLowerCase().includes(search.toLowerCase()))
        .forEach(ex => {
            const div = document.createElement('div');
            div.className = 'exercise';
            div.innerHTML = `<b>${ex.name}</b> <small>(${ex.muscle}, ${ex.equipment})</small><br><em>${ex.instructions}</em>`;
            list.appendChild(div);
        });
}
document.getElementById('bodypart-filter').onchange = function() {
    renderExerciseList(this.value, document.getElementById('exercise-search').value);
};
document.getElementById('exercise-search').oninput = function() {
    renderExerciseList(document.getElementById('bodypart-filter').value, this.value);
};
renderExerciseList();

// Workout Builder
const builderControls = document.getElementById('builder-controls');
const workoutPreview = document.getElementById('workout-preview');
let currentWorkout = [];
exercises.forEach(ex => {
    const div = document.createElement('div');
    div.innerHTML = `<input type="checkbox" value="${ex.name}"> ${ex.name}`;
    builderControls.appendChild(div);
});
builderControls.innerHTML += '<br>Sets: <input type="number" id="builder-sets" min="1" value="3"> Reps: <input type="number" id="builder-reps" min="1" value="10"> Rest (sec): <input type="number" id="builder-rest" min="10" value="60">';
document.getElementById('save-workout-btn').onclick = function() {
    const selected = Array.from(builderControls.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);
    const sets = document.getElementById('builder-sets').value;
    const reps = document.getElementById('builder-reps').value;
    const rest = document.getElementById('builder-rest').value;
    currentWorkout = { exercises: selected, sets, reps, rest };
    workoutPreview.innerHTML = `<b>Workout:</b> ${selected.join(', ')}<br>Sets: ${sets}, Reps: ${reps}, Rest: ${rest}s`;
    saveTemplate(currentWorkout);
};

// Workout Programs (sample)
const programs = [
    { name: 'Beginner Strength', schedule: '3x/week', details: 'Full body, progressive overload.' },
    { name: 'HIIT', schedule: '2x/week', details: 'High intensity intervals.' },
    { name: 'Yoga', schedule: 'Daily', details: 'Flexibility and mindfulness.' },
    { name: 'Bodyweight', schedule: '4x/week', details: 'No equipment needed.' }
];
const programList = document.getElementById('program-list');
programs.forEach(p => {
    const div = document.createElement('div');
    div.innerHTML = `<b>${p.name}</b> <small>${p.schedule}</small><br><em>${p.details}</em>`;
    programList.appendChild(div);
});

// Exercise Logging
const logControls = document.getElementById('log-controls');
const logHistory = document.getElementById('log-history');
logControls.innerHTML = 'Exercise: <select id="log-exercise"></select> Weight: <input type="number" id="log-weight"> Reps: <input type="number" id="log-reps"> Duration (min): <input type="number" id="log-duration"> <button id="log-btn">Log Exercise</button>';
exercises.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex.name;
    opt.textContent = ex.name;
    document.getElementById('log-exercise').appendChild(opt);
});
let logs = JSON.parse(localStorage.getItem('logs') || '[]');
function renderLogHistory() {
    logHistory.innerHTML = '';
    logs.forEach(l => {
        const div = document.createElement('div');
        div.innerHTML = `${l.date}: <b>${l.exercise}</b> - ${l.weight}kg x ${l.reps} reps (${l.duration} min)`;
        logHistory.appendChild(div);
    });
}
document.getElementById('log-btn').onclick = function() {
    const exercise = document.getElementById('log-exercise').value;
    const weight = document.getElementById('log-weight').value;
    const reps = document.getElementById('log-reps').value;
    const duration = document.getElementById('log-duration').value;
    const date = new Date().toLocaleDateString();
    logs.push({ exercise, weight, reps, duration, date });
    localStorage.setItem('logs', JSON.stringify(logs));
    renderLogHistory();
};
renderLogHistory();

// Progress Tracking
const bodyMeasurements = document.getElementById('body-measurements');
const progressPhotos = document.getElementById('progress-photos');
let measurements = JSON.parse(localStorage.getItem('measurements') || '{}');
bodyMeasurements.innerHTML = 'Weight (kg): <input type="number" id="weight-measure"> Body Fat (%): <input type="number" id="fat-measure"> Chest (cm): <input type="number" id="chest-measure"> Waist (cm): <input type="number" id="waist-measure"> <button id="save-measure-btn">Save Measurements</button>';
document.getElementById('save-measure-btn').onclick = function() {
    measurements = {
        weight: document.getElementById('weight-measure').value,
        fat: document.getElementById('fat-measure').value,
        chest: document.getElementById('chest-measure').value,
        waist: document.getElementById('waist-measure').value
    };
    localStorage.setItem('measurements', JSON.stringify(measurements));
};
progressPhotos.innerHTML = '<b>Progress Photos:</b><br>';
let photos = JSON.parse(localStorage.getItem('photos') || '[]');
document.getElementById('photo-upload').onchange = function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photos.push(e.target.result);
            localStorage.setItem('photos', JSON.stringify(photos));
            renderPhotos();
        };
        reader.readAsDataURL(file);
    }
};
function renderPhotos() {
    progressPhotos.innerHTML = '<b>Progress Photos:</b><br>';
    photos.forEach((src, idx) => {
        progressPhotos.innerHTML += `<img src="${src}" style="max-width:120px;border-radius:8px;margin:4px;">`;
    });
}
renderPhotos();

// Calendar View
const calendarView = document.getElementById('calendar-view');
function renderCalendar() {
    calendarView.innerHTML = '';
    let days = {};
    logs.forEach(l => {
        days[l.date] = days[l.date] || [];
        days[l.date].push(l.exercise);
    });
    Object.keys(days).forEach(date => {
        const div = document.createElement('div');
        div.innerHTML = `<b>${date}</b>: ${days[date].join(', ')}`;
        calendarView.appendChild(div);
    });
}
renderCalendar();

// Workout Templates
const templateList = document.getElementById('template-list');
let templates = JSON.parse(localStorage.getItem('templates') || '[]');
function saveTemplate(workout) {
    templates.push(workout);
    localStorage.setItem('templates', JSON.stringify(templates));
    renderTemplates();
}
function renderTemplates() {
    templateList.innerHTML = '';
    templates.forEach((t, idx) => {
        templateList.innerHTML += `<div><b>Workout ${idx+1}</b>: ${t.exercises.join(', ')} Sets: ${t.sets} Reps: ${t.reps} Rest: ${t.rest}s</div>`;
    });
}
renderTemplates();

// Achievement Badges
const badgeList = document.getElementById('badge-list');
function renderBadges() {
    badgeList.innerHTML = '';
    const workoutCount = logs.length;
    const streak = Math.max(...Object.values(logs.reduce((acc, l) => { acc[l.date] = (acc[l.date]||0)+1; return acc; }, {})));
    const volume = logs.reduce((sum, l) => sum + (parseInt(l.weight)||0)*(parseInt(l.reps)||0), 0);
    if (workoutCount >= 10) badgeList.innerHTML += '<span>🏅 10 Workouts</span> ';
    if (workoutCount >= 50) badgeList.innerHTML += '<span>🥈 50 Workouts</span> ';
    if (streak >= 100) badgeList.innerHTML += '<span>🏆 100+ Days Streak</span> ';
    if (volume >= 1000) badgeList.innerHTML += '<span>💪 1000 lbs lifted</span> ';
}
renderBadges();

// Statistics Dashboard
const stats = document.getElementById('stats');
stats.innerHTML = `<b>Total Workouts:</b> ${logs.length}<br><b>Volume Lifted:</b> ${logs.reduce((sum, l) => sum + (parseInt(l.weight)||0)*(parseInt(l.reps)||0), 0)} kg<br><b>Calories Burned:</b> ${logs.length*200} (estimate)`;

// Progress Chart (simple)
const progressChart = document.getElementById('progress-chart');
if (progressChart) {
    const ctx = progressChart.getContext('2d');
    ctx.clearRect(0,0,600,300);
    ctx.fillStyle = '#43c6ac';
    logs.forEach((l, idx) => {
        ctx.fillRect(idx*10, 300-(parseInt(l.weight)||0), 8, parseInt(l.weight)||0);
    });
}

// Rest Timer
const timerDisplay = document.getElementById('timer-display');
let timerInterval = null;
document.getElementById('start-timer-btn').onclick = function() {
    let seconds = parseInt(document.getElementById('timer-seconds').value);
    clearInterval(timerInterval);
    timerDisplay.textContent = formatTime(seconds);
    timerInterval = setInterval(() => {
        seconds--;
        timerDisplay.textContent = formatTime(seconds);
        if (seconds <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = 'Done!';
            new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_10b7e6c7c7.mp3').play();
        }
    }, 1000);
};
function formatTime(sec) {
    const m = Math.floor(sec/60);
    const s = sec%60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// 1RM Calculator
const calc1rmBtn = document.getElementById('calc-1rm-btn');
calc1rmBtn.onclick = function() {
    const weight = parseFloat(document.getElementById('weight-input').value);
    const reps = parseInt(document.getElementById('reps-input').value);
    if (!weight || !reps) {
        document.getElementById('1rm-result').textContent = 'Enter weight and reps.';
        return;
    }
    const oneRM = Math.round(weight * (1 + reps/30));
    document.getElementById('1rm-result').textContent = `Estimated 1RM: ${oneRM} kg`;
};

// Export Data
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
exportCsvBtn.onclick = function() {
    let csv = 'Exercise,Weight,Reps,Duration,Date\n';
    logs.forEach(l => {
        csv += `${l.exercise},${l.weight},${l.reps},${l.duration},${l.date}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'workout-log.csv';
    link.click();
};
exportJsonBtn.onclick = function() {
    const json = JSON.stringify({ logs, measurements, templates, photos }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'workout-data.json';
    link.click();
};