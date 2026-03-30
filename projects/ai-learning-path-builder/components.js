// Modular UI components for AI Learning Path Builder
function createPlanCard(day, steps, encouragement) {
  return `
    <div class="plan-card">
      <div class="plan-day">Day ${day}</div>
      <ul class="plan-steps">${steps.map(s => `<li>${s}</li>`).join('')}</ul>
      <div class="plan-encouragement">${encouragement}</div>
      <button class="mark-done-btn">Mark Done</button>
    </div>
  `;
}
window.Components = { createPlanCard };
