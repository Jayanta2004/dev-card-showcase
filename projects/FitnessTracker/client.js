// Fitness Progress Tracker client logic
const goalInput = document.getElementById('goalInput');
const addGoalBtn = document.getElementById('addGoalBtn');
const goalsList = document.getElementById('goalsList');
const workoutDate = document.getElementById('workoutDate');
const exerciseInput = document.getElementById('exerciseInput');
const repsInput = document.getElementById('repsInput');
const setsInput = document.getElementById('setsInput');
const logWorkoutBtn = document.getElementById('logWorkoutBtn');
const workoutTable = document.getElementById('workoutTable').querySelector('tbody');
const progressChart = document.getElementById('progressChart');

let goals = [];
let workouts = [];

addGoalBtn.addEventListener('click', () => {
    const goal = goalInput.value.trim();
    if (goal) {
        goals.push(goal);
        renderGoals();
        goalInput.value = '';
    }
});

function renderGoals() {
    goalsList.innerHTML = '';
    goals.forEach((g, i) => {
        const li = document.createElement('li');
        li.textContent = g;
        goalsList.appendChild(li);
    });
}

logWorkoutBtn.addEventListener('click', () => {
    const date = workoutDate.value;
    const exercise = exerciseInput.value.trim();
    const reps = repsInput.value;
    const sets = setsInput.value;
    if (date && exercise && reps && sets) {
        workouts.push({ date, exercise, reps: Number(reps), sets: Number(sets) });
        renderWorkouts();
        renderProgressChart();
        workoutDate.value = '';
        exerciseInput.value = '';
        repsInput.value = '';
        setsInput.value = '';
    }
});

function renderWorkouts() {
    workoutTable.innerHTML = '';
    workouts.forEach(w => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${w.date}</td><td>${w.exercise}</td><td>${w.reps}</td><td>${w.sets}</td>`;
        workoutTable.appendChild(tr);
    });
}

function renderProgressChart() {
    // Group by date, sum reps
    const dataByDate = {};
    workouts.forEach(w => {
        if (!dataByDate[w.date]) dataByDate[w.date] = 0;
        dataByDate[w.date] += w.reps * w.sets;
    });
    const labels = Object.keys(dataByDate);
    const data = Object.values(dataByDate);
    new Chart(progressChart, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Total Reps per Day',
                data,
                borderColor: '#4f8cff',
                backgroundColor: 'rgba(79,140,255,0.1)',
                fill: true
            }]
        },
        options: {
            plugins: { legend: { display: true } },
            scales: { x: { title: { display: true, text: 'Date' } }, y: { title: { display: true, text: 'Reps' } } }
        }
    });
}
