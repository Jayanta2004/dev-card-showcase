// Habit Tracker with Streak Visualization - app.js
// Core logic for habits, streaks, badges, and chart

const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitList = document.getElementById('habit-list');
const streakChartCanvas = document.getElementById('streak-chart');
const badgesDiv = document.getElementById('badges');

let habits = [
  { name: 'Drink Water', streak: 3, history: ['2026-02-14','2026-02-15','2026-02-16'] },
  { name: 'Read 10 Pages', streak: 1, history: ['2026-02-16'] },
  { name: 'Exercise', streak: 2, history: ['2026-02-15','2026-02-16'] }
];
let streakChart = null;

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

function loadHabits() {
  const data = localStorage.getItem('habits');
  if (data) {
    habits = JSON.parse(data);
  }
}

function renderHabits() {
  habitList.innerHTML = '';
  if (habits.length === 0) {
    habitList.innerHTML = '<li>No habits yet. Add one!</li>';
    return;
  }
  habits.forEach((habit, idx) => {
    const li = document.createElement('li');
    li.className = 'habit-item';
    li.innerHTML = `
      <span class="habit-name">${habit.name}</span>
      <span class="streak">🔥 ${habit.streak}</span>
      <div class="actions">
        <button class="done-btn" data-idx="${idx}">Done Today</button>
        <button class="delete-btn" data-idx="${idx}">Delete</button>
      </div>
    `;
    habitList.appendChild(li);
  });
  document.querySelectorAll('.done-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      markHabitDone(idx);
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      deleteHabit(idx);
    });
  });
}

function markHabitDone(idx) {
  const today = new Date().toISOString().slice(0,10);
  if (!habits[idx].history.includes(today)) {
    habits[idx].history.push(today);
    // Check streak
    let streak = 1;
    let d = new Date(today);
    for (let i = habits[idx].history.length - 2; i >= 0; i--) {
      d.setDate(d.getDate() - 1);
      if (habits[idx].history[i] === d.toISOString().slice(0,10)) {
        streak++;
      } else {
        break;
      }
    }
    habits[idx].streak = streak;
    saveHabits();
    renderHabits();
    renderChart();
    renderBadges();
  }
}

function deleteHabit(idx) {
  if (confirm('Delete this habit?')) {
    habits.splice(idx, 1);
    saveHabits();
    renderHabits();
    renderChart();
    renderBadges();
  }
}

habitForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = habitInput.value.trim();
  if (name) {
    habits.push({ name, streak: 0, history: [] });
    saveHabits();
    renderHabits();
    renderChart();
    renderBadges();
    habitInput.value = '';
  }
});

function renderChart() {
  const labels = habits.map(h => h.name);
  const data = habits.map(h => h.streak);
  if (streakChart) streakChart.destroy();
  streakChart = new Chart(streakChartCanvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Current Streak',
        data,
        backgroundColor: '#4caf50'
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          stepSize: 1
        }
      }
    }
  });
}

function renderBadges() {
  badgesDiv.innerHTML = '';
  habits.forEach(habit => {
    if (habit.streak >= 7) {
      badgesDiv.innerHTML += `<span class="badge">7-Day Streak: ${habit.name}</span>`;
    }
    if (habit.streak >= 30) {
      badgesDiv.innerHTML += `<span class="badge">30-Day Streak: ${habit.name}</span>`;
    }
    if (habit.streak >= 100) {
      badgesDiv.innerHTML += `<span class="badge">100-Day Streak: ${habit.name}</span>`;
    }
  });
}

// Initial load
loadHabits();
renderHabits();
renderChart();
renderBadges();
