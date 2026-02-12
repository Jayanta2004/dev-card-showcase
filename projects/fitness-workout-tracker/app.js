// Fitness Workout Tracker App
let workouts = JSON.parse(localStorage.getItem('workoutLogs') || '[]');
let routines = JSON.parse(localStorage.getItem('workoutRoutines') || '[]');

function saveAll() {
  localStorage.setItem('workoutLogs', JSON.stringify(workouts));
  localStorage.setItem('workoutRoutines', JSON.stringify(routines));
}

function renderLogWorkout() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Log Workout</h2>
    <form id="workout-form">
      <label>Date
        <input type="date" id="workout-date" value="${new Date().toISOString().slice(0,10)}" required>
      </label>
      <label>Type
        <input type="text" id="workout-type" placeholder="e.g. Cardio, Strength" required>
      </label>
      <label>Duration (min)
        <input type="number" id="workout-duration" min="1" required>
      </label>
      <label>Notes
        <textarea id="workout-notes" rows="2"></textarea>
      </label>
      <button class="action" type="submit">Log Workout</button>
    </form>
    <ul class="workout-list">
      ${workouts.length ? workouts.slice().reverse().map(w => `
        <li>
          <span><strong>${w.type}</strong> - ${w.duration} min</span>
          <span>${w.date}</span>
          <span>${w.notes ? w.notes : ''}</span>
        </li>
      `).join('') : '<li>No workouts logged yet.</li>'}
    </ul>
  `;
  document.getElementById('workout-form').onsubmit = function(e) {
    e.preventDefault();
    const date = document.getElementById('workout-date').value;
    const type = document.getElementById('workout-type').value;
    const duration = parseInt(document.getElementById('workout-duration').value);
    const notes = document.getElementById('workout-notes').value;
    workouts.push({ date, type, duration, notes });
    saveAll();
    renderLogWorkout();
  };
}

function renderRoutines() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Exercise Routines</h2>
    <form id="routine-form">
      <label>Routine Name
        <input type="text" id="routine-name" required>
      </label>
      <label>Exercises (comma separated)
        <input type="text" id="routine-exercises" required>
      </label>
      <button class="action" type="submit">Add Routine</button>
    </form>
    <ul class="routine-list">
      ${routines.length ? routines.map((r, idx) => `
        <li>
          <span><strong>${r.name}</strong></span>
          <span>Exercises: ${r.exercises.join(', ')}</span>
          <button class="action" onclick="editRoutine(${idx})">Edit</button>
        </li>
      `).join('') : '<li>No routines yet.</li>'}
    </ul>
  `;
  document.getElementById('routine-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('routine-name').value;
    const exercises = document.getElementById('routine-exercises').value.split(',').map(x => x.trim()).filter(x => x);
    routines.push({ name, exercises });
    saveAll();
    renderRoutines();
  };
}

function editRoutine(idx) {
  const r = routines[idx];
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Edit Routine</h2>
    <form id="edit-routine-form">
      <label>Routine Name
        <input type="text" id="edit-routine-name" value="${r.name}" required>
      </label>
      <label>Exercises (comma separated)
        <input type="text" id="edit-routine-exercises" value="${r.exercises.join(', ')}" required>
      </label>
      <button class="action" type="submit">Save</button>
      <button class="action" type="button" onclick="renderRoutines()">Cancel</button>
    </form>
  `;
  document.getElementById('edit-routine-form').onsubmit = function(e) {
    e.preventDefault();
    r.name = document.getElementById('edit-routine-name').value;
    r.exercises = document.getElementById('edit-routine-exercises').value.split(',').map(x => x.trim()).filter(x => x);
    saveAll();
    renderRoutines();
  };
}

function renderProgress() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Progress Visualization</h2>
    <div class="card">
      <canvas id="progressChart"></canvas>
    </div>
  `;
  setTimeout(drawProgressChart, 0);
}

function drawProgressChart() {
  const ctx = document.getElementById('progressChart').getContext('2d');
  const dates = workouts.map(w => w.date);
  const durations = workouts.map(w => w.duration);
  if (window.progressChartInstance) window.progressChartInstance.destroy();
  window.progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Workout Duration (min)',
        data: durations,
        borderColor: '#185a9d',
        backgroundColor: '#43cea2',
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Workout Progress Over Time' }
      }
    }
  });
}

function renderInsights() {
  const main = document.getElementById('main-content');
  const total = workouts.reduce((sum, w) => sum + w.duration, 0);
  const avg = workouts.length ? (total / workouts.length).toFixed(2) : 0;
  const mostCommon = workouts.length ? getMostCommonType() : 'N/A';
  main.innerHTML = `
    <h2 class="section-title">Personalized Fitness Insights</h2>
    <div class="card">
      <p>Total Workouts: <strong>${workouts.length}</strong></p>
      <p>Total Duration: <strong>${total} min</strong></p>
      <p>Average Duration: <strong>${avg} min</strong></p>
      <p>Most Common Workout Type: <strong>${mostCommon}</strong></p>
    </div>
  `;
}

function getMostCommonType() {
  const types = {};
  workouts.forEach(w => {
    types[w.type] = (types[w.type] || 0) + 1;
  });
  return Object.entries(types).sort((a,b) => b[1]-a[1])[0][0];
}

document.getElementById('nav-log').onclick = renderLogWorkout;
document.getElementById('nav-routines').onclick = renderRoutines;
document.getElementById('nav-progress').onclick = renderProgress;
document.getElementById('nav-insights').onclick = renderInsights;

// Initial load
renderLogWorkout();
