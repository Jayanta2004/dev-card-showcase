// Adaptive Habit Coach Frontend Logic
const { createHabitCard } = window.Components;

let habits = JSON.parse(localStorage.getItem('habits') || '[]');
let habitStats = JSON.parse(localStorage.getItem('habitStats') || '{}');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('habitForm');
  const dashboard = document.getElementById('dashboard');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const habit = document.getElementById('habit').value.trim();
    if (!habit) return;
    habits.push(habit);
    habitStats[habit] = { streak: 0, lastCompleted: null, adaptiveMsg: 'Let\'s get started!' };
    saveAndRender();
    form.reset();
  });

  dashboard.addEventListener('click', function (e) {
    const card = e.target.closest('.habit-card');
    if (!card) return;
    const idx = card.dataset.index;
    const habit = habits[idx];
    if (e.target.classList.contains('complete-btn')) {
      markComplete(habit);
    } else if (e.target.classList.contains('delete-btn')) {
      habits.splice(idx, 1);
      delete habitStats[habit];
      saveAndRender();
    }
  });

  renderDashboard();
});

function markComplete(habit) {
  const today = new Date().toLocaleDateString();
  const stats = habitStats[habit];
  if (stats.lastCompleted === today) {
    stats.adaptiveMsg = 'Already completed today!';
  } else {
    stats.streak = (stats.lastCompleted === yesterday()) ? stats.streak + 1 : 1;
    stats.lastCompleted = today;
    stats.adaptiveMsg = getAdaptiveMsg(stats.streak);
  }
  saveAndRender();
}

function getAdaptiveMsg(streak) {
  if (streak === 1) return 'Great start! Keep it up!';
  if (streak < 4) return 'Consistency is building!';
  if (streak < 7) return 'Awesome streak!';
  if (streak < 14) return 'You\'re on fire!';
  return 'Habit master!';
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString();
}

function saveAndRender() {
  localStorage.setItem('habits', JSON.stringify(habits));
  localStorage.setItem('habitStats', JSON.stringify(habitStats));
  renderDashboard();
}

function renderDashboard() {
  const dashboard = document.getElementById('dashboard');
  if (!habits.length) {
    dashboard.innerHTML = '<div style="text-align:center;color:#888;">No habits yet. Add one above!</div>';
    return;
  }
  dashboard.innerHTML = habits.map((habit, i) =>
    createHabitCard(habit, i, habitStats[habit]?.streak || 0, habitStats[habit]?.lastCompleted, habitStats[habit]?.adaptiveMsg || '')
  ).join('');
}
