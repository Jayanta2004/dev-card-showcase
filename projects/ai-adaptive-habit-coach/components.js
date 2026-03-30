// Modular UI components for Adaptive Habit Coach
function createHabitCard(habit, index, streak, lastCompleted, adaptiveMsg) {
  return `
    <div class="habit-card" data-index="${index}">
      <div class="habit-title">${habit}</div>
      <div class="habit-meta">
        <span>Streak: <b>${streak}</b></span>
        <span>Last: <b>${lastCompleted || 'Never'}</b></span>
      </div>
      <div class="adaptive-msg">${adaptiveMsg}</div>
      <button class="complete-btn">Mark Complete</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;
}
window.Components = { createHabitCard };
