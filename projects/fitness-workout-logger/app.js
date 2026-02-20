// Fitness Workout Logger
// Uses Chart.js for progress visualization

const workoutForm = document.getElementById('workout-form');
const workoutListDiv = document.getElementById('workout-list');
const progressChartCanvas = document.getElementById('progress-chart');

let workouts = JSON.parse(localStorage.getItem('workouts') || '[]');

function saveWorkouts() {
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

function renderWorkouts() {
    workoutListDiv.innerHTML = '';
    workouts.slice().reverse().forEach(w => {
        const div = document.createElement('div');
        div.className = 'workout-entry';
        div.innerHTML = `
            <span class="workout-date">${w.date}</span>
            <span class="workout-type">${w.type}</span>
            <span class="workout-duration">${w.duration} min</span>
            ${w.notes ? `<span class="workout-notes">${w.notes}</span>` : ''}
        `;
        workoutListDiv.appendChild(div);
    });
}

function renderProgressChart() {
    if (window.progressChart) window.progressChart.destroy();
    // Group by date, sum durations
    const dateTotals = {};
    workouts.forEach(w => {
        dateTotals[w.date] = (dateTotals[w.date] || 0) + parseInt(w.duration);
    });
    const dates = Object.keys(dateTotals).sort();
    const totals = dates.map(d => dateTotals[d]);
    window.progressChart = new Chart(progressChartCanvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Duration (min)',
                data: totals,
                fill: true,
                borderColor: '#f76b1c',
                backgroundColor: 'rgba(247,107,28,0.12)',
                tension: 0.3
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { ticks: { color: '#f76b1c' } },
                y: { ticks: { color: '#c44536' } }
            }
        }
    });
}

workoutForm.addEventListener('submit', e => {
    e.preventDefault();
    const entry = {
        date: document.getElementById('date').value,
        type: document.getElementById('type').value.trim(),
        duration: parseInt(document.getElementById('duration').value),
        notes: document.getElementById('notes').value.trim()
    };
    workouts.push(entry);
    saveWorkouts();
    renderWorkouts();
    renderProgressChart();
    workoutForm.reset();
});

// Initial render
renderWorkouts();
renderProgressChart();
